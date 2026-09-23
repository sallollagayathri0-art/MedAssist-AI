
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import pandas as pd
import joblib
import sqlite3
import hashlib
import secrets
from pathlib import Path
from datetime import datetime

app = FastAPI(title="MedAssist-AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH = BASE_DIR / "models" / "disease_prediction_model.pkl"
DISEASES_PATH = BASE_DIR / "models" / "label_encoder.pkl"
DB_PATH = BASE_DIR / "medassist.db"

model = joblib.load(MODEL_PATH)
diseases = joblib.load(DISEASES_PATH)

FEATURE_COLUMNS = [
    "Fever",
    "Cough",
    "Fatigue",
    "Difficulty Breathing",
    "Age",
    "Gender",
    "Blood Pressure",
    "Cholesterol Level",
]


class PatientInput(BaseModel):
    user_id: int = Field(gt=0)
    fever: int = Field(ge=0, le=1)
    cough: int = Field(ge=0, le=1)
    fatigue: int = Field(ge=0, le=1)
    difficulty_breathing: int = Field(ge=0, le=1)
    age: int = Field(ge=0, le=120)
    gender: int = Field(ge=0, le=1)
    blood_pressure: int = Field(ge=0, le=2)
    cholesterol_level: int = Field(ge=0, le=2)


class RegisterInput(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=6, max_length=128)


class LoginInput(BaseModel):
    email: str
    password: str


def get_connection():
    return sqlite3.connect(DB_PATH)


def hash_password(password: str, salt: str) -> str:
    return hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()


def create_tables():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name VARCHAR,
                email VARCHAR UNIQUE,
                password VARCHAR
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS predictions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                predicted_disease TEXT NOT NULL,
                confidence_score REAL NOT NULL,
                risk_level TEXT NOT NULL,
                assessment_date TEXT DEFAULT CURRENT_TIMESTAMP,
                age INTEGER,
                gender INTEGER,
                fever INTEGER DEFAULT 0,
                cough INTEGER DEFAULT 0,
                fatigue INTEGER DEFAULT 0,
                difficulty_breathing INTEGER DEFAULT 0,
                user_id INTEGER REFERENCES users(id)
            )
        """)

        columns = {
            row[1]
            for row in conn.execute(
                "PRAGMA table_info(predictions)"
            ).fetchall()
        }

        migrations = {
            "assessment_date": "TEXT",
            "age": "INTEGER",
            "gender": "INTEGER",
            "fever": "INTEGER DEFAULT 0",
            "cough": "INTEGER DEFAULT 0",
            "fatigue": "INTEGER DEFAULT 0",
            "difficulty_breathing": "INTEGER DEFAULT 0",
            "user_id": "INTEGER REFERENCES users(id)"
        }

        for column, column_type in migrations.items():
            if column not in columns:
                conn.execute(
                    f"ALTER TABLE predictions "
                    f"ADD COLUMN {column} {column_type}"
                )

        conn.execute("""
            UPDATE predictions
            SET assessment_date = CURRENT_TIMESTAMP
            WHERE assessment_date IS NULL
        """)


create_tables()


def check_user_exists(user_id: int):
    with get_connection() as conn:
        user = conn.execute(
            "SELECT id FROM users WHERE id = ?",
            (user_id,)
        ).fetchone()

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="Patient account not found."
        )


@app.get("/")
def home():
    return {
        "message": "MedAssist-AI Backend is running!",
        "model_file": str(MODEL_PATH),
        "number_of_diseases": len(diseases),
        "diseases": diseases
    }


@app.post("/register")
def register(data: RegisterInput):
    name = data.name.strip()
    email = data.email.strip().lower()

    if not name or "@" not in email or "." not in email:
        raise HTTPException(
            status_code=400,
            detail="Please enter a valid name and email."
        )

    salt = secrets.token_hex(16)
    password_hash = salt + ":" + hash_password(
        data.password,
        salt
    )

    try:
        with get_connection() as conn:
            existing = conn.execute(
                "SELECT id FROM users WHERE email = ?",
                (email,)
            ).fetchone()

            if existing:
                raise HTTPException(
                    status_code=409,
                    detail="This email is already registered."
                )

            cursor = conn.execute(
                """
                INSERT INTO users (name, email, password)
                VALUES (?, ?, ?)
                """,
                (name, email, password_hash)
            )

            user_id = cursor.lastrowid

        return {
            "id": user_id,
            "name": name,
            "email": email,
            "message": "Registration successful."
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.post("/login")
def login(data: LoginInput):
    email = data.email.strip().lower()

    with get_connection() as conn:
        user = conn.execute(
            """
            SELECT id, name, email, password
            FROM users
            WHERE email = ?
            """,
            (email,)
        ).fetchone()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    user_id, name, saved_email, saved_password = user

    if saved_password and ":" in saved_password:
        salt, saved_hash = saved_password.split(":", 1)
        entered_hash = hash_password(data.password, salt)

        if not secrets.compare_digest(
            entered_hash,
            saved_hash
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password."
            )

    elif saved_password != data.password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return {
        "id": user_id,
        "name": name,
        "email": saved_email,
        "message": "Login successful."
    }


@app.post("/predict")
def predict(data: PatientInput):
    try:
        check_user_exists(data.user_id)

        input_data = pd.DataFrame([{
            "Fever": data.fever,
            "Cough": data.cough,
            "Fatigue": data.fatigue,
            "Difficulty Breathing": data.difficulty_breathing,
            "Age": data.age,
            "Gender": data.gender,
            "Blood Pressure": data.blood_pressure,
            "Cholesterol Level": data.cholesterol_level,
        }], columns=FEATURE_COLUMNS)

        probabilities = model.predict_proba(input_data)[0]
        predicted_index = int(probabilities.argmax())

        if predicted_index >= len(diseases):
            raise HTTPException(
                status_code=500,
                detail="Model output does not match disease list."
            )

        predicted_disease = diseases[predicted_index]
        confidence = round(
            float(probabilities[predicted_index]) * 100,
            2
        )

        if confidence >= 70:
            risk_level = "High"
        elif confidence >= 40:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        assessment_date = datetime.now().strftime(
            "%Y-%m-%d %H:%M:%S"
        )

        with get_connection() as conn:
            cursor = conn.execute(
                """
                INSERT INTO predictions (
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
                    user_id
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    predicted_disease,
                    confidence,
                    risk_level,
                    assessment_date,
                    data.age,
                    data.gender,
                    data.fever,
                    data.cough,
                    data.fatigue,
                    data.difficulty_breathing,
                    data.user_id
                )
            )

            prediction_id = cursor.lastrowid

        return {
            "id": prediction_id,
            "user_id": data.user_id,
            "predicted_disease": predicted_disease,
            "confidence_score": confidence,
            "risk_level": risk_level,
            "assessment_date": assessment_date,
            "age": data.age,
            "gender": data.gender,
            "notice": (
                "Experimental model output only; "
                "not a medical diagnosis. "
                "Confidence and risk labels are not "
                "clinically validated."
            )
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/history")
def history(user_id: int = Query(gt=0)):
    try:
        check_user_exists(user_id)

        with get_connection() as conn:
            conn.row_factory = sqlite3.Row

            rows = conn.execute(
                """
                SELECT
                    id,
                    assessment_date,
                    age,
                    gender,
                    predicted_disease,
                    confidence_score,
                    risk_level
                FROM predictions
                WHERE user_id = ?
                ORDER BY id DESC
                """,
                (user_id,)
            ).fetchall()

        return {
            "history": [dict(row) for row in rows]
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )


@app.get("/analytics")
def analytics(user_id: int = Query(gt=0)):
    try:
        check_user_exists(user_id)

        with get_connection() as conn:
            conn.row_factory = sqlite3.Row

            rows = conn.execute(
                """
                SELECT
                    risk_level,
                    fever,
                    cough,
                    fatigue,
                    difficulty_breathing
                FROM predictions
                WHERE user_id = ?
                """,
                (user_id,)
            ).fetchall()

        risk_distribution = {
            "Low": 0,
            "Medium": 0,
            "High": 0
        }

        top_symptoms = {
            "Fever": 0,
            "Cough": 0,
            "Fatigue": 0,
            "Difficulty Breathing": 0
        }

        for row in rows:
            risk = row["risk_level"]

            if risk in risk_distribution:
                risk_distribution[risk] += 1

            if row["fever"] == 1:
                top_symptoms["Fever"] += 1

            if row["cough"] == 1:
                top_symptoms["Cough"] += 1

            if row["fatigue"] == 1:
                top_symptoms["Fatigue"] += 1

            if row["difficulty_breathing"] == 1:
                top_symptoms["Difficulty Breathing"] += 1

        return {
            "risk_distribution": risk_distribution,
            "top_symptoms": top_symptoms,
            "total_assessments": len(rows),
            "model_accuracy": 57.14,
            "accuracy_note": (
                "Experimental holdout accuracy from a test "
                "set of 14 records. This small result is "
                "unstable and is not clinical validation."
            ),
            "note": (
                "Risk and symptom counts are calculated "
                "from this patient's saved assessments. "
                "Risk labels are not clinically validated."
            )
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )