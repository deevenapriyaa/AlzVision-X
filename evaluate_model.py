import os
import sys
import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# ============================================================
# Paths
# ============================================================

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.join(PROJECT_ROOT, "backend")

sys.path.insert(0, BACKEND_DIR)

from app.ml.hybrid_model import HybridMobileNetViT


DATASET_PATH = os.path.join(
    PROJECT_ROOT,
    "dataset",
    "Combined_images"
)

MODEL_PATH = os.path.join(
    BACKEND_DIR,
    "models",
    "hybrid_mobilenet_vit.pth"
)


# ============================================================
# Device
# ============================================================

device = torch.device("cpu")

print("Device       :", device)
print("Dataset      :", DATASET_PATH)
print("Model weights:", MODEL_PATH)


# ============================================================
# Transform
# Same preprocessing used during training
# ============================================================

transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(
        [0.485, 0.456, 0.406],
        [0.229, 0.224, 0.225]
    )
])


# ============================================================
# Dataset
# ============================================================

dataset = datasets.ImageFolder(
    DATASET_PATH,
    transform=transform
)

print("\nTotal images :", len(dataset))
print("Classes      :", dataset.classes)

print("\nImages per class:")

for class_name, class_index in dataset.class_to_idx.items():
    count = sum(
        1 for _, label in dataset.samples
        if label == class_index
    )
    print(f"{class_name:20s}: {count}")


# ============================================================
# DataLoader
# ============================================================

loader = DataLoader(
    dataset,
    batch_size=32,
    shuffle=False,
    num_workers=0
)


# ============================================================
# Load model
# ============================================================

model = HybridMobileNetViT(num_classes=4)

checkpoint = torch.load(
    MODEL_PATH,
    map_location=device
)

model.load_state_dict(checkpoint)

model.to(device)
model.eval()

print("\nModel loaded successfully.")


# ============================================================
# IMPORTANT:
# Model output mapping discovered from direct testing
#
# Model index 0 -> NonDemented
# Model index 1 -> VeryMildDemented
# Model index 2 -> MildDemented
# Model index 3 -> ModerateDemented
#
# ImageFolder mapping:
# 0 -> MildDemented
# 1 -> ModerateDemented
# 2 -> NonDemented
# 3 -> VeryMildDemented
# ============================================================

MODEL_TO_DATASET_INDEX = {
    0: 2,  # NonDemented
    1: 3,  # VeryMildDemented
    2: 0,  # MildDemented
    3: 1   # ModerateDemented
}


# ============================================================
# Evaluation
# ============================================================

all_labels = []
all_predictions = []


with torch.no_grad():

    for images, labels in loader:

        images = images.to(device)

        outputs = model(images)[0]

        model_predictions = outputs.argmax(
            dim=1
        ).cpu().tolist()

        # Convert model output index
        # into ImageFolder dataset index
        corrected_predictions = [
            MODEL_TO_DATASET_INDEX[p]
            for p in model_predictions
        ]

        all_predictions.extend(
            corrected_predictions
        )

        all_labels.extend(
            labels.tolist()
        )


# ============================================================
# Metrics
# ============================================================

accuracy = accuracy_score(
    all_labels,
    all_predictions
)

precision = precision_score(
    all_labels,
    all_predictions,
    average="macro",
    zero_division=0
)

recall = recall_score(
    all_labels,
    all_predictions,
    average="macro",
    zero_division=0
)

f1 = f1_score(
    all_labels,
    all_predictions,
    average="macro",
    zero_division=0
)


# ============================================================
# Results
# ============================================================

print("\n" + "=" * 60)
print("EVALUATION RESULTS")
print("=" * 60)

print(f"Accuracy        : {accuracy * 100:.2f}%")
print(f"Macro Precision : {precision * 100:.2f}%")
print(f"Macro Recall    : {recall * 100:.2f}%")
print(f"Macro F1-Score  : {f1 * 100:.2f}%")


# ============================================================
# Classification Report
# ============================================================

target_names = [
    "MildDemented",
    "ModerateDemented",
    "NonDemented",
    "VeryMildDemented"
]

print("\n" + "=" * 60)
print("CLASSIFICATION REPORT")
print("=" * 60)

print(
    classification_report(
        all_labels,
        all_predictions,
        target_names=target_names,
        zero_division=0
    )
)


# ============================================================
# Confusion Matrix
# ============================================================

print("\n" + "=" * 60)
print("CONFUSION MATRIX")
print("=" * 60)

cm = confusion_matrix(
    all_labels,
    all_predictions
)

print(cm)