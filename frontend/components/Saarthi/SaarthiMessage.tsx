'use client';
import type { ChatMessage } from '@/lib/types';
export default function SaarthiMessage({ message }: { message: ChatMessage }) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] px-5 py-3 rounded-2xl text-sm leading-relaxed ${
        message.role === 'user' ? 'bg-accent text-black rounded-br-sm' : 'bg-surface text-white rounded-bl-sm'}`}>
        {message.role === 'assistant' && <p className="text-xs text-accent font-syne font-bold mb-1">Saarthi</p>}
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
