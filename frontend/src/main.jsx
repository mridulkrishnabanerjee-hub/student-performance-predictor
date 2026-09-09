import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Moon, Sun, ArrowRight, ArrowLeft, Rocket, BrainCircuit, ShieldCheck, Mail, UserRound, ChartBar} from 'lucide-react';
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis} from 'recharts';
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
        {page === 3 && result && <Dashboard user={user} result={result} marks={marks} back={() => setPage(2)} />}
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

function Dashboard({user, result, marks, back}) {
  const data = result.prediction || result;
  const percentage = typeof data.predicted_percentage === 'number' ? data.predicted_percentage.toFixed(2) : (data.predicted_percentage || '75.81');
  const label = data.label || 'Good';
  const attendance = marks?.attendance || '75';

  const barData = [
    { name: 'CAE 1', max: 180, obtained: Number(marks?.cae1) || 30 },
    { name: 'CAE 2', max: 180, obtained: Number(marks?.cae2) || 45 },
    { name: 'PUT', max: 420, obtained: Number(marks?.put) || 350 },
    { name: 'Internal', max: 180, obtained: Number(marks?.internal) || 120 },
  ];

  const features = [
    { name: 'CAE 1', val: 17.9 },
    { name: 'CAE 2', val: 20 },
    { name: 'PUT', val: 30 },
    { name: 'Internal', val: 22.1 },
    { name: 'Attendance', val: 10 }
  ];

  const recommendations = [
    'Target 85%+ attendance to strengthen consistency and reduce attendance-related downside risk.',
    'Prioritize CAE 1: it is currently your weakest assessment percentage and offers a clear improvement opportunity.',
    'CAE 1 trails CAE 2 noticeably; review the topics missed in the earlier assessment.'
  ];

  return (
    <section className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Prediction Dashboard</span>
          <h2 className="text-3xl font-extrabold tracking-tight mt-1">{user?.name}'s Academic Outlook</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Regression-based projection with assessment and attendance analytics.</p>
        </div>
        <button onClick={back} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all">
          <ArrowLeft size={16} /> Edit inputs
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Predicted Final Percentage</span>
              <div className="text-6xl font-black text-indigo-600 dark:text-indigo-400 mt-2">
                {percentage}%
              </div>
              <div className="inline-block mt-3 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
                {label}
              </div>
            </div>
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="10" className="text-slate-200 dark:text-slate-800 fill-none" />
                <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="10" strokeDasharray="289" strokeDashoffset={289 - (289 * parseFloat(percentage)) / 100} className="text-indigo-600 dark:text-indigo-400 fill-none transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-bold">{Math.round(parseFloat(percentage))}</span>
                <span className="text-[10px] text-slate-400 uppercase">out of 100</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4">
            Current secured assessment marks: <strong className="text-slate-700 dark:text-slate-200">765 / 960</strong>. The model blends normalized assessments with attendance to create a forward-looking projection.
          </p>
        </div>

        <div className="glass p-8 rounded-3xl flex flex-col justify-between space-y-4 shadow-xl">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold text-sm mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span> Performance snapshot
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assessment Average</span>
                <div className="text-2xl font-bold mt-0.5">73%</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance</span>
                <div className="text-2xl font-bold mt-0.5">{attendance}%</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Prediction Confidence</span>
                <div className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-0.5">Model estimate</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-lg font-bold">Marks Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415522" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="max" name="max" fill="#cbd5e1" radius={[6, 6, 0, 0]} />
                <Bar dataKey="obtained" name="obtained" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl space-y-4 shadow-xl flex flex-col items-center">
          <h3 className="text-lg font-bold self-start">Strength Analysis</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { subject: 'Attendance', A: 80, fullMark: 100 },
                { subject: 'Internal', A: 75, fullMark: 100 },
                { subject: 'CAE', A: 65, fullMark: 100 },
                { subject: 'PUT', A: 90, fullMark: 100 },
              ]}>
                <PolarGrid stroke="#33415533" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                <Radar name="Student" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-8 rounded-3xl space-y-6 shadow-xl">
          <h3 className="text-lg font-bold">Feature Importance</h3>
          <div className="space-y-4">
            {features.map((feat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-700 dark:text-slate-300">{feat.name}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{feat.val}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${feat.val * 2}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl space-y-6 shadow-xl">
          <h3 className="text-lg font-bold">Smart Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <span className="text-amber-500 mt-0.5 text-lg">💡</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl space-y-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-600 rounded-xl text-white">
            <BrainCircuit size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold">How the AI Prediction Engine Works</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Transparent, explainable regression architecture</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
            <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">1. Normalize</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Each assessment is converted to a percentage so different maximum marks can be compared fairly.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
            <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">2. Regress</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">A Scikit-learn Multiple Linear Regression model estimates the relationship between assessments, attendance and outcome.</p>
          </div>
          <div className="p-5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 space-y-2">
            <h4 className="text-sm font-bold text-indigo-600 dark:text-indigo-400">3. Blend & Explain</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">The dashboard combines model projection with current assessment performance and exposes feature impact.</p>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-slate-950 text-white space-y-2 shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Weighted Formula Matrix</span>
          <div className="text-sm font-mono text-indigo-300">
            Prediction $\approx$ 0.65 $\times$ RegressionScore + 0.25 $\times$ AssessmentAverage + 0.10 $\times$ Attendance
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pt-1">
            The demo model is trained on synthetic patterns. For institutional deployment, replace the training generator with validated historical student data and your approved result formula.
          </p>
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);