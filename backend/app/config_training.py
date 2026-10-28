# backend/app/config_training.py

import os


# =====================================================
# HELPER
# =====================================================

def parse_int_list(value: str, default: list[int]):
    if not value:
        return default
    return [int(x.strip()) for x in value.split(",") if x.strip()]


# =====================================================
# DEFAULT TRAINING PARAMETERS (CLASSIFICATION)
# =====================================================

img_size = int(os.getenv("TRAIN_IMG_SIZE", 224))

DEFAULT_TRAINING_PARAMS = {

    # ===============================
    # BASIC TRAINING
    # ===============================
    "architecture": os.getenv("TRAIN_ARCHITECTURE", "resnet18"),
    "epochs": int(os.getenv("TRAIN_EPOCHS", 3)),
    "batch_size": int(os.getenv("TRAIN_BATCH_SIZE", 8)),
    "learning_rate": float(os.getenv("TRAIN_LEARNING_RATE", 1e-4)),
    "optimizer": os.getenv("TRAIN_OPTIMIZER", "adam"),
    "loss_function": os.getenv("TRAIN_LOSS_FUNCTION", "cross_entropy"),

    # ===============================
    # DATASET
    # ===============================
    "augmentation": os.getenv("TRAIN_AUGMENTATION", "true").lower() == "true",
    "val_split": float(os.getenv("TRAIN_VAL_SPLIT", 0.2)),

    "img_size": [
        img_size,
        img_size,
    ],

    # ===============================
    # PSO
    # ===============================
    "use_pso": os.getenv("USE_PSO", "false").lower() == "true",
    "pso_population": int(os.getenv("PSO_POPULATION", 5)),
    "pso_iters": int(os.getenv("PSO_ITERS", 10)),
    "pso_epochs": int(os.getenv("PSO_EPOCHS", 2)),

    "pso_lr_bounds": [
        float(os.getenv("PSO_LR_MIN", 1e-5)),
        float(os.getenv("PSO_LR_MAX", 1e-3)),
    ],

    "pso_dropout_bounds": [
        float(os.getenv("PSO_DROPOUT_MIN", 0.1)),
        float(os.getenv("PSO_DROPOUT_MAX", 0.5)),
    ],

    "pso_hidden_sizes": parse_int_list(
        os.getenv("PSO_HIDDEN_SIZES"),
        [128, 256, 512],
    ),

    "pso_batch_sizes": parse_int_list(
        os.getenv("PSO_BATCH_SIZES"),
        [8, 16, 32],
    ),

    "pso_augmentation": os.getenv("PSO_AUGMENTATION", "true").lower() == "true",
}


# =====================================================
# ALLOWED OPTIONS
# =====================================================

ALLOWED_ARCHITECTURES = [
    "resnet18",
    "resnet34",
    "resnet50",
    "mobilenet_v2",
    "efficientnet_b0",
    "efficientnet_b1",
    "efficientnet_b2",
    "densenet121",
    "vgg16",
]

ALLOWED_OPTIMIZERS = [
    "adam",
    "sgd",
    "rmsprop",
    "adagrad",
    "adamw",
    "adadelta",
    "adamax",
    "nadam",
    "ftrl",
    "sparseadam",
    "yogi",
    "lamb",
    "novograd",
]

ALLOWED_LOSS = [
    "cross_entropy",
    "bce",
    "mse",
    "mae",
    "huber",
    "kldiv",
    "hinge",
    "squared_hinge",
    "categorical_crossentropy",
    "sparse_categorical_crossentropy",
]


# =====================================================
# VALIDATE TRAINING PARAMS
# =====================================================

def validate_training_params(params: dict):

    lr = params["learning_rate"]

    if not (1e-5 <= lr <= 1e-3):
        raise ValueError(
            f"Invalid learning_rate={lr}. Allowed range: 1e-5 – 1e-3"
        )

    val_split = params["val_split"]

    if not (0.05 <= val_split <= 0.5):
        raise ValueError(
            f"Invalid val_split={val_split}. Allowed range: 0.05 – 0.5"
        )

    if params["optimizer"] not in ALLOWED_OPTIMIZERS:
        raise ValueError(
            f"Invalid optimizer={params['optimizer']}"
        )

    if params["loss_function"] not in ALLOWED_LOSS:
        raise ValueError(
            f"Invalid loss_function={params['loss_function']}"
        )

    if params["architecture"] not in ALLOWED_ARCHITECTURES:
        raise ValueError(
            f"Invalid architecture={params['architecture']}"
        )

    if params["epochs"] <= 0:
        raise ValueError("epochs must be > 0")

    if params["batch_size"] <= 0:
        raise ValueError("batch_size must be > 0")

    if not isinstance(params["augmentation"], bool):
        raise ValueError("augmentation must be boolean")

    if params["use_pso"]:

        if params["pso_population"] <= 1:
            raise ValueError("pso_population must be > 1")

        if params["pso_iters"] <= 0:
            raise ValueError("pso_iters must be > 0")

        if params["pso_epochs"] <= 0:
            raise ValueError("pso_epochs must be > 0")

    img_size = params["img_size"]

    if (
        not isinstance(img_size, list)
        or len(img_size) != 2
        or img_size[0] <= 0
        or img_size[1] <= 0
    ):
        raise ValueError("img_size must be [width,height]")


# =====================================================
# VALIDATE DEFAULT CONFIG ON STARTUP
# =====================================================

validate_training_params(DEFAULT_TRAINING_PARAMS)