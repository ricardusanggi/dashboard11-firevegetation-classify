#backend/app/learn/dataset.py
import torch
import torchvision.datasets as datasets
import torchvision.transforms as transforms
from sklearn.model_selection import train_test_split
import numpy as np


def build_datasets(dataset_dir, img_size=(224,224), val_split=0.2):

    # ====================================
    # TRAIN TRANSFORM (AUGMENTATION)
    # ====================================
    train_transform = transforms.Compose([
        transforms.Resize(img_size),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(10),
        transforms.ColorJitter(
            brightness=0.2,
            contrast=0.2,
            saturation=0.2
        ),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485,0.456,0.406],
            std=[0.229,0.224,0.225]
        )
    ])

    # ====================================
    # VALIDATION TRANSFORM
    # ====================================
    val_transform = transforms.Compose([
        transforms.Resize(img_size),
        transforms.ToTensor(),
        transforms.Normalize(
            mean=[0.485,0.456,0.406],
            std=[0.229,0.224,0.225]
        )
    ])

    full_ds = datasets.ImageFolder(dataset_dir)

    targets = np.array(full_ds.targets)

    train_idx, val_idx = train_test_split(
        np.arange(len(targets)),
        test_size=val_split,
        stratify=targets,
        random_state=42
    )

    train_ds = torch.utils.data.Subset(
        datasets.ImageFolder(dataset_dir, transform=train_transform),
        train_idx
    )

    val_ds = torch.utils.data.Subset(
        datasets.ImageFolder(dataset_dir, transform=val_transform),
        val_idx
    )

    return train_ds, val_ds, full_ds.classes