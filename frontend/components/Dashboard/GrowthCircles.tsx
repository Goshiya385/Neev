'use client';
import { motion } from 'framer-motion';

interface Props {
  data: { label: string; value: number; max: number; color: string }[];
}

export default function GrowthCircles({ data }: Props) {
  return (
    <div className="flex gap-8 flex-wrap">
      {data.map((item, i) => {
        const pct = item.max > 0 ? (item.value / item.max) * 100 : 0;
        return (
          <motion.div key={i} className="text-center"
            initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            <div className="relative w-20 h-20 mx-auto mb-2">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.5" fill="none" stroke="#1C2E25" strokeWidth="2.5" />
                <circle cx="18" cy="18" r="15.5" fill="none" stroke={item.color} strokeWidth="2.5"
                  strokeDasharray={`${pct * 0.975} 97.5`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-sm font-syne font-bold">
                {Math.round(pct)}%
              </span>
            </div>
            <p className="text-muted text-xs">{item.label}</p>
          </motion.div>
        );
      })}
    </div>
  );
}
