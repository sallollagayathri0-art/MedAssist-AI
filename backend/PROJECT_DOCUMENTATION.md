# 🩺 MedAssist AI
### AI-Powered Symptom Analysis & Health Assessment System

---

## 1. Project Overview

MedAssist AI is an AI-powered healthcare application designed to analyze patient symptoms and generate experimental disease predictions.

The system combines machine learning with a web-based interface to provide disease predictions, risk assessments, general health recommendations, patient history, analytics, and downloadable health reports.

The application aims to demonstrate how AI and machine learning can support preliminary health information and make patient data easier to review.

---

## 2. Project Objectives

- Develop a machine learning model for symptom-based disease prediction.
- Analyze patient symptoms and basic health information.
- Generate disease prediction confidence scores.
- Categorize assessment results into Low, Medium, and High risk levels.
- Provide general health recommendations based on risk categories.
- Maintain patient assessment history.
- Display health assessment statistics through an analytics dashboard.
- Generate downloadable PDF health reports.

---

## 3. Technologies Used

| Technology | Purpose |
|---|---|
| Python | Backend development and machine learning |
| FastAPI | REST API development |
| Scikit-learn | Disease prediction model |
| Pandas | Dataset processing |
| SQLite | Patient and assessment data storage |
| React | Frontend development |
| Vite | Frontend development server |
| JavaScript | Frontend functionality |
| HTML & CSS | User interface |
| jsPDF | PDF report generation |

---

## 4. Dataset Description

The project uses the **Disease Symptoms and Patient Profile Dataset** obtained from Kaggle.

The dataset contains patient information and symptoms that can be used to train a disease classification model.

### Dataset Attributes

| Attribute | Description |
|---|---|
| Disease | Disease label associated with the record |
| Fever | Indicates whether fever is present |
| Cough | Indicates whether cough is present |
| Fatigue | Indicates whether fatigue is present |
| Difficulty Breathing | Indicates breathing difficulty |
| Age | Patient's age |
| Gender | Patient's gender |
| Blood Pressure | Blood pressure category |
| Cholesterol Level | Cholesterol category |
| Outcome Variable | Dataset outcome field |

### Dataset Preprocessing

The dataset is processed before model training.

- Duplicate records are removed.
- Missing values are checked and handled.
- Categorical values are encoded into numerical values.
- Patient features are prepared for model training.

---

## 5. System Architecture

MedAssist AI follows a frontend-backend architecture with a database and a machine learning model.

### Main Components

**1. Frontend**

The frontend provides an interactive interface where users can:
- Register and log in.
- Enter symptoms and patient information.
- View disease predictions and risk categories.
- Access patient history and analytics.
- Download PDF health reports.

**2. Backend**

The backend is developed using FastAPI. It processes requests from the frontend and performs the following operations:
- User authentication
- Disease prediction
- Risk categorization
- Recommendation generation
- Patient history retrieval
- Analytics processing

**3. Machine Learning Model**

The Random Forest classification model analyzes patient information and generates an experimental disease prediction with a confidence score.

**4. Database**

SQLite is used to store user information and patient assessment records.

### Workflow

1. The user logs into the application.
2. The user enters symptoms and basic health information.
3. The frontend sends the information to the backend.
4. The machine learning model generates a disease prediction.
5. The backend calculates an experimental risk category.
6. General recommendations are displayed.
7. The assessment is stored in the database.
8. The user can view history, analytics, and download a PDF report.

---

## 6. Machine Learning Model

The project uses the **Random Forest Classifier**, a supervised machine learning algorithm.

Random Forest combines predictions from multiple decision trees to produce a classification result.

### Model Workflow

1. Load the disease symptoms dataset.
2. Preprocess the patient data.
3. Encode categorical features.
4. Separate input features and disease labels.
5. Split the dataset into training and testing sets.
6. Train the Random Forest model.
7. Generate disease predictions and confidence scores.
8. Evaluate the model using test data.

The model's predictions are experimental and have not been clinically validated.

---

## 7. Major Modules

### 7.1 User Authentication

The authentication module allows users to register and log in to the application.

It provides access to the health assessment features.

### 7.2 Disease Prediction

The disease prediction module accepts patient symptoms and basic health information.

The machine learning model processes the input and returns:
- Predicted disease
- Prediction confidence
- Assessment date

### 7.3 Risk Assessment

The risk assessment module assigns an experimental risk category based on the prediction confidence score.

The application uses three categories:

| Risk Category | Confidence Score |
|---|---|
| Low | Below 40% |
| Medium | 40% to below 70% |
| High | 70% or above |

These categories are application-specific and are not clinically validated measures of medical risk.

### 7.4 Recommendation Module

The recommendation module provides general suggestions based on the selected risk category.

It includes:
- General medical guidance
- Precautions
- Lifestyle suggestions

These suggestions are educational and do not replace professional medical advice.

### 7.5 Patient History

The patient history module stores previous assessments in the database.

Users can view their assessment dates, predicted conditions, confidence scores, and risk categories.

### 7.6 Analytics Dashboard

The analytics module presents assessment statistics, including:
- Total assessments
- Risk distribution
- Symptom counts
- Experimental model accuracy information

The dashboard helps users review the stored assessment data.

### 7.7 Health Report Generation

The report module generates downloadable PDF health assessment reports.

Each report includes:
- Patient name
- Predicted condition
- Prediction confidence
- Risk category
- General recommendations
- Medical disclaimer

---

## 8. API Endpoints

The backend exposes REST API endpoints using FastAPI.

| HTTP Method | Endpoint | Function |
|---|---|---|
| GET | `/` | Displays the API home response |
| POST | `/register` | Registers a new user |
| POST | `/login` | Authenticates a user |
| POST | `/predict` | Generates a disease prediction |
| GET | `/history` | Retrieves patient assessment history |
| GET | `/analytics` | Returns assessment statistics |
| GET | `/recommendation` | Returns general recommendations |

The API can be tested through the FastAPI Swagger documentation interface.

---

## 9. Testing and Validation

The application was tested through the Swagger interface and the frontend.

### Testing Summary

| Test Case | Result |
|---|---|
| User login | Passed |
| Symptom input | Passed |
| Disease prediction | Passed |
| Risk categorization | Passed |
| Recommendation display | Passed |
| Patient history retrieval | Passed |
| Analytics API | Passed |
| PDF report generation | Passed |

The tested features returned successful results during the demonstration.

These functional tests do not establish clinical accuracy or medical safety.

---

## 10. Results and Discussion

The developed application successfully connects the frontend, backend, machine learning model, and SQLite database.

The user can enter patient information and receive an experimental disease prediction with a confidence score and risk category.

The system also displays general recommendations and allows users to access their assessment history and analytics.

PDF report generation provides a convenient way to view and save assessment details.

The application demonstrates the integration of machine learning and web technologies in an educational healthcare project.

---

## 11. Future Enhancements

The following improvements can be considered in future versions:

- Use larger and more diverse datasets.
- Improve model evaluation and prediction reliability.
- Add more symptoms and disease categories.
- Improve the analytics dashboard with interactive charts.
- Add Excel report generation.
- Strengthen authentication and data protection.
- Deploy the application to a cloud platform.
- Improve the user interface and accessibility.

---

## 12. Conclusion

MedAssist AI demonstrates how machine learning and web technologies can be integrated into a healthcare information application.

The system provides experimental disease predictions, confidence scores, risk categories, general recommendations, patient history, analytics, and downloadable PDF reports.

The project brings together a React frontend, FastAPI backend, Random Forest classifier, and SQLite database in a single application.

It serves as an educational demonstration of AI-based symptom analysis. Its predictions are not clinically validated and must not be used for medical diagnosis or treatment.

---

## 13. Disclaimer

MedAssist AI is an experimental educational application. Its predictions, confidence scores, and risk categories are not clinically validated. The application must not be used as a substitute for professional medical advice, diagnosis, or treatment.