import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'NEEV — AI-Powered Engineering Growth Ecosystem',
  description: 'Your intelligent engineering growth companion. Track academics, build skills, prepare for placements, and get AI mentorship from Semester 1 to 6.',
  keywords: ['NEEV', 'engineering', 'student', 'AI mentor', 'placement', 'academic tracker'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-bg text-white font-dm antialiased">
        {children}
      </body>
    </html>
  );
}
