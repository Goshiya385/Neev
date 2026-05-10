'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import ShimmerLoader from '@/components/Shared/ShimmerLoader';
import { getProjects, addProject, deleteProject, generateResumePoints } from '@/lib/api';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', techStack: '', status: 'in-progress', githubUrl: '' });

  const load = () => { getProjects().then(r => setProjects(r.data || [])).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addProject({ ...form, techStack: form.techStack.split(',').map(s => s.trim()).filter(Boolean) });
      load(); setShowAdd(false); setForm({ title: '', description: '', techStack: '', status: 'in-progress', githubUrl: '' });
    } catch {}
  };

  const handleGenerate = async (id: string) => {
    try { await generateResumePoints(id); load(); } catch {}
  };

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center"><ShimmerLoader /></div>;

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim} className="flex items-center justify-between">
            <div>
              <h1 className="font-syne text-[48px] font-bold">Project Lab</h1>
              <p className="text-muted text-sm mt-2">{projects.length} projects • {projects.filter(p => p.status === 'completed').length} completed</p>
            </div>
            <button onClick={() => setShowAdd(!showAdd)} className="neev-btn text-sm">{showAdd ? '✕ Cancel' : '+ New Project'}</button>
          </motion.div>
        </section>

        {showAdd && (
          <motion.form onSubmit={handleAdd} className="mb-12 grid grid-cols-2 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <input placeholder="Project Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="neev-input" required />
            <input placeholder="Tech Stack (comma separated)" value={form.techStack} onChange={e => setForm({...form, techStack: e.target.value})} className="neev-input" />
            <input placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="neev-input col-span-2" />
            <input placeholder="GitHub URL" value={form.githubUrl} onChange={e => setForm({...form, githubUrl: e.target.value})} className="neev-input" />
            <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="neev-input bg-transparent">
              <option value="idea" className="bg-surface">Idea</option>
              <option value="in-progress" className="bg-surface">In Progress</option>
              <option value="completed" className="bg-surface">Completed</option>
            </select>
            <button type="submit" className="neev-btn col-span-2">Save Project →</button>
          </motion.form>
        )}

        <section className="py-6">
          <div className="space-y-8">
            {projects.map((p: any, i: number) => (
              <motion.div key={p._id || i} className="border-b border-border/20 pb-8"
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-syne text-lg font-semibold">{p.title}</h3>
                    <p className="text-muted text-sm mt-1">{p.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(p.techStack || []).map((t: string, j: number) => (
                        <span key={j} className="text-[10px] text-accent border border-accent/20 px-2 py-0.5 rounded">{t}</span>
                      ))}
                    </div>
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider px-3 py-1 rounded ${
                    p.status === 'completed' ? 'bg-accent2/10 text-accent2' : p.status === 'in-progress' ? 'bg-accent/10 text-accent' : 'bg-border/20 text-muted'
                  }`}>{p.status}</span>
                </div>
                {p.githubUrl && <a href={p.githubUrl} target="_blank" className="text-info text-xs mt-3 inline-block hover:underline">GitHub →</a>}
                {p.aiResumePoints?.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-accent2/30 space-y-1">
                    {p.aiResumePoints.map((pt: string, j: number) => (
                      <p key={j} className="text-xs text-white/70">• {pt}</p>
                    ))}
                  </div>
                )}
                {!p.aiResumePoints?.length && p.status === 'completed' && (
                  <button onClick={() => handleGenerate(p._id)} className="text-accent text-xs mt-3 hover:underline font-syne">
                    Generate Resume Points →
                  </button>
                )}
              </motion.div>
            ))}
            {projects.length === 0 && <p className="text-muted text-center py-16">No projects yet. Build something amazing!</p>}
          </div>
        </section>
      </main>
    </div>
  );
}
