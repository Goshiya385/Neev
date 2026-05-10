'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import { getToken } from '@/lib/auth';
import { getMyFeedback } from '@/lib/api';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const TARGETS = [
  { value: 'platform', label: 'NEEV Platform' },
  { value: 'saarthi', label: 'Saarthi AI' },
  { value: 'course', label: 'Course/Subject' },
  { value: 'teacher', label: 'Teacher/Mentor' },
  { value: 'general', label: 'General Feedback' },
];

const sentimentColors: Record<string, string> = {
  positive: '#66BB6A', negative: '#FF6B6B', neutral: '#78909C', mixed: '#F5A623'
};
const emotionEmojis: Record<string, string> = {
  happy: '😊', frustrated: '😤', anxious: '😰', motivated: '💪', confused: '😕',
  satisfied: '😌', disappointed: '😞', neutral: '😐'
};

export default function FeedbackPage() {
  const [content, setContent] = useState('');
  const [targetType, setTargetType] = useState('platform');
  const [rating, setRating] = useState(0);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentimentResult, setSentimentResult] = useState<any>(null);
  const [tab, setTab] = useState<'submit' | 'history'>('submit');
  const [history, setHistory] = useState<any[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  const loadHistory = () => {
    setHistLoading(true);
    getMyFeedback().then(r => setHistory(Array.isArray(r.data) ? r.data : [])).catch(() => {}).finally(() => setHistLoading(false));
  };

  useEffect(() => { if (tab === 'history') loadHistory(); }, [tab]);

  const handleSubmit = async () => {
    if (content.length < 10) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ content, targetType, rating: rating || undefined, isAnonymous })
      });
      if (res.ok) {
        const data = await res.json();
        setSubmitted(true);
        // Poll for sentiment result
        setTimeout(async () => {
          try {
            const fbRes = await getMyFeedback();
            const latest = (Array.isArray(fbRes.data) ? fbRes.data : [])[0];
            if (latest?.sentiment) setSentimentResult(latest.sentiment);
          } catch {}
        }, 3000);
      }
    } catch {}
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-syne text-[48px] font-bold leading-tight mb-4">Feedback</h1>
            <p className="text-muted text-base mb-8">Share your thoughts. Saarthi AI reads every word & analyzes sentiment.</p>
          </motion.div>
        </section>

        {/* Tabs */}
        <div className="flex gap-1 mb-10 border-b border-border/30">
          {[{ key: 'submit', label: '✍️ Submit Feedback' }, { key: 'history', label: '📊 My History' }].map(t => (
            <button key={t.key} onClick={() => { setTab(t.key as any); setSubmitted(false); }}
              className={`px-5 py-3 text-sm font-syne font-semibold border-b-2 transition-all ${tab === t.key ? 'text-accent border-accent' : 'text-muted border-transparent hover:text-white'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'submit' && (
          <>
            {submitted ? (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-[640px]">
                <div className="text-center py-12 mb-8">
                  <p className="font-syne text-[48px] font-bold mb-4">Thank you 🙏</p>
                  <p className="text-muted text-lg mb-8">Your feedback is being analyzed by Saarthi AI.</p>
                </div>

                {/* Sentiment Result */}
                {sentimentResult ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border border-accent/20 rounded p-6 bg-surface/10 mb-8">
                    <h3 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">🤖 AI Sentiment Analysis</h3>
                    <div className="grid grid-cols-3 gap-6 mb-6">
                      <div className="text-center">
                        <p className="text-3xl mb-1">{emotionEmojis[sentimentResult.emotion] || '😐'}</p>
                        <p className="text-sm font-syne capitalize" style={{ color: sentimentColors[sentimentResult.label] || '#78909C' }}>{sentimentResult.label}</p>
                        <p className="text-[10px] text-muted mt-1">Sentiment</p>
                      </div>
                      <div className="text-center">
                        <p className="font-syne text-3xl font-bold" style={{ color: sentimentColors[sentimentResult.label] || '#78909C' }}>{Math.round((sentimentResult.score || 0) * 100)}%</p>
                        <p className="text-[10px] text-muted mt-1">Confidence</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm capitalize">{sentimentResult.emotion || 'neutral'}</p>
                        <p className="text-[10px] text-muted mt-1">Emotion</p>
                      </div>
                    </div>
                    {sentimentResult.keywords?.length > 0 && (
                      <div><p className="text-xs text-muted mb-2">Keywords</p><div className="flex flex-wrap gap-2">{sentimentResult.keywords.map((k: string, i: number) => <span key={i} className="text-xs border border-accent/30 text-accent px-2 py-0.5 rounded">{k}</span>)}</div></div>
                    )}
                    {sentimentResult.summary && <p className="text-sm text-white/70 mt-4 italic">&quot;{sentimentResult.summary}&quot;</p>}
                  </motion.div>
                ) : (
                  <div className="text-center py-4"><p className="text-muted text-sm animate-pulse">Analyzing sentiment... ⏳</p></div>
                )}

                <button onClick={() => { setSubmitted(false); setContent(''); setRating(0); setSentimentResult(null); }} className="text-accent hover:underline text-sm">Submit another →</button>
              </motion.div>
            ) : (
              <div className="max-w-[640px]">
                <div className="mb-10">
                  <p className="text-muted text-[10px] tracking-[0.15em] uppercase mb-4">Feedback About</p>
                  <div className="flex flex-wrap gap-2">
                    {TARGETS.map(t => (
                      <button key={t.value} onClick={() => setTargetType(t.value)}
                        className={`px-4 py-2 rounded text-sm border transition-all ${targetType === t.value ? 'border-accent bg-accent/10 text-accent' : 'border-border/30 text-muted hover:text-white'}`}>{t.label}</button>
                    ))}
                  </div>
                </div>

                <div className="mb-10">
                  <p className="text-muted text-[10px] tracking-[0.15em] uppercase mb-4">Rating</p>
                  <div className="flex gap-2">{[1,2,3,4,5].map(s => <button key={s} onClick={() => setRating(s === rating ? 0 : s)} className={`text-3xl transition-opacity ${s <= rating ? 'opacity-100' : 'opacity-20'}`}>★</button>)}</div>
                </div>

                <div className="mb-10">
                  <p className="text-muted text-[10px] tracking-[0.15em] uppercase mb-4">Your Thoughts</p>
                  <textarea value={content} onChange={e => setContent(e.target.value)} rows={6}
                    placeholder="Write freely — what's working, what's not, what would help..."
                    className="w-full bg-transparent border-b border-border/40 text-white text-base py-2 outline-none resize-none font-dm leading-relaxed placeholder:text-muted/40" />
                  <p className="text-muted text-xs mt-2">{content.length}/1000</p>
                </div>

                <div className="flex items-center gap-3 mb-12">
                  <button onClick={() => setIsAnonymous(!isAnonymous)} className={`w-11 h-6 rounded-full border border-border/50 relative transition-colors ${isAnonymous ? 'bg-accent' : 'bg-surface'}`}>
                    <span className={`absolute top-0.5 w-[18px] h-[18px] rounded-full bg-white transition-all ${isAnonymous ? 'left-[22px]' : 'left-0.5'}`} />
                  </button>
                  <span className="text-muted text-sm">Submit anonymously</span>
                </div>

                <button onClick={handleSubmit} disabled={content.length < 10 || loading}
                  className={`px-8 py-3.5 rounded text-sm font-dm font-semibold uppercase tracking-wider transition-all ${content.length >= 10 ? 'bg-accent text-black' : 'bg-surface text-muted cursor-not-allowed'}`}>
                  {loading ? 'Submitting...' : 'Submit Feedback →'}
                </button>
              </div>
            )}
          </>
        )}

        {/* History Tab */}
        {tab === 'history' && (
          <div>
            {histLoading ? <p className="text-muted text-center py-12">Loading...</p> : history.length === 0 ? (
              <div className="text-center py-20"><p className="text-4xl mb-4">📝</p><p className="text-muted font-syne">No feedback submitted yet</p></div>
            ) : (
              <div className="space-y-4">
                {history.map((fb: any, i: number) => (
                  <motion.div key={fb._id || i} className="border border-border/20 rounded p-5"
                    initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs px-2 py-0.5 rounded-full border border-border/30 text-muted">{fb.targetType}</span>
                        {fb.rating > 0 && <span className="text-accent text-xs">{'★'.repeat(fb.rating)}</span>}
                        <span className="text-[10px] text-muted">{new Date(fb.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                      {fb.sentiment?.label && (
                        <span className="text-xs px-3 py-1 rounded-full font-syne font-semibold" style={{ color: sentimentColors[fb.sentiment.label] || '#78909C', backgroundColor: (sentimentColors[fb.sentiment.label] || '#78909C') + '15' }}>
                          {emotionEmojis[fb.sentiment.emotion] || '😐'} {fb.sentiment.label}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-white/80 font-dm leading-relaxed">{fb.content}</p>
                    {fb.sentiment?.summary && <p className="text-xs text-muted mt-3 italic border-l-2 border-accent/30 pl-3">{fb.sentiment.summary}</p>}
                    {fb.sentiment?.keywords?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">{fb.sentiment.keywords.map((k: string, j: number) => <span key={j} className="text-[10px] text-muted border border-border/20 px-2 py-0.5 rounded">{k}</span>)}</div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
