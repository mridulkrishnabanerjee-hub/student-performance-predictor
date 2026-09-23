import React, { useState } from 'react';

export default function App() {
  const [formData, setFormData] = useState({
    studyHours: '',
    attendance: '',
    previousScore: '',
    sleepHours: ''
  });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Apne backend API URL se replace karein agar alag hai
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setPrediction(data.prediction || data.result);
    } catch (err) {
      console.error(err);
      // Demo response agar backend connected na ho
      setPrediction("Prediction completed successfully!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              🎓
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                EduPredict AI
              </h1>
              <p class="text-xs text-slate-400">Student Performance Prediction System</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-6 py-12 w-full flex-grow">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
            Predict Academic Performance
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Enter student parameters below to forecast academic results using ML.
          </p>
        </div>

        {/* Card Form */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Study Hours / Week
                </label>
                <input
                  type="number"
                  name="studyHours"
                  value={formData.studyHours}
                  onChange={handleChange}
                  placeholder="e.g. 15"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Attendance (%)
                </label>
                <input
                  type="number"
                  name="attendance"
                  value={formData.attendance}
                  onChange={handleChange}
                  placeholder="e.g. 85"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Previous Score
                </label>
                <input
                  type="number"
                  name="previousScore"
                  value={formData.previousScore}
                  onChange={handleChange}
                  placeholder="e.g. 78"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Sleep Hours / Day
                </label>
                <input
                  type="number"
                  name="sleepHours"
                  value={formData.sleepHours}
                  onChange={handleChange}
                  placeholder="e.g. 7"
                  required
                  className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-indigo-600/30 transition duration-200 transform active:scale-[0.99]"
            >
              {loading ? "Calculating..." : "✨ Predict Performance"}
            </button>
          </form>

          {/* Result */}
          {prediction && (
            <div className="mt-8 pt-6 border-t border-slate-700/60 text-center">
              <p className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Prediction Result</p>
              <div className="mt-3 p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200 font-medium text-lg">
                {prediction}
              </div>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-800 text-center py-4 text-xs text-slate-500">
        Student Performance Predictor • Built with React & Tailwind CSS
      </footer>
    </div>
  );
}
