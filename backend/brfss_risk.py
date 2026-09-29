import pandas as pd

BRFSS_PATH = r".\data\LLCP2024.XPT"

RISK_COLUMNS = [
    "GENHLTH",
    "PHYSHLTH",
    "CVDSTRK3",
    "ASTHMA3",
    "DIABETE4",
    "CHCCOPD3",
    "CHCKDNY2",
    "HAVARTH4",
    "SMOKE100",
    "EXERANY2",
]


def load_brfss():
    return pd.read_sas(
        BRFSS_PATH,
        format="xport",
        encoding="latin1"
    )


def calculate_brfss_risk(row):
    score = 0

    # General health
    if row.get("GENHLTH") in [4, 5]:
        score += 2

    # Poor physical health
    if row.get("PHYSHLTH") not in [77, 88, 99] and row.get("PHYSHLTH", 0) >= 14:
        score += 2

    # Existing health conditions
    if row.get("CVDSTRK3") == 1:
        score += 3

    if row.get("ASTHMA3") == 1:
        score += 1

    if row.get("DIABETE4") in [1, 2]:
        score += 2

    if row.get("CHCCOPD3") == 1:
        score += 2

    if row.get("CHCKDNY2") == 1:
        score += 2

    if row.get("HAVARTH4") == 1:
        score += 1

    # Lifestyle factors
    if row.get("SMOKE100") == 1:
        score += 2

    if row.get("EXERANY2") == 2:
        score += 1

    if score >= 7:
        risk_level = "High"
    elif score >= 4:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return score, risk_level


if __name__ == "__main__":
    df = load_brfss()

    print("BRFSS dataset loaded successfully.")
    print("Rows:", len(df))
    print("Columns:", len(df.columns))

    sample = df.iloc[0]

    score, risk = calculate_brfss_risk(sample)

    print("Sample BRFSS risk score:", score)
    print("Sample BRFSS risk level:", risk)