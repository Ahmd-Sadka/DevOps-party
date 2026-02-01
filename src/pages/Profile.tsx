import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BADGES, LEVELS, getXPForNextLevel, AVATARS } from '@/types/game';
import { useBadges } from '@/hooks/useBadges';
import { useEasterEggs } from '@/hooks/useEasterEggs';
import { ArrowLeft, Trophy, Target, Zap, Star, Flame, Award, BarChart3, Sparkles } from 'lucide-react';

const Profile = () => {
  const { state } = useGame();
  const navigate = useNavigate();
  const { getRarityColor, getRarityBorder } = useBadges();
  const { discoveredEggs, totalEggs } = useEasterEggs();
  const user = state.user;

  if (!user) {
    navigate('/');
    return null;
  }

  const avatar = AVATARS.find(a => a.id === user.avatarId);
  const xpProgress = getXPForNextLevel(user.totalXP);
  const completedLevels = LEVELS.filter(l => user.levelProgress[l.id]?.completed).length;
  const accuracy = user.stats.totalQuestionsAnswered > 0
    ? Math.round((user.stats.correctAnswers / user.stats.totalQuestionsAnswered) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Profile & Achievements</h1>
        </div>

        {/* Profile Card */}
        <Card className="glow-card p-6 mb-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl">
                {avatar?.emoji || '👤'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-xp text-xp-foreground px-2 py-1 rounded-full text-xs font-bold">
                Lvl {user.currentLevel}
              </div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{user.username}</h2>
              <p className="text-muted-foreground text-sm mb-3">{avatar?.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">XP Progress</span>
                  <span className="text-xp font-semibold">{user.totalXP} XP</span>
                </div>
                <Progress value={xpProgress.progress} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {xpProgress.current} / {xpProgress.required} to Level {user.currentLevel + 1}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <Zap className="h-6 w-6 text-xp mx-auto mb-2" />
            <p className="text-2xl font-bold">{user.totalXP}</p>
            <p className="text-xs text-muted-foreground">Total XP</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Target className="h-6 w-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
            <p className="text-2xl font-bold">{completedLevels}/{LEVELS.length}</p>
            <p className="text-xs text-muted-foreground">Levels Done</p>
          </Card>
          
          <Card className="p-4 text-center">
            <Flame className="h-6 w-6 text-streak mx-auto mb-2" />
            <p className="text-2xl font-bold">{user.streak.currentStreak}</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>
        </div>

        {/* Detailed Stats */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Statistics</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Questions Answered</p>
              <p className="text-xl font-bold">{user.stats.totalQuestionsAnswered}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Correct Answers</p>
              <p className="text-xl font-bold text-success">{user.stats.correctAnswers}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Bosses Defeated</p>
              <p className="text-xl font-bold text-primary">{user.stats.bossesDefeated}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Daily Challenges</p>
              <p className="text-xl font-bold text-accent">{user.stats.dailyChallengesCompleted}</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Longest Streak</p>
              <p className="text-xl font-bold text-streak">{user.streak.longestStreak} days</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/30">
              <p className="text-sm text-muted-foreground">Fastest Answer</p>
              <p className="text-xl font-bold">
                {user.stats.fastestAnswer === Infinity ? '-' : `${user.stats.fastestAnswer.toFixed(1)}s`}
              </p>
            </div>
          </div>
        </Card>

        {/* Badges Section */}
        <Card className="p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Badges</h3>
            <span className="ml-auto text-sm text-muted-foreground">
              {user.earnedBadges.length} / {BADGES.length}
            </span>
          </div>
          
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {BADGES.map((badge) => {
              const earned = user.earnedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`
                    p-3 rounded-xl border-2 text-center transition-all
                    ${earned
                      ? `${getRarityBorder(badge.rarity)} bg-card`
                      : 'border-border/30 bg-muted/20 opacity-40 grayscale'
                    }
                  `}
                  title={`${badge.name}: ${badge.description}`}
                >
                  <div className="text-3xl mb-1">{badge.emoji}</div>
                  <p className={`text-xs font-medium truncate ${earned ? getRarityColor(badge.rarity) : 'text-muted-foreground'}`}>
                    {badge.name}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Easter Eggs Section */}
        <Card className="p-6 mb-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h3 className="font-bold text-lg">Secret Discoveries</h3>
            <span className="ml-auto text-sm text-purple-400">
              {discoveredEggs.length} / {totalEggs}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['🎮', '🔍', '⚡', '🌙'].map((emoji, i) => {
              const discovered = i < discoveredEggs.length;
              return (
                <div
                  key={i}
                  className={`
                    p-4 rounded-xl text-center transition-all
                    ${discovered
                      ? 'bg-purple-500/20 border border-purple-500/40'
                      : 'bg-muted/20 border border-muted/30 opacity-40'
                    }
                  `}
                >
                  <div className={`text-3xl mb-1 ${discovered ? '' : 'grayscale'}`}>
                    {discovered ? emoji : '❓'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {discovered ? 'Discovered!' : 'Hidden'}
                  </p>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-muted-foreground text-center mt-4">
            💡 Hint: Try the Konami Code, check the console, or explore at midnight!
          </p>
        </Card>

        {/* Level Progress */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Star className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-lg">Level Progress</h3>
          </div>
          
          <div className="space-y-3">
            {LEVELS.map((level) => {
              const progress = user.levelProgress[level.id];
              const accuracy = progress.questionsAnswered > 0
                ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100)
                : 0;
              
              return (
                <div
                  key={level.id}
                  className={`p-3 rounded-lg ${progress?.unlocked ? 'bg-muted/30' : 'bg-muted/10 opacity-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{level.emoji}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{level.name}</p>
                        {progress?.completed && (
                          <span className="text-xs bg-success/20 text-success px-2 py-0.5 rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                        <span>{progress.questionsAnswered} answered</span>
                        <span>{accuracy}% accuracy</span>
                        <span>{progress.attempts} attempts</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

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

export default Profile;
