export interface Quote {
  text: string;
  author: string;
}

export interface Milestone {
  id: string;
  name: string;
  emoji: string;
  icon?: string; // lucide-style icon name
  date: string; // ISO date string YYYY-MM-DD
}

export interface UserSettings {
  birthday: string | null; // ISO date string YYYY-MM-DD
  milestones: Milestone[];
  lifeExpectancy: number; // 60-100, default 80
  favoriteQuotes: string[]; // Array of quote texts
  dailyQuoteEnabled: boolean;
}
