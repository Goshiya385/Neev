'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import { simulateWhatIf } from '@/lib/api';
import { getUser } from '@/lib/auth';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

const scenarios = [
  { id: 'improve_marks', icon: '📈', title: 'Improve Marks', desc: 'What if I improve my marks by X%?', param: 'improvement_percent', label: 'Improvement %', min: 5, max: 50, default: 15 },
  { id: 'drop_subject', icon: '💀', title: 'Fail a Subject', desc: 'What if I fail a subject?', param: 'subject', label: 'Subject Name', type: 'text', default: 'Mathematics' },
  { id: 'change_goal', icon: '🔄', title: 'Change Career Goal', desc: 'What if I switch my career path?', param: 'new_goal', label: 'New Goal', type: 'select', options: ['Full Stack', 'AI/ML', 'Data Science', 'Cybersecurity'], default: 'AI/ML' },
];

export default function WhatIfPage() {
  const user = getUser();
  const [active, setActive] = useState<string | null>(null);
  const [params, setParams] = useState<Record<string, any>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const simulate = async (scenarioId: string) => {
    setLoading(true);
    try {
      const r = await simulateWhatIf({
        scenario: scenarioId,
        currentCGPA: user?.cgpa || 7,
        currentSemester: user?.semester || 4,
        params: params
      });
      setResult(r.data);
      setActive(scenarioId);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim}>
            <h1 className="font-syne text-[48px] font-bold">What-If Simulator</h1>
            <p className="text-muted text-sm mt-2">See how different decisions affect your future</p>
          </motion.div>
        </section>

        {/* Scenario Cards */}
        <section className="py-8">
          <div className="grid grid-cols-3 gap-6">
            {scenarios.map((s, i) => (
              <motion.div key={s.id} className={`border rounded p-6 cursor-pointer transition-all ${
                active === s.id ? 'border-accent bg-accent/5' : 'border-border/30 hover:border-border'
              }`} onClick={() => setActive(s.id)}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                <p className="text-3xl mb-3">{s.icon}</p>
                <h3 className="font-syne font-semibold">{s.title}</h3>
                <p className="text-muted text-xs mt-1">{s.desc}</p>

                {/* Input */}
                <div className="mt-4">
                  {s.type === 'text' ? (
                    <input placeholder={s.label} value={params[s.param] || s.default}
                      onChange={e => setParams({...params, [s.param]: e.target.value})}
                      onClick={e => e.stopPropagation()} className="neev-input text-sm" />
                  ) : s.type === 'select' ? (
                    <select value={params[s.param] || s.default}
                      onChange={e => setParams({...params, [s.param]: e.target.value})}
                      onClick={e => e.stopPropagation()} className="neev-input bg-transparent text-sm">
                      {s.options?.map(o => <option key={o} value={o} className="bg-surface">{o}</option>)}
                    </select>
                  ) : (
                    <div onClick={e => e.stopPropagation()}>
                      <label className="text-xs text-muted">{s.label}: {params[s.param] || s.default}%</label>
                      <input type="range" min={s.min} max={s.max} value={params[s.param] || s.default}
                        onChange={e => setParams({...params, [s.param]: +e.target.value})}
                        className="w-full accent-[#F5A623]" />
                    </div>
                  )}
                </div>

                <button onClick={(e) => { e.stopPropagation(); simulate(s.id); }}
                  className="neev-btn text-xs mt-4 w-full" disabled={loading}>
                  {loading && active === s.id ? 'Simulating...' : 'Simulate →'}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ═══ AI RESULT ═══ */}
        {result && (
          <section className="py-12">
            <motion.div {...anim} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-8">Simulation Result</h2>

              {/* Before / After */}
              <div className="grid grid-cols-2 gap-12 mb-8">
                <div className="text-center">
                  <p className="text-muted text-xs uppercase mb-2">Current</p>
                  <p className="font-syne text-5xl font-bold text-white">{result.currentCGPA}</p>
                  <p className="text-muted text-sm mt-1">CGPA</p>
                </div>
                <div className="text-center">
                  <p className="text-muted text-xs uppercase mb-2">Projected</p>
                  <p className={`font-syne text-5xl font-bold ${result.impact === 'positive' ? 'text-accent2' : result.impact === 'negative' ? 'text-danger' : 'text-info'}`}>
                    {result.projectedCGPA || result.newGoal || '—'}
                  </p>
                  <p className="text-muted text-sm mt-1">{result.impact === 'positive' ? '📈 Improvement' : result.impact === 'negative' ? '📉 Risk' : '🔄 Change'}</p>
                </div>
              </div>

              {/* Message */}
              <div className={`border-l-4 py-4 px-6 mb-6 ${result.impact === 'positive' ? 'border-accent2' : result.impact === 'negative' ? 'border-danger' : 'border-info'}`}>
                <p className="text-sm font-dm">{result.message}</p>
              </div>

              {/* Tips */}
              {result.tips?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted mb-2">💡 Recommendations</p>
                  {result.tips.map((t: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-accent">→</span>
                      <span className="text-white/80">{t}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </section>
        )}
      </main>
    </div>
  );
}
