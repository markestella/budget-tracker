export type PersonalityType = 'HUNTER' | 'GUARDIAN' | 'STRATEGIST' | 'FREE_SPIRIT' | 'BUILDER';

export interface PersonalityDefinition {
  type: PersonalityType;
  name: string;
  emoji: string;
  description: string;
  strengths: string[];
  watchOutFor: string[];
  recommendedQuests: string[];
}

export const PERSONALITY_DEFINITIONS: Record<PersonalityType, PersonalityDefinition> = {
  HUNTER: {
    type: 'HUNTER',
    name: 'The Hunter',
    emoji: '🦁',
    description: 'You\'re an aggressive saver with laser focus on your financial goals. You see money as a tool to conquer milestones and aren\'t afraid to make bold financial moves.',
    strengths: [
      'Highly goal-oriented and motivated',
      'Willing to make sacrifices for big wins',
      'Decisive with financial choices',
      'Excellent at tracking progress',
    ],
    watchOutFor: [
      'Burnout from being too aggressive',
      'Missing out on enjoying the present',
      'Being too rigid with your budget',
      'Neglecting small pleasures entirely',
    ],
    recommendedQuests: ['Savings Sprint', 'Investment Explorer', 'Goal Crusher'],
  },
  GUARDIAN: {
    type: 'GUARDIAN',
    name: 'The Guardian',
    emoji: '🐢',
    description: 'Security is your priority. You build strong financial defenses with emergency funds and conservative strategies. Slow and steady wins your race.',
    strengths: [
      'Excellent at building emergency funds',
      'Naturally risk-aware',
      'Consistent and reliable with payments',
      'Great at maintaining financial stability',
    ],
    watchOutFor: [
      'Being overly conservative with investments',
      'Missing growth opportunities',
      'Hoarding money out of fear',
      'Avoiding necessary financial risks',
    ],
    recommendedQuests: ['Emergency Fund Builder', 'Budget Master', 'Safety Net Challenge'],
  },
  STRATEGIST: {
    type: 'STRATEGIST',
    name: 'The Strategist',
    emoji: '🦊',
    description: 'You love data, analysis, and optimization. Every peso has a purpose, and you\'re always looking for the most efficient use of your money.',
    strengths: [
      'Data-driven decision making',
      'Excellent at finding deals and optimizing',
      'Thorough financial planning',
      'Great at comparing options before spending',
    ],
    watchOutFor: [
      'Analysis paralysis — overthinking decisions',
      'Spending too much time optimizing small amounts',
      'Missing the emotional side of money',
      'Being inflexible when plans change',
    ],
    recommendedQuests: ['Budget Optimizer', 'Expense Tracker Pro', 'Category Challenge'],
  },
  FREE_SPIRIT: {
    type: 'FREE_SPIRIT',
    name: 'The Free Spirit',
    emoji: '🦋',
    description: 'You live in the moment and value experiences over spreadsheets. Money is meant to be enjoyed, but you could benefit from a bit more structure.',
    strengths: [
      'Generous and enjoy sharing with others',
      'Great at enjoying life experiences',
      'Flexible and adaptable',
      'Good at finding joy in the present',
    ],
    watchOutFor: [
      'Impulse purchases you later regret',
      'Ignoring budgets and financial goals',
      'Living paycheck to paycheck',
      'Avoiding financial planning altogether',
    ],
    recommendedQuests: ['No-Spend Day', 'Impulse Control', 'Budget Basics'],
  },
  BUILDER: {
    type: 'BUILDER',
    name: 'The Builder',
    emoji: '🐝',
    description: 'You\'re all about consistency and long-term growth. Like a busy bee, you build wealth steadily through daily habits and patient discipline.',
    strengths: [
      'Excellent at forming financial habits',
      'Patient with long-term goals',
      'Consistent saving behavior',
      'Good at routine-based budgeting',
    ],
    watchOutFor: [
      'Sticking too long to outdated strategies',
      'Missing opportunities for faster growth',
      'Being too routine and missing new approaches',
      'Not celebrating financial wins enough',
    ],
    recommendedQuests: ['Daily Tracker', 'Streak Master', 'Habit Builder'],
  },
};

export interface QuizOption {
  label: string;
  points: Partial<Record<PersonalityType, number>>;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: QuizOption[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    text: 'You receive an unexpected ₱10,000. What do you do first?',
    options: [
      { label: 'Put it all straight into savings', points: { HUNTER: 3, GUARDIAN: 1 } },
      { label: 'Add it to my emergency fund', points: { GUARDIAN: 3, BUILDER: 1 } },
      { label: 'Research the best investment option', points: { STRATEGIST: 3, HUNTER: 1 } },
      { label: 'Treat myself — I deserve it!', points: { FREE_SPIRIT: 3 } },
      { label: 'Add a little to each of my goals', points: { BUILDER: 3, STRATEGIST: 1 } },
    ],
  },
  {
    id: 2,
    text: 'How do you feel about checking your bank balance?',
    options: [
      { label: 'I check multiple times a day — knowledge is power', points: { STRATEGIST: 3, HUNTER: 1 } },
      { label: 'Daily check, it keeps me grounded', points: { BUILDER: 3, GUARDIAN: 1 } },
      { label: 'Weekly is enough for me', points: { GUARDIAN: 3 } },
      { label: 'Honestly, I avoid looking', points: { FREE_SPIRIT: 3 } },
      { label: 'Only when I need to make a big purchase', points: { FREE_SPIRIT: 1, HUNTER: 2 } },
    ],
  },
  {
    id: 3,
    text: 'Your friend invites you to an unplanned weekend trip. What\'s your reaction?',
    options: [
      { label: 'Can\'t — not in my budget this month', points: { HUNTER: 2, GUARDIAN: 2 } },
      { label: 'Let me check my fun money allocation first', points: { STRATEGIST: 3, BUILDER: 1 } },
      { label: 'I\'ll make it work — experiences matter!', points: { FREE_SPIRIT: 3 } },
      { label: 'Sure, but I\'ll find the cheapest options', points: { STRATEGIST: 2, BUILDER: 1 } },
      { label: 'Only if I can move money from next month\'s budget', points: { GUARDIAN: 2, BUILDER: 1 } },
    ],
  },
  {
    id: 4,
    text: 'What motivates you most about saving money?',
    options: [
      { label: 'Hitting my savings target numbers', points: { HUNTER: 3 } },
      { label: 'Knowing I\'m prepared for emergencies', points: { GUARDIAN: 3 } },
      { label: 'Seeing my net worth grow over time', points: { BUILDER: 3, STRATEGIST: 1 } },
      { label: 'Being able to afford big experiences', points: { FREE_SPIRIT: 3, HUNTER: 1 } },
      { label: 'Optimizing my savings rate percentage', points: { STRATEGIST: 3 } },
    ],
  },
  {
    id: 5,
    text: 'How do you handle a budget category that\'s over limit?',
    options: [
      { label: 'Cut spending immediately — no exceptions', points: { HUNTER: 3, GUARDIAN: 1 } },
      { label: 'Analyze where the overspend happened', points: { STRATEGIST: 3 } },
      { label: 'Borrow from another category', points: { BUILDER: 2, STRATEGIST: 1 } },
      { label: 'It happens — I\'ll do better next month', points: { FREE_SPIRIT: 3 } },
      { label: 'Adjust my budget to be more realistic', points: { BUILDER: 3 } },
    ],
  },
  {
    id: 6,
    text: 'What\'s your ideal way to track expenses?',
    options: [
      { label: 'Detailed spreadsheet with formulas and charts', points: { STRATEGIST: 3 } },
      { label: 'An app that does it automatically', points: { BUILDER: 2, FREE_SPIRIT: 1 } },
      { label: 'I track every single peso manually', points: { HUNTER: 2, STRATEGIST: 1 } },
      { label: 'Round numbers are fine, no need for exact amounts', points: { FREE_SPIRIT: 3 } },
      { label: 'Simple categories — I just need the big picture', points: { GUARDIAN: 2, BUILDER: 2 } },
    ],
  },
  {
    id: 7,
    text: 'You see a sale on something you\'ve been eyeing. It\'s 50% off!',
    options: [
      { label: 'Buy it — deals like this don\'t come often', points: { FREE_SPIRIT: 3, HUNTER: 1 } },
      { label: 'Check if it\'s in my budget first', points: { GUARDIAN: 3, BUILDER: 1 } },
      { label: 'Compare prices across other stores', points: { STRATEGIST: 3 } },
      { label: 'Add it to my wishlist and save up for it', points: { BUILDER: 3, GUARDIAN: 1 } },
      { label: 'Skip it — I don\'t need it right now', points: { HUNTER: 3 } },
    ],
  },
  {
    id: 8,
    text: 'What does financial freedom mean to you?',
    options: [
      { label: 'Having enough to never worry about money', points: { GUARDIAN: 3, BUILDER: 1 } },
      { label: 'Being able to do whatever I want, whenever', points: { FREE_SPIRIT: 3, HUNTER: 1 } },
      { label: 'Reaching my FIRE number early', points: { HUNTER: 3, STRATEGIST: 1 } },
      { label: 'Having diversified income streams', points: { STRATEGIST: 3, BUILDER: 1 } },
      { label: 'Steady growth that compounds over decades', points: { BUILDER: 3 } },
    ],
  },
  {
    id: 9,
    text: 'How do you approach a big purchase (₱50,000+)?',
    options: [
      { label: 'Create a dedicated savings plan with a deadline', points: { HUNTER: 3, BUILDER: 1 } },
      { label: 'Research extensively, read every review', points: { STRATEGIST: 3 } },
      { label: 'Wait until I have double the amount saved', points: { GUARDIAN: 3 } },
      { label: 'If I want it and can afford it, I buy it', points: { FREE_SPIRIT: 3 } },
      { label: 'Save a little each month until I get there', points: { BUILDER: 3, GUARDIAN: 1 } },
    ],
  },
  {
    id: 10,
    text: 'What\'s your biggest financial regret?',
    options: [
      { label: 'Not starting to save/invest sooner', points: { HUNTER: 2, BUILDER: 2 } },
      { label: 'An impulse purchase I didn\'t need', points: { FREE_SPIRIT: 3 } },
      { label: 'Not having enough emergency savings when I needed it', points: { GUARDIAN: 3, BUILDER: 1 } },
      { label: 'Missing a good investment opportunity', points: { STRATEGIST: 3, HUNTER: 1 } },
      { label: 'Being too strict and not enjoying my money', points: { HUNTER: 1, GUARDIAN: 2 } },
    ],
  },
];

export const PERSONALITY_ORDER: PersonalityType[] = ['HUNTER', 'GUARDIAN', 'STRATEGIST', 'FREE_SPIRIT', 'BUILDER'];
