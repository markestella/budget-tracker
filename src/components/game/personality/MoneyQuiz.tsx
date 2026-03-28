'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUIZ_QUESTIONS, type QuizQuestion } from '@/lib/game/personality/quizData';
import type { QuizAnswer } from '@/lib/game/personality/quizScorer';
import type { PersonalityDefinition } from '@/lib/game/personality/quizData';

interface MoneyQuizProps {
  onComplete: (result: { personality: PersonalityDefinition; scores: Record<string, number>; xpAwarded: number }) => void;
  isSubmitting?: boolean;
}

export default function MoneyQuiz({ onComplete, isSubmitting }: MoneyQuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [direction, setDirection] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const question: QuizQuestion = QUIZ_QUESTIONS[currentIndex];
  const progress = ((currentIndex) / QUIZ_QUESTIONS.length) * 100;

  const handleSelect = async (optionIndex: number) => {
    const newAnswers = [...answers, { questionId: question.id, selectedOptionIndex: optionIndex }];
    setAnswers(newAnswers);

    if (currentIndex < QUIZ_QUESTIONS.length - 1) {
      setDirection(1);
      setCurrentIndex(currentIndex + 1);
    } else {
      // Submit quiz
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch('/api/game/personality/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers }),
        });
        if (!res.ok) {
          const errBody = await res.json().catch(() => ({}));
          throw new Error(errBody.error || `Request failed (${res.status})`);
        }
        const data = await res.json();
        onComplete(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to submit quiz. Please try again.');
        setAnswers([]);
        setCurrentIndex(0);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setAnswers(answers.slice(0, -1));
      setCurrentIndex(currentIndex - 1);
    }
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 300 : -300, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -300 : 300, opacity: 0 }),
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
          {error}
        </div>
      )}

      {/* Submitting state */}
      {submitting ? (
        <div className="text-center py-16">
          <div className="text-4xl mb-4 animate-pulse">🔮</div>
          <p className="text-gray-600 dark:text-gray-300">Analyzing your personality...</p>
        </div>
      ) : (
        <>
          {/* Progress bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
              <span>Question {currentIndex + 1} of {QUIZ_QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-indigo-500 rounded-full"
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Question */}
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={question.id}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                {question.text}
              </h2>

              <div className="space-y-3">
                {question.options.map((option, idx) => (
                  <motion.button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isSubmitting || submitting}
                    className="w-full text-left p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 
                      hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/30
                      transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed
                      bg-white dark:bg-gray-800"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <span className="text-gray-800 dark:text-gray-200">{option.label}</span>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Back button */}
          {currentIndex > 0 && (
            <motion.button
              onClick={handleBack}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              ← Previous question
            </motion.button>
          )}
        </>
      )}
    </div>
  );
}
