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

export type GamePhase = 'main' | 'mode_select' | 'playing' | 'result';

interface GameState {
  // 화면 흐름
  phase: GamePhase;
  selectedCategory: Category | 'all';
  selectedDifficulty: Difficulty | 'all';

  // 진행 중인 게임
  questions: Question[];
  currentIndex: number;
  answers: AnswerRecord[];
  timeRemaining: number;
  isAnswered: boolean;
  lastAnswerCorrect: boolean | null;

  // 콤보 & 보너스
  currentCombo: number;
  maxCombo: number;
  speedBonuses: number[];

  // 결과 & 리더보드
  results: GameResult[];
  leaderboard: LeaderboardEntry[];

  // 사용자 설정
  settings: UserSettings;

  // 액션
  goToMain: () => void;
  goToModeSelect: () => void;
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
  playerName: '',
  questionsPerGame: 10,
  timeLimit: 30,
  soundEnabled: true,
};

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'main',
  selectedCategory: 'all',
  selectedDifficulty: 'all',

  questions: [],
  currentIndex: 0,
  answers: [],
  timeRemaining: 0,
  isAnswered: false,
  lastAnswerCorrect: null,

  currentCombo: 0,
  maxCombo: 0,
  speedBonuses: [],

  results: loadFromStorage<GameResult[]>('quiz-results', []),
  leaderboard: loadFromStorage<LeaderboardEntry[]>('quiz-leaderboard', []),
  settings: loadFromStorage<UserSettings>('quiz-settings', defaultSettings),

  goToMain: () => set({ phase: 'main' }),
  goToModeSelect: () => set({ phase: 'mode_select' }),

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
      isAnswered: false,
      lastAnswerCorrect: null,
      currentCombo: 0,
      maxCombo: 0,
      speedBonuses: [],
    });
  },

  submitAnswer: (selectedAnswer, timeSpent) => {
    const { questions, currentIndex, answers, currentCombo, maxCombo, speedBonuses, settings } = get();
    const question = questions[currentIndex];
    const isCorrect = selectedAnswer !== -1 && selectedAnswer === question.correctAnswer;

    const record: AnswerRecord = {
      questionId: question.id,
      selectedAnswer,
      isCorrect,
      timeSpent,
    };

    const newCombo = isCorrect ? currentCombo + 1 : 0;
    const newMaxCombo = Math.max(maxCombo, newCombo);

    // 스피드 보너스: 정답 + 시간제한 있을 때, 남은 시간 비례 최대 5점
    const speedBonus =
      isCorrect && settings.timeLimit > 0
        ? parseFloat(
            (((settings.timeLimit - Math.min(timeSpent, settings.timeLimit)) / settings.timeLimit) * 5).toFixed(1)
          )
        : 0;

    set({
      answers: [...answers, record],
      isAnswered: true,
      lastAnswerCorrect: isCorrect,
      currentCombo: newCombo,
      maxCombo: newMaxCombo,
      speedBonuses: [...speedBonuses, speedBonus],
    });
  },

  nextQuestion: () => {
    const { currentIndex, questions, settings } = get();
    if (currentIndex + 1 >= questions.length) {
      get().finishGame();
    } else {
      set({
        currentIndex: currentIndex + 1,
        isAnswered: false,
        lastAnswerCorrect: null,
        timeRemaining: settings.timeLimit,
      });
    }
  },

  finishGame: () => {
    const {
      questions, answers, selectedCategory, selectedDifficulty,
      settings, results, leaderboard, maxCombo, speedBonuses,
    } = get();

    const correctCount = answers.filter((a) => a.isCorrect).length;
    const totalTime = answers.reduce((sum, a) => sum + a.timeSpent, 0);
    const baseScore = Math.round((correctCount / questions.length) * 1000);
    const speedBonus = parseFloat(speedBonuses.reduce((s, b) => s + b, 0).toFixed(1));
    const comboBonus = maxCombo >= 3 ? maxCombo * 10 : 0;
    const score = baseScore + Math.round(speedBonus) + comboBonus;

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
      maxCombo,
      speedBonus,
      comboBonus,
    };

    const entry: LeaderboardEntry = {
      id: result.id,
      playerName: settings.playerName || '익명',
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

    set({ phase: 'result', results: newResults, leaderboard: newLeaderboard });
  },

  resetGame: () => {
    set({
      phase: 'main',
      questions: [],
      currentIndex: 0,
      answers: [],
      timeRemaining: 0,
      isAnswered: false,
      lastAnswerCorrect: null,
      currentCombo: 0,
      maxCombo: 0,
      speedBonuses: [],
    });
  },

  updateSettings: (newSettings) => {
    const updated = { ...get().settings, ...newSettings };
    localStorage.setItem('quiz-settings', JSON.stringify(updated));
    set({ settings: updated });
  },
}));
