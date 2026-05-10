'use client';
export default function SaarthiTyping() {
  return (
    <div className="flex justify-start">
      <div className="bg-surface px-5 py-3 rounded-2xl rounded-bl-sm">
        <div className="flex gap-1.5">
          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}
