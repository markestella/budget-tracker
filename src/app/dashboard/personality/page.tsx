'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import MoneyQuiz from '@/components/game/personality/MoneyQuiz';
import QuizResult from '@/components/game/personality/QuizResult';
import type { PersonalityDefinition } from '@/lib/game/personality/quizData';

interface QuizResultData {
  personality: PersonalityDefinition;
  scores: Record<string, number> | null;
  xpAwarded: number;
}

export default function PersonalityQuizPage() {
  const router = useRouter();
  const [result, setResult] = useState<QuizResultData | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch existing personality result on mount
  useEffect(() => {
    async function fetchExistingResult() {
      try {
        const res = await fetch('/api/game/personality/result');
        if (res.ok) {
          const data = await res.json();
          if (data.personality) {
            setResult({ personality: data.personality, scores: null, xpAwarded: 0 });
          }
        }
      } catch {
        // No stored result — show quiz
      } finally {
        setLoading(false);
      }
    }
    fetchExistingResult();
  }, []);

  function handleQuizComplete(data: QuizResultData) {
    setResult(data);
    setShowQuiz(false);
  }

  function handleRetake() {
    setResult(null);
    setShowQuiz(true);
  }

  // Show quiz: no existing result OR user tapped retake
  const shouldShowQuiz = showQuiz || (!loading && !result);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.12),_transparent_26%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.10),_transparent_22%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="h-16 w-16 animate-pulse rounded-full bg-amber-200 dark:bg-amber-900/40" />
              <p className="text-sm text-slate-500">Loading your personality...</p>
            </div>
          ) : shouldShowQuiz ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  💰 Money Personality Quiz
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                  Discover your financial personality in 10 quick questions
                </p>
              </div>
              <MoneyQuiz onComplete={handleQuizComplete} />
            </motion.div>
          ) : result ? (
            <QuizResult
              personality={result.personality}
              scores={result.scores}
              xpAwarded={result.xpAwarded}
              onContinue={() => router.push('/dashboard')}
              onRetake={handleRetake}
            />
          ) : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
