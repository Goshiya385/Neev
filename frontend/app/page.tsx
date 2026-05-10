'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

const features = [
  { icon: '🤖', label: 'AI Mentorship', desc: 'Personalized Hinglish mentor powered by LLM' },
  { icon: '🗺️', label: 'Semester Roadmaps', desc: 'Career-goal-specific milestone tracking' },
  { icon: '🎯', label: 'Placement Engine', desc: 'Multi-dimensional readiness scoring' },
  { icon: '🔮', label: 'Smart Predictions', desc: 'CGPA forecasting & backlog risk detection' },
];

const steps = [
  { num: '01', title: 'Create Your Profile', desc: 'Add your semester, branch, career goal, and current skills.' },
  { num: '02', title: 'Track Everything', desc: 'Log marks, attendance, skills, projects — NEEV connects it all.' },
  { num: '03', title: 'Grow With AI', desc: 'Get personalized roadmaps, insights, and mentorship from Saarthi.' },
];

const doodles = ['⚙️', '💡', '🔧', '📐', '🧮', '💻', '🔬', '📏', '🧪', '⚡', '🚀', '🧠', '📊', '🎯', '🔥'];

export default function LandingPage() {
  const [showIntro, setShowIntro] = useState(true);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    const skipTimer = setTimeout(() => setCanSkip(true), 2000);
    const autoTimer = setTimeout(() => setShowIntro(false), 4000);
    return () => { clearTimeout(skipTimer); clearTimeout(autoTimer); };
  }, []);

  return (
    <>
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="fixed inset-0 z-50 bg-bg flex items-center justify-center cursor-pointer"
            onClick={() => canSkip && setShowIntro(false)}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Floating doodles */}
            {doodles.slice(0, 10).map((d, i) => (
              <motion.span key={i} className="absolute text-2xl"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.2, 1], opacity: [0, 0.12, 0.06] }}
                transition={{ duration: 2, delay: i * 0.12, repeat: Infinity, repeatType: 'reverse' }}
                style={{ left: `${10 + (i % 5) * 18}%`, top: `${15 + Math.floor(i / 5) * 45}%` }}>
                {d}
              </motion.span>
            ))}

            <div className="text-center z-10">
              {/* Seed SVG animation */}
              <motion.svg width="120" height="120" viewBox="0 0 120 120" className="mx-auto mb-8"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
                {/* Roots */}
                <motion.path d="M60 75 Q55 95 45 110" stroke="#4ADE80" strokeWidth="2" fill="none"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.2, duration: 0.6 }} />
                <motion.path d="M60 75 Q65 95 75 110" stroke="#4ADE80" strokeWidth="2" fill="none"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.4, duration: 0.6 }} />
                {/* Stem */}
                <motion.line x1="60" y1="75" x2="60" y2="35" stroke="#4ADE80" strokeWidth="3"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 1.8, duration: 0.5 }} />
                {/* Leaves */}
                <motion.path d="M60 50 Q45 40 40 30 Q50 35 60 45" fill="#4ADE80"
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2.3, duration: 0.4 }} />
                <motion.path d="M60 45 Q75 35 80 25 Q70 30 60 40" fill="#4ADE80"
                  initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2.5, duration: 0.4 }} />
                {/* Seed body */}
                <motion.ellipse cx="60" cy="78" rx="12" ry="8" fill="#F5A623"
                  initial={{ scale: 0 }} animate={{ scale: [0, 1.2, 1] }} transition={{ delay: 0.3, duration: 0.5 }} />
              </motion.svg>

              {/* Text */}
              <motion.h1 className="font-syne text-6xl font-bold mb-3"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.8 }}>
                <span className="text-accent">नींव</span>{' '}
                <span className="text-white">NEEV</span>
              </motion.h1>
              <motion.p className="text-muted text-lg font-dm"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 3.2 }}>
                Academic comeback starts here 💀
              </motion.p>
              <motion.p className="text-muted/40 text-xs mt-6"
                initial={{ opacity: 0 }} animate={{ opacity: canSkip ? 0.6 : 0 }} transition={{ duration: 0.3 }}>
                Click anywhere to skip
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-bg">
        {/* ===== HERO ===== */}
        <section className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
          {doodles.map((d, i) => (
            <span key={i} className="absolute text-xl opacity-[0.04] animate-float"
              style={{ left: `${5 + (i * 7) % 90}%`, top: `${10 + (i * 13) % 80}%`, animationDelay: `${i * 0.4}s` }}>
              {d}
            </span>
          ))}
          <motion.div className="text-center z-10 max-w-3xl"
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <p className="text-accent text-sm font-syne font-semibold tracking-[0.2em] uppercase mb-8">
              AI-Powered Growth Platform
            </p>
            <h1 className="font-syne text-[64px] md:text-[80px] leading-[1.05] font-bold mb-6">
              Build the{' '}<span className="text-accent">Foundation</span>
              <br />of Every Student&apos;s Career.
            </h1>
            <p className="text-muted text-lg font-dm mb-4 max-w-xl mx-auto leading-relaxed">
              Track academics. Build skills. Prepare for placements.
              Get AI mentorship. All from Semester 1 to 6.
            </p>
            <p className="text-muted/50 text-sm font-dm mb-12">Academic comeback starts here 💀</p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/login" className="neev-btn text-base px-10 py-3.5">Get Started →</Link>
              <a href="#features" className="text-muted hover:text-white text-sm font-dm transition-colors px-6 py-3">
                Explore Features ↓
              </a>
            </div>
          </motion.div>
        </section>

        {/* ===== STATS ===== */}
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { num: '6', label: 'Semesters Covered' },
              { num: '50+', label: 'Skills Tracked' },
              { num: '∞', label: 'AI Conversations' },
              { num: '100%', label: 'Free Forever' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                <p className="stat-number text-gradient">{s.num}</p>
                <p className="text-muted text-sm mt-2">{s.label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ===== WHAT WE OFFER ===== */}
        <section id="features" className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.p className="text-muted text-xs font-syne tracking-[0.3em] uppercase mb-4"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              What We Offer
            </motion.p>
            <motion.h2 className="font-syne text-4xl md:text-5xl font-bold mb-20"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              Elevate Every <span className="text-accent">Standard</span>
            </motion.h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-16">
              {features.map((f, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <span className="text-3xl block mb-4">{f.icon}</span>
                  <h3 className="font-syne text-base font-semibold mb-2">{f.label}</h3>
                  <p className="text-muted text-sm font-dm leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.p className="text-muted text-xs font-syne tracking-[0.3em] uppercase mb-4"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              How It Works
            </motion.p>
            <motion.h2 className="font-syne text-4xl font-bold mb-20"
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              Three Steps to <span className="text-accent">Growth</span>
            </motion.h2>
            <div className="space-y-16">
              {steps.map((s, i) => (
                <motion.div key={i} className="flex items-start gap-8"
                  initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.15 }}>
                  <span className="font-syne text-5xl font-bold text-accent/20">{s.num}</span>
                  <div>
                    <h3 className="font-syne text-xl font-semibold mb-2">{s.title}</h3>
                    <p className="text-muted text-base font-dm">{s.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== CTA ===== */}
        <section className="py-28 px-6">
          <div className="max-w-2xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-5xl mb-6">🌱</p>
              <h2 className="font-syne text-4xl font-bold mb-4">
                Your <span className="text-accent">Foundation</span> Starts Now
              </h2>
              <p className="text-muted text-lg mb-10">
                Join NEEV and transform your engineering journey from day one.
              </p>
              <Link href="/login" className="neev-btn text-lg px-12 py-4">Start Your Growth →</Link>
            </motion.div>
          </div>
        </section>

        {/* ===== FOOTER ===== */}
        <footer className="py-12 px-6 border-t border-border">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <p className="text-muted text-sm">
              <span className="text-accent font-syne font-bold">नींव</span> NEEV © 2026
            </p>
            <p className="text-muted/50 text-xs">Built with 💛 for engineering students who refuse to give up.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
