import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AVATARS, LEVELS, BADGES, getXPForNextLevel } from '@/types/game';
import { DailyChallenge } from './DailyChallenge';
import { PowerUpBar } from './PowerUps';
import { EasterEggNotification } from './EasterEggNotification';
import { useEasterEggs } from '@/hooks/useEasterEggs';
import { Map, Trophy, Flame, Target, Zap, Skull, User, Award, Sparkles, BookOpen, Lightbulb, Terminal, Settings } from 'lucide-react';

// Fun DevOps facts
const DEV_OPS_FACTS = [
  "The term 'DevOps' was coined in 2009 at the Velocity conference.",
  "AWS launched in 2006 with just S3, SQS, and EC2.",
  "Docker containers share the host OS kernel, making them lightweight.",
  "Git was created by Linus Torvalds in 2005.",
  "Kubernetes means 'helmsman' in Greek - the logo is a ship's wheel!",
  "Terraform was created by HashiCorp, same as Vault and Consul.",
  "The average DevOps salary exceeds $120,000 annually.",
  "Jenkins was named after butler character from Mr. Robot.",
  "Linux runs 100% of the TOP 500 supercomputers.",
  "GitHub processes millions of git operations daily.",
  "Ansible uses YAML for playbooks - no coding required!",
  "The first computer bug was an actual moth found in 1947.",
  "90% of cloud workloads still run on Linux.",
  "Git can track changes in any file, not just code!",
  "CI/CD stands for Continuous Integration/Continuous Deployment.",
];

// Secret achievements (hidden fun goals)
const SECRET_ACHIEVEMENTS = [
  { id: 'night-owl', condition: () => new Date().getHours() >= 23 || new Date().getHours() < 5, emoji: '🦉', name: 'Night Owl', text: 'Studying after midnight!' },
  { id: 'early-bird', condition: () => new Date().getHours() >= 5 && new Date().getHours() < 8, emoji: '🌅', name: 'Early Bird', text: 'Up before the sun!' },
  { id: 'weekend-warrior', condition: () => [0, 6].includes(new Date().getDay()), emoji: '🎮', name: 'Weekend Warrior', text: 'Practicing on the weekend!' },
];

const Dashboard = () => {
  const { state } = useGame();
  const navigate = useNavigate();
  const { handleClick, discoveredEggs, totalEggs } = useEasterEggs();
  const user = state.user!;
  const avatar = AVATARS.find(a => a.id === user.avatarId);
  const xpProgress = getXPForNextLevel(user.totalXP);
  
  const [dailyFact] = useState(() => DEV_OPS_FACTS[Math.floor(Math.random() * DEV_OPS_FACTS.length)]);
  const [activeSecret, setActiveSecret] = useState<{ emoji: string; name: string; text: string } | null>(null);
  const [showSecret, setShowSecret] = useState(false);

  // Check for secret achievements on mount
  useEffect(() => {
    const secret = SECRET_ACHIEVEMENTS.find(s => s.condition());
    if (secret) {
      setActiveSecret({ emoji: secret.emoji, name: secret.name, text: secret.text });
    }
  }, []);

  const motivationalMessages = [
    `You're on fire, ${user.username}! 🔥`,
    `Keep pushing, ${user.username}! 💪`,
    `Great progress, ${user.username}! 🚀`,
    `The terminal awaits, ${user.username}! 💻`,
    `Cloud native and coding! ☁️`,
  ];
  const message = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];

  const completedLevels = Object.values(user.levelProgress).filter(l => l.completed).length;
  const bossesDefeated = user.stats.bossesDefeated;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8" onClick={handleClick}>
      <EasterEggNotification 
        message={null}
        onClose={() => {}}
      />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div 
              className="text-5xl cursor-pointer hover:scale-110 transition-transform"
              onClick={() => navigate('/profile')}
            >
              {avatar?.emoji}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{user.username}</h1>
              <p className="text-muted-foreground text-sm">{message}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
              <Settings className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <User className="h-5 w-5" />
            </Button>
            <Button variant="outline" onClick={() => navigate('/leaderboard')}>
              <Trophy className="mr-2 h-4 w-4" />
              Leaderboard
            </Button>
          </div>
        </div>

        {/* Secret Achievement Popup */}
        {showSecret && activeSecret && (
          <div className="mb-6 p-4 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-xl border border-purple-500/30 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{activeSecret.emoji}</span>
              <div>
                <p className="font-bold text-sm">🔓 Secret Unlocked: {activeSecret.name}</p>
                <p className="text-sm text-muted-foreground">{activeSecret.text}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSecret(false)}>
              ✕
            </Button>
          </div>
        )}

        {/* Daily Fun Fact */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <Lightbulb className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-blue-500 uppercase">Daily DevOps Fact</span>
                <span className="text-xs text-muted-foreground">• Did you know?</span>
              </div>
              <p className="text-sm">{dailyFact}</p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-xp/20">
                <Zap className="h-5 w-5 text-xp" />
              </div>
              <div>
                <p className="text-2xl font-bold gradient-text-xp">{user.totalXP}</p>
                <p className="text-xs text-muted-foreground">Total XP</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.stats.averageAccuracy.toFixed(0)}%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-streak/20">
                <Flame className="h-5 w-5 text-streak animate-fire-flicker" />
              </div>
              <div>
                <p className="text-2xl font-bold">{user.streak.currentStreak}</p>
                <p className="text-xs text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-destructive/20">
                <Skull className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <p className="text-2xl font-bold">{bossesDefeated}</p>
                <p className="text-xs text-muted-foreground">Bosses Slain</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Power-ups Bar */}
        <Card className="p-4 mb-6 bg-card border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold">Your Power-ups</span>
            </div>
            <PowerUpBar disabled />
          </div>
        </Card>

        {/* Level Progress */}
        <Card className="p-6 mb-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">Level {user.currentLevel}</h2>
              <p className="text-sm text-muted-foreground">
                {xpProgress.current} / {xpProgress.required} XP to next level
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">{completedLevels}/{LEVELS.length} worlds completed</p>
            </div>
          </div>
          <Progress value={xpProgress.progress} className="h-3" />
        </Card>

        {/* Main Grid - Daily Challenge + Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <DailyChallenge />
          
          <div className="space-y-4">
            <Button 
              size="lg" 
              className="w-full h-16 text-lg btn-glow"
              onClick={() => navigate('/levels')}
            >
              <Map className="mr-3 h-6 w-6" />
              Continue Learning
            </Button>
            
            <Button 
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg border-green-500/50 hover:bg-green-500/10"
              onClick={() => navigate('/terminal')}
            >
              <Terminal className="mr-3 h-6 w-6 text-green-400" />
              Terminal Challenge
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg border-destructive/50 hover:bg-destructive/10"
              onClick={() => navigate('/boss')}
            >
              <Skull className="mr-3 h-6 w-6 text-destructive" />
              Boss Battle Arena
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg border-primary/50 hover:bg-primary/10"
              onClick={() => navigate('/interview')}
            >
              <BookOpen className="mr-3 h-6 w-6 text-primary" />
              Interview Prep
            </Button>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                variant="outline"
                className="h-12"
                onClick={() => navigate('/profile')}
              >
                <Award className="mr-2 h-4 w-4" />
                Achievements
              </Button>
              
              <Button 
                variant="outline"
                className="h-12"
                onClick={() => navigate('/leaderboard')}
              >
                <Trophy className="mr-2 h-4 w-4" />
                Rankings
              </Button>
            </div>
          </div>
        </div>

        {/* Badges Preview */}
        <Card className="p-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Badges</h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>
              View All ({user.earnedBadges.length}/{BADGES.length})
            </Button>
          </div>
          <div className="flex flex-wrap gap-3">
            {BADGES.slice(0, 8).map((badge) => {
              const earned = user.earnedBadges.includes(badge.id);
              return (
                <div
                  key={badge.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    earned 
                      ? 'bg-primary/10 border-primary/30 hover:scale-105' 
                      : 'bg-muted/30 border-border opacity-40 grayscale'
                  }`}
                  title={`${badge.name}: ${badge.description}`}
                >
                  <span className="text-xl">{badge.emoji}</span>
                  <span className="text-sm font-medium">{badge.name}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
