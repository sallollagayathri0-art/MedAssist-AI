import { useEffect, useState } from 'react';
import axios from 'axios';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios
      .get('http://127.0.0.1:8000/analytics')
      .then((res) => {
        setAnalytics(res.data);
      })
      .catch((err) => {
        console.error('Analytics fetch error:', err);
        setError('Unable to load analytics data.');
      });
  }, []);

  if (error) {
    return (
      <div className="mt-10 p-6 text-center text-red-600 bg-red-50 rounded-xl border border-red-200">
        {error}
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="mt-10 text-center py-6 text-slate-500">
        Loading Analytics...
      </div>
    );
  }

  const risk = analytics.risk_distribution || {};

  const riskData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        data: [
          risk.Low || 0,
          risk.Medium || 0,
          risk.High || 0,
        ],
        backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  const symptoms = analytics.top_symptoms || {};

  const symptomData = {
    labels: Object.keys(symptoms),
    datasets: [
      {
        label: 'Reported Cases',
        data: Object.values(symptoms),
        backgroundColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  };

  const diseases =
    analytics.disease_statistics ||
    analytics.disease_distribution ||
    analytics.disease_counts ||
    {};

  const diseaseData = {
    labels: Array.isArray(diseases)
      ? diseases.map((item) => item.disease || item.name || 'Unknown')
      : Object.keys(diseases),
    datasets: [
      {
        label: 'Number of Cases',
        data: Array.isArray(diseases)
          ? diseases.map((item) => item.count || item.total || 0)
          : Object.values(diseases),
        backgroundColor: '#8b5cf6',
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 bg-slate-50 p-6 rounded-xl border border-slate-200">

      <h2 className="text-2xl font-bold text-slate-800 mb-6 text-center">
        Healthcare Analytics & Population Risk Insights 📊
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Risk Distribution */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-md font-semibold text-slate-700 text-center mb-4">
            Risk Category Distribution
          </h3>

          <div className="h-64">
            <Doughnut data={riskData} options={chartOptions} />
          </div>
        </div>

        {/* Symptom Trends */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-md font-semibold text-slate-700 text-center mb-4">
            Symptom Trends
          </h3>

          <div className="h-64">
            <Bar data={symptomData} options={barOptions} />
          </div>
        </div>

        {/* Disease Statistics */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 md:col-span-2">
          <h3 className="text-md font-semibold text-slate-700 text-center mb-4">
            Disease Statistics
          </h3>

          {diseaseData.labels.length > 0 ? (
            <div className="h-80">
              <Bar data={diseaseData} options={barOptions} />
            </div>
          ) : (
            <p className="text-center text-slate-500 py-8">
              No disease statistics available.
            </p>
          )}
        </div>

      </div>

      {/* Model Accuracy */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center">
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          Model Accuracy
        </h3>

        <p className="text-4xl font-bold text-blue-600">
          {analytics.model_accuracy ?? 'N/A'}
          {analytics.model_accuracy != null ? '%' : ''}
        </p>
      </div>

    </div>
  );
}

export default Dashboard;