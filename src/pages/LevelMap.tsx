import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LEVELS } from '@/types/game';
import { ArrowLeft, Lock, Check, Play, BookOpen } from 'lucide-react';
import { getStudyContentForLevel } from '@/data/study-cards';

const LevelMap = () => {
  const { state } = useGame();
  const navigate = useNavigate();
  const user = state.user;

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">World Map</h1>
            <p className="text-muted-foreground">Choose your next challenge</p>
          </div>
        </div>

        {/* Level Cards (exclude interview-only level) */}
        <div className="space-y-4">
          {LEVELS.filter((l) => l.id !== 'junior-interview').map((level, index) => {
            const progress = user.levelProgress[level.id];
            const isUnlocked = progress?.unlocked;
            const isCompleted = progress?.completed;
            
            return (
              <Card 
                key={level.id}
                className={`p-6 transition-all duration-300 ${
                  isUnlocked 
                    ? 'bg-card border-border hover:border-primary/50 cursor-pointer' 
                    : 'bg-muted/30 border-border opacity-60'
                } ${isCompleted ? 'border-success/50' : ''}`}
                onClick={() => isUnlocked && navigate(`/quiz/${level.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-5xl ${!isUnlocked ? 'grayscale' : ''}`}>
                    {level.emoji}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold">{level.name}</h2>
                      {isCompleted && <Check className="h-5 w-5 text-success" />}
                      {!isUnlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{level.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{level.totalQuestions} questions</span>
                      {progress && progress.attempts > 0 && (
                        <span>Best: {Math.round((progress.correctAnswers / progress.questionsAnswered) * 100 || 0)}%</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    {isUnlocked ? (
                      <>
                        <Button className="btn-glow" onClick={(e) => { e.stopPropagation(); navigate(`/quiz/${level.id}`); }}>
                          <Play className="mr-2 h-4 w-4" />
                          {isCompleted ? 'Replay' : 'Start'}
                        </Button>
                        {getStudyContentForLevel(level.id).length > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={(e) => { e.stopPropagation(); navigate(`/study/${level.id}`); }}
                          >
                            <BookOpen className="mr-1 h-3 w-3" />
                            Study First
                          </Button>
                        )}
                      </>
                    ) : (
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Requires</p>
                        <p className="text-sm font-semibold text-xp">{level.unlockRequirement} XP</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Back button */}
        <div className="mt-8 text-center">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LevelMap;
