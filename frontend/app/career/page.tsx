'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';

const ML = 'http://localhost:8000';

const GOALS = [
  { value: 'higher_studies', icon: '🎓', label: 'Higher Studies', desc: 'MS/M.Tech/PhD' },
  { value: 'job', icon: '💼', label: 'Job/Placement', desc: 'Campus/Off-campus' },
  { value: 'startup', icon: '🚀', label: 'Startup', desc: 'Build something' },
  { value: 'undecided', icon: '🤔', label: 'Confused', desc: 'Help me decide' },
];

const INTERESTS = ['Web Dev', 'AI/ML', 'Data Science', 'Cybersecurity', 'Cloud/DevOps', 'Mobile Dev', 'Blockchain', 'IoT', 'Game Dev', 'Backend', 'Frontend', 'Full Stack'];
const EXAMS = ['GATE', 'GRE', 'CAT', 'TOEFL', 'IELTS', 'TCS NQT', 'Infosys InfyTQ', 'AMCAT', 'Wipro NLTH', 'None'];

const TRENDING = [
  { name: 'AI/ML Engineering', trend: '🔥 Hot', growth: '+45%', icon: '🤖' },
  { name: 'Cloud & DevOps', trend: '📈 Rising', growth: '+38%', icon: '☁️' },
  { name: 'Cybersecurity', trend: '🔥 Hot', growth: '+35%', icon: '🔐' },
  { name: 'Full Stack Dev', trend: '📊 Stable', growth: '+25%', icon: '💻' },
  { name: 'Data Engineering', trend: '📈 Rising', growth: '+40%', icon: '📊' },
  { name: 'Blockchain/Web3', trend: '📉 Cooling', growth: '+10%', icon: '⛓️' },
  { name: 'Gen AI / LLM Ops', trend: '🔥🔥 Explosive', growth: '+120%', icon: '✨' },
  { name: 'Edge Computing', trend: '📈 Rising', growth: '+30%', icon: '📡' },
];

export default function CareerPage() {
  const [goal, setGoal] = useState('');
  const [interests, setInterests] = useState<string[]>([]);
  const [exams, setExams] = useState<string[]>([]);
  const [cgpa, setCgpa] = useState(7.0);
  const [semester, setSemester] = useState(4);
  const [budget, setBudget] = useState('moderate');
  const [countryPref, setCountryPref] = useState('any');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [weeklyRef, setWeeklyRef] = useState<any>(null);

  const toggleInterest = (i: string) => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  const toggleExam = (e: string) => setExams(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const getGuidance = async () => {
    if (!goal) return;
    setLoading(true);
    try {
      const [careerRes, reflectionRes] = await Promise.all([
        fetch(`${ML}/ml/guidance/career-path`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { goal, interests, cgpa, semester, budget, countryPreference: countryPref, examPrep: exams, branch: 'CSE' } })
        }),
        fetch(`${ML}/ml/guidance/weekly-reflection`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { name: 'Student', cgpa, streak: 5, tasksDone: 3, tasksTotal: 5, weekAttendance: 78 } })
        })
      ]);
      setResult(await careerRes.json());
      setWeeklyRef(await reflectionRes.json());
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-accent text-[10px] tracking-[0.2em] uppercase mb-3">AI Career Intelligence</p>
            <h1 className="font-syne text-[42px] font-bold leading-tight mb-2">Your Future, Mapped 🚀</h1>
            <p className="text-muted text-base mb-10">AI analyzes your profile and guides you — Higher Studies, Job, or Startup.</p>
          </motion.div>
        </section>

        {/* ═══ TRENDING TECH RADAR ═══ */}
        <section className="mb-12">
          <p className="text-muted text-[10px] tracking-[0.15em] uppercase mb-4">🔥 Trending Technologies — 2024-25</p>
          <div className="grid grid-cols-4 gap-3">
            {TRENDING.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="border border-border/30 rounded p-4 hover:border-accent/40 transition-colors">
                <p className="text-2xl mb-2">{t.icon}</p>
                <p className="text-white text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-muted mt-1">{t.trend}</p>
                <p className="text-accent text-xs font-bold">{t.growth} job growth</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ INPUTS ═══ */}
        <section className="border border-border/30 rounded p-8 bg-surface/10 mb-10">
          <h2 className="font-syne text-lg font-semibold mb-6">Tell us about yourself</h2>

          {/* Goal */}
          <p className="text-muted text-[10px] tracking-[0.15em] uppercase mb-3">What&apos;s your goal?</p>
          <div className="grid grid-cols-4 gap-3 mb-8">
            {GOALS.map(g => (
              <button key={g.value} onClick={() => setGoal(g.value)}
                className={`py-5 rounded text-center border transition-all ${goal === g.value ? 'border-accent bg-accent/10' : 'border-border/30 hover:border-border/60'}`}>
                <span className="text-3xl block mb-2">{g.icon}</span>
                <span className="text-sm font-semibold block">{g.label}</span>
                <span className="text-xs text-muted">{g.desc}</span>
              </button>
            ))}
          </div>

          {/* Interests */}
          <p className="text-muted text-[10px] tracking-[0.15em] uppercase mb-3">Your Interests (select multiple)</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {INTERESTS.map(i => (
              <button key={i} onClick={() => toggleInterest(i)}
                className={`px-4 py-2 rounded text-xs border transition-all ${interests.includes(i) ? 'border-accent bg-accent/10 text-accent' : 'border-border/30 text-muted hover:border-border/50'}`}>
                {i}
              </button>
            ))}
          </div>

          {/* Academic Details */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div>
              <label className="text-xs text-muted block mb-2">CGPA: {cgpa}</label>
              <input type="range" min="2" max="10" step="0.1" value={cgpa} onChange={e => setCgpa(+e.target.value)} className="w-full accent-[#F5A623]" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-2">Semester: {semester}</label>
              <input type="range" min="1" max="8" value={semester} onChange={e => setSemester(+e.target.value)} className="w-full accent-[#F5A623]" />
            </div>
            <div>
              <label className="text-xs text-muted block mb-2">Budget</label>
              <select value={budget} onChange={e => setBudget(e.target.value)} className="neev-input bg-transparent text-sm">
                <option value="low" className="bg-surface">Low (Under 5L)</option>
                <option value="moderate" className="bg-surface">Moderate (5-15L)</option>
                <option value="high" className="bg-surface">High (15L+)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-muted block mb-2">Country Preference</label>
              <select value={countryPref} onChange={e => setCountryPref(e.target.value)} className="neev-input bg-transparent text-sm">
                <option value="any" className="bg-surface">Any</option>
                <option value="india" className="bg-surface">India</option>
                <option value="usa" className="bg-surface">USA</option>
                <option value="europe" className="bg-surface">Europe</option>
                <option value="canada" className="bg-surface">Canada</option>
              </select>
            </div>
          </div>

          {/* Exams */}
          <p className="text-muted text-[10px] tracking-[0.15em] uppercase mb-3">Exams preparing for</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {EXAMS.map(e => (
              <button key={e} onClick={() => toggleExam(e)}
                className={`px-4 py-2 rounded text-xs border transition-all ${exams.includes(e) ? 'border-accent bg-accent/10 text-accent' : 'border-border/30 text-muted'}`}>
                {e}
              </button>
            ))}
          </div>

          <button onClick={getGuidance} disabled={!goal || loading} className="neev-btn text-sm disabled:opacity-30">
            {loading ? 'AI is thinking...' : '🧠 Get AI Career Guidance →'}
          </button>
        </section>

        {/* ═══ RESULTS ═══ */}
        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">

              {/* Recommended Path */}
              <div className="text-center py-8">
                <p className="text-muted text-[10px] tracking-[0.2em] uppercase mb-4">AI Recommends</p>
                <p className="font-syne text-[48px] font-bold text-accent">{result.recommended_path}</p>
                {result.confidence && <p className="text-muted text-sm mt-2">Confidence: {Math.round(result.confidence * 100)}%</p>}
                {result.motivation && <p className="text-white/80 text-base mt-4 italic">{result.motivation}</p>}
              </div>

              {/* Roadmap Phases */}
              {result.roadmap && (
                <div>
                  <p className="text-muted text-[10px] tracking-[0.15em] uppercase mb-4">Your Roadmap</p>
                  <div className="space-y-4">
                    {result.roadmap.map((phase: any, i: number) => (
                      <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.15 }}
                        className="border-l-2 border-accent/50 pl-6 py-3">
                        <p className="text-accent font-syne font-bold text-sm mb-2">{phase.phase}</p>
                        {phase.tasks?.map((t: string, j: number) => (
                          <p key={j} className="text-muted text-sm py-0.5">→ {t}</p>
                        ))}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-6">
                {/* Exams */}
                {result.exams_to_consider && (
                  <div className="border border-border/30 rounded p-6">
                    <p className="text-muted text-[10px] tracking-[0.12em] uppercase mb-3">📝 Exams to Consider</p>
                    <div className="flex flex-wrap gap-2">
                      {result.exams_to_consider.map((e: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-accent/10 border border-accent/30 rounded text-xs text-accent">{e}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {result.skills_needed && (
                  <div className="border border-border/30 rounded p-6">
                    <p className="text-muted text-[10px] tracking-[0.12em] uppercase mb-3">🛠️ Skills Needed</p>
                    <div className="flex flex-wrap gap-2">
                      {result.skills_needed.map((s: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-border/30 rounded text-xs">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Colleges */}
              {result.colleges && (
                <div className="border border-border/30 rounded p-6">
                  <p className="text-muted text-[10px] tracking-[0.12em] uppercase mb-3">🏫 Target Colleges/Companies</p>
                  <div className="grid grid-cols-3 gap-2">
                    {result.colleges.map((c: string, i: number) => (
                      <p key={i} className="text-sm py-2 border-b border-border/10">{c}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Resources */}
              {result.resources && (
                <div>
                  <p className="text-muted text-[10px] tracking-[0.12em] uppercase mb-3">📚 Resources</p>
                  <div className="grid grid-cols-2 gap-3">
                    {result.resources.map((r: any, i: number) => (
                      <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                        className="border border-border/30 rounded p-4 hover:border-accent/50 transition-colors flex justify-between">
                        <span className="text-white text-sm">{r.name}</span>
                        <span className="text-xs text-accent">{r.type}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Alternative Paths */}
              {result.alternative_paths && (
                <div className="border-t border-border/20 pt-6">
                  <p className="text-muted text-[10px] tracking-[0.12em] uppercase mb-3">🔄 Alternative Paths</p>
                  <div className="flex gap-3">
                    {result.alternative_paths.map((p: string, i: number) => (
                      <span key={i} className="px-4 py-2 bg-white/5 border border-border/30 rounded text-sm">{p}</span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ═══ WEEKLY REFLECTION ═══ */}
        {weeklyRef && (
          <section className="mt-12 border border-border/30 rounded p-8">
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted text-[10px] tracking-[0.15em] uppercase">📅 Weekly AI Reflection</p>
              <p className="font-syne text-3xl">{weeklyRef.emoji_summary}</p>
            </div>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <p className="text-[#4ADE80] text-xs uppercase mb-2">Wins</p>
                {weeklyRef.wins?.map((w: string, i: number) => <p key={i} className="text-sm text-muted py-0.5">✅ {w}</p>)}
              </div>
              <div>
                <p className="text-[#F87171] text-xs uppercase mb-2">Weak Points</p>
                {weeklyRef.weak_points?.map((w: string, i: number) => <p key={i} className="text-sm text-muted py-0.5">⚠️ {w}</p>)}
              </div>
              <div>
                <p className="text-accent text-xs uppercase mb-2">Next Week Focus</p>
                {weeklyRef.next_week_focus?.map((f: string, i: number) => <p key={i} className="text-sm text-muted py-0.5">🎯 {f}</p>)}
              </div>
            </div>
            {weeklyRef.quote && (
              <p className="text-center text-muted italic text-sm mt-6 border-t border-border/20 pt-4">&ldquo;{weeklyRef.quote}&rdquo;</p>
            )}
            <p className="text-center mt-4">
              <span className="font-syne text-2xl font-bold text-accent">Week Grade: {weeklyRef.grade}</span>
            </p>
          </section>
        )}
      </main>
    </div>
  );
}
