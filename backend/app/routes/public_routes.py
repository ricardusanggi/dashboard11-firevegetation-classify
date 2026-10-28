#path: backend/app/routes/public_routes.py
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from pathlib import Path
import json
from sqlalchemy.orm import Session

from ..config import settings
from ..database import get_db
from ..services.public_service import get_model_metrics
from ..services.public_service import get_model_info
from ..services.training_service import (
    is_training_running,
    get_last_training_job,
    serialize_job,
    training_global_lock,
    get_training_status_service
)
from ..utils.common_utils import IMAGE_EXT

router = APIRouter(
    prefix="/public",
    tags=["public"]
)

# ==========================================================
# MODEL METRICS
# ==========================================================
@router.get("/model-metrics")
def get_model_metrics():

    metrics_path = Path(settings.PREDICT_MODEL_DIR) / "metrics.json"

    if not metrics_path.exists():
        return {
            "accuracy": None,
            "precision": None,
            "recall": None,
            "f1": None
        }

    try:
        with open(metrics_path) as f:
            return json.load(f)

    except Exception:
        return {
            "accuracy": None,
            "precision": None,
            "recall": None,
            "f1": None
        }


# ==========================================================
# MODEL CLASSES
# ==========================================================
@router.get("/model-classes")
def get_model_classes():

    classes_path = Path(settings.PREDICT_MODEL_DIR) / "class_mapping.json"

    if not classes_path.exists():
        return {"classes": []}

    try:

        with open(classes_path) as f:
            mapping = json.load(f)

        idx_map = mapping.get("idx_to_class", {})

        return {"classes": list(idx_map.values())}

    except Exception:
        return {"classes": []}

# ==========================================================
# CONFUSION MATRIX
# ==========================================================
@router.get("/confusion-matrix")
def get_confusion_matrix():

    image_path = Path(settings.PREDICT_MODEL_DIR) / "confusion_matrix.png"

    if not image_path.exists():
        return {"image": None}

    return FileResponse(image_path)


# ==========================================================
# DATASET SUMMARY
# ==========================================================
@router.get("/dataset-summary")
def get_dataset_summary():

    dataset_dir = Path(settings.TRAIN_DATASET_DIR)

    if not dataset_dir.exists():
        return {
            "total_images": 0,
            "num_classes": 0,
            "per_class": {}
        }

    total_images = 0
    per_class = {}

    for class_folder in dataset_dir.iterdir():

        if not class_folder.is_dir():
            continue

        count = 0

        for file in class_folder.iterdir():
            if file.is_file() and file.suffix.lower() in IMAGE_EXT:
                count += 1

        per_class[class_folder.name] = count
        total_images += count

    return {
        "total_images": total_images,
        "num_classes": len(per_class),
        "per_class": per_class
    }
    
@router.get("/model-info")
def get_public_model_info():
    return get_model_info()