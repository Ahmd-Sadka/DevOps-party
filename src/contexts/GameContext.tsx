import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { UserProgress, LevelId, LevelProgress, QuizSession, AnswerRecord, LEVELS, calculateLevel } from '@/types/game';

interface GameState {
  user: UserProgress | null;
  currentQuiz: QuizSession | null;
  isOnboarding: boolean;
}

type GameAction =
  | { type: 'SET_USER'; payload: UserProgress }
  | { type: 'UPDATE_USER'; payload: Partial<UserProgress> }
  | { type: 'START_QUIZ'; payload: QuizSession }
  | { type: 'ANSWER_QUESTION'; payload: AnswerRecord }
  | { type: 'COMPLETE_QUIZ' }
  | { type: 'ADD_XP'; payload: number }
  | { type: 'UNLOCK_BADGE'; payload: string }
  | { type: 'UPDATE_STREAK' }
  | { type: 'SET_ONBOARDING'; payload: boolean }
  | { type: 'USE_POWERUP'; payload: string }
  | { type: 'ADD_POWERUP'; payload: { id: string; amount: number } }
  | { type: 'COMPLETE_DAILY_CHALLENGE'; payload: string }
  | { type: 'DEFEAT_BOSS'; payload: LevelId }
  | { type: 'CLEAR_QUIZ' }
  | { type: 'RESET_GAME' };

const initialLevelProgress: Record<LevelId, LevelProgress> = {
  linux: { unlocked: true, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  bash: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  git: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  docker: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  ansible: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  kubernetes: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  terraform: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  aws: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  cicd: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  openshift: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  devops: { unlocked: false, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
  'junior-interview': { unlocked: true, completed: false, questionsAnswered: 0, correctAnswers: 0, attempts: 0 },
};

const createNewUser = (username: string, avatarId: string): UserProgress => ({
  username,
  avatarId,
  totalXP: 0,
  currentLevel: 1,
  completedQuestions: [],
  levelProgress: { ...initialLevelProgress },
  earnedBadges: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastPracticeDate: '',
    streakShields: 0,
    freezesUsed: 0,
  },
  stats: {
    totalQuestionsAnswered: 0,
    correctAnswers: 0,
    totalTimeSpent: 0,
    averageAccuracy: 0,
    fastestAnswer: Infinity,
    evilModeCompleted: 0,
    bossesDefeated: 0,
    dailyChallengesCompleted: 0,
  },
  powerUps: {
    fifty_fifty: 2,
    skip: 1,
    time_freeze: 1,
    hint: 2,
  },
  dailyChallengeCompleted: [],
  createdAt: new Date().toISOString(),
  lastActiveAt: new Date().toISOString(),
});

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, isOnboarding: false };
    
    case 'UPDATE_USER':
      if (!state.user) return state;
      return { ...state, user: { ...state.user, ...action.payload } };
    
    case 'START_QUIZ':
      return { ...state, currentQuiz: action.payload };
    
    case 'ANSWER_QUESTION':
      if (!state.currentQuiz || !state.user) return state;
      const newAnswers = [...state.currentQuiz.answers, action.payload];
      const newIndex = state.currentQuiz.currentQuestionIndex + 1;
      const isComplete = newIndex >= state.currentQuiz.questions.length;
      
      const newStats = { ...state.user.stats };
      newStats.totalQuestionsAnswered++;
      if (action.payload.isCorrect) newStats.correctAnswers++;
      newStats.totalTimeSpent += action.payload.timeSpent;
      newStats.averageAccuracy = (newStats.correctAnswers / newStats.totalQuestionsAnswered) * 100;
      if (action.payload.timeSpent < newStats.fastestAnswer) {
        newStats.fastestAnswer = action.payload.timeSpent;
      }
      
      return {
        ...state,
        currentQuiz: {
          ...state.currentQuiz,
          answers: newAnswers,
          currentQuestionIndex: newIndex,
          isComplete,
        },
        user: {
          ...state.user,
          totalXP: state.user.totalXP + action.payload.xpEarned,
          currentLevel: calculateLevel(state.user.totalXP + action.payload.xpEarned),
          completedQuestions: [...state.user.completedQuestions, action.payload.questionId],
          stats: newStats,
          lastActiveAt: new Date().toISOString(),
        },
      };
    
    case 'COMPLETE_QUIZ':
      if (!state.currentQuiz || !state.user) return state;
      const levelId = state.currentQuiz.levelId;
      const correctCount = state.currentQuiz.answers.filter(a => a.isCorrect).length;
      const totalCount = state.currentQuiz.questions.length;
      const accuracy = (correctCount / totalCount) * 100;
      
      const newLevelProgress = { ...state.user.levelProgress };
      newLevelProgress[levelId] = {
        ...newLevelProgress[levelId],
        questionsAnswered: newLevelProgress[levelId].questionsAnswered + totalCount,
        correctAnswers: newLevelProgress[levelId].correctAnswers + correctCount,
        attempts: newLevelProgress[levelId].attempts + 1,
        completed: accuracy >= 70,
      };
      
      if (accuracy >= 70) {
        const levelIndex = LEVELS.findIndex(l => l.id === levelId);
        if (levelIndex < LEVELS.length - 1) {
          const nextLevelId = LEVELS[levelIndex + 1].id;
          newLevelProgress[nextLevelId] = {
            ...newLevelProgress[nextLevelId],
            unlocked: true,
          };
        }
      }
      
      return {
        ...state,
        currentQuiz: null,
        user: {
          ...state.user,
          levelProgress: newLevelProgress,
        },
      };
    
    case 'ADD_XP':
      if (!state.user) return state;
      const newXP = state.user.totalXP + action.payload;
      return {
        ...state,
        user: {
          ...state.user,
          totalXP: newXP,
          currentLevel: calculateLevel(newXP),
        },
      };
    
    case 'UNLOCK_BADGE':
      if (!state.user) return state;
      if (state.user.earnedBadges.includes(action.payload)) return state;
      return {
        ...state,
        user: {
          ...state.user,
          earnedBadges: [...state.user.earnedBadges, action.payload],
        },
      };
    
    case 'UPDATE_STREAK':
      if (!state.user) return state;
      const today = new Date().toISOString().split('T')[0];
      const lastPractice = state.user.streak.lastPracticeDate;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let newStreak = state.user.streak.currentStreak;
      if (lastPractice === today) {
        // Already practiced today
      } else if (lastPractice === yesterday) {
        newStreak++;
      } else {
        newStreak = 1;
      }
      
      return {
        ...state,
        user: {
          ...state.user,
          streak: {
            ...state.user.streak,
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, state.user.streak.longestStreak),
            lastPracticeDate: today,
          },
        },
      };
    
    case 'USE_POWERUP':
      if (!state.user) return state;
      const currentCount = state.user.powerUps[action.payload] || 0;
      if (currentCount <= 0) return state;
      return {
        ...state,
        user: {
          ...state.user,
          powerUps: {
            ...state.user.powerUps,
            [action.payload]: currentCount - 1,
          },
        },
      };
    
    case 'ADD_POWERUP':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          powerUps: {
            ...state.user.powerUps,
            [action.payload.id]: (state.user.powerUps[action.payload.id] || 0) + action.payload.amount,
          },
        },
      };
    
    case 'COMPLETE_DAILY_CHALLENGE':
      if (!state.user) return state;
      if (state.user.dailyChallengeCompleted.includes(action.payload)) return state;
      return {
        ...state,
        user: {
          ...state.user,
          dailyChallengeCompleted: [...state.user.dailyChallengeCompleted, action.payload],
          stats: {
            ...state.user.stats,
            dailyChallengesCompleted: state.user.stats.dailyChallengesCompleted + 1,
          },
        },
      };
    
    case 'DEFEAT_BOSS':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          levelProgress: {
            ...state.user.levelProgress,
            [action.payload]: {
              ...state.user.levelProgress[action.payload],
              bossDefeated: true,
            },
          },
          stats: {
            ...state.user.stats,
            bossesDefeated: state.user.stats.bossesDefeated + 1,
          },
        },
      };
    
    case 'SET_ONBOARDING':
      return { ...state, isOnboarding: action.payload };

    case 'CLEAR_QUIZ':
      return { ...state, currentQuiz: null };

    case 'RESET_GAME':
      localStorage.removeItem('devops-quest-user');
      return { user: null, currentQuiz: null, isOnboarding: true };
    
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  createUser: (username: string, avatarId: string) => void;
  startQuiz: (levelId: LevelId, questions: any[]) => void;
  submitAnswer: (questionId: string, selectedAnswer: number, isCorrect: boolean, timeSpent: number, xpEarned: number) => void;
  completeQuiz: () => void;
  clearQuiz: () => void;
  usePowerUp: (powerUpId: string) => boolean;
  addXP: (amount: number) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, {
    user: null,
    currentQuiz: null,
    isOnboarding: true,
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('devops-quest-user');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        // Migrate old users to include new fields
        const migratedUser = {
          ...user,
          powerUps: user.powerUps || { fifty_fifty: 2, skip: 1, time_freeze: 1, hint: 2 },
          dailyChallengeCompleted: user.dailyChallengeCompleted || [],
          stats: {
            ...user.stats,
            bossesDefeated: user.stats?.bossesDefeated || 0,
            dailyChallengesCompleted: user.stats?.dailyChallengesCompleted || 0,
          },
          levelProgress: {
            ...initialLevelProgress,
            ...user.levelProgress,
          },
        };
        dispatch({ type: 'SET_USER', payload: migratedUser });
      } catch (e) {
        console.error('Failed to parse saved user');
      }
    }
  }, []);

  useEffect(() => {
    if (state.user) {
      localStorage.setItem('devops-quest-user', JSON.stringify(state.user));
    }
  }, [state.user]);

  const createUser = (username: string, avatarId: string) => {
    const newUser = createNewUser(username, avatarId);
    dispatch({ type: 'SET_USER', payload: newUser });
  };

  const startQuiz = (levelId: LevelId, questions: any[]) => {
    dispatch({
      type: 'START_QUIZ',
      payload: {
        levelId,
        questions,
        currentQuestionIndex: 0,
        answers: [],
        startTime: Date.now(),
        isComplete: false,
      },
    });
  };

  const submitAnswer = (questionId: string, selectedAnswer: number, isCorrect: boolean, timeSpent: number, xpEarned: number) => {
    dispatch({
      type: 'ANSWER_QUESTION',
      payload: { questionId, selectedAnswer, isCorrect, timeSpent, xpEarned },
    });
    dispatch({ type: 'UPDATE_STREAK' });
  };

  const completeQuiz = () => {
    dispatch({ type: 'COMPLETE_QUIZ' });
  };

  const clearQuiz = () => {
    dispatch({ type: 'CLEAR_QUIZ' });
  };

  const usePowerUp = (powerUpId: string): boolean => {
    if (!state.user || (state.user.powerUps[powerUpId] || 0) <= 0) {
      return false;
    }
    dispatch({ type: 'USE_POWERUP', payload: powerUpId });
    return true;
  };

  const addXP = (amount: number) => {
    if (amount <= 0) return;
    dispatch({ type: 'ADD_XP', payload: amount });
  };

  return (
    <GameContext.Provider value={{ state, dispatch, createUser, startQuiz, submitAnswer, completeQuiz, clearQuiz, usePowerUp, addXP }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
