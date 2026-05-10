'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import ShimmerLoader from '@/components/Shared/ShimmerLoader';
import { getPlacementScore, getMockHistory, saveMockTest, predictPlacement } from '@/lib/api';
import { getUser } from '@/lib/auth';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

export default function PlacementPage() {
  const [score, setScore] = useState<any>(null);
  const [mocks, setMocks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const user = getUser();

  // Input state
  const [inputs, setInputs] = useState({
    dsaSolved: 0, projectsCount: 0, communication: 5, aptitude: 5,
    internships: 0, mockInterviews: 0, certifications: 0, githubActive: false, linkedinComplete: false
  });
  const [mockForm, setMockForm] = useState({ testType: 'aptitude', subject: '', score: '', maxScore: 100 });
  const [showMock, setShowMock] = useState(false);
  const [survival, setSurvival] = useState<any>(null);

  const load = () => {
    Promise.all([getPlacementScore(), getMockHistory()])
      .then(([s, m]) => { setScore(s.data); setMocks(Array.isArray(m.data) ? m.data : []); })
      .catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const runPrediction = async () => {
    setAiLoading(true);
    try {
      const avgMock = mocks.length > 0 ? Math.round(mocks.reduce((s, m) => s + (m.score || 0), 0) / mocks.length) : 0;
      const [predRes, survRes] = await Promise.all([
        predictPlacement({
          cgpa: user?.cgpa || 7, dsaSolved: inputs.dsaSolved, projectsCount: inputs.projectsCount,
          mockScore: avgMock, communication: inputs.communication, aptitude: inputs.aptitude,
          skillsCount: 0, semester: user?.semester || 4
        }),
        fetch('http://localhost:8000/ml/guidance/placement-survival', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: { cgpa: user?.cgpa || 7, dsaSolved: inputs.dsaSolved, projectsCount: inputs.projectsCount,
            internships: inputs.internships, mockInterviews: inputs.mockInterviews, communicationRating: inputs.communication,
            aptitudeScore: inputs.aptitude * 10, githubActive: inputs.githubActive, linkedinComplete: inputs.linkedinComplete,
            certifications: inputs.certifications } })
        }).then(r => r.json())
      ]);
      setAiResult(predRes.data);
      setSurvival(survRes);
    } catch {} finally { setAiLoading(false); }
  };

  const handleMock = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await saveMockTest({ ...mockForm, score: +mockForm.score, maxScore: +mockForm.maxScore });
      setShowMock(false); setMockForm({ testType: 'aptitude', subject: '', score: '', maxScore: 100 }); load();
    } catch {}
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><ShimmerLoader /></div>;

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim}>
            <h1 className="font-syne text-[48px] font-bold">Placement Hub</h1>
            <p className="text-muted text-sm mt-2">AI-powered readiness analysis + survival probability</p>
          </motion.div>
        </section>

        {/* ═══ EXPANDED INPUT SECTION ═══ */}
        <section className="py-8">
          <motion.div {...anim} className="border border-border/30 rounded p-8 bg-surface/10">
            <h2 className="font-syne text-lg font-semibold mb-6">Your Preparation Data</h2>
            <div className="grid grid-cols-3 gap-6 mb-6">
              <div>
                <label className="text-xs text-muted block mb-2">DSA Problems Solved: {inputs.dsaSolved}</label>
                <input type="range" min="0" max="500" value={inputs.dsaSolved} onChange={e => setInputs({...inputs, dsaSolved: +e.target.value})} className="w-full accent-[#F5A623]" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-2">Projects Built: {inputs.projectsCount}</label>
                <input type="range" min="0" max="10" value={inputs.projectsCount} onChange={e => setInputs({...inputs, projectsCount: +e.target.value})} className="w-full accent-[#F5A623]" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-2">Internships Done: {inputs.internships}</label>
                <input type="range" min="0" max="5" value={inputs.internships} onChange={e => setInputs({...inputs, internships: +e.target.value})} className="w-full accent-[#F5A623]" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-2">Communication: {inputs.communication}/10</label>
                <input type="range" min="1" max="10" value={inputs.communication} onChange={e => setInputs({...inputs, communication: +e.target.value})} className="w-full accent-[#F5A623]" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-2">Aptitude Level: {inputs.aptitude}/10</label>
                <input type="range" min="1" max="10" value={inputs.aptitude} onChange={e => setInputs({...inputs, aptitude: +e.target.value})} className="w-full accent-[#F5A623]" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-2">Mock Interviews: {inputs.mockInterviews}</label>
                <input type="range" min="0" max="20" value={inputs.mockInterviews} onChange={e => setInputs({...inputs, mockInterviews: +e.target.value})} className="w-full accent-[#F5A623]" />
              </div>
              <div>
                <label className="text-xs text-muted block mb-2">Certifications: {inputs.certifications}</label>
                <input type="range" min="0" max="10" value={inputs.certifications} onChange={e => setInputs({...inputs, certifications: +e.target.value})} className="w-full accent-[#F5A623]" />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setInputs({...inputs, githubActive: !inputs.githubActive})}
                  className={`w-11 h-6 rounded-full border border-border/50 relative transition-colors ${inputs.githubActive ? 'bg-accent' : 'bg-surface'}`}>
                  <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all ${inputs.githubActive ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-muted">GitHub Active</span>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setInputs({...inputs, linkedinComplete: !inputs.linkedinComplete})}
                  className={`w-11 h-6 rounded-full border border-border/50 relative transition-colors ${inputs.linkedinComplete ? 'bg-accent' : 'bg-surface'}`}>
                  <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all ${inputs.linkedinComplete ? 'left-[22px]' : 'left-0.5'}`} />
                </button>
                <span className="text-sm text-muted">LinkedIn Complete</span>
              </div>
            </div>
            <button onClick={runPrediction} disabled={aiLoading} className="neev-btn">
              {aiLoading ? '⚡ Analyzing...' : '💀 Calculate Survival Probability →'}
            </button>
          </motion.div>
        </section>

        {/* ═══ SURVIVAL PROBABILITY ═══ */}
        {survival && (
          <section className="py-10">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-10">
              <p className="text-muted text-[10px] tracking-[0.2em] uppercase mb-4">Placement Survival Probability</p>
              <p className={`font-syne text-[120px] font-bold leading-none ${survival.survival_probability >= 70 ? 'text-[#4ADE80]' : survival.survival_probability >= 40 ? 'text-accent' : 'text-[#F87171]'}`}>
                {survival.survival_probability}%
              </p>
              <p className={`font-syne text-xl mt-2 ${survival.level === 'SAFE' ? 'text-[#4ADE80]' : survival.level === 'MODERATE' ? 'text-accent' : 'text-[#F87171]'}`}>
                {survival.level === 'SAFE' ? '🛡️ SAFE ZONE' : survival.level === 'MODERATE' ? '⚠️ MODERATE RISK' : '💀 DANGER ZONE'}
              </p>
              <p className="text-muted text-sm mt-2">{survival.message}</p>
            </motion.div>

            {/* Breakdown Bars */}
            <div className="grid grid-cols-6 gap-3 mb-8">
              {Object.entries(survival.breakdown || {}).map(([key, val]: [string, any]) => (
                <div key={key} className="text-center">
                  <div className="h-24 bg-border/20 rounded relative overflow-hidden">
                    <motion.div className="absolute bottom-0 w-full bg-accent rounded" initial={{ height: 0 }} animate={{ height: `${val}%` }} transition={{ duration: 0.8 }} />
                  </div>
                  <p className="text-xs text-muted mt-2 capitalize">{key}</p>
                  <p className="text-sm font-bold">{val}</p>
                </div>
              ))}
            </div>

            {/* Danger Zones */}
            {survival.danger_zones?.length > 0 && (
              <div className="mb-8">
                <p className="text-[#F87171] text-[10px] tracking-[0.15em] uppercase mb-4">⚠️ Danger Zones</p>
                <div className="space-y-2">
                  {survival.danger_zones.map((d: any, i: number) => (
                    <div key={i} className="border-l-2 border-[#F87171] pl-4 py-2">
                      <p className="text-white text-sm font-semibold">{d.zone}</p>
                      <p className="text-muted text-xs">{d.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strengths */}
            {survival.strengths?.length > 0 && (
              <div className="mb-8">
                <p className="text-[#4ADE80] text-[10px] tracking-[0.15em] uppercase mb-4">💪 Your Strengths</p>
                {survival.strengths.map((s: string, i: number) => (
                  <p key={i} className="text-sm text-muted py-1">✅ {s}</p>
                ))}
              </div>
            )}

            {/* Resources */}
            <div className="mb-8">
              <p className="text-accent text-[10px] tracking-[0.15em] uppercase mb-4">📚 Recommended Resources</p>
              <div className="grid grid-cols-3 gap-3">
                {(survival.resources || []).map((r: any, i: number) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                    className="border border-border/30 rounded p-4 hover:border-accent/50 transition-colors block">
                    <p className="text-white text-sm font-semibold">{r.name}</p>
                    <p className="text-muted text-xs mt-1">{r.type}</p>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ═══ AI RESULTS ═══ */}
        {aiResult && (
          <>
            {/* Big Score */}
            <section className="py-10 text-center">
              <motion.div {...anim}>
                <p className={`font-syne text-[96px] font-bold leading-none ${aiResult.totalScore >= 70 ? 'text-accent2' : aiResult.totalScore >= 40 ? 'text-accent' : 'text-danger'}`}>
                  {aiResult.totalScore}%
                </p>
                <p className="text-muted text-lg mt-2">Overall Placement Readiness</p>
                <p className="text-sm text-white/70 mt-1">{aiResult.message}</p>
              </motion.div>
            </section>

            {/* Dimensions */}
            <section className="py-8">
              <motion.div {...anim}>
                <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Dimension Breakdown</h2>
                <div className="space-y-4">
                  {Object.entries(aiResult.dimensions || {}).map(([key, val]: [string, any], i: number) => (
                    <div key={key} className="flex items-center gap-4">
                      <span className="text-sm w-28 capitalize">{key}</span>
                      <div className="flex-1 bg-border/30 rounded-full h-3">
                        <motion.div className={`h-3 rounded-full ${val >= 70 ? 'bg-accent2' : val >= 40 ? 'bg-accent' : 'bg-danger'}`}
                          initial={{ width: 0 }} whileInView={{ width: `${val}%` }}
                          viewport={{ once: true }} transition={{ duration: 0.8, delay: i * 0.1 }} />
                      </div>
                      <span className="text-sm font-syne font-bold w-12 text-right">{val}%</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* Company-wise Readiness */}
            <section className="py-8">
              <motion.div {...anim}>
                <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">
                  Company-wise Eligibility — {aiResult.readyFor}/{aiResult.totalCompanies} ready
                </h2>
                <div className="space-y-3">
                  {aiResult.companies?.map((c: any, i: number) => (
                    <motion.div key={i} className="border border-border/20 rounded p-4 flex items-center justify-between"
                      initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{c.ready ? '✅' : '❌'}</span>
                        <div>
                          <p className="font-syne font-semibold">{c.company}</p>
                          <p className="text-xs text-muted">{c.difficulty}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-syne font-bold ${c.matchPercent >= 70 ? 'text-accent2' : c.matchPercent >= 40 ? 'text-accent' : 'text-danger'}`}>
                          {c.matchPercent}%
                        </p>
                        {c.gaps?.length > 0 && (
                          <p className="text-xs text-danger/70 mt-1 max-w-xs">{c.gaps[0]}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* Priority */}
            <section className="py-8">
              <motion.div {...anim}>
                <div className="border-l-4 border-accent py-4 px-6">
                  <p className="text-xs uppercase tracking-wider text-muted mb-1">Top Priority</p>
                  <p className="font-syne text-xl font-bold text-accent">{aiResult.topPriority}</p>
                  <p className="text-sm text-white/70 mt-1">Estimated {aiResult.monthsToReady} months to full readiness</p>
                </div>
              </motion.div>
            </section>
          </>
        )}

        {/* ═══ MOCK TEST ═══ */}
        <section className="py-8">
          <motion.div {...anim} className="flex items-center justify-between mb-6">
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted">Mock Test History</h2>
            <button onClick={() => setShowMock(!showMock)} className="neev-btn-outline text-xs">{showMock ? '✕' : '+ Add Mock Score'}</button>
          </motion.div>

          {showMock && (
            <motion.form onSubmit={handleMock} className="mb-6 grid grid-cols-4 gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <select value={mockForm.testType} onChange={e => setMockForm({...mockForm, testType: e.target.value})} className="neev-input bg-transparent">
                <option value="aptitude" className="bg-surface">Aptitude</option>
                <option value="coding" className="bg-surface">Coding</option>
                <option value="verbal" className="bg-surface">Verbal</option>
              </select>
              <input placeholder="Subject" value={mockForm.subject} onChange={e => setMockForm({...mockForm, subject: e.target.value})} className="neev-input" />
              <input type="number" placeholder="Score" value={mockForm.score} onChange={e => setMockForm({...mockForm, score: e.target.value})} className="neev-input" required />
              <button type="submit" className="neev-btn">Save →</button>
            </motion.form>
          )}

          <div className="space-y-2">
            {mocks.map((m: any, i: number) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 text-sm">
                <span className="capitalize">{m.testType} — {m.subject || 'General'}</span>
                <span className="font-syne font-bold">{m.score}/{m.maxScore}</span>
              </div>
            ))}
            {mocks.length === 0 && <p className="text-muted text-sm">No mock tests yet. Add your scores!</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
