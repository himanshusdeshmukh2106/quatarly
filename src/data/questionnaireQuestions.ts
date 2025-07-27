import { QuestionnaireQuestion } from '../types';

export const questionnaireQuestions: QuestionnaireQuestion[] = [
  // Group: Personal Information
  {
    id: 1,
    group: 'Personal Information',
    text: 'What is your name?',
    type: 'TX', // Text
  },
  {
    id: 2,
    group: 'Personal Information',
    text: 'What is your age?',
    type: 'NU', // Number
  },
  {
    id: 3,
    group: 'Personal Information',
    text: 'What is your gender?',
    type: 'SC', // Single Choice
    choices: ['Male', 'Female', 'Other', 'Prefer not to say'],
  },
  {
    id: 4,
    group: 'Personal Information',
    text: 'What is your marital status?',
    type: 'SC', // Single Choice
    choices: ['Single', 'Married', 'Divorced', 'Widowed'],
  },
  {
    id: 5,
    group: 'Personal Information',
    text: 'Do you have kids?',
    type: 'SC', // Single Choice
    choices: ['Yes', 'No'],
  },

  // Group: Income & Job
  {
    id: 6,
    group: 'Income & Job',
    text: "What's your monthly income in hand?",
    type: 'NU', // Number
    prompt: 'Enter amount in ₹',
  },
  {
    id: 7,
    group: 'Income & Job',
    text: 'How stable is your job?',
    type: 'SC', // Single Choice
    choices: [
      'Permanent job (Very stable)',
      'Contract/Freelance (Somewhat stable)',
      'Business owner (Variable income)',
      'Student with part-time work',
    ],
  },

  // Group: Spending Habits
  {
    id: 8,
    group: 'Expenses',
    text: 'List your monthly expenses',
    type: 'MC', // Multiple Choice
    choices: [
      'Rent/EMI',
      'Food & Groceries',
      'Transportation',
      'Entertainment & Shopping',
      'Family support',
      'Loan repayments',
      'Savings & Investments',
      'Bills (electricity, phone, etc.)',
    ],
    prompt: 'Enter amount',
  },

  // Group: Debt Situation
  {
    id: 9,
    group: 'Debt Situation',
    text: 'Do you currently have any loans or debts?',
    type: 'SC', // Single Choice
    choices: [
      'No debts (All clear! 🎉)',
      'Credit card debt',
      'Personal loan',
      'Home loan/Rent advance',
      'Education loan',
      'Family/Friends loan',
      'Multiple debts',
    ],
  },
  {
    id: 10,
    group: 'Debt Situation',
    text: 'If you have debts, what is your total monthly EMI amount?',
    type: 'SC', // Single Choice
    choices: [
      'Less than ₹10,000',
      '₹10,000 - ₹25,000',
      '₹25,000 - ₹50,000',
      'More than ₹50,000',
    ],
  },

  // Group: Savings & Emergency Fund
  {
    id: 11,
    group: 'Savings & Emergency Fund',
    text: 'If you lost your income today, how long could you survive on your savings?',
    type: 'SC', // Single Choice
    choices: [
      'Less than 1 month 😰',
      '1-3 months 😐',
      '3-6 months 😊',
      '6-12 months 🎯',
      'More than 1 year 🚀',
      "What's an emergency fund? 🤔",
    ],
  },

  // Group: Financial Goals
  {
    id: 12,
    group: 'Financial Goals',
    text: "What's your biggest short-term (1-2 years) money goal right now?",
    type: 'SC', // Single Choice
    choices: [
      'Buy a smartphone/laptop',
      'Plan a vacation',
      'Build emergency fund',
      'Pay off debts',
      'Start investing',
    ],
  },
  {
    id: 13,
    group: 'Financial Goals',
    text: "What's your biggest long-term (5+ years) money goal right now?",
    type: 'SC', // Single Choice
    choices: [
      'Buy a house',
      "Children's education",
      'Retirement planning',
      'Start a business',
      'Financial independence',
    ],
  },

  // Group: Financial Dependents
  {
    id: 14,
    group: 'Financial Dependents',
    text: 'Who depends on your income?',
    type: 'MC', // Multiple Choice
    choices: [
      'Just myself',
      'Spouse/Partner',
      'Parents (monthly support)',
      'Children',
      "Siblings' education",
      'Extended family',
    ],
  },
  {
    id: 15,
    group: 'Financial Dependents',
    text: 'What is your monthly family support amount?',
    type: 'SC', // Single Choice
    choices: [
      'No support needed',
      '₹5,000 - ₹15,000',
      '₹15,000 - ₹30,000',
      '₹30,000+',
    ],
  },

  // Group: Investments
  {
    id: 16,
    group: 'Investments',
    text: 'Describe your current investments.',
    type: 'TX', // Text
    prompt: 'Where, how, and when do you invest?',
  },

  // Group: Financial Personality
  {
    id: 17,
    group: 'Financial Personality',
    text: 'Which statement describes your spending style best?',
    type: 'SC', // Single Choice
    choices: [
      '"Save first, spend later" 💰',
      '"Live for today, save tomorrow" 🎉',
      '"Balanced - 50% save, 50% enjoy" ⚖️',
      '"Money comes and goes" 🌊',
      '"Every rupee counts" 🔍',
    ],
  },
  {
    id: 18,
    group: 'Financial Personality',
    text: 'How would you describe your comfort with investing?',
    type: 'SC', // Single Choice
    choices: [
      'Traditional savings only (FD, Savings account)',
      'Ready to try mutual funds',
      'Interested in stocks',
      'Crypto curious',
      'Real estate focused',
      'Gold lover',
    ],
  },
];
