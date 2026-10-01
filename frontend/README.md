# 🩺 MedAssist AI
### AI-Powered Symptom Analysis & Health Assessment

MedAssist AI is an educational healthcare application that uses machine learning to generate experimental disease predictions based on patient symptoms and basic health information. It provides risk categories, general recommendations, patient history, analytics, and downloadable PDF reports.

> **Disclaimer:** This application is an experimental educational project. Its predictions and risk categories are not clinically validated and must not replace professional medical advice or diagnosis.

---

## 🚀 Features

- **User Authentication:** Patient registration and login.
- **Disease Prediction:** Predicts a possible disease using a Random Forest classifier.
- **Risk Assessment:** Assigns Low, Medium, or High risk categories.
- **Recommendations:** Provides general health suggestions and precautions.
- **Patient History:** Stores and displays previous assessments.
- **Analytics Dashboard:** Displays assessment statistics and risk distribution.
- **PDF Reports:** Generates downloadable health assessment reports.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend and machine learning |
| FastAPI | REST API |
| Scikit-learn | Machine learning |
| Random Forest | Disease classification |
| Pandas | Dataset processing |
| SQLite | Database |
| React | Frontend |
| Vite | Frontend development |
| JavaScript | User interface functionality |
| jsPDF | PDF report generation |

---

## 📊 Dataset

The project uses the Disease Symptoms and Patient Profile Dataset from Kaggle.

The dataset includes:
- Disease
- Fever
- Cough
- Fatigue
- Difficulty Breathing
- Age
- Gender
- Blood Pressure
- Cholesterol Level
- Outcome Variable

### Data Preprocessing
- Loaded and explored the dataset.
- Removed duplicate records.
- Checked for missing values.
- Encoded categorical features.
- Prepared the data for model training.

---

## 🧠 Machine Learning

The application uses a Random Forest classifier to predict diseases from patient information.

The model generates:
- Predicted disease
- Prediction confidence score
- Experimental risk category

The predictions are for educational demonstration only and are not clinically validated.

---

## 📅 Internship Progress

### Week 1: Disease Prediction and Risk Assessment

| Day | Task | Status |
|---|---|---|
| Day 1 | Dataset collection and preprocessing | Completed |
| Day 2 | Disease prediction model | Completed |
| Day 3 | Risk assessment | Completed |
| Day 4 | Patient report API | Completed |
| Day 5 | Testing and documentation | Completed |

### Week 2: Integration and Final Demonstration

| Day | Task | Status |
|---|---|---|
| Day 6 | Treatment recommendations | Completed |
| Day 7 | Health reports and downloads | Completed |
| Day 8 | Analytics dashboard and API | Completed |
| Day 9 | Integration and testing | Completed |
| Day 10 | Final documentation and demonstration | In progress |

---

## 🏗️ Project Architecture

The application consists of three main components:

1. **Frontend:** React interface for patient input, assessment results, history, analytics, and reports.
2. **Backend:** FastAPI services for authentication, predictions, risk assessment, recommendations, and analytics.
3. **Database:** SQLite storage for user information and assessment history.

### Application Workflow

1. User logs in.
2. User enters symptoms and health information.
3. The frontend sends the data to the backend.
4. The machine learning model generates a prediction.
5. The backend assigns an experimental risk category.
6. The application displays general recommendations.
7. The assessment is saved in the database.
8. The user can view history, analytics, and download a PDF report.

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | API home |
| POST | `/register` | Register a user |
| POST | `/login` | User login |
| POST | `/predict` | Generate a disease prediction |
| GET | `/history` | Retrieve assessment history |
| GET | `/analytics` | Retrieve assessment statistics |
| GET | `/recommendation` | Get general recommendations |

### API Documentation

FastAPI Swagger UI:

`http://127.0.0.1:8000/docs`

---

## 🧪 Testing

The application was tested using Swagger UI and the frontend.

| Feature | Test Result |
|---|---|
| User login | Passed |
| Health assessment | Passed |
| Disease prediction | Passed |
| Risk assessment | Passed |
| Recommendations | Passed |
| Patient history API | Passed |
| Analytics API | Passed |
| PDF report generation | Passed |

These tests verify the tested application functions. They do not establish clinical accuracy.

---

## 📁 Project Structure

```text
MedAssist-AI/
├── backend/
│   ├── main.py
│   ├── recommendation.py
│   ├── train.py
│   ├── models/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
├── PROJECT_DOCUMENTATION.md
└── README.md