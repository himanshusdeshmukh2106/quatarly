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