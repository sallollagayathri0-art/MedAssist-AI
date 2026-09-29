# MedAssist AI – Disease Prediction and Risk Assessment

## Project Overview

MedAssist AI is a healthcare application that predicts diseases based on patient symptoms and provides disease severity and risk assessments. It also generates patient reports through a REST API.

## Technologies Used

* Python
* FastAPI
* React
* Vite
* Scikit-learn
* Random Forest Classifier
* Pandas
* SQLite

## Week 1: Disease Prediction and Risk Assessment

### Day 1: Dataset and Preprocessing

* Collected the Disease Symptoms and Patient Profile Dataset from Kaggle.
* Loaded and explored the dataset.
* Removed duplicate records.
* Checked for missing values.
* Encoded categorical features for machine learning.

### Day 2: Disease Prediction

* Developed a disease prediction model using Random Forest.
* Generated disease predictions and probability scores.
* Saved the trained model for use in the application.

### Day 3: Risk Assessment

* Implemented disease severity levels.
* Added patient risk assessment.
* Generated risk scores and risk levels.

### Day 4: Patient Report API

* Developed a REST API using FastAPI.
* Created an endpoint to retrieve patient reports.
* Included patient details, disease predictions, probabilities, severity, and risk assessment.

### Day 5: Testing and Documentation

* Tested the patient report API using Swagger UI.
* Verified successful and unsuccessful patient report requests.
* Documented the API and its test results.

## Patient Report API

**Endpoint:** `GET /report/{patient_id}`

**Example request:**
`GET /report/1`

**Successful response:** `200 OK`

The report includes:

* Patient details
* Disease predictions
* Disease probability scores
* Disease severity
* Risk score
* Risk level

**Invalid patient ID:** `404 Not Found`

Example error:

```json
{
  "detail": "Patient not found"
}
```

## API Testing Results

| Test                     | Result        | Status |
| ------------------------ | ------------- | ------ |
| Valid patient ID (1)     | 200 OK        | Passed |
| Invalid patient ID (999) | 404 Not Found | Passed |

## Project Structure

```text
MedAssist-AI/
├── backend/
├── frontend/
├── dataset/
├── notebooks/
├── MedAssist_AI_Week1_Disease_Prediction.ipynb
├── cleaned_dataset.csv
├── Disease_symptom_and_patient_profile_dataset.csv
└── README.md
```

## Running the Project

### Backend

```bash
cd backend
uvicorn main:app --reload
```

Open Swagger UI:

`http://127.0.0.1:8000/docs`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Disclaimer

This project is an educational prototype. Its predictions and risk assessments are not a substitute for professional medical advice.
