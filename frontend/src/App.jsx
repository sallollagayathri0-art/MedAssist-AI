
import { useEffect, useState } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import Login from './Login';

const API_URL = 'http://127.0.0.1:8001';

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

  const loadHistory = async () => {
    try {
      setHistoryLoading(true);

      const response = await axios.get(`${API_URL}/history`);

      if (Array.isArray(response.data?.history)) {
        setHistory(response.data.history);
      } else if (Array.isArray(response.data)) {
        setHistory(response.data);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error('History loading error:', error);
      alert('Unable to load history. Please check that the backend is running.');
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

  const handlePredict = async (e) => {
    e.preventDefault();

    if (
      !formData.age ||
      Number(formData.age) < 1 ||
      Number(formData.age) > 120
    ) {
      alert('Please enter a valid age between 1 and 120.');
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
        gender: formData.gender === 'Female' ? 0 : 1,
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
      });

      setResult(response.data);

      await loadHistory();
      await loadAnalytics();

      alert('Health assessment completed successfully.');
    } catch (error) {
      console.error('Prediction error:', error);

      if (error.response) {
        const detail = error.response.data?.detail;
        alert(
          typeof detail === 'string'
            ? detail
            : JSON.stringify(detail || 'Prediction failed.')
        );
      } else {
        alert(
          'Could not connect to the backend. Make sure FastAPI is running on port 8001.'
        );
      }
    } finally {
      setLoading(false);
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
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = 25;

      const addSection = (heading, content) => {
        if (y > 250) {
          pdf.addPage();
          y = 25;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(12);
        pdf.text(heading, margin, y);
        y += 8;

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(11);

        const lines = pdf.splitTextToSize(
          String(content),
          contentWidth
        );

        pdf.text(lines, margin, y);
        y += lines.length * 6 + 10;
      };

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(22);
      pdf.text('MedAssist AI', margin, y);
      y += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(13);
      pdf.text('Health Assessment Report', margin, y);
      y += 15;

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 15;

      addSection(
        'Predicted Condition',
        result.predicted_disease ||
          result.predicted_condition ||
          'Not available'
      );

      addSection(
        'Prediction Confidence',
        `${result.confidence_score ?? result.confidence ?? 0}%`
      );

      addSection(
        'Assessed Risk Category',
        result.risk_level || result.risk || 'Unknown'
      );

      addSection(
        'Medical Advice',
        result.recommendations?.consultation ||
          'Consult a qualified healthcare professional for medical advice.'
      );

      addSection(
        'Precautions',
        result.recommendations?.precautions ||
          'Monitor symptoms and seek medical help if they worsen.'
      );

      addSection(
        'Lifestyle Guidance',
        result.recommendations?.lifestyle ||
          'Maintain hydration, adequate sleep, and a balanced diet.'
      );

      if (y > 250) {
        pdf.addPage();
        y = 25;
      }

      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 10;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');

      const disclaimer =
        'Disclaimer: This is an experimental educational tool. Its predictions are not clinically validated and must not replace professional medical advice or diagnosis.';

      const disclaimerLines = pdf.splitTextToSize(
        disclaimer,
        contentWidth
      );

      pdf.text(disclaimerLines, margin, y);
      y += disclaimerLines.length * 5 + 10;

      pdf.text('Generated by MedAssist AI', margin, y);

      pdf.save(`MedAssist_Health_Report_${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Unable to generate the PDF report. Please try again.');
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
            Complete your health assessment to receive an informational prediction.
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

              <form onSubmit={handlePredict} className="space-y-5">
                {[
                  { name: 'fever', label: 'Fever', options: ['No', 'Yes'] },
                  { name: 'cough', label: 'Cough', options: ['No', 'Yes'] },
                  { name: 'fatigue', label: 'Fatigue', options: ['No', 'Yes'] },
                  {
                    name: 'difficulty_breathing',
                    label: 'Difficulty Breathing',
                    options: ['No', 'Yes']
                  },
                  {
                    name: 'gender',
                    label: 'Gender',
                    options: ['Female', 'Male']
                  },
                  {
                    name: 'blood_pressure',
                    label: 'Blood Pressure',
                    options: ['Normal', 'Low', 'High']
                  },
                  {
                    name: 'cholesterol_level',
                    label: 'Cholesterol Level',
                    options: ['Normal', 'Low', 'High']
                  }
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      {field.label}
                    </label>

                    <select
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                    >
                      {field.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}

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
                    required
                    className="w-full border border-slate-300 rounded-xl px-4 py-3"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl shadow-lg transition"
                >
                  {loading ? 'Analyzing...' : 'Generate Health Assessment'}
                </button>
              </form>
            </div>

            <div>
              {!result ? (
                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-8 h-full flex flex-col justify-center items-center text-center">
                  <div className="text-6xl mb-5">🩺</div>
                  <h2 className="text-2xl font-bold text-slate-800">
                    Your Report
                  </h2>
                  <p className="text-slate-500 mt-3 max-w-md">
                    Submit the assessment form to generate your experimental prediction.
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
                      {result.confidence_score ?? result.confidence ?? 0}%
                    </h2>
                  </div>

                  <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                    <p className="text-sm font-semibold text-slate-500">
                      Assessed Risk Category
                    </p>
                    <h2 className="text-3xl font-extrabold text-green-600 mt-2">
                      {result.risk_level || result.risk || 'Unknown'}
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
                            'Consult a qualified healthcare professional for medical advice.'}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-700">
                          Precautions
                        </h3>
                        <p className="text-slate-600 mt-2">
                          {result.recommendations?.precautions ||
                            'Monitor symptoms and seek medical help if they worsen.'}
                        </p>
                      </div>

                      <div>
                        <h3 className="font-bold text-slate-700">
                          Lifestyle Guidance
                        </h3>
                        <p className="text-slate-600 mt-2">
                          {result.recommendations?.lifestyle ||
                            'Maintain hydration, adequate sleep, and a balanced diet.'}
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
                    Educational use only. This experimental assessment is not a medical diagnosis.
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
                disabled={historyLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold disabled:bg-blue-300"
              >
                {historyLoading ? 'Refreshing...' : 'Refresh'}
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
                      <th className="p-3">ID</th>
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
                          {item.assessment_date
                            ? new Date(
                                item.assessment_date
                              ).toLocaleString()
                            : '—'}
                        </td>

                        <td className="p-3">
                          {item.age ?? '—'}
                        </td>

                        <td className="p-3">
                          {item.gender === 0
                            ? 'Female'
                            : item.gender === 1
                            ? 'Male'
                            : '—'}
                        </td>

                        <td className="p-3 font-semibold">
                          {item.predicted_disease ||
                            item.predicted_condition ||
                            item.disease ||
                            '—'}
                        </td>

                        <td className="p-3">
                          {item.confidence_score ??
                            item.confidence ??
                            '—'}%
                        </td>

                        <td className="p-3">
                          {item.risk_level || item.risk || '—'}
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
                    {[
                      {
                        label: 'Low Risk',
                        value: analytics.risk_distribution?.Low || 0,
                        style: 'bg-green-50 text-green-700'
                      },
                      {
                        label: 'Medium Risk',
                        value: analytics.risk_distribution?.Medium || 0,
                        style: 'bg-yellow-50 text-yellow-700'
                      },
                      {
                        label: 'High Risk',
                        value: analytics.risk_distribution?.High || 0,
                        style: 'bg-red-50 text-red-700'
                      }
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={`${item.style} rounded-2xl p-5`}
                      >
                        <p className="text-sm font-semibold">
                          {item.label}
                        </p>
                        <p className="text-3xl font-extrabold mt-2">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-3xl shadow-lg border border-slate-200 p-6">
                  <h3 className="text-xl font-bold text-slate-800 mb-5">
                    Symptom Frequency Analysis
                  </h3>

                  <div className="space-y-4">
                    {analytics.top_symptoms &&
                      Object.entries(analytics.top_symptoms).map(
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
                      {analytics.model_accuracy ?? 0}%
                    </div>

                    <div>
                      <p className="font-semibold text-slate-700">
                        Experimental Model Performance
                      </p>
                      <p className="text-sm text-slate-500 mt-1">
                        Reported test accuracy; this model is not clinically validated.
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
