
import pandas as pd
import joblib
from pathlib import Path

from sklearn.model_selection import train_test_split
from sklearn.impute import SimpleImputer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, f1_score, classification_report

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR.parent / "cleaned_dataset.csv"
MODEL_DIR = BASE_DIR / "models"
MODEL_DIR.mkdir(exist_ok=True)

df = pd.read_csv(DATA_PATH)

df = df.drop_duplicates()
df = df.dropna(subset=["Disease"])

symptom_columns = [
    "Fever",
    "Cough",
    "Fatigue",
    "Difficulty Breathing"
]

for column in symptom_columns:
    df[column] = (
        df[column]
        .astype(str)
        .str.strip()
        .str.lower()
        .map({"yes": 1, "no": 0})
    )

df["Gender"] = (
    df["Gender"]
    .astype(str)
    .str.strip()
    .str.lower()
    .map({"female": 0, "male": 1})
)

df["Blood Pressure"] = (
    df["Blood Pressure"]
    .astype(str)
    .str.strip()
    .str.lower()
    .map({"normal": 0, "high": 1, "low": 2})
)

df["Cholesterol Level"] = (
    df["Cholesterol Level"]
    .astype(str)
    .str.strip()
    .str.lower()
    .map({"normal": 0, "high": 1, "low": 2})
)

feature_columns = [
    "Fever",
    "Cough",
    "Fatigue",
    "Difficulty Breathing",
    "Age",
    "Gender",
    "Blood Pressure",
    "Cholesterol Level"
]

X = df[feature_columns].apply(
    pd.to_numeric,
    errors="coerce"
)

y = df["Disease"].astype(str)

# Keep diseases with at least 5 records
counts = y.value_counts()
common_diseases = counts[counts >= 10].index

df = df[df["Disease"].isin(common_diseases)].copy()

X = df[feature_columns].apply(
    pd.to_numeric,
    errors="coerce"
)

y = df["Disease"].astype(str)

# Remove rows where the target is missing
valid_rows = y.notna()
X = X.loc[valid_rows]
y = y.loc[valid_rows]

# Encode disease labels consistently
diseases = sorted(y.unique())

disease_to_number = {
    disease: index
    for index, disease in enumerate(diseases)
}

y_encoded = y.map(disease_to_number)

print("\n--- Dataset Information ---")
print("Rows used:", len(X))
print("Disease classes:", len(diseases))

# Check whether stratified splitting is possible
class_counts = y_encoded.value_counts()

if class_counts.min() < 2:
    raise ValueError(
        "At least 2 records per disease are required "
        "for stratified splitting."
    )

X_train, X_test, y_train, y_test = train_test_split(
    X,
    y_encoded,
    test_size=0.2,
    random_state=42,
    stratify=y_encoded
)

print("Training rows:", len(X_train))
print("Testing rows:", len(X_test))

# Pipeline: fill missing values, then train model
model = Pipeline([
    (
        "imputer",
        SimpleImputer(strategy="median")
    ),
    (
        "classifier",
        RandomForestClassifier(
            n_estimators=300,
            max_depth=None,
            min_samples_leaf=2,
            class_weight="balanced",
            random_state=42
        )
    )
])

model.fit(X_train, y_train)

predictions = model.predict(X_test)

accuracy = accuracy_score(y_test, predictions)

macro_f1 = f1_score(
    y_test,
    predictions,
    average="macro",
    zero_division=0
)

print("\n--- Model Evaluation ---")
print(f"Accuracy: {accuracy * 100:.2f}%")
print(f"Macro F1-score: {macro_f1:.4f}")

print("\n--- Classification Report ---")
print(
    classification_report(
        y_test,
        predictions,
        labels=list(range(len(diseases))),
        target_names=diseases,
        zero_division=0
    )
)

# Save the trained model and disease labels
joblib.dump(
    model,
    MODEL_DIR / "disease_prediction_model.pkl"
)

joblib.dump(
    diseases,
    MODEL_DIR / "label_encoder.pkl"
)

print("\nSUCCESS!")
print(
    "Model saved:",
    MODEL_DIR / "disease_prediction_model.pkl"
)
print(
    "Disease list saved:",
    MODEL_DIR / "label_encoder.pkl"
)

print(
    "\nNote: This is an experimental model "
    "for educational use only."
)