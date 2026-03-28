'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { PersonalityDefinition } from '@/lib/game/personality/quizData';

interface QuizResultProps {
  personality: PersonalityDefinition;
  scores: Record<string, number> | null;
  xpAwarded: number;
  onContinue: () => void;
  onRetake?: () => void;
}

export default function QuizResult({ personality, scores, xpAwarded, onContinue, onRetake }: QuizResultProps) {
  const maxScore = scores ? Math.max(...Object.values(scores)) : 0;

  return (
    <div className="max-w-2xl mx-auto text-center">
      {/* Personality reveal */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
        className="text-8xl mb-4"
      >
        {personality.emoji}
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-3xl font-bold text-gray-900 dark:text-white mb-2"
      >
        You are {personality.name}!
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg mx-auto"
      >
        {personality.description}
      </motion.p>

      {xpAwarded > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          className="inline-block bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 px-4 py-2 rounded-full font-medium mb-8"
        >
          +{xpAwarded} XP earned! ⭐
        </motion.div>
      )}

      {/* Score breakdown — only shown after fresh quiz completion */}
      {scores && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mb-8"
        >
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
            Your Score Breakdown
          </h3>
          <div className="space-y-3 max-w-md mx-auto">
            {Object.entries(scores)
              .sort(([, a], [, b]) => b - a)
              .map(([type, score], idx) => (
                <div key={type} className="flex items-center gap-3">
                  <span className="text-sm w-28 text-left text-gray-600 dark:text-gray-400">
                    {type.replace('_', ' ')}
                  </span>
                  <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${idx === 0 ? 'bg-indigo-500' : 'bg-gray-400 dark:bg-gray-500'}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%` }}
                      transition={{ delay: 1.2 + idx * 0.1, duration: 0.5 }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right text-gray-700 dark:text-gray-300">
                    {score}
                  </span>
                </div>
              ))}
          </div>
        </motion.div>
      )}

      {/* Strengths & Watch-outs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 text-left"
      >
        <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">💪 Your Strengths</h3>
          <ul className="space-y-2">
            {personality.strengths.map((s, i) => (
              <li key={i} className="text-sm text-green-700 dark:text-green-400 flex items-start gap-2">
                <span className="mt-1">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-5">
          <h3 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">⚠️ Watch Out For</h3>
          <ul className="space-y-2">
            {personality.watchOutFor.map((w, i) => (
              <li key={i} className="text-sm text-amber-700 dark:text-amber-400 flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Recommended quests */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="mb-8"
      >
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Recommended Quests
        </h3>
        <div className="flex flex-wrap justify-center gap-2">
          {personality.recommendedQuests.map((quest) => (
            <span
              key={quest}
              className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm"
            >
              🎯 {quest}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: scores ? 2 : 1.5 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        <button
          onClick={onContinue}
          className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition-colors"
        >
          Continue to Dashboard →
        </button>
        {onRetake && (
          <button
            onClick={onRetake}
            className="px-8 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium rounded-xl transition-colors"
          >
            🔄 Retake Quiz
          </button>
        )}
      </motion.div>
    </div>
  );
}
