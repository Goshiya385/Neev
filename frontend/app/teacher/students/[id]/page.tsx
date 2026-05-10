'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getStudentDetail, notifyStudent } from '@/lib/api';
import ShimmerLoader from '@/components/Shared/ShimmerLoader';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

export default function StudentDetailPage() {
  const params = useParams();
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (params?.id) {
      getStudentDetail(params.id as string).then(r => setStudent(r.data)).catch(() => {}).finally(() => setLoading(false));
    }
  }, [params?.id]);

  const sendNotification = async () => {
    if (!msg.trim() || !params?.id) return;
    try { await notifyStudent(params.id as string, { message: msg }); setMsg(''); alert('Notification sent!'); } catch {}
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><ShimmerLoader /></div>;
  if (!student) return <div className="min-h-screen bg-bg flex items-center justify-center text-muted">Student not found</div>;

  const s = student.student || student;
  const risk = (s.cgpa || 0) < 5 || (s.backlogs || 0) > 2 ? 'high' : (s.cgpa || 0) < 6.5 ? 'moderate' : 'stable';

  return (
    <div className="min-h-screen bg-bg">
      <aside className="fixed left-0 top-0 h-screen w-[240px] bg-bg border-r border-border/40 z-40 flex flex-col">
        <div className="px-8 py-8">
          <h1 className="font-syne text-2xl font-bold"><span className="text-accent">नींव</span> NEEV</h1>
          <p className="text-muted text-xs mt-1">Teacher Portal</p>
        </div>
        <nav className="px-4 flex-1">
          <Link href="/teacher/dashboard" className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-white">📊 Dashboard</Link>
          <Link href="/teacher/students" className="flex items-center gap-3 px-4 py-2.5 text-sm text-accent border-l-2 border-accent">👥 Students</Link>
        </nav>
      </aside>

      <main className="ml-[240px] pt-8 px-10 pb-20">
        <section className="py-8">
          <Link href="/teacher/students" className="text-muted text-sm hover:text-white">← Back to Students</Link>
        </section>

        {/* Student Header */}
        <section className="py-8">
          <motion.div {...anim} className="flex items-center justify-between">
            <div>
              <h1 className="font-syne text-[40px] font-bold">{s.name}</h1>
              <p className="text-muted text-sm mt-1">{s.rollNumber} • Sem {s.semester} • {s.branch} • {s.college}</p>
            </div>
            <span className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded ${
              risk === 'high' ? 'bg-danger/10 text-danger' : risk === 'moderate' ? 'bg-accent/10 text-accent' : 'bg-accent2/10 text-accent2'
            }`}>{risk} risk</span>
          </motion.div>
        </section>

        {/* Key Stats */}
        <section className="py-8">
          <motion.div {...anim}>
            <div className="flex items-center divide-x divide-border">
              {[
                { num: (s.cgpa || 0).toFixed(1), label: 'CGPA', color: 'text-accent' },
                { num: s.backlogs || 0, label: 'Backlogs', color: (s.backlogs || 0) > 0 ? 'text-danger' : 'text-accent2' },
                { num: `${s.placementReadiness || 0}%`, label: 'Placement', color: 'text-info' },
                { num: s.currentStreak || 0, label: 'Streak', color: 'text-accent2' },
              ].map((stat, i) => (
                <div key={i} className="flex-1 text-center px-6">
                  <p className={`font-syne text-4xl font-bold ${stat.color}`}>{stat.num}</p>
                  <p className="text-muted text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Profile Details */}
        <section className="py-8">
          <motion.div {...anim}>
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Profile</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-border/20"><span className="text-muted">Email</span><span>{s.email}</span></div>
              <div className="flex justify-between py-2 border-b border-border/20"><span className="text-muted">Phone</span><span>{s.phone || '—'}</span></div>
              <div className="flex justify-between py-2 border-b border-border/20"><span className="text-muted">Career Goal</span><span>{s.careerGoal}</span></div>
              <div className="flex justify-between py-2 border-b border-border/20"><span className="text-muted">Last Active</span><span>{s.lastActiveDate ? new Date(s.lastActiveDate).toLocaleDateString() : '—'}</span></div>
            </div>
          </motion.div>
        </section>

        {/* Skills */}
        {student.skills?.length > 0 && (
          <section className="py-8">
            <motion.div {...anim}>
              <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {student.skills.map((sk: any, i: number) => (
                  <span key={i} className="text-xs border border-border/30 px-3 py-1.5 rounded">
                    {sk.skillName || sk.name} <span className="text-accent ml-1">{sk.completionPercent || sk.progress}%</span>
                  </span>
                ))}
              </div>
            </motion.div>
          </section>
        )}

        {/* Send Notification */}
        <section className="py-8">
          <motion.div {...anim}>
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Send Notification</h2>
            <div className="flex gap-4">
              <input placeholder="Type a message to this student..." value={msg}
                onChange={e => setMsg(e.target.value)} className="neev-input flex-1" />
              <button onClick={sendNotification} disabled={!msg.trim()} className="neev-btn">Send →</button>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
