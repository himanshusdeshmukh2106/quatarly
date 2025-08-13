import { sportsCategories, hobbyCategories, goalCategories, investmentCategories, lifestyleCategories } from './categories';

export const topicsData = [
  {
    title: 'Sports',
    data: sportsCategories.map(c => c.name),
  },
  {
    title: 'Hobbies',
    data: hobbyCategories.map(c => c.name),
  },
  {
    title: 'Goals',
    data: goalCategories.map(c => c.name),
  },
  {
    title: 'Finance',
    data: investmentCategories,
  },
  {
    title: 'Lifestyle',
    data: lifestyleCategories,
  },
]; 