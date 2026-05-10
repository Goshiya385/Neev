'use client';
import { motion } from 'framer-motion';

export default function WeekStreak({ current, longest }: { current: number; longest: number }) {
  return (
    <motion.div className="flex items-center gap-6" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
      <div>
        <p className="stat-number text-accent text-3xl">{current}</p>
        <p className="text-muted text-xs mt-1">🔥 Current Streak</p>
      </div>
      <div className="w-px h-10 bg-border" />
      <div>
        <p className="stat-number text-accent2 text-3xl">{longest}</p>
        <p className="text-muted text-xs mt-1">🏆 Best Streak</p>
      </div>
    </motion.div>
  );
}
