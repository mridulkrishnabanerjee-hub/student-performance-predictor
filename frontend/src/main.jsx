import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Moon, Sun, ArrowRight, ArrowLeft, Rocket, BrainCircuit, ShieldCheck, Mail, UserRound, ChartBar} from 'lucide-react';
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart} from 'recharts';
import './index.css';

const MAX = {cae1: 180, cae2: 180, put: 420, internal: 180};

function App() {
  const [page, setPage] = useState(1);
  const [dark, setDark] = useState(localStorage.theme === 'dark');
  const [user, setUser] = useState(() => JSON.parse(localStorage.studentUser || 'null'));
  const [marks, setMarks] = useState({cae1: '', cae2: '', put: '', internal: '', attendance: 75});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.theme = dark ? 'dark' : 'light';
  }, [dark]);

  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const onboardOk = user?.name?.trim() && validEmail.test(user?.email || '');
  const marksOk = Object.entries(MAX).every(([k, m]) => marks[k] !== '' && Number(marks[k]) >= 0 && Number(marks[k]) <= m);

  const submitUser = () => {
    if (!onboardOk) return;
    localStorage.studentUser = JSON.stringify(user);
    setPage(2);
  };

  const predict = async () => {
    if (!marksOk) return;
    setLoading(true);
    try {
      const r = await fetch('https://student-performance-predictor-eyva.onrender.com/api/predict', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          cae1: Number(marks.cae1),
          cae2: Number(marks.cae2),
          put: Number(marks.put),
          internal: Number(marks.internal),
          attendance: Number(marks.attendance)
        })
      });
      const data = await r.json();
      setResult(data);
      setPage(3);
    } catch (err) {
      alert('Unable to connect to backend server. Please verify your Render service is active.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid-bg transition-colors duration-500">
      <header className="max-w-7xl mx-auto px-5 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Student Performance Predictor</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">AI-assisted academic analytics</p>
          </div>
        </div>
        <button onClick={() => setDark(!dark)} className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
          {dark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-10">
        {page === 1 && <Onboarding user={user} setUser={setUser} ok={onboardOk} submit={submitUser} />}
        {page === 2 && <Marks user={user} marks={marks} setMarks={setMarks} ok={marksOk} back={() => setPage(1)} submit={predict} loading={loading} />}
        {page === 3 && result && <Dashboard user={user} result={result} back={() => setPage(2)} />}
      </main>
    </div>
  );
}

function Onboarding({user, setUser, ok, submit}) {
  return (
    <section className="max-w-xl mx-auto glass rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold">Welcome Student</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Enter your details to initiate academic performance evaluation.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Full Name</label>
          <div className="relative">
            <UserRound className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="John Doe"
              value={user?.name || ''}
              onChange={e => setUser({...user, name: e.target.value})}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="john@example.com"
              value={user?.email || ''}
              onChange={e => setUser({...user, email: e.target.value})}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      <button
        disabled={!ok}
        onClick={submit}
        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
      >
        Continue <ArrowRight size={18} />
      </button>
    </section>
  );
}

function Marks({user, marks, setMarks, ok, back, submit, loading}) {
  return (
    <section className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Academic Assessment Scores</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Logged in as {user?.name}</p>
        </div>
        <button onClick={back} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium flex items-center gap-2">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(MAX).map(([k, m]) => (
          <div key={k} className="glass p-5 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
              <span>{k.toUpperCase()} Marks</span>
              <span>Out of {m}</span>
            </div>
            <input
              type="number"
              min="0"
              max={m}
              value={marks[k]}
              onChange={e => setMarks({...marks, [k]: e.target.value})}
              className="w-full text-2xl font-bold bg-transparent border-b border-slate-200 dark:border-slate-800 py-1 focus:outline-none focus:border-indigo-500"
              placeholder="0"
            />
          </div>
        ))}
      </div>

      <div className="glass p-6 rounded-2xl space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">Attendance Percentage</span>
          <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{marks.attendance}%</span>
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={marks.attendance}
          onChange={e => setMarks({...marks, attendance: e.target.value})}
          className="w-full accent-indigo-600"
        />
      </div>

      <button
        disabled={!ok || loading}
        onClick={submit}
        className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition-all"
      >
        {loading ? 'Predicting...' : 'Generate Prediction'} <Rocket size={18} />
      </button>
    </section>
  );
}

function Dashboard({user, result, back}) {
  const data = result.prediction || result;

  return (
    <section className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Prediction Report</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Analysis for {user?.name}</p>
        </div>
        <button onClick={back} className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium flex items-center gap-2">
          <ArrowLeft size={16} /> Recalculate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl space-y-3 flex flex-col justify-center items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Predicted Percentage</span>
          <div className="text-6xl font-extrabold text-indigo-600 dark:text-indigo-400">
            {typeof data.predicted_percentage === 'number' ? data.predicted_percentage.toFixed(2) : data.predicted_percentage}%
          </div>
        </div>

        <div className="glass p-8 rounded-3xl space-y-3 flex flex-col justify-center items-center text-center">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500">Academic Status</span>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
            {data.label || 'N/A'}
          </div>
        </div>
      </div>

      {data.recommendations && data.recommendations.length > 0 && (
        <div className="glass p-6 rounded-3xl space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Actionable Recommendations</h3>
          <ul className="space-y-2">
            {data.recommendations.map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="text-indigo-600 font-bold">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);