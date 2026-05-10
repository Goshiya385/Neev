'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { loginStudent, loginTeacher, registerStudent } from '@/lib/api';
import { setAuth } from '@/lib/auth';

export default function LoginPage() {
  const [mode, setMode] = useState<'student' | 'teacher'>('student');
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ rollNumber: '', email: '', password: '', name: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await registerStudent({ rollNumber: form.rollNumber, password: form.password, name: form.name });
      } else if (mode === 'student') {
        res = await loginStudent(form.rollNumber, form.password);
      } else {
        res = await loginTeacher(form.email, form.password);
      }
      setAuth(res.data.token, res.data.user, res.data.role);
      if (res.data.role === 'teacher' || res.data.role === 'admin') {
        router.push('/teacher/dashboard');
      } else if (!res.data.profileComplete) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (e: any) {
      setError(e.response?.data?.error || 'Something went wrong');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <motion.div className="w-full max-w-md"
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        
        <div className="text-center mb-12">
          <h1 className="font-syne text-4xl font-bold mb-2">
            <span className="text-accent">नींव</span> NEEV
          </h1>
          <p className="text-muted text-sm">Academic comeback starts here 💀</p>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-2 mb-10 bg-surface rounded-md p-1">
          {(['student', 'teacher'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setIsRegister(false); setError(''); }}
              className={`flex-1 py-2.5 text-sm font-syne font-semibold rounded transition-all ${
                mode === m ? 'bg-accent text-black' : 'text-muted hover:text-white'
              }`}>
              {m === 'student' ? '🎓 Student' : '👨‍🏫 Teacher'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {isRegister && (
            <input type="text" placeholder="Full Name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              className="neev-input" required />
          )}

          {mode === 'student' ? (
            <input type="text" placeholder="Roll Number" value={form.rollNumber}
              onChange={e => setForm({ ...form, rollNumber: e.target.value })}
              className="neev-input" required />
          ) : (
            <input type="email" placeholder="Email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="neev-input" required />
          )}

          <input type="password" placeholder="Password" value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="neev-input" required />

          {error && <p className="text-danger text-sm">{error}</p>}

          <button type="submit" disabled={loading} className="neev-btn w-full">
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Login'}
          </button>
        </form>

        {mode === 'student' && (
          <p className="text-center text-muted text-sm mt-8">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-accent hover:underline">
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        )}
      </motion.div>
    </div>
  );
}
