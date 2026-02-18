export type Category = 'science' | 'history' | 'geography' | 'culture';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  category: Category;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number; // options 배열의 인덱스
  explanation: string;
}

export interface AnswerRecord {
  questionId: string;
  selectedAnswer: number; // -1 = 타임아웃
  isCorrect: boolean;
  timeSpent: number; // 초 단위
}

export interface GameResult {
  id: string;
  date: string;
  category: Category | 'all';
  difficulty: Difficulty | 'all';
  totalQuestions: number;
  correctAnswers: number;
  score: number;
  timeTaken: number;
  answers: AnswerRecord[];
  maxCombo?: number;
  speedBonus?: number;
  comboBonus?: number;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  category: Category | 'all';
  difficulty: Difficulty | 'all';
  date: string;
}

export interface UserSettings {
  playerName: string;
  questionsPerGame: number;
  timeLimit: number; // 문제당 초, 0이면 무제한
  soundEnabled: boolean;
}
