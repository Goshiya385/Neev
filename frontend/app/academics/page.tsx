'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import ShimmerLoader from '@/components/Shared/ShimmerLoader';
import { getMarks, addMarks, getAttendance, addAttendance, getAcademicAnalytics, getPatterns, predictCGPA, predictBacklog } from '@/lib/api';
import { getUser } from '@/lib/auth';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

export default function AcademicsPage() {
  const [marks, setMarks] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [patterns, setPatterns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cgpaPred, setCgpaPred] = useState<any>(null);
  const [backlogPred, setBacklogPred] = useState<any>(null);
  const [predLoading, setPredLoading] = useState(false);

  // Add marks form
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    subject: '', subjectCode: '', semester: 4,
    internalMarks: '', externalMarks: '', practicalMarks: '',
    maxInternal: 30, maxExternal: 70, maxPractical: 25, examType: 'external'
  });
  // Add attendance form
  const [showAtt, setShowAtt] = useState(false);
  const [attForm, setAttForm] = useState({ subject: '', totalClasses: '', attended: '' });

  const user = getUser();

  const load = () => {
    Promise.all([getMarks(), getAttendance(), getAcademicAnalytics(), getPatterns()])
      .then(([m, a, an, p]) => {
        setMarks(Array.isArray(m.data) ? m.data : m.data?.marks || []);
        setAttendance(Array.isArray(a.data) ? a.data : a.data?.attendance || []);
        setAnalytics(an.data);
        setPatterns(Array.isArray(p.data) ? p.data : p.data?.patterns || []);
      }).catch(() => {}).finally(() => setLoading(false));
  };
  useEffect(load, []);

  // Run AI predictions whenever marks change
  const runPredictions = async () => {
    if (marks.length === 0) return;
    setPredLoading(true);
    const predData = {
      marks: marks.map(m => ({
        subject: m.subject, internal: m.internalMarks, external: m.externalMarks,
        practical: m.practicalMarks || 0, maxInternal: m.maxInternal || 30,
        maxExternal: m.maxExternal || 70, maxPractical: m.maxPractical || 25
      })),
      currentCGPA: user?.cgpa || 0,
      semester: user?.semester || 4,
      attendance: attendance.length > 0 ? Math.round(attendance.reduce((s: number, a: any) => s + (a.percentage || (a.attended / a.totalClasses * 100) || 0), 0) / attendance.length) : 75,
      studyHours: 12,
      backlogs: user?.backlogs || 0
    };
    try {
      const [cgpa, backlog] = await Promise.all([predictCGPA(predData), predictBacklog(predData)]);
      setCgpaPred(cgpa.data);
      setBacklogPred(backlog.data);
    } catch { /* ML service might not be running — that's ok */ }
    setPredLoading(false);
  };

  useEffect(() => { if (!loading) runPredictions(); }, [marks.length, loading]);

  const handleAddMarks = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addMarks({
        ...form, internalMarks: +form.internalMarks, externalMarks: +form.externalMarks,
        practicalMarks: +form.practicalMarks || 0
      });
      setShowAdd(false);
      setForm({ subject: '', subjectCode: '', semester: 4, internalMarks: '', externalMarks: '', practicalMarks: '', maxInternal: 30, maxExternal: 70, maxPractical: 25, examType: 'external' });
      load();
    } catch {}
  };

  const handleAddAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAttendance({ subject: attForm.subject, totalClasses: +attForm.totalClasses, attended: +attForm.attended });
      setShowAtt(false); setAttForm({ subject: '', totalClasses: '', attended: '' }); load();
    } catch {}
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><ShimmerLoader /></div>;

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">

        {/* Header */}
        <section className="py-12">
          <motion.div {...anim} className="flex items-center justify-between">
            <div>
              <h1 className="font-syne text-[48px] font-bold">Academics</h1>
              <p className="text-muted text-sm mt-2">{marks.length} subjects tracked • Semester {user?.semester || '—'}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowAtt(!showAtt)} className="neev-btn-outline text-sm">{showAtt ? '✕' : '+ Attendance'}</button>
              <button onClick={() => setShowAdd(!showAdd)} className="neev-btn text-sm">{showAdd ? '✕ Cancel' : '+ Add Marks'}</button>
            </div>
          </motion.div>
        </section>

        {/* Add Marks Form */}
        {showAdd && (
          <motion.form onSubmit={handleAddMarks} className="mb-10 p-6 border border-accent/20 rounded bg-surface/20"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-syne font-semibold mb-4">Add Subject Marks</h3>
            <div className="grid grid-cols-3 gap-4">
              <input placeholder="Subject Name *" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="neev-input" required />
              <input placeholder="Subject Code" value={form.subjectCode} onChange={e => setForm({...form, subjectCode: e.target.value})} className="neev-input" />
              <select value={form.semester} onChange={e => setForm({...form, semester: +e.target.value})} className="neev-input bg-transparent">
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-surface">Semester {s}</option>)}
              </select>
              <input type="number" placeholder="Internal Marks *" value={form.internalMarks} onChange={e => setForm({...form, internalMarks: e.target.value})} className="neev-input" required min="0" max="30" />
              <input type="number" placeholder="External Marks *" value={form.externalMarks} onChange={e => setForm({...form, externalMarks: e.target.value})} className="neev-input" required min="0" max="70" />
              <input type="number" placeholder="Practical Marks" value={form.practicalMarks} onChange={e => setForm({...form, practicalMarks: e.target.value})} className="neev-input" min="0" max="25" />
            </div>
            <button type="submit" className="neev-btn mt-4">Save & Predict →</button>
          </motion.form>
        )}

        {/* Add Attendance Form */}
        {showAtt && (
          <motion.form onSubmit={handleAddAttendance} className="mb-10 p-6 border border-info/20 rounded bg-surface/20"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h3 className="font-syne font-semibold mb-4">Log Attendance</h3>
            <div className="grid grid-cols-3 gap-4">
              <input placeholder="Subject Name *" value={attForm.subject} onChange={e => setAttForm({...attForm, subject: e.target.value})} className="neev-input" required />
              <input type="number" placeholder="Total Classes *" value={attForm.totalClasses} onChange={e => setAttForm({...attForm, totalClasses: e.target.value})} className="neev-input" required />
              <input type="number" placeholder="Attended *" value={attForm.attended} onChange={e => setAttForm({...attForm, attended: e.target.value})} className="neev-input" required />
            </div>
            <button type="submit" className="neev-btn mt-4">Save Attendance →</button>
          </motion.form>
        )}

        {/* ═══ AI PREDICTION SECTION ═══ */}
        {cgpaPred && (
          <section className="py-10">
            <motion.div {...anim}>
              <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-8">🤖 AI Predictions</h2>

              {/* Big Prediction Numbers */}
              <div className="flex items-center divide-x divide-border mb-8">
                {[
                  { num: cgpaPred.predictedCGPA, label: 'Predicted CGPA', color: 'text-accent' },
                  { num: cgpaPred.predictedSGPA, label: 'Predicted SGPA', color: 'text-info' },
                  { num: `${cgpaPred.confidence}%`, label: 'Confidence', color: 'text-accent2' },
                  { num: cgpaPred.trend === 'improving' ? '📈' : cgpaPred.trend === 'declining' ? '📉' : '➡️', label: cgpaPred.trend, color: 'text-white' },
                ].map((s, i) => (
                  <div key={i} className="flex-1 text-center px-6">
                    <p className={`font-syne text-3xl font-bold ${s.color}`}>{s.num}</p>
                    <p className="text-muted text-xs mt-1 capitalize">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* AI Message */}
              <div className="border-l-4 border-accent py-4 px-6 mb-6">
                <p className="text-sm font-dm">{cgpaPred.message}</p>
              </div>

              {/* Impact Factors */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'Attendance Impact', val: `${cgpaPred.factors?.attendanceImpact > 0 ? '+' : ''}${cgpaPred.factors?.attendanceImpact}%`, color: cgpaPred.factors?.attendanceImpact >= 0 ? 'text-accent2' : 'text-danger' },
                  { label: 'Study Hours Impact', val: `${cgpaPred.factors?.studyImpact > 0 ? '+' : ''}${cgpaPred.factors?.studyImpact}%`, color: 'text-info' },
                  { label: 'Backlog Impact', val: `${cgpaPred.factors?.backlogImpact}`, color: cgpaPred.factors?.backlogImpact < 0 ? 'text-danger' : 'text-accent2' },
                ].map((f, i) => (
                  <div key={i} className="border border-border/30 rounded py-3 px-4 text-center">
                    <p className={`font-syne text-lg font-bold ${f.color}`}>{f.val}</p>
                    <p className="text-muted text-xs mt-1">{f.label}</p>
                  </div>
                ))}
              </div>

              {/* Tips */}
              {cgpaPred.tips?.length > 0 && (
                <div className="space-y-2">
                  <p className="text-muted text-xs uppercase tracking-wider mb-3">💡 Recommendations</p>
                  {cgpaPred.tips.map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-accent mt-0.5">→</span>
                      <span className="text-white/80">{tip}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </section>
        )}

        {/* ═══ BACKLOG RISK SECTION ═══ */}
        {backlogPred && (
          <section className="py-10">
            <motion.div {...anim}>
              <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">⚠️ Backlog Risk Assessment</h2>
              <div className="flex items-center gap-6 mb-6">
                <div className="text-center">
                  <p className={`font-syne text-5xl font-bold ${backlogPred.riskLevel === 'high' ? 'text-danger' : backlogPred.riskLevel === 'medium' ? 'text-accent' : 'text-accent2'}`}>
                    {backlogPred.overallRisk}%
                  </p>
                  <p className="text-muted text-xs mt-1">Overall Risk</p>
                </div>
                <div className="flex-1 border-l border-border/30 pl-6">
                  <p className="text-sm font-dm mb-2">{backlogPred.message}</p>
                  <p className="text-muted text-xs">{backlogPred.atRiskCount} of {backlogPred.totalSubjects} subjects at risk</p>
                </div>
              </div>

              {/* At-Risk Subjects */}
              {backlogPred.atRiskSubjects?.length > 0 && (
                <div className="space-y-3 mb-6">
                  {backlogPred.atRiskSubjects.map((sub: any, i: number) => (
                    <div key={i} className="border border-border/20 rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-syne font-semibold text-sm">{sub.subject}</span>
                        <span className={`text-xs px-2 py-0.5 rounded ${sub.riskLevel === 'high' ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
                          {sub.riskScore}% risk
                        </span>
                      </div>
                      <div className="w-full bg-border/30 rounded-full h-1.5 mb-2">
                        <div className={`h-1.5 rounded-full ${sub.riskLevel === 'high' ? 'bg-danger' : 'bg-accent'}`} style={{ width: `${sub.percentage}%` }} />
                      </div>
                      <p className="text-xs text-white/60">{sub.suggestion}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Plan */}
              {backlogPred.actionPlan?.length > 0 && (
                <div className="border-l-2 border-danger/30 pl-4 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-muted mb-2">Action Plan</p>
                  {backlogPred.actionPlan.map((a: string, i: number) => (
                    <p key={i} className="text-sm text-white/70">• {a}</p>
                  ))}
                </div>
              )}
            </motion.div>
          </section>
        )}

        {/* ═══ PATTERNS ═══ */}
        {patterns.length > 0 && (
          <section className="py-8">
            <motion.div {...anim}>
              <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Pattern Alerts</h2>
              {patterns.map((p: any, i: number) => (
                <div key={i} className={`border-l-4 py-3 px-5 mb-3 ${
                  p.severity === 'high' || p.type === 'critical' ? 'border-danger bg-danger/5' : p.severity === 'medium' || p.type === 'warning' ? 'border-accent bg-accent/5' : 'border-accent2 bg-accent2/5'
                }`}>
                  <p className="text-sm">{p.message}</p>
                </div>
              ))}
            </motion.div>
          </section>
        )}

        {/* ═══ MARKS TABLE ═══ */}
        <section className="py-8">
          <motion.div {...anim}>
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Subject-wise Marks</h2>
            <div className="space-y-4">
              {marks.map((m: any, i: number) => {
                const total = (m.internalMarks || 0) + (m.externalMarks || 0) + (m.practicalMarks || 0);
                const max = (m.maxInternal || 30) + (m.maxExternal || 70) + (m.maxPractical || 25);
                const pct = max > 0 ? Math.round((total / max) * 100) : 0;
                return (
                  <motion.div key={m._id || i} className="flex items-center gap-4 py-3 border-b border-border/20"
                    initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                    <div className="flex-1">
                      <p className="text-sm font-semibold">{m.subject}</p>
                      <p className="text-muted text-xs">Sem {m.semester} • Int: {m.internalMarks}/{m.maxInternal || 30} | Ext: {m.externalMarks}/{m.maxExternal || 70}</p>
                    </div>
                    <div className="w-32">
                      <div className="w-full bg-border/30 rounded-full h-2">
                        <div className={`h-2 rounded-full ${pct >= 60 ? 'bg-accent2' : pct >= 40 ? 'bg-accent' : 'bg-danger'}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className={`font-syne font-bold text-sm w-12 text-right ${pct >= 60 ? 'text-accent2' : pct >= 40 ? 'text-accent' : 'text-danger'}`}>
                      {pct}%
                    </span>
                  </motion.div>
                );
              })}
              {marks.length === 0 && <p className="text-muted text-center py-8">No marks added yet. Click &quot;+ Add Marks&quot; to start! 📝</p>}
            </div>
          </motion.div>
        </section>

        {/* ═══ ATTENDANCE ═══ */}
        <section className="py-8">
          <motion.div {...anim}>
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Attendance</h2>
            <div className="flex items-center divide-x divide-border">
              {attendance.length > 0 ? attendance.slice(0, 5).map((a: any, i: number) => {
                const pct = a.percentage || (a.totalClasses > 0 ? Math.round((a.attended / a.totalClasses) * 100) : 0);
                return (
                  <div key={i} className="flex-1 text-center px-4">
                    <p className={`font-syne text-2xl font-bold ${pct >= 75 ? 'text-accent2' : pct >= 60 ? 'text-accent' : 'text-danger'}`}>{pct}%</p>
                    <p className="text-muted text-xs mt-1 truncate">{a.subject}</p>
                  </div>
                );
              }) : <p className="text-muted text-sm py-4">No attendance data. Click &quot;+ Attendance&quot; to log.</p>}
            </div>
          </motion.div>
        </section>

        {predLoading && (
          <div className="fixed bottom-6 right-6 bg-surface border border-accent/30 rounded px-4 py-2 text-sm text-accent flex items-center gap-2">
            <span className="animate-spin">⚡</span> AI analyzing your data...
          </div>
        )}
      </main>
    </div>
  );
}
