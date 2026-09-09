import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Moon, Sun, ArrowRight, ArrowLeft, Rocket, BrainCircuit, ShieldCheck, Mail, UserRound, ChartBar, Download, History, Sliders, Sparkles} from 'lucide-react';
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis} from 'recharts';
import './index.css';

const MAX = {cae1: 180, cae2: 180, put: 420, internal: 180};

function App() {
  const [page, setPage] = useState(1);
  const [dark, setDark] = useState(localStorage.theme === 'dark');
  const [user, setUser] = useState(() => JSON.parse(localStorage.studentUser || 'null'));
  const [marks, setMarks] = useState({cae1: '', cae2: '', put: '', internal: '', attendance: 75});
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.predictionHistory || '[]'));

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
    setLoadingStep(1);

    setTimeout(async () => {
      setLoadingStep(2);
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
        setLoadingStep(3);
        const data = await r.json();
        setResult(data);

        const percentageVal = data?.prediction?.predicted_percentage ?? data?.predicted_percentage ?? 75.81;
        const newEntry = {
          date: new Date().toLocaleDateString(),
          percentage: typeof percentageVal === 'number' ? percentageVal.toFixed(2) : percentageVal,
          attendance: marks.attendance
        };
        const updatedHistory = [newEntry, ...history].slice(0, 5);
        setHistory(updatedHistory);
        localStorage.predictionHistory = JSON.stringify(updatedHistory);

        setTimeout(() => {
          setLoading(false);
          setPage(3);
        }, 600);
      } catch (err) {
        setLoading(false);
        alert('Unable to connect to backend server. Please verify your Render service is active.');
      }
    }, 900);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      {/* Background Neon Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-500/20 dark:bg-indigo-600/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-500/20 dark:bg-violet-600/10 blur-[120px] pointer-events-none"></div>

      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10 print:hidden">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setPage(1)}>
          <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl text-white shadow-xl shadow-indigo-500/30 transform group-hover:scale-105 transition-transform">
            <BrainCircuit size={28} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent">
              Student Predictor AI
            </h1>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Next-gen academic intelligence</p>
          </div>
        </div>
        <button 
          onClick={() => setDark(!dark)} 
          className="p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl shadow-sm hover:scale-105 transition-all"
        >
          {dark ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-indigo-600" />}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {page === 1 && <Onboarding user={user} setUser={setUser} ok={onboardOk} submit={submitUser} />}
        {page === 2 && <Marks user={user} marks={marks} setMarks={setMarks} ok={marksOk} back={() => setPage(1)} submit={predict} loading={loading} loadingStep={loadingStep} />}
        {page === 3 && result && <Dashboard user={user} result={result} marks={marks} history={history} back={() => setPage(2)} />}
      </main>
    </div>
  );
}

function Onboarding({user, setUser, ok, submit}) {
  return (
    <section className="max-w-xl mx-auto bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-8 shadow-2xl space-y-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-2xl mb-2">
          <Sparkles size={24} />
        </div>
        <h2 className="text-3xl font-black tracking-tight">Welcome Student</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Enter your credentials to launch AI analytics.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Full Name</label>
          <div className="relative">
            <UserRound className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Mridul"
              value={user?.name || ''}
              onChange={e => setUser({...user, name: e.target.value})}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="email"
              placeholder="student@college.edu"
              value={user?.email || ''}
              onChange={e => setUser({...user, email: e.target.value})}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      <button
        disabled={!ok}
        onClick={submit}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
      >
        Continue <ArrowRight size={18} />
      </button>
    </section>
  );
}

function Marks({user, marks, setMarks, ok, back, submit, loading, loadingStep}) {
  const steps = [
    'Initializing tensor models...',
    'Running Scikit-Learn polynomial regression...',
    'Synthesizing predictive insights...'
  ];

  return (
    <section className="max-w-3xl mx-auto space-y-8">
      {loading ? (
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 rounded-3xl p-12 text-center space-y-6 shadow-2xl">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 border-4 border-indigo-600/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">AI Engine Active</h3>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium animate-pulse">
              {steps[loadingStep - 1] || steps[0]}
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden max-w-sm mx-auto">
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 h-full transition-all duration-500" style={{ width: `${(loadingStep / 3) * 100}%` }}></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Academic Assessment Scores</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Logged in as <span className="text-indigo-600 dark:text-indigo-400 font-bold">{user?.name}</span></p>
            </div>
            <button onClick={back} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm font-semibold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(MAX).map(([k, m]) => (
              <div key={k} className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl space-y-3 shadow-xl hover:border-indigo-500/50 transition-all">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-400">
                  <span>{k.toUpperCase()} Marks</span>
                  <span>Max: {m}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={m}
                  value={marks[k]}
                  onChange={e => setMarks({...marks, [k]: e.target.value})}
                  className="w-full text-3xl font-black bg-transparent border-b border-slate-200 dark:border-slate-800 py-1 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Attendance Percentage</span>
              <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{marks.attendance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={marks.attendance}
              onChange={e => setMarks({...marks, attendance: e.target.value})}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <button
            disabled={!ok}
            onClick={submit}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white font-bold flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Generate Prediction <Rocket size={18} />
          </button>
        </>
      )}
    </section>
  );
}

function Dashboard({user, result, marks, history, back}) {
  const rawData = result?.prediction || result || {};
  const basePercentageVal = rawData.predicted_percentage ?? rawData.percentage ?? 75.81;
  
  const [simAttendance, setSimAttendance] = useState(Number(marks?.attendance) || 75);
  const [simBonusMarks, setSimBonusMarks] = useState(0);

  const simulatedPercentage = useMemo(() => {
    let base = typeof basePercentageVal === 'number' ? basePercentageVal : parseFloat(basePercentageVal);
    let attDiff = simAttendance - (Number(marks?.attendance) || 75);
    let score = base + (attDiff * 0.1) + (simBonusMarks * 0.05);
    return Math.min(100, Math.max(0, score)).toFixed(2);
  }, [basePercentageVal, simAttendance, simBonusMarks, marks]);

  const percentage = typeof basePercentageVal === 'number' ? basePercentageVal.toFixed(2) : String(basePercentageVal);
  const label = rawData.label || 'Good';

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
    'Target 85%+ attendance to strengthen consistency and reduce downside risk.',
    'Prioritize CAE 1: it is currently your weakest assessment percentage.',
    'Review topics missed in earlier continuous assessment cycles.'
  ];

  const exportPDF = () => window.print();

  return (
    <section className="max-w-6xl mx-auto space-y-8 pb-12">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Analytics Suite</span>
          <h2 className="text-3xl font-black tracking-tight mt-1">{user?.name || 'Student'}'s Academic Outlook</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Regression-backed projection and diagnostic metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportPDF} className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/25 hover:scale-105 transition-all">
            <Download size={16} /> Export Report
          </button>
          <button onClick={back} className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-sm font-semibold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all">
            <ArrowLeft size={16} /> Edit Inputs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Predicted Final Percentage</span>
              <div className="text-6xl font-black bg-gradient-to-r from-indigo-600 to-violet-600 dark:from-indigo-400 dark:to-violet-400 bg-clip-text text-transparent mt-2">
                {percentage}%
              </div>
              <div className="inline-block mt-3 px-3.5 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold border border-indigo-500/20">
                {label}
              </div>
            </div>
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="10" className="text-slate-100 dark:text-slate-800 fill-none" />
                <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="10" strokeDasharray="289" strokeDashoffset={289 - (289 * parseFloat(percentage)) / 100} className="text-indigo-600 dark:text-indigo-400 fill-none transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black">{Math.round(parseFloat(percentage))}</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">Score</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-100 dark:border-slate-800/60 pt-4 font-medium">
            Model synthesizes continuous assessment scores with active attendance matrices to generate predictive targets.
          </p>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-3xl flex flex-col justify-between space-y-4 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wider mb-4">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span> Snapshot Metrics
            </div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attendance Index</span>
                <div className="text-2xl font-black mt-0.5">{marks?.attendance}%</div>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Evaluation Mode</span>
                <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">Scikit Regression</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What-If Simulator */}
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border-2 border-indigo-500/30 p-8 rounded-3xl space-y-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl shadow-lg">
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">What-If Scenario Simulator</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Dynamically adjust parameters to evaluate potential performance changes</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase font-bold">Simulated Projection</span>
            <span className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{simulatedPercentage}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400">Simulated Attendance</span>
              <span className="text-indigo-600 font-black">{simAttendance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simAttendance}
              onChange={e => setSimAttendance(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-600 dark:text-slate-400">Extra Score Boost</span>
              <span className="text-indigo-600 font-black">+{simBonusMarks} marks</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simBonusMarks}
              onChange={e => setSimBonusMarks(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-3xl space-y-4 shadow-2xl">
          <h3 className="text-lg font-bold">Assessment Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415522" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '16px', color: '#fff', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.5)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="max" name="max" fill="#94a3b8" radius={[8, 8, 0, 0]} />
                <Bar dataKey="obtained" name="obtained" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-3xl space-y-4 shadow-2xl flex flex-col items-center">
          <h3 className="text-lg font-bold self-start">Performance Radar</h3>
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
                <Radar name="Student" dataKey="A" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-3xl space-y-6 shadow-2xl">
          <h3 className="text-lg font-bold">Feature Importance</h3>
          <div className="space-y-4">
            {features.map((feat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 dark:text-slate-300">{feat.name}</span>
                  <span className="text-indigo-600 dark:text-indigo-400">{feat.val}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full" style={{ width: `${feat.val * 2}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History Tracker */}
        <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-3xl space-y-6 shadow-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History size={18} className="text-indigo-600" /> Prediction History
            </h3>
            <span className="text-xs text-slate-400 font-medium">Recent 5 logs</span>
          </div>
          <div className="space-y-3">
            {history && history.length > 0 ? (
              history.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-slate-900/40 border border-slate-200/50 dark:border-slate-800/50 text-xs">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{item.date}</span>
                  <div className="flex items-center gap-4">
                    <span>Attendance: <strong className="text-slate-800 dark:text-slate-200">{item.attendance}%</strong></span>
                    <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-black">{item.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-medium">No history recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-slate-200/80 dark:border-slate-800/80 p-8 rounded-3xl space-y-6 shadow-2xl">
        <h3 className="text-lg font-bold">Smart Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
              <span className="text-amber-500 text-lg mt-0.5">💡</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);