import { useState } from 'react';
import * as XLSX from 'xlsx';

import Login from './Login';
import Prediction from './Prediction';
import History from './History';
import Dashboard from './Dashboard';

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState('prediction');
  const [result, setResult] = useState(null);

  const handleLogin = (userData) => {
    setUser(userData);
    setPage('prediction');
  };

  const handleLogout = () => {
    setUser(null);
    setResult(null);
    setPage('prediction');
  };

  const downloadExcel = () => {
    if (!result) {
      alert('Please generate a health report first.');
      return;
    }

    const reportData = [
      {
        Field: 'Patient',
        Value: user?.name || 'Patient'
      },
      {
        Field: 'Predicted Condition',
        Value: result.predicted_disease || 'Not available'
      },
      {
        Field: 'Prediction Confidence',
        Value: `${result.confidence_score ?? 0}%`
      },
      {
        Field: 'Assessed Risk Category',
        Value: result.risk_level || 'Unknown'
      },
      {
        Field: 'Medical Advice',
        Value:
          'Consult a qualified healthcare professional for medical advice.'
      },
      {
        Field: 'Precautions',
        Value:
          'Monitor symptoms and seek medical help if they worsen.'
      },
      {
        Field: 'Lifestyle Guidance',
        Value:
          'Maintain hydration, adequate sleep, and a balanced diet.'
      },
      {
        Field: 'Disclaimer',
        Value:
          'Experimental educational tool. Not clinically validated and not a substitute for professional medical advice.'
      }
    ];

    const worksheet = XLSX.utils.json_to_sheet(reportData);

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      'Health Report'
    );

    XLSX.writeFile(
      workbook,
      `MedAssist_Health_Report_${Date.now()}.xlsx`
    );
  };

  // Show login/register page if user is not logged in
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-100">

      {/* Navigation */}
      <header className="bg-white border-b border-slate-200 shadow-sm">

        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h1 className="text-2xl font-extrabold text-blue-700">
                MedAssist AI 🩺
              </h1>

              <p className="text-xs text-slate-500">
                Healthcare Analysis Platform
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">

              <button
                onClick={() => setPage('prediction')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  page === 'prediction'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Prediction
              </button>

              <button
                onClick={() => setPage('history')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  page === 'history'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                History
              </button>

              <button
                onClick={() => setPage('dashboard')}
                className={`px-4 py-2 rounded-lg font-semibold ${
                  page === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Analytics
              </button>

              {result && (
                <button
                  onClick={downloadExcel}
                  className="px-4 py-2 rounded-lg font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  Download Report
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg font-semibold bg-red-100 text-red-700 hover:bg-red-200"
              >
                Logout
              </button>

            </div>

          </div>

          <div className="mt-3 text-sm text-slate-600">
            Welcome, <span className="font-bold">{user.name}</span>
          </div>

        </div>

      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">

        {page === 'prediction' && (
          <Prediction
            user={user}
            onResult={setResult}
          />
        )}

        {page === 'history' && (
          <History />
        )}

        {page === 'dashboard' && (
          <Dashboard />
        )}

      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-6">
        MedAssist AI is an experimental educational tool and
        does not provide medical diagnosis.
      </footer>

    </div>
  );
}

export default App;