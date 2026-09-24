# AlzVision-X: A Hybrid Deep Learning & Agentic AI Framework for Alzheimer's Disease Detection

An end-to-end full-stack academic research prototype for MRI-based Alzheimer's Disease detection, multi-class staging, explainable AI (Grad-CAM), longitudinal MRI comparison, and agentic AI workflow orchestration.

---

## 🧠 Architectural Pipeline (Matching Project PPT)

```
Raw T1 Brain MRI
      │
      ▼
[ 1. Preprocessing Agent ] ─── CLAHE Contrast, SNR Metric, 224x224 Standardized Tensor
      │
      ├───────────────────────────────┐
      ▼                               ▼
[ MobileNetV2 Branch ]      [ Vision Transformer (ViT) Branch ]
(1280-d Local Textures)     (192-d Global 16x16 Self-Attention)
      │                               │
      └───────────────┬───────────────┘
                      ▼
            [ Feature Fusion Layer ] ─── 704-d → 512-d Latent Dense Embedding
                      │
                      ▼
       [ 2. Disease Prediction Agent ] ─── 4-Class Softmax Staging (CDR 0 to CDR 2.0)
                      │
                      ▼
     [ 3. Grad-CAM Explainability Agent ] ─── Visual Saliency & Hippocampal Atrophy Map
                      │
                      ▼
    [ 4. Report Generation Agent ] ─── Automated Institutional PDF Dossier
                      │
                      ▼
     [ 5. Recommendation Agent ] ─── 
     Formulates stage-tailored medical advice, follow-up intervals, and cognitive assessment protocols
                      │
                      ▼
     [ 6. Data & History Agent ] ─── SQLite Persistence & Longitudinal Auditing
                      │
                      ▼
    [ Web Dashboard & GUI ] ─── Real-Time Visualization & Scan Comparison
```

---

## 🌟 Key Features

1. **Hybrid Deep Learning Model (`MobileNetV2` + `Vision Transformer`)**:
   - Captures both fine-grained localized cortical textures (MobileNetV2) and global bilateral brain symmetry / ventricular dilation (ViT).
2. **6 Autonomous Clinical Agents**:
   - **Preprocessing Agent**: Noise filtration, CLAHE contrast enhancement, tensor normalization.
   - **Prediction Agent**: Computes probabilities for 4 stages (Non-Demented, Very Mild, Mild, Moderate).
   - **Explainability Agent (Grad-CAM)**: Generates high-resolution saliency maps highlighting the Medial Temporal Lobe, Hippocampus, and Lateral Ventricles.
   - **Recommendation Agent**: Formulates stage-tailored medical advice, follow-up intervals, and cognitive assessment protocols (MMSE / MoCA).
   - **Report Agent**: Compiles clinical PDF dossiers with patient metadata, confidence scores, and heatmaps.
   - **Data & History Agent**: Manages longitudinal patient timelines in SQLite.
3. **Longitudinal MRI Differential Comparison**:
   - Side-by-side comparative inspection between Baseline and Follow-up scans with synchronized opacity controls and atrophy progression tracking.
4. **Real MRI Analysis and Longitudinal History**:
   - Requires an uploaded MRI image for analysis using the trained Hybrid MobileNetV2 + Vision Transformer model.
   - Stores genuine patient analysis results for history tracking and longitudinal MRI comparison.

---

## 📂 Project Structure

```
alzvision-x/
├── backend/
│   ├── app/
│   │   ├── agents/            # 6 Autonomous AI Agents
│   │   │   ├── preprocessing_agent.py
│   │   │   ├── prediction_agent.py
│   │   │   ├── explainability_agent.py
│   │   │   ├── recommendation_agent.py
│   │   │   ├── report_agent.py
│   │   │   └── history_agent.py
│   │   ├── api/               # FastAPI route endpoints
│   │   │   └── routes.py
│   │   ├── database/          # SQLite database engine
│   │   │   └── db.py
│   │   ├── models/            # SQLAlchemy database models
│   │   │   └── models.py
│   │   ├── schemas/           # Pydantic validation schemas
│   │   │   └── schemas.py
│   │   ├── ml/                # Hybrid MobileNet + ViT PyTorch Model
│   │   │   └── hybrid_model.py
│   │   ├── explainability/    # Grad-CAM implementation
│   │   │   └── gradcam.py
│   │   ├── reports/           # ReportLab PDF generator
│   │   │   └── pdf_generator.py
│   │   ├── utils/             # Utility modules
│   │   │   └── sample_data.py
│   │   └── main.py            # FastAPI Application Entry
│   ├── requirements.txt       # Python dependencies
│   └── run.py                 # Backend launch script
│
├── src/                       # React 19 + TypeScript + Vite Frontend
│   ├── components/            # UI Components (Navbar, GradCamViewer, Visualizer, etc.)
│   ├── pages/                 # Pages (Dashboard, Analysis, Results, History, Compare, Architecture)
│   ├── services/              # API Client & PDF Generator
│   ├── types/                 # TypeScript Interfaces
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
│
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

## 🚀 How to Run in VS Code (Local Setup)

### Step 1: Open the Project in VS Code
Open the root directory in VS Code:
```bash
code .
```

---

### Step 2: Start the Python Backend (FastAPI)

1. Open a new terminal in VS Code:
```bash
cd backend
```

2. Create and activate a Python virtual environment:
```bash
# On macOS/Linux:
python3 -m venv venv
source venv/bin/activate

# On Windows:
python -m venv venv
venv\Scripts\activate
```

3. Install required Python packages:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python run.py
```
- The FastAPI backend will start at: `http://127.0.0.1:8000`
- Interactive Swagger API Documentation: `http://127.0.0.1:8000/docs`

---

### Step 3: Start the React Frontend

1. Open a second terminal in VS Code:
```bash
# In the root directory:
npm install
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000
```

---

## 🧪 Alzheimer's 4-Stage Classification Schema

| Stage | Clinical Dementia Rating (CDR) | Key Neuropathological Hallmark |
|---|---|---|
| **Non-Demented** | CDR 0 | Intact hippocampal volume, preserved cortical mantle |
| **Very Mild Dementia** | CDR 0.5 (MCI) | Early CA1 hippocampal volume reduction, subjective memory impairment |
| **Mild Dementia** | CDR 1.0 | Evident entorhinal cortex thinning, episodic memory deficit |
| **Moderate Dementia** | CDR 2.0 | Pronounced lateral ventriculomegaly, multi-domain cognitive decline |

---

## 📑 REST API Documentation

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck & system status |
| `GET` | `/api/dashboard` | Aggregated metrics, cohort statistics & recent analyses |
| `POST` | `/api/analyze` | `POST` | `/api/analyze` | Execute the complete AI analysis pipeline on an uploaded MRI scan  |
| `GET` | `/api/patients` | Retrieve list of registered patients |
| `POST` | `/api/patients` | Register a new patient record |
| `GET` | `/api/history/{patient_id}` | Retrieve patient's longitudinal MRI scan timeline |
| `POST` | `/api/compare` | Compute volumetric progression between baseline & follow-up |


---

## ⚕️ Research & Medical Disclaimer

*AlzVision-X is an academic research prototype developed for educational and experimental demonstration of hybrid deep learning (CNN + Vision Transformer) and agentic workflow orchestration. It is not approved as an FDA/CE medical diagnostic device. All clinical decisions must be validated by qualified healthcare professionals.*
