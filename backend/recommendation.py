def get_recommendations(disease, risk_level):
    recommendations = {
        "Low": [
            "Maintain a balanced diet.",
            "Stay hydrated and get adequate sleep.",
            "Exercise regularly, as appropriate.",
            "Monitor your symptoms."
        ],
        "Medium": [
            "Consider consulting a healthcare professional.",
            "Monitor your symptoms closely.",
            "Maintain a healthy diet and adequate hydration.",
            "Seek medical advice if symptoms worsen."
        ],
        "High": [
            "Seek prompt medical evaluation.",
            "Do not rely on this prediction as a diagnosis.",
            "If you experience severe breathing difficulty, seek emergency care."
        ]
    }

    return {
        "disease": disease,
        "risk_level": risk_level,
        "recommendations": recommendations.get(
            risk_level,
            ["Consult a qualified healthcare professional."]
        ),
        "notice": "These are general suggestions, not a medical diagnosis or personalized treatment."
    }