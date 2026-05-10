'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import { getToken } from '@/lib/auth';

interface Message { role: 'user' | 'assistant'; content: string; timestamp: Date; isStreaming?: boolean; }

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const PROMPTS = [
  "What should I focus on this week?",
  "How placement ready am I?",
  "Which skills am I missing?",
  "Am I behind on my roadmap?",
  "Give me a weekly study plan.",
  "Help me with DSA preparation.",
  "How can I improve my CGPA?",
];

export default function SaarthiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadHistory(); }, []);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const loadHistory = async () => {
    try {
      const res = await fetch(`${API}/api/saarthi/history`, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (res.ok) {
        const data = await res.json();
        setMessages((data.messages || []).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      }
    } catch {}
    setHistoryLoaded(true);
  };

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim();
    if (!msg || loading) return;
    setInput('');
    setLoading(true);

    const userMsg: Message = { role: 'user', content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);

    // Try SSE streaming first, fallback to regular POST
    try {
      const streamUrl = `${API}/api/saarthi/stream?message=${encodeURIComponent(msg)}`;
      const res = await fetch(streamUrl, { headers: { Authorization: `Bearer ${getToken()}` } });

      if (res.ok && res.headers.get('content-type')?.includes('text/event-stream')) {
        const assistantMsg: Message = { role: 'assistant', content: '', timestamp: new Date(), isStreaming: true };
        setMessages(prev => [...prev, assistantMsg]);

        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const data = JSON.parse(line.slice(6));
                  if (data.done) break;
                  if (data.token) {
                    fullContent += data.token;
                    setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, content: fullContent } : m));
                  }
                  if (data.error) fullContent = data.error;
                } catch {}
              }
            }
          }
        }
        setMessages(prev => prev.map((m, i) => i === prev.length - 1 ? { ...m, isStreaming: false, content: fullContent } : m));
      } else {
        // Fallback: regular POST /chat
        const chatRes = await fetch(`${API}/api/saarthi/chat`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({ message: msg, history: messages.slice(-8) })
        });
        const data = await chatRes.json();
        const content = data.content || data.response || 'Saarthi is thinking... try again!';
        setMessages(prev => [...prev, { role: 'assistant', content, timestamp: new Date() }]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Saarthi thodi der baad milega 😅 Network issue!', timestamp: new Date() }]);
    }
    setLoading(false);
  };

  const clearHistory = async () => {
    try { await fetch(`${API}/api/saarthi/history`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } }); } catch {}
    setMessages([]);
  };

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 flex" style={{ height: 'calc(100vh - 0px)' }}>

        {/* Left: Suggested Prompts */}
        <div className="w-[280px] border-r border-border/30 p-8 flex-shrink-0 overflow-y-auto">
          <h2 className="font-syne text-2xl font-bold mb-1">Saarthi</h2>
          <p className="text-muted text-sm mb-10">Your AI Engineering Mentor</p>
          <p className="text-muted text-[10px] tracking-[0.15em] uppercase mb-4">Ask about</p>
          {PROMPTS.map((p, i) => (
            <button key={i} onClick={() => sendMessage(p)}
              className="block w-full text-left text-muted text-sm py-2 border-b border-border/20 hover:text-white transition-colors">
              <span className="text-accent mr-2">→</span>{p}
            </button>
          ))}
          <button onClick={clearHistory} className="mt-8 text-muted text-xs hover:text-danger transition-colors">
            Clear conversation
          </button>
        </div>

        {/* Right: Chat */}
        <div className="flex-1 flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-12 py-8">
            {!historyLoaded ? (
              <p className="text-muted text-center py-20">Loading...</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-syne text-4xl font-bold mb-4">Hey! 👋</p>
                <p className="text-muted text-lg">I&apos;m Saarthi — your personal AI mentor.</p>
                <p className="text-muted text-sm mt-2">Ask me anything about academics, placements, skills, or career.</p>
              </div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    className={`mb-8 flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'assistant' ? (
                      <div className="max-w-[580px]">
                        <p className="text-accent text-[10px] tracking-[0.12em] uppercase mb-1.5">Saarthi</p>
                        <p className="text-white text-base leading-relaxed font-dm whitespace-pre-wrap">
                          {msg.content}
                          {msg.isStreaming && <span className="animate-pulse ml-0.5">▊</span>}
                        </p>
                      </div>
                    ) : (
                      <div className="border-r-2 border-accent pr-4 max-w-[480px]">
                        <p className="text-white text-base leading-relaxed font-dm text-right">{msg.content}</p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {loading && messages[messages.length - 1]?.role !== 'assistant' && (
              <div className="flex gap-1.5 py-2">
                {[0, 1, 2].map(i => (
                  <motion.div key={i} animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                    className="w-2 h-2 rounded-full bg-accent" />
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="px-12 py-6 border-t border-border/30 flex gap-3 items-center">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask Saarthi anything..."
              className="flex-1 bg-transparent border-b border-border/40 text-white text-base py-2 outline-none font-dm placeholder:text-muted/50" />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="neev-btn text-sm disabled:opacity-30">
              {loading ? '⚡' : 'Send →'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
