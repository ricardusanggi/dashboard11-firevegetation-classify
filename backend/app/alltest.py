import torch

checkpoint = torch.load("storage/models_predict/model.pth", map_location="cpu")

print(type(checkpoint))

if isinstance(checkpoint, dict):
    print(checkpoint.keys())