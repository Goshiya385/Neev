'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getTeacherStudents } from '@/lib/api';
import ShimmerLoader from '@/components/Shared/ShimmerLoader';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  useEffect(() => {
    getTeacherStudents().then(r => setStudents(r.data || []))
      .catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><ShimmerLoader /></div>;

  const getRisk = (s: any) => {
    if ((s.cgpa || 0) < 5 || (s.backlogs || 0) > 2) return 'high';
    if ((s.cgpa || 0) < 6.5 || (s.backlogs || 0) > 0) return 'moderate';
    return 'stable';
  };

  const filtered = students.filter(s => {
    const matchSearch = !search || s.name?.toLowerCase().includes(search.toLowerCase()) || s.rollNumber?.toLowerCase().includes(search.toLowerCase());
    const matchRisk = riskFilter === 'all' || getRisk(s) === riskFilter;
    return matchSearch && matchRisk;
  });

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
        <div className="px-6 py-6 border-t border-border/30">
          <Link href="/login" className="text-muted text-xs hover:text-danger">Logout →</Link>
        </div>
      </aside>

      <main className="ml-[240px] pt-8 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim}>
            <h1 className="font-syne text-[40px] font-bold mb-8">All Students</h1>
            <div className="flex gap-4 mb-8">
              <input placeholder="Search by name or roll number..." value={search}
                onChange={e => setSearch(e.target.value)} className="neev-input flex-1" />
              <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="neev-input bg-transparent w-48">
                <option value="all" className="bg-surface">All Risk Levels</option>
                <option value="stable" className="bg-surface">Stable</option>
                <option value="moderate" className="bg-surface">Moderate</option>
                <option value="high" className="bg-surface">High Risk</option>
              </select>
            </div>
          </motion.div>
        </section>

        {/* Student Table */}
        <section>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 text-muted text-left">
                  <th className="py-3 font-dm font-normal">Name</th>
                  <th className="py-3 font-dm font-normal">Roll</th>
                  <th className="py-3 font-dm font-normal">Sem</th>
                  <th className="py-3 font-dm font-normal">CGPA</th>
                  <th className="py-3 font-dm font-normal">Backlogs</th>
                  <th className="py-3 font-dm font-normal">Placement %</th>
                  <th className="py-3 font-dm font-normal">Risk</th>
                  <th className="py-3 font-dm font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: any, i: number) => {
                  const risk = getRisk(s);
                  return (
                    <motion.tr key={s._id || i} className="border-b border-border/10 hover:bg-surface/20 transition-colors"
                      initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                      <td className="py-3 font-semibold">{s.name}</td>
                      <td className="py-3 text-muted">{s.rollNumber}</td>
                      <td className="py-3">{s.semester}</td>
                      <td className="py-3 font-syne font-bold">{(s.cgpa || 0).toFixed(1)}</td>
                      <td className={`py-3 ${(s.backlogs || 0) > 0 ? 'text-danger font-bold' : 'text-muted'}`}>{s.backlogs || 0}</td>
                      <td className="py-3">{s.placementReadiness || 0}%</td>
                      <td className="py-3">
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                          risk === 'high' ? 'bg-danger/10 text-danger' : risk === 'moderate' ? 'bg-accent/10 text-accent' : 'bg-accent2/10 text-accent2'
                        }`}>{risk}</span>
                      </td>
                      <td className="py-3">
                        <Link href={`/teacher/students/${s._id}`} className="text-accent text-xs hover:underline">View →</Link>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="text-muted text-center py-12">No students match your filters.</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
