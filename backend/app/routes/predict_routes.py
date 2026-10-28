# backend/app/routes/predict_routes.py

from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from pathlib import Path
import tempfile
import shutil

from fastapi.concurrency import run_in_threadpool

from ..database import get_db
from ..services.auth_service import get_current_user_optional
from ..models.models_database import PredictionLog, Model

from ..services.model_service import get_active_model_or_filesystem
from ..services.inference_service import (
    preprocess_image,
    predict_single,
    get_class_mapping_from_active_model,
)

from ..services.predict_service import save_test_image
from ..utils.model_manager import model_manager
from ..config import settings

router = APIRouter(prefix="/predict", tags=["predict"])


# ============================================================
# GET CLASSES
# ============================================================
@router.get("/classes")
def get_predict_classes(db: Session = Depends(get_db)):

    model_record = get_active_model_or_filesystem(db)

    if not model_record:
        return {
            "classes": [],
            "model_active": False,
            "message": "Belum ada model aktif"
        }

    classes = get_class_mapping_from_active_model(db)

    return {
        "classes": classes,
        "model_active": True
    }


# ============================================================
# PREDICT IMAGE
# ============================================================
@router.post("/upload-image-testing")
async def upload_image_testing(
    file: UploadFile = File(...),
    true_label: str | None = Form(None),
    model_id: int | None = Form(None),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):

    # ================================
    # VALIDASI FILE
    # ================================

    if not file.filename:
        raise HTTPException(400, "No file uploaded")

    ext = Path(file.filename).suffix.lower()

    if ext not in (".png", ".jpg", ".jpeg"):
        raise HTTPException(400, "Invalid image format")

    file.file.seek(0, 2)
    size = file.file.tell()
    file.file.seek(0)

    if size > 10 * 1024 * 1024:
        raise HTTPException(400, "Image too large (max 10MB)")

    # ================================
    # LOAD MODEL
    # ================================

    if model_id and current_user:

        model_record = db.query(Model).filter_by(id=model_id).first()

        if not model_record:
            raise HTTPException(404, "Model not found")

        model, idx_to_class = model_manager.load_specific(model_record.path)

    else:

        model_record = get_active_model_or_filesystem(db)

        if not model_record:
            raise HTTPException(
                status_code=409,
                detail="Model belum diaktifkan oleh admin"
            )
            
        model_manager.reload_if_changed(db)
        model, idx_to_class = model_manager.get_active(db)
        device = model_manager.get_device()

    # ================================
    # TEMP FILE
    # ================================

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:

        shutil.copyfileobj(file.file, tmp)
        tmp_path = Path(tmp.name)

    try:

        tensor_img, _ = preprocess_image(str(tmp_path))

        label, confidence, probabilities = await run_in_threadpool(
            predict_single,
            model,
            tensor_img,
            device,
            idx_to_class,
        )

        # ================================
        # AUTO SAVE TRUE DATASET
        # ================================

        saved_to_true_dataset = False

        if true_label and label == true_label and confidence >= 0.9:
            from ..utils.dataset_utils import save_true_dataset
            save_true_dataset(
                src_path=str(tmp_path),
                label=label,
                base_dir=settings.TEST_TRUE_DIR
            )

            saved_to_true_dataset = True

        # ================================
        # SAVE LOG
        # ================================

        prediction_id = None

        if current_user:

            saved_input_path = save_test_image(
                db=db,
                src_path=str(tmp_path),
                filename=file.filename,
                user_id=current_user.id,
            )

            log = PredictionLog(
                user_id=current_user.id,
                model_id=model_record.id,
                input_filename=file.filename,
                input_path=saved_input_path,
                output_filename=label,
                output_path=label,
                confidence=confidence,
                true_label=true_label,
            )

            db.add(log)
            db.commit()
            db.refresh(log)

            prediction_id = log.id

        # ================================
        # RESPONSE
        # ================================

        model_name = getattr(model_record, "name", "filesystem_model")
        model_version = getattr(model_record, "version", "N/A")

        return {
            "message": "Prediction success",
            "prediction_id": prediction_id,
            "label": label,
            "confidence": confidence,
            "probabilities": probabilities,
            "saved_to_true_dataset": saved_to_true_dataset,
            "model_used": model_name,
            "model_version": model_version,
            "user": current_user.username if current_user else "public",
        }

    finally:

        tmp_path.unlink(missing_ok=True)