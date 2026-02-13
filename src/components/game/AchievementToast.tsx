import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { Trophy } from 'lucide-react';

interface MicroAchievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  condition: (ctx: AchievementContext) => boolean;
}

interface AchievementContext {
  totalCorrect: number;
  totalAnswered: number;
  streak: number;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  answerTimeSeconds: number;
  bossesDefeated: number;
  levelsCompleted: number;
  currentHour: number;
  totalXP: number;
}

const MICRO_ACHIEVEMENTS: MicroAchievement[] = [
  {
    id: 'first-blood',
    title: 'First Blood',
    description: 'Answered your first question correctly!',
    emoji: '🎯',
    condition: (ctx) => ctx.totalCorrect === 1,
  },
  {
    id: 'speed-demon',
    title: 'Speed Demon',
    description: 'Answered correctly in under 3 seconds!',
    emoji: '⚡',
    condition: (ctx) => ctx.answerTimeSeconds < 3 && ctx.answerTimeSeconds > 0,
  },
  {
    id: 'comeback-kid',
    title: 'Comeback Kid',
    description: 'Got 3 right after getting 2 wrong!',
    emoji: '🔄',
    condition: (ctx) => ctx.consecutiveCorrect === 3 && ctx.consecutiveWrong >= 2,
  },
  {
    id: 'night-deployer',
    title: 'Night Deployer',
    description: 'Playing after midnight. Who needs sleep?',
    emoji: '🌙',
    condition: (ctx) => ctx.currentHour >= 0 && ctx.currentHour < 5,
  },
  {
    id: 'early-bird',
    title: 'Early Bird',
    description: 'Studying before 6 AM. Dedication!',
    emoji: '🌅',
    condition: (ctx) => ctx.currentHour >= 5 && ctx.currentHour < 6,
  },
  {
    id: 'triple-threat',
    title: 'Triple Threat',
    description: '3 correct answers in a row!',
    emoji: '🔥',
    condition: (ctx) => ctx.consecutiveCorrect === 3,
  },
  {
    id: 'five-star',
    title: 'Five Star General',
    description: '5 correct answers in a row!',
    emoji: '⭐',
    condition: (ctx) => ctx.consecutiveCorrect === 5,
  },
  {
    id: 'perfect-ten',
    title: 'Perfect 10',
    description: '10 in a row! You are unstoppable!',
    emoji: '💯',
    condition: (ctx) => ctx.consecutiveCorrect === 10,
  },
  {
    id: 'centurion-milestone',
    title: 'Centurion',
    description: '100 questions answered! True dedication.',
    emoji: '💪',
    condition: (ctx) => ctx.totalAnswered === 100,
  },
  {
    id: 'half-century',
    title: 'Half Century',
    description: '50 questions answered! Keep it up.',
    emoji: '📊',
    condition: (ctx) => ctx.totalAnswered === 50,
  },
  {
    id: 'xp-1000',
    title: 'Breaking 1K',
    description: 'Reached 1,000 XP!',
    emoji: '🚀',
    condition: (ctx) => ctx.totalXP >= 1000 && ctx.totalXP < 1050,
  },
  {
    id: 'xp-5000',
    title: 'XP Hoarder',
    description: 'Reached 5,000 XP! You are a legend.',
    emoji: '👑',
    condition: (ctx) => ctx.totalXP >= 5000 && ctx.totalXP < 5100,
  },
];

interface Toast {
  id: string;
  achievement: MicroAchievement;
  timestamp: number;
}

interface AchievementToastContextType {
  checkAchievements: (ctx: Partial<AchievementContext>) => void;
}

const AchievementToastContext = createContext<AchievementToastContextType | null>(null);

export function AchievementToastProvider({ children }: { children: ReactNode }) {
  const { state } = useGame();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [shownIds, setShownIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('devops-quest-achievements');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });
  const lastWrongStreakRef = useRef(0);

  useEffect(() => {
    localStorage.setItem('devops-quest-achievements', JSON.stringify([...shownIds]));
  }, [shownIds]);

  // Auto-remove toasts after 4 seconds
  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 4000);
    return () => clearTimeout(timer);
  }, [toasts]);

  const checkAchievements = useCallback((partial: Partial<AchievementContext>) => {
    const user = state.user;
    if (!user) return;

    const ctx: AchievementContext = {
      totalCorrect: user.stats.correctAnswers,
      totalAnswered: user.stats.totalQuestionsAnswered,
      streak: user.streak.currentStreak,
      consecutiveCorrect: partial.consecutiveCorrect ?? 0,
      consecutiveWrong: lastWrongStreakRef.current,
      answerTimeSeconds: partial.answerTimeSeconds ?? 999,
      bossesDefeated: user.stats.bossesDefeated,
      levelsCompleted: Object.values(user.levelProgress).filter(lp => lp.completed).length,
      currentHour: new Date().getHours(),
      totalXP: user.totalXP,
      ...partial,
    };

    // Track wrong streak for comeback detection
    if (partial.consecutiveCorrect === 0 && partial.consecutiveWrong !== undefined) {
      lastWrongStreakRef.current = partial.consecutiveWrong;
    } else if ((partial.consecutiveCorrect ?? 0) >= 3) {
      // Reset after comeback triggers
      lastWrongStreakRef.current = 0;
    }

    const triggered = MICRO_ACHIEVEMENTS.filter(
      a => !shownIds.has(a.id) && a.condition(ctx)
    );

    if (triggered.length > 0) {
      const newToasts = triggered.map(a => ({
        id: a.id,
        achievement: a,
        timestamp: Date.now(),
      }));
      setToasts(prev => [...prev, ...newToasts]);
      setShownIds(prev => {
        const next = new Set(prev);
        triggered.forEach(a => next.add(a.id));
        return next;
      });
    }
  }, [state.user, shownIds]);

  return (
    <AchievementToastContext.Provider value={{ checkAchievements }}>
      {children}
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto animate-in slide-in-from-right-5 duration-500 bg-gradient-to-r from-yellow-500/20 via-orange-500/10 to-transparent border border-yellow-500/30 rounded-xl p-4 shadow-2xl backdrop-blur-sm max-w-sm"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">{toast.achievement.emoji}</span>
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-3 w-3 text-yellow-500" />
                  <p className="text-xs font-bold uppercase text-yellow-500 tracking-wider">Achievement Unlocked</p>
                </div>
                <p className="font-bold text-sm">{toast.achievement.title}</p>
                <p className="text-xs text-muted-foreground">{toast.achievement.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AchievementToastContext.Provider>
  );
}

export function useAchievementToast() {
  const context = useContext(AchievementToastContext);
  if (!context) {
    throw new Error('useAchievementToast must be used within AchievementToastProvider');
  }
  return context;
}
