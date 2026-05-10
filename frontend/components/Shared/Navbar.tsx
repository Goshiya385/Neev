'use client';
import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead } from '@/lib/api';
import { getUser } from '@/lib/auth';

export default function Navbar() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const user = getUser();

  useEffect(() => {
    getNotifications().then(r => setNotifications(r.data || [])).catch(() => {});
  }, []);

  const unread = notifications.filter(n => !n.read).length;

  const handleRead = async (id: string) => {
    try { await markNotificationRead(id); setNotifications(prev => prev.map(n => n._id === id ? {...n, read: true} : n)); } catch {}
  };

  return (
    <nav className="fixed top-0 left-[240px] right-0 h-16 bg-bg/80 backdrop-blur-md border-b border-border/20 z-30 flex items-center justify-end px-8">
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative">
          <button onClick={() => setShowNotifs(!showNotifs)}
            className="text-muted hover:text-white transition-colors text-sm relative">
            🔔
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent text-black text-[9px] rounded-full flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </button>
          {showNotifs && (
            <div className="absolute right-0 top-10 w-72 bg-surface border border-border/30 rounded shadow-xl z-50 max-h-80 overflow-y-auto">
              <div className="px-4 py-3 border-b border-border/20">
                <p className="font-syne text-xs font-semibold">Notifications</p>
              </div>
              {notifications.length > 0 ? notifications.slice(0, 10).map((n: any) => (
                <div key={n._id} onClick={() => handleRead(n._id)}
                  className={`px-4 py-3 text-xs border-b border-border/10 cursor-pointer hover:bg-bg/50 ${n.read ? 'text-muted' : 'text-white'}`}>
                  {n.message}
                </div>
              )) : <p className="px-4 py-6 text-xs text-muted text-center">No notifications</p>}
            </div>
          )}
        </div>

        {/* User */}
        <span className="text-sm text-muted font-dm">{user?.name || 'Student'}</span>
      </div>
    </nav>
  );
}
