'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { completeOnboarding } from '@/lib/api';

const branches = ['CS', 'IT', 'ECE', 'EE', 'ME', 'CE', 'Other'];
const goals = ['Full Stack', 'AI/ML', 'Data Science', 'Cybersecurity', 'UI/UX', 'DevOps', 'Mobile Dev', 'Not Decided'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    name: '', phone: '', branch: 'CS', semester: 1, college: '',
    careerGoal: 'Not Decided', cgpa: 0,
    languages: '', frameworks: '', tools: '',
    githubUrl: '', linkedinUrl: '',
    englishFluency: 5, communicationConfidence: 5, aptitudeLevel: 5,
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const next = () => setStep(s => Math.min(s + 1, 3));
  const prev = () => setStep(s => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await completeOnboarding({
        ...form,
        techProfile: {
          languages: form.languages.split(',').map(s => s.trim()).filter(Boolean),
          frameworks: form.frameworks.split(',').map(s => s.trim()).filter(Boolean),
          tools: form.tools.split(',').map(s => s.trim()).filter(Boolean),
          githubUrl: form.githubUrl, linkedinUrl: form.linkedinUrl,
        },
        softSkills: {
          englishFluency: form.englishFluency,
          communicationConfidence: form.communicationConfidence,
          aptitudeLevel: form.aptitudeLevel,
          interviewConfidence: 5,
        },
      });
      router.push('/dashboard');
    } catch {} finally { setLoading(false); }
  };

  const steps = [
    // Step 0: Basic Info
    <div key={0} className="space-y-6">
      <h2 className="font-syne text-2xl font-bold mb-8">Tell us about yourself</h2>
      <input placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="neev-input" required />
      <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="neev-input" />
      <input placeholder="College Name" value={form.college} onChange={e => setForm({...form, college: e.target.value})} className="neev-input" />
      <div className="grid grid-cols-2 gap-6">
        <select value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="neev-input bg-transparent">
          {branches.map(b => <option key={b} value={b} className="bg-surface">{b}</option>)}
        </select>
        <select value={form.semester} onChange={e => setForm({...form, semester: +e.target.value})} className="neev-input bg-transparent">
          {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s} className="bg-surface">Semester {s}</option>)}
        </select>
      </div>
      <input placeholder="Current CGPA" type="number" step="0.1" min="0" max="10" value={form.cgpa || ''} onChange={e => setForm({...form, cgpa: +e.target.value})} className="neev-input" />
    </div>,

    // Step 1: Career Goal
    <div key={1} className="space-y-6">
      <h2 className="font-syne text-2xl font-bold mb-4">What&apos;s your career goal?</h2>
      <p className="text-muted text-sm mb-8">This helps us personalize your roadmap</p>
      <div className="grid grid-cols-2 gap-4">
        {goals.map(g => (
          <button key={g} onClick={() => setForm({...form, careerGoal: g})}
            className={`py-4 px-6 rounded text-left text-sm font-dm border transition-all ${
              form.careerGoal === g ? 'border-accent bg-accent/10 text-accent' : 'border-border/30 text-muted hover:border-border'
            }`}>{g}</button>
        ))}
      </div>
    </div>,

    // Step 2: Tech Profile
    <div key={2} className="space-y-6">
      <h2 className="font-syne text-2xl font-bold mb-8">Your tech stack</h2>
      <input placeholder="Languages (e.g. JavaScript, Python, Java)" value={form.languages} onChange={e => setForm({...form, languages: e.target.value})} className="neev-input" />
      <input placeholder="Frameworks (e.g. React, Node.js, Django)" value={form.frameworks} onChange={e => setForm({...form, frameworks: e.target.value})} className="neev-input" />
      <input placeholder="Tools (e.g. Git, Docker, VS Code)" value={form.tools} onChange={e => setForm({...form, tools: e.target.value})} className="neev-input" />
      <input placeholder="GitHub URL" value={form.githubUrl} onChange={e => setForm({...form, githubUrl: e.target.value})} className="neev-input" />
      <input placeholder="LinkedIn URL" value={form.linkedinUrl} onChange={e => setForm({...form, linkedinUrl: e.target.value})} className="neev-input" />
    </div>,

    // Step 3: Soft Skills
    <div key={3} className="space-y-8">
      <h2 className="font-syne text-2xl font-bold mb-8">Rate your soft skills</h2>
      {[
        { key: 'englishFluency', label: 'English Fluency' },
        { key: 'communicationConfidence', label: 'Communication Confidence' },
        { key: 'aptitudeLevel', label: 'Aptitude Level' },
      ].map(sk => (
        <div key={sk.key}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">{sk.label}</span>
            <span className="text-accent font-syne font-bold">{(form as any)[sk.key]}/10</span>
          </div>
          <input type="range" min="1" max="10" value={(form as any)[sk.key]}
            onChange={e => setForm({...form, [sk.key]: +e.target.value})}
            className="w-full accent-[#F5A623] h-1.5" />
        </div>
      ))}
    </div>,
  ];

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <motion.div className="w-full max-w-lg"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>

        <div className="text-center mb-12">
          <h1 className="font-syne text-4xl font-bold mb-2">
            <span className="text-accent">नींव</span> NEEV
          </h1>
          <p className="text-muted text-sm">Set up your profile • Step {step + 1} of 4</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-12">
          {[0,1,2,3].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full ${i <= step ? 'bg-accent' : 'bg-border/30'}`} />
          ))}
        </div>

        <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
          {steps[step]}
        </motion.div>

        <div className="flex items-center justify-between mt-12">
          <button onClick={prev} disabled={step === 0}
            className={`text-sm font-syne ${step === 0 ? 'text-border' : 'text-muted hover:text-white'}`}>
            ← Back
          </button>
          {step < 3 ? (
            <button onClick={next} className="neev-btn">Next →</button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} className="neev-btn">
              {loading ? 'Setting up...' : 'Launch Dashboard →'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
