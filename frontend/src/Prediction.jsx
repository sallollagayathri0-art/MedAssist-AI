import { useState } from 'react';
import axios from 'axios';

function Prediction({ user, onResult }) {
  const [form, setForm] = useState({
    fever: 0,
    cough: 0,
    fatigue: 0,
    difficulty_breathing: 0,
    age: '',
    gender: 0,
    blood_pressure: 0,
    cholesterol_level: 0
  });

  const [result, setResult] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]:
        name === 'age'
          ? value
          : Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
  form.age === '' ||
  Number(form.age) < 1 ||
  Number(form.age) > 120
) {
  alert('Please enter a valid age between 1 and 120.');
  return;
}

if (
  form.fever === 0 &&
  form.cough === 0 &&
  form.fatigue === 0 &&
  form.difficulty_breathing === 0
) {
  alert('Please select at least one symptom.');
  return;
}

    try {
      setLoading(true);
      setResult(null);
      setRecommendation(null);

      const response = await axios.post(
        'http://127.0.0.1:8000/predict',
        {
          fever: Number(form.fever),
          cough: Number(form.cough),
          fatigue: Number(form.fatigue),
          difficulty_breathing: Number(form.difficulty_breathing),
          age: Number(form.age),
          gender: Number(form.gender),
          blood_pressure: Number(form.blood_pressure),
          cholesterol_level: Number(form.cholesterol_level)
        }
      );

      setResult(response.data);

      if (onResult) {
        onResult(response.data);
      }

      try {
        const recommendationResponse = await axios.get(
          'http://127.0.0.1:8000/recommendation',
          {
            params: {
              disease: response.data.predicted_disease,
              risk_level: response.data.risk_level
            }
          }
        );

        setRecommendation(recommendationResponse.data);
      } catch (recommendationError) {
        console.error(
          'Recommendation error:',
          recommendationError
        );
      }

    } catch (error) {
      console.error('Prediction error:', error);

      if (error.response) {
        alert(
          error.response.data?.detail ||
          'Prediction failed.'
        );
      } else {
        alert(
          'Unable to connect to the backend.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      fever: 0,
      cough: 0,
      fatigue: 0,
      difficulty_breathing: 0,
      age: '',
      gender: 0,
      blood_pressure: 0,
      cholesterol_level: 0
    });

    setResult(null);
    setRecommendation(null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto">

      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

        <div className="bg-gradient-to-r from-blue-700 to-cyan-600 px-6 md:px-10 py-8 text-white">
          <h1 className="text-3xl font-extrabold">
            MedAssist AI 🩺
          </h1>

          <p className="mt-2 text-blue-100">
            Symptom Analysis & Disease Prediction
          </p>

          {user?.name && (
            <p className="mt-3 text-sm text-blue-100">
              Welcome, {user.name}
            </p>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 md:p-10"
        >

          <h2 className="text-xl font-bold text-slate-800 mb-6">
            Patient Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Age
              </label>

              <input
                type="number"
                name="age"
                min="0"
                max="120"
                value={form.age}
                onChange={handleChange}
                placeholder="Enter age"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Gender
              </label>

              <select
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={0}>Female</option>
                <option value={1}>Male</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fever
              </label>

              <select
                name="fever"
                value={form.fever}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Cough
              </label>

              <select
                name="cough"
                value={form.cough}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Fatigue
              </label>

              <select
                name="fatigue"
                value={form.fatigue}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Difficulty Breathing
              </label>

              <select
                name="difficulty_breathing"
                value={form.difficulty_breathing}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              >
                <option value={0}>No</option>
                <option value={1}>Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Blood Pressure
              </label>

              <select
                name="blood_pressure"
                value={form.blood_pressure}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              >
                <option value={0}>Low</option>
                <option value={1}>Normal</option>
                <option value={2}>High</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Cholesterol Level
              </label>

              <select
                name="cholesterol_level"
                value={form.cholesterol_level}
                onChange={handleChange}
                className="w-full border border-slate-300 rounded-xl px-4 py-3"
              >
                <option value={0}>Low</option>
                <option value={1}>Normal</option>
                <option value={2}>High</option>
              </select>
            </div>

          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-8">

            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition"
            >
              {loading
                ? 'Analyzing...'
                : 'Generate Health Report'}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="md:w-40 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition"
            >
              Reset
            </button>

          </div>

        </form>

        {result && (
          <div className="border-t border-slate-200 bg-slate-50 p-6 md:p-10">

            <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
              Health Assessment Report
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

              <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center">
                <p className="text-sm text-slate-500">
                  Predicted Condition
                </p>

                <p className="text-xl font-bold text-blue-700 mt-2">
                  {result.predicted_disease}
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center">
                <p className="text-sm text-slate-500">
                  Prediction Confidence
                </p>

                <p className="text-3xl font-bold text-slate-800 mt-2">
                  {result.confidence_score}%
                </p>
              </div>

              <div className="bg-white rounded-2xl p-5 border border-slate-200 text-center">
                <p className="text-sm text-slate-500">
                  Assessed Risk
                </p>

                <p
                  className={`text-xl font-bold mt-2 ${
                    result.risk_level === 'High'
                      ? 'text-red-600'
                      : result.risk_level === 'Medium'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {result.risk_level}
                </p>
              </div>

            </div>

            {recommendation && (
              <div className="mt-6 bg-white rounded-2xl p-6 border border-slate-200">

                <h3 className="text-lg font-bold text-slate-800 mb-4">
                  General Guidance
                </h3>

                <pre className="whitespace-pre-wrap text-sm text-slate-600 font-sans">
                  {typeof recommendation === 'string'
                    ? recommendation
                    : JSON.stringify(
                        recommendation,
                        null,
                        2
                      )}
                </pre>

              </div>
            )}

            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
              {result.notice}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

export default Prediction;