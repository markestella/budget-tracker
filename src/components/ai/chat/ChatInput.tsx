'use client';

import { useState, FormEvent } from 'react';
import Button from '@/components/ui/Button';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-2 p-3 border-t border-slate-200 dark:border-slate-700">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        placeholder="Ask MoneyQuest AI anything..."
        rows={1}
        disabled={disabled}
        className="flex-1 resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:focus:border-violet-500"
      />
      <Button type="submit" size="sm" disabled={disabled || !text.trim()}>
        Send
      </Button>
    </form>
  );
}
