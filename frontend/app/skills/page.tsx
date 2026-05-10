'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import ShimmerLoader from '@/components/Shared/ShimmerLoader';
import { getSkills, logSkill, predictSkillGap, getTrendingSkills } from '@/lib/api';
import { getUser } from '@/lib/auth';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };
const categories = ['all', 'language', 'development', 'cs-core', 'tools'];

export default function SkillsPage() {
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ skillName: '', category: 'language', completionPercent: 50, confidenceLevel: 3 });
  const [gap, setGap] = useState<any>(null);
  const [gapLoading, setGapLoading] = useState(false);
  const [trends, setTrends] = useState<any>(null);
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [selectedTrend, setSelectedTrend] = useState<any>(null);
  const user = getUser();

  const load = () => { getSkills().then(r => setSkills(Array.isArray(r.data) ? r.data : r.data?.skills || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  useEffect(() => {
    if (skills.length === 0) return;
    setGapLoading(true);
    predictSkillGap({
      skills: skills.map(s => ({ name: s.skillName || s.name, completionPercent: s.completionPercent || s.progress, category: s.category })),
      careerGoal: user?.careerGoal || 'Full Stack', semester: user?.semester || 4
    }).then(r => setGap(r.data)).catch(() => {}).finally(() => setGapLoading(false));
  }, [skills.length]);

  // Load trending skills
  useEffect(() => {
    setTrendsLoading(true);
    getTrendingSkills({
      career_goal: user?.careerGoal || 'Full Stack',
      current_skills: skills.map(s => s.skillName || s.name),
      semester: user?.semester || 4
    }).then(r => setTrends(r.data)).catch(() => {}).finally(() => setTrendsLoading(false));
  }, [skills.length]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try { await logSkill(form); setShowAdd(false); setForm({ skillName: '', category: 'language', completionPercent: 50, confidenceLevel: 3 }); load(); } catch {}
  };

  const filtered = active === 'all' ? skills : skills.filter(s => s.category === active);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><ShimmerLoader /></div>;

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim} className="flex items-center justify-between">
            <div>
              <h1 className="font-syne text-[48px] font-bold">Skills</h1>
              <p className="text-muted text-sm mt-2">{skills.length} skills tracked • Goal: {user?.careerGoal || 'Full Stack'}</p>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="neev-btn text-sm">{showAdd ? '✕ Cancel' : '+ Log Skill'}</button>
          </motion.div>
        </section>

        {showAdd && (
          <motion.form onSubmit={handleAdd} className="mb-10 p-6 border border-accent/20 rounded bg-surface/20" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-syne font-semibold mb-4">Log a Skill</h3>
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Skill Name (e.g. React, Python, DSA)" value={form.skillName} onChange={e => setForm({...form, skillName: e.target.value})} className="neev-input" required />
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="neev-input bg-transparent">
                <option value="language" className="bg-surface">Language</option>
                <option value="development" className="bg-surface">Development</option>
                <option value="cs-core" className="bg-surface">CS Core</option>
                <option value="tools" className="bg-surface">Tools</option>
              </select>
              <div><label className="text-xs text-muted">Proficiency: {form.completionPercent}%</label><input type="range" min="5" max="100" value={form.completionPercent} onChange={e => setForm({...form, completionPercent: +e.target.value})} className="w-full accent-[#F5A623]" /></div>
              <div><label className="text-xs text-muted">Confidence: {form.confidenceLevel}/5</label><input type="range" min="1" max="5" value={form.confidenceLevel} onChange={e => setForm({...form, confidenceLevel: +e.target.value})} className="w-full accent-[#F5A623]" /></div>
            </div>
            <button type="submit" className="neev-btn mt-4">Save Skill →</button>
          </motion.form>
        )}

        {/* ═══ TRENDING SKILLS + RESOURCES ═══ */}
        {trends && trends.trending_skills?.length > 0 && (
          <section className="py-10">
            <motion.div {...anim}>
              <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-2">🔥 Current Trends & Technologies</h2>
              <p className="text-xs text-muted/60 mb-6">Skills in demand for {trends.career_goal} • {trends.known} known • {trends.to_learn} to learn</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                {trends.trending_skills.map((skill: any, i: number) => (
                  <motion.div key={i} className={`border rounded p-4 cursor-pointer transition-all ${selectedTrend?.name === skill.name ? 'border-accent bg-accent/5' : 'border-border/20 hover:border-border/40'}`}
                    onClick={() => setSelectedTrend(selectedTrend?.name === skill.name ? null : skill)}
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-syne text-sm font-semibold">{skill.name}</span>
                        {skill.trending && <span className="text-[9px] bg-[#FF6B6B]/15 text-[#FF6B6B] px-1.5 py-0.5 rounded-full">🔥 HOT</span>}
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${skill.already_known ? 'bg-[#66BB6A]/15 text-[#66BB6A]' : 'bg-accent/15 text-accent'}`}>
                        {skill.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">Demand: <span className={`font-semibold ${skill.demand === 'Very High' || skill.demand === 'Critical' ? 'text-[#FF6B6B]' : skill.demand === 'High' ? 'text-accent' : 'text-muted'}`}>{skill.demand}</span></span>
                      <span className="text-xs text-muted/50">Click for resources →</span>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Expanded Resource Panel */}
              {selectedTrend && (
                <motion.div className="border border-accent/20 rounded p-6 bg-surface/10 mb-8" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-syne text-lg font-semibold">{selectedTrend.name} — Resources</h3>
                    <button onClick={() => setSelectedTrend(null)} className="text-muted text-sm hover:text-white">✕</button>
                  </div>

                  <p className="text-sm text-white/70 mb-6">{selectedTrend.scope}</p>

                  <div className="grid grid-cols-3 gap-6">
                    {/* YouTube */}
                    <div>
                      <p className="text-xs text-[#FF6B6B] uppercase tracking-wider mb-3">📺 YouTube Channels</p>
                      {(selectedTrend.youtube || []).map((yt: string, i: number) => (
                        <a key={i} href={yt} target="_blank" rel="noopener noreferrer" className="block text-sm text-white/70 hover:text-accent mb-2 truncate">
                          → {yt.replace('https://youtube.com/@', '')}
                        </a>
                      ))}
                    </div>

                    {/* Docs */}
                    <div>
                      <p className="text-xs text-[#4FC3F7] uppercase tracking-wider mb-3">📖 Documentation</p>
                      {selectedTrend.docs && (
                        <a href={selectedTrend.docs} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-accent block truncate">
                          → {selectedTrend.docs.replace('https://', '')}
                        </a>
                      )}
                    </div>

                    {/* Course */}
                    <div>
                      <p className="text-xs text-[#66BB6A] uppercase tracking-wider mb-3">🎓 Free Course</p>
                      {selectedTrend.course && (
                        <a href={selectedTrend.course} target="_blank" rel="noopener noreferrer" className="text-sm text-white/70 hover:text-accent block truncate">
                          → {selectedTrend.course.replace('https://', '')}
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </section>
        )}

        {/* ═══ AI SKILL GAP ANALYSIS ═══ */}
        {gap && (
          <section className="py-10">
            <motion.div {...anim}>
              <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">🤖 AI Skill Gap Analysis — {gap.goal}</h2>
              <div className="flex items-center divide-x divide-border mb-8">
                <div className="flex-1 text-center px-6"><p className={`font-syne text-4xl font-bold ${gap.readiness >= 70 ? 'text-[#66BB6A]' : gap.readiness >= 40 ? 'text-accent' : 'text-[#FF6B6B]'}`}>{gap.readiness}%</p><p className="text-muted text-xs mt-1">Readiness</p></div>
                <div className="flex-1 text-center px-6"><p className="font-syne text-4xl font-bold text-[#4FC3F7]">{gap.monthsToReady}</p><p className="text-muted text-xs mt-1">Months</p></div>
                <div className="flex-1 text-center px-6"><p className="font-syne text-4xl font-bold text-accent">{gap.strong?.length || 0}</p><p className="text-muted text-xs mt-1">Strong</p></div>
                <div className="flex-1 text-center px-6"><p className="font-syne text-4xl font-bold text-[#FF6B6B]">{gap.missing?.length || 0}</p><p className="text-muted text-xs mt-1">Missing</p></div>
              </div>
              <div className="border-l-4 border-accent py-3 px-6 mb-6"><p className="text-sm font-dm">{gap.message}</p></div>
              {gap.missing?.length > 0 && (
                <div className="mb-6"><p className="text-xs uppercase tracking-wider text-[#FF6B6B] mb-3">🚨 Missing</p><div className="flex flex-wrap gap-2">{gap.missing.map((m: any, i: number) => <span key={i} className="text-xs border border-[#FF6B6B]/30 text-[#FF6B6B] px-3 py-1.5 rounded">{m.skill}</span>)}</div></div>
              )}
              {gap.weak?.length > 0 && (
                <div className="mb-6"><p className="text-xs uppercase tracking-wider text-accent mb-3">⚡ Needs Improvement</p>{gap.weak.map((w: any, i: number) => (
                  <div key={i} className="flex items-center gap-4 py-2"><span className="text-sm w-24">{w.skill}</span><div className="flex-1 bg-border/30 rounded-full h-2"><div className="bg-accent h-2 rounded-full" style={{ width: `${w.current}%` }} /></div><span className="text-xs text-muted">{w.current}% → {w.target}%</span></div>
                ))}</div>
              )}
              {gap.nextToLearn?.length > 0 && (
                <div className="mb-6"><p className="text-xs uppercase tracking-wider text-[#4FC3F7] mb-3">📚 Learn Next</p>{gap.nextToLearn.map((n: string, i: number) => <div key={i} className="flex items-center gap-2 text-sm py-1"><span className="text-[#4FC3F7]">→</span><span>{n}</span></div>)}</div>
              )}
            </motion.div>
          </section>
        )}

        {/* Category Tabs */}
        <div className="flex gap-1 border-b border-border/30 mb-8">
          {categories.map(c => (
            <button key={c} onClick={() => setActive(c)} className={`px-4 py-2 text-sm capitalize font-syne border-b-2 transition-all ${active === c ? 'text-accent border-accent' : 'text-muted border-transparent hover:text-white'}`}>
              {c === 'cs-core' ? 'CS Core' : c}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((s: any, i: number) => {
            const pct = s.completionPercent || s.progress || 0;
            return (
              <motion.div key={s._id || i} className="border border-border/20 rounded p-4" initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-syne text-sm font-semibold">{s.skillName || s.name}</span>
                  <span className="text-accent text-xs">{Array(s.confidenceLevel || s.confidence || 1).fill('★').join('')}</span>
                </div>
                <div className="w-full bg-border/30 rounded-full h-2 mb-1">
                  <motion.div className="h-2 rounded-full bg-accent" initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 0.8 }} />
                </div>
                <div className="flex justify-between text-xs text-muted"><span>{pct}%</span>{s.streak > 0 && <span>🔥 {s.streak}d</span>}</div>
              </motion.div>
            );
          })}
        </div>
        {filtered.length === 0 && <p className="text-muted text-center py-12">No skills in this category. Log your first skill! 🛠️</p>}
      </main>
    </div>
  );
}
