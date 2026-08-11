export type Difficulty = 'fácil' | 'medio' | 'difícil';

export type WordCategory = 'colores' | 'animales' | 'familia' | 'colegio' | 'números' | 'cotidiano';

export interface WordItem {
  id: string;
  word: string; // in English, e.g., "school"
  translation: string; // in Spanish, e.g., "escuela / colegio"
  category: WordCategory;
  difficulty: Difficulty;
  hint: string;
  exampleEn: string;
  exampleEs: string;
}

export type PhaseId = 1 | 2 | 3 | 4 | 5;

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProgress {
  studentName: string;
  grade: string;
  xp: number;
  streak: number;
  maxStreak: number;
  hearts: number;
  maxHearts: number;
  currentPhase: PhaseId;
  diagnosticCompleted: boolean;
  learningMasteredIds: string[];
  minigamesCompletedCount: number;
  bossDefeated: boolean;
  bossScore: number;
  mistakesCount: Record<string, number>; // word -> failure count
  unlockedBadges: string[]; // badge IDs
  startTime: number;
  totalTimeSeconds: number;
  fontSize: 'normal' | 'large' | 'xlarge';
}

export type MinigameMode = 'missing' | 'scramble' | 'dictation';
