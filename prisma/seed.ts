import { PrismaClient } from '@prisma/client';
import bcryptjs from 'bcryptjs';

const prisma = new PrismaClient();

// ─── Helpers ────────────────────────────────────────────
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

function randomDate(daysBack: number): Date {
  return daysAgo(Math.floor(Math.random() * daysBack));
}

const CATEGORIES = [
  'HOUSING', 'TRANSPORTATION', 'FOOD_DINING', 'UTILITIES',
  'ENTERTAINMENT', 'HEALTHCARE', 'SAVINGS_ALLOCATION', 'DEBT_PAYMENTS', 'MISCELLANEOUS',
] as const;

const MERCHANTS: Record<string, string[]> = {
  HOUSING: ['Landlord', 'Condo Association', 'PLDT Home DSL'],
  TRANSPORTATION: ['Grab', 'LRT/MRT', 'Shell Gas Station', 'Jollibee Drive-thru Toll'],
  FOOD_DINING: ['Jollibee', 'SM Supermarket', 'Puregold', 'Mercury Drug Store', 'Starbucks', '7-Eleven'],
  UTILITIES: ['Meralco', 'Manila Water', 'Globe Telecom', 'PLDT'],
  ENTERTAINMENT: ['Netflix', 'Spotify', 'SM Cinema', 'National Bookstore'],
  HEALTHCARE: ['Mercury Drug', 'Healthway Clinic', 'Watsons Pharmacy'],
  SAVINGS_ALLOCATION: ['BPI Savings', 'BDO Transfer'],
  DEBT_PAYMENTS: ['BPI Credit Card', 'Home Credit'],
  MISCELLANEOUS: ['Shopee', 'Lazada', 'Uniqlo', 'Miniso'],
};

async function main() {
  console.log('🌱 Seeding database...');

  // ─── Clean existing seed data (idempotent) ──────────
  const seedEmails = ['maria@example.com', 'juan@example.com', 'ana@example.com'];
  await prisma.user.deleteMany({ where: { email: { in: seedEmails } } });

  // ─── 1. Create Users ──────────────────────────────────
  const passwordHash = await bcryptjs.hash('password123', 10);

  const maria = await prisma.user.create({
    data: {
      email: 'maria@example.com',
      name: 'Maria Santos',
      password: passwordHash,
      preferredCurrency: 'PHP',
    },
  });

  const juan = await prisma.user.create({
    data: {
      email: 'juan@example.com',
      name: 'Juan Dela Cruz',
      password: passwordHash,
      preferredCurrency: 'PHP',
    },
  });

  const ana = await prisma.user.create({
    data: {
      email: 'ana@example.com',
      name: 'Ana Reyes',
      password: passwordHash,
      preferredCurrency: 'PHP',
    },
  });

  console.log('✅ Created 3 users');

  // ─── 2. Financial Accounts ──────────────────────────
  const mariaSavings = await prisma.financialAccount.create({
    data: {
      userId: maria.id,
      accountType: 'SAVINGS',
      bankName: 'BPI',
      accountName: 'BPI Savings',
      currentBalance: 125000,
      interestRate: 0.005,
    },
  });

  const mariaChecking = await prisma.financialAccount.create({
    data: {
      userId: maria.id,
      accountType: 'CHECKING',
      bankName: 'BDO',
      accountName: 'BDO Checking',
      currentBalance: 45000,
    },
  });

  await prisma.financialAccount.create({
    data: {
      userId: maria.id,
      accountType: 'CREDIT_CARD',
      bankName: 'BPI',
      accountName: 'BPI Credit Card',
      currentBalance: -15000,
      creditLimit: 100000,
      cutoffDate: 15,
    },
  });

  await prisma.financialAccount.create({
    data: {
      userId: maria.id,
      accountType: 'SAVINGS',
      bankName: 'CIMB',
      accountName: 'CIMB GSave',
      currentBalance: 50000,
      interestRate: 0.025,
    },
  });

  console.log('✅ Created 4 financial accounts');

  // ─── 3. Income Sources & Records ────────────────────
  const mariaSalary = await prisma.incomeSource.create({
    data: {
      userId: maria.id,
      name: 'Software Developer Salary',
      category: 'SALARY',
      frequency: 'MONTHLY',
      amount: 65000,
      scheduleDays: [15, 30],
      isActive: true,
    },
  });

  const mariaFreelance = await prisma.incomeSource.create({
    data: {
      userId: maria.id,
      name: 'Freelance Web Dev',
      category: 'FREELANCE',
      frequency: 'MONTHLY',
      amount: 15000,
      isActive: true,
    },
  });

  // 6 months of income records
  for (let month = 0; month < 6; month++) {
    const date = new Date();
    date.setMonth(date.getMonth() - month);

    await prisma.incomeRecord.create({
      data: {
        userId: maria.id,
        incomeSourceId: mariaSalary.id,
        expectedDate: new Date(date.getFullYear(), date.getMonth(), 15),
        actualAmount: 65000,
        actualDate: new Date(date.getFullYear(), date.getMonth(), 15),
        status: 'RECEIVED',
      },
    });

    await prisma.incomeRecord.create({
      data: {
        userId: maria.id,
        incomeSourceId: mariaFreelance.id,
        expectedDate: new Date(date.getFullYear(), date.getMonth(), 28),
        actualAmount: randomBetween(10000, 25000),
        actualDate: new Date(date.getFullYear(), date.getMonth(), 28),
        status: month === 0 ? 'PENDING' : 'RECEIVED',
      },
    });
  }

  console.log('✅ Created income sources & 12 income records');

  // ─── 4. Budget & Budget Items ──────────────────────
  const now = new Date();
  await prisma.budget.create({
    data: {
      userId: maria.id,
      name: 'Monthly Budget',
      totalAmount: 55000,
      startDate: new Date(now.getFullYear(), now.getMonth(), 1),
      endDate: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    },
  });

  const budgetItems = [
    { description: 'Rent', amount: 12000, category: 'HOUSING' as const, dueDate: 1, type: 'CONSTANT' as const },
    { description: 'Electricity', amount: 3500, category: 'UTILITIES' as const, dueDate: 15, type: 'CONSTANT' as const },
    { description: 'Water', amount: 800, category: 'UTILITIES' as const, dueDate: 20, type: 'CONSTANT' as const },
    { description: 'Internet', amount: 1699, category: 'UTILITIES' as const, dueDate: 5, type: 'CONSTANT' as const },
    { description: 'Groceries', amount: 8000, category: 'FOOD_DINING' as const, dueDate: 1, type: 'CONSTANT' as const },
    { description: 'Dining Out', amount: 4000, category: 'FOOD_DINING' as const, dueDate: 1, type: 'CONSTANT' as const },
    { description: 'Grab/Transport', amount: 3000, category: 'TRANSPORTATION' as const, dueDate: 1, type: 'CONSTANT' as const },
    { description: 'Netflix', amount: 549, category: 'ENTERTAINMENT' as const, dueDate: 10, type: 'CONSTANT' as const },
    { description: 'Spotify', amount: 149, category: 'ENTERTAINMENT' as const, dueDate: 12, type: 'CONSTANT' as const },
    { description: 'Gym Membership', amount: 2500, category: 'HEALTHCARE' as const, dueDate: 1, type: 'CONSTANT' as const },
    { description: 'Phone Plan', amount: 999, category: 'UTILITIES' as const, dueDate: 8, type: 'CONSTANT' as const },
    { description: 'Emergency Fund', amount: 5000, category: 'SAVINGS_ALLOCATION' as const, dueDate: 15, type: 'CONSTANT' as const },
    { description: 'Credit Card Payment', amount: 5000, category: 'DEBT_PAYMENTS' as const, dueDate: 25, type: 'CONSTANT' as const },
    { description: 'Laptop Installment', amount: 2500, category: 'DEBT_PAYMENTS' as const, dueDate: 20, type: 'DURATION' as const, totalMonths: 12, startDate: daysAgo(120), completedPayments: 4 },
    { description: 'Miscellaneous', amount: 3000, category: 'MISCELLANEOUS' as const, dueDate: 1, type: 'CONSTANT' as const },
  ];

  for (const item of budgetItems) {
    await prisma.budgetItem.create({
      data: {
        userId: maria.id,
        ...item,
        linkedAccountId: item.category === 'SAVINGS_ALLOCATION' ? mariaSavings.id : mariaChecking.id,
      },
    });
  }

  console.log('✅ Created 1 budget & 15 budget items');

  // ─── 5. Category Budgets ────────────────────────────
  const categoryLimits = [
    { category: 'HOUSING' as const, monthlyLimit: 12000 },
    { category: 'UTILITIES' as const, monthlyLimit: 7000 },
    { category: 'FOOD_DINING' as const, monthlyLimit: 12000 },
    { category: 'TRANSPORTATION' as const, monthlyLimit: 3000 },
    { category: 'ENTERTAINMENT' as const, monthlyLimit: 3000 },
    { category: 'HEALTHCARE' as const, monthlyLimit: 3000 },
    { category: 'DEBT_PAYMENTS' as const, monthlyLimit: 7500 },
    { category: 'MISCELLANEOUS' as const, monthlyLimit: 5000 },
  ];

  for (const cl of categoryLimits) {
    await prisma.categoryBudget.create({
      data: { userId: maria.id, ...cl },
    });
  }

  console.log('✅ Created 8 category budgets');

  // ─── 6. Expenses (100+ across 6 months) ──────────
  const expenses: Array<{
    amount: number;
    category: typeof CATEGORIES[number];
    merchant: string;
    date: Date;
    notes?: string;
    linkedAccountId?: string;
  }> = [];

  for (let month = 0; month < 6; month++) {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - month);

    // Monthly fixed expenses
    expenses.push(
      { amount: 12000, category: 'HOUSING', merchant: 'Landlord', date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 1), linkedAccountId: mariaChecking.id },
      { amount: randomBetween(2800, 4200), category: 'UTILITIES', merchant: 'Meralco', date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 15), linkedAccountId: mariaChecking.id },
      { amount: randomBetween(600, 1000), category: 'UTILITIES', merchant: 'Manila Water', date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 20) },
      { amount: 1699, category: 'UTILITIES', merchant: 'PLDT', date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 5) },
      { amount: 549, category: 'ENTERTAINMENT', merchant: 'Netflix', date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 10) },
      { amount: 149, category: 'ENTERTAINMENT', merchant: 'Spotify', date: new Date(baseDate.getFullYear(), baseDate.getMonth(), 12) },
    );

    // Variable expenses (10-15 per month)
    const varCount = Math.floor(Math.random() * 6) + 10;
    for (let i = 0; i < varCount; i++) {
      const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
      const merchants = MERCHANTS[cat] ?? ['Unknown'];
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];

      const amounts: Record<string, [number, number]> = {
        FOOD_DINING: [80, 1500],
        TRANSPORTATION: [50, 500],
        ENTERTAINMENT: [100, 2000],
        HEALTHCARE: [200, 3000],
        MISCELLANEOUS: [100, 3000],
      };
      const [min, max] = amounts[cat] ?? [100, 2000];

      expenses.push({
        amount: randomBetween(min, max),
        category: cat,
        merchant,
        date: new Date(baseDate.getFullYear(), baseDate.getMonth(), Math.floor(Math.random() * 28) + 1),
      });
    }
  }

  for (const exp of expenses) {
    await prisma.expense.create({
      data: {
        userId: maria.id,
        amount: exp.amount,
        category: exp.category,
        merchant: exp.merchant,
        date: exp.date,
        notes: exp.notes ?? null,
        linkedAccountId: exp.linkedAccountId ?? null,
      },
    });
  }

  console.log(`✅ Created ${expenses.length} expenses`);

  // ─── 7. Savings Goals & Transactions ───────────────
  const emergencyFund = await prisma.savingsGoal.create({
    data: {
      userId: maria.id,
      name: 'Emergency Fund',
      institution: 'BPI',
      type: 'EMERGENCY_FUND',
      monthlyContribution: 5000,
      currentBalance: 85000,
      targetAmount: 200000,
      interestRate: 0.005,
      startDate: daysAgo(180),
      lastUpdatedBalance: new Date(),
      status: 'ACTIVE',
    },
  });

  const vacationFund = await prisma.savingsGoal.create({
    data: {
      userId: maria.id,
      name: 'Japan Trip 2027',
      institution: 'CIMB',
      type: 'VACATION',
      monthlyContribution: 3000,
      currentBalance: 25000,
      targetAmount: 80000,
      startDate: daysAgo(120),
      lastUpdatedBalance: new Date(),
      status: 'ACTIVE',
    },
  });

  const investmentFund = await prisma.savingsGoal.create({
    data: {
      userId: maria.id,
      name: 'Stock Portfolio',
      institution: 'COL Financial',
      type: 'INVESTMENT',
      monthlyContribution: 5000,
      currentBalance: 45000,
      startDate: daysAgo(200),
      lastUpdatedBalance: new Date(),
      status: 'ACTIVE',
    },
  });

  // Savings transactions
  for (let month = 0; month < 6; month++) {
    const date = daysAgo(month * 30 + 15);
    await prisma.savingsTransaction.create({
      data: { userId: maria.id, savingsGoalId: emergencyFund.id, amount: 5000, type: 'DEPOSIT', date },
    });
    await prisma.savingsTransaction.create({
      data: { userId: maria.id, savingsGoalId: vacationFund.id, amount: 3000, type: 'DEPOSIT', date },
    });
    await prisma.savingsTransaction.create({
      data: { userId: maria.id, savingsGoalId: investmentFund.id, amount: 5000, type: 'DEPOSIT', date },
    });
  }

  console.log('✅ Created 3 savings goals & 18 transactions');

  // ─── 8. Seed Badges (if not exists) ────────────────
  const { BADGE_DEFINITIONS } = await import('../src/lib/game/badges/badgeDefinitions');
  for (const badge of BADGE_DEFINITIONS) {
    await prisma.badge.upsert({
      where: { key: badge.key },
      create: {
        key: badge.key,
        name: badge.name,
        description: badge.description,
        icon: badge.icon,
        category: badge.category,
        tier: badge.tier,
        xpReward: badge.xpReward,
      },
      update: {},
    });
  }

  console.log(`✅ Seeded ${BADGE_DEFINITIONS.length} badges`);

  // ─── 9. Game Profiles ──────────────────────────────
  // Maria: Level 15, advanced player
  await prisma.gameProfile.create({
    data: {
      userId: maria.id,
      xp: 12500,
      level: 15,
      currentStreak: 30,
      longestStreak: 45,
      lastActiveDate: new Date(),
      totalBadges: 12,
      financialHealthScore: 78,
      moneyPersonality: 'STRATEGIST',
    },
  });

  // Juan: Level 5, beginner
  await prisma.gameProfile.create({
    data: {
      userId: juan.id,
      xp: 800,
      level: 5,
      currentStreak: 3,
      longestStreak: 7,
      lastActiveDate: daysAgo(1),
      totalBadges: 3,
      financialHealthScore: 45,
      moneyPersonality: 'FREE_SPIRIT',
    },
  });

  // Ana: Level 10, intermediate
  await prisma.gameProfile.create({
    data: {
      userId: ana.id,
      xp: 5200,
      level: 10,
      currentStreak: 14,
      longestStreak: 30,
      lastActiveDate: new Date(),
      totalBadges: 7,
      financialHealthScore: 65,
      moneyPersonality: 'GUARDIAN',
    },
  });

  console.log('✅ Created 3 game profiles');

  // ─── 10. User Badges ──────────────────────────────
  const allBadges = await prisma.badge.findMany();
  const badgeByKey = (key: string) => allBadges.find((b) => b.key === key);

  // Maria: 12 badges
  const mariaBadgeKeys = [
    'first_step', 'first_save', 'data_driven', 'account_keeper', 'getting_started',
    'habit_forming', 'twenty_entries', 'fifty_entries', 'on_fire', 'lightning',
    'safety_net', 'penny_pincher',
  ];

  for (const key of mariaBadgeKeys) {
    const badge = badgeByKey(key);
    if (badge) {
      await prisma.userBadge.create({
        data: {
          userId: maria.id,
          badgeId: badge.id,
          earnedAt: randomDate(90),
        },
      });
    }
  }

  // Juan: 3 badges
  for (const key of ['first_step', 'getting_started', 'habit_forming']) {
    const badge = badgeByKey(key);
    if (badge) {
      await prisma.userBadge.create({
        data: { userId: juan.id, badgeId: badge.id, earnedAt: randomDate(30) },
      });
    }
  }

  // Ana: 7 badges
  for (const key of ['first_step', 'first_save', 'data_driven', 'getting_started', 'on_fire', 'safety_net', 'penny_pincher']) {
    const badge = badgeByKey(key);
    if (badge) {
      await prisma.userBadge.create({
        data: { userId: ana.id, badgeId: badge.id, earnedAt: randomDate(60) },
      });
    }
  }

  console.log('✅ Created user badges (12 + 3 + 7)');

  // ─── 11. XP Transactions ──────────────────────────
  const xpActions = [
    'LOG_EXPENSE', 'UNDER_DAILY_BUDGET', 'COMPLETE_QUEST',
    'SAVINGS_MILESTONE', 'STREAK_7_DAYS', 'FIRST_SETUP',
  ];

  for (let i = 0; i < 30; i++) {
    const action = xpActions[Math.floor(Math.random() * xpActions.length)];
    const amounts: Record<string, number> = {
      LOG_EXPENSE: 5, UNDER_DAILY_BUDGET: 10, COMPLETE_QUEST: 200,
      SAVINGS_MILESTONE: 100, STREAK_7_DAYS: 75, FIRST_SETUP: 50,
    };
    await prisma.xPTransaction.create({
      data: {
        userId: maria.id,
        amount: amounts[action] ?? 5,
        action,
        description: `Earned XP for ${action}`,
        createdAt: randomDate(90),
      },
    });
  }

  console.log('✅ Created 30 XP transactions');

  // ─── 12. Health Score History ────────────────────
  for (let week = 0; week < 12; week++) {
    await prisma.healthScoreHistory.create({
      data: {
        userId: maria.id,
        score: Math.min(100, 55 + week * 2 + Math.floor(Math.random() * 5)),
        tier: week < 4 ? 'NEEDS_IMPROVEMENT' : week < 8 ? 'GOOD' : 'GREAT',
        budgetScore: randomBetween(60, 90),
        savingsScore: randomBetween(50, 85),
        emergencyScore: randomBetween(40, 80),
        debtScore: randomBetween(70, 95),
        consistencyScore: randomBetween(55, 90),
        calculatedAt: daysAgo(week * 7),
      },
    });
  }

  console.log('✅ Created 12 health score history records');

  // ─── 13. Wishlist Items ──────────────────────────
  await prisma.wishlistItem.createMany({
    data: [
      {
        userId: maria.id,
        name: 'MacBook Air M4',
        price: 79990,
        savedAmount: 45000,
        priority: 'HIGH',
        status: 'SAVING',
        imageUrl: null,
        productUrl: null,
      },
      {
        userId: maria.id,
        name: 'AirPods Pro 3',
        price: 16990,
        savedAmount: 16990,
        priority: 'HIGH',
        status: 'AFFORDABLE',
      },
      {
        userId: maria.id,
        name: 'Ergonomic Chair',
        price: 25000,
        savedAmount: 12500,
        priority: 'MEDIUM',
        status: 'SAVING',
      },
      {
        userId: maria.id,
        name: 'Mechanical Keyboard',
        price: 5500,
        savedAmount: 5500,
        priority: 'LOW',
        status: 'PURCHASED',
      },
      {
        userId: maria.id,
        name: 'Camping Gear Set',
        price: 8000,
        savedAmount: 2000,
        priority: 'LOW',
        status: 'SAVING',
      },
    ],
  });

  console.log('✅ Created 5 wishlist items');

  // ─── 14. Quest Definitions ─────────────────────
  const quests = [
    { title: 'Track 3 expenses today', description: 'Log at least 3 expenses', type: 'DAILY' as const, xpReward: 30, category: 'TRACKING', conditions: { type: 'expense_count', target: 3 } },
    { title: 'Stay under budget today', description: 'Keep daily spending under daily average', type: 'DAILY' as const, xpReward: 20, category: 'BUDGET', conditions: { type: 'under_daily_budget' } },
    { title: 'No-spend morning', description: 'No expenses before noon', type: 'DAILY' as const, xpReward: 15, category: 'DISCIPLINE', conditions: { type: 'no_spend_period', until: '12:00' } },
    { title: 'Budget all categories', description: 'Have budget limits for all 8 categories', type: 'WEEKLY' as const, xpReward: 100, category: 'BUDGET', conditions: { type: 'all_categories_budgeted' } },
    { title: 'Save ₱1,000 this week', description: 'Add ₱1,000+ to any savings goal', type: 'WEEKLY' as const, xpReward: 75, category: 'SAVINGS', conditions: { type: 'savings_deposit', target: 1000 } },
    { title: 'Under budget all month', description: 'Stay under total budget for the entire month', type: 'MONTHLY' as const, xpReward: 300, category: 'BUDGET', conditions: { type: 'monthly_under_budget' } },
  ];

  for (const quest of quests) {
    await prisma.questDefinition.create({
      data: { ...quest, isActive: true },
    });
  }

  console.log('✅ Created 6 quest definitions');

  // ─── 15. Leaderboard Opt-In ────────────────────
  await prisma.leaderboardOptIn.create({
    data: { userId: maria.id, isOptedIn: true, displayName: 'Maria💫' },
  });
  await prisma.leaderboardOptIn.create({
    data: { userId: ana.id, isOptedIn: true, displayName: 'AnaQuest' },
  });
  console.log('✅ Created 2 leaderboard opt-in records');

  // ─── 16. Guilds ────────────────────────────────
  const budgetBuddies = await prisma.guild.create({
    data: {
      name: 'Budget Buddies',
      description: 'A guild for savvy savers who track every peso!',
      createdById: maria.id,
      inviteCode: 'bb123456',
      isPublic: true,
      members: {
        createMany: {
          data: [
            { userId: maria.id, role: 'OWNER' },
            { userId: ana.id, role: 'MEMBER' },
            { userId: juan.id, role: 'MEMBER' },
          ],
        },
      },
    },
  });

  const pesoWarriors = await prisma.guild.create({
    data: {
      name: 'Peso Warriors',
      description: 'Fighting for financial freedom, one peso at a time',
      createdById: ana.id,
      inviteCode: 'pw789012',
      isPublic: false,
      members: {
        createMany: {
          data: [
            { userId: ana.id, role: 'OWNER' },
            { userId: maria.id, role: 'ADMIN' },
          ],
        },
      },
    },
  });

  // Guild messages
  await prisma.guildMessage.createMany({
    data: [
      { guildId: budgetBuddies.id, userId: maria.id, content: 'Welcome to Budget Buddies! 🎉' },
      { guildId: budgetBuddies.id, userId: ana.id, content: 'Thanks for the invite! Ready to save 💪' },
      { guildId: budgetBuddies.id, userId: juan.id, content: 'Let\'s crush those budget goals!' },
      { guildId: pesoWarriors.id, userId: ana.id, content: 'Welcome fellow warrior! 🗡️' },
      { guildId: pesoWarriors.id, userId: maria.id, content: 'Let\'s fight for our financial future!' },
    ],
  });

  // Guild challenges
  await prisma.guildChallenge.create({
    data: {
      guildId: budgetBuddies.id,
      title: 'Collective 10K XP',
      targetType: 'COLLECTIVE_XP',
      targetValue: 10000,
      currentValue: 4250,
      startDate: daysAgo(14),
      endDate: daysAgo(-16),
      xpReward: 75,
    },
  });

  console.log('✅ Created 2 guilds with messages and challenges');

  // ─── 17. Community Challenge Definitions ───────
  const challengeDefs = [
    {
      title: 'Fresh Start Sprint',
      description: 'Kick off the new year! Track all expenses for 30 straight days.',
      type: 'MONTHLY' as const,
      month: 1,
      completionCriteria: { type: 'track_expenses', daysRequired: 30 },
      xpReward: 300,
      exclusiveBadgeKey: 'fresh-start-champion',
    },
    {
      title: 'Love Your Finances',
      description: 'Show your wallet some love! Save ₱5,000 this month.',
      type: 'MONTHLY' as const,
      month: 2,
      completionCriteria: { type: 'save_amount', target: 5000 },
      xpReward: 250,
      exclusiveBadgeKey: 'finance-lover',
    },
    {
      title: 'Mid-Year Review Rally',
      description: 'Halfway through! Review budgets and update savings goals.',
      type: 'MONTHLY' as const,
      month: 6,
      completionCriteria: { type: 'mid_year_review' },
      xpReward: 400,
      exclusiveBadgeKey: 'mid-year-master',
    },
    {
      title: 'Spooky Savings',
      description: 'Keep discretionary spending under ₱3,000 this month.',
      type: 'MONTHLY' as const,
      month: 10,
      completionCriteria: { type: 'expense_control', limit: 3000 },
      xpReward: 250,
      exclusiveBadgeKey: 'spooky-saver',
    },
    {
      title: 'Holiday Budget Warrior',
      description: 'Survive the holiday season! Stick to your gift budget for 31 days.',
      type: 'MONTHLY' as const,
      month: 12,
      completionCriteria: { type: 'holiday_discipline', days: 31 },
      xpReward: 500,
      exclusiveBadgeKey: 'holiday-warrior',
    },
    {
      title: 'Budget Master',
      description: 'The ultimate challenge! 7-day streak + health score 80+.',
      type: 'SPECIAL_EVENT' as const,
      month: null,
      completionCriteria: { type: 'master_challenge', streakDays: 7, healthScoreMin: 80 },
      xpReward: 1000,
      exclusiveBadgeKey: 'budget-master',
    },
  ];

  const createdChallenges = [];
  for (const cd of challengeDefs) {
    const created = await prisma.challengeDefinition.create({
      data: { ...cd, isActive: true },
    });
    createdChallenges.push(created);
  }

  console.log('✅ Created 6 community challenge definitions');

  // ─── 18. User Challenge Progress ──────────────
  // Maria completed the first challenge and is halfway through the master challenge
  await prisma.userChallengeProgress.create({
    data: { userId: maria.id, challengeDefinitionId: createdChallenges[0].id, progress: 100, status: 'COMPLETED', completedAt: daysAgo(5) },
  });
  await prisma.userChallengeProgress.create({
    data: { userId: maria.id, challengeDefinitionId: createdChallenges[5].id, progress: 55, status: 'IN_PROGRESS' },
  });
  // Ana joined two challenges
  await prisma.userChallengeProgress.create({
    data: { userId: ana.id, challengeDefinitionId: createdChallenges[0].id, progress: 72, status: 'IN_PROGRESS' },
  });
  await prisma.userChallengeProgress.create({
    data: { userId: ana.id, challengeDefinitionId: createdChallenges[1].id, progress: 30, status: 'IN_PROGRESS' },
  });
  // Juan just started one
  await prisma.userChallengeProgress.create({
    data: { userId: juan.id, challengeDefinitionId: createdChallenges[0].id, progress: 10, status: 'IN_PROGRESS' },
  });

  console.log('✅ Created 5 user challenge progress records');

  // ─── 19. Achievement Events & Reactions ────────
  const event1 = await prisma.achievementEvent.create({
    data: { userId: maria.id, eventType: 'LEVEL_UP', displayText: 'Reached Level 15! 🎉', metadata: { level: 15 }, isPublic: true },
  });
  const event2 = await prisma.achievementEvent.create({
    data: { userId: maria.id, eventType: 'BADGE_EARNED', displayText: 'Earned the "Budget Beginner" badge!', metadata: { badge: 'budget-beginner' }, isPublic: true },
  });
  const event3 = await prisma.achievementEvent.create({
    data: { userId: ana.id, eventType: 'STREAK_MILESTONE', displayText: 'Hit a 14-day streak! 🔥', metadata: { streakDays: 14 }, isPublic: true },
  });
  const event4 = await prisma.achievementEvent.create({
    data: { userId: maria.id, eventType: 'BADGE_EARNED', displayText: 'Created the guild "Budget Buddies" 🏰', metadata: { guildName: 'Budget Buddies', badge: 'guild-creator' }, isPublic: true },
  });
  const event5 = await prisma.achievementEvent.create({
    data: { userId: ana.id, eventType: 'LEVEL_UP', displayText: 'Reached Level 10!', metadata: { level: 10 }, isPublic: true },
  });
  await prisma.achievementEvent.create({
    data: { userId: juan.id, eventType: 'BADGE_EARNED', displayText: 'Earned the "First Steps" badge!', metadata: { badge: 'first-steps' }, isPublic: true },
  });
  await prisma.achievementEvent.create({
    data: { userId: maria.id, eventType: 'CHALLENGE_COMPLETED', displayText: 'Completed the "Fresh Start Sprint" challenge! 🏆', metadata: { challenge: 'Fresh Start Sprint' }, isPublic: true },
  });
  await prisma.achievementEvent.create({
    data: { userId: ana.id, eventType: 'BADGE_EARNED', displayText: 'Earned the "Savings Starter" badge!', metadata: { badge: 'savings-starter' }, isPublic: true },
  });
  await prisma.achievementEvent.create({
    data: { userId: juan.id, eventType: 'STREAK_MILESTONE', displayText: 'Hit a 3-day streak!', metadata: { streakDays: 3 }, isPublic: true },
  });
  await prisma.achievementEvent.create({
    data: { userId: maria.id, eventType: 'LEVEL_UP', displayText: 'Reached Level 14!', metadata: { level: 14 }, isPublic: true },
  });
  // Private event (not public)
  await prisma.achievementEvent.create({
    data: { userId: juan.id, eventType: 'LEVEL_UP', displayText: 'Reached Level 5!', metadata: { level: 5 }, isPublic: false },
  });

  // Feed reactions
  await prisma.feedReaction.createMany({
    data: [
      { achievementEventId: event1.id, userId: ana.id, emoji: '🔥' },
      { achievementEventId: event1.id, userId: juan.id, emoji: '👏' },
      { achievementEventId: event2.id, userId: ana.id, emoji: '🎉' },
      { achievementEventId: event3.id, userId: maria.id, emoji: '💪' },
      { achievementEventId: event3.id, userId: juan.id, emoji: '🔥' },
      { achievementEventId: event4.id, userId: ana.id, emoji: '👏' },
      { achievementEventId: event4.id, userId: juan.id, emoji: '🎉' },
      { achievementEventId: event5.id, userId: maria.id, emoji: '👏' },
    ],
  });

  console.log('✅ Created 11 achievement events with 8 reactions');

  // ─── AI Features Seed Data ────────────────────────────

  // 17.1 — Sample AI conversation with messages for maria
  const aiConvo = await prisma.aIConversation.create({
    data: {
      userId: maria.id,
      title: 'How can I save more?',
    },
  });
  await prisma.aIMessage.createMany({
    data: [
      { conversationId: aiConvo.id, role: 'USER', content: 'How can I save more money this month?' },
      { conversationId: aiConvo.id, role: 'ASSISTANT', content: 'Based on your spending, you\'re spending ₱4,500 on Food & Dining which is 35% above your budget. Try meal prepping on weekends — that alone could save ₱1,200/month! 🍳' },
      { conversationId: aiConvo.id, role: 'USER', content: 'What about my entertainment spending?' },
      { conversationId: aiConvo.id, role: 'ASSISTANT', content: 'Your entertainment budget looks healthy at ₱2,000/month. You\'re actually under-spending by about 10% there. No changes needed — keep enjoying your hobbies! 🎬' },
    ],
  });
  console.log('✅ Created AI conversation with 4 messages');

  // 17.2 — Spending patterns
  await prisma.spendingPattern.createMany({
    data: [
      { userId: maria.id, type: 'OVERSPEND', category: 'FOOD_DINING', deviation: 35.2, insight: 'Your food spending exceeded the budget by 35%. Consider meal prepping to reduce dining out costs.', period: 'Last 30 days' },
      { userId: maria.id, type: 'OVERSPEND', category: 'ENTERTAINMENT', deviation: 22.5, insight: 'Entertainment expenses are 22% over budget. Look for free or discounted alternatives.', period: 'Last 30 days' },
      { userId: maria.id, type: 'UNDERSPEND', category: 'TRANSPORTATION', deviation: 18.0, insight: 'Great job! Transportation spending is 18% below budget. You could reallocate the savings.', period: 'Last 30 days' },
    ],
  });
  console.log('✅ Created 3 spending patterns');

  // 17.3 — Budget suggestions
  await prisma.budgetSuggestion.createMany({
    data: [
      { userId: maria.id, category: 'FOOD_DINING', currentAmount: 5000, suggestedAmount: 4000, reasoning: 'Based on 3 months of data, reducing food budget to ₱4,000 is achievable with meal prep.', estimatedSavings: 1000, status: 'PENDING' },
      { userId: maria.id, category: 'ENTERTAINMENT', currentAmount: 3000, suggestedAmount: 2500, reasoning: 'Switching to streaming bundles could save ₱500/month without sacrificing enjoyment.', estimatedSavings: 500, status: 'APPLIED' },
      { userId: maria.id, category: 'UTILITIES', currentAmount: 4000, suggestedAmount: 3500, reasoning: 'Energy-saving habits like LED bulbs and off-peak usage could trim utility costs.', estimatedSavings: 500, status: 'PENDING' },
      { userId: maria.id, category: 'TRANSPORTATION', currentAmount: 3000, suggestedAmount: 2000, reasoning: 'You consistently spend under ₱2,000 on transport. Adjust budget to match reality.', estimatedSavings: 1000, status: 'DISMISSED' },
    ],
  });
  console.log('✅ Created 4 budget suggestions');

  // 17.4 — Receipt scans
  await prisma.receiptScan.createMany({
    data: [
      { userId: maria.id, merchantName: 'SM Supermarket', totalAmount: 1250.75, scanDate: daysAgo(3), items: JSON.parse('[{"name":"Rice 5kg","amount":450},{"name":"Chicken","amount":320},{"name":"Vegetables","amount":180.75},{"name":"Cooking Oil","amount":300}]'), suggestedCategory: 'FOOD_DINING', status: 'CONFIRMED' },
      { userId: maria.id, merchantName: 'Mercury Drug Store', totalAmount: 850.00, scanDate: daysAgo(1), items: JSON.parse('[{"name":"Vitamins","amount":450},{"name":"Paracetamol","amount":150},{"name":"Band-aids","amount":250}]'), suggestedCategory: 'HEALTHCARE', status: 'PENDING' },
    ],
  });
  console.log('✅ Created 2 receipt scans');

  // 18. Seasonal Events
  const launchFestival = await prisma.seasonalEvent.create({
    data: {
      name: 'MoneyQuest Launch Festival',
      description: 'Celebrate the launch of MoneyQuest! Complete challenges to earn exclusive badges and bonus XP.',
      theme: 'launch-festival',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      xpMultiplier: 2.0,
      milestones: JSON.parse('[{"level":1,"name":"Getting Started","description":"Log 5 expenses","target":5},{"level":2,"name":"Budget Builder","description":"Create 3 budgets","target":3},{"level":3,"name":"Savings Star","description":"Make 5 savings deposits","target":5},{"level":4,"name":"Quest Conqueror","description":"Complete 10 quests","target":10},{"level":5,"name":"Launch Legend","description":"Reach all milestones","target":1}]'),
      badgeKeys: ['launch_explorer', 'launch_champion', 'launch_legend'],
    },
  });

  await prisma.userSeasonalProgress.create({
    data: {
      userId: maria.id,
      seasonalEventId: launchFestival.id,
      progress: 3,
      milestonesReached: [1, 2],
    },
  });
  console.log('✅ Created seasonal event: MoneyQuest Launch Festival');

  console.log('\n🎉 Seed complete! Test accounts:');
  console.log('  📧 maria@example.com / password123 (Level 15, 30-day streak)');
  console.log('  📧 juan@example.com  / password123 (Level 5, beginner)');
  console.log('  📧 ana@example.com   / password123 (Level 10, intermediate)');
  console.log('\n🏰 Guilds: Budget Buddies (public, bb123456), Peso Warriors (private, pw789012)');
  console.log('🎯 Challenges: 6 definitions, 5 user progress records');
  console.log('📰 Feed: 11 achievement events, 8 reactions');
  console.log('🤖 AI: 1 conversation, 3 patterns, 4 suggestions, 2 receipt scans');
  console.log('🎪 Seasonal: Launch Festival (2x XP, 30 days)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
