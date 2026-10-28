import os
import copy
import json
import random
import torch
import base64
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

from datetime import datetime
from pathlib import Path
from io import BytesIO
from PIL import Image
from torch.utils.data import DataLoader

from mealpy import FloatVar, PSO

from .dataset import build_datasets
from .model_classifier import ModelClassifier
from .trainer_epoch import train_one_epoch
from .evaluator import evaluate
from .devices import auto_device
from .metrics import (
    accuracy,
    precision_recall_f1,
    confusion_matrix,
)


# =====================================================
# UTIL
# =====================================================
def image_to_base64(img_tensor):

    import torch

    mean = torch.tensor([0.485, 0.456, 0.406]).view(3,1,1)
    std = torch.tensor([0.229, 0.224, 0.225]).view(3,1,1)

    img_tensor = img_tensor * std + mean
    img_tensor = torch.clamp(img_tensor, 0, 1)

    img = (img_tensor * 255).byte().permute(1,2,0).cpu().numpy()

    pil = Image.fromarray(img)

    buf = BytesIO()
    pil.save(buf, format="JPEG")

    return base64.b64encode(buf.getvalue()).decode()


# =====================================================
# INTERNAL: short training for PSO evaluation
# =====================================================
def _run_short_training(dataset_dir, cfg, device):

    train_ds, val_ds, class_names = build_datasets(
        dataset_dir,
        img_size=cfg["img_size"],
        val_split=cfg["val_split"]
    )

    num_classes = len(class_names)

    train_loader = DataLoader(
        train_ds,
        batch_size=cfg["batch_size"],
        shuffle=True,
        num_workers=2,
        pin_memory=True
    )

    val_loader = DataLoader(
        val_ds,
        batch_size=cfg["batch_size"],
        shuffle=False,
        num_workers=2,
        pin_memory=True
    )

    model = ModelClassifier(
        num_classes=num_classes,
        architecture=cfg.get("architecture", "resnet18")
    ).to(device)

    optimizer = build_optimizer(model, cfg)

    for _ in range(min(cfg.get("pso_epochs", 2), 2)):

        train_one_epoch(
            model=model,
            loader=train_loader,
            optimizer=optimizer,
            device=device,
            num_classes=num_classes,
            loss_fn=cfg["loss_function"],
        )

    val_metrics = evaluate(
        model=model,
        loader=val_loader,
        device=device,
        num_classes=num_classes
    )

    return val_metrics["accuracy"]


# =====================================================
# OPTIMIZER
# =====================================================
def build_optimizer(model, cfg):

    opt = cfg.get("optimizer", "adam").lower()
    lr = cfg.get("learning_rate", 1e-4)

    if opt == "adam":
        return torch.optim.Adam(model.parameters(), lr=lr)

    if opt == "sgd":
        return torch.optim.SGD(model.parameters(), lr=lr, momentum=0.9)

    if opt == "rmsprop":
        return torch.optim.RMSprop(model.parameters(), lr=lr)

    if opt == "adamw":
        return torch.optim.AdamW(model.parameters(), lr=lr)

    return torch.optim.Adam(model.parameters(), lr=lr)


# =====================================================
# MAIN ENTRY POINT
# =====================================================
def run_config(run_id, dataset_dir, output_dir, cfg, update_callback):

    device = auto_device()
    update_callback(f"Using device: {device}")


    # =====================================================
    # OPTIONAL PSO
    # =====================================================
    if cfg.get("use_pso", False):

        update_callback("🔍 PSO enabled")

        base_cfg = copy.deepcopy(cfg)

        def objective(solution):

            lr = float(solution[0])
            trial_cfg = copy.deepcopy(base_cfg)
            trial_cfg["learning_rate"] = lr

            acc = _run_short_training(dataset_dir, trial_cfg, device)

            return 1.0 - acc


        bounds = FloatVar(
            lb=(cfg.get("pso_lr_bounds", (1e-5, 1e-3))[0],),
            ub=(cfg.get("pso_lr_bounds", (1e-5, 1e-3))[1],),
            name="learning_rate",
        )

        pso = PSO.OriginalPSO(
            epoch=cfg.get("pso_iters", 10),
            pop_size=cfg.get("pso_population", 5),
        )

        best = pso.solve({
            "bounds": bounds,
            "obj_func": objective,
            "minmax": "min",
        })

        cfg["learning_rate"] = float(best.solution[0])

        update_callback(f"✓ PSO best lr = {cfg['learning_rate']:.6f}")


    # =====================================================
    # DATASET
    # =====================================================
    train_ds, val_ds, class_names = build_datasets(
        dataset_dir,
        img_size=cfg["img_size"],
        val_split=cfg["val_split"]
    )

    num_classes = len(class_names)

    update_callback(f"Detected {num_classes} classes: {class_names}")

    train_loader = DataLoader(
        train_ds,
        batch_size=cfg["batch_size"],
        shuffle=True
    )

    val_loader = DataLoader(
        val_ds,
        batch_size=cfg["batch_size"],
        shuffle=False
    )

    # =====================================================
    # MODEL
    # =====================================================
    architecture = cfg.get("architecture")

    if not architecture:
        raise ValueError("Architecture not provided")

    print("=== TRAIN MODEL DEBUG ===")
    print("architecture:", architecture)
    print("num_classes:", num_classes)

    model = ModelClassifier(
        num_classes=num_classes,
        architecture=architecture
    ).to(device)

    optimizer = build_optimizer(model, cfg)


    # =====================================================
    # RUN DIRECTORY
    # =====================================================
    run_dir = Path(output_dir) / f"run_{run_id}"
    run_dir.mkdir(parents=True, exist_ok=True)

    best_model_path = run_dir / "model.pth"


    # =====================================================
    # SAVE CLASS MAPPING
    # =====================================================
    class_mapping = {
        "class_names": class_names,
        "class_to_idx": {name: i for i, name in enumerate(class_names)},
        "idx_to_class": {i: name for i, name in enumerate(class_names)},
    }

    with open(run_dir / "class_mapping.json", "w") as f:
        json.dump(class_mapping, f, indent=2)


    # =====================================================
    # TRAINING HISTORY
    # =====================================================
    history = {
        "epoch": [],
        "train_loss": [],
        "val_loss": [],
        "train_acc": [],
        "val_acc": []
    }

    best_val_acc = 0.0
    best_epoch_state = None

    update_callback("🚀 Starting training")


    # =====================================================
    # TRAIN LOOP
    # =====================================================
    for epoch in range(1, cfg["epochs"] + 1):

        train_metrics = train_one_epoch(
            model=model,
            loader=train_loader,
            optimizer=optimizer,
            device=device,
            num_classes=num_classes,
            loss_fn=cfg["loss_function"],
        )

        val_metrics = evaluate(
            model=model,
            loader=val_loader,
            device=device,
            num_classes=num_classes
        )

        history["epoch"].append(epoch)
        history["train_loss"].append(float(train_metrics["loss"]))
        history["val_loss"].append(float(val_metrics.get("loss") or 0.0))
        history["train_acc"].append(float(train_metrics["accuracy"]))
        history["val_acc"].append(float(val_metrics["accuracy"]))

        update_callback(
            f"[Epoch {epoch}/{cfg['epochs']}] "
            f"train_loss={train_metrics['loss']:.4f} "
            f"train_acc={train_metrics['accuracy']:.4f} | "
            f"val_acc={val_metrics['accuracy']:.4f} "
            f"val_f1={val_metrics['f1']:.4f}"
        )

        if val_metrics["accuracy"] > best_val_acc:

            best_val_acc = val_metrics["accuracy"]

            best_epoch_state = {
                "model": copy.deepcopy(model.state_dict()),
                "val_outputs": val_metrics,
                "train_loss": train_metrics["loss"],
                "val_loss": val_metrics.get("loss"),
            }

            torch.save({
                "architecture": cfg.get("architecture"),
                "num_classes": num_classes,
                "model_state_dict": model.state_dict()
            }, best_model_path)

            update_callback("✓ New best model saved")


    if best_epoch_state is None:

        best_epoch_state = {
            "model": model.state_dict(),
            "train_loss": train_metrics["loss"],
            "val_loss": val_metrics.get("loss"),
            "val_outputs": val_metrics,
        }


    # =====================================================
    # POST TRAINING EVALUATION
    # =====================================================
    model.load_state_dict(best_epoch_state["model"])
    model.eval()

    all_preds = []
    all_targets = []
    all_images = []
    all_conf = []

    with torch.no_grad():

        for imgs, labels in val_loader:

            imgs = imgs.to(device)
            labels = labels.to(device)

            logits = model(imgs)

            probs = torch.softmax(logits, dim=1)
            preds = probs.argmax(dim=1)
            conf = probs.max(dim=1).values

            all_preds.append(preds.cpu())
            all_targets.append(labels.cpu())
            all_conf.append(conf.cpu())
            all_images.append(imgs.cpu())


    preds = torch.cat(all_preds)
    targets = torch.cat(all_targets)
    confs = torch.cat(all_conf)
    images = torch.cat(all_images)


    # =====================================================
    # METRICS
    # =====================================================
    acc = accuracy(preds, targets)
    prf = precision_recall_f1(preds, targets, num_classes)
    cm = confusion_matrix(preds, targets, num_classes)

    metrics_out = {
        "accuracy": float(acc),
        "precision": float(prf["precision"]),
        "recall": float(prf["recall"]),
        "f1": float(prf["f1"]),
        "best_train_loss": float(best_epoch_state["train_loss"] or 0.0),
        "best_val_loss": float(best_epoch_state["val_loss"] or 0.0),
    }


    with open(run_dir / "metrics.json", "w") as f:
        json.dump(metrics_out, f, indent=2)

    with open(run_dir / "metrics_history.json", "w") as f:
        json.dump(history, f, indent=2)


    # =====================================================
    # TRAINING ARTIFACT JSON
    # =====================================================
    artifact = {

        "run_id": run_id,

        "dataset": {
            "path": dataset_dir,
            "num_classes": num_classes,
            "class_names": class_names,
            "class_distribution": cfg.get("class_distribution"),
            "imbalance_ratio": cfg.get("imbalance_ratio")
        },

        "training": {
            "architecture": cfg.get("architecture"),
            "epochs": cfg.get("epochs"),
            "batch_size": cfg.get("batch_size"),
            "learning_rate": cfg.get("learning_rate"),
            "optimizer": cfg.get("optimizer"),
            "loss_function": cfg.get("loss_function"),
            "val_split": cfg.get("val_split"),
            "device": str(device),
            "use_pso": cfg.get("use_pso", False)
        },

        "metrics": metrics_out,

        "model": {
            "file": "model.pth",
            "class_mapping": "class_mapping.json"
        },

        "trained_at": datetime.utcnow().isoformat()
    }

    with open(run_dir / "training_artifact.json", "w") as f:
        json.dump(artifact, f, indent=2)


    # =====================================================
    # CONFUSION MATRIX
    # =====================================================
    plt.figure(figsize=(8,6))
    plt.imshow(cm, cmap="Blues")
    plt.title("Confusion Matrix")
    plt.xlabel("Predicted")
    plt.ylabel("True")
    plt.colorbar()

    for i in range(num_classes):
        for j in range(num_classes):
            plt.text(j, i, cm[i,j], ha="center", va="center")

    plt.tight_layout()
    plt.savefig(run_dir / "confusion_matrix.png")
    plt.close()


    # =====================================================
    # VALIDATION SAMPLE PREVIEW
    # =====================================================
    indices = list(range(len(images)))
    random.shuffle(indices)

    samples = []

    for i in indices[:6]:

        samples.append({
            "image_base64": image_to_base64(images[i]),
            "true_label": class_names[targets[i].item()],
            "predicted_label": class_names[preds[i].item()],
            "confidence": float(confs[i]),
        })

    with open(run_dir / "preview_samples.json", "w") as f:
        json.dump(samples, f, indent=2)


    # =====================================================
    # RETURN
    # =====================================================
    return {
        "model_path": str(run_dir),
        "metrics": metrics_out,
        "num_classes": num_classes,
        "class_names": class_names,
        "used_pso": cfg.get("use_pso", False),
        "best_lr": cfg["learning_rate"] if cfg.get("use_pso") else None
    }