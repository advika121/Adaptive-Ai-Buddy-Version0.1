import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Zap, Lightbulb, ClipboardCheck, Sparkles, ChevronRight, History, Trash2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './App.css';

const App = () => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [mode, setMode] = useState('explain');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('study_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('study_history', JSON.stringify(history));
  }, [history]);

  const modes = [
    { id: 'explain', label: 'Explain', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'quiz', label: 'Quiz Me', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'summarize', label: 'Summarize', icon: <ClipboardCheck className="w-5 h-5" /> },
    { id: 'examples', label: 'Examples', icon: <Lightbulb className="w-5 h-5" /> },
  ];

  const levels = [
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'expert', label: 'Expert' },
  ];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to start learning.');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const res = await fetch('http://localhost:3000/api/study', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, level, mode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate response');

      setResponse(data.response);
      
      // Add to history
      const newEntry = { topic, level, mode, timestamp: new Date().toISOString() };
      setHistory(prev => [newEntry, ...prev].slice(0, 10));
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleHistoryClick = (item) => {
    setTopic(item.topic);
    setLevel(item.level);
    setMode(item.mode);
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('study_history');
  };

  return (
    <div className="min-h-screen p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <header className="w-full max-w-4xl mb-12 flex justify-between items-center fade-in">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-900/20">
            <Zap className="text-white w-6 h-6 fill-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Study <span className="gradient-text">Buddy</span>
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1"><Sparkles className="w-4 h-4 text-cyan-400" /> AI-Powered</span>
          <span>Adaptive Learning</span>
        </div>
      </header>

      <main className="w-full max-w-2xl space-y-8">
        {/* Hero */}
        <div className="text-center space-y-4 mb-10 fade-in">
          <h2 className="text-4xl md:text-5xl font-serif leading-tight">
            Master any subject, <br />
            <span className="italic opacity-80">tailored to you.</span>
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            Our AI tutor adjusts its complexity to match your expertise level perfectly.
          </p>
        </div>

        {/* Configuration Card */}
        <section className="glass-card p-6 md:p-8 space-y-6 fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
            <span>Configure Session</span>
            <div className="flex-1 h-px bg-gray-800"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <label className="text-sm font-medium text-gray-400">What do you want to learn?</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Quantum Physics, React Hooks..."
                className="w-full bg-[#1e293b] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all placeholder:text-gray-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400">Your Level</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-[#1e293b] border border-gray-700 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all appearance-none cursor-pointer"
              >
                {levels.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-400">Learning Mode</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {modes.map(m => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                    mode === m.id
                      ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.1)]'
                      : 'border-gray-700 bg-transparent text-gray-500 hover:border-gray-500 hover:text-gray-300'
                  }`}
                >
                  {m.icon}
                  <span className="text-xs font-semibold">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="btn-primary w-full py-4 text-lg"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Analyzing...
              </span>
            ) : (
              <>
                Start Learning <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </section>

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-lg flex items-center gap-3 fade-in">
            <div className="p-1 bg-red-500 rounded-full">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Output Section */}
        {(response || loading) && (
          <section className="glass-card overflow-hidden fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-[#1e293b]/50 border-bottom border-gray-800 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-orange-400 animate-pulse' : 'bg-green-400'}`}></div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  {loading ? 'Generating Insight...' : `${mode.charAt(0).toUpperCase() + mode.slice(1)} Result`}
                </span>
              </div>
              {!loading && (
                <button
                  onClick={() => navigator.clipboard.writeText(response)}
                  className="text-xs hover:text-cyan-400 transition-colors bg-gray-800 px-3 py-1 rounded-full border border-gray-700"
                >
                  Copy Markdown
                </button>
              )}
            </div>
            <div className="p-6 md:p-8 prose prose-invert max-w-none">
              {loading ? (
                <div className="space-y-4">
                  <div className="h-4 bg-gray-800 rounded w-3/4 animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-full animate-pulse"></div>
                  <div className="h-4 bg-gray-800 rounded w-5/6 animate-pulse"></div>
                </div>
              ) : (
                <article className="response-content">
                  <ReactMarkdown>{response}</ReactMarkdown>
                </article>
              )}
            </div>
          </section>
        )}

        {/* History Section */}
        {history.length > 0 && (
          <section className="space-y-4 fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <History className="w-4 h-4" /> Recent Insights
              </h3>
              <button onClick={clearHistory} className="text-gray-600 hover:text-red-400 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {history.map((h, i) => (
                <button
                  key={i}
                  onClick={() => handleHistoryClick(h)}
                  className="bg-gray-800/50 hover:bg-gray-700/50 border border-gray-700 rounded-full px-4 py-2 text-xs font-medium text-gray-400 transition-all hover:border-gray-500"
                >
                  {h.topic}
                </button>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="w-full max-w-4xl mt-20 py-8 border-t border-gray-800 text-center text-gray-600 text-xs">
        <p>© 2026 Study Buddy AI · Personalised Learning for Professionals</p>
      </footer>
    </div>
  );
};

export default App;
