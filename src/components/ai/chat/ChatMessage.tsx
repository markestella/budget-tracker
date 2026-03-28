'use client';

import { cn } from '@/lib/utils';

interface ChatMessageProps {
  role: 'USER' | 'ASSISTANT';
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === 'USER';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          isUser
            ? 'bg-violet-600 text-white dark:bg-violet-500'
            : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
        )}
      >
        <div className="whitespace-pre-wrap break-words">{content}</div>
      </div>
    </div>
  );
}
