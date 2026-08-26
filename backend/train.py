import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

from xgboost import XGBClassifier


# 1. Load the dataset
df = pd.read_csv(
    '../Disease_symptom_and_patient_profile_dataset.csv'
)


# 2. Convert Yes/No values to numbers
binary_cols = [
    'Fever',
    'Cough',
    'Fatigue',
    'Difficulty Breathing'
]

for col in binary_cols:
    df[col] = df[col].map({
        'Yes': 1,
        'No': 0
    })


# 3. Convert Gender to numbers
df['Gender'] = df['Gender'].map({
    'Male': 1,
    'Female': 0
})


# 4. Convert Blood Pressure to numbers
df['Blood Pressure'] = df['Blood Pressure'].map({
    'Low': 0,
    'Normal': 1,
    'High': 2
})


# 5. Convert Cholesterol Level to numbers
df['Cholesterol Level'] = df['Cholesterol Level'].map({
    'Low': 0,
    'Normal': 1,
    'High': 2
})


# 6. Prepare features and disease target
X = df.drop(
    columns=[
        'Disease',
        'Outcome Variable'
    ],
    errors='ignore'
)

y = df['Disease']


# 7. Split the dataset
# No stratify because some diseases have only one record
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)


# 8. Encode disease names AFTER splitting
# This avoids the XGBoost class-number error
label_encoder = LabelEncoder()

y_train_encoded = label_encoder.fit_transform(y_train)


# Keep only test diseases that were seen during training
known_diseases = set(label_encoder.classes_)

test_mask = y_test.isin(known_diseases)

X_test = X_test[test_mask]
y_test = y_test[test_mask]

y_test_encoded = label_encoder.transform(y_test)


# 9. Train XGBoost model
model = XGBClassifier(
    objective='multi:softprob',
    num_class=len(label_encoder.classes_),
    eval_metric='mlogloss',
    random_state=42
)

model.fit(
    X_train,
    y_train_encoded
)


# 10. Evaluate the model
y_pred = model.predict(X_test)

print("\n--- Model Evaluation Report ---")

print(
    classification_report(
        y_test_encoded,
        y_pred,
        zero_division=0
    )
)


# 11. Save the trained model
joblib.dump(
    model,
    'models/disease_prediction_model.pkl'
)


# 12. Save the disease label encoder
joblib.dump(
    label_encoder,
    'models/label_encoder.pkl'
)


print("\nSUCCESS!")
print("Model saved in: models/disease_prediction_model.pkl")
print("Encoder saved in: models/label_encoder.pkl")