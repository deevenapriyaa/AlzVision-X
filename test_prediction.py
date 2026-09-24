import sys
import torch
from PIL import Image
from torchvision import transforms

sys.path.insert(0, "backend")

from app.ml.hybrid_model import HybridMobileNetViT


model = HybridMobileNetViT(num_classes=4)

model.load_state_dict(
    torch.load(
        "backend/models/hybrid_mobilenet_vit.pth",
        map_location="cpu"
    )
)

model.eval()


transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])


samples = {
    "MildDemented":
        "dataset/Combined_images/MildDemented/00046ff7-0fae-4796-9a2b-2df47095bfe6.jpg",

    "ModerateDemented":
        "dataset/Combined_images/ModerateDemented/001ef5a6-893b-4ede-9cf8-60b7fb94a541.jpg",

    "NonDemented":
        "dataset/Combined_images/NonDemented/00005576-2b76-44ca-8572-a5057201433f.jpg",

    "VeryMildDemented":
        "dataset/Combined_images/VeryMildDemented/0001b959-d622-4311-acab-84633370c892.jpg"
}


print("\nMODEL PREDICTION TEST")
print("=" * 50)


for actual_class, image_path in samples.items():

    image = Image.open(image_path).convert("RGB")

    image_tensor = transform(image).unsqueeze(0)

    with torch.no_grad():
        output = model(image_tensor)[0]

    output = output.flatten()

    predicted_index = output.argmax().item()

    logits = output.tolist()

    print(f"Actual folder   : {actual_class}")
    print(f"Predicted index : {predicted_index}")
    print(f"Logits          : {[round(v, 3) for v in logits]}")
    print("-" * 50)


print("\nImageFolder mapping:")
print("0 = MildDemented")
print("1 = ModerateDemented")
print("2 = NonDemented")
print("3 = VeryMildDemented")