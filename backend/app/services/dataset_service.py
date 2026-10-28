# backend/app/services/dataset_service.py

import os
import zipfile
import shutil
import json
import re
from datetime import datetime
from pathlib import Path

from fastapi import HTTPException
from PIL import Image
from sqlalchemy.orm import Session

from ..config import settings
from ..utils.common_utils import IMAGE_EXT, JUNK_FILES
from ..utils.file_utils import to_relative_app_path
from ..utils.time_utils import generate_ts
from ..models import models_database

PENDING_DATASET_DIR = settings.PENDING_DATASET_DIR


# ============================================================
# CLEAN JUNK FILES
# ============================================================
def clean_extracted_folder(folder: str):

    for root, dirs, files in os.walk(folder):

        for d in list(dirs):
            if d.lower() in JUNK_FILES:
                shutil.rmtree(os.path.join(root, d), ignore_errors=True)

        for f in files:

            lower_f = f.lower()

            if lower_f in JUNK_FILES or lower_f.startswith("._"):
                try:
                    os.remove(os.path.join(root, f))
                except Exception:
                    pass


# ============================================================
# NORMALIZE LABEL
# ============================================================
def normalize_label(label: str) -> str:

    label = label.strip().lower()
    label = label.replace(" ", "_")
    label = re.sub(r"[^a-z0-9_]", "", label)
    label = re.sub(r"_+", "_", label)

    if not label:
        raise HTTPException(400, "Invalid label name after normalization")

    return label


# ============================================================
# VALIDATE DATASET
# ============================================================
def validate_classification_dataset(root: Path) -> tuple[list[str], int]:

    if not root.exists():
        raise HTTPException(400, "Dataset folder tidak ditemukan")

    class_dirs = [d for d in root.iterdir() if d.is_dir()]

    if len(class_dirs) < 2:
        raise HTTPException(
            400,
            "Dataset harus memiliki minimal 2 folder class"
        )

    total_images = 0
    class_names = []

    for cls_dir in class_dirs:

        normalized = normalize_label(cls_dir.name)

        if normalized != cls_dir.name:
            new_path = cls_dir.parent / normalized
            cls_dir.rename(new_path)
            cls_dir = new_path

        images = [
            f for f in cls_dir.iterdir()
            if f.is_file() and f.suffix.lower() in IMAGE_EXT
        ]

        if not images:
            raise HTTPException(
                400,
                f"Folder class '{cls_dir.name}' kosong"
            )

        valid_count = 0

        for img in images:
            try:
                with Image.open(img) as im:
                    im.verify()
                valid_count += 1
            except Exception:
                continue

        if valid_count == 0:
            raise HTTPException(
                400,
                f"Semua image di class '{cls_dir.name}' rusak"
            )

        class_names.append(normalized)
        total_images += len(images)

    if len(set(class_names)) != len(class_names):
        raise HTTPException(400, "Duplicate class names after normalization")

    return sorted(class_names), total_images


# ============================================================
# SAVE CLASS MAPPING
# ============================================================
def save_class_mapping(dataset_root: Path, class_names: list[str]) -> str:

    mapping = {
        "idx_to_class": {
            str(i): name for i, name in enumerate(class_names)
        }
    }

    mapping_path = dataset_root / "class_mapping.json"

    with open(mapping_path, "w", encoding="utf-8") as f:
        json.dump(mapping, f, indent=2, ensure_ascii=False)

    return str(mapping_path)


# ============================================================
# DATASET LOG
# ============================================================
def ensure_no_blocking_upload(db: Session, user_id: int):

    exists = db.query(models_database.DatasetUploadLog).filter(
        models_database.DatasetUploadLog.user_id == user_id,
        models_database.DatasetUploadLog.status == "pending"
    ).first()

    if exists:
        raise HTTPException(
            status_code=409,
            detail="You still have a dataset pending review"
        )


def get_user_upload_number(db: Session, user_id: int):

    total = db.query(models_database.DatasetUploadLog).filter(
        models_database.DatasetUploadLog.user_id == user_id
    ).count()

    return total + 1


def log_dataset_upload(
    db: Session,
    user_id: int,
    upload_number: int,
    total_images: int,
    folder: str,
    num_classes: int,
    class_names: list[str]
):

    entry = models_database.DatasetUploadLog(
        user_id=user_id,
        upload_number=upload_number,
        total_images=total_images,
        dataset_folder=to_relative_app_path(folder),
        status="pending",
        reviewed_by=None,
        num_classes=num_classes,
        class_names=class_names
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry


# ============================================================
# FIND DATASET ROOT
# ============================================================
def find_dataset_root(folder: Path) -> Path:

    current = folder

    while True:

        subdirs = [d for d in current.iterdir() if d.is_dir()]
        files = [f for f in current.iterdir() if f.is_file()]

        if any(f.suffix.lower() in IMAGE_EXT for f in files):
            return current

        if len(subdirs) == 1:
            current = subdirs[0]
            continue

        return current


# ============================================================
# MAIN FUNCTION
# ============================================================
def save_and_extract_dataset(
    db: Session,
    file_path: str,
    owner_id: int,
    dataset_name: str
):

    ensure_no_blocking_upload(db, owner_id)

    upload_number = get_user_upload_number(db, owner_id)
    dataset_folder = os.path.join(
        PENDING_DATASET_DIR,
        f"{dataset_name}_{upload_number}_{generate_ts()}"
    )

    os.makedirs(dataset_folder, exist_ok=True)

    try:

        with zipfile.ZipFile(file_path, "r") as z:

            base_path = Path(dataset_folder).resolve()

            for member in z.infolist():

                normalized_name = member.filename.replace("\\", "/")

                if not normalized_name.strip():
                    continue

                target_path = (base_path / normalized_name).resolve()

                if not str(target_path).startswith(str(base_path)):
                    raise HTTPException(400, "Invalid ZIP structure detected")

                if member.is_dir():
                    target_path.mkdir(parents=True, exist_ok=True)
                    continue

                target_path.parent.mkdir(parents=True, exist_ok=True)

                with z.open(member) as source, open(target_path, "wb") as target:
                    shutil.copyfileobj(source, target)

    except Exception:

        shutil.rmtree(dataset_folder, ignore_errors=True)

        raise HTTPException(400, "Invalid ZIP file")

    clean_extracted_folder(dataset_folder)

    root = find_dataset_root(Path(dataset_folder))

    class_names, total_images = validate_classification_dataset(root)

    mapping_path = save_class_mapping(root, class_names)

    log = log_dataset_upload(
        db=db,
        user_id=owner_id,
        upload_number=upload_number,
        total_images=total_images,
        folder=str(root),
        num_classes=len(class_names),
        class_names=class_names
    )

    return {
        "detail": "Dataset uploaded successfully (pending review)",
        "folder": str(root.resolve()),
        "upload_id": log.id,
        "total_images": total_images,
        "num_classes": len(class_names),
        "detected_classes": class_names,
        "class_mapping_path": mapping_path
    }