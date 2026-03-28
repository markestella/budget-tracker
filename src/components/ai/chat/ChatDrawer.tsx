'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import {
  useConversationsQuery,
  useConversationDetailQuery,
  useSendMessageMutation,
  useDeleteConversationMutation,
} from '@/hooks/api/useAIChatHooks';

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function ChatDrawer({ open, onClose }: ChatDrawerProps) {
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: conversations } = useConversationsQuery();
  const { data: detail } = useConversationDetailQuery(activeConvoId);
  const sendMut = useSendMessageMutation();
  const deleteMut = useDeleteConversationMutation();

  const messages = detail?.conversation?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  function handleSend(message: string) {
    sendMut.mutate(
      { message, conversationId: activeConvoId ?? undefined },
      {
        onSuccess: (data) => {
          if (!activeConvoId) setActiveConvoId(data.conversationId);
        },
        onError: () => toast.error('Failed to send message'),
      },
    );
  }

  function handleDelete(id: string) {
    deleteMut.mutate(id, {
      onSuccess: () => {
        if (activeConvoId === id) setActiveConvoId(null);
        toast.success('Conversation deleted');
      },
    });
  }

  function handleNewChat() {
    setActiveConvoId(null);
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-950"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">MoneyQuest AI</h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleNewChat}
                  className="rounded-lg p-2 text-xs font-medium text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/30"
                >
                  + New
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Conversation list (collapsed sidebar) */}
            {!activeConvoId && conversations?.conversations && conversations.conversations.length > 0 && (
              <div className="border-b border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto">
                {conversations.conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <button
                      onClick={() => setActiveConvoId(conv.id)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-medium text-slate-900 truncate dark:text-white">{conv.title}</p>
                      <p className="text-xs text-slate-400">{conv.messageCount} messages</p>
                    </button>
                    <button
                      onClick={() => handleDelete(conv.id)}
                      className="shrink-0 rounded p-1 text-slate-400 hover:text-red-500"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Back button when inside conversation */}
            {activeConvoId && (
              <button
                onClick={handleNewChat}
                className="flex items-center gap-1 border-b border-slate-200 px-4 py-2 text-xs text-violet-600 hover:bg-violet-50 dark:border-slate-700 dark:text-violet-400 dark:hover:bg-violet-950/30"
              >
                ← Back to conversations
              </button>
            )}

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && !activeConvoId && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="text-4xl mb-3">🤖</span>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">MoneyQuest AI Assistant</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[240px]">
                    Ask about your spending habits, budget advice, or financial goals
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <ChatMessage key={msg.id} role={msg.role} content={msg.content} />
              ))}
              {sendMut.isPending && (
                <div className="flex justify-start">
                  <div className={cn(
                    'rounded-2xl px-4 py-3 text-sm bg-slate-100 dark:bg-slate-800',
                  )}>
                    <div className="flex items-center gap-1">
                      <span className="animate-bounce">·</span>
                      <span className="animate-bounce" style={{ animationDelay: '150ms' }}>·</span>
                      <span className="animate-bounce" style={{ animationDelay: '300ms' }}>·</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <ChatInput onSend={handleSend} disabled={sendMut.isPending} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
