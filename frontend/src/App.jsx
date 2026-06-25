import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  // ML Predictor States
  const [formData, setFormData] = useState({ weekly_self_study_hours: 12.5, attendance_percentage: 88.0, class_participation: 6.5 });
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // NoSQL DB Logs State
  const [dbLogs, setDbLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // 🌟 NEW: CHATBOT INTERFACE STATES
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hello! I am your AI Academic Advisor. Based on your predictive model configurations, I can generate custom recovery roadmaps. What area of your academics can I help you optimize today?" }
  ]);
  const [userInput, setUserInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Auto scroll chat box down to newest message bubbles
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  // Handle Fetching Database History Logs
  const fetchDatabaseLogs = async () => {
    setLoadingLogs(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/history');
      if (response.ok) setDbLogs(await response.json());
    } catch (err) { console.error(err); }
    finally { setLoadingLogs(false); }
  };

  useEffect(() => {
    if (activeTab === 'dbLog') fetchDatabaseLogs();
  }, [activeTab]);

  // Handle Input Changes
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: parseFloat(e.target.value) });

  // Handle Grade Prediction Submit
  const handlePredict = async (e) => {
    e.preventDefault(); setLoading(true); setError(null); setPrediction(null);
    try {
      const response = await fetch('http://127.0.0.1:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Could not compute models.');
      const data = await response.json();
      setPrediction(data.predicted_grade);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  // 🌟 NEW: HANDLE SUBMITTING MESSAGES TO CHATBOT ENDPOINT
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMessageText = userInput;
    setMessages(prev => [...prev, { sender: 'user', text: userMessageText }]);
    setUserInput('');
    setChatLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessageText }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
      } else {
        throw new Error();
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: "Connection error. Please check your FastAPI terminal console logs." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* GLOBAL HEADER HEADER NAVBAR */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-500 to-emerald-500 flex items-center justify-center font-black text-slate-950">AI</div>
            <span className="text-xl font-black tracking-tight">Edu<span className="text-emerald-400">Predict</span></span>
          </div>
          
          <nav className="flex space-x-1 sm:space-x-2">
            <button onClick={() => setActiveTab('home')} className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${activeTab === 'home' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}>Home</button>
            <button onClick={() => setActiveTab('predict')} className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${activeTab === 'predict' ? 'bg-slate-800 text-emerald-400' : 'text-slate-400'}`}>ML Predictor</button>
            <button onClick={() => setActiveTab('chatbot')} className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${activeTab === 'chatbot' ? 'bg-slate-800 text-blue-400 border border-blue-900/30' : 'text-slate-400'}`}>💬 AI Chat Advisor</button>
            <button onClick={() => setActiveTab('dbLog')} className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition ${activeTab === 'dbLog' ? 'bg-slate-800 text-purple-400' : 'text-slate-400'}`}>Database Logs</button>
          </nav>
        </div>
      </header>

      {/* RENDER BODY DASHBOARD MODULES */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-12">
        
        {/* TAB 1: HOME PANEL */}
        {activeTab === 'home' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-4">
            <div className="lg:col-span-7 space-y-6">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest">Conversational Expansion Module</span>
              <h1 className="text-4xl sm:text-6xl font-black text-white leading-tight">Predict Performance. <br />Chat with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Generative AI</span></h1>
              <p className="text-slate-400 text-base">An enhanced educational stack combining predictive engineering with large language communication nodes. Evaluate grade outcomes natively, audit cloud data trails, and chat live with an automated student mentor.</p>
              <div className="flex gap-4">
                <button onClick={() => setActiveTab('predict')} className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 text-slate-950 font-black shadow-lg">Run Grade Predictor</button>
                <button onClick={() => setActiveTab('chatbot')} className="px-5 py-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 font-bold hover:bg-slate-800">Launch AI Chatbot →</button>
              </div>
            </div>
            <div className="lg:col-span-5">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80" alt="Dashboard Core Graphic" className="rounded-2xl border border-slate-800 shadow-2xl object-cover w-full h-[300px]" />
            </div>
          </div>
        )}

        {/* TAB 2: ML PREDICTOR MODULE */}
        {activeTab === 'predict' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto">
            <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">Metrics Processing Console</h2>
             <form onSubmit={handlePredict} className="space-y-6">

  {/* Weekly Study Hours */}
  <div>
    <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
      Weekly Self Study Hours
    </label>

    <input
      type="number"
      name="weekly_self_study_hours"
      min="0"
      max="30"
      step="0.1"
      value={formData.weekly_self_study_hours}
      onChange={handleChange}
      placeholder="Enter study hours"
      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
    />
  </div>

  {/* Attendance */}
  <div>
    <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
      Attendance Percentage
    </label>

    <input
      type="number"
      name="attendance_percentage"
      min="0"
      max="100"
      step="0.1"
      value={formData.attendance_percentage}
      onChange={handleChange}
      placeholder="Enter attendance %"
      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
    />
  </div>

  {/* Participation */}
  <div>
    <label className="block text-xs font-bold uppercase text-slate-400 mb-2">
      Class Participation (0-10)
    </label>

    <input
      type="number"
      name="class_participation"
      min="0"
      max="10"
      step="0.1"
      value={formData.class_participation}
      onChange={handleChange}
      placeholder="Enter participation"
      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500"
    />
  </div>

  <button
    type="submit"
    disabled={loading}
    className="w-full bg-gradient-to-r from-blue-500 to-emerald-500 text-slate-950 font-black py-4 rounded-xl shadow-md"
  >
    {loading ? "Running Model..." : "Execute Intelligence Forecast"}
  </button>

</form>
            </div>
            <div className="lg:col-span-6">
              {prediction ? (
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center shadow-xl space-y-6">
                  <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest">Assigned Class Boundary</h3>
                  <div className="text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">Grade {prediction}</div>
                  <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-2xl text-left">
                    <p className="text-slate-400 text-xs leading-relaxed">Matrix parameters locked. Want specific conversational tactics to alter this mathematical tracking bracket? Click below to load parameters inside the advisor engine.</p>
                    <button onClick={() => setActiveTab('chatbot')} className="mt-4 text-xs font-bold text-blue-400 hover:underline">Consult AI Chat Advisor →</button>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-800 rounded-3xl p-12 text-center text-slate-500 min-h-[340px] flex flex-col items-center justify-center">Awaiting metrics input vector submit execution.</div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* 🌟 NEW TAB: THE LIVE COMPREHENSIVE AI CHATBOT PORTAL */}
        {/* ========================================================= */}
        {activeTab === 'chatbot' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="bg-slate-900 p-5 border border-slate-800 rounded-2xl flex items-center justify-between shadow-md">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2"><span>💬</span> Academic Advisor AI Node</h2>
                <p className="text-slate-400 text-xs">Query text strings into the conversational generative response framework.</p>
              </div>
              <span className="px-2.5 py-1 text-[10px] font-bold tracking-widest uppercase bg-blue-950 border border-blue-800 text-blue-400 rounded-md animate-pulse">Live Link Active</span>
            </div>

            {/* Chat Conversation Stream Box Container */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl h-[420px] p-6 flex flex-col justify-between overflow-hidden shadow-2xl relative">
              <div className="overflow-y-auto space-y-4 pr-2 flex-grow scrollbar-thin scrollbar-thumb-slate-800">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed shadow-md ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none font-medium' 
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                
                {/* Typing Loader State */}
                {chatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-950 border border-slate-800 text-blue-400 text-xs rounded-2xl rounded-bl-none p-4 font-bold flex items-center gap-2 animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></span>
                      <span>AI Advisor compiling recovery metrics...</span>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input Chat Transmission Bar Form */}
              <form onSubmit={handleSendMessage} className="mt-4 pt-4 border-t border-slate-800 flex gap-2 items-center">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask me: 'How do I raise my study hours?' or 'Tell me how to track attendance'..."
                  className="flex-grow bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 font-medium transition"
                  disabled={chatLoading}
                />
                <button
                  type="submit"
                  disabled={chatLoading}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition shadow-md disabled:opacity-40"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: DATABASE HISTORY SUMMARY */}
        {activeTab === 'dbLog' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-between items-center bg-slate-900 p-6 border border-slate-800 rounded-2xl">
              <div>
                <h2 className="text-xl font-bold text-white">NoSQL Cloud Registry Audits</h2>
                <p className="text-slate-400 text-xs">Historical index array maps emitted straight out of MongoDB tables.</p>
              </div>
              <button onClick={fetchDatabaseLogs} className="px-3 py-1.5 bg-purple-950/40 text-purple-400 border border-purple-800 rounded-xl text-xs font-bold hover:bg-purple-950">Refresh Table Data</button>
            </div>
            {dbLogs.length === 0 ? (
              <div className="border border-dashed border-slate-800 rounded-xl p-12 text-center text-slate-500 text-xs">No entries. Execute predictions inside the model panel to inject structured documents into your cloud indexes.</div>
            ) : (
              <div className="overflow-hidden border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs bg-slate-900"><thead className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] tracking-wider font-bold"><tr><th className="p-4">Timestamp</th><th className="p-4">Study Data</th><th className="p-4">Attendance</th><th className="p-4">Participation</th><th className="p-4 text-center">Prediction</th></tr></thead><tbody className="divide-y divide-slate-800/50 font-mono text-slate-300">{dbLogs.map((log, index) => (<tr key={index} className="hover:bg-slate-850/20"><td className="p-4 text-slate-500 text-[11px]">{log.timestamp?.split('.')[0].replace('T', ' ')}</td><td className="p-4 text-blue-400">{log.weekly_self_study_hours} hrs</td><td className="p-4 text-emerald-400">{log.attendance_percentage}%</td><td className="p-4 text-purple-400">{log.class_participation} / 10</td><td className="p-4 text-center"><span className="px-2.5 py-0.5 bg-slate-950 rounded border border-slate-800 text-amber-400 font-bold font-sans">{log.predicted_grade}</span></td></tr>))}</tbody></table>
              </div>
            )}
          </div>
        )}

      </main>

      <footer className="bg-slate-950 border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <p>© 2026 Academic Analytics Lab. Full Stack Machine Learning Interface Blueprint Complete.</p>
      </footer>
    </div>
  );
}

export default App;