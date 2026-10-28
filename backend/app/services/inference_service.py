# backend/app/services/inference_service.py

import torch
from pathlib import Path
from PIL import Image
import numpy as np
import json

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.models_database import Model
from ..learn.model_classifier import ModelClassifier
from ..utils.file_utils import to_absolute_app_path


# ============================================================
# GET ACTIVE MODEL OR FALLBACK TO LATEST
# ============================================================
def get_active_model_record(db: Session) -> Model:

    active = (
        db.query(Model)
        .filter(Model.is_active == True)
        .order_by(Model.created_at.desc())
        .first()
    )

    if active:
        return active

    latest = db.query(Model).order_by(Model.created_at.desc()).first()

    if not latest:
        raise HTTPException(404, "No model found in database")

    return latest


# ============================================================
# LOAD CLASS MAPPING ONLY
# ============================================================
def get_class_mapping_from_model_path(model_path: str) -> list[str]:

    resolved_path = to_absolute_app_path(model_path)

    if resolved_path.is_file():
        model_dir = resolved_path.parent
    else:
        model_dir = resolved_path

    mapping_file = model_dir / "class_mapping.json"

    if not mapping_file.exists():
        raise HTTPException(
            500,
            f"class_mapping.json not found in {model_dir}"
        )

    with open(mapping_file, "r") as f:
        mapping = json.load(f)

    idx_to_class = mapping.get("idx_to_class")

    if not isinstance(idx_to_class, dict):
        raise HTTPException(500, "Invalid class_mapping.json format")

    return [
        idx_to_class[str(i)]
        for i in sorted(map(int, idx_to_class.keys()))
    ]


def get_class_mapping_from_active_model(db: Session) -> list[str]:

    model = get_active_model_record(db)

    return get_class_mapping_from_model_path(model.path)


# ============================================================
# LOAD MODEL + CLASS MAPPING
# ============================================================
def load_model_from_path(model_dir, device):

    model_dir = Path(model_dir)

    model_file = model_dir / "model.pth"
    mapping_file = model_dir / "class_mapping.json"
    artifact_file = model_dir / "training_artifact.json"

    if not model_file.exists():
        raise RuntimeError(f"Model file not found: {model_file}")

    if not mapping_file.exists():
        raise RuntimeError(f"class_mapping.json not found: {mapping_file}")

    # =====================================================
    # LOAD CLASS MAPPING
    # =====================================================
    with open(mapping_file) as f:
        mapping = json.load(f)

    idx_to_class = {
        int(k): v for k, v in mapping["idx_to_class"].items()
    }

    num_classes = len(idx_to_class)

    # =====================================================
    # LOAD CHECKPOINT
    # =====================================================
    #checkpoint = torch.load(model_file, map_location=device)
    checkpoint = torch.load(
        model_file,
        map_location=device,
        weights_only=False
    )
    # =====================================================
    # DETECT ARCHITECTURE
    # =====================================================
    architecture = None

    if isinstance(checkpoint, dict):
        architecture = checkpoint.get("architecture")

    if not architecture and artifact_file.exists():
        with open(artifact_file) as f:
            artifact = json.load(f)

        architecture = artifact.get("training", {}).get("architecture")

    if not architecture:
        raise RuntimeError("Architecture not found in checkpoint or artifact")

    print(f"[MODEL LOAD] architecture = {architecture}")

    # =====================================================
    # BUILD MODEL
    # =====================================================
    model = ModelClassifier(
        num_classes=num_classes,
        architecture=architecture
    )

    # =====================================================
    # GET STATE DICT
    # =====================================================
    if isinstance(checkpoint, dict):

        if "model_state_dict" in checkpoint:
            state_dict = checkpoint["model_state_dict"]

        elif "state_dict" in checkpoint:
            state_dict = checkpoint["state_dict"]

        else:
            state_dict = checkpoint

    else:
        state_dict = checkpoint


    # =====================================================
    # FIX DATAPARALLEL PREFIX
    # =====================================================
    if any(k.startswith("module.") for k in state_dict.keys()):
        print("[MODEL LOAD] Removing DataParallel prefix")

        state_dict = {
            k.replace("module.", ""): v
            for k, v in state_dict.items()
        }
    # =====================================================
    # LOAD WEIGHTS
    # =====================================================
    print("state_dict keys example:", list(state_dict.keys())[:5])
    
    missing, unexpected = model.load_state_dict(
        state_dict,
        strict=False
    )

    if missing:
        print("[MODEL LOAD] Missing keys:", missing)

    if unexpected:
        print("[MODEL LOAD] Unexpected keys:", unexpected)
        
    model.to(device)
    model.eval()

    print("[MODEL LOAD] success")

    return model, idx_to_class

# ============================================================
# PREPROCESS IMAGE
# ============================================================
def preprocess_image(image_path: str, img_size=(224, 224)):

    img = Image.open(image_path).convert("RGB")
    img = img.resize(img_size)

    arr = np.array(img).astype("float32") / 255.0

    mean = np.array([0.485, 0.456, 0.406])
    std = np.array([0.229, 0.224, 0.225])

    arr = (arr - mean) / std

    arr = arr.transpose(2, 0, 1)

    tensor = torch.from_numpy(arr).unsqueeze(0)

    return tensor, img


# ============================================================
# SINGLE IMAGE CLASSIFICATION
# ============================================================
from ..config import settings


# ============================================================
# SINGLE IMAGE CLASSIFICATION
# ============================================================
def predict_single(model, tensor_image, device, idx_to_class):

    # =====================================================
    # MOVE TO DEVICE
    # =====================================================
    tensor_image = tensor_image.to(device)
    tensor_image = tensor_image.float()

    with torch.no_grad():

        outputs = model(tensor_image)

        if isinstance(outputs, tuple):
            outputs = outputs[0]

        probs = torch.softmax(outputs, dim=1)[0]

    # =====================================================
    # TOP-K PROBABILITIES
    # =====================================================
    top_k = 5

    top_probs, top_indices = torch.topk(
        probs,
        k=min(top_k, len(probs))
    )

    prob_dict = {
        idx_to_class[int(i)]: float(p)
        for p, i in zip(top_probs.tolist(), top_indices.tolist())
    }

    # =====================================================
    # BEST PREDICTION
    # =====================================================
    pred_idx = probs.argmax().item()
    confidence = float(probs[pred_idx].item())

    predicted_label = idx_to_class[pred_idx]

    # =====================================================
    # CONFIDENCE THRESHOLD
    # =====================================================
    if confidence < settings.PREDICT_THRESHOLD:
        predicted_label = "unknown"

    return predicted_label, confidence, prob_dict