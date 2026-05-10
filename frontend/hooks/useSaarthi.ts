'use client';
import { useState } from 'react';
import { chatWithSaarthi } from '@/lib/api';
import type { ChatMessage } from '@/lib/types';

export function useSaarthi() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async (msg: string) => {
    const userMsg: ChatMessage = { role: 'user', content: msg };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    try {
      const res = await chatWithSaarthi(msg, messages);
      const botMsg: ChatMessage = { role: 'assistant', content: res.data.response };
      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I couldn\'t process that. Try again!' }]);
    } finally { setLoading(false); }
  };

  return { messages, loading, sendMessage, setMessages };
}
