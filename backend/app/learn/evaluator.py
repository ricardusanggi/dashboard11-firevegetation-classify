# backend/learn/evaluator.py

import torch

from .metrics import accuracy, precision_recall_f1, confusion_matrix


def evaluate(model, loader, device, num_classes):
    """
    Evaluate model on validation/test set (classification)

    Returns:
        dict with accuracy, precision, recall, f1, confusion_matrix
    """
    model.eval()

    all_preds = []
    all_targets = []

    with torch.no_grad():
        for x, y in loader:
            x = x.to(device)
            y = y.to(device)

            logits = model(x)
            preds = torch.argmax(logits, dim=1)

            all_preds.append(preds.cpu())
            all_targets.append(y.cpu())

    all_preds = torch.cat(all_preds)
    all_targets = torch.cat(all_targets)

    prf = precision_recall_f1(all_preds, all_targets, num_classes)

    return {
        "loss": None,
        "accuracy": accuracy(all_preds, all_targets),
        "precision": prf["precision"],
        "recall": prf["recall"],
        "f1": prf["f1"],
        "confusion_matrix": confusion_matrix(
            all_preds, all_targets, num_classes
        ),
    }
