'use client';
import { useRef, useEffect } from 'react';
import type { ChatMessage } from '@/lib/types';
import SaarthiMessage from './SaarthiMessage';
import SaarthiTyping from './SaarthiTyping';

interface Props { messages: ChatMessage[]; loading: boolean; }

export default function SaarthiChat({ messages, loading }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  return (
    <div className="flex-1 overflow-y-auto px-8 py-6 space-y-4">
      {messages.map((msg, i) => <SaarthiMessage key={i} message={msg} />)}
      {loading && <SaarthiTyping />}
      <div ref={bottomRef} />
    </div>
  );
}
