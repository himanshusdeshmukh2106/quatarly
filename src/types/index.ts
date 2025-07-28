export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  author: string;
  image_url: string;
  video_url?: string;
  category: Category;
  tags: Tag[];
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: string[];
}

export interface Tag {
  id: number;
  name: string;
}

export interface UserPreferences {
  categories: Category[];
  tags: Tag[];
}

export type QuestionType = 'TX' | 'NU' | 'SC' | 'MC';

export interface QuestionnaireQuestion {
  id: number;
  group: string;
  text: string;
  type: QuestionType;
  choices?: string[];
  prompt?: string;
}

export interface Answer {
  question_id: number;
  selected_choices: string[];
  custom_input: string | null;
}

export interface QuestionnaireResponse {
  responses: Answer[];
}

// Goals interfaces
export interface Goal {
  id: string;
  title: string;
  currentAmount: number;
  targetAmount: number;
  description?: string;
  category?: string;
  image: string; // URL
  logo: string; // bank logo URL
  aiAnalysis: string;
  createdAt: string;
  updatedAt: string;
  progressPercentage: number;
}

export interface CreateGoalRequest {
  title: string;
  target_amount: number;
  description?: string;
  category?: string;
}

export interface UpdateGoalRequest extends Partial<CreateGoalRequest> {
  current_amount?: number;
}

// Opportunities interfaces
export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  opportunityType: 'investment' | 'goal_specific' | 'career' | 'financial_product' | 'market_timing' | 'education' | 'lifestyle';
  priority: 'high' | 'medium' | 'low';
  aiInsights: string;
  actionSteps: string[];
  relevanceScore: number;
  imageUrl?: string;
  originalPrice?: number;
  discountedPrice?: number;
  discountPercentage?: number;
  expiresAt?: string;
  externalUrl?: string;
  provider?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface UserProfile {
  demographics: {
    age: number;
    maritalStatus: string;
    hasKids: boolean;
    dependents: string[];
  };
  financial: {
    monthlyIncome: number;
    jobStability: string;
    debtSituation: string;
    emergencyFund: string;
    monthlyExpenses: number;
    expenseBreakdown: Record<string, number>;
    savingsRate: number;
  };
  goals: {
    shortTerm: string;
    longTerm: string;
    priorities: string[];
  };
  personality: {
    spendingStyle: string;
    investmentComfort: string;
    riskTolerance: string;
  };
  riskFactors: string[];
  opportunities: string[];
} 