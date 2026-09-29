from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import pandas as pd
import joblib
import sqlite3
import hashlib
import secrets
import json
import re

from pathlib import Path
from datetime import datetime


# ============================================================
# APP
# ============================================================

app = FastAPI(
    title="MedAssist AI",
    description="AI-Powered Medical Symptom Analysis and Disease Prediction Platform",
    version="1.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)


# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_PATH = BASE_DIR / "models" / "disease_prediction_model.joblib"
LABEL_ENCODER_PATH = BASE_DIR / "models" / "disease_label_encoder.joblib"
FEATURE_COLUMNS_PATH = BASE_DIR / "models" / "disease_feature_columns.joblib"

DB_PATH = BASE_DIR / "medassist.db"


# ============================================================
# LOAD MODEL
# ============================================================

try:
    model = joblib.load(MODEL_PATH)
    disease_encoder = joblib.load(LABEL_ENCODER_PATH)
    FEATURE_COLUMNS = joblib.load(FEATURE_COLUMNS_PATH)

    print("Disease prediction model loaded successfully.")
    print("Disease label encoder loaded successfully.")
    print("Number of model features:", len(FEATURE_COLUMNS))

except Exception as e:
    print("Error loading model:", e)

    model = None
    disease_encoder = None
    FEATURE_COLUMNS = []


# ============================================================
# PATIENT INPUT
# ============================================================

class PatientInput(BaseModel):

    user_id: int = 1

    fever: int = 0
    cough: int = 0
    fatigue: int = 0
    difficulty_breathing: int = 0

    age: int = Field(default=30, ge=0, le=120)

    gender: int = 0
    blood_pressure: int = 0
    cholesterol_level: int = 0

    general_health: int = 3
    physical_health_days: int = 0

    stroke_history: int = 0
    asthma_history: int = 0
    diabetes_history: int = 0
    copd_history: int = 0
    kidney_disease: int = 0
    arthritis: int = 0

    smoker: int = 0
    exercise: int = 1

    symptoms: dict[str, int] = Field(default_factory=dict)


# ============================================================
# DATABASE
# ============================================================

def get_db():

    connection = sqlite3.connect(DB_PATH)
    connection.row_factory = sqlite3.Row

    return connection


def create_tables():

    connection = get_db()
    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS predictions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            predicted_disease TEXT,
            confidence_score REAL,
            risk_level TEXT,
            assessment_date TEXT,
            age INTEGER,
            gender INTEGER,
            fever INTEGER DEFAULT 0,
            cough INTEGER DEFAULT 0,
            fatigue INTEGER DEFAULT 0,
            difficulty_breathing INTEGER DEFAULT 0,
            disease_probabilities TEXT,
            risk_score INTEGER DEFAULT 0,
            severity TEXT,
            disease TEXT,
            probability REAL,
            top_3_predictions TEXT,
            symptoms TEXT,
            created_at TEXT
        )
    """)

    connection.commit()
    connection.close()


create_tables()


# ============================================================
# PASSWORD FUNCTIONS
# ============================================================

def hash_password(password):

    salt = secrets.token_hex(16)

    password_hash = hashlib.sha256(
        (salt + password).encode()
    ).hexdigest()

    return salt + ":" + password_hash


def verify_password(password, stored_password):

    try:
        salt, stored_hash = stored_password.split(":")

        password_hash = hashlib.sha256(
            (salt + password).encode()
        ).hexdigest()

        return password_hash == stored_hash

    except Exception:

        return False


# ============================================================
# RISK SCORE
# ============================================================

def calculate_risk_score(patient):

    score = 0

    if patient.general_health >= 4:
        score += 2

    if patient.physical_health_days >= 14:
        score += 2

    if patient.stroke_history == 1:
        score += 3

    if patient.asthma_history == 1:
        score += 1

    if patient.diabetes_history == 1:
        score += 2

    if patient.copd_history == 1:
        score += 2

    if patient.kidney_disease == 1:
        score += 2

    if patient.arthritis == 1:
        score += 1

    if patient.smoker == 1:
        score += 2

    if patient.exercise == 0:
        score += 1

    if patient.fever == 1:
        score += 1

    if patient.cough == 1:
        score += 1

    if patient.fatigue == 1:
        score += 1

    if patient.difficulty_breathing == 1:
        score += 2

    if patient.age >= 65:
        score += 2

    elif patient.age >= 45:
        score += 1

    if score <= 4:
        risk_level = "Low"

    elif score <= 7:
        risk_level = "Medium"

    else:
        risk_level = "High"

    return score, risk_level


# ============================================================
# SEVERITY
# ============================================================

def calculate_severity(patient):

    score = 0

    if patient.fever == 1:
        score += 1

    if patient.cough == 1:
        score += 1

    if patient.fatigue == 1:
        score += 1

    if patient.difficulty_breathing == 1:
        score += 2

    if score <= 1:
        return "Low"

    elif score <= 3:
        return "Medium"

    else:
        return "High"


# ============================================================
# NORMALIZE SYMPTOM NAMES
# ============================================================

def normalize_symptom_name(name):

    return re.sub(
        r"[^a-z0-9]",
        "",
        str(name).lower()
    )


# ============================================================
# BUILD MODEL INPUT
# ============================================================

def build_model_input(patient):

    input_values = {
        column: 0
        for column in FEATURE_COLUMNS
    }

    feature_lookup = {
        normalize_symptom_name(column): column
        for column in FEATURE_COLUMNS
    }

    # Symptoms from the symptoms dictionary
    for symptom_name, value in patient.symptoms.items():

        normalized = normalize_symptom_name(symptom_name)

        if normalized in feature_lookup:

            real_column = feature_lookup[normalized]

            input_values[real_column] = (
                1 if int(value) == 1 else 0
            )

    # Existing frontend symptom fields
    legacy_symptoms = {
        "fever": patient.fever,
        "cough": patient.cough,
        "fatigue": patient.fatigue,
        "difficulty breathing": patient.difficulty_breathing
    }

    for symptom_name, value in legacy_symptoms.items():

        normalized = normalize_symptom_name(symptom_name)

        if normalized in feature_lookup:

            real_column = feature_lookup[normalized]

            input_values[real_column] = (
                1 if int(value) == 1 else 0
            )

    return pd.DataFrame(
        [input_values],
        columns=FEATURE_COLUMNS
    )


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {
        "message": "MedAssist AI Backend is running!",
        "status": "success",
        "model_features": len(FEATURE_COLUMNS)
    }


# ============================================================
# REGISTER
# ============================================================

class RegisterInput(BaseModel):

    username: str
    password: str


@app.post("/register")
def register(data: RegisterInput):

    connection = get_db()
    cursor = connection.cursor()

    try:

        password_hash = hash_password(data.password)

        cursor.execute(
            """
            INSERT INTO users
            (username, password_hash, created_at)
            VALUES (?, ?, ?)
            """,
            (
                data.username,
                password_hash,
                datetime.now().isoformat()
            )
        )

        connection.commit()

        user_id = cursor.lastrowid

        return {
            "message": "Registration successful",
            "user_id": user_id
        }

    except sqlite3.IntegrityError:

        raise HTTPException(
            status_code=400,
            detail="Username already exists"
        )

    finally:

        connection.close()


# ============================================================
# LOGIN
# ============================================================

class LoginInput(BaseModel):

    username: str
    password: str


@app.post("/login")
def login(data: LoginInput):

    connection = get_db()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM users
        WHERE username = ?
        """,
        (data.username,)
    )

    user = cursor.fetchone()

    connection.close()

    if user is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    if not verify_password(
        data.password,
        user["password_hash"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    return {
        "message": "Login successful",
        "user_id": user["id"],
        "username": user["username"]
    }


# ============================================================
# PREDICT
# ============================================================

@app.post("/predict")
def predict_disease(patient: PatientInput):

    if (
        model is None
        or disease_encoder is None
        or not FEATURE_COLUMNS
    ):

        raise HTTPException(
            status_code=500,
            detail="Prediction model is not loaded"
        )

    try:

        input_data = build_model_input(patient)

        print("\nInput sent to model:")
        print("Number of features:", len(input_data.columns))

        probabilities = model.predict_proba(input_data)[0]

        model_classes = model.classes_

        top_index = probabilities.argmax()

        predicted_class = model_classes[top_index]

        probability = float(probabilities[top_index])

        disease = disease_encoder.inverse_transform(
            [int(predicted_class)]
        )[0]

        probability_percentage = round(
            probability * 100,
            2
        )

        # TOP 3
        top_indices = probabilities.argsort()[-3:][::-1]

        top_predictions = []

        for index in top_indices:

            class_id = model_classes[index]

            disease_name = disease_encoder.inverse_transform(
                [int(class_id)]
            )[0]

            disease_probability = round(
                float(probabilities[index]) * 100,
                2
            )

            top_predictions.append({
                "disease": disease_name,
                "probability": disease_probability
            })

        # Severity
        severity = calculate_severity(patient)

        # Risk
        risk_score, risk_level = calculate_risk_score(patient)

        # Symptoms
        symptoms = dict(patient.symptoms)

        symptoms.update({
            "fever": patient.fever,
            "cough": patient.cough,
            "fatigue": patient.fatigue,
            "difficulty_breathing":
                patient.difficulty_breathing
        })

        # Save prediction
        connection = get_db()
        cursor = connection.cursor()

        cursor.execute(
            """
            INSERT INTO predictions
            (
                user_id,
                predicted_disease,
                confidence_score,
                risk_level,
                assessment_date,
                age,
                gender,
                fever,
                cough,
                fatigue,
                difficulty_breathing,
                disease_probabilities,
                risk_score,
                severity,
                disease,
                probability,
                top_3_predictions,
                symptoms,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                patient.user_id,
                disease,
                probability_percentage,
                risk_level,
                datetime.now().isoformat(),
                patient.age,
                patient.gender,
                patient.fever,
                patient.cough,
                patient.fatigue,
                patient.difficulty_breathing,
                json.dumps(top_predictions),
                risk_score,
                severity,
                disease,
                probability_percentage,
                json.dumps(top_predictions),
                json.dumps(symptoms),
                datetime.now().isoformat()
            )
        )

        connection.commit()

        prediction_id = cursor.lastrowid

        connection.close()

        return {
            "prediction_id": prediction_id,
            "predicted_disease": disease,
            "probability": probability_percentage,
            "severity": severity,
            "risk_score": risk_score,
            "risk_level": risk_level,
            "top_3_predictions": top_predictions
        }

    except Exception as e:

        print("Prediction error:", str(e))

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


# ============================================================
# REPORT
# ============================================================

@app.get("/report/{prediction_id}")
def get_report(prediction_id: int):

    connection = get_db()
    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM predictions
        WHERE id = ?
        """,
        (prediction_id,)
    )

    prediction = cursor.fetchone()

    connection.close()

    if prediction is None:

        raise HTTPException(
            status_code=404,
            detail="Prediction report not found"
        )

    report = dict(prediction)

    if report.get("top_3_predictions"):

        report["top_3_predictions"] = json.loads(
            report["top_3_predictions"]
        )

    else:

        report["top_3_predictions"] = []

    if report.get("symptoms"):

        report["symptoms"] = json.loads(
            report["symptoms"]
        )

    else:

        report["symptoms"] = {}

    return {
        "report_id": report["id"],
        "user_id": report["user_id"],
        "predicted_disease": report["predicted_disease"],
        "probability": report["confidence_score"],
        "severity": report["severity"],
        "risk_score": report["risk_score"],
        "risk_level": report["risk_level"],
        "age": report["age"],
        "gender": report["gender"],
        "symptoms": report["symptoms"],
        "top_3_predictions": report["top_3_predictions"],
        "assessment_date": report["assessment_date"]
    }