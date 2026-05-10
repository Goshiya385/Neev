'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import { predictRoadmap } from '@/lib/api';
import { getUser } from '@/lib/auth';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };
const goalOptions = ['Full Stack', 'AI/ML', 'Data Science', 'Cybersecurity', 'UI/UX', 'Web Development'];
const interestOptions = ['Web Dev', 'Mobile', 'AI/ML', 'Cloud', 'DevOps', 'Security', 'Data', 'Blockchain', 'IoT', 'Game Dev'];

export default function RoadmapPage() {
  const user = getUser();
  const [goal, setGoal] = useState(user?.careerGoal || 'Full Stack');
  const [semester, setSemester] = useState(user?.semester || 4);
  const [hours, setHours] = useState(10);
  const [interests, setInterests] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const toggleInterest = (i: string) => setInterests(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await predictRoadmap({ careerGoal: goal, semester, hoursPerWeek: hours, interests });
      setRoadmap(r.data);
      setGenerated(true);
    } catch {} finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim}>
            <h1 className="font-syne text-[48px] font-bold">AI Roadmap</h1>
            <p className="text-muted text-sm mt-2">Personalized learning path based on your goals</p>
          </motion.div>
        </section>

        {/* ═══ INPUT SECTION ═══ */}
        <section className="py-8">
          <motion.div {...anim} className="border border-border/30 rounded p-8 bg-surface/10">
            <h2 className="font-syne text-lg font-semibold mb-6">Tell me about your goals</h2>

            {/* Career Goal */}
            <div className="mb-6">
              <label className="text-xs text-muted uppercase tracking-wider mb-3 block">Career Goal</label>
              <div className="grid grid-cols-3 gap-3">
                {goalOptions.map(g => (
                  <button key={g} onClick={() => setGoal(g)}
                    className={`py-3 px-4 rounded text-sm font-dm border transition-all ${
                      goal === g ? 'border-accent bg-accent/10 text-accent' : 'border-border/30 text-muted hover:border-border'
                    }`}>{g}</button>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="mb-6">
              <label className="text-xs text-muted uppercase tracking-wider mb-3 block">Interest Areas</label>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map(i => (
                  <button key={i} onClick={() => toggleInterest(i)}
                    className={`px-3 py-1.5 rounded text-xs border transition-all ${
                      interests.includes(i) ? 'border-info bg-info/10 text-info' : 'border-border/30 text-muted hover:text-white'
                    }`}>{i}</button>
                ))}
              </div>
            </div>

            {/* Semester & Hours */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-2 block">Semester: {semester}</label>
                <input type="range" min="1" max="8" value={semester} onChange={e => setSemester(+e.target.value)} className="w-full accent-[#F5A623]" />
              </div>
              <div>
                <label className="text-xs text-muted uppercase tracking-wider mb-2 block">Hours/Week: {hours}h</label>
                <input type="range" min="5" max="40" value={hours} onChange={e => setHours(+e.target.value)} className="w-full accent-[#F5A623]" />
              </div>
            </div>

            <button onClick={generate} disabled={loading} className="neev-btn">
              {loading ? '⚡ Generating...' : '🤖 Generate AI Roadmap →'}
            </button>
          </motion.div>
        </section>

        {/* ═══ AI ROADMAP OUTPUT ═══ */}
        {roadmap && generated && (
          <>
            {/* Summary */}
            <section className="py-8">
              <motion.div {...anim}>
                <div className="border-l-4 border-accent py-4 px-6 mb-8">
                  <p className="text-sm font-dm">{roadmap.message}</p>
                </div>

                <div className="flex items-center divide-x divide-border mb-8">
                  <div className="flex-1 text-center px-6">
                    <p className="font-syne text-3xl font-bold text-accent">{roadmap.totalWeeks}</p>
                    <p className="text-muted text-xs mt-1">Total Weeks</p>
                  </div>
                  <div className="flex-1 text-center px-6">
                    <p className="font-syne text-3xl font-bold text-info">{roadmap.hoursPerWeek}h</p>
                    <p className="text-muted text-xs mt-1">Per Week</p>
                  </div>
                  <div className="flex-1 text-center px-6">
                    <p className="font-syne text-3xl font-bold text-accent2">{roadmap.phases?.length}</p>
                    <p className="text-muted text-xs mt-1">Phases</p>
                  </div>
                </div>
              </motion.div>
            </section>

            {/* Timeline */}
            <section className="py-8">
              <motion.div {...anim}>
                <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-8">Learning Timeline</h2>
                <div className="relative pl-8">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-border/30" />
                  {roadmap.phases?.map((phase: any, i: number) => (
                    <motion.div key={i} className="mb-8 relative"
                      initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                      <div className="absolute -left-5 top-1 w-4 h-4 rounded-full bg-accent border-2 border-bg" />
                      <div className="border border-border/20 rounded p-5">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-syne font-bold text-lg">{phase.phase}</h3>
                          <span className="text-xs text-muted">Week {phase.weeks} • {phase.hours}h/week</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {phase.items?.map((item: string, j: number) => (
                            <div key={j} className="flex items-center gap-2 text-sm text-white/80">
                              <span className="w-5 h-5 rounded border border-border/50 flex items-center justify-center text-[10px]">{j + 1}</span>
                              {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* Resources */}
            {roadmap.resources?.length > 0 && (
              <section className="py-8">
                <motion.div {...anim}>
                  <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">📚 Recommended Resources</h2>
                  <div className="grid grid-cols-3 gap-4">
                    {roadmap.resources.map((r: any, i: number) => (
                      <div key={i} className="border border-border/20 rounded p-4">
                        <p className="font-syne text-sm font-semibold">{r.name}</p>
                        <p className="text-info text-xs mt-1">{r.url}</p>
                        <span className="text-[10px] uppercase text-accent2 mt-2 inline-block">{r.type}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </section>
            )}

            {/* This Week */}
            {roadmap.weeklyBreakdown?.length > 0 && (
              <section className="py-8">
                <motion.div {...anim}>
                  <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">📋 Start This Week</h2>
                  {roadmap.weeklyBreakdown.map((t: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b border-border/20">
                      <span className="text-sm">{t.task}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted">{t.hours}h</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded ${t.priority === 'critical' ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>{t.priority}</span>
                      </div>
                    </div>
                  ))}
                </motion.div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
