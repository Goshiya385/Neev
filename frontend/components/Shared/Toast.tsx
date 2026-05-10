'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ToastProps { message: string; type?: 'success' | 'error' | 'info'; onClose: () => void; }

export default function Toast({ message, type = 'info', onClose }: ToastProps) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const colors = { success: 'border-accent2', error: 'border-danger', info: 'border-info' };
  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
        className={`fixed bottom-6 right-6 z-50 glass-card px-6 py-4 border-l-4 ${colors[type]} max-w-sm`}>
        <p className="text-sm font-dm">{message}</p>
      </motion.div>
    </AnimatePresence>
  );
}
