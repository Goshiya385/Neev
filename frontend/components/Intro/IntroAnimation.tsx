'use client';
import { motion } from 'framer-motion';

export default function IntroAnimation({ onComplete }: { onComplete: () => void }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center relative overflow-hidden">
      <motion.div className="text-center z-10"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <motion.div className="text-7xl mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.3, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 1.5 }}
          onAnimationComplete={onComplete}>
          🌱
        </motion.div>
        <motion.h1 className="font-syne text-6xl font-bold"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}>
          <span className="text-accent">नींव</span>{' '}
          <span className="text-white">NEEV</span>
        </motion.h1>
        <motion.p className="text-muted text-lg mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}>
          Your foundation starts here
        </motion.p>
      </motion.div>
    </div>
  );
}
