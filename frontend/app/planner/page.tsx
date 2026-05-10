'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import ShimmerLoader from '@/components/Shared/ShimmerLoader';
import { getCurrentWeek, addTask, completeTask, getStreak, predictWeeklyPlan } from '@/lib/api';
import { getUser } from '@/lib/auth';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

export default function PlannerPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [streak, setStreak] = useState<any>({ current: 0, longest: 0 });
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', category: 'Academics', priority: 'medium' });
  const [aiPlan, setAiPlan] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiHours, setAiHours] = useState(10);
  const [aiGoals, setAiGoals] = useState('');
  const user = getUser();

  const load = () => {
    Promise.all([getCurrentWeek(), getStreak()])
      .then(([w, s]) => {
        setTasks(Array.isArray(w.data) ? w.data : w.data?.tasks || []);
        setStreak(s.data || { current: 0, longest: 0 });
      }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await addTask(form); setShowAdd(false); setForm({ title: '', category: 'Academics', priority: 'medium' }); load(); } catch {}
  };

  const handleComplete = async (id: string) => {
    try { await completeTask(id); load(); } catch {}
  };

  const generateAIPlan = async () => {
    setAiLoading(true);
    try {
      const r = await predictWeeklyPlan({
        goals: aiGoals,
        hoursPerWeek: aiHours,
        careerGoal: user?.careerGoal || 'Full Stack',
        weakSubjects: [],
        currentSkills: [],
        backlogs: user?.backlogs || 0
      });
      setAiPlan(r.data);
    } catch {} finally { setAiLoading(false); }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><ShimmerLoader /></div>;

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim} className="flex items-center justify-between">
            <div>
              <h1 className="font-syne text-[48px] font-bold">Weekly Planner</h1>
              <p className="text-muted text-sm mt-2">{completedCount}/{tasks.length} tasks done this week</p>
            </div>
            <div className="flex items-center gap-4">
              {streak.current > 0 && <span className="bg-accent/10 text-accent px-3 py-1.5 rounded text-sm font-syne">🔥 {streak.current} day streak</span>}
              <button onClick={() => setShowAdd(!showAdd)} className="neev-btn text-sm">{showAdd ? '✕' : '+ Add Task'}</button>
            </div>
          </motion.div>
        </section>

        {/* Progress Bar */}
        <section className="py-4">
          <div className="w-full bg-border/30 rounded-full h-3">
            <motion.div className="h-3 rounded-full bg-accent" initial={{ width: 0 }}
              animate={{ width: `${progress}%` }} transition={{ duration: 0.8 }} />
          </div>
          <p className="text-muted text-xs mt-2">{progress}% complete</p>
        </section>

        {/* Add Task Form */}
        {showAdd && (
          <motion.form onSubmit={handleAdd} className="mb-8 p-6 border border-accent/20 rounded bg-surface/20"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-3 gap-4">
              <input placeholder="Task title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="neev-input" required />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="neev-input bg-transparent">
                {['Academics', 'DSA', 'Project', 'Placement', 'Skills', 'Other'].map(c => <option key={c} value={c} className="bg-surface">{c}</option>)}
              </select>
              <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="neev-input bg-transparent">
                <option value="critical" className="bg-surface">🔴 Critical</option>
                <option value="high" className="bg-surface">🟠 High</option>
                <option value="medium" className="bg-surface">🟡 Medium</option>
                <option value="low" className="bg-surface">🟢 Low</option>
              </select>
            </div>
            <button type="submit" className="neev-btn mt-4">Add Task →</button>
          </motion.form>
        )}

        {/* ═══ AI PLAN GENERATOR ═══ */}
        <section className="py-8">
          <motion.div {...anim} className="border border-border/30 rounded p-6 bg-surface/10">
            <h2 className="font-syne text-lg font-semibold mb-4">🤖 Generate AI Weekly Plan</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input placeholder="Your goals this week (e.g. finish DSA arrays, start project)" value={aiGoals}
                onChange={e => setAiGoals(e.target.value)} className="neev-input" />
              <div>
                <label className="text-xs text-muted">Available hours: {aiHours}h</label>
                <input type="range" min="5" max="40" value={aiHours} onChange={e => setAiHours(+e.target.value)} className="w-full accent-[#F5A623]" />
              </div>
            </div>
            <button onClick={generateAIPlan} disabled={aiLoading} className="neev-btn">
              {aiLoading ? '⚡ Generating...' : 'Generate Plan →'}
            </button>
          </motion.div>
        </section>

        {/* AI Plan Results */}
        {aiPlan && (
          <section className="py-8">
            <motion.div {...anim}>
              <div className="border-l-4 border-accent py-3 px-6 mb-6">
                <p className="text-sm">{aiPlan.message}</p>
                <p className="text-xs text-muted mt-1">{aiPlan.totalHours}h planned / {aiPlan.availableHours}h available</p>
              </div>
              <div className="space-y-3">
                {aiPlan.tasks?.map((t: any, i: number) => (
                  <motion.div key={i} className="flex items-center justify-between py-3 border-b border-border/20"
                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-2 py-0.5 rounded ${t.priority === 'critical' ? 'bg-danger/10 text-danger' : t.priority === 'high' ? 'bg-accent/10 text-accent' : 'bg-border/20 text-muted'}`}>
                        {t.priority}
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{t.title}</p>
                        <p className="text-xs text-muted">{t.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted">{t.hours}h</span>
                      <span className="text-[10px] uppercase text-info">{t.category}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* ═══ EXISTING TASKS ═══ */}
        <section className="py-8">
          <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">This Week&apos;s Tasks</h2>
          <div className="space-y-3">
            {tasks.map((t: any, i: number) => (
              <motion.div key={t._id || i} className="flex items-center gap-4 py-3 border-b border-border/20"
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                <button onClick={() => t._id && handleComplete(t._id)}
                  className={`w-5 h-5 rounded border flex items-center justify-center text-xs transition-all ${
                    t.completed ? 'bg-accent border-accent text-black' : 'border-border/50 hover:border-accent'
                  }`}>{t.completed ? '✓' : ''}</button>
                <div className="flex-1">
                  <p className={`text-sm ${t.completed ? 'line-through text-muted' : ''}`}>{t.title}</p>
                </div>
                <span className="text-[10px] uppercase text-muted">{t.category}</span>
              </motion.div>
            ))}
            {tasks.length === 0 && <p className="text-muted text-sm py-4">No tasks yet. Add manually or generate with AI!</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
