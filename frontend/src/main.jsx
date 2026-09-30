import React, { useState } from 'react';

const API_URL = import.meta.env?.VITE_API_URL || 'http://localhost:8000';

const FIELDS = [
  { name: 'studyHours', label: 'Study hours per week', unit: 'hrs', min: 0, max: 80, placeholder: '15', hint: 'Self-study outside class' },
  { name: 'attendance', label: 'Attendance', unit: '%', min: 0, max: 100, placeholder: '85', hint: 'Classes attended so far' },
  { name: 'previousScore', label: 'Previous score', unit: '/100', min: 0, max: 100, placeholder: '78', hint: 'Last exam or semester result' },
  { name: 'sleepHours', label: 'Sleep per day', unit: 'hrs', min: 0, max: 24, placeholder: '7', hint: 'Average over a typical week' },
];

const EMPTY = { studyHours: '', attendance: '', previousScore: '', sleepHours: '' };

function bandFor(score) {
  if (score >= 85) return { label: 'Excellent', tone: 'text-emerald-700', bar: '#059669', note: 'Strong outlook. Keep the current routine.' };
  if (score >= 70) return { label: 'Good', tone: 'text-blue-700', bar: '#1d4ed8', note: 'On track. Small gains are possible.' };
  if (score >= 50) return { label: 'Average', tone: 'text-amber-700', bar: '#d97706', note: 'Room to improve with more consistency.' };
  return { label: 'At risk', tone: 'text-rose-700', bar: '#e11d48', note: 'Needs support. Review study time and attendance.' };
}

function insights(d) {
  const out = [];
  const study = Number(d.studyHours), att = Number(d.attendance), sleep = Number(d.sleepHours);
  if (att < 75) out.push({ ok: false, text: 'Attendance is below 75%. This is often the fastest thing to fix.' });
  else out.push({ ok: true, text: 'Attendance is at a healthy level.' });
  if (study < 10) out.push({ ok: false, text: 'Under 10 study hours a week. Try adding a few focused sessions.' });
  else out.push({ ok: true, text: 'Study time is steady.' });
  if (sleep < 6 || sleep > 9) out.push({ ok: false, text: 'Sleep is outside the usual 6 to 9 hour range.' });
  else out.push({ ok: true, text: 'Sleep is within the recommended range.' });
  return out;
}

function ScoreRing({ score, color }) {
  const r = 54, c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  return (
    <svg viewBox="0 0 140 140" className="w-40 h-40" role="img" aria-label={`Predicted score ${score} out of 100`}>
      <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="12" />
      <circle
        cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c - (pct / 100) * c}
        transform="rotate(-90 70 70)" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
      />
      <text x="70" y="70" textAnchor="middle" fontSize="34" fontWeight="700" fill="#0f172a">{Math.round(pct)}</text>
      <text x="70" y="92" textAnchor="middle" fontSize="11" fill="#64748b">out of 100</text>
    </svg>
  );
}

export default function App() {
  const [formData, setFormData] = useState(EMPTY);
  const [result, setResult] = useState(null);
  const [submitted, setSubmitted] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleReset = () => {
    setFormData(EMPTY);
    setResult(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const data = await response.json();
      setResult(data.prediction ?? data.result);
      setSubmitted(formData);
    } catch (err) {
      console.error(err);
      setResult(null);
      setError('Could not reach the prediction service. Check that the backend is running and try again.');
    } finally {
      setLoading(false);
    }
  };

  const numeric = result !== null && result !== '' && !isNaN(Number(result));
  const score = numeric ? Number(result) : null;
  const band = numeric ? bandFor(score) : null;

  const inputCls =
    'w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 pr-14 text-sm text-slate-900 placeholder-slate-400 shadow-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-950 text-white grid place-items-center text-lg" aria-hidden="true">🎓</div>
            <div className="leading-tight">
              <p className="text-base font-semibold text-slate-900">EduPredict</p>
              <p className="text-xs text-slate-500">Student performance forecasting</p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Regression model
          </span>
        </div>
      </header>

      {/* Intro band */}
      <section className="bg-blue-950">
        <div className="max-w-6xl mx-auto px-6 py-10 sm:py-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight max-w-2xl">
            Forecast a student's exam score from four everyday habits
          </h1>
          <p className="mt-3 text-slate-300 text-sm sm:text-base max-w-xl">
            Enter study time, attendance, past performance and sleep. The model returns a predicted score and shows which habits to work on.
          </p>
        </div>
      </section>

      {/* Main */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-6 -mt-6 pb-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <section className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <h2 className="text-lg font-semibold">Student details</h2>
            <p className="text-sm text-slate-500 mt-1">All fields are required.</p>

            <form onSubmit={handleSubmit} className="mt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {FIELDS.map((f) => (
                  <div key={f.name}>
                    <label htmlFor={f.name} className="block text-sm font-medium text-slate-700 mb-1.5">
                      {f.label}
                    </label>
                    <div className="relative">
                      <input
                        id={f.name}
                        type="number"
                        name={f.name}
                        min={f.min}
                        max={f.max}
                        step="any"
                        value={formData[f.name]}
                        onChange={handleChange}
                        placeholder={f.placeholder}
                        required
                        className={inputCls}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-slate-400">
                        {f.unit}
                      </span>
                    </div>
                    <p className="mt-1.5 text-xs text-slate-500">{f.hint}</p>
                  </div>
                ))}
              </div>

              {error && (
                <div role="alert" className="mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                  {error}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="sm:w-32 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
                >
                  Clear form
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                >
                  {loading ? 'Predicting...' : 'Predict score'}
                </button>
              </div>
            </form>
          </section>

          {/* Result */}
          <aside className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8" aria-live="polite">
            <h2 className="text-lg font-semibold">Prediction</h2>

            {result === null || result === '' ? (
              <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <p className="text-sm font-medium text-slate-700">No prediction yet</p>
                <p className="mt-1 text-sm text-slate-500">Fill in the form and select Predict score to see the result here.</p>
              </div>
            ) : (
              <div className="mt-4">
                {numeric ? (
                  <>
                    <div className="flex flex-col items-center">
                      <ScoreRing score={score} color={band.bar} />
                      <p className={`mt-2 text-xl font-semibold ${band.tone}`}>{band.label}</p>
                      <p className="mt-1 text-sm text-slate-500 text-center max-w-xs">{band.note}</p>
                    </div>

                    <div className="mt-6 border-t border-slate-200 pt-5">
                      <h3 className="text-sm font-semibold text-slate-800">What the inputs suggest</h3>
                      <ul className="mt-3 space-y-2.5">
                        {insights(submitted).map((i, idx) => (
                          <li key={idx} className="flex gap-2.5 text-sm text-slate-600">
                            <span
                              className={`mt-0.5 h-5 w-5 shrink-0 rounded-full grid place-items-center text-xs font-bold ${
                                i.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              }`}
                              aria-hidden="true"
                            >
                              {i.ok ? '✓' : '!'}
                            </span>
                            {i.text}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                ) : (
                  <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-center">
                    <p className="text-xs text-slate-500">Model output</p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">{String(result)}</p>
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>

        <p className="mt-6 text-xs text-slate-500 max-w-2xl">
          Predictions are estimates from a statistical model and should support, not replace, a teacher's judgement.
        </p>
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-5 text-xs text-slate-500 flex flex-col sm:flex-row gap-1 sm:justify-between">
          <span>EduPredict · Student Performance Predictor</span>
          <span>Built with React, Tailwind CSS and FastAPI</span>
        </div>
      </footer>
    </div>
  );
}
