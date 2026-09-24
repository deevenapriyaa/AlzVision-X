import os
import sys
import torch
import torch.nn as nn
from torchvision import datasets, transforms
from torch.utils.data import DataLoader, random_split

# --------------------------------------------------
# Add backend folder to Python path
# --------------------------------------------------
BACKEND_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..")
)

sys.path.insert(0, BACKEND_DIR)

from app.ml.hybrid_model import HybridMobileNetViT


# --------------------------------------------------
# Configuration
# --------------------------------------------------
DATASET_PATH = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "..",
        "dataset",
        "Combined_images"
    )
)

MODEL_DIR = os.path.abspath(
    os.path.join(
        os.path.dirname(__file__),
        "..",
        "models"
    )
)

MODEL_PATH = os.path.join(
    MODEL_DIR,
    "hybrid_mobilenet_vit.pth"
)

IMAGE_SIZE = 224
BATCH_SIZE = 4
EPOCHS = 1
LEARNING_RATE = 0.0001

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("=" * 60)
print("AlzVision-X Hybrid Model Training")
print("=" * 60)

print("Device:", DEVICE)
print("Dataset:", DATASET_PATH)


# --------------------------------------------------
# Image preprocessing
# --------------------------------------------------
transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225]
    )
])


# --------------------------------------------------
# Load dataset
# --------------------------------------------------
dataset = datasets.ImageFolder(
    root=DATASET_PATH,
    transform=transform
)

print("Classes:", dataset.classes)
print("Total images:", len(dataset))


# --------------------------------------------------
# Small test dataset
# --------------------------------------------------
if len(dataset) > 400:
    dataset, _ = random_split(
        dataset,
        [400, len(dataset) - 400],
        generator=torch.Generator().manual_seed(42)
    )

print("Images used for test training:", len(dataset))


# --------------------------------------------------
# Train / validation split
# --------------------------------------------------
train_size = int(0.8 * len(dataset))
val_size = len(dataset) - train_size

train_dataset, val_dataset = random_split(
    dataset,
    [train_size, val_size],
    generator=torch.Generator().manual_seed(42)
)

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0
)


# --------------------------------------------------
# Create Hybrid MobileNetV2 + ViT model
# --------------------------------------------------
print("\nCreating Hybrid MobileNetV2 + ViT model...")

model = HybridMobileNetViT(
    num_classes=4
)

model = model.to(DEVICE)

print("Hybrid model created successfully.")


# --------------------------------------------------
# Loss and optimizer
# --------------------------------------------------
criterion = nn.CrossEntropyLoss()

optimizer = torch.optim.Adam(
    model.parameters(),
    lr=LEARNING_RATE
)


# --------------------------------------------------
# Training
# --------------------------------------------------
for epoch in range(EPOCHS):

    model.train()

    running_loss = 0.0
    correct = 0
    total = 0

    print(f"\nEpoch [{epoch + 1}/{EPOCHS}]")

    for batch_index, (images, labels) in enumerate(train_loader):

        images = images.to(DEVICE)
        labels = labels.to(DEVICE)

        optimizer.zero_grad()

        logits, fused_features, mobile_features = model(images)

        loss = criterion(logits, labels)

        loss.backward()

        optimizer.step()

        running_loss += loss.item()

        _, predicted = torch.max(logits, 1)

        total += labels.size(0)
        correct += (predicted == labels).sum().item()

        if (batch_index + 1) % 10 == 0:
            print(
                f"Batch [{batch_index + 1}/{len(train_loader)}] "
                f"Loss: {loss.item():.4f}"
            )

    train_accuracy = 100 * correct / total


    # --------------------------------------------------
    # Validation
    # --------------------------------------------------
    model.eval()

    val_correct = 0
    val_total = 0

    with torch.no_grad():

        for images, labels in val_loader:

            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            logits, _, _ = model(images)

            _, predicted = torch.max(logits, 1)

            val_total += labels.size(0)
            val_correct += (
                predicted == labels
            ).sum().item()

    val_accuracy = 100 * val_correct / val_total


    print(
        f"Train Accuracy: {train_accuracy:.2f}%"
    )

    print(
        f"Validation Accuracy: {val_accuracy:.2f}%"
    )


# --------------------------------------------------
# Save Hybrid model
# --------------------------------------------------
os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

torch.save(
    model.state_dict(),
    MODEL_PATH
)

print("\n" + "=" * 60)
print("Hybrid training test completed!")
print("Model saved at:")
print(MODEL_PATH)
print("=" * 60)