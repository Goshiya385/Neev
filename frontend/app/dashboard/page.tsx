'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import { getDashboard, getQuickInsight, getTodayCheckin, submitCheckin, getCheckinPrompt } from '@/lib/api';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import ShimmerLoader from '@/components/Shared/ShimmerLoader';
import type { DashboardData } from '@/lib/types';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saarthiInsight, setSaarthiInsight] = useState('');
  const [insightIdx, setInsightIdx] = useState(0);
  const [checkin, setCheckin] = useState<any>(null);
  const [checkinDone, setCheckinDone] = useState(false);
  const [checkinForm, setCheckinForm] = useState({ studyHours: 2, mood: 'okay', workedOn: '', productivity: 3 });
  const [checkinPrompt, setCheckinPrompt] = useState<any>(null);
  const [checkinSaving, setCheckinSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    getDashboard().then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
    getQuickInsight().then(r => {
      const ins = r.data?.insight;
      setSaarthiInsight(typeof ins === 'string' ? ins : ins?.message || '');
    }).catch(() => {});
    getTodayCheckin().then(r => { if (r.data) { setCheckin(r.data); setCheckinDone(true); } }).catch(() => {});
    getCheckinPrompt().then(r => setCheckinPrompt(r.data)).catch(() => {});
  }, [router]);

  const handleCheckin = async () => {
    setCheckinSaving(true);
    try { const r = await submitCheckin(checkinForm); setCheckin(r.data.checkin); setCheckinDone(true); } catch {}
    setCheckinSaving(false);
  };

  // Rotate insights every 30s
  useEffect(() => {
    if (!data?.insights?.length) return;
    const timer = setInterval(() => setInsightIdx(prev => (prev + 1) % data.insights.length), 30000);
    return () => clearInterval(timer);
  }, [data?.insights]);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><ShimmerLoader /></div>;

  const s = data?.student;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Normalize data shapes (handle both DB and demo formats)
  const streakCurrent = data?.streaks?.current ?? data?.streak?.current ?? s?.streak?.current ?? 0;
  const streakLongest = data?.streaks?.longest ?? data?.streak?.longest ?? s?.streak?.longest ?? 0;
  const placementTotal = data?.placementBreakdown?.total ?? data?.placementScore?.total ?? 0;
  const placementDsa = data?.placementBreakdown?.dsaSkills ?? data?.placementScore?.dsaSkills ?? 0;
  const placementProjects = data?.placementBreakdown?.projects ?? data?.placementScore?.projects ?? 0;
  const cgpaTrend = data?.cgpaTrend || data?.sgpaHistory || [];

  const insights = (data?.insights || []).map((ins: any) =>
    typeof ins === 'string' ? { icon: '💡', message: ins } : { icon: ins.icon || (ins.type === 'warning' ? '⚠️' : ins.type === 'success' ? '🔥' : '💡'), message: ins.message || String(ins) }
  );
  const currentInsight = insights[insightIdx];

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">

        {/* Section 1 — Greeting + Streak */}
        <section className="py-12">
          <motion.div {...anim}>
            <div className="flex items-center gap-4">
              <h1 className="font-syne text-[40px] font-bold leading-tight">
                {greeting}, {s?.name?.split(' ')[0] || 'Student'}.
              </h1>
              {streakCurrent > 0 && (
                <span className="bg-accent/10 text-accent px-3 py-1.5 rounded text-sm font-syne font-semibold">
                  🔥 {streakCurrent} day streak
                </span>
              )}
            </div>
            <p className="text-muted text-sm mt-2 font-dm">
              Sem {s?.semester} • {s?.branch} • {s?.college}
            </p>
          </motion.div>
        </section>

        {/* Daily Check-in Card */}
        <section className="py-6">
          <motion.div {...anim}>
            <div className="border border-accent/20 rounded p-6 bg-surface/10">
              {checkinDone ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">✅</span>
                    <div>
                      <p className="font-syne font-semibold">Checked in today!</p>
                      <p className="text-muted text-xs">{checkin?.studyHours || 0}h studied • Mood: {checkin?.mood || 'okay'} • Productivity: {checkin?.productivity || 3}/5</p>
                    </div>
                  </div>
                  <span className="text-accent text-sm">You go bestie 💅</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">📝</span>
                    <div>
                      <p className="font-syne font-semibold">{checkinPrompt?.greeting || 'Daily Check-in'}</p>
                      <p className="text-muted text-xs">Quick update — helps AI give better predictions</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider">Study Hours</label>
                      <input type="number" min="0" max="16" value={checkinForm.studyHours} onChange={e => setCheckinForm({...checkinForm, studyHours: +e.target.value})}
                        className="neev-input mt-1 text-center" />
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider">Mood</label>
                      <div className="flex gap-1 mt-1">
                        {[{m:'great',e:'😄'},{m:'good',e:'😊'},{m:'okay',e:'😐'},{m:'stressed',e:'😰'},{m:'low',e:'😞'}].map(({m,e}) => (
                          <button key={m} onClick={() => setCheckinForm({...checkinForm, mood: m})}
                            className={`text-lg p-1 rounded transition-all ${checkinForm.mood === m ? 'bg-accent/20 scale-110' : 'opacity-40 hover:opacity-70'}`}>{e}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-muted uppercase tracking-wider">Worked On</label>
                      <input placeholder="DSA, project..." value={checkinForm.workedOn} onChange={e => setCheckinForm({...checkinForm, workedOn: e.target.value})}
                        className="neev-input mt-1" />
                    </div>
                    <div className="flex items-end">
                      <button onClick={handleCheckin} disabled={checkinSaving} className="neev-btn text-sm w-full">
                        {checkinSaving ? '...' : 'Check In ✓'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </section>

        {/* Section 2 — 4 Key Metrics */}
        <section className="py-12">
          <div className="flex items-center divide-x divide-border">
            {[
              { num: s?.cgpa?.toFixed(2) || '0.00', label: 'CGPA', color: 'text-accent' },
              { num: `${Math.round(placementTotal)}%`, label: 'Placement Ready', color: 'text-info' },
              { num: String(s?.backlogs || '0'), label: 'Backlogs', color: (s?.backlogs || 0) > 0 ? 'text-danger' : 'text-accent2' },
              { num: String(streakLongest), label: 'Best Streak', color: 'text-accent2' },
            ].map((stat, i) => (
              <motion.div key={i} className="flex-1 text-center px-8"
                {...anim} transition={{ delay: i * 0.1 }}>
                <p className={`stat-number ${stat.color}`}>{stat.num}</p>
                <p className="text-muted text-sm mt-2">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 3 — Growth Circles */}
        <section className="py-12">
          <motion.div {...anim}>
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-8">Growth Overview</h2>
            <div className="flex items-center gap-12 justify-center">
              {[
                { label: 'CGPA', pct: Math.round(((s?.cgpa || 0) / 10) * 100), color: '#F5A623' },
                { label: 'Skills', pct: Math.round(placementDsa), color: '#60A5FA' },
                { label: 'Placement', pct: Math.round(placementTotal), color: '#4ADE80' },
                { label: 'Projects', pct: Math.round(placementProjects), color: '#A78BFA' },
              ].map((ring, i) => (
                <motion.div key={i} className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                  <div className="relative w-24 h-24 mx-auto mb-3">
                    <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1C2E25" strokeWidth="2" />
                      <motion.circle cx="18" cy="18" r="15.5" fill="none" stroke={ring.color} strokeWidth="2.5"
                        strokeDasharray={`${ring.pct * 0.975} 97.5`} strokeLinecap="round"
                        initial={{ strokeDasharray: '0 97.5' }}
                        whileInView={{ strokeDasharray: `${ring.pct * 0.975} 97.5` }}
                        viewport={{ once: true }} transition={{ duration: 1.2, delay: i * 0.15 }} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-syne font-bold">{ring.pct}%</span>
                  </div>
                  <p className="text-muted text-xs">{ring.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section 4 — CGPA Trend Chart */}
        {cgpaTrend.length > 0 && (
          <section className="py-12">
            <motion.div {...anim}>
              <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-8">Academic Trajectory</h2>
              <div className="h-[260px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cgpaTrend}>
                    <XAxis dataKey="semester" stroke="#7A9A88" fontSize={12} tickFormatter={v => `Sem ${v}`} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 10]} stroke="#7A9A88" fontSize={12} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: '#141F1A', border: '1px solid #1C2E25', borderRadius: 8, color: '#fff', fontFamily: 'DM Sans' }} />
                    <Line type="monotone" dataKey="sgpa" stroke="#F5A623" strokeWidth={3} dot={{ fill: '#F5A623', r: 5 }} activeDot={{ r: 7 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </section>
        )}

        {/* Section 5 — Prediction Cards */}
        <section className="py-12">
          <motion.div {...anim}>
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-8">AI Predictions</h2>
            <div className="grid grid-cols-3 gap-6">
              {[
                { label: 'Predicted Next CGPA', value: ((s?.cgpa || 0) + 0.2).toFixed(1), sub: 'Based on current trend', icon: '📈' },
                { label: 'Backlog Risk', value: `${s?.backlogs ? Math.min(((s?.backlogs || 0) * 25 + 15), 90) : 12}%`, sub: s?.backlogs ? 'At-risk detected' : 'Looking good', icon: '⚠️' },
                { label: 'Placement Ready In', value: `Sem ${Math.max((s?.semester || 4) + 1, 5)}`, sub: `Current: ${Math.round(placementTotal)}%`, icon: '🎯' },
              ].map((card, i) => (
                <motion.div key={i} className="py-6 px-6 border border-border/50 rounded bg-surface/30"
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <span className="text-2xl">{card.icon}</span>
                  <p className="font-syne text-3xl font-bold mt-3">{card.value}</p>
                  <p className="text-sm text-white/80 mt-1">{card.label}</p>
                  <p className="text-muted text-xs mt-1">{card.sub}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Section 6 — Dynamic Insight */}
        {currentInsight && (
          <section className="py-12">
            <motion.div {...anim}
              className="border-l-4 border-accent py-6 px-8" key={insightIdx}>
              <motion.p className="font-syne text-xl italic leading-relaxed"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                {currentInsight.icon} {currentInsight.message}
              </motion.p>
            </motion.div>
          </section>
        )}

        {/* Section 7 — Saarthi Quick Insight */}
        <section className="py-12">
          <motion.div {...anim}>
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-8">Saarthi Says</h2>
            <div className="border border-border/50 rounded py-6 px-8 bg-surface/20">
              <p className="text-sm font-dm leading-relaxed text-white/80 min-h-[40px]">
                {saarthiInsight || 'Loading weekly insight...'}
              </p>
              <Link href="/saarthi" className="text-accent text-sm font-syne font-semibold mt-4 inline-block hover:underline">
                Ask Saarthi →
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Section 8 — Roadmap + Tasks */}
        <section className="py-12">
          <motion.div {...anim}>
            <div className="grid grid-cols-2 gap-12">
              <div>
                <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Roadmap Progress</h2>
                <div className="w-full bg-border/30 rounded-full h-2 mb-4">
                  <div className="h-2 rounded-full bg-accent" style={{ width: `${Math.min(placementTotal, 100)}%` }} />
                </div>
                <div className="space-y-3">
                  {['Complete DSA basics', 'Build 1 full project', 'GitHub 30+ contributions'].map((m, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className="w-4 h-4 rounded border border-border/50 flex items-center justify-center text-xs">
                        {i === 0 ? '✓' : ''}
                      </span>
                      <span className={i === 0 ? 'text-muted line-through' : 'text-white/80'}>{m}</span>
                    </div>
                  ))}
                </div>
                <Link href="/roadmap" className="text-accent text-sm font-syne mt-4 inline-block hover:underline">View Full Roadmap →</Link>
              </div>
              <div>
                <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">This Week</h2>
                <div className="space-y-3">
                  {['Solve 5 LeetCode problems', 'Read OS Chapter 5', 'Push project to GitHub', 'Practice aptitude'].map((t, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${i < 1 ? 'bg-accent border-accent text-black' : 'border-border/50'}`}>
                        {i < 1 ? '✓' : ''}
                      </span>
                      <span className={i < 1 ? 'text-muted line-through' : 'text-white/80'}>{t}</span>
                    </div>
                  ))}
                </div>
                <Link href="/planner" className="text-accent text-sm font-syne mt-4 inline-block hover:underline">Open Planner →</Link>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Quick Actions */}
        <section className="py-12">
          <motion.div {...anim}>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {[
                { href: '/saarthi', icon: '🤖', label: 'Saarthi' },
                { href: '/academics', icon: '📚', label: 'Academics' },
                { href: '/skills', icon: '🛠️', label: 'Skills' },
                { href: '/whatif', icon: '🔮', label: 'What-If' },
                { href: '/placement', icon: '🎯', label: 'Placement' },
                { href: '/report', icon: '📈', label: 'Report' },
              ].map((link, i) => (
                <Link key={i} href={link.href}
                  className="flex flex-col items-center gap-2 py-4 text-muted hover:text-white transition-colors">
                  <span className="text-2xl">{link.icon}</span>
                  <span className="text-xs">{link.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
