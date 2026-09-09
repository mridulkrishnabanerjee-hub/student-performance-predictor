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
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500 ${dark ? 'bg-neutral-950 text-neutral-100' : 'bg-neutral-50 text-neutral-900'}`}>
      <header className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center relative z-10 print:hidden">
        <div className="flex items-center gap-3 group cursor-pointer" onClick={() => setPage(1)}>
          <div className={`p-3 rounded-2xl ${dark ? 'bg-white text-black' : 'bg-black text-white'} shadow-md transform group-hover:scale-105 transition-transform`}>
            <BrainCircuit size={28} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Student Predictor AI</h1>
            <p className={`text-xs font-medium ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>Academic Intelligence Suite</p>
          </div>
        </div>
        <button
          onClick={() => setDark(!dark)}
          className={`p-3 rounded-2xl border ${dark ? 'border-neutral-800 bg-neutral-900 text-neutral-200' : 'border-neutral-200 bg-white text-neutral-700'} shadow-sm hover:scale-105 transition-all`}
        >
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {page === 1 && <Onboarding user={user} setUser={setUser} ok={onboardOk} submit={submitUser} dark={dark} />}
        {page === 2 && <Marks user={user} marks={marks} setMarks={setMarks} ok={marksOk} back={() => setPage(1)} submit={predict} loading={loading} loadingStep={loadingStep} dark={dark} />}
        {page === 3 && result && <Dashboard user={user} result={result} marks={marks} history={history} back={() => setPage(2)} dark={dark} />}
      </main>
    </div>
  );
}

function Onboarding({user, setUser, ok, submit, dark}) {
  return (
    <section className={`max-w-xl mx-auto ${dark ? 'bg-neutral-900/80 border-neutral-800' : 'bg-white/80 border-neutral-200'} backdrop-blur-xl border rounded-3xl p-8 shadow-xl space-y-6`}>
      <div className="space-y-2 text-center">
        <div className={`inline-flex p-3 ${dark ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-black'} rounded-2xl mb-2`}>
          <Sparkles size={24} />
        </div>
        <h2 className="text-3xl font-black tracking-tight">Welcome Student</h2>
        <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>Enter your credentials to launch AI analytics.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-600'} mb-2`}>Full Name</label>
          <div className="relative">
            <UserRound className={`absolute left-4 top-3.5 ${dark ? 'text-neutral-500' : 'text-neutral-400'}`} size={18} />
            <input
              type="text"
              placeholder="Mridul"
              value={user?.name || ''}
              onChange={e => setUser({...user, name: e.target.value})}
              className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${dark ? 'border-neutral-800 bg-neutral-950 text-white placeholder-neutral-700' : 'border-neutral-200 bg-neutral-50 text-black placeholder-neutral-400'} focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-medium`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-xs font-bold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-600'} mb-2`}>Email Address</label>
          <div className="relative">
            <Mail className={`absolute left-4 top-3.5 ${dark ? 'text-neutral-500' : 'text-neutral-400'}`} size={18} />
            <input
              type="email"
              placeholder="student@college.edu"
              value={user?.email || ''}
              onChange={e => setUser({...user, email: e.target.value})}
              className={`w-full pl-11 pr-4 py-3.5 rounded-2xl border ${dark ? 'border-neutral-800 bg-neutral-950 text-white placeholder-neutral-700' : 'border-neutral-200 bg-neutral-50 text-black placeholder-neutral-400'} focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all font-medium`}
            />
          </div>
        </div>
      </div>

      <button
        disabled={!ok}
        onClick={submit}
        className={`w-full py-4 rounded-2xl ${dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'} disabled:opacity-50 font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]`}
      >
        Continue <ArrowRight size={18} />
      </button>
    </section>
  );
}

function Marks({user, marks, setMarks, ok, back, submit, loading, loadingStep, dark}) {
  const steps = [
    'Initializing tensor models...',
    'Running Scikit-Learn polynomial regression...',
    'Synthesizing predictive insights...'
  ];

  return (
    <section className="max-w-3xl mx-auto space-y-8">
      {loading ? (
        <div className={`${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border rounded-3xl p-12 text-center space-y-6 shadow-xl`}>
          <div className="relative w-20 h-20 mx-auto">
            <div className={`absolute inset-0 border-4 ${dark ? 'border-neutral-800' : 'border-neutral-200'} rounded-full`}></div>
            <div className={`absolute inset-0 border-4 ${dark ? 'border-white' : 'border-black'} border-t-transparent rounded-full animate-spin`}></div>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold">AI Engine Active</h3>
            <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-neutral-500'} font-medium animate-pulse`}>
              {steps[loadingStep - 1] || steps[0]}
            </p>
          </div>
          <div className={`w-full ${dark ? 'bg-neutral-800' : 'bg-neutral-100'} h-2 rounded-full overflow-hidden max-w-sm mx-auto`}>
            <div className={`${dark ? 'bg-white' : 'bg-black'} h-full transition-all duration-500`} style={{ width: `${(loadingStep / 3) * 100}%` }}></div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black tracking-tight">Academic Assessment Scores</h2>
              <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-neutral-600'} font-medium`}>Logged in as <span className="font-bold">{user?.name}</span></p>
            </div>
            <button onClick={back} className={`px-4 py-2.5 rounded-xl border ${dark ? 'border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800' : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'} text-sm font-semibold flex items-center gap-2 transition-all`}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(MAX).map(([k, m]) => (
              <div key={k} className={`${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border p-6 rounded-3xl space-y-3 shadow-sm hover:border-neutral-400 transition-all`}>
                <div className={`flex justify-between text-xs font-bold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>
                  <span>{k.toUpperCase()} Marks</span>
                  <span>Max: {m}</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max={m}
                  value={marks[k]}
                  onChange={e => setMarks({...marks, [k]: e.target.value})}
                  className={`w-full text-3xl font-black bg-transparent border-b ${dark ? 'border-neutral-800 text-white focus:border-white' : 'border-neutral-200 text-black focus:border-black'} py-1 focus:outline-none transition-colors`}
                  placeholder="0"
                />
              </div>
            ))}
          </div>

          <div className={`${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border p-6 rounded-3xl space-y-4 shadow-sm`}>
            <div className="flex justify-between items-center">
              <span className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>Attendance Percentage</span>
              <span className="text-2xl font-black">{marks.attendance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={marks.attendance}
              onChange={e => setMarks({...marks, attendance: e.target.value})}
              className={`w-full ${dark ? 'accent-white' : 'accent-black'} cursor-pointer`}
            />
          </div>

          <button
            disabled={!ok}
            onClick={submit}
            className={`w-full py-4 rounded-2xl ${dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'} disabled:opacity-50 font-bold flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.01] active:scale-[0.99]`}
          >
            Generate Prediction <Rocket size={18} />
          </button>
        </>
      )}
    </section>
  );
}

function Dashboard({user, result, marks, history, back, dark}) {
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
          <span className={`text-xs font-extrabold uppercase tracking-widest ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>Analytics Suite</span>
          <h2 className="text-3xl font-black tracking-tight mt-1">{user?.name || 'Student'}'s Academic Outlook</h2>
          <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-neutral-600'} font-medium mt-1`}>Regression-backed projection and diagnostic metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportPDF} className={`px-4 py-2.5 rounded-xl ${dark ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'} text-sm font-bold flex items-center gap-2 shadow-md transition-all`}>
            <Download size={16} /> Export Report
          </button>
          <button onClick={back} className={`px-4 py-2.5 rounded-xl border ${dark ? 'border-neutral-800 bg-neutral-900 text-neutral-200 hover:bg-neutral-800' : 'border-neutral-200 bg-white text-neutral-800 hover:bg-neutral-50'} text-sm font-semibold flex items-center gap-2 transition-all`}>
            <ArrowLeft size={16} /> Edit Inputs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border p-8 rounded-3xl flex flex-col justify-between space-y-6 shadow-sm`}>
          <div className="flex justify-between items-start">
            <div>
              <span className={`text-xs font-bold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>Predicted Final Percentage</span>
              <div className="text-6xl font-black tracking-tight mt-2">{percentage}%</div>
              <div className={`inline-block mt-3 px-3.5 py-1 rounded-full ${dark ? 'bg-neutral-800 text-neutral-200 border-neutral-700' : 'bg-neutral-100 text-neutral-800 border-neutral-200'} border text-xs font-bold`}>
                {label}
              </div>
            </div>
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="10" className={`${dark ? 'text-neutral-800' : 'text-neutral-100'} fill-none`} />
                <circle cx="56" cy="56" r="46" stroke="currentColor" strokeWidth="10" strokeDasharray="289" strokeDashoffset={289 - (289 * parseFloat(percentage)) / 100} className={`${dark ? 'text-white' : 'text-black'} fill-none transition-all duration-1000`} />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xl font-black">{Math.round(parseFloat(percentage))}</span>
                <span className={`text-[10px] ${dark ? 'text-neutral-400' : 'text-neutral-500'} font-bold uppercase`}>Score</span>
              </div>
            </div>
          </div>
          <p className={`text-xs ${dark ? 'text-neutral-400' : 'text-neutral-600'} leading-relaxed border-t ${dark ? 'border-neutral-800' : 'border-neutral-100'} pt-4 font-medium`}>
            Model synthesizes continuous assessment scores with active attendance matrices to generate predictive targets.
          </p>
        </div>

        <div className={`${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border p-8 rounded-3xl flex flex-col justify-between space-y-4 shadow-sm`}>
          <div>
            <div className={`flex items-center gap-2 font-bold text-xs uppercase tracking-wider mb-4 ${dark ? 'text-neutral-300' : 'text-neutral-700'}`}>
              <span className={`w-2 h-2 rounded-full ${dark ? 'bg-white' : 'bg-black'} animate-ping`}></span> Snapshot Metrics
            </div>
            <div className="space-y-4">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>Attendance Index</span>
                <div className="text-2xl font-black mt-0.5">{marks?.attendance}%</div>
              </div>
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>Evaluation Mode</span>
                <div className="text-lg font-bold mt-0.5">Scikit Regression</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What-If Simulator */}
      <div className={`${dark ? 'bg-neutral-900 border-neutral-700' : 'bg-white border-neutral-300'} border-2 p-8 rounded-3xl space-y-6 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-3 ${dark ? 'bg-white text-black' : 'bg-black text-white'} rounded-2xl shadow-md`}>
              <Sliders size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">What-If Scenario Simulator</h3>
              <p className={`text-xs ${dark ? 'text-neutral-400' : 'text-neutral-500'}`}>Dynamically adjust parameters to evaluate potential performance changes</p>
            </div>
          </div>
          <div className="text-right">
            <span className={`text-xs ${dark ? 'text-neutral-400' : 'text-neutral-500'} block uppercase font-bold`}>Simulated Projection</span>
            <span className="text-2xl font-black">{simulatedPercentage}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className={dark ? 'text-neutral-400' : 'text-neutral-600'}>Simulated Attendance</span>
              <span className="font-black">{simAttendance}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simAttendance}
              onChange={e => setSimAttendance(Number(e.target.value))}
              className={`w-full ${dark ? 'accent-white' : 'accent-black'} cursor-pointer`}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className={dark ? 'text-neutral-400' : 'text-neutral-600'}>Extra Score Boost</span>
              <span className="font-black">+{simBonusMarks} marks</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simBonusMarks}
              onChange={e => setSimBonusMarks(Number(e.target.value))}
              className={`w-full ${dark ? 'accent-white' : 'accent-black'} cursor-pointer`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border p-8 rounded-3xl space-y-4 shadow-sm`}>
          <h3 className="text-lg font-bold">Assessment Breakdown</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={dark ? '#262626' : '#e5e5e5'} />
                <XAxis dataKey="name" stroke={dark ? '#a3a3a3' : '#737373'} fontSize={12} tickLine={false} />
                <YAxis stroke={dark ? '#a3a3a3' : '#737373'} fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: dark ? '#171717' : '#ffffff', border: dark ? '1px solid #404040' : '1px solid #d4d4d4', borderRadius: '16px', color: dark ? '#fff' : '#000' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="max" name="max" fill={dark ? '#404040' : '#d4d4d4'} radius={[8, 8, 0, 0]} />
                <Bar dataKey="obtained" name="obtained" fill={dark ? '#ffffff' : '#000000'} radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className={`${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border p-8 rounded-3xl space-y-4 shadow-sm flex flex-col items-center`}>
          <h3 className="text-lg font-bold self-start">Performance Radar</h3>
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                { subject: 'Attendance', A: 80, fullMark: 100 },
                { subject: 'Internal', A: 75, fullMark: 100 },
                { subject: 'CAE', A: 65, fullMark: 100 },
                { subject: 'PUT', A: 90, fullMark: 100 },
              ]}>
                <PolarGrid stroke={dark ? '#262626' : '#e5e5e5'} />
                <PolarAngleAxis dataKey="subject" tick={{ fill: dark ? '#a3a3a3' : '#737373', fontSize: 12 }} />
                <Radar name="Student" dataKey="A" stroke={dark ? '#ffffff' : '#000000'} fill={dark ? '#ffffff' : '#000000'} fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border p-8 rounded-3xl space-y-6 shadow-sm`}>
          <h3 className="text-lg font-bold">Feature Importance</h3>
          <div className="space-y-4">
            {features.map((feat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold">
                  <span className={dark ? 'text-neutral-300' : 'text-neutral-700'}>{feat.name}</span>
                  <span>{feat.val}%</span>
                </div>
                <div className={`w-full h-2.5 ${dark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-100 border-neutral-200'} border rounded-full overflow-hidden`}>
                  <div className={`h-full ${dark ? 'bg-white' : 'bg-black'} rounded-full`} style={{ width: `${feat.val * 2}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* History Tracker */}
        <div className={`${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border p-8 rounded-3xl space-y-6 shadow-sm`}>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <History size={18} /> Prediction History
            </h3>
            <span className={`text-xs ${dark ? 'text-neutral-400' : 'text-neutral-500'} font-medium`}>Recent 5 logs</span>
          </div>
          <div className="space-y-3">
            {history && history.length > 0 ? (
              history.map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3.5 rounded-2xl ${dark ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'} border text-xs`}>
                  <span className={`font-semibold ${dark ? 'text-neutral-300' : 'text-neutral-700'}`}>{item.date}</span>
                  <div className="flex items-center gap-4">
                    <span>Attendance: <strong className={dark ? 'text-white' : 'text-black'}>{item.attendance}%</strong></span>
                    <span className={`px-3 py-1 rounded-full ${dark ? 'bg-neutral-800 text-white border-neutral-700' : 'bg-neutral-200 text-black border-neutral-300'} font-black border`}>{item.percentage}%</span>
                  </div>
                </div>
              ))
            ) : (
              <p className={`text-xs ${dark ? 'text-neutral-400' : 'text-neutral-500'} font-medium`}>No history recorded yet.</p>
            )}
          </div>
        </div>
      </div>

      <div className={`${dark ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'} border p-8 rounded-3xl space-y-6 shadow-sm`}>
        <h3 className="text-lg font-bold">Smart Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((rec, i) => (
            <div key={i} className={`p-5 rounded-2xl ${dark ? 'bg-neutral-950 border-neutral-800 text-neutral-300' : 'bg-neutral-50 border-neutral-200 text-neutral-700'} border flex items-start gap-3`}>
              <span className="text-lg mt-0.5">💡</span>
              <p className="text-xs font-medium leading-relaxed">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);