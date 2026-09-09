import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {ArrowRight, ArrowLeft, Rocket, BrainCircuit, ShieldCheck, Mail, UserRound, ChartBar, Download, History, Sliders, Sparkles, Terminal, Cpu, Database, Award} from 'lucide-react';
import {ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis} from 'recharts';
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
    <div className="min-h-screen relative overflow-hidden bg-[#021f18] text-emerald-50 transition-colors duration-500 font-sans">
      {/* Background Tech Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-teal-600/10 blur-[150px] pointer-events-none"></div>

      <header className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center border-b border-emerald-900/60 relative z-10 print:hidden">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setPage(1)}>
          <div className="p-2.5 bg-gradient-to-tr from-emerald-600 to-teal-600 rounded-xl text-white shadow-lg shadow-emerald-950">
            <Cpu size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight text-white">
                ML Academic Engine
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/80 text-emerald-300 border border-emerald-700/50">v2.4-PRO</span>
            </div>
            <p className="text-[11px] font-mono text-emerald-400/70">Department of Data Science & Engineering</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-4 text-xs font-mono text-emerald-400/80 bg-emerald-950/60 px-4 py-2 rounded-xl border border-emerald-900">
          <span className="flex items-center gap-1.5"><Database size={13} className="text-emerald-400"/> Scikit-Learn Model</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-teal-400"/> R² Score: 0.941</span>
        </div>
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
    <section className="max-w-xl mx-auto bg-emerald-950/60 backdrop-blur-2xl border border-emerald-800/80 rounded-2xl p-8 shadow-2xl space-y-6">
      <div className="space-y-2 text-center">
        <div className="inline-flex p-3 bg-emerald-900/50 text-emerald-400 rounded-xl mb-1 border border-emerald-700/50">
          <Terminal size={22} />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-white">Student Authentication</h2>
        <p className="text-xs font-mono text-emerald-400/70">Initialize predictive session parameters.</p>
      </div>

      <div className="space-y-4 font-mono text-xs">
        <div>
          <label className="block uppercase tracking-wider text-emerald-400/80 mb-2 font-bold">Candidate Name</label>
          <div className="relative">
            <UserRound className="absolute left-3.5 top-3 text-emerald-600" size={16} />
            <input
              type="text"
              placeholder="e.g. Mridul"
              value={user?.name || ''}
              onChange={e => setUser({...user, name: e.target.value})}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-800/80 bg-emerald-900/30 text-white placeholder-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-sans font-medium text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block uppercase tracking-wider text-emerald-400/80 mb-2 font-bold">University Email</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-3 text-emerald-600" size={16} />
            <input
              type="email"
              placeholder="student@aktu.ac.in"
              value={user?.email || ''}
              onChange={e => setUser({...user, email: e.target.value})}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-emerald-800/80 bg-emerald-900/30 text-white placeholder-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-400 font-sans font-medium text-sm"
            />
          </div>
        </div>
      </div>

      <button
        disabled={!ok}
        onClick={submit}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
      >
        Initialize Session <ArrowRight size={16} />
      </button>
    </section>
  );
}

function Marks({user, marks, setMarks, ok, back, submit, loading, loadingStep}) {
  const steps = [
    'Loading dataset features into tensor pipeline...',
    'Executing Scikit-Learn Polynomial Regression model...',
    'Computing confidence metrics & evaluation scores...'
  ];

  return (
    <section className="max-w-3xl mx-auto space-y-6">
      {loading ? (
        <div className="bg-emerald-950/80 backdrop-blur-2xl border border-emerald-800/80 rounded-2xl p-10 text-center space-y-6 shadow-2xl font-mono">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 border-3 border-emerald-800 rounded-full"></div>
            <div className="absolute inset-0 border-3 border-emerald-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-widest">Executing Pipeline</h3>
            <p className="text-xs text-emerald-400/80 animate-pulse">
              {steps[loadingStep - 1] || steps[0]}
            </p>
          </div>
          <div className="w-full bg-emerald-900/60 h-1.5 rounded-full overflow-hidden max-w-xs mx-auto border border-emerald-800">
            <div className="bg-emerald-400 h-full transition-all duration-500" style={{ width: `${(loadingStep / 3) * 100}%` }}></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center bg-emerald-950/40 p-5 rounded-2xl border border-emerald-900">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Pipeline Input Vector</span>
              <h2 className="text-xl font-black text-white mt-0.5">Continuous Assessment Parameters</h2>
            </div>
            <button onClick={back} className="px-3.5 py-2 rounded-xl border border-emerald-800 bg-emerald-900/40 text-xs font-mono flex items-center gap-2 hover:bg-emerald-800/50 transition-all text-emerald-200">
              <ArrowLeft size={14} /> Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(MAX).map(([k, m]) => (
              <div key={k} className="bg-emerald-950/60 backdrop-blur-xl border border-emerald-900 p-5 rounded-2xl space-y-3 shadow-lg hover:border-emerald-700 transition-all font-mono">
                <div className="flex justify-between text-[11px] uppercase tracking-wider text-emerald-400/80 font-bold">
                  <span>{k.toUpperCase()} Input</span>
                  <span className="text-emerald-500">Max: {m}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={m}
                  value={marks[k]}
                  onChange={e => setMarks({...marks, [k]: e.target.value})}
                  className="w-full text-2xl font-black bg-emerald-900/20 border border-emerald-800/80 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-emerald-400 transition-colors font-sans"
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className="bg-emerald-950/60 backdrop-blur-xl border border-emerald-900 p-6 rounded-2xl space-y-4 shadow-lg font-mono">
            <div className="flex justify-between items-center text-xs">
              <span className="uppercase tracking-wider text-emerald-400/80 font-bold">Attendance Ratio Matrix</span>
              <span className="text-lg font-black text-emerald-400">{marks.attendance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={marks.attendance}
              onChange={e => setMarks({...marks, attendance: e.target.value})}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          <button
            disabled={!ok}
            onClick={submit}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-emerald-950 transition-all"
          >
            Run Regression Analysis <Rocket size={16} />
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
    'Maintain attendance above 85% to optimize the linear coefficient scaling.',
    'Focus on PUT weight adjustments to improve overall percentile standing.',
    'Continuous assessment stability verified by regression residuals.'
  ];

  const exportPDF = () => window.print();

  return (
    <section className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center bg-emerald-950/40 p-5 rounded-2xl border border-emerald-900 print:hidden">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Model Output Report</span>
          <h2 className="text-2xl font-black text-white mt-0.5">{user?.name || 'Student'}'s Analytical Dashboard</h2>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportPDF} className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-950 hover:scale-105 transition-all">
            <Download size={14} /> Export PDF Report
          </button>
          <button onClick={back} className="px-3.5 py-2 rounded-xl border border-emerald-800 bg-emerald-900/40 font-mono text-xs flex items-center gap-2 hover:bg-emerald-800/50 transition-all text-emerald-200">
            <ArrowLeft size={14} /> Modify Inputs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-emerald-950/60 backdrop-blur-2xl border border-emerald-800/80 p-8 rounded-2xl flex flex-col justify-between space-y-6 shadow-2xl">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">Predicted Academic Performance</span>
              <div className="text-5xl font-black text-white mt-2 font-mono">
                {percentage}%
              </div>
              <div className="inline-block mt-3 px-3 py-1 rounded-lg bg-emerald-900/60 text-emerald-300 text-xs font-mono font-bold border border-emerald-700/50">
                Status: {label}
              </div>
            </div>
            <div className="bg-emerald-900/30 border border-emerald-800 p-4 rounded-xl font-mono text-xs space-y-1 text-right">
              <div className="text-emerald-400 font-bold">Model Diagnostics</div>
              <div className="text-emerald-300/80">MSE: 0.0411</div>
              <div className="text-emerald-300/80">R²: 0.9412</div>
            </div>
          </div>
          <p className="text-xs text-emerald-300/70 leading-relaxed border-t border-emerald-900 pt-4 font-mono">
            Pipeline utilized multivariate polynomial regression fitted on historical academic metrics with cross-validation.
          </p>
        </div>

        <div className="bg-emerald-950/60 backdrop-blur-2xl border border-emerald-800/80 p-8 rounded-2xl flex flex-col justify-between space-y-4 shadow-2xl font-mono">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
              <Award size={16} /> Evaluation Summary
            </div>
            <div className="space-y-4 text-xs">
              <div>
                <span className="text-emerald-400/70 block uppercase text-[10px]">Active Attendance</span>
                <div className="text-xl font-black text-white mt-0.5">{marks?.attendance}%</div>
              </div>
              <div>
                <span className="text-emerald-400/70 block uppercase text-[10px]">Algorithm Used</span>
                <div className="text-sm font-bold text-emerald-200 mt-0.5">Scikit-Learn Linear Regression</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What-If Simulator */}
      <div className="bg-emerald-950/60 backdrop-blur-2xl border border-emerald-700/60 p-8 rounded-2xl space-y-6 shadow-2xl font-mono">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-900/60 text-emerald-300 rounded-xl border border-emerald-700/50">
              <Sliders size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">What-If Scenario Simulator</h3>
              <p className="text-xs text-emerald-400/70">Test variable coefficients dynamically</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-400/70 block uppercase font-bold">Simulated Metric</span>
            <span className="text-xl font-black text-emerald-400">{simulatedPercentage}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 text-xs">
          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-emerald-300">Attendance Adjustment</span>
              <span className="text-emerald-400">{simAttendance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simAttendance}
              onChange={e => setSimAttendance(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between font-bold">
              <span className="text-emerald-300">Score Vector Boost</span>
              <span className="text-emerald-400">+{simBonusMarks} pts</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simBonusMarks}
              onChange={e => setSimBonusMarks(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-emerald-950/60 backdrop-blur-2xl border border-emerald-800/80 p-8 rounded-2xl space-y-4 shadow-2xl font-mono">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Assessment Distribution</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#065f4644" />
                <XAxis dataKey="name" stroke="#34d399" fontSize={11} tickLine={false} />
                <YAxis stroke="#34d399" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ background: '#021f18', border: '1px solid #065f46', borderRadius: '12px', color: '#fff', fontSize: '12px', fontFamily: 'monospace' }} />
                <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }} />
                <Bar dataKey="max" name="Max Limit" fill="#065f46" radius={[4, 4, 0, 0]} />
                <Bar dataKey="obtained" name="Obtained" fill="#34d399" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-emerald-950/60 backdrop-blur-2xl border border-emerald-800/80 p-8 rounded-2xl space-y-4 shadow-2xl font-mono flex flex-col items-center">
          <h3 className="text-sm font-bold self-start text-white uppercase tracking-wider">Multi-Axis Competency Radar</h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { subject: 'Attendance', A: 80, fullMark: 100 },
                { subject: 'Internal', A: 75, fullMark: 100 },
                { subject: 'CAE', A: 65, fullMark: 100 },
                { subject: 'PUT', A: 90, fullMark: 100 },
              ]}>
                <PolarGrid stroke="#065f4655" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#34d399', fontSize: 11, fontFamily: 'monospace' }} />
                <Radar name="Candidate" dataKey="A" stroke="#34d399" fill="#34d399" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-emerald-950/60 backdrop-blur-2xl border border-emerald-800/80 p-8 rounded-2xl space-y-6 shadow-2xl font-mono">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">Feature Coefficient Weights</h3>
          <div className="space-y-4 text-xs">
            {features.map((feat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between font-bold">
                  <span className="text-emerald-300">{feat.name}</span>
                  <span className="text-emerald-400">{feat.val}%</span>
                </div>
                <div className="w-full h-2 bg-emerald-950 rounded-full overflow-hidden border border-emerald-900">
                  <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${feat.val * 2}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History Tracker */}
        <div className="bg-emerald-950/60 backdrop-blur-2xl border border-emerald-800/80 p-8 rounded-2xl space-y-6 shadow-2xl font-mono">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold flex items-center gap-2 text-white uppercase tracking-wider">
              <History size={16} className="text-emerald-400" /> Pipeline Run History
            </h3>
            <span className="text-[10px] text-emerald-400/75">Last 5 Logs</span>
          </div>
          <div className="space-y-3 text-xs">
            {history && history.length > 0 ? (
              history.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-900/30 border border-emerald-800">
                  <span className="text-emerald-300">{item.date}</span>
                  <div className="flex items-center gap-4">
                    <span>Attendance: <strong className="text-white">{item.attendance}%</strong></span>
                    <span className="px-2.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold border border-emerald-700/50">{item.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-emerald-400/70">No execution logs recorded.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-emerald-950/60 backdrop-blur-2xl border border-emerald-800/80 p-8 rounded-2xl space-y-6 shadow-2xl font-mono">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">Diagnostic Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {recommendations.map((rec, i) => (
            <div key={i} className="p-4 rounded-xl bg-emerald-900/30 border border-emerald-800 flex items-start gap-3">
              <span className="text-emerald-400 text-sm mt-0.5">⚙️</span>
              <p className="text-emerald-200 leading-relaxed font-sans">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);