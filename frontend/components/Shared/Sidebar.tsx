'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getUser } from '@/lib/auth';
import { getNotifications } from '@/lib/api';

const navItems = [
  { href: '/dashboard', icon: '📊', label: 'Dashboard' },
  { href: '/academics', icon: '📚', label: 'Academics' },
  { href: '/skills', icon: '🛠️', label: 'Skills' },
  { href: '/roadmap', icon: '🗺️', label: 'Roadmap' },
  { href: '/planner', icon: '📋', label: 'Planner' },
  { href: '/projects', icon: '💻', label: 'Projects' },
  { href: '/placement', icon: '🎯', label: 'Placement' },
  { href: '/career', icon: '🚀', label: 'Career AI' },
  { href: '/interview', icon: '🎤', label: 'Interview' },
  { href: '/resume', icon: '📄', label: 'Resume' },
  { href: '/saarthi', icon: '🤖', label: 'Saarthi AI' },
  { href: '/safespace', icon: '💚', label: 'Safe Space' },
  { href: '/whatif', icon: '🔮', label: 'What-If' },
  { href: '/notifications', icon: '🔔', label: 'Notifications' },
  { href: '/report', icon: '📈', label: 'Report' },
  { href: '/feedback', icon: '💬', label: 'Feedback' },
];

function getGenZBadge(cgpa: number, streak: number) {
  if (cgpa >= 9.0) return { text: 'Slayer 💅', color: '#FFD700' };
  if (cgpa >= 8.0) return { text: 'Main Char ✨', color: '#F5A623' };
  if (streak >= 20) return { text: 'Grinder 🔥', color: '#FF9800' };
  if (cgpa >= 7.0) return { text: 'Slay Mode 💫', color: '#66BB6A' };
  if (cgpa >= 6.0) return { text: 'Goated 🐐', color: '#AB47BC' };
  if (cgpa >= 5.0) return { text: 'Loading 🎬', color: '#FF6B6B' };
  return { text: 'Rising 🌱', color: '#78909C' };
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [pfp, setPfp] = useState('');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const u = getUser();
    setUser(u);
    const savedPfp = localStorage.getItem('neev_pfp');
    if (savedPfp) setPfp(savedPfp);
    getNotifications().then(r => {
      const notifs = Array.isArray(r.data) ? r.data : [];
      setUnread(notifs.filter((n: any) => !n.read).length);
    }).catch(() => {});
  }, []);

  const badge = user ? getGenZBadge(user.cgpa || 0, user.currentStreak || 0) : null;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[240px] bg-bg border-r border-border/40 z-40 flex flex-col">
      <Link href="/" className="px-8 py-6 block">
        <h1 className="font-syne text-2xl font-bold">
          <span className="text-accent">नींव</span> NEEV
        </h1>
      </Link>

      {/* Profile Section */}
      <Link href="/profile" className="mx-4 mb-4 p-3 rounded border border-border/20 hover:bg-surface/20 transition-colors group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-accent/30 overflow-hidden bg-surface/30 flex items-center justify-center shrink-0">
            {pfp ? <img src={pfp} alt="PFP" className="w-full h-full object-cover" /> : <span className="text-lg">👤</span>}
          </div>
          <div className="min-w-0">
            <p className="font-syne text-sm font-semibold truncate group-hover:text-accent transition-colors">{user?.name || 'Student'}</p>
            <p className="text-[10px] text-muted truncate">{user?.rollNumber || 'NEEV2024XXX'}</p>
          </div>
        </div>
        {badge && (
          <div className="mt-2 text-center">
            <span className="text-[10px] font-syne font-bold px-2 py-0.5 rounded-full" style={{ color: badge.color, backgroundColor: badge.color + '15', border: `1px solid ${badge.color}30` }}>
              {badge.text}
            </span>
          </div>
        )}
      </Link>

      <nav className="flex-1 px-4 overflow-y-auto">
        <div className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            const isNotif = item.href === '/notifications';
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded text-sm font-dm transition-all ${
                  isActive
                    ? 'text-accent border-l-2 border-accent bg-accent/5'
                    : 'text-muted hover:text-white hover:bg-white/[0.02]'
                }`}>
                <span className="text-base">{item.icon}</span>
                <span className="flex-1">{item.label}</span>
                {isNotif && unread > 0 && (
                  <span className="w-5 h-5 bg-accent text-black text-[9px] rounded-full flex items-center justify-center font-bold">{unread > 9 ? '9+' : unread}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="px-6 py-6 border-t border-border/30">
        <Link href="/login" className="text-muted text-xs hover:text-danger transition-colors">
          Logout →
        </Link>
      </div>
    </aside>
  );
}
