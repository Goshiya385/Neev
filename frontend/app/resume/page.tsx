'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import ShimmerLoader from '@/components/Shared/ShimmerLoader';
import { getProfile, getSkills, getProjects } from '@/lib/api';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

export default function ResumePage() {
  const [student, setStudent] = useState<any>(null);
  const [skills, setSkills] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfile(), getSkills(), getProjects()])
      .then(([s, sk, p]) => {
        setStudent(s.data); setSkills(Array.isArray(sk.data) ? sk.data : sk.data?.skills || []);
        setProjects(p.data || []);
      }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><ShimmerLoader /></div>;

  const topSkills = skills.sort((a, b) => (b.completionPercent || 0) - (a.completionPercent || 0)).slice(0, 8);
  const completedProjects = projects.filter(p => p.status === 'completed');

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim} className="flex items-center justify-between">
            <h1 className="font-syne text-[48px] font-bold">Auto Resume</h1>
            <button onClick={() => window.print()} className="neev-btn text-sm">Download PDF →</button>
          </motion.div>
        </section>

        {/* Resume Preview */}
        <section className="py-8">
          <div className="max-w-3xl mx-auto bg-white text-black p-12 rounded" id="resume-print">
            {/* Header */}
            <div className="text-center mb-8 border-b border-gray-200 pb-6">
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'Syne, sans-serif' }}>{student?.name || 'Student Name'}</h2>
              <p className="text-gray-500 text-sm mt-2">
                {student?.email} • {student?.phone} • {student?.branch} Engineering
              </p>
              <div className="flex items-center justify-center gap-4 mt-2 text-sm text-gray-500">
                {student?.techProfile?.githubUrl && <span>GitHub ↗</span>}
                {student?.techProfile?.linkedinUrl && <span>LinkedIn ↗</span>}
              </div>
            </div>

            {/* Education */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">Education</h3>
              <div className="flex justify-between">
                <div>
                  <p className="font-semibold">{student?.college || 'College Name'}</p>
                  <p className="text-sm text-gray-600">B.E. in {student?.branch || 'Computer Science'} • Semester {student?.semester}</p>
                </div>
                <p className="font-semibold">CGPA: {student?.cgpa || '—'}</p>
              </div>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">Technical Skills</h3>
              <div className="text-sm">
                <p><strong>Languages:</strong> {topSkills.filter(s => s.category === 'language').map(s => s.skillName || s.name).join(', ') || 'N/A'}</p>
                <p><strong>Frameworks:</strong> {topSkills.filter(s => s.category === 'development').map(s => s.skillName || s.name).join(', ') || 'N/A'}</p>
                <p><strong>Tools:</strong> {topSkills.filter(s => s.category === 'tools').map(s => s.skillName || s.name).join(', ') || 'N/A'}</p>
              </div>
            </div>

            {/* Projects */}
            {completedProjects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">Projects</h3>
                {completedProjects.slice(0, 3).map((p, i) => (
                  <div key={i} className="mb-4">
                    <div className="flex justify-between">
                      <p className="font-semibold">{p.title}</p>
                      <p className="text-sm text-gray-500">{(p.techStack || []).join(', ')}</p>
                    </div>
                    {p.aiResumePoints?.length > 0 ? (
                      <ul className="text-sm text-gray-700 list-disc pl-5 mt-1">
                        {p.aiResumePoints.map((pt: string, j: number) => <li key={j}>{pt}</li>)}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">{p.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Soft Skills */}
            {student?.softSkills && (
              <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider border-b border-gray-200 pb-1 mb-3">Additional</h3>
                <p className="text-sm text-gray-700">
                  Career Goal: {student.careerGoal} • Communication: {student.softSkills.communicationConfidence}/10 • 
                  Aptitude: {student.softSkills.aptitudeLevel}/10
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
