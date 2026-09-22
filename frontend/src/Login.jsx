import { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isRegister && !name.trim()) {
      alert('Please enter your name.');
      return;
    }

    if (!email.trim()) {
      alert('Please enter your email.');
      return;
    }

    if (!password.trim()) {
      alert('Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      if (isRegister) {
        const response = await axios.post(
          'http://127.0.0.1:8001/register',
          {
            name: name.trim(),
            email: email.trim(),
            password: password
          }
        );

        alert(response.data.message);

        setIsRegister(false);
        setName('');
        setPassword('');
      } else {
        const response = await axios.post(
          'http://127.0.0.1:8001/login',
          {
            email: email.trim(),
            password: password
          }
        );

        alert(`Welcome, ${response.data.name}!`);

        onLogin(response.data);
      }
    } catch (error) {
      console.error('Authentication error:', error);

      if (error.response) {
        alert(
          `Error ${error.response.status}: ${
            error.response.data?.detail || 'Something went wrong.'
          }`
        );
      } else if (error.request) {
        alert('Unable to connect to the backend.');
      } else {
        alert(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50 px-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8">

        <div className="text-center mb-8">
          <div className="text-5xl mb-4">🩺</div>

          <h1 className="text-3xl font-extrabold text-slate-800">
            MedAssist AI
          </h1>

          <p className="text-slate-500 mt-2">
            Symptom Analysis & Disease Prediction
          </p>
        </div>

        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">

          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setName('');
              setPassword('');
            }}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition ${
              !isRegister
                ? 'bg-white text-blue-600 shadow'
                : 'text-slate-500'
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setPassword('');
            }}
            className={`flex-1 py-2.5 rounded-lg font-semibold transition ${
              isRegister
                ? 'bg-white text-blue-600 shadow'
                : 'text-slate-500'
            }`}
          >
            Register
          </button>

        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {isRegister && (
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3.5 rounded-xl transition shadow-lg"
          >
            {loading
              ? 'Please wait...'
              : isRegister
              ? 'Create Account'
              : 'Login'}
          </button>

        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Educational and informational use only
        </p>

      </div>
    </div>
  );
}

export default Login;
