import { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import Login from './Login';

const API_URL = 'http://127.0.0.1:8000';

function App() {
  const [user, setUser] = useState(null);
  const [activePage, setActivePage] = useState('dashboard');

  const [formData, setFormData] = useState({
    fever: 'No',
    cough: 'No',
    fatigue: 'No',
    difficulty_breathing: 'No',
    age: '',
    gender: 'Female',
    blood_pressure: 'Normal',
    cholesterol_level: 'Normal'
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadHistory();
      loadAnalytics();
    }
  }, [user]);

  const handleLogin = (userData) => {
    setUser(userData);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setResult(null);
    setHistory([]);
    setAnalytics(null);
    setActivePage('dashboard');
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePredict = async (e) => {
    e.preventDefault();

    if (!formData.age) {
      alert('Please enter your age.');
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post(`${API_URL}/predict`, {
        fever: formData.fever === 'Yes' ? 1 : 0,
        cough: formData.cough === 'Yes' ? 1 : 0,
        fatigue: formData.fatigue === 'Yes' ? 1 : 0,
        difficulty_breathing:
          formData.difficulty_breathing === 'Yes' ? 1 : 0,

        age: Number(formData.age),

        gender:
          formData.gender === 'Female' ? 0 : 1,

        blood_pressure:
          formData.blood_pressure === 'Low'
            ? 0
            : formData.blood_pressure === 'Normal'
            ? 1
            : 2,

        cholesterol_level:
          formData.cholesterol_level === 'Low'
            ? 0
            : formData.cholesterol_level === 'Normal'
            ? 1
            : 2
      }
      );

      setResult(response.data);

      await loadHistory();
      await loadAnalytics();

      alert('Health assessment completed successfully.');
    } catch (error) {
      console.error('Prediction error:', error);

      if (error.response) {
        const detail = error.response.data?.detail;

        let message = 'Prediction failed.';

        if (Array.isArray(detail)) {
          message = detail
            .map((item) => {
              if (typeof item === 'string') {
                return item;
              }

              if (item?.msg) {
                return item.msg;
              }

              return JSON.stringify(item);
            })
            .join('\n');
        } else if (typeof detail === 'string') {
          message = detail;
        } else if (detail) {
          message = JSON.stringify(detail);
        }

        alert(message);
      } else if (error.request) {
        alert(
          'Could not connect to the backend.\n\n' +
          'Please make sure FastAPI is running on port 8000.'
        );
      } else {
        alert(`Prediction failed: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await axios.get(`${API_URL}/history`);

      if (Array.isArray(response.data)) {
        setHistory(response.data);
      } else if (Array.isArray(response.data?.history)) {
        setHistory(response.data.history);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('History loading error:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const response = await axios.get(`${API_URL}/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Analytics loading error:', error);
    }
  };

  const downloadPDF = () => {
    if (!result) {
      alert('Please generate a health report first.');
      return;
    }

    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const margin = 20;
      const contentWidth = pageWidth - margin * 2;

      let y = 25;

      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text('MedAssist AI', margin, y);

      y += 10;

      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'normal');
      pdf.text(
        'Diagnostic & Medical Risk Report',
        margin,
        y
      );

      y += 15;

      pdf.setDrawColor(200, 200, 200);

      pdf.line(
        margin,
        y,
        pageWidth - margin,
        y
      );

      y += 15;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text(
        'Predicted Condition',
        margin,
        y
      );

      y += 8;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');

      pdf.text(
        String(
          result.predicted_disease ||
          result.predicted_condition ||
          'Not available'
        ),
        margin,
        y
      );

      y += 15;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');

      pdf.text(
        'Prediction Confidence',
        margin,
        y
      );

      y += 8;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');

      pdf.text(
        `${result.confidence_score ?? result.confidence ?? 0}%`,
        margin,
        y
      );

      y += 15;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');

      pdf.text(
        'Assessed Health Risk',
        margin,
        y
      );

      y += 8;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');

      pdf.text(
        `${result.risk_level || result.risk || 'Unknown'} Risk`,
        margin,
        y
      );

      y += 18;

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');

      pdf.text(
        'Recommendations & Advisory',
        margin,
        y
      );

      y += 12;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');

      pdf.text(
        'Medical Advice',
        margin,
        y
      );

      y += 7;

      pdf.setFont('helvetica', 'normal');

      const consultation =
        result.recommendations?.consultation ||
        'Routine follow-up with a primary healthcare physician is recommended.';

      const consultationLines =
        pdf.splitTextToSize(
          String(consultation),
          contentWidth
        );

      pdf.text(
        consultationLines,
        margin,
        y
      );

      y += consultationLines.length * 6 + 8;

      pdf.setFont('helvetica', 'bold');

      pdf.text(
        'Precautions',
        margin,
        y
      );

      y += 7;

      pdf.setFont('helvetica', 'normal');

      const precautions =
        result.recommendations?.precautions ||
        'Monitor symptoms regularly and seek medical help if symptoms worsen.';

      const precautionLines =
        pdf.splitTextToSize(
          String(precautions),
          contentWidth
        );

      pdf.text(
        precautionLines,
        margin,
        y
      );

      y += precautionLines.length * 6 + 8;

      pdf.setFont('helvetica', 'bold');

      pdf.text(
        'Lifestyle Guidance',
        margin,
        y
      );

      y += 7;

      pdf.setFont('helvetica', 'normal');

      const lifestyle =
        result.recommendations?.lifestyle ||
        'Maintain adequate hydration, sleep, and a balanced diet.';

      const lifestyleLines =
        pdf.splitTextToSize(
          String(lifestyle),
          contentWidth
        );

      pdf.text(
        lifestyleLines,
        margin,
        y
      );

      y += lifestyleLines.length * 6 + 15;

      if (y > pageHeight - 40) {
        pdf.addPage();
        y = 25;
      }

      pdf.setDrawColor(200, 200, 200);

      pdf.line(
        margin,
        y,
        pageWidth - margin,
        y
      );

      y += 10;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      const disclaimer =
        'Disclaimer: This report is generated for educational and informational purposes only and should not replace professional medical advice.';

      const disclaimerLines =
        pdf.splitTextToSize(
          disclaimer,
          contentWidth
        );

      pdf.text(
        disclaimerLines,
        margin,
        y
      );

      y += disclaimerLines.length * 5 + 10;

      pdf.setFontSize(9);

      pdf.text(
        'Generated by MedAssist AI',
        margin,
        y
      );

      pdf.save(
        `MedAssist_Health_Report_${Date.now()}.pdf`
      );

    } catch (error) {
      console.error(
        'PDF generation error:',
        error
      );

      alert(
        'Unable to generate the PDF report. Please try again.'
      );
    }
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50">

      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div>
              <h1 className="text-2xl font-extrabold text-blue-700">
                MedAssist AI
              </h1>

              <p className="text-xs text-slate-500">
                Symptom Analysis & Health Assessment
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <button
                onClick={() => setActivePage('dashboard')}
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  activePage === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Assessment
              </button>

              <button
                onClick={() => {
                  setActivePage('history');
                  loadHistory();
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  activePage === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                History
              </button>

              <button
                onClick={() => {
                  setActivePage('analytics');
                  loadAnalytics();
                }}
                className={`px-4 py-2 rounded-lg font-semibold text-sm ${
                  activePage === 'analytics'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Analytics
              </button>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-semibold text-sm bg-red-50 text-red-600 hover:bg-red-100"
              >
                Logout
              </button>

            </div>

          </div>

        </div>

      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-lg">

          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Welcome, {user.name}!
          </h2>

          <p className="mt-2 text-blue-100">
            Complete your health assessment to receive an
            informational prediction and risk assessment.
          </p>

        </div>

        {activePage === 'dashboard' && (

          <div className="grid lg:grid-cols-2 gap-8">

            <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

              <h2 className="text-2xl font-bold text-slate-800 mb-2">
                Health Assessment
              </h2>

              <p className="text-slate-500 mb-6">
                Enter your symptoms and basic health information.
              </p>

              <form
                onSubmit={handlePredict}
                className="space-y-5"
              >

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fever
                  </label>

                  <select
                    name="fever"
                    value={formData.fever}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cough
                  </label>

                  <select
                    name="cough"
                    value={formData.cough}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Fatigue
                  </label>

                  <select
                    name="fatigue"
                    value={formData.fatigue}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Difficulty Breathing
                  </label>

                  <select
                    name="difficulty_breathing"
                    value={formData.difficulty_breathing}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="No">No</option>
                    <option value="Yes">Yes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Age
                  </label>

                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    min="1"
                    max="120"
                    placeholder="Enter age"
                    className="w-full border border-slate-300 rounded-xl px-4 py-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Gender
                  </label>

                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Blood Pressure
                  </label>

                  <select
                    name="blood_pressure"
                    value={formData.blood_pressure}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Cholesterol Level
                  </label>

                  <select
                    name="cholesterol_level"
                    value={formData.cholesterol_level}
                    onChange={handleChange}
                    className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Low">Low</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl shadow-lg transition"
                >
                  {loading
                    ? 'Analyzing...'
                    : 'Generate Health Assessment'}
                </button>

              </form>

            </div>

            <div>

              {!result ? (

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 h-full flex flex-col justify-center items-center text-center">

                  <div className="text-6xl mb-5">
                    🩺
                  </div>

                  <h2 className="text-2xl font-bold text-slate-800">
                    Your Report
                  </h2>

                  <p className="text-slate-500 mt-3 max-w-md">
                    Submit the health assessment form to
                    generate your prediction, confidence score,
                    risk level, and recommendations.
                  </p>

                </div>

              ) : (

                <div className="space-y-5">

                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                    <p className="text-sm font-semibold text-slate-500">
                      Predicted Condition
                    </p>

                    <h2 className="text-3xl font-extrabold text-blue-700 mt-2">
                      {result.predicted_disease ||
                        result.predicted_condition ||
                        'Not available'}
                    </h2>

                  </div>

                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                    <p className="text-sm font-semibold text-slate-500">
                      Prediction Confidence
                    </p>

                    <h2 className="text-3xl font-extrabold text-slate-800 mt-2">
                      {result.confidence_score ??
                        result.confidence ??
                        0}%
                    </h2>

                  </div>

                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                    <p className="text-sm font-semibold text-slate-500">
                      Assessed Health Risk
                    </p>

                    <h2 className="text-3xl font-extrabold text-green-600 mt-2">
                      {result.risk_level ||
                        result.risk ||
                        'Unknown'} Risk
                    </h2>

                  </div>

                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                    <h2 className="text-xl font-bold text-slate-800 mb-5">
                      Recommendations & Advisory
                    </h2>

                    <div className="space-y-5">

                      <div>
                        <h3 className="font-bold text-slate-700">
                          Medical Advice
                        </h3>

                        <p className="text-slate-600 mt-2">
                          {result.recommendations?.consultation ||
                            'Routine follow-up with a primary healthcare physician is recommended.'}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-700">
                          Precautions
                        </h3>

                        <p className="text-slate-600 mt-2">
                          {result.recommendations?.precautions ||
                            'Monitor symptoms regularly and seek medical help if symptoms worsen.'}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-700">
                          Lifestyle Guidance
                        </h3>

                        <p className="text-slate-600 mt-2">
                          {result.recommendations?.lifestyle ||
                            'Maintain adequate hydration, sleep, and a balanced diet.'}
                        </p>
                      </div>

                    </div>

                    <button
                      onClick={downloadPDF}
                      className="w-full mt-6 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl transition"
                    >
                      Download PDF Report
                    </button>

                  </div>

                  <p className="text-xs text-slate-400 text-center">
                    Educational and informational use only.
                    This assessment does not replace professional
                    medical advice.
                  </p>

                </div>

              )}

            </div>

          </div>

        )}

        {activePage === 'history' && (

          <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">

              <div>

                <h2 className="text-2xl font-bold text-slate-800">
                  Patient History
                </h2>

                <p className="text-slate-500 mt-1">
                  Previous health assessments
                </p>

              </div>

              <button
                onClick={loadHistory}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold"
              >
                Refresh
              </button>

            </div>

            {historyLoading ? (

              <p className="text-center text-slate-500 py-10">
                Loading history...
              </p>

            ) : history.length === 0 ? (

              <p className="text-center text-slate-500 py-10">
                No patient history available.
              </p>

            ) : (

              <div className="overflow-x-auto">

                <table className="w-full text-sm">

                  <thead>

                    <tr className="border-b border-slate-200 text-left">

                      <th className="p-3">#</th>
                      <th className="p-3">Date</th>
                      <th className="p-3">Age</th>
                      <th className="p-3">Gender</th>
                      <th className="p-3">Condition</th>
                      <th className="p-3">Confidence</th>
                      <th className="p-3">Risk</th>

                    </tr>

                  </thead>

                  <tbody>

                    {history.map((item, index) => (

                      <tr
                        key={item.id || index}
                        className="border-b border-slate-100 hover:bg-slate-50"
                      >

                        <td className="p-3">
                          {item.id || index + 1}
                        </td>

                        <td className="p-3">
                          {item.created_at ||
                            item.timestamp ||
                            item.date ||
                            '-'}
                        </td>

                        <td className="p-3">
                          {item.age || '-'}
                        </td>

                        <td className="p-3">
                          {item.gender || '-'}
                        </td>

                        <td className="p-3 font-semibold">
                          {item.predicted_disease ||
                            item.predicted_condition ||
                            item.disease ||
                            '-'}
                        </td>

                        <td className="p-3">
                          {item.confidence_score ??
                            item.confidence ??
                            '-'}
                          %
                        </td>

                        <td className="p-3">
                          {item.risk_level ||
                            item.risk ||
                            '-'}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            )}

          </div>

        )}

        {activePage === 'analytics' && (

          <div>

            <div className="mb-6">

              <h2 className="text-2xl font-bold text-slate-800">
                Analytics Dashboard
              </h2>

              <p className="text-slate-500 mt-1">
                Overview of assessment results and model performance.
              </p>

            </div>

            {!analytics ? (

              <div className="bg-white rounded-3xl shadow-lg p-8 text-center text-slate-500">
                Loading analytics...
              </div>

            ) : (

              <div className="space-y-8">

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                  <h3 className="text-xl font-bold text-slate-800 mb-5">
                    Risk Category Distribution
                  </h3>

                  <div className="grid sm:grid-cols-3 gap-4">

                    <div className="bg-green-50 rounded-2xl p-5">

                      <p className="text-sm text-green-700 font-semibold">
                        Low Risk
                      </p>

                      <p className="text-3xl font-extrabold text-green-700 mt-2">
                        {analytics.risk_distribution?.Low || 0}
                      </p>

                    </div>

                    <div className="bg-yellow-50 rounded-2xl p-5">

                      <p className="text-sm text-yellow-700 font-semibold">
                        Medium Risk
                      </p>

                      <p className="text-3xl font-extrabold text-yellow-700 mt-2">
                        {analytics.risk_distribution?.Medium || 0}
                      </p>

                    </div>

                    <div className="bg-red-50 rounded-2xl p-5">

                      <p className="text-sm text-red-700 font-semibold">
                        High Risk
                      </p>

                      <p className="text-3xl font-extrabold text-red-700 mt-2">
                        {analytics.risk_distribution?.High || 0}
                      </p>

                    </div>

                  </div>

                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                  <h3 className="text-xl font-bold text-slate-800 mb-5">
                    Symptom Frequency Analysis
                  </h3>

                  <div className="space-y-4">

                    {analytics.top_symptoms &&
                      Object.entries(
                        analytics.top_symptoms
                      ).map(
                        ([symptom, count]) => (

                          <div key={symptom}>

                            <div className="flex justify-between mb-1">

                              <span className="font-semibold text-slate-700">
                                {symptom}
                              </span>

                              <span className="text-slate-500">
                                {count}
                              </span>

                            </div>

                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">

                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{
                                  width: `${Math.min(
                                    Number(count) / 2,
                                    100
                                  )}%`
                                }}
                              />

                            </div>

                          </div>

                        )
                      )}

                  </div>

                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">

                  <h3 className="text-xl font-bold text-slate-800">
                    Model Accuracy
                  </h3>

                  <div className="mt-5 flex items-center gap-5">

                    <div className="text-5xl font-extrabold text-blue-600">
                      {analytics.model_accuracy || 0}%
                    </div>

                    <div>

                      <p className="font-semibold text-slate-700">
                        Prediction Model Performance
                      </p>

                      <p className="text-sm text-slate-500 mt-1">
                        Current model accuracy reported by the backend.
                      </p>

                    </div>

                  </div>

                </div>

              </div>

            )}

          </div>

        )}

      </main>

      <footer className="text-center py-8 text-xs text-slate-400">
        MedAssist AI • Educational and informational use only
      </footer>

    </div>
  );
}

export default App;