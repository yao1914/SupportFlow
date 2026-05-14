from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import torch
import torch.nn as nn
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import os
from huggingface_hub import snapshot_download

app = FastAPI(title="SupportFlow ML Service")

# Allow requests from the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://0.0.0.0:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Label Mappings ---
# Priority: P1 = highest urgency, P3 = lowest
PRIORITY_CLASSES = {0: "high", 1: "medium", 2: "low"}

# Department: Maps model output index to frontend internal keys
DEPT_CLASSES = {
    0: "billing_payments",
    1: "customer_service",
    2: "it_technical",
    3: "product_support",
}

# --- Paths and Auto-Download Logic ---
BASE_DIR = os.path.dirname(__file__)

# 1. Check if running locally (where models/ is next to backend/)
if os.path.exists(os.path.join(BASE_DIR, "..", "models", "xlmr_priority_model.pt")):
    MODEL_DIR = os.path.join(BASE_DIR, "..", "models")
# 2. Check if running in Docker (where models/ is inside backend/)
elif os.path.exists(os.path.join(BASE_DIR, "models", "xlmr_priority_model.pt")):
    MODEL_DIR = os.path.join(BASE_DIR, "models")
# 3. If models are completely missing (e.g. running on Hugging Face Spaces for the first time)
else:
    print("Models not found locally. Downloading from Yao1914/supportflow-weights...")
    # Because the user uploaded the 'models/' folder itself into HF, 
    # downloading to BASE_DIR will automatically create BASE_DIR/models/...
    snapshot_download(
        repo_id="Yao1914/supportflow-weights",
        local_dir=BASE_DIR,
        allow_patterns=["models/*"]
    )
    MODEL_DIR = os.path.join(BASE_DIR, "models")

TOKENIZER_PATH = os.path.join(MODEL_DIR, "xlm_tokenizer")
PRIORITY_MODEL_PATH = os.path.join(MODEL_DIR, "xlmr_priority_model.pt")
ROUTING_MODEL_PATH = os.path.join(MODEL_DIR, "xlmr_routing_model.pt")

# --- Global model references ---
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
tokenizer = None
priority_model = None
routing_model = None


def map_state_dict_keys(state_dict: dict) -> dict:
    """
    Map custom checkpoint keys to HuggingFace-compatible keys.
    1. 'xlmr.' prefix -> 'roberta.' (base model)
    2. 'classifier.' prefix -> 'classifier.layers.' (custom Sequential wrapped in CLSClassificationHead)
    """
    new_sd = {}
    for key, value in state_dict.items():
        new_key = key
        if key.startswith("xlmr."):
            new_key = "roberta." + key[len("xlmr."):]
        elif key.startswith("classifier."):
            new_key = "classifier.layers." + key[len("classifier."):]
        new_sd[new_key] = value
    return new_sd


class CLSClassificationHead(nn.Module):
    """
    Wrapper that extracts the CLS token (index 0) from the full sequence output
    before passing it through the custom Sequential classifier layers.
    
    This is needed because XLMRobertaForSequenceClassification passes the full
    [batch, seq_len, 768] tensor to self.classifier, but our Sequential layers
    expect [batch, 768] input.
    """
    def __init__(self, layers: nn.Sequential):
        super().__init__()
        self.layers = layers

    def forward(self, features, **kwargs):
        # Extract CLS token representation (first token)
        x = features[:, 0, :]
        x = self.layers(x)
        return x


def build_priority_classifier():
    """
    Reconstruct the exact custom classifier architecture used during
    priority model training: Dropout -> Linear(768,256) -> Tanh -> Dropout -> Linear(256,3)
    """
    layers = nn.Sequential(
        nn.Dropout(0.1),
        nn.Linear(768, 256),
        nn.Tanh(),
        nn.Dropout(0.1),
        nn.Linear(256, 3),
    )
    return CLSClassificationHead(layers)


def build_routing_classifier():
    """
    Reconstruct the exact custom classifier architecture used during
    routing model training: Dropout -> Linear(768,512) -> Tanh -> Dropout -> Linear(512,256) -> Tanh -> Dropout -> Linear(256,4)
    """
    layers = nn.Sequential(
        nn.Dropout(0.1),
        nn.Linear(768, 512),
        nn.Tanh(),
        nn.Dropout(0.1),
        nn.Linear(512, 256),
        nn.Tanh(),
        nn.Dropout(0.1),
        nn.Linear(256, 4),
    )
    return CLSClassificationHead(layers)


# --- Load models on startup ---
try:
    print("Loading ML models... This may take a minute.")

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(TOKENIZER_PATH)
    print("Tokenizer loaded.")

    # --- Priority Model ---
    print("Initializing Priority model skeleton...")
    priority_model = AutoModelForSequenceClassification.from_pretrained(
        "xlm-roberta-base", num_labels=3
    )
    priority_model.classifier = build_priority_classifier()

    prio_checkpoint = torch.load(PRIORITY_MODEL_PATH, map_location=device)
    prio_state_dict = prio_checkpoint.get("model_state_dict", prio_checkpoint)
    priority_model.load_state_dict(map_state_dict_keys(prio_state_dict), strict=False)
    priority_model.to(device)
    priority_model.eval()
    print("Priority model loaded successfully.")

    # --- Routing/Department Model ---
    print("Initializing Routing model skeleton...")
    routing_model = AutoModelForSequenceClassification.from_pretrained(
        "xlm-roberta-base", num_labels=4
    )
    routing_model.classifier = build_routing_classifier()

    rout_checkpoint = torch.load(ROUTING_MODEL_PATH, map_location=device)
    rout_state_dict = rout_checkpoint.get("model_state_dict", rout_checkpoint)
    routing_model.load_state_dict(map_state_dict_keys(rout_state_dict), strict=False)
    routing_model.to(device)
    routing_model.eval()
    print("Routing model loaded successfully.")

    print(f"All models loaded on device: {device}")

except Exception as e:
    print(f"Error loading models: {e}")
    import traceback
    traceback.print_exc()


# --- API Schemas ---
class TicketInput(BaseModel):
    subject: str
    description: str


class PredictionOutput(BaseModel):
    priority: str
    department: str
    confidence: dict


# --- Prediction Endpoint ---
@app.post("/predict", response_model=PredictionOutput)
async def predict_ticket(ticket: TicketInput):
    """
    Accepts a ticket subject + description, runs both XLM-RoBERTa models,
    and returns predicted priority, department, and confidence scores.
    """
    # Fallback if models failed to load
    if not tokenizer or not priority_model or not routing_model:
        print("Warning: Models not loaded. Returning fallback prediction.")
        return PredictionOutput(
            priority="medium",
            department="customer_service",
            confidence={"priority": 0.0, "department": 0.0},
        )

    try:
        # Combine subject and description as the model input
        text = f"{ticket.subject} {ticket.description}"

        # Tokenize
        inputs = tokenizer(
            text, return_tensors="pt", truncation=True, max_length=512, padding=True
        )
        inputs = {k: v.to(device) for k, v in inputs.items()}

        with torch.no_grad():
            # Priority prediction
            prio_outputs = priority_model(**inputs)
            prio_logits = prio_outputs.logits
            prio_probs = F.softmax(prio_logits, dim=-1)
            prio_pred = torch.argmax(prio_probs, dim=-1).item()
            prio_conf = prio_probs[0][prio_pred].item()

            # Department prediction
            dept_outputs = routing_model(**inputs)
            dept_logits = dept_outputs.logits
            dept_probs = F.softmax(dept_logits, dim=-1)
            dept_pred = torch.argmax(dept_probs, dim=-1).item()
            dept_conf = dept_probs[0][dept_pred].item()

        predicted_priority = PRIORITY_CLASSES.get(prio_pred, "medium")
        predicted_department = DEPT_CLASSES.get(dept_pred, "customer_service")

        print(f"Input: '{text[:80]}...' -> Priority: {predicted_priority} ({prio_conf:.2%}), Dept: {predicted_department} ({dept_conf:.2%})")

        return PredictionOutput(
            priority=predicted_priority,
            department=predicted_department,
            confidence={"priority": round(prio_conf, 4), "department": round(dept_conf, 4)},
        )

    except Exception as e:
        print(f"Prediction error: {e}")
        import traceback
        traceback.print_exc()
        return PredictionOutput(
            priority="medium",
            department="customer_service",
            confidence={"priority": 0.0, "department": 0.0},
        )


@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "models_loaded": priority_model is not None and routing_model is not None,
        "device": str(device),
    }
