'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import ShimmerLoader from '@/components/Shared/ShimmerLoader';
import { getWrappedReport, getSemesterReport } from '@/lib/api';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

export default function ReportPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWrappedReport().then(r => setReport(r.data)).catch(() => {
      getSemesterReport(4).then(r => setReport(r.data)).catch(() => {});
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><ShimmerLoader /></div>;

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        {/* Title Slide */}
        <section className="py-20 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <p className="text-5xl mb-6">📊</p>
            <h1 className="font-syne text-[56px] font-bold mb-3">
              Your Semester <span className="text-accent">Wrapped</span>
            </h1>
            <p className="text-muted text-lg">{report?.studentName || 'Student'} • Semester {report?.semester || '—'}</p>
          </motion.div>
        </section>

        {/* Academic Stats */}
        <section className="py-16">
          <motion.div {...anim}>
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-10 text-center">Academic Highlights</h2>
            <div className="flex items-center divide-x divide-border justify-center max-w-3xl mx-auto">
              <div className="flex-1 text-center px-8">
                <p className="stat-number text-accent">{report?.cgpa || '—'}</p>
                <p className="text-muted text-sm mt-2">CGPA</p>
              </div>
              <div className="flex-1 text-center px-8">
                <p className="stat-number text-white">{report?.academics?.percentage || 0}%</p>
                <p className="text-muted text-sm mt-2">Overall Marks</p>
              </div>
              <div className="flex-1 text-center px-8">
                <p className="stat-number text-accent2">{report?.attendance?.percentage || 0}%</p>
                <p className="text-muted text-sm mt-2">Attendance</p>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Best & Worst */}
        {report?.academics?.bestSubject && (
          <section className="py-12">
            <motion.div {...anim} className="grid grid-cols-2 gap-12 max-w-2xl mx-auto">
              <div className="text-center">
                <p className="text-3xl mb-3">🏆</p>
                <p className="font-syne text-lg font-bold">{report.academics.bestSubject.name}</p>
                <p className="text-accent2 font-syne text-2xl font-bold mt-1">{report.academics.bestSubject.percentage}%</p>
                <p className="text-muted text-xs mt-1">Best Subject</p>
              </div>
              {report.academics.worstSubject && (
                <div className="text-center">
                  <p className="text-3xl mb-3">💀</p>
                  <p className="font-syne text-lg font-bold">{report.academics.worstSubject.name}</p>
                  <p className="text-danger font-syne text-2xl font-bold mt-1">{report.academics.worstSubject.percentage}%</p>
                  <p className="text-muted text-xs mt-1">Needs Work</p>
                </div>
              )}
            </motion.div>
          </section>
        )}

        {/* Skills & Projects */}
        <section className="py-12">
          <motion.div {...anim} className="grid grid-cols-3 gap-8 max-w-3xl mx-auto text-center">
            <div>
              <p className="stat-number text-info">{report?.skills?.totalTracked || 0}</p>
              <p className="text-muted text-sm mt-2">Skills Tracked</p>
            </div>
            <div>
              <p className="stat-number text-accent">{report?.projects?.completed || 0}</p>
              <p className="text-muted text-sm mt-2">Projects Done</p>
            </div>
            <div>
              <p className="stat-number text-accent2">{report?.streaks?.longestStreak || 0}</p>
              <p className="text-muted text-sm mt-2">Longest Streak</p>
            </div>
          </motion.div>
        </section>

        {/* Personality */}
        {report?.funStats?.personality && (
          <section className="py-16 text-center">
            <motion.div {...anim}>
              <p className="text-4xl mb-4">{report.funStats.topEmoji}</p>
              <p className="font-syne text-2xl font-bold">{report.funStats.personality}</p>
            </motion.div>
          </section>
        )}

        {/* Placement */}
        <section className="py-12 text-center">
          <motion.div {...anim}>
            <p className="text-muted text-xs tracking-[0.3em] uppercase mb-4">Placement Readiness</p>
            <p className="stat-number text-accent">{report?.placementReadiness || 0}%</p>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
