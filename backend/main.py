from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from passlib.context import CryptContext
import datetime


# --- DATABASE SETUP ---
DATABASE_URL = "sqlite:///./medassist.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# --- PASSWORD SECURITY ---
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# --- USER TABLE ---
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)


# --- PATIENT HISTORY TABLE ---
class PatientRecord(Base):
    __tablename__ = "patient_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(
        DateTime,
        default=datetime.datetime.utcnow
    )
    age = Column(Integer)
    gender = Column(String)
    predicted_disease = Column(String)
    confidence_score = Column(Float)
    risk_level = Column(String)


Base.metadata.create_all(bind=engine)


# --- DATABASE DEPENDENCY ---
def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# --- FASTAPI APP ---
app = FastAPI(
    title="MedAssist AI API"
)


# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- LOAD ML MODEL ---
model = joblib.load(
    "models/disease_prediction_model.pkl"
)

label_encoder = joblib.load(
    "models/label_encoder.pkl"
)


# --- REQUEST MODELS ---

class RegisterInput(BaseModel):
    name: str
    email: str
    password: str


class LoginInput(BaseModel):
    email: str
    password: str


class SymptomInput(BaseModel):
    fever: int
    cough: int
    fatigue: int
    difficulty_breathing: int
    age: int
    gender: int
    blood_pressure: int
    cholesterol_level: int


# --- RISK EVALUATION ---
def evaluate_risk(data: SymptomInput) -> str:

    risk_points = 0

    if data.difficulty_breathing == 1:
        risk_points += 3

    if data.fever == 1:
        risk_points += 1

    if data.blood_pressure == 2:
        risk_points += 2

    if data.cholesterol_level == 2:
        risk_points += 1

    if data.age >= 60:
        risk_points += 1

    if risk_points >= 4:
        return "High"

    elif risk_points >= 2:
        return "Medium"

    else:
        return "Low"


# --- RECOMMENDATIONS ---
def get_recommendations(
    disease: str,
    risk_level: str
) -> dict:

    advice = {
        "lifestyle": "Maintain adequate hydration, prioritize 7-8 hours of sleep, and consume a balanced diet.",
        "precautions": "Monitor vital signs daily and avoid heavy physical exertion if experiencing discomfort.",
        "consultation": "Routine follow-up with a primary healthcare physician is recommended."
    }

    if risk_level == "High":

        advice["consultation"] = (
            "⚠️ Urgent: Consult a healthcare professional "
            "or emergency department immediately."
        )

        advice["precautions"] = (
            "Restrict physical activity and track changes "
            "in breathing or oxygen levels closely."
        )

    elif risk_level == "Medium":

        advice["consultation"] = (
            "Schedule an appointment with a general practitioner "
            "for clinical evaluation."
        )

    return advice


# --- ROOT ---
@app.get("/")
def read_root():

    return {
        "status": "success",
        "message": "MedAssist AI API running!"
    }


# --- REGISTER ---
@app.post("/register")
def register_user(
    data: RegisterInput,
    db: Session = Depends(get_db)
):

    existing_user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if existing_user:

        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    hashed_password = pwd_context.hash(
        data.password
    )

    user = User(
        name=data.name,
        email=data.email,
        password=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Registration successful.",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }


# --- LOGIN ---
@app.post("/login")
def login_user(
    data: LoginInput,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    password_correct = pwd_context.verify(
        data.password,
        user.password
    )

    if not password_correct:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    return {
        "message": "Login successful.",
        "user_id": user.id,
        "name": user.name,
        "email": user.email
    }


# --- DISEASE PREDICTION ---
@app.post("/predict")
def predict_disease(
    data: SymptomInput,
    db: Session = Depends(get_db)
):

    input_features = np.array([[
        data.fever,
        data.cough,
        data.fatigue,
        data.difficulty_breathing,
        data.age,
        data.gender,
        data.blood_pressure,
        data.cholesterol_level
    ]])

    prediction = model.predict(
        input_features
    )[0]

    disease_name = label_encoder.inverse_transform(
        [prediction]
    )[0]

    probabilities = model.predict_proba(
        input_features
    )[0]

    confidence = float(
        np.max(probabilities)
    )

    risk_level = evaluate_risk(data)

    recommendations = get_recommendations(
        disease_name,
        risk_level
    )

    record = PatientRecord(
        age=data.age,
        gender="Male" if data.gender == 1 else "Female",
        predicted_disease=disease_name,
        confidence_score=round(
            confidence * 100,
            2
        ),
        risk_level=risk_level
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    return {
        "id": record.id,
        "predicted_disease": disease_name,
        "confidence_score": round(
            confidence * 100,
            2
        ),
        "risk_level": risk_level,
        "recommendations": recommendations
    }


# --- PATIENT HISTORY ---
@app.get("/history")
def get_patient_history(
    db: Session = Depends(get_db)
):

    records = (
        db.query(PatientRecord)
        .order_by(
            PatientRecord.timestamp.desc()
        )
        .limit(10)
        .all()
    )

    return records


# --- ANALYTICS ---
@app.get("/analytics")
def get_analytics_data():

    return {
        "risk_distribution": {
            "Low": 45,
            "Medium": 35,
            "High": 20
        },

        "top_symptoms": {
            "Fever": 120,
            "Cough": 95,
            "Fatigue": 140,
            "Difficulty Breathing": 60
        },

        "model_accuracy": 92.4
    }