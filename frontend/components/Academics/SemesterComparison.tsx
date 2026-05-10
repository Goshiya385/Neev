'use client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

export default function SemesterComparison({ data }: { data: { semester: number; sgpa: number }[] }) {
  if (!data || data.length === 0) return null;
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="semester" stroke="#7A9A88" fontSize={12} tickFormatter={v => `Sem ${v}`} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} stroke="#7A9A88" fontSize={12} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#141F1A', border: '1px solid #1C2E25', borderRadius: 8, color: '#fff' }} />
          <Bar dataKey="sgpa" fill="#F5A623" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
