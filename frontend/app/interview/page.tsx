'use client';
import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Shared/Sidebar';
import Navbar from '@/components/Shared/Navbar';
import { evaluateInterview, getInterviewQuestions } from '@/lib/api';

const anim = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } as any };

const companies = ['TCS Digital', 'Infosys SP', 'Amazon', 'Google', 'General'];
const companyColors: Record<string, string> = {
  'TCS Digital': '#4FC3F7', 'Infosys SP': '#66BB6A', 'Amazon': '#FF9800', 'Google': '#EF5350', 'General': '#F5A623'
};

export default function InterviewPage() {
  const [activeCompany, setActiveCompany] = useState('General');
  const [questions, setQuestions] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [timer, setTimer] = useState(0);
  const [mode, setMode] = useState<'select' | 'practice' | 'result'>('select');
  const [history, setHistory] = useState<any[]>([]);
  const [speechSupported, setSpeechSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const startTimeRef = useRef<number>(0);

  // Check speech API support
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) setSpeechSupported(false);
    }
  }, []);

  // Load questions for selected company
  useEffect(() => {
    getInterviewQuestions(activeCompany, 5)
      .then(r => setQuestions(r.data.questions || []))
      .catch(() => setQuestions(['Tell me about yourself.', 'What are your strengths?', 'Where do you see yourself in 5 years?']));
  }, [activeCompany]);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    let finalText = '';

    recognition.onresult = (event: any) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript + ' ';
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setTranscript(finalText);
      setInterimTranscript(interim);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error !== 'no-speech') stopRecording();
    };

    recognition.onend = () => {
      // Auto-restart if still recording
      if (isRecording) {
        try { recognition.start(); } catch {}
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setTranscript('');
    setInterimTranscript('');
    setEvaluation(null);
    startTimeRef.current = Date.now();

    // Start timer
    timerRef.current = setInterval(() => {
      setTimer(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsRecording(false);
    clearInterval(timerRef.current);
  }, []);

  const handleEvaluate = async () => {
    const finalTranscript = transcript.trim();
    if (!finalTranscript || finalTranscript.length < 10) return;

    setEvaluating(true);
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);

    try {
      const res = await evaluateInterview({
        transcript: finalTranscript,
        question: questions[currentQ] || '',
        company: activeCompany,
        duration_seconds: duration
      });
      setEvaluation(res.data);
      setMode('result');

      // Save to history
      setHistory(prev => [{
        company: activeCompany, question: questions[currentQ], overall: res.data.overall_score,
        date: new Date().toLocaleString(), transcript: finalTranscript.slice(0, 100) + '...'
      }, ...prev].slice(0, 10));
    } catch (err) {
      console.error(err);
    }
    setEvaluating(false);
  };

  const startPractice = () => {
    setMode('practice');
    setCurrentQ(0);
    setTranscript('');
    setEvaluation(null);
  };

  const nextQuestion = () => {
    setCurrentQ(prev => Math.min(prev + 1, questions.length - 1));
    setTranscript('');
    setInterimTranscript('');
    setEvaluation(null);
    setMode('practice');
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  const ScoreRing = ({ score, label, color }: { score: number; label: string; color: string }) => {
    const pct = score * 10;
    return (
      <div className="text-center">
        <div className="relative w-20 h-20 mx-auto">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 36 36">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
            <motion.path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none" stroke={color} strokeWidth="3" strokeLinecap="round"
              initial={{ strokeDasharray: "0 100" }}
              animate={{ strokeDasharray: `${pct} 100` }}
              transition={{ duration: 1.2, ease: "easeOut" }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-syne text-lg font-bold">{score}</span>
        </div>
        <p className="text-muted text-[10px] mt-2 uppercase tracking-wider">{label}</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-bg"><Sidebar /><Navbar />
      <main className="ml-[240px] pt-16 px-10 pb-20">
        <section className="py-12">
          <motion.div {...anim}>
            <h1 className="font-syne text-[48px] font-bold">Interview Prep</h1>
            <p className="text-muted text-sm mt-2">AI-powered mock interviews with speech analysis 🎤</p>
          </motion.div>
        </section>

        {!speechSupported && (
          <div className="mb-8 px-6 py-4 border border-[#FF6B6B]/30 rounded bg-[#FF6B6B]/5">
            <p className="text-sm text-[#FF6B6B]">⚠️ Speech Recognition not supported in this browser. Use Chrome or Edge for voice features. You can still type your answers below.</p>
          </div>
        )}

        {/* Company Tabs */}
        <div className="flex gap-1 mb-10 border-b border-border/30">
          {companies.map(c => (
            <button key={c} onClick={() => { setActiveCompany(c); setMode('select'); }}
              className={`px-5 py-3 text-sm font-syne font-semibold border-b-2 transition-all ${
                activeCompany === c ? 'border-accent' : 'text-muted border-transparent hover:text-white'}`}
              style={activeCompany === c ? { color: companyColors[c], borderColor: companyColors[c] } : {}}>
              {c}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* ═══ SELECT MODE ═══ */}
          {mode === 'select' && (
            <motion.div key="select" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid grid-cols-2 gap-8">
                {/* Questions Preview */}
                <div>
                  <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Practice Questions</h2>
                  <div className="space-y-3">
                    {questions.map((q, i) => (
                      <motion.div key={i} className="flex items-start gap-3 py-3 border-b border-border/15"
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                        <span className="font-syne text-sm font-bold w-8" style={{ color: companyColors[activeCompany] }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-sm font-dm text-white/80">{q}</span>
                      </motion.div>
                    ))}
                  </div>
                  <button onClick={startPractice} className="neev-btn mt-8 text-sm">
                    🎤 Start Mock Interview →
                  </button>
                </div>

                {/* History */}
                <div>
                  <h2 className="font-syne text-xs tracking-[0.3em] uppercase text-muted mb-6">Practice History</h2>
                  {history.length === 0 ? (
                    <p className="text-muted text-sm py-8 text-center">No practice sessions yet. Start your first! 🚀</p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((h, i) => (
                        <div key={i} className="border border-border/20 rounded p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs text-muted">{h.company} • {h.date}</span>
                            <span className={`font-syne text-lg font-bold ${h.overall >= 7 ? 'text-[#66BB6A]' : h.overall >= 5 ? 'text-accent' : 'text-[#FF6B6B]'}`}>
                              {h.overall}/10
                            </span>
                          </div>
                          <p className="text-xs text-white/60 truncate">{h.question}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ═══ PRACTICE MODE ═══ */}
          {mode === 'practice' && (
            <motion.div key="practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Question */}
              <div className="mb-8 p-6 border border-accent/20 rounded bg-accent/5">
                <p className="text-xs text-accent uppercase tracking-wider mb-2">Question {currentQ + 1}/{questions.length}</p>
                <p className="font-syne text-xl font-semibold">{questions[currentQ]}</p>
              </div>

              {/* Recording Controls */}
              <div className="flex items-center gap-6 mb-8">
                {isRecording ? (
                  <button onClick={() => { stopRecording(); }} className="flex items-center gap-3 px-6 py-3 rounded bg-[#FF6B6B] text-white font-dm text-sm font-semibold">
                    <span className="w-3 h-3 bg-white rounded-sm animate-pulse" /> Stop Recording • {formatTime(timer)}
                  </button>
                ) : (
                  <button onClick={startRecording} disabled={!speechSupported}
                    className="flex items-center gap-3 px-6 py-3 rounded bg-accent text-black font-dm text-sm font-semibold disabled:opacity-40">
                    🎤 Start Speaking
                  </button>
                )}
                <button onClick={handleEvaluate} disabled={!transcript.trim() || evaluating}
                  className="px-6 py-3 rounded border border-accent/30 text-accent text-sm font-dm font-semibold disabled:opacity-30">
                  {evaluating ? '🔄 Evaluating...' : '📊 Evaluate Answer'}
                </button>
              </div>

              {/* Transcript */}
              <div className="mb-8">
                <p className="text-xs text-muted uppercase tracking-wider mb-3">Your Answer</p>
                <div className="min-h-[120px] p-4 border border-border/30 rounded bg-surface/20 text-sm font-dm leading-relaxed">
                  {transcript ? (
                    <span className="text-white/90">{transcript}<span className="text-white/30">{interimTranscript}</span></span>
                  ) : isRecording ? (
                    <span className="text-muted animate-pulse">Listening... speak your answer 🎤</span>
                  ) : (
                    <span className="text-muted">Click &quot;Start Speaking&quot; or type your answer below</span>
                  )}
                </div>
                {/* Fallback text input */}
                {!isRecording && (
                  <textarea value={transcript} onChange={e => setTranscript(e.target.value)} rows={3}
                    placeholder="Or type your answer here if speech isn't available..."
                    className="w-full mt-3 bg-transparent border border-border/20 rounded p-3 text-sm font-dm text-white/80 outline-none resize-none placeholder:text-muted/30" />
                )}
              </div>

              {/* Recording indicator */}
              {isRecording && (
                <motion.div className="flex items-center gap-3 text-[#FF6B6B] text-sm"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <span className="w-2 h-2 bg-[#FF6B6B] rounded-full animate-ping" />
                  Recording... speak clearly • {formatTime(timer)}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ═══ RESULT MODE ═══ */}
          {mode === 'result' && evaluation && (
            <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Verdict */}
              <div className="mb-10 p-6 border border-accent/20 rounded bg-accent/5 text-center">
                <p className="font-syne text-2xl font-bold mb-2">{evaluation.verdict || 'Good attempt!'}</p>
                <p className="text-muted text-sm">Overall: <span className="text-accent font-bold text-lg">{evaluation.overall_score}/10</span></p>
              </div>

              {/* Score Rings */}
              <div className="grid grid-cols-4 gap-6 mb-12">
                <ScoreRing score={evaluation.grammar_score || 5} label="Grammar" color="#4FC3F7" />
                <ScoreRing score={evaluation.clarity_score || 5} label="Clarity" color="#66BB6A" />
                <ScoreRing score={evaluation.confidence_score || 5} label="Confidence" color="#F5A623" />
                <ScoreRing score={evaluation.relevance_score || 5} label="Relevance" color="#EF5350" />
              </div>

              {/* Speech Stats */}
              <div className="grid grid-cols-4 gap-4 mb-10">
                {[
                  { label: 'Words', value: evaluation.word_count || 0 },
                  { label: 'WPM', value: evaluation.words_per_minute || 0 },
                  { label: 'Filler Words', value: evaluation.filler_word_count || 0 },
                  { label: 'Vocabulary', value: evaluation.vocabulary_level || 'basic' },
                ].map((s, i) => (
                  <div key={i} className="border border-border/20 rounded p-4 text-center">
                    <p className="font-syne text-2xl font-bold text-white">{s.value}</p>
                    <p className="text-muted text-[10px] uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* WPM Assessment */}
              {evaluation.wpm_assessment && (
                <div className="mb-8 px-6 py-3 border-l-4 border-accent">
                  <p className="text-sm font-dm">{evaluation.wpm_assessment}</p>
                </div>
              )}

              {/* Strengths & Weaknesses */}
              <div className="grid grid-cols-2 gap-8 mb-10">
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-[#66BB6A] mb-4">💪 Strengths</h3>
                  {(evaluation.strengths || []).map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm py-1.5"><span className="text-[#66BB6A]">✓</span><span className="text-white/80">{s}</span></div>
                  ))}
                </div>
                <div>
                  <h3 className="text-xs uppercase tracking-wider text-[#FF6B6B] mb-4">📌 Improve</h3>
                  {(evaluation.weaknesses || []).map((w: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm py-1.5"><span className="text-[#FF6B6B]">→</span><span className="text-white/80">{w}</span></div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="mb-10">
                <h3 className="text-xs uppercase tracking-wider text-muted mb-4">💡 Improvement Tips</h3>
                <div className="space-y-2">
                  {(evaluation.improvement_tips || []).map((tip: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 text-sm py-1.5"><span className="text-accent">{i + 1}.</span><span className="text-white/80">{tip}</span></div>
                  ))}
                </div>
              </div>

              {/* Better Answer */}
              {evaluation.sample_better_answer && (
                <div className="mb-10 p-4 border border-[#66BB6A]/20 rounded bg-[#66BB6A]/5">
                  <p className="text-xs uppercase tracking-wider text-[#66BB6A] mb-2">✨ Sample Better Answer</p>
                  <p className="text-sm text-white/80 font-dm leading-relaxed">{evaluation.sample_better_answer}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4">
                <button onClick={() => setMode('practice')} className="neev-btn text-sm">🔄 Try Again</button>
                {currentQ < questions.length - 1 && (
                  <button onClick={nextQuestion} className="px-6 py-3 rounded border border-accent/30 text-accent text-sm font-dm font-semibold">
                    Next Question →
                  </button>
                )}
                <button onClick={() => setMode('select')} className="px-6 py-3 text-muted text-sm hover:text-white transition-colors">
                  ← Back to Questions
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
