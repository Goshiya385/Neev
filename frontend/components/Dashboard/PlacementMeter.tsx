'use client';
import { motion } from 'framer-motion';

export default function PlacementMeter({ score }: { score: number }) {
  return (
    <motion.div className="text-center" initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
      <div className="relative w-32 h-32 mx-auto mb-4">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1C2E25" strokeWidth="2" />
          <circle cx="18" cy="18" r="15.5" fill="none" stroke={score >= 60 ? '#4ADE80' : score >= 40 ? '#F5A623' : '#F87171'} strokeWidth="2.5"
            strokeDasharray={`${score * 0.975} 97.5`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-syne text-2xl font-bold">{score}%</span>
          <span className="text-muted text-[10px]">Ready</span>
        </div>
      </div>
    </motion.div>
  );
}
