from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import datetime

# --- DATABASE SETUP ---
DATABASE_URL = "sqlite:///./medassist.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class PatientRecord(Base):
    __tablename__ = "patient_records"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    age = Column(Integer)
    gender = Column(String)
    predicted_disease = Column(String)
    confidence_score = Column(Float)
    risk_level = Column(String)

Base.metadata.create_all(bind=engine)

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- FASTAPI APP ---
app = FastAPI(title="MedAssist AI API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load('models/disease_prediction_model.pkl')
label_encoder = joblib.load('models/label_encoder.pkl')

class SymptomInput(BaseModel):
    fever: int                # 1 = Yes, 0 = No
    cough: int                # 1 = Yes, 0 = No
    fatigue: int              # 1 = Yes, 0 = No
    difficulty_breathing: int # 1 = Yes, 0 = No
    age: int
    gender: int               # 1 = Male, 0 = Female
    blood_pressure: int       # 0 = Low, 1 = Normal, 2 = High
    cholesterol_level: int    # 0 = Low, 1 = Normal, 2 = High

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

def get_recommendations(disease: str, risk_level: str) -> dict:
    advice = {
        "lifestyle": "Maintain adequate hydration, prioritize 7-8 hours of sleep, and consume a balanced diet.",
        "precautions": "Monitor vital signs daily and avoid heavy physical exertion if experiencing discomfort.",
        "consultation": "Routine follow-up with a primary healthcare physician is recommended."
    }

    if risk_level == "High":
        advice["consultation"] = "⚠️ Urgent: Consult a healthcare professional or emergency department immediately."
        advice["precautions"] = "Restrict physical activity and track changes in breathing or oxygen levels closely."
    elif risk_level == "Medium":
        advice["consultation"] = "Schedule an appointment with a general practitioner for clinical evaluation."

    return advice

@app.get("/")
def read_root():
    return {"status": "success", "message": "MedAssist AI API running!"}

@app.post("/predict")
def predict_disease(data: SymptomInput, db: Session = Depends(get_db)):
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
    
    prediction = model.predict(input_features)[0]
    disease_name = label_encoder.inverse_transform([prediction])[0]
    probabilities = model.predict_proba(input_features)[0]
    confidence = float(np.max(probabilities))
    
    risk_level = evaluate_risk(data)
    recommendations = get_recommendations(disease_name, risk_level)
    
    # Save Prediction Result to SQLite Database
    record = PatientRecord(
        age=data.age,
        gender="Male" if data.gender == 1 else "Female",
        predicted_disease=disease_name,
        confidence_score=round(confidence * 100, 2),
        risk_level=risk_level
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    
    return {
        "id": record.id,
        "predicted_disease": disease_name,
        "confidence_score": round(confidence * 100, 2),
        "risk_level": risk_level,
        "recommendations": recommendations
    }

@app.get("/history")
def get_patient_history(db: Session = Depends(get_db)):
    """Fetch recent diagnostic history logs from database."""
    records = db.query(PatientRecord).order_by(PatientRecord.timestamp.desc()).limit(10).all()
    return records

@app.get("/analytics")
def get_analytics_data():
    return {
        "risk_distribution": {"Low": 45, "Medium": 35, "High": 20},
        "top_symptoms": {"Fever": 120, "Cough": 95, "Fatigue": 140, "Difficulty Breathing": 60},
        "model_accuracy": 92.4
    }