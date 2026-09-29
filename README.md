\# MedAssist-AI



\## Intelligent Symptom Analysis, Disease Prediction and Population Health Analytics System



MedAssist-AI is an educational machine learning and healthcare web application that analyzes patient symptoms and profile information to predict a possible health condition and display an experimental health risk assessment.



Developed as part of the Infosys Springboard 7.0 Internship Program.



> \*\*Disclaimer:\*\* This project is for educational and demonstration purposes only. It is not a medical diagnostic tool.



\## Key Features



\- Machine Learning-Based Disease Prediction

\- Experimental Health Risk Assessment

\- Medical Recommendations and Precautions

\- PDF Health Summary Report

\- Healthcare Analytics Dashboard

\- Patient Assessment History

\- Patient Registration and Login

\- SQLite Database

\- FastAPI REST API

\- React and Vite Frontend

\- Docker and Docker Compose



\## Technology Stack



\### Backend



\- Python 3.10

\- FastAPI

\- Uvicorn

\- Scikit-learn

\- XGBoost

\- Pandas

\- NumPy

\- Joblib

\- SQLite



\### Frontend



\- React.js

\- Vite

\- Chart.js

\- Axios

\- jsPDF

\- html2canvas



\### DevOps and Tools



\- Docker

\- Docker Compose

\- Git

\- GitHub



\## Dataset



The project uses the Disease Symptom and Patient Profile Dataset.



The dataset contains symptom, demographic, and health-related information used for model development.



\### Input Features



\- Fever

\- Cough

\- Fatigue

\- Difficulty Breathing

\- Age

\- Gender

\- Blood Pressure

\- Cholesterol Level



\### Data Preprocessing



\- Loaded the dataset from a CSV file.

\- Removed duplicate records.

\- Checked for missing values.

\- Encoded symptom and categorical inputs for model processing.



The cleaned dataset contains 300 records and 10 columns.



\## Machine Learning



The application uses a trained machine learning model to predict a possible disease based on the provided patient information.



The model returns a predicted condition and a confidence score.



\### Experimental Model Evaluation



\- Reported holdout accuracy: \*\*57.14%\*\*

\- Test set size: \*\*14 records\*\*

\- Evaluation results are limited by the small test set and may be unstable.



The reported accuracy is an experimental result, not evidence of clinical performance. Prediction confidence and risk categories have not been clinically validated.



\## System Architecture



```text

&#x20;                 User

&#x20;                  |

&#x20;                  v

&#x20;            React Frontend

&#x20;                  |

&#x20;                  v

&#x20;            FastAPI Backend

&#x20;                  |

&#x20;         +--------+--------+

&#x20;         |                 |

&#x20;         v                 v

&#x20;  ML Prediction       SQLite Database

&#x20;         |

&#x20;         v

&#x20;  Risk Assessment

&#x20;         |

&#x20;         v

&#x20;Medical Recommendations

&#x20;         |

&#x20;         v

&#x20;  Results and PDF Report



&#x20;      Analytics Dashboard

&#x20;              |

&#x20;              v

&#x20;         FastAPI API



## Week 1: Disease Prediction and Risk Assessment

### Day 1: Dataset and Preprocessing

* Loaded the Disease Symptoms and Patient Profile Dataset from Kaggle.
* Removed duplicate records.
* Checked for missing values.
* Encoded categorical features.

### Day 2: Disease Prediction

* Developed a Random Forest disease prediction model.
* Generated disease predictions and probability scores.
* Saved the trained model.

### Day 3: Risk Assessment

* Implemented disease severity levels.
* Added patient risk assessment.
* Generated risk scores and risk levels.

### Day 4: Patient Report API

* Developed a REST API using FastAPI.
* Created the `/report/{patient_id}` endpoint.
* Included patient details, disease predictions, severity, and risk assessment.

### Day 5: Testing and Documentation

* Tested the patient report API using Swagger UI.
* Verified successful and unsuccessful patient report requests.
* Documented the API testing results.

## Patient Report API Testing

**Endpoint:** `GET /report/{patient_id}`

**Successful request:** `GET /report/1`

**Response:** `200 OK`

**Invalid request:** `GET /report/999`

**Response:** `404 Not Found`

Example error:

```json
{
  "detail": "Patient not found"
}
```

| Patient ID | HTTP Status   | Result |
| ---------- | ------------- | ------ |
| 1          | 200 OK        | Passed |
| 999        | 404 Not Found | Passed |
