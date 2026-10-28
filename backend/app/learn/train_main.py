# backend/learn/train_main.py

from .run_config import run_config
from .utils_dataset import detect_classes, compute_class_distribution
import json
from pathlib import Path


def run_training_job(
    job_id,
    dataset_path,
    output_dir,
    params,
    update_callback,
):
    """
    Entry point training (classification)
    """

    # =====================================================
    # AUTO DETECT CLASSES
    # =====================================================
    classes, class_to_idx, idx_to_class = detect_classes(dataset_path)
    num_classes = len(classes)

    # =====================================================
    # IMBALANCE WARNING
    # =====================================================
    class_dist = compute_class_distribution(dataset_path)

    min_count = min(class_dist.values())
    max_count = max(class_dist.values())
    imbalance_ratio = max_count / max(min_count, 1)

    if imbalance_ratio > 5:
        update_callback(
            f"[WARNING] Dataset imbalance detected (ratio={imbalance_ratio:.2f})"
        )
        update_callback(str(class_dist))

    # =====================================================
    # INJECT INTO CONFIG
    # =====================================================
    params = params.copy()
    params.update({
        "num_classes": num_classes,
        "class_to_idx": class_to_idx,
        "idx_to_class": idx_to_class,
        "class_distribution": class_dist,
        "imbalance_ratio": imbalance_ratio,
    })

    # =====================================================
    # RUN TRAINING
    # =====================================================
    result = run_config(
        run_id=job_id,
        dataset_dir=dataset_path,
        output_dir=output_dir,
        cfg=params,
        update_callback=update_callback
    )

    # =====================================================
    # NORMALISASI RESULT (🔥 INI KUNCI)
    # =====================================================
    if not result:
        raise RuntimeError("run_config() tidak mengembalikan hasil")

    # ambil model path
    model_path = result.get("model_path")
    if not model_path:
        raise RuntimeError("model_path tidak ditemukan dari hasil training")

    # ambil metrics (jika ada)
    metrics = result.get("metrics", {})

    best_train_loss = metrics.get("best_train_loss")
    best_val_loss = metrics.get("best_val_loss")

    # fallback (biar sistem tetap jalan)
    if best_train_loss is None:
        best_train_loss = result.get("train_loss")

    if best_val_loss is None:
        best_val_loss = result.get("val_loss")

    # =====================================================
    # SAFE FALLBACK (JANGAN HENTIKAN TRAINING)
    # =====================================================
    if best_train_loss is None:
        #print("[WARNING] best_train_loss None → fallback 0.0")
        best_train_loss = 0.0

    if best_val_loss is None:
        #print("[WARNING] best_val_loss None → fallback 0.0")
        best_val_loss = 0.0

    # =====================================================
    # SAVE CLASS MAPPING
    # =====================================================
    #run_dir = Path(output_dir) / f"run_{job_id}"
    #run_dir.mkdir(parents=True, exist_ok=True)

    #mapping = {
    #    "classes": classes,
    #    "class_to_idx": class_to_idx,
    #    "idx_to_class": idx_to_class,
    #}

    #with open(run_dir / "class_mapping.json", "w") as f:
    #    json.dump(mapping, f, indent=2)

    def _safe_float(v, fallback=None):
        try:
            return float(v)
        except (TypeError, ValueError):
            return fallback


    return {
        "model_path": model_path,
        "metrics": {
            # ======================
            # LOSS (SAFE)
            # ======================
            "best_train_loss": _safe_float(
                metrics.get("best_train_loss"),
                _safe_float(best_train_loss, 0.0)
            ),
            "best_val_loss": _safe_float(
                metrics.get("best_val_loss"),
                _safe_float(best_val_loss, 0.0)
            ),

            # ======================
            # CLASSIFICATION METRICS
            # ======================
            "accuracy": _safe_float(metrics.get("accuracy")),
            "precision": _safe_float(metrics.get("precision")),
            "recall": _safe_float(metrics.get("recall")),
            "f1": _safe_float(metrics.get("f1")),
        }
    }

    


