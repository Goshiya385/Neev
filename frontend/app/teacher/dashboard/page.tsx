'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { isAuthenticated } from '@/lib/auth';
import { getTeacherDashboard, getRiskAlerts } from '@/lib/api';
import ShimmerLoader from '@/components/Shared/ShimmerLoader';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

const teacherNav = [
  { href: '/teacher/dashboard', label: '📊 Dashboard' },
  { href: '/teacher/students', label: '👥 Students' },
];

export default function TeacherDashboard() {
  const [data, setData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) { router.push('/login'); return; }
    Promise.all([getTeacherDashboard(), getRiskAlerts()])
      .then(([d, a]) => { setData(d.data); setAlerts(a.data || []); })
      .catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><ShimmerLoader /></div>;

  return (
    <div className="min-h-screen bg-bg">
      {/* Teacher Sidebar */}
      <aside className="fixed left-0 top-0 h-screen w-[240px] bg-bg border-r border-border/40 z-40 flex flex-col">
        <div className="px-8 py-8">
          <h1 className="font-syne text-2xl font-bold"><span className="text-accent">नींव</span> NEEV</h1>
          <p className="text-muted text-xs mt-1">Teacher Portal</p>
        </div>
        <nav className="px-4 flex-1">
          {teacherNav.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted hover:text-white transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 py-6 border-t border-border/30">
          <Link href="/login" className="text-muted text-xs hover:text-danger">Logout →</Link>
        </div>
      </aside>

      <main className="ml-[240px] pt-8 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim}>
            <h1 className="font-syne text-[40px] font-bold">Teacher Dashboard</h1>
            <p className="text-muted text-sm mt-2">{data?.teacherName || 'Dr. Faculty'} • {data?.department || 'Computer Science'}</p>
          </motion.div>
        </section>

        {/* Batch Overview — big numbers with dividers */}
        <section className="py-12">
          <motion.div {...anim}>
            <div className="flex items-center divide-x divide-border">
              {[
                { num: data?.totalStudents || 0, label: 'Total Students', color: 'text-white' },
                { num: (data?.avgCGPA || 0).toFixed(1), label: 'Average CGPA', color: 'text-accent' },
                { num: `${data?.avgAttendance || 0}%`, label: 'Avg Attendance', color: 'text-accent2' },
                { num: data?.atRiskCount || 0, label: 'At Risk', color: 'text-danger' },
              ].map((s, i) => (
                <div key={i} className="flex-1 text-center px-8">
                  <p className={`stat-number ${s.color}`}>{s.num}</p>
                  <p className="text-muted text-sm mt-2">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Risk Distribution */}
        <section className="py-12">
          <motion.div {...anim}>
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-8">Student Risk Levels</h2>
            <div className="grid grid-cols-3 gap-8">
              {[
                { label: 'Stable', count: (data?.totalStudents || 0) - (data?.atRiskCount || 0) - (data?.moderateRisk || 0), color: 'text-accent2', border: 'border-accent2/20' },
                { label: 'Moderate Risk', count: data?.moderateRisk || Math.floor((data?.atRiskCount || 0) * 0.6), color: 'text-accent', border: 'border-accent/20' },
                { label: 'High Risk', count: data?.highRisk || Math.ceil((data?.atRiskCount || 0) * 0.4), color: 'text-danger', border: 'border-danger/20' },
              ].map((r, i) => (
                <div key={i} className={`border ${r.border} rounded py-6 px-6 text-center`}>
                  <p className={`font-syne text-4xl font-bold ${r.color}`}>{r.count}</p>
                  <p className="text-muted text-sm mt-2">{r.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Risk Alerts */}
        <section className="py-12">
          <motion.div {...anim}>
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-8">Risk Alerts</h2>
            <div className="space-y-3">
              {alerts.length > 0 ? alerts.slice(0, 8).map((a: any, i: number) => (
                <motion.div key={i} className="flex items-center justify-between py-3 px-4 border-b border-border/20 text-sm"
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <span className="text-white/80">{a.message || a}</span>
                  {a.studentName && (
                    <Link href={`/teacher/students/${a.studentId}`} className="text-accent text-xs hover:underline">View →</Link>
                  )}
                </motion.div>
              )) : <p className="text-muted text-sm">No active risk alerts. All students are on track! ✅</p>}
            </div>
          </motion.div>
        </section>

        {/* Quick Link */}
        <section className="py-8">
          <Link href="/teacher/students" className="neev-btn inline-block">View All Students →</Link>
        </section>
      </main>
    </div>
  );
}
