'use client';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface Props { data: { semester: number; sgpa: number }[]; }

export default function CGPATrend({ data }: Props) {
  if (!data || data.length === 0) return null;
  return (
    <div className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="semester" stroke="#7A9A88" fontSize={12} tickFormatter={v => `Sem ${v}`} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 10]} stroke="#7A9A88" fontSize={12} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#141F1A', border: '1px solid #1C2E25', borderRadius: 8, color: '#fff', fontFamily: 'DM Sans' }} />
          <Line type="monotone" dataKey="sgpa" stroke="#F5A623" strokeWidth={3} dot={{ fill: '#F5A623', r: 5 }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
