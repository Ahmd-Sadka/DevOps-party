import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useGame } from '@/contexts/GameContext';
import { getQuestionsByLevel } from '@/data/questions';
import { LEVELS, LevelId } from '@/types/game';
import { Clock, Zap, Trophy, Calendar, Flame } from 'lucide-react';

interface DailyChallengeData {
  id: string;
  date: string;
  levelId: LevelId;
  title: string;
  description: string;
  bonusXP: number;
  questionCount: number;
  timeLimit: number; // seconds
}

const generateDailyChallenge = (): DailyChallengeData => {
  const today = new Date().toISOString().split('T')[0];
  // Use date as seed for consistent daily challenge
  const seed = today.split('-').reduce((acc, val) => acc + parseInt(val), 0);
  const levelIndex = seed % LEVELS.length;
  const level = LEVELS[levelIndex];
  
  const challenges = [
    { title: 'Speed Run', description: 'Answer 5 questions in under 3 minutes', questionCount: 5, timeLimit: 180, bonusXP: 100 },
    { title: 'Precision Strike', description: 'Get 7/7 correct in this focused quiz', questionCount: 7, timeLimit: 420, bonusXP: 150 },
    { title: 'Gauntlet', description: 'Face 10 questions from all difficulties', questionCount: 10, timeLimit: 600, bonusXP: 200 },
    { title: 'Lightning Round', description: 'Quick-fire 3 questions, 30 seconds each', questionCount: 3, timeLimit: 90, bonusXP: 75 },
  ];
  
  const challenge = challenges[seed % challenges.length];
  
  return {
    id: `daily-${today}`,
    date: today,
    levelId: level.id,
    ...challenge,
  };
};

export function DailyChallenge() {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const [challenge] = useState<DailyChallengeData>(generateDailyChallenge);
  const [timeRemaining, setTimeRemaining] = useState('');
  
  const isCompleted = state.user?.dailyChallengeCompleted.includes(challenge.id);
  const level = LEVELS.find(l => l.id === challenge.levelId);
  
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const diff = tomorrow.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);
    return () => clearInterval(interval);
  }, []);
  
  const startChallenge = () => {
    const questions = getQuestionsByLevel(challenge.levelId).slice(0, challenge.questionCount);
    navigate(`/quiz/${challenge.levelId}?daily=${challenge.id}&timeLimit=${challenge.timeLimit}&bonusXP=${challenge.bonusXP}`);
  };
  
  return (
    <Card className="glow-card p-6 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Daily Challenge</h3>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Resets in {timeRemaining}</span>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{level?.emoji}</div>
            <div>
              <h4 className="font-semibold text-xl">{challenge.title}</h4>
              <p className="text-sm text-muted-foreground">{challenge.description}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Zap className="h-4 w-4 text-xp" />
              <span className="text-xp font-semibold">+{challenge.bonusXP} XP</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{Math.floor(challenge.timeLimit / 60)}:{(challenge.timeLimit % 60).toString().padStart(2, '0')}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">{challenge.questionCount} questions</span>
            </div>
          </div>
          
          {isCompleted ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
              <Trophy className="h-5 w-5 text-success" />
              <span className="text-success font-medium">Challenge Completed!</span>
            </div>
          ) : (
            <Button onClick={startChallenge} className="w-full btn-glow bg-gradient-to-r from-primary to-accent">
              <Flame className="mr-2 h-4 w-4" />
              Start Challenge
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default DailyChallenge;
