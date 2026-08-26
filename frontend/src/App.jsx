import { useState, useRef } from 'react';
import axios from 'axios';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Dashboard from './Dashboard';

function App() {
  const [formData, setFormData] = useState({
    fever: 0,
    cough: 0,
    fatigue: 0,
    difficulty_breathing: 0,
    age: 25,
    gender: 1,
    blood_pressure: 1,
    cholesterol_level: 1,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reportRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: parseInt(value, 10),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await axios.post(
        'http://127.0.0.1:8001/predict',
        formData
      );

      setResult(response.data);
    } catch (err) {
      console.error('Prediction error:', err);

      setError(
        'Failed to fetch prediction from backend server. Make sure FastAPI is running on port 8001.'
      );
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const element = reportRef.current;

    if (!element) {
      return;
    }

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        pdfWidth,
        pdfHeight
      );

      pdf.save(
        `MedAssist_Health_Report_${Date.now()}.pdf`
      );
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Unable to generate the PDF report.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4 font-sans">

      <div className="max-w-4xl mx-auto space-y-8">

        {/* Main Application */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden p-8">

          <h1 className="text-3xl font-bold text-slate-800 text-center mb-2">
            MedAssist AI 🩺
          </h1>

          <p className="text-slate-500 text-center mb-6">
            Symptom Analysis & Disease Prediction System
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Symptoms */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">

              <h2 className="text-lg font-semibold text-slate-700 mb-3">
                Reported Symptoms
              </h2>

              <div className="grid grid-cols-2 gap-4">

                {[
                  { label: 'Fever', name: 'fever' },
                  { label: 'Cough', name: 'cough' },
                  { label: 'Fatigue', name: 'fatigue' },
                  {
                    label: 'Difficulty Breathing',
                    name: 'difficulty_breathing',
                  },
                ].map((symptom) => (

                  <div
                    key={symptom.name}
                    className="flex items-center space-x-2"
                  >

                    <label className="text-slate-600 text-sm font-medium w-36">
                      {symptom.label}:
                    </label>

                    <select
                      name={symptom.name}
                      value={formData[symptom.name]}
                      onChange={handleChange}
                      className="border border-slate-300 rounded p-1 text-sm bg-white"
                    >
                      <option value={0}>No</option>
                      <option value={1}>Yes</option>
                    </select>

                  </div>

                ))}

              </div>
            </div>

            {/* Demographics & Vitals */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">

              <h2 className="text-lg font-semibold text-slate-700">
                Demographics & Vitals
              </h2>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-1">
                    Age
                  </label>

                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                    className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-1">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
                  >
                    <option value={1}>Male</option>
                    <option value={0}>Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-1">
                    Blood Pressure
                  </label>

                  <select
                    name="blood_pressure"
                    value={formData.blood_pressure}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
                  >
                    <option value={0}>Low</option>
                    <option value={1}>Normal</option>
                    <option value={2}>High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 text-sm font-medium mb-1">
                    Cholesterol Level
                  </label>

                  <select
                    name="cholesterol_level"
                    value={formData.cholesterol_level}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded p-2 text-sm bg-white"
                  >
                    <option value={0}>Low</option>
                    <option value={1}>Normal</option>
                    <option value={2}>High</option>
                  </select>
                </div>

              </div>
            </div>

            {/* Analyze Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg shadow disabled:opacity-50"
            >
              {loading
                ? 'Analyzing Symptoms...'
                : 'Analyze Symptoms & Predict'}
            </button>

          </form>

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-8 space-y-4">

              <div
                ref={reportRef}
                className="p-6 bg-slate-50 border border-slate-200 rounded-lg space-y-4"
              >

                <div className="border-b pb-3 flex justify-between items-center">
                  <h3 className="text-xl font-bold text-slate-800">
                    Diagnostic & Medical Risk Report 📄
                  </h3>

                  <span className="text-xs text-slate-500">
                    MedAssist AI Generated
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">
                    Predicted Condition:
                  </span>

                  <span className="font-extrabold text-blue-700 text-lg">
                    {result.predicted_disease}
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">
                    Prediction Confidence:
                  </span>

                  <span className="font-bold">
                    {result.confidence_score}%
                  </span>
                </div>

                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">
                    Assessed Health Risk:
                  </span>

                  <span
                    className={`font-bold px-3 py-1 rounded-full text-sm ${
                      result.risk_level === 'High'
                        ? 'bg-red-100 text-red-700 border border-red-300'
                        : result.risk_level === 'Medium'
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                        : 'bg-green-100 text-green-700 border border-green-300'
                    }`}
                  >
                    {result.risk_level} Risk
                  </span>
                </div>

                {/* Recommendations */}
                {result.recommendations && (
                  <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-2">

                    <h4 className="font-bold text-slate-700">
                      Recommendations & Advisory
                    </h4>

                    <p>
                      <strong>Medical Advice:</strong>{' '}
                      {result.recommendations.consultation}
                    </p>

                    <p>
                      <strong>Precautions:</strong>{' '}
                      {result.recommendations.precautions}
                    </p>

                    <p>
                      <strong>Lifestyle Guidance:</strong>{' '}
                      {result.recommendations.lifestyle}
                    </p>

                  </div>
                )}

              </div>

              {/* PDF Button */}
              <button
                onClick={downloadPDF}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg shadow"
              >
                📥 Download Health Summary Report (PDF)
              </button>

            </div>
          )}

        </div>

        {/* Analytics Dashboard */}
        <Dashboard />

      </div>
    </div>
  );
}

export default App;