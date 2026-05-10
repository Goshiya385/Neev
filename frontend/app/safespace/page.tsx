'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import { getToken } from '@/lib/auth';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ML = 'http://localhost:8000';

const MOODS = [
  { value: 'stressed', icon: '😰', label: 'Stressed' },
  { value: 'anxious', icon: '😟', label: 'Anxious' },
  { value: 'overwhelmed', icon: '🤯', label: 'Overwhelmed' },
  { value: 'sad', icon: '😢', label: 'Sad' },
  { value: 'confused', icon: '😵', label: 'Confused' },
  { value: 'neutral', icon: '😐', label: 'Just checking in' },
  { value: 'hopeful', icon: '🌱', label: 'Hopeful' },
];

export default function SafeSpacePage() {
  const [mood, setMood] = useState('');
  const [concern, setConcern] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<any>(null);

  const getSupport = async () => {
    if (!mood) return;
    setLoading(true);
    try {
      const [safeRes, weatherRes] = await Promise.all([
        fetch(`${ML}/ml/guidance/safe-space`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { mood, concern, name: 'Student', cgpa: 7, backlogs: 0, streak: 3 } })
        }),
        fetch(`${ML}/ml/guidance/academic-weather`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { mood, streak: 3, attendance: 75, cgpa: 7, backlogs: 0 } })
        })
      ]);
      setResponse(await safeRes.json());
      setWeatherData(await weatherRes.json());
    } catch { setResponse({ message: "We're here for you. Take a deep breath. 🌿", affirmation: "You are enough.", breathing_exercise: "4-7-8: Inhale 4s, Hold 7s, Exhale 8s", small_win: "Listen to your favorite song right now.", reminder: "Your worth is not your CGPA. 💛" }); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12 max-w-[700px]">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent text-[10px] tracking-[0.2em] uppercase mb-3">Safe Space</p>
            <h1 className="font-syne text-[42px] font-bold leading-tight mb-3">You&apos;re Not Alone 💚</h1>
            <p className="text-muted text-base mb-12">This is your space. No judgement. No pressure. Just support.</p>

            {/* Mood Selection */}
            <div className="mb-10">
              <p className="text-muted text-[10px] tracking-[0.15em] uppercase mb-4">How are you feeling right now?</p>
              <div className="grid grid-cols-4 gap-3">
                {MOODS.map(m => (
                  <button key={m.value} onClick={() => setMood(m.value)}
                    className={`py-4 rounded text-center transition-all border ${mood === m.value ? 'border-accent bg-accent/10' : 'border-border/30 hover:border-border/60'}`}>
                    <span className="text-2xl block mb-1">{m.icon}</span>
                    <span className="text-xs text-muted">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Concern Input */}
            <div className="mb-10">
              <p className="text-muted text-[10px] tracking-[0.15em] uppercase mb-4">Want to share what&apos;s on your mind? (Optional)</p>
              <textarea value={concern} onChange={e => setConcern(e.target.value)} rows={3}
                placeholder="Exams ka pressure, future ki tension, kuch bhi... sab safe hai yahan..."
                className="w-full bg-transparent border-b border-border/40 text-white text-base py-2 outline-none resize-none font-dm placeholder:text-muted/40" />
            </div>

            <button onClick={getSupport} disabled={!mood || loading}
              className="neev-btn text-sm disabled:opacity-30 mb-12">
              {loading ? 'Thinking...' : 'Get Support →'}
            </button>

            {/* Response */}
            <AnimatePresence>
              {response && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  
                  {/* Main Message */}
                  <div className="border-l-2 border-accent pl-6 py-2">
                    <p className="text-white text-lg leading-relaxed font-dm">{response.message}</p>
                  </div>

                  {/* Weather */}
                  {weatherData?.weather && (
                    <div className="rounded p-6 border border-border/30" style={{ borderLeftColor: weatherData.weather.color, borderLeftWidth: 3 }}>
                      <p className="text-2xl mb-1">{weatherData.weather.icon} {weatherData.weather.name}</p>
                      <p className="text-muted text-sm">{weatherData.weather.description}</p>
                      <p className="text-muted text-xs mt-2">{weatherData.weather.temperature}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {/* Affirmation */}
                    <div className="rounded p-5 border border-accent/20 bg-accent/5">
                      <p className="text-accent text-[10px] tracking-[0.12em] uppercase mb-2">Your Affirmation</p>
                      <p className="text-white font-dm text-lg italic">&ldquo;{response.affirmation}&rdquo;</p>
                    </div>

                    {/* Breathing */}
                    <div className="rounded p-5 border border-border/30">
                      <p className="text-muted text-[10px] tracking-[0.12em] uppercase mb-2">Quick Calm Down</p>
                      <p className="text-white font-dm text-sm">{response.breathing_exercise}</p>
                    </div>
                  </div>

                  {/* Perspective */}
                  {response.perspective && (
                    <div className="rounded p-5 border border-border/30">
                      <p className="text-muted text-[10px] tracking-[0.12em] uppercase mb-2">Another Way to See This</p>
                      <p className="text-white font-dm text-sm leading-relaxed">{response.perspective}</p>
                    </div>
                  )}

                  {/* Small Win */}
                  <div className="rounded p-5 border border-[#4ADE80]/30 bg-[#4ADE80]/5">
                    <p className="text-[#4ADE80] text-[10px] tracking-[0.12em] uppercase mb-2">Your Tiny Win for Today</p>
                    <p className="text-white font-dm">{response.small_win}</p>
                  </div>

                  {/* Reminder */}
                  <div className="text-center py-8 border-t border-border/20">
                    <p className="text-muted text-lg italic font-dm">{response.reminder}</p>
                  </div>

                  {/* Helpline */}
                  {response.resources && (
                    <div className="text-center">
                      <p className="text-muted text-xs mb-2">Need to talk to someone?</p>
                      {response.resources.map((r: string, i: number) => (
                        <p key={i} className="text-accent text-sm">{r}</p>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
