import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AVATARS, LEVELS, BADGES, getXPForNextLevel, calculateLevel } from '@/types/game';
import { DailyChallenge } from './DailyChallenge';
import { PowerUpBar } from './PowerUps';
import { EasterEggNotification } from './EasterEggNotification';
import { useEasterEggs } from '@/hooks/useEasterEggs';
import { Map, Trophy, Flame, Target, Zap, Skull, User, Award, Sparkles, BookOpen, Lightbulb, Terminal, Settings, Heart, RotateCcw, Bookmark, GraduationCap, Share2 } from 'lucide-react';

// Fun DevOps facts
interface DailyTip {
  tip: string;
  code?: string;
  category: string;
  tryItLink?: string;
}

const DAILY_TIPS: DailyTip[] = [
  { tip: 'Use `kubectl get events --sort-by=.lastTimestamp` to debug pod issues. Events show scheduling failures, image pull errors, and OOM kills.', code: 'kubectl get events --sort-by=.lastTimestamp', category: 'Kubernetes', tryItLink: '/terminal' },
  { tip: 'Docker layer caching: put COPY package.json BEFORE RUN npm install in your Dockerfile. Any code change won\'t re-download all dependencies.', code: 'COPY package*.json ./\nRUN npm ci\nCOPY . .', category: 'Docker', tryItLink: '/study/docker' },
  { tip: 'Use `set -euo pipefail` at the top of every bash script. It catches errors, undefined variables, and pipe failures.', code: '#!/bin/bash\nset -euo pipefail', category: 'Bash', tryItLink: '/terminal' },
  { tip: 'Never use `chmod 777` in production. Use `chmod 755` for directories, `chmod 644` for files, and `chmod 600` for secrets.', code: 'chmod 755 /app\nchmod 644 config.yml\nchmod 600 secret.key', category: 'Linux', tryItLink: '/study/linux' },
  { tip: '`git stash push -m "WIP: feature"` names your stash. Never lose track of stashed work again.', code: 'git stash push -m "WIP: login feature"\ngit stash list', category: 'Git', tryItLink: '/terminal' },
  { tip: 'Terraform `plan -out=tfplan` saves the plan. Then `apply tfplan` executes exactly what you reviewed. No surprises in production.', code: 'terraform plan -out=tfplan\nterraform apply tfplan', category: 'Terraform', tryItLink: '/study/terraform' },
  { tip: 'Use `docker system prune -a --volumes` to reclaim disk space from unused containers, images, and volumes. Warning: it\'s thorough!', code: 'docker system prune -a --volumes', category: 'Docker', tryItLink: '/terminal' },
  { tip: 'Kubernetes Secrets are base64-encoded, NOT encrypted. Always enable encryption at rest and consider external secret managers.', code: 'echo "secret" | base64  # NOT encryption!', category: 'Kubernetes', tryItLink: '/study/kubernetes' },
  { tip: 'Use `ansible-playbook --check --diff` for dry runs. It shows what WOULD change without actually changing anything.', code: 'ansible-playbook site.yml --check --diff', category: 'Ansible', tryItLink: '/study/ansible' },
  { tip: '`curl -sS -o /dev/null -w "%{http_code}"` silently checks if a URL is responding. Perfect for health checks in scripts.', code: 'curl -sS -o /dev/null -w "%{http_code}" https://api.example.com/health', category: 'Linux', tryItLink: '/terminal' },
  { tip: 'AWS: always use `--profile` and `--region` flags explicitly. Avoid depending on defaults in scripts and CI/CD pipelines.', code: 'aws s3 ls --profile prod --region us-east-1', category: 'AWS', tryItLink: '/study/aws' },
  { tip: 'Use `kubectl rollout undo deployment/myapp` to instantly roll back to the previous version. Fastest way to fix a bad deploy.', code: 'kubectl rollout undo deployment/myapp\nkubectl rollout status deployment/myapp', category: 'Kubernetes', tryItLink: '/terminal' },
  { tip: '`journalctl -u nginx -f --since "5 minutes ago"` follows live logs filtered by service and time. Essential for debugging.', code: 'journalctl -u nginx -f --since "5 min ago"', category: 'Linux', tryItLink: '/terminal' },
  { tip: 'Git: use `git bisect` to find which commit introduced a bug. It does a binary search through your commit history.', code: 'git bisect start\ngit bisect bad HEAD\ngit bisect good v1.0.0', category: 'Git', tryItLink: '/study/git' },
  { tip: 'In CI/CD, cache your dependencies! GitHub Actions: `actions/cache`. This can cut pipeline time by 50% or more.', code: '- uses: actions/cache@v3\n  with:\n    path: node_modules\n    key: ${{ hashFiles(\'package-lock.json\') }}', category: 'CI/CD', tryItLink: '/study/cicd' },
  { tip: 'Never use `:latest` tag in production Dockerfiles or K8s manifests. Always pin specific versions for reproducibility.', code: 'image: nginx:1.25.3  # Good\nimage: nginx:latest   # Bad', category: 'Docker', tryItLink: '/study/docker' },
  { tip: '`truncate -s 0 /var/log/big.log` empties a file without deleting it. If you `rm` a file held by a process, disk space is NOT freed!', code: 'truncate -s 0 /var/log/app/big.log', category: 'Linux', tryItLink: '/terminal' },
  { tip: 'Terraform: use `terraform state list` and `terraform state show` to inspect your managed resources without touching the cloud.', code: 'terraform state list\nterraform state show aws_instance.web', category: 'Terraform', tryItLink: '/study/terraform' },
  { tip: 'Docker Compose: use `depends_on` with health checks to ensure databases are ready before your app starts.', code: 'depends_on:\n  db:\n    condition: service_healthy', category: 'Docker', tryItLink: '/study/docker' },
  { tip: 'Ansible tip: use `ansible-vault` to encrypt sensitive vars. Never commit plaintext passwords to Git!', code: 'ansible-vault encrypt group_vars/production/secrets.yml', category: 'Ansible', tryItLink: '/study/ansible' },
];

// Fun rank titles based on XP thresholds
const RANK_TITLES = [
  { minXP: 0, title: 'Script Kiddie', emoji: '👶' },
  { minXP: 100, title: 'Config Wrangler', emoji: '🤠' },
  { minXP: 300, title: 'YAML Whisperer', emoji: '🧙' },
  { minXP: 600, title: 'Container Tamer', emoji: '🐳' },
  { minXP: 1000, title: 'Pipeline Architect', emoji: '🏗️' },
  { minXP: 1500, title: 'Cluster Commander', emoji: '⚔️' },
  { minXP: 2500, title: 'Infrastructure Overlord', emoji: '👑' },
  { minXP: 4000, title: 'Cloud Deity', emoji: '⛈️' },
  { minXP: 6000, title: 'DevOps Demigod', emoji: '🔱' },
  { minXP: 10000, title: 'The SRE Supreme', emoji: '🌟' },
];

const getRankTitle = (xp: number) => {
  const rank = [...RANK_TITLES].reverse().find(r => xp >= r.minXP);
  return rank || RANK_TITLES[0];
};

const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 6) return 'Burning the midnight oil? ';
  if (hour < 12) return 'Good morning! ';
  if (hour < 17) return 'Good afternoon! ';
  if (hour < 21) return 'Good evening! ';
  return 'Late night session? ';
};

// Secret achievements (hidden fun goals)
const SECRET_ACHIEVEMENTS = [
  { id: 'night-owl', condition: () => new Date().getHours() >= 23 || new Date().getHours() < 5, emoji: '🦉', name: 'Night Owl', text: 'Studying after midnight! The on-call team respects your dedication.' },
  { id: 'early-bird', condition: () => new Date().getHours() >= 5 && new Date().getHours() < 8, emoji: '🌅', name: 'Early Bird', text: 'Up before the cron jobs! That\'s true commitment.' },
  { id: 'weekend-warrior', condition: () => [0, 6].includes(new Date().getDay()), emoji: '🎮', name: 'Weekend Warrior', text: 'Practicing on the weekend! Even Kubernetes takes Sundays off.' },
  { id: 'friday-deployer', condition: () => new Date().getDay() === 5, emoji: '💀', name: 'Friday Deployer', text: 'Studying on a Friday? Brave. Never deploy on Fridays though.' },
  { id: 'lunch-learner', condition: () => { const h = new Date().getHours(); return h >= 12 && h < 14; }, emoji: '🍕', name: 'Lunch Learner', text: 'Learning over lunch! Your career is the main course.' },
];

const Dashboard = () => {
  const { state } = useGame();
  const navigate = useNavigate();
  const { handleClick, discoveredEggs, totalEggs } = useEasterEggs();
  const user = state.user!;
  const avatar = AVATARS.find(a => a.id === user.avatarId);
  const xpProgress = getXPForNextLevel(user.totalXP);
  
  const [dailyTip] = useState(() => {
    // Use day of year as seed for consistency within a day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    return DAILY_TIPS[dayOfYear % DAILY_TIPS.length];
  });
  const [showTipCode, setShowTipCode] = useState(false);
  const [activeSecret, setActiveSecret] = useState<{ emoji: string; name: string; text: string } | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const rank = getRankTitle(user.totalXP);
  const timeGreeting = getTimeGreeting();

  // Check for secret achievements on mount
  useEffect(() => {
    const secret = SECRET_ACHIEVEMENTS.find(s => s.condition());
    if (secret) {
      setActiveSecret({ emoji: secret.emoji, name: secret.name, text: secret.text });
    }
  }, []);

  const motivationalMessages = [
    `You're on fire, ${user.username}! Production is safe... for now 🔥`,
    `Keep pushing, ${user.username}! Your kubectl skills are leveling up 💪`,
    `Great progress, ${user.username}! Even Kubernetes is impressed 🚀`,
    `The terminal awaits, ${user.username}! sudo make-me-proud 💻`,
    `Cloud native and crushing it! ☁️`,
    `${user.username}, the CI/CD pipeline believes in you! 🟢`,
    `Deploying knowledge to brain:latest, ${user.username}! 🧠`,
    `${user.username}'s uptime: 99.99% and counting! ⏱️`,
    `Hey ${user.username}, your git log of wins keeps growing! 📈`,
    `${user.username} is in the zone! Don't disturb the deployment! 🎯`,
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
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{user.username}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30 font-medium">
                  {rank.emoji} {rank.title}
                </span>
              </div>
              <p className="text-muted-foreground text-sm">{timeGreeting}{message}</p>
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

        {/* Daily Tip of the Day */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 shrink-0">
              <Lightbulb className="h-5 w-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-blue-500 uppercase">Tip of the Day</span>
                <span className="text-xs text-muted-foreground">• {dailyTip.category}</span>
              </div>
              <p className="text-sm mb-2">{dailyTip.tip}</p>
              {dailyTip.code && (
                <div>
                  <button
                    onClick={() => setShowTipCode(!showTipCode)}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors mb-1"
                  >
                    {showTipCode ? '▾ Hide code' : '▸ Show code'}
                  </button>
                  {showTipCode && (
                    <pre className="text-xs font-mono bg-muted p-2 rounded overflow-x-auto">
                      {dailyTip.code}
                    </pre>
                  )}
                </div>
              )}
              {dailyTip.tryItLink && (
                <button
                  onClick={() => navigate(dailyTip.tryItLink!)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                >
                  Try it →
                </button>
              )}
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

        {/* Fun Stats Banner */}
        <Card className="p-4 mb-6 bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-orange-500/5 border-purple-500/20">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>Questions Answered: <strong className="text-foreground">{user.stats.totalAnswered}</strong></span>
              <span className="hidden md:inline">|</span>
              <span>Best Streak: <strong className="text-streak">{user.stats.bestStreak}</strong></span>
              <span className="hidden md:inline">|</span>
              <span>
                {user.stats.averageAccuracy >= 90 ? 'Accuracy God-Tier' :
                 user.stats.averageAccuracy >= 70 ? 'Solid performer' :
                 user.stats.averageAccuracy >= 50 ? 'Getting warmer...' :
                 'Room for growth!'}
              </span>
            </div>
            <span className="text-xs italic text-muted-foreground/60">
              {user.totalXP > 5000 ? '"With great kubectl comes great responsibility"' :
               user.totalXP > 2000 ? '"The cloud is your oyster"' :
               user.totalXP > 500 ? '"Every expert was once a beginner"' :
               '"sudo make me a sandwich"'}
            </span>
          </div>
        </Card>

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
              <h2 className="text-lg font-semibold">Level {calculateLevel(user.totalXP)}</h2>
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
            
            {/* Review Mistakes */}
            {user.wrongQuestionIds && user.wrongQuestionIds.length > 0 && (
              <Button 
                size="lg"
                variant="outline"
                className="w-full h-16 text-lg border-orange-500/50 hover:bg-orange-500/10"
                onClick={() => navigate('/review')}
              >
                <RotateCcw className="mr-3 h-6 w-6 text-orange-400" />
                Review Mistakes
                <span className="ml-auto text-sm bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">
                  {user.wrongQuestionIds.length}
                </span>
              </Button>
            )}

            {/* Bookmarked Questions */}
            {user.bookmarkedQuestionIds && user.bookmarkedQuestionIds.length > 0 && (
              <Button 
                size="lg"
                variant="outline"
                className="w-full h-16 text-lg border-blue-500/50 hover:bg-blue-500/10"
                onClick={() => navigate('/review?mode=bookmarks')}
              >
                <Bookmark className="mr-3 h-6 w-6 text-blue-400" />
                Bookmarked Questions
                <span className="ml-auto text-sm bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">
                  {user.bookmarkedQuestionIds.length}
                </span>
              </Button>
            )}

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
              className="w-full h-16 text-lg border-red-500/50 hover:bg-red-500/10"
              onClick={() => navigate('/survival')}
            >
              <Heart className="mr-3 h-6 w-6 text-red-500" />
              Survival Mode
            </Button>

            <Button 
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg border-cyan-500/50 hover:bg-cyan-500/10"
              onClick={() => navigate('/cheatsheet')}
            >
              <GraduationCap className="mr-3 h-6 w-6 text-cyan-400" />
              Command Cheat Sheet
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

            <Button 
              size="lg"
              variant="outline"
              className="w-full h-16 text-lg border-pink-500/50 hover:bg-pink-500/10"
              onClick={() => navigate('/challenge')}
            >
              <Share2 className="mr-3 h-6 w-6 text-pink-400" />
              Challenge a Friend
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
        <Card className="p-6 bg-card border-border mb-6">
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

        {/* Easter Eggs Counter + Fun Footer */}
        <div className="text-center text-xs text-muted-foreground/40 py-4 space-y-1">
          {discoveredEggs > 0 && (
            <p className="text-primary/40">Hidden Easter Eggs Found: {discoveredEggs}/{totalEggs} - Keep clicking around!</p>
          )}
          <p className="italic">
            "No servers were harmed in the making of this quiz game. Containers, however..."
          </p>
          <p>
            DevOps Party v1.0 | Built with React + TypeScript + Tears of On-Call Engineers
          </p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
