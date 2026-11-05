
from pathlib import Path

import joblib
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


# --------------------------------------------------
# 1. APPLICATION CONFIGURATION
# --------------------------------------------------

app = FastAPI(
    title="SpamShield AI",
    description="AI-powered SMS Spam Detection API",
    version="1.0.0"
)


# --------------------------------------------------
# 2. CORS CONFIGURATION
# --------------------------------------------------

import os

FRONTEND_ORIGIN = os.getenv(
    "FRONTEND_ORIGIN",
    "http://localhost:5173"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        FRONTEND_ORIGIN
    ],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"]
)


# --------------------------------------------------
# 3. LOAD TRAINED ML MODEL
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

MODEL_PATH = BASE_DIR / "models" / "sms_spam_model.pkl"

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"Model file not found: {MODEL_PATH}"
    )

model = joblib.load(MODEL_PATH)

print("SpamShield AI model loaded successfully!")


# --------------------------------------------------
# 4. REQUEST VALIDATION
# --------------------------------------------------

class MessageRequest(BaseModel):

    message: str = Field(
        min_length=1,
        max_length=5000,
        description="SMS message to classify"
    )


# --------------------------------------------------
# 5. ROOT ENDPOINT
# --------------------------------------------------

@app.get("/")
def home():

    return {
        "success": True,
        "application": "SpamShield AI",
        "message": "SMS Spam Detection API is running"
    }


# --------------------------------------------------
# 6. HEALTH CHECK
# --------------------------------------------------

@app.get("/api/health")
def health_check():

    return {
        "status": "healthy",
        "model_loaded": model is not None
    }


# --------------------------------------------------
# 7. SMS PREDICTION ENDPOINT
# --------------------------------------------------

@app.post("/api/predict")
def predict_message(data: MessageRequest):

    message = data.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Message cannot be empty"
        )

    try:

        # Predict message category
        prediction = model.predict([message])[0]

        # Get probability estimates
        probabilities = model.predict_proba([message])[0]

        # Get class names
        classifier = model.named_steps["classifier"]

        classes = classifier.classes_

        probability_result = {
            str(label): round(float(probability) * 100, 2)
            for label, probability in zip(
                classes,
                probabilities
            )
        }

        return {
            "success": True,
            "message": message,
            "prediction": str(prediction).upper(),
            "probabilities": probability_result
        }

    except Exception as error:

        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        )


# --------------------------------------------------
# 8. SERVER START MESSAGE
# --------------------------------------------------

@app.on_event("startup")
def startup_event():

    print("===================================")
    print("       SPAMSHIELD AI API")
    print("===================================")
    print("API Server is ready!")
