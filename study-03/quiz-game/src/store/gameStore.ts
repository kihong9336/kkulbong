import { create } from 'zustand';
import type {
  Category,
  Difficulty,
  Question,
  AnswerRecord,
  GameResult,
  LeaderboardEntry,
  UserSettings,
} from '../types';
import { questions as allQuestions } from '../data/questions';

type GamePhase = 'menu' | 'playing' | 'review' | 'result';

interface GameState {
  // 게임 설정
  phase: GamePhase;
  selectedCategory: Category | 'all';
  selectedDifficulty: Difficulty | 'all';

  // 진행 중인 게임
  questions: Question[];
  currentIndex: number;
  answers: AnswerRecord[];
  timeRemaining: number;

  // 결과 & 리더보드
  results: GameResult[];
  leaderboard: LeaderboardEntry[];

  // 사용자 설정
  settings: UserSettings;

  // 액션
  setCategory: (category: Category | 'all') => void;
  setDifficulty: (difficulty: Difficulty | 'all') => void;
  startGame: () => void;
  submitAnswer: (selectedAnswer: number, timeSpent: number) => void;
  nextQuestion: () => void;
  finishGame: () => void;
  resetGame: () => void;
  updateSettings: (settings: Partial<UserSettings>) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

const defaultSettings: UserSettings = {
  playerName: '플레이어',
  questionsPerGame: 10,
  timeLimit: 30,
  soundEnabled: true,
};

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'menu',
  selectedCategory: 'all',
  selectedDifficulty: 'all',

  questions: [],
  currentIndex: 0,
  answers: [],
  timeRemaining: 0,

  results: loadFromStorage<GameResult[]>('quiz-results', []),
  leaderboard: loadFromStorage<LeaderboardEntry[]>('quiz-leaderboard', []),
  settings: loadFromStorage<UserSettings>('quiz-settings', defaultSettings),

  setCategory: (category) => set({ selectedCategory: category }),
  setDifficulty: (difficulty) => set({ selectedDifficulty: difficulty }),

  startGame: () => {
    const { selectedCategory, selectedDifficulty, settings } = get();

    let filtered = allQuestions;
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((q) => q.category === selectedCategory);
    }
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter((q) => q.difficulty === selectedDifficulty);
    }

    const shuffled = shuffleArray(filtered);
    const selected = shuffled.slice(0, settings.questionsPerGame);

    set({
      phase: 'playing',
      questions: selected,
      currentIndex: 0,
      answers: [],
      timeRemaining: settings.timeLimit,
    });
  },

  submitAnswer: (selectedAnswer, timeSpent) => {
    const { questions, currentIndex, answers } = get();
    const question = questions[currentIndex];

    const record: AnswerRecord = {
      questionId: question.id,
      selectedAnswer,
      isCorrect: selectedAnswer === question.correctAnswer,
      timeSpent,
    };

    set({ answers: [...answers, record], phase: 'review' });
  },

  nextQuestion: () => {
    const { currentIndex, questions } = get();
    if (currentIndex + 1 >= questions.length) {
      get().finishGame();
    } else {
      set({
        currentIndex: currentIndex + 1,
        phase: 'playing',
        timeRemaining: get().settings.timeLimit,
      });
    }
  },

  finishGame: () => {
    const { questions, answers, selectedCategory, selectedDifficulty, settings, results, leaderboard } = get();

    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    const score = Math.round((correctCount / questions.length) * 1000);

    const result: GameResult = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      category: selectedCategory,
      difficulty: selectedDifficulty,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      score,
      timeTaken: totalTime,
      answers,
    };

    const entry: LeaderboardEntry = {
      id: result.id,
      playerName: settings.playerName,
      score,
      correctAnswers: correctCount,
      totalQuestions: questions.length,
      category: selectedCategory,
      difficulty: selectedDifficulty,
      date: result.date,
    };

    const newResults = [result, ...results].slice(0, 50);
    const newLeaderboard = [...leaderboard, entry]
      .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
      .slice(0, 20);

    localStorage.setItem('quiz-results', JSON.stringify(newResults));
    localStorage.setItem('quiz-leaderboard', JSON.stringify(newLeaderboard));

    set({
      phase: 'result',
      results: newResults,
      leaderboard: newLeaderboard,
    });
  },

  resetGame: () => {
    set({
      phase: 'menu',
      questions: [],
      currentIndex: 0,
      answers: [],
      timeRemaining: 0,
    });
  },

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    localStorage.setItem('quiz-settings', JSON.stringify(updated));
    set({ settings: updated });
  },
}));
