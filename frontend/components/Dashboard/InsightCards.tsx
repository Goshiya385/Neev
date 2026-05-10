'use client';
import { motion } from 'framer-motion';
import type { Insight } from '@/lib/types';

export default function InsightCards({ insights }: { insights: Insight[] }) {
  if (!insights || insights.length === 0) return null;
  const colorMap: Record<string, string> = { accent: 'border-accent', accent2: 'border-accent2', danger: 'border-danger', info: 'border-info', muted: 'border-muted' };
  return (
    <div className="space-y-4">
      {insights.map((ins, i) => (
        <motion.div key={i} className={`flex items-start gap-4 py-4 border-l-2 pl-4 ${colorMap[ins.color] || 'border-border'}`}
          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
          <span className="text-2xl">{ins.icon}</span>
          <p className="text-sm font-dm leading-relaxed">{ins.message}</p>
        </motion.div>
      ))}
    </div>
  );
}
