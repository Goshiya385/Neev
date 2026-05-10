'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import { getNotifications, markNotificationRead } from '@/lib/api';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };
const TABS = [
  { key: 'all', label: 'All', icon: '📬' },
  { key: 'reminder', label: 'Reminders', icon: '⏰' },
  { key: 'weekly', label: 'Weekly', icon: '📊' },
  { key: 'ai', label: 'AI Nudges', icon: '🤖' },
  { key: 'teacher', label: 'Teacher', icon: '👨‍🏫' },
];

function categorize(n: any): string {
  const t = (n.type || n.message || '').toLowerCase();
  if (t.includes('remind')) return 'reminder';
  if (t.includes('weekly') || t.includes('report')) return 'weekly';
  if (t.includes('ai') || t.includes('saarthi')) return 'ai';
  if (t.includes('teacher')) return 'teacher';
  return 'all';
}

function timeAgo(d: string) {
  const m = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  useEffect(() => {
    getNotifications().then(r => setNotifs(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleRead = async (id: string) => {
    try { await markNotificationRead(id); setNotifs(p => p.map(n => n._id === id ? { ...n, read: true } : n)); } catch {}
  };

  const filtered = tab === 'all' ? notifs : notifs.filter(n => categorize(n) === tab);
  const unread = notifs.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim} className="flex items-center justify-between">
            <div>
              <h1 className="font-syne text-[48px] font-bold">Notifications</h1>
              <p className="text-muted text-sm mt-2">{unread > 0 ? `${unread} unread` : 'All caught up!'} • {notifs.length} total</p>
            </div>
            {unread > 0 && <button onClick={() => notifs.filter(n => !n.read).forEach(n => handleRead(n._id))} className="text-accent text-sm hover:underline">Mark all read ✓</button>}
          </motion.div>
        </section>

        <div className="flex gap-1 mb-10 border-b border-border/30">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-syne font-semibold border-b-2 transition-all ${tab === t.key ? 'text-accent border-accent' : 'text-muted border-transparent hover:text-white'}`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? <p className="text-center py-20 text-muted">Loading...</p> : filtered.length === 0 ? (
          <div className="text-center py-20"><p className="text-4xl mb-4">📭</p><p className="text-muted font-syne">No notifications here</p></div>
        ) : (
          <div className="space-y-2">
            {filtered.map((n: any, i: number) => (
              <motion.div key={n._id || i} onClick={() => !n.read && handleRead(n._id)}
                className={`flex items-start gap-4 p-4 rounded border cursor-pointer transition-all ${n.read ? 'border-border/10 opacity-50' : 'border-border/20 bg-surface/20 hover:bg-surface/30'}`}
                initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03 }}>
                <div className="w-9 h-9 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-sm shrink-0">
                  {n.type === 'alert' ? '🚨' : n.type === 'streak' ? '🔥' : '📬'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-dm ${n.read ? 'text-muted' : 'text-white'}`}>{n.message}</p>
                  <span className="text-[10px] text-muted mt-1 block">{timeAgo(n.createdAt || new Date().toISOString())}</span>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-accent shrink-0 mt-2" />}
              </motion.div>
            ))}
          </div>
        )}

        <section className="mt-16">
          <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">💡 Smart Reminders</h2>
          <div className="grid grid-cols-3 gap-4">
            {[{ icon: '📚', text: 'Update marks after mid-sems' }, { icon: '🎯', text: 'Log daily study hours' }, { icon: '💻', text: 'Add new skills learned' }].map((r, i) => (
              <div key={i} className="border border-border/15 rounded p-4 flex items-center gap-3 hover:bg-surface/10 transition-colors">
                <span className="text-2xl">{r.icon}</span><span className="text-sm text-white/70">{r.text}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
