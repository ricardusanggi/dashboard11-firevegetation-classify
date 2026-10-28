# backend/learn/trainer_epoch.py

import torch
import torch.nn as nn

from .metrics import accuracy, precision_recall_f1


def train_one_epoch(
    model,
    loader,
    optimizer,
    device,
    num_classes: int,
    loss_fn: str = "cross_entropy",
):
    """
    Train model for 1 epoch (classification)

    loss_fn:
        - "cross_entropy" (multi-class, recommended)
        - "bce" (binary only, num_classes == 2)
    """

    model.train()

    # =====================================================
    # LOSS FUNCTION SELECTION (SAFE)
    # =====================================================
    if loss_fn == "bce":
        if num_classes != 2:
            raise ValueError(
                "Invalid configuration: "
                "loss_function='bce' requires num_classes=2"
            )
        criterion = nn.BCEWithLogitsLoss()
    else:
        # default & recommended
        criterion = nn.CrossEntropyLoss()

    total_loss = 0.0
    all_preds = []
    all_targets = []

    for x, y in loader:
        x = x.to(device)
        y = y.to(device)

        optimizer.zero_grad()
        logits = model(x)

        # =================================================
        # LOSS + PREDICTION
        # =================================================
        if loss_fn == "bce":
            # logits shape:
            # (N,) or (N,1) or (N,2) → ambil positive class
            if logits.dim() == 2 and logits.size(1) > 1:
                logits = logits[:, 1]

            loss = criterion(logits.view(-1), y.float())
            preds = (torch.sigmoid(logits) >= 0.5).long()

        else:
            # CrossEntropy:
            # logits (N, C), target (N,)
            loss = criterion(logits, y)
            preds = torch.argmax(logits, dim=1)

        loss.backward()
        optimizer.step()

        total_loss += loss.item()

        all_preds.append(preds.detach().cpu())
        all_targets.append(y.detach().cpu())

    # =====================================================
    # METRICS (MACRO)
    # =====================================================
    all_preds = torch.cat(all_preds)
    all_targets = torch.cat(all_targets)

    acc = accuracy(all_preds, all_targets)
    prf = precision_recall_f1(all_preds, all_targets, num_classes)

    return {
        "loss": total_loss / len(loader),
        "accuracy": acc,
        "precision": prf["precision"],
        "recall": prf["recall"],
        "f1": prf["f1"],
    }
