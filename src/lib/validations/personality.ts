import { z } from 'zod';

export const quizAnswerSchema = z.object({
  questionId: z.number().int().min(1).max(10),
  selectedOptionIndex: z.number().int().min(0).max(4),
});

export const quizSubmissionSchema = z.object({
  answers: z.array(quizAnswerSchema).length(10),
});

export type QuizSubmission = z.infer<typeof quizSubmissionSchema>;
