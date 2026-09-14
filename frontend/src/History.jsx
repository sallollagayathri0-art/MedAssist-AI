import { useEffect, useState } from 'react';
import axios from 'axios';

function History() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const loadHistory = () => {
    setLoading(true);
    setError('');

    axios
      .get('http://127.0.0.1:8000/history')
      .then((response) => {
        setHistory(response.data);
        setFilteredHistory(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('History fetch error:', error);
        setError('Unable to load patient history.');
        setLoading(false);
      });
  };

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    const searchText = search.toLowerCase();

    const filtered = history.filter((record) =>
      `${record.predicted_disease} ${record.gender} ${record.risk_level} ${record.age}`
        .toLowerCase()
        .includes(searchText)
    );

    setFilteredHistory(filtered);
  }, [search, history]);

  return (
    <div className="w-full flex justify-center">

      <div className="w-full max-w-6xl bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 md:px-8 py-6 text-white">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div>
              <h2 className="text-2xl font-bold">
                Patient History
              </h2>

              <p className="text-slate-300 text-sm mt-1">
                Recent health assessment records
              </p>
            </div>

            <button
              onClick={loadHistory}
              className="bg-white text-slate-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-slate-100 transition shadow-sm"
            >
              ↻ Refresh
            </button>

          </div>

        </div>

        {/* Search and Count */}
        <div className="p-5 md:p-6 border-b border-slate-100">

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

            <div className="relative w-full md:max-w-md">

              <input
                type="text"
                placeholder="Search disease, gender, risk or age..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 pl-11 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <span className="absolute left-4 top-3.5 text-slate-400">
                🔍
              </span>

            </div>

            <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-semibold">
              {filteredHistory.length} Record
              {filteredHistory.length !== 1 ? 's' : ''}
            </div>

          </div>

        </div>

        {/* Content */}
        <div className="p-4 md:p-6">

          {loading && (
            <div className="text-center py-10">
              <p className="text-slate-500">
                Loading patient history...
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4">
              {error}
            </div>
          )}

          {!loading && !error && filteredHistory.length === 0 && (
            <div className="text-center py-10">

              <div className="text-4xl mb-3">
                📋
              </div>

              <p className="text-slate-500 font-medium">
                No matching patient records found.
              </p>

            </div>
          )}

          {!loading && !error && filteredHistory.length > 0 && (

            <div className="w-full overflow-x-auto">

              <table className="w-full min-w-[950px] border-collapse">

                <thead>
                  <tr className="bg-slate-50">

                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase">
                      ID
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase">
                      Date & Time
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase">
                      Age
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase">
                      Gender
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase">
                      Predicted Disease
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase">
                      Confidence
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-bold text-slate-500 uppercase">
                      Risk
                    </th>

                  </tr>
                </thead>

                <tbody>

                  {filteredHistory.map((record) => (

                    <tr
                      key={record.id}
                      className="border-t border-slate-100 hover:bg-blue-50 transition"
                    >

                      <td className="px-4 py-4 text-sm font-bold text-slate-700">
                        #{record.id}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {new Date(record.timestamp).toLocaleString()}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {record.age}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {record.gender}
                      </td>

                      <td className="px-4 py-4 text-sm font-bold text-blue-700">
                        {record.predicted_disease}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-700">
                        {record.confidence_score}%
                      </td>

                      <td className="px-4 py-4">

                        <span
                          className={`inline-flex px-3 py-1.5 rounded-full text-xs font-bold ${
                            record.risk_level === 'High'
                              ? 'bg-red-100 text-red-700'
                              : record.risk_level === 'Medium'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {record.risk_level} Risk
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </div>

    </div>
  );
}

export default History;