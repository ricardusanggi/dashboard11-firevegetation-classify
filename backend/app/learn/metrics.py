# backend/learn/metrics.py

import torch

def accuracy(preds, targets):
    """
    preds: Tensor (N,) predicted class index
    targets: Tensor (N,) true class index
    """
    correct = (preds == targets).sum().item()
    total = targets.numel()
    return correct / total if total > 0 else 0.0


def precision_recall_f1(preds, targets, num_classes):
    """
    Macro-averaged Precision, Recall, F1-score
    """
    eps = 1e-9
    precision_sum = 0.0
    recall_sum = 0.0
    f1_sum = 0.0

    for c in range(num_classes):
        tp = ((preds == c) & (targets == c)).sum().item()
        fp = ((preds == c) & (targets != c)).sum().item()
        fn = ((preds != c) & (targets == c)).sum().item()

        precision = tp / (tp + fp + eps)
        recall = tp / (tp + fn + eps)
        f1 = 2 * precision * recall / (precision + recall + eps)

        precision_sum += precision
        recall_sum += recall
        f1_sum += f1

    return {
        "precision": precision_sum / num_classes,
        "recall": recall_sum / num_classes,
        "f1": f1_sum / num_classes,
    }


def confusion_matrix(preds, targets, num_classes):
    """
    Returns confusion matrix (num_classes x num_classes)
    rows = true labels
    cols = predicted labels
    """
    cm = torch.zeros((num_classes, num_classes), dtype=torch.int64)

    for t, p in zip(targets.view(-1), preds.view(-1)):
        cm[t.long(), p.long()] += 1

    return cm
