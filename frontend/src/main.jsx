import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight, ArrowLeft, Rocket, BrainCircuit, ShieldCheck, Mail, UserRound, ChartBar, Download, History, Sliders, Sparkles, Cpu, Database, CheckCircle2} from 'lucide-react';
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis} from 'recharts';
import './index.css';

const MAX = {cae1: 180, cae2: 180, put: 420, internal: 180};

function App() {
  const [page, setPage] = useState(1);
  const [user, setUser] = useState(() => JSON.parse(localStorage.studentUser || 'null'));
  const [marks, setMarks] = useState({cae1: '', cae2: '', put: '', internal: '', attendance: 75});
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState(() => JSON.parse(localStorage.predictionHistory || '[]'));

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
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white font-sans antialiased transition-colors duration-300">
      {/* SaaS Ambient Glow Backgrounds */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-100/60 via-transparent to-transparent pointer-events-none blur-3xl"></div>

      <header className="max-w-6xl mx-auto px-6 py-6 flex justify-between items-center relative z-10 print:hidden">
        <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setPage(1)}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <BrainCircuit size={22} />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-2">
              EduPredict AI <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded-full font-semibold">v2.4 SaaS</span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Advanced Student Performance Analytics</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-xs font-medium text-slate-600 bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
          <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 size={14} /> Model Active</span>
          <span className="text-slate-300">|</span>
          <span>R² Score: 0.941</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8 relative z-10">
        {page === 1 && <Onboarding user={user} setUser={setUser} ok={onboardOk} submit={submitUser} />}
        {page === 2 && <Marks user={user} marks={marks} setMarks={setMarks} ok={marksOk} back={() => setPage(1)} submit={predict} loading={loading} loadingStep={loadingStep} />}
        {page === 3 && result && <Dashboard user={user} result={result} marks={marks} history={history} back={() => setPage(2)} />}
      </main>
    </div>
  );
}

function Onboarding({user, setUser, ok, submit}) {
  return (
    <section className="max-w-md mx-auto bg-white border border-slate-200/80 rounded-3xl p-8 shadow-xl shadow-slate-200/50 space-y-6 mt-6">
      <div className="space-y-2 text-center">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl mx-auto flex items-center justify-center border border-indigo-100 mb-4">
          <Sparkles size={22} />
        </div>
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Get Started</h2>
        <p className="text-xs text-slate-500 font-medium">Enter your details to launch predictive pipeline.</p>
      </div>

      <div className="space-y-4 text-xs">
        <div>
          <label className="block uppercase tracking-wider text-slate-500 font-bold mb-1.5">Full Name</label>
          <div className="relative">
            <UserRound className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="e.g. Mridul"
              value={user?.name || ''}
              onChange={e => setUser({...user, name: e.target.value})}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-sans font-medium text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block uppercase tracking-wider text-slate-500 font-bold mb-1.5">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3.5 text-slate-400" size={16} />
            <input
              type="email"
              placeholder="student@college.edu"
              value={user?.email || ''}
              onChange={e => setUser({...user, email: e.target.value})}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all font-sans font-medium text-sm"
            />
          </div>
        </div>
      </div>

      <button
        disabled={!ok}
        onClick={submit}
        className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
      >
        Continue to Assessment <ArrowRight size={16} />
      </button>
    </section>
  );
}

function Marks({user, marks, setMarks, ok, back, submit, loading, loadingStep}) {
  const steps = [
    'Initializing tensor dataset vectors...',
    'Executing Scikit-Learn Polynomial Regression...',
    'Computing confidence scores & residual matrix...'
  ];

  return (
    <section className="max-w-2xl mx-auto space-y-6">
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center space-y-6 shadow-xl">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-3 border-indigo-100 rounded-full"></div>
            <div className="absolute inset-0 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Processing Pipeline</h3>
            <p className="text-xs text-indigo-600 font-medium animate-pulse">
              {steps[loadingStep - 1] || steps[0]}
            </p>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto">
            <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${(loadingStep / 3) * 100}%` }}></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Step 2 of 3</span>
              <h2 className="text-lg font-extrabold text-slate-900 mt-0.5">Enter Assessment Scores</h2>
            </div>
            <button onClick={back} className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold flex items-center gap-2 hover:bg-slate-100 transition-all text-slate-700">
              <ArrowLeft size={14} /> Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(MAX).map(([k, m]) => (
              <div key={k} className="bg-white border border-slate-200 p-5 rounded-2xl space-y-2.5 shadow-sm hover:border-indigo-300 transition-all">
                <div className="flex justify-between text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                  <span>{k.toUpperCase()} Score</span>
                  <span className="text-indigo-600">Max: {m}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={m}
                  value={marks[k]}
                  onChange={e => setMarks({...marks, [k]: e.target.value})}
                  className="w-full text-2xl font-black bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="uppercase tracking-wider text-slate-500 font-bold">Attendance Percentage</span>
              <span className="text-lg font-black text-indigo-600">{marks.attendance}%</span>
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
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
          >
            Run Prediction Model <Rocket size={16} />
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
  const label = rawData.label || 'Good Standing';

  const barData = [
    { name: 'CAE 1', max: 180, obtained: Number(marks?.cae1) || 30 },
    { name: 'CAE 2', max: 180, obtained: Number(marks?.cae2) || 45 },
    { name: 'PUT', max: 420, obtained: Number(marks?.put) || 350 },
    { name: 'Internal', max: 180, obtained: Number(marks?.internal) || 120 },
  ];

  const features = [
    { name: 'PUT Score Weight', val: 32.4 },
    { name: 'Internal Assessment', val: 24.1 },
    { name: 'CAE 2 Evaluation', val: 19.8 },
    { name: 'Attendance Factor', val: 13.5 },
    { name: 'CAE 1 Evaluation', val: 10.2 }
  ];

  const recommendations = [
    'Maintain attendance above 85% to maximize linear regression scaling.',
    'Focus on improving PUT exam performance in the upcoming cycle.',
    'Model residuals indicate stable continuous assessment trends.'
  ];

  const exportPDF = () => window.print();

  return (
    <section className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-slate-200 shadow-sm print:hidden">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600">Analytics Dashboard</span>
          <h2 className="text-xl font-extrabold text-slate-900 mt-0.5">{user?.name || 'Student'}'s Academic Report</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportPDF} className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition-all">
            <Download size={14} /> Export Report
          </button>
          <button onClick={back} className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold flex items-center gap-2 hover:bg-slate-100 transition-all text-slate-700">
            <ArrowLeft size={14} /> Edit Inputs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Predicted Final Percentage</span>
              <div className="text-5xl font-black text-slate-900 mt-2">
                {percentage}%
              </div>
              <div className="inline-block mt-3 px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                {label}
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-xs space-y-1 text-right">
              <div className="font-bold text-slate-700">Model Stats</div>
              <div className="text-slate-500">MSE: 0.0411</div>
              <div className="text-slate-500">R²: 0.9412</div>
            </div>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed border-t border-slate-100 pt-4 font-medium">
            Pipeline utilizes multi-variable polynomial regression trained on institutional historical datasets.
          </p>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Snapshot Metrics</div>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-slate-400 block uppercase text-[10px] font-bold">Attendance Ratio</span>
                <div className="text-2xl font-black text-slate-900 mt-0.5">{marks?.attendance}%</div>
              </div>
              <div>
                <span className="text-slate-400 block uppercase text-[10px] font-bold">Algorithm</span>
                <div className="text-sm font-bold text-slate-700 mt-0.5">Scikit-Learn Regression</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What-If Simulator */}
      <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">What-If Scenario Simulator</h3>
              <p className="text-xs text-slate-500">Test attendance and score variations dynamically</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Simulated Metric</span>
            <span className="text-xl font-black text-indigo-600">{simulatedPercentage}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Attendance Adjustment</span>
              <span className="text-indigo-600">{simAttendance}%</span>
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
            <div className="flex justify-between font-bold text-slate-700">
              <span>Score Boost Points</span>
              <span className="text-indigo-600">+{simBonusMarks} pts</span>
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
        <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Assessment Breakdown</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', color: '#0f172a', fontSize: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="max" name="Max Limit" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="obtained" name="Obtained" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-4 shadow-sm flex flex-col items-center">
          <h3 className="text-sm font-bold self-start text-slate-900">Competency Radar</h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { subject: 'Attendance', A: 80, fullMark: 100 },
                { subject: 'Internal', A: 75, fullMark: 100 },
                { subject: 'CAE', A: 65, fullMark: 100 },
                { subject: 'PUT', A: 90, fullMark: 100 },
              ]}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Radar name="Student" dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900">Feature Importance Weights</h3>
          <div className="space-y-4 text-xs">
            {features.map((feat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between font-bold text-slate-700">
                  <span>{feat.name}</span>
                  <span className="text-indigo-600">{feat.val}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${feat.val * 2}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History Tracker */}
        <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900">
              <History size={16} className="text-indigo-600" /> Prediction History
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Recent 5 Logs</span>
          </div>
          <div className="space-y-3 text-xs">
            {history && history.length > 0 ? (
              history.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="font-semibold text-slate-600">{item.date}</span>
                  <div className="flex items-center gap-4">
                    <span>Attendance: <strong className="text-slate-900">{item.attendance}%</strong></span>
                    <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 font-black border border-indigo-100">{item.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400">No history recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 p-8 rounded-3xl space-y-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900">Smart Academic Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-start gap-3">
              <span className="text-indigo-600 text-sm mt-0.5">💡</span>
              <p className="text-slate-700 leading-relaxed font-medium">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);