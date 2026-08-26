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

  const riskData = {
    labels: ['Low Risk', 'Medium Risk', 'High Risk'],
    datasets: [
      {
        data: [
          analytics.risk_distribution.Low,
          analytics.risk_distribution.Medium,
          analytics.risk_distribution.High,
        ],
        backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
        borderWidth: 1,
      },
    ],
  };

  const symptomData = {
    labels: Object.keys(analytics.top_symptoms),
    datasets: [
      {
        label: 'Reported Cases',
        data: Object.values(analytics.top_symptoms),
        backgroundColor: '#3b82f6',
        borderWidth: 1,
      },
    ],
  };

  const riskOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  const symptomOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: false,
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
            <Doughnut
              data={riskData}
              options={riskOptions}
            />
          </div>

        </div>

        {/* Symptom Frequency */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">

          <h3 className="text-md font-semibold text-slate-700 text-center mb-4">
            Symptom Frequency Analysis
          </h3>

          <div className="h-64">
            <Bar
              data={symptomData}
              options={symptomOptions}
            />
          </div>

        </div>

      </div>

      {/* Model Accuracy */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center">

        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          Model Accuracy
        </h3>

        <p className="text-4xl font-bold text-blue-600">
          {analytics.model_accuracy}%
        </p>

      </div>

    </div>
  );
}

export default Dashboard;