import { QUIZ_QUESTIONS, PERSONALITY_ORDER, type PersonalityType } from './quizData';

export interface QuizAnswer {
  questionId: number;
  selectedOptionIndex: number;
}

export interface QuizScoreResult {
  personality: PersonalityType;
  scores: Record<PersonalityType, number>;
}

export function scoreQuiz(answers: QuizAnswer[]): QuizScoreResult {
  const scores: Record<PersonalityType, number> = {
    HUNTER: 0,
    GUARDIAN: 0,
    STRATEGIST: 0,
    FREE_SPIRIT: 0,
    BUILDER: 0,
  };

  for (const answer of answers) {
    const question = QUIZ_QUESTIONS.find((q) => q.id === answer.questionId);
    if (!question) continue;

    const option = question.options[answer.selectedOptionIndex];
    if (!option) continue;

    for (const [type, points] of Object.entries(option.points)) {
      scores[type as PersonalityType] += points;
    }
  }

  // Resolve ties by selecting the type listed first in PERSONALITY_ORDER
  let topScore = -1;
  let topType: PersonalityType = 'BUILDER';

  for (const type of PERSONALITY_ORDER) {
    if (scores[type] > topScore) {
      topScore = scores[type];
      topType = type;
    }
  }

  return { personality: topType, scores };
}
