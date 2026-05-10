'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import { getProfile, updateProfile } from '@/lib/api';
import { getUser } from '@/lib/auth';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

function getGenZTitle(cgpa: number, streak: number, placementReadiness: number) {
  if (cgpa >= 9.0) return { title: 'Absolute Slayer 💅', color: '#FFD700', desc: 'Topper energy is unmatched bestie' };
  if (cgpa >= 8.0) return { title: 'Main Character Energy ✨', color: '#F5A623', desc: 'You ate and left no crumbs' };
  if (streak >= 20) return { title: 'No Cap Grinder 🔥', color: '#FF9800', desc: 'Consistency is your superpower fr fr' };
  if (cgpa >= 7.0) return { title: 'Slay Mode: ON 💫', color: '#66BB6A', desc: 'You\'re giving what needs to be given' };
  if (placementReadiness >= 70) return { title: 'Corporate Girlie Era 💼', color: '#4FC3F7', desc: 'Placement ready and thriving' };
  if (cgpa >= 6.0) return { title: 'Lowkey Goated 🐐', color: '#AB47BC', desc: 'Under the radar but dangerous' };
  if (cgpa >= 5.0) return { title: 'Redemption Arc Loading 🎬', color: '#FF6B6B', desc: 'Every comeback story starts here' };
  return { title: 'Origin Story Phase 🌱', color: '#78909C', desc: 'The glow-up is coming trust' };
}

const BRANCHES = ['CS', 'IT', 'AI', 'ML', 'ECE', 'EE', 'ME', 'CE'];
const GOALS = ['Web Development', 'Full Stack', 'AI/ML', 'Data Science', 'Cybersecurity', 'UI/UX', 'Government Job', 'Startup', 'Higher Studies', 'Freelancing', 'Research', 'Not Decided'];

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [pfp, setPfp] = useState('');

  useEffect(() => {
    // Load profile pic from localStorage
    const saved = localStorage.getItem('neev_pfp');
    if (saved) setPfp(saved);
    getProfile().then(r => { setProfile(r.data); setForm(r.data); }).catch(() => { const u = getUser(); if (u) { setProfile(u); setForm(u); }}).finally(() => setLoading(false));
  }, []);

  const handlePfp = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { const b64 = reader.result as string; setPfp(b64); localStorage.setItem('neev_pfp', b64); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await updateProfile({ name: form.name, email: form.email, phone: form.phone, branch: form.branch, semester: form.semester, college: form.college, careerGoal: form.careerGoal,
        softSkills: form.softSkills, techProfile: form.techProfile });
      setProfile(res.data); setEditing(false);
    } catch {}
    setSaving(false);
  };

  const genZ = profile ? getGenZTitle(profile.cgpa || 0, profile.currentStreak || 0, profile.placementReadiness || 0) : null;

  if (loading) return <div className="min-h-screen bg-bg flex items-center justify-center text-muted">Loading...</div>;

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim}>
            <h1 className="font-syne text-[48px] font-bold">Profile</h1>
            <p className="text-muted text-sm mt-2">Your NEEV identity ✨</p>
          </motion.div>
        </section>

        {/* Profile Header */}
        <motion.div {...anim} className="flex items-center gap-8 mb-12 p-8 border border-border/20 rounded bg-surface/10">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-2 border-accent/40 overflow-hidden bg-surface/30 flex items-center justify-center">
              {pfp ? <img src={pfp} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-4xl">👤</span>}
            </div>
            <label className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
              <span className="text-xs text-white">📷 Change</span>
              <input type="file" accept="image/*" onChange={handlePfp} className="hidden" />
            </label>
          </div>
          <div className="flex-1">
            <h2 className="font-syne text-3xl font-bold">{profile?.name || 'Student'}</h2>
            <p className="text-muted text-sm mt-1">{profile?.rollNumber} • Sem {profile?.semester} • {profile?.branch}</p>
            {genZ && (
              <div className="mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border" style={{ borderColor: genZ.color + '40', backgroundColor: genZ.color + '10' }}>
                <span className="text-sm font-syne font-bold" style={{ color: genZ.color }}>{genZ.title}</span>
              </div>
            )}
            {genZ && <p className="text-xs text-muted mt-2 italic">{genZ.desc}</p>}
          </div>
          <button onClick={() => setEditing(!editing)} className="neev-btn text-sm">{editing ? '✕ Cancel' : '✏️ Edit Profile'}</button>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-4 mb-12">
          {[
            { label: 'CGPA', value: profile?.cgpa?.toFixed(1) || '0.0', color: '#F5A623' },
            { label: 'Streak', value: `${profile?.currentStreak || 0}d 🔥`, color: '#FF9800' },
            { label: 'Backlogs', value: profile?.backlogs || 0, color: profile?.backlogs > 0 ? '#FF6B6B' : '#66BB6A' },
            { label: 'Placement', value: `${profile?.placementReadiness || 0}%`, color: '#4FC3F7' },
            { label: 'Goal', value: profile?.careerGoal || 'Not Set', color: '#AB47BC' },
          ].map((s, i) => (
            <motion.div key={i} className="border border-border/20 rounded p-4 text-center" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
              <p className="font-syne text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
              <p className="text-muted text-[10px] uppercase tracking-wider mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Edit Form / Details */}
        {editing ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border border-accent/20 rounded p-8 bg-surface/10">
            <h3 className="font-syne font-semibold text-lg mb-6">Edit Your Details</h3>
            <div className="grid grid-cols-2 gap-6">
              <div><label className="text-xs text-muted uppercase tracking-wider">Name</label><input value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="neev-input mt-1" /></div>
              <div><label className="text-xs text-muted uppercase tracking-wider">Email</label><input value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="neev-input mt-1" /></div>
              <div><label className="text-xs text-muted uppercase tracking-wider">Phone</label><input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="neev-input mt-1" /></div>
              <div><label className="text-xs text-muted uppercase tracking-wider">College</label><input value={form.college || ''} onChange={e => setForm({ ...form, college: e.target.value })} className="neev-input mt-1" /></div>
              <div><label className="text-xs text-muted uppercase tracking-wider">Branch</label>
                <select value={form.branch || ''} onChange={e => setForm({ ...form, branch: e.target.value })} className="neev-input mt-1 bg-transparent">
                  {BRANCHES.map(b => <option key={b} value={b} className="bg-surface">{b}</option>)}
                </select>
              </div>
              <div><label className="text-xs text-muted uppercase tracking-wider">Semester</label>
                <select value={form.semester || 1} onChange={e => setForm({ ...form, semester: +e.target.value })} className="neev-input mt-1 bg-transparent">
                  {[1,2,3,4,5,6].map(s => <option key={s} value={s} className="bg-surface">Semester {s}</option>)}
                </select>
              </div>
              <div className="col-span-2"><label className="text-xs text-muted uppercase tracking-wider">Career Goal</label>
                <select value={form.careerGoal || ''} onChange={e => setForm({ ...form, careerGoal: e.target.value })} className="neev-input mt-1 bg-transparent">
                  {GOALS.map(g => <option key={g} value={g} className="bg-surface">{g}</option>)}
                </select>
              </div>
            </div>

            <h4 className="font-syne font-semibold mt-8 mb-4">Soft Skills</h4>
            <div className="grid grid-cols-2 gap-4">
              {[{k: 'englishFluency', l: 'English Fluency'}, {k: 'communicationConfidence', l: 'Communication'}, {k: 'aptitudeLevel', l: 'Aptitude'}, {k: 'interviewConfidence', l: 'Interview Confidence'}].map(s => (
                <div key={s.k}>
                  <label className="text-xs text-muted">{s.l}: {form.softSkills?.[s.k] || 5}/10</label>
                  <input type="range" min="1" max="10" value={form.softSkills?.[s.k] || 5} onChange={e => setForm({ ...form, softSkills: { ...form.softSkills, [s.k]: +e.target.value } })} className="w-full accent-[#F5A623]" />
                </div>
              ))}
            </div>

            <button onClick={handleSave} disabled={saving} className="neev-btn mt-8">{saving ? 'Saving...' : 'Save Changes →'}</button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-8">
            {/* Personal Info */}
            <motion.div {...anim} className="border border-border/20 rounded p-6">
              <h3 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Personal Info</h3>
              {[
                { l: 'Email', v: profile?.email },
                { l: 'Phone', v: profile?.phone },
                { l: 'College', v: profile?.college },
                { l: 'Branch', v: profile?.branch },
                { l: 'Semester', v: profile?.semester },
                { l: 'Roll Number', v: profile?.rollNumber },
              ].map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-border/10">
                  <span className="text-xs text-muted">{item.l}</span>
                  <span className="text-sm">{item.v || '—'}</span>
                </div>
              ))}
            </motion.div>

            {/* Tech Profile */}
            <motion.div {...anim} className="border border-border/20 rounded p-6">
              <h3 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Tech Stack</h3>
              {profile?.techProfile?.languages?.length > 0 && (
                <div className="mb-4"><p className="text-xs text-muted mb-2">Languages</p><div className="flex flex-wrap gap-2">{profile.techProfile.languages.map((l: string, i: number) => <span key={i} className="text-xs border border-accent/30 text-accent px-3 py-1 rounded">{l}</span>)}</div></div>
              )}
              {profile?.techProfile?.frameworks?.length > 0 && (
                <div className="mb-4"><p className="text-xs text-muted mb-2">Frameworks</p><div className="flex flex-wrap gap-2">{profile.techProfile.frameworks.map((f: string, i: number) => <span key={i} className="text-xs border border-[#66BB6A]/30 text-[#66BB6A] px-3 py-1 rounded">{f}</span>)}</div></div>
              )}
              {profile?.techProfile?.tools?.length > 0 && (
                <div className="mb-4"><p className="text-xs text-muted mb-2">Tools</p><div className="flex flex-wrap gap-2">{profile.techProfile.tools.map((t: string, i: number) => <span key={i} className="text-xs border border-[#4FC3F7]/30 text-[#4FC3F7] px-3 py-1 rounded">{t}</span>)}</div></div>
              )}
              {profile?.techProfile?.githubUrl && <div className="mt-4 text-sm"><span className="text-muted">GitHub: </span><a href={profile.techProfile.githubUrl} target="_blank" className="text-accent hover:underline">{profile.techProfile.githubUrl}</a></div>}
              {profile?.techProfile?.linkedinUrl && <div className="mt-2 text-sm"><span className="text-muted">LinkedIn: </span><a href={profile.techProfile.linkedinUrl} target="_blank" className="text-accent hover:underline">{profile.techProfile.linkedinUrl}</a></div>}
            </motion.div>

            {/* Soft Skills */}
            <motion.div {...anim} className="border border-border/20 rounded p-6 col-span-2">
              <h3 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Soft Skills</h3>
              <div className="grid grid-cols-4 gap-6">
                {[{k: 'englishFluency', l: 'English', c: '#4FC3F7'}, {k: 'communicationConfidence', l: 'Communication', c: '#66BB6A'}, {k: 'aptitudeLevel', l: 'Aptitude', c: '#F5A623'}, {k: 'interviewConfidence', l: 'Interview', c: '#AB47BC'}].map(s => {
                  const val = profile?.softSkills?.[s.k] || 0;
                  return (
                    <div key={s.k} className="text-center">
                      <div className="relative w-16 h-16 mx-auto">
                        <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                          <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={s.c} strokeWidth="3" strokeDasharray={`${val * 10} 100`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center font-syne font-bold">{val}</span>
                      </div>
                      <p className="text-[10px] text-muted mt-2 uppercase tracking-wider">{s.l}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}

        {/* Gen Z Vibes */}
        <section className="mt-16">
          <motion.div {...anim}>
            <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">🔥 Your Vibe Check</h2>
            <div className="grid grid-cols-4 gap-4">
              {[
                { emoji: '💅', text: profile?.cgpa >= 8 ? 'Period. You ate that.' : 'Glow-up in progress', sub: 'Academic Vibes' },
                { emoji: '🔥', text: (profile?.currentStreak || 0) >= 7 ? 'Streaking like a boss no cap' : 'Start streaking bestie', sub: 'Consistency' },
                { emoji: '💀', text: (profile?.backlogs || 0) === 0 ? 'Zero backlogs?? SLAY' : `${profile?.backlogs} backlogs... it's giving anxiety`, sub: 'Backlog Status' },
                { emoji: '✨', text: genZ?.title || 'Loading vibes...', sub: 'Overall Aura' },
              ].map((v, i) => (
                <div key={i} className="border border-border/15 rounded p-4 text-center hover:bg-surface/10 transition-colors">
                  <p className="text-3xl mb-2">{v.emoji}</p>
                  <p className="text-sm font-dm text-white/80">{v.text}</p>
                  <p className="text-[10px] text-muted mt-1 uppercase tracking-wider">{v.sub}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
}
