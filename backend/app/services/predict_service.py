# backend/app/services/predict_service.py

from pathlib import Path
from PIL import Image
import base64
import io
import shutil
import os
from datetime import datetime

from sqlalchemy.orm import Session

from ..models.models_database import PredictionLog, TestingUploadLog
from ..utils.file_utils import to_relative_app_path
from ..config import settings

from .inference_service import (
    preprocess_image,
    predict_single
)
from ..utils.model_manager import model_manager
from ..utils.time_utils import generate_ts


# ============================================================
# Helper menentukan folder user: datasets_test/<user>/
# ============================================================
def get_user_dir(user_id: int | None):

    base = Path(settings.TEST_DATASET_DIR)

    folder = f"user_{user_id}" if user_id else "public"

    full = base / folder

    full.mkdir(parents=True, exist_ok=True)

    return full


# ============================================================
# Helper: PIL → base64
# ============================================================
def pil_to_base64(img: Image.Image):

    buffer = io.BytesIO()

    img.save(buffer, format="PNG")

    return base64.b64encode(buffer.getvalue()).decode()


# ============================================================
# SAVE INPUT IMAGE → path relatif
# ============================================================
def save_test_image(
    db: Session,
    src_path: str,
    filename: str,
    user_id: int | None = None
):

    user_dir = get_user_dir(user_id)

    input_dir = user_dir / "inputs"

    input_dir.mkdir(parents=True, exist_ok=True)

    ts = generate_ts()

    dest_name = f"image_{ts}{Path(filename).suffix}"

    dest_path = input_dir / dest_name

    shutil.copy(src_path, dest_path)

    rel_path = to_relative_app_path(dest_path)

    # PUBLIC user tidak dicatat
    if user_id is None:
        return rel_path

    log = TestingUploadLog(
        user_id=user_id,
        filename=dest_name,
        saved_path=rel_path
    )

    db.add(log)
    db.commit()
    db.refresh(log)

    return rel_path


# ============================================================
# MAIN PREDICTION FUNCTION (CLASSIFICATION)
# ============================================================
def run_prediction(
    db: Session,
    image_path: str,
    saved_input_path: str,
    model,
    model_record,
    idx_to_class: dict,
    user_id: int | None = None
):

    """
    Classification inference
    """

    # ===============================
    # PREPROCESS
    # ===============================
    tensor, _ = preprocess_image(image_path)

    device = next(model.parameters()).device

    # ===============================
    # PREDICTION
    # ===============================
    pred_label, confidence, prob_dict = predict_single(
        model,
        tensor,
        device,
        idx_to_class
    )

    label = pred_label

    # ===============================
    # LOG PREDICTION (OPTIONAL)
    # ===============================
    log_id = None

    if user_id:

        log = PredictionLog(
            user_id=user_id,
            model_id=model_record.id,
            input_filename=os.path.basename(saved_input_path),
            input_path=saved_input_path,
            output_filename=label,
            output_path=None,
            confidence=float(confidence)
        )

        db.add(log)
        db.commit()
        db.refresh(log)

        log_id = log.id

    return {
        "label": label,
        "confidence": float(confidence),
        "probabilities": prob_dict,
        "log_id": log_id,
        "model_used": model_record.name,
        "model_version": model_record.version,
    }
    