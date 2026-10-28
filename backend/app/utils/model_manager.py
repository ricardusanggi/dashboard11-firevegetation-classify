# backend/app/utils/model_manager.py

import torch
from threading import Lock
from pathlib import Path
from sqlalchemy.orm import Session
from functools import lru_cache
from typing import Tuple

from ..config import settings
from ..services.inference_service import load_model_from_path


# =====================================================
# LRU CACHE (OPTIONAL)
# =====================================================
@lru_cache(maxsize=3)
def get_cached_model(
    model_path: str,
    device: str
) -> Tuple[torch.nn.Module, dict]:

    """
    Load model dengan LRU cache.
    Cache key = (model_path, device)
    """

    device_obj = torch.device(device)

    model, idx_to_class = load_model_from_path(
        model_path,
        device_obj
    )

    model.eval()

    return model, idx_to_class


# =====================================================
# MODEL MANAGER
# =====================================================
class ModelManager:
    """
    Singleton model manager untuk:
    - cache model aktif
    - load model hanya sekali
    - thread safe inference
    """

    def __init__(self):

        self.model: torch.nn.Module | None = None
        self.idx_to_class: dict | None = None
        self.model_path: str | None = None

        self.device = torch.device(
            "cuda" if torch.cuda.is_available() else "cpu"
        )

        self.lock = Lock()

    def get_device(self):
        return self.device
    
    # =====================================================
    # LOAD MODEL (CACHE)
    # =====================================================
    def load_model(self, model_path: str):

        """
        Load model dari path directory.

        Jika model sudah di memory dan path sama
        → gunakan model yang ada.
        """

        model_path = str(Path(model_path))

        with self.lock:

            if (
                self.model_path == model_path
                and self.model is not None
            ):
                return self.model, self.idx_to_class

            print(f"[MODEL MANAGER] Loading model from {model_path}")

            model, idx_to_class = load_model_from_path(
                model_path,
                self.device
            )

            model.eval()

            self.model = model
            self.idx_to_class = idx_to_class
            self.model_path = model_path

            return self.model, self.idx_to_class

    # =====================================================
    # GET ACTIVE MODEL (PUBLIC INFERENCE)
    # =====================================================
    def get_active(self, db: Session):

        """
        Public inference menggunakan model dari
        settings.PREDICT_MODEL_DIR
        """

        predict_dir = Path(settings.PREDICT_MODEL_DIR)

        if not predict_dir.exists():
            raise RuntimeError(
                f"Predict model directory not found: {predict_dir}"
            )

        return self.load_model(str(predict_dir))

    # =====================================================
    # LOAD MODEL SPECIFIC (REGISTERED USER)
    # =====================================================
    def load_specific(self, model_path: str):

        """
        Load model tertentu (digunakan user terdaftar)
        menggunakan LRU cache.
        """

        model_path = str(Path(model_path))

        return get_cached_model(
            model_path,
            str(self.device)
        )

    # =====================================================
    # RELOAD MODEL JIKA MODEL AKTIF BERUBAH
    # =====================================================
    def reload_if_changed(self, db: Session):

        """
        Reload model jika model aktif di database berubah.
        """

        from ..services.model_service import (
            get_active_model_or_filesystem
        )

        model_record = get_active_model_or_filesystem(db)

        if not model_record:
            return

        model_path = str(Path(model_record.path))

        if model_path != self.model_path:

            print("[MODEL MANAGER] Reloading active model")
            self.clear_cache()
            self.load_model(model_path)
            
    # =====================================================
    # CLEAR CACHE
    # =====================================================
    def clear_cache(self):

        """
        Hapus cache model (digunakan saat reset sistem)
        """

        with self.lock:

            self.model = None
            self.idx_to_class = None
            self.model_path = None

        get_cached_model.cache_clear()

        print("[MODEL MANAGER] Model cache cleared")


# =====================================================
# SINGLETON INSTANCE
# =====================================================

model_manager = ModelManager()