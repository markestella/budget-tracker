export interface Quote {
  id: number;
  text: string;
  author?: string;
  category: 'wisdom' | 'motivation' | 'fact' | 'humor';
}

export const QUOTES: Quote[] = [
  // === Wisdom (15) ===
  { id: 1, text: 'A budget is telling your money where to go instead of wondering where it went.', author: 'Dave Ramsey', category: 'wisdom' },
  { id: 2, text: 'Do not save what is left after spending, but spend what is left after saving.', author: 'Warren Buffett', category: 'wisdom' },
  { id: 3, text: 'The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order.', author: 'T.T. Munger', category: 'wisdom' },
  { id: 4, text: 'Beware of little expenses. A small leak will sink a great ship.', author: 'Benjamin Franklin', category: 'wisdom' },
  { id: 5, text: 'It\'s not your salary that makes you rich, it\'s your spending habits.', author: 'Charles A. Jaffe', category: 'wisdom' },
  { id: 6, text: 'Never spend your money before you have it.', author: 'Thomas Jefferson', category: 'wisdom' },
  { id: 7, text: 'Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.', author: 'Ayn Rand', category: 'wisdom' },
  { id: 8, text: 'The art is not in making money, but in keeping it.', category: 'wisdom' },
  { id: 9, text: 'Financial peace isn\'t the acquisition of stuff. It\'s learning to live on less than you make.', author: 'Dave Ramsey', category: 'wisdom' },
  { id: 10, text: 'Wealth consists not in having great possessions, but in having few wants.', author: 'Epictetus', category: 'wisdom' },
  { id: 11, text: 'Rich is not about having a lot of money. Rich is about having a lot of options.', author: 'Chris Rock', category: 'wisdom' },
  { id: 12, text: 'The goal isn\'t more money. The goal is living life on your terms.', author: 'Chris Brogan', category: 'wisdom' },
  { id: 13, text: 'Too many people spend money they earned to buy things they don\'t want to impress people they don\'t like.', author: 'Will Rogers', category: 'wisdom' },
  { id: 14, text: 'Money grows on the tree of persistence.', category: 'wisdom' },
  { id: 15, text: 'The quickest way to double your money is to fold it in half and put it back in your pocket.', author: 'Will Rogers', category: 'wisdom' },

  // === Motivation (15) ===
  { id: 16, text: 'Every peso you save today is a step closer to the life you want tomorrow.', category: 'motivation' },
  { id: 17, text: 'You don\'t have to be great to start, but you have to start to be great.', author: 'Zig Ziglar', category: 'motivation' },
  { id: 18, text: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma', category: 'motivation' },
  { id: 19, text: 'The best time to plant a tree was 20 years ago. The second best time is now.', category: 'motivation' },
  { id: 20, text: 'Financial freedom is available to those who learn about it and work for it.', author: 'Robert Kiyosaki', category: 'motivation' },
  { id: 21, text: 'Your financial future is determined by the decisions you make today.', category: 'motivation' },
  { id: 22, text: 'Don\'t let yesterday\'s spending define tomorrow\'s possibilities.', category: 'motivation' },
  { id: 23, text: 'Every expert was once a beginner. Keep tracking, keep growing.', category: 'motivation' },
  { id: 24, text: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln', category: 'motivation' },
  { id: 25, text: 'Compound interest is the eighth wonder of the world. Start earning it.', author: 'Albert Einstein', category: 'motivation' },
  { id: 26, text: 'A journey of a thousand pesos begins with a single save.', category: 'motivation' },
  { id: 27, text: 'Your budget is your battle plan. Today, you\'re winning.', category: 'motivation' },
  { id: 28, text: 'Progress, not perfection. Every logged expense matters.', category: 'motivation' },
  { id: 29, text: 'The pain of discipline weighs ounces. The pain of regret weighs tons.', author: 'Jim Rohn', category: 'motivation' },
  { id: 30, text: 'Saving money is a superpower. You\'re more powerful than you think.', category: 'motivation' },

  // === Filipino-relevant (12) ===
  { id: 31, text: 'Ang hindi marunong lumingon sa pinanggalingan ay hindi makakarating sa paroroonan. — Track where your money came from to know where it\'s going.', category: 'wisdom' },
  { id: 32, text: 'Aanhin pa ang damo kung patay na ang kabayo. — Don\'t wait until it\'s too late to start saving.', category: 'wisdom' },
  { id: 33, text: 'Kapag may isinuksok, may madudukot. — What you save today, you can use tomorrow.', category: 'wisdom' },
  { id: 34, text: 'Kung may tiyaga, may nilaga. — Patience in saving always pays off.', category: 'motivation' },
  { id: 35, text: 'Piso-piso lang yan — but those pesos add up to financial freedom.', category: 'motivation' },
  { id: 36, text: 'Ang kuripot daw, pero ang tawag ng bangko: financially responsible. 😄', category: 'humor' },
  { id: 37, text: 'Huwag maging gastos, maging investment. Turn your expenses into wisdom.', category: 'motivation' },
  { id: 38, text: 'Bawal ang \"libre lang\" mindset. Free things still cost time and habits.', category: 'wisdom' },
  { id: 39, text: 'Pinoy tip: Cooking at home can save you ₱3,000+ per month. Lutong bahay = lutong pera!', category: 'fact' },
  { id: 40, text: 'Filipino workers send ₱2.8 trillion in remittances yearly. That\'s the power of financial dedication.', category: 'fact' },
  { id: 41, text: 'The SSS, Pag-IBIG, and PhilHealth contributions you make today protect your tomorrow.', category: 'fact' },
  { id: 42, text: 'The 50-30-20 rule works well with a Pinoy budget: needs, wants, and ipon!', category: 'fact' },

  // === Facts (8) ===
  { id: 43, text: 'The average Filipino saves about 5-10% of income. Top savers consistently put away 20%+.', category: 'fact' },
  { id: 44, text: 'People who track their expenses regularly save on average 20% more than those who don\'t.', category: 'fact' },
  { id: 45, text: 'Automating your savings increases your chances of reaching goals by 80%.', category: 'fact' },
  { id: 46, text: 'The ₱50 you save daily becomes ₱18,250 in a year. Small amounts, big impact.', category: 'fact' },
  { id: 47, text: 'Financial stress costs the average worker 13 hours of lost productivity per month.', category: 'fact' },
  { id: 48, text: 'Having 3-6 months of expenses saved reduces financial anxiety by 60%.', category: 'fact' },
  { id: 49, text: 'The food category is typically the #1 area where budget tracking saves the most money.', category: 'fact' },
  { id: 50, text: 'People who use budgeting apps are 2x more likely to pay off debt within a year.', category: 'fact' },

  // === Humor (5) ===
  { id: 51, text: 'I\'m not saying I\'m broke, but my budget spreadsheet just filed for emotional support.', category: 'humor' },
  { id: 52, text: 'Money can\'t buy happiness, but it\'s more comfortable to cry in a budgeted lifestyle than a chaotic one.', category: 'humor' },
  { id: 53, text: 'My savings account and I have something in common — we both need more deposits.', category: 'humor' },
  { id: 54, text: 'Behind every successful person is a substantial amount of... discipline. And maybe coffee.', category: 'humor' },
  { id: 55, text: 'I told my money we need to talk. It said "I\'m leaving." Budget tracking stopped the breakup.', category: 'humor' },
];
