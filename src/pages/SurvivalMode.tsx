import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { getQuizQuestions } from '@/data/questions';
import { Question, LEVELS, LevelId, Difficulty, AVATARS } from '@/types/game';
import { ArrowLeft, Heart, Flame, Zap, Skull, Trophy, Star, Shield, Timer, Crown, Medal, TrendingUp } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useConfetti } from '@/hooks/useConfetti';

const DIFFICULTY_PROGRESSION: Difficulty[] = ['easy', 'easy', 'medium', 'medium', 'medium', 'hard', 'hard', 'evil'];
const LEVEL_IDS: LevelId[] = ['linux', 'bash', 'git', 'docker', 'ansible', 'kubernetes', 'terraform', 'aws', 'cicd', 'openshift', 'devops'];

const DIFFICULTY_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  easy: { label: 'Easy', color: 'text-green-500 bg-green-500/10 border-green-500/30', emoji: '🟢' },
  medium: { label: 'Medium', color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30', emoji: '🟡' },
  hard: { label: 'Hard', color: 'text-orange-500 bg-orange-500/10 border-orange-500/30', emoji: '🟠' },
  evil: { label: 'Evil', color: 'text-red-500 bg-red-500/10 border-red-500/30', emoji: '😈' },
};

// Mock survival leaderboard
const survivalLeaderboard = [
  { id: '1', username: 'Ahmed Mohamedy', avatarId: 'fire', score: 4280, waves: 47, bestCombo: 18 },
  { id: '2', username: 'DevMaster', avatarId: 'wizard', score: 3150, waves: 38, bestCombo: 14 },
  { id: '3', username: 'TerminalNinja', avatarId: 'ninja', score: 2890, waves: 34, bestCombo: 12 },
  { id: '4', username: 'DockerWhale', avatarId: 'whale', score: 2450, waves: 29, bestCombo: 11 },
  { id: '5', username: 'GitGuru', avatarId: 'brain', score: 2100, waves: 25, bestCombo: 9 },
  { id: '6', username: 'BashKing', avatarId: 'fire', score: 1820, waves: 22, bestCombo: 8 },
  { id: '7', username: 'LinuxLord', avatarId: 'penguin', score: 1540, waves: 19, bestCombo: 7 },
  { id: '8', username: 'CloudRunner', avatarId: 'rocket', score: 1280, waves: 16, bestCombo: 6 },
  { id: '9', username: 'PipelineProz', avatarId: 'robot', score: 950, waves: 12, bestCombo: 5 },
  { id: '10', username: 'KubeKnight', avatarId: 'shield', score: 720, waves: 9, bestCombo: 4 },
];

const getRandomQuestion = (difficultyIndex: number): Question | null => {
  const difficulty = DIFFICULTY_PROGRESSION[Math.min(difficultyIndex, DIFFICULTY_PROGRESSION.length - 1)];
  const levelId = LEVEL_IDS[Math.floor(Math.random() * LEVEL_IDS.length)];
  const questions = getQuizQuestions(levelId, 20);
  const filtered = questions.filter(q => q.difficulty === difficulty);
  if (filtered.length > 0) return filtered[Math.floor(Math.random() * filtered.length)];
  return questions[Math.floor(Math.random() * questions.length)] || null;
};

const SurvivalMode = () => {
  const navigate = useNavigate();
  const { state, addXP } = useGame();
  const { playSound } = useSoundEffects();
  const { burstConfetti, sidesConfetti } = useConfetti();
  const user = state.user;

  const [phase, setPhase] = useState<'intro' | 'playing' | 'gameover' | 'leaderboard'>('intro');
  const [lives, setLives] = useState(3);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [wave, setWave] = useState(1);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [usedQuestionIds, setUsedQuestionIds] = useState<Set<string>>(new Set());
  const [shakeLife, setShakeLife] = useState(false);
  const [questionTimer, setQuestionTimer] = useState(30);
  const [totalTime, setTotalTime] = useState(0);
  const [showDifficultyBanner, setShowDifficultyBanner] = useState<string | null>(null);
  const [previousDifficulty, setPreviousDifficulty] = useState<string>('easy');
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('devops-survival-highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Question timer countdown
  useEffect(() => {
    if (phase === 'playing' && !showResult && currentQuestion) {
      const timer = setInterval(() => {
        setQuestionTimer(prev => {
          if (prev <= 1) {
            // Time's up — treat as wrong
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, showResult, currentQuestion]);

  // Total timer
  useEffect(() => {
    if (phase === 'playing') {
      const timer = setInterval(() => setTotalTime(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  const handleTimeUp = () => {
    if (showResult || !currentQuestion) return;
    playSound('wrong');
    setCombo(0);
    setShowResult(true);
    setSelectedAnswer(-1);
    const newLives = lives - 1;
    setLives(newLives);
    setShakeLife(true);
    setTimeout(() => setShakeLife(false), 600);

    if (newLives <= 0) {
      setTimeout(() => endGame(), 1500);
    } else {
      setTimeout(() => {
        setWave(prev => prev + 1);
        setCurrentQuestion(null);
      }, 1800);
    }
  };

  const loadNextQuestion = useCallback(() => {
    const difficultyIndex = Math.floor((wave - 1) / 3);
    const currentDiff = DIFFICULTY_PROGRESSION[Math.min(difficultyIndex, DIFFICULTY_PROGRESSION.length - 1)];
    
    // Show difficulty transition banner
    if (currentDiff !== previousDifficulty) {
      setPreviousDifficulty(currentDiff);
      setShowDifficultyBanner(currentDiff);
      setTimeout(() => setShowDifficultyBanner(null), 2000);
    }

    let attempts = 0;
    let q: Question | null = null;
    while (attempts < 30) {
      q = getRandomQuestion(difficultyIndex);
      if (q && !usedQuestionIds.has(q.id)) break;
      attempts++;
    }
    if (q) {
      setUsedQuestionIds(prev => new Set(prev).add(q!.id));
      setCurrentQuestion(q);
      setSelectedAnswer(null);
      setShowResult(false);
      // Timer scales with difficulty
      const baseTime = currentDiff === 'easy' ? 30 : currentDiff === 'medium' ? 25 : currentDiff === 'hard' ? 20 : 15;
      setQuestionTimer(baseTime);
    }
  }, [wave, usedQuestionIds, previousDifficulty]);

  const startGame = () => {
    setLives(3);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setWave(1);
    setTotalXPEarned(0);
    setTotalTime(0);
    setUsedQuestionIds(new Set());
    setPreviousDifficulty('easy');
    setPhase('playing');
  };

  useEffect(() => {
    if (phase === 'playing' && !currentQuestion) {
      loadNextQuestion();
    }
  }, [phase, currentQuestion, loadNextQuestion]);

  const endGame = () => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('devops-survival-highscore', String(score));
      burstConfetti();
    }
    setPhase('gameover');
  };

  const handleAnswer = (index: number) => {
    if (showResult || !currentQuestion) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      playSound('correct');
      const newCombo = combo + 1;
      setCombo(newCombo);
      if (newCombo > bestCombo) setBestCombo(newCombo);
      
      const comboMultiplier = Math.min(1 + (newCombo - 1) * 0.25, 3);
      // Bonus for fast answers
      const speedBonus = questionTimer > 20 ? 1.2 : questionTimer > 10 ? 1.0 : 0.8;
      const baseXP = currentQuestion.xpReward;
      const earnedXP = Math.round(baseXP * comboMultiplier * speedBonus);
      
      setScore(prev => prev + earnedXP);
      setTotalXPEarned(prev => prev + earnedXP);
      addXP(earnedXP);

      if (newCombo >= 5 && newCombo % 5 === 0) sidesConfetti();
    } else {
      playSound('wrong');
      setCombo(0);
      const newLives = lives - 1;
      setLives(newLives);
      setShakeLife(true);
      setTimeout(() => setShakeLife(false), 600);

      if (newLives <= 0) {
        setTimeout(() => endGame(), 1500);
        return;
      }
    }

    setTimeout(() => {
      setWave(prev => prev + 1);
      setCurrentQuestion(null);
    }, 1800);
  };

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (!user) {
    navigate('/');
    return null;
  }

  // LEADERBOARD VIEW
  if (phase === 'leaderboard') {
    const getRankIcon = (rank: number) => {
      if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
      if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
      if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
      return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
    };

    // Find user's rank
    const userRank = survivalLeaderboard.findIndex(e => e.score < (highScore || 0)) + 1 || survivalLeaderboard.length + 1;

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => setPhase('intro')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Skull className="h-6 w-6 text-red-500" /> Survival Leaderboard
              </h1>
              <p className="text-muted-foreground text-sm">Top survivors ranked by score</p>
            </div>
          </div>

          {/* User's rank */}
          {highScore > 0 && (
            <Card className="p-4 mb-6 bg-primary/10 border-primary/30">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{AVATARS.find(a => a.id === user.avatarId)?.emoji}</div>
                <div className="flex-1">
                  <p className="font-semibold">{user.username} (You)</p>
                  <p className="text-sm text-muted-foreground">High Score: {highScore} XP</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Your Rank</p>
                  <p className="text-xl font-bold">#{userRank}</p>
                </div>
              </div>
            </Card>
          )}

          {/* Leaderboard list */}
          <div className="space-y-3">
            {survivalLeaderboard.map((entry, index) => {
              const avatar = AVATARS.find(a => a.id === entry.avatarId);
              const rank = index + 1;
              return (
                <Card
                  key={entry.id}
                  className={`p-4 ${rank <= 3 ? 'border-l-4' : ''} ${
                    rank === 1 ? 'border-l-yellow-500' :
                    rank === 2 ? 'border-l-gray-400' :
                    rank === 3 ? 'border-l-amber-600' : ''
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 flex justify-center">{getRankIcon(rank)}</div>
                    <div className="text-2xl">{avatar?.emoji}</div>
                    <div className="flex-1">
                      <p className="font-semibold">{entry.username}</p>
                      <p className="text-xs text-muted-foreground">
                        {entry.waves} waves • {entry.bestCombo}x best combo
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-500">{entry.score.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">XP</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="mt-8 flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setPhase('intro')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700" onClick={startGame}>
              <Skull className="mr-2 h-4 w-4" /> Play Now
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // INTRO
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full p-8 text-center border-destructive/30 bg-gradient-to-b from-background to-destructive/5">
          <div className="text-7xl mb-4">💀</div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            Survival Mode
          </h1>
          <p className="text-muted-foreground mb-2">
            Endless questions. 3 lives. Ticking clock. No mercy.
          </p>
          <p className="text-xs text-muted-foreground/60 italic mb-6">
            "I used to be a junior developer like you, until I took an OOMKill to the pod"
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <Heart className="h-5 w-5 text-red-500 mx-auto mb-1" />
              <p className="text-xs font-medium">3 Lives</p>
              <p className="text-xs text-muted-foreground">Wrong = lose one</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <Flame className="h-5 w-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xs font-medium">Combo XP</p>
              <p className="text-xs text-muted-foreground">Streak = multiplier</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <Timer className="h-5 w-5 text-blue-500 mx-auto mb-1" />
              <p className="text-xs font-medium">Time Pressure</p>
              <p className="text-xs text-muted-foreground">Timer gets shorter</p>
            </div>
            <div className="p-3 rounded-xl bg-muted/30 border border-border">
              <Skull className="h-5 w-5 text-purple-500 mx-auto mb-1" />
              <p className="text-xs font-medium">Escalating</p>
              <p className="text-xs text-muted-foreground">Gets harder fast</p>
            </div>
          </div>

          {highScore > 0 && (
            <div className="mb-6 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
              <div className="flex items-center justify-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-bold text-yellow-500">Your Best: {highScore} XP</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button size="lg" className="w-full h-14 text-lg bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700" onClick={startGame}>
              <Skull className="mr-2 h-5 w-5" />
              Enter the Gauntlet
            </Button>

            <Button variant="outline" className="w-full" onClick={() => setPhase('leaderboard')}>
              <Trophy className="mr-2 h-4 w-4" /> Survival Leaderboard
            </Button>

            <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Safety
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // GAME OVER
  if (phase === 'gameover') {
    const isNewHighScore = score >= highScore && score > 0;
    const gameOverQuote = wave >= 30 ? '"You are the one. The chosen SRE."' :
                          wave >= 20 ? '"Impressive. Most senior engineers couldn\'t survive that long."' :
                          wave >= 10 ? '"Not bad! Your on-call shifts would be... survivable."' :
                          wave >= 5 ? '"You have potential. Keep studying, young padawan."' :
                          '"The CI/CD pipeline has rejected your deployment. Try again!"';
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-lg w-full p-8 text-center">
          <div className="text-7xl mb-4">{isNewHighScore ? '🏆' : '💀'}</div>
          <h1 className="text-3xl font-bold mb-2">
            {isNewHighScore ? 'New High Score!' : 'Game Over'}
          </h1>
          <p className="text-muted-foreground mb-2">
            You survived {wave - 1} waves in {formatTime(totalTime)}
          </p>
          <p className="text-xs text-muted-foreground/60 italic mb-6">{gameOverQuote}</p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 rounded-xl bg-muted/30">
              <Zap className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{score}</p>
              <p className="text-xs text-muted-foreground">Total Score</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{bestCombo}x</p>
              <p className="text-xs text-muted-foreground">Best Combo</p>
            </div>
            <div className="p-4 rounded-xl bg-muted/30">
              <Star className="h-6 w-6 text-purple-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{wave - 1}</p>
              <p className="text-xs text-muted-foreground">Waves Survived</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20">
              <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <p className="text-2xl font-bold">{highScore}</p>
              <p className="text-xs text-muted-foreground">High Score</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button size="lg" className="w-full h-12 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700" onClick={startGame}>
              Try Again
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setPhase('leaderboard')}>
              <Trophy className="mr-2 h-4 w-4" /> Survival Leaderboard
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // PLAYING
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Skull className="h-12 w-12 text-destructive mx-auto animate-pulse mb-4" />
          <p className="text-lg font-medium">Loading next wave...</p>
        </div>
      </div>
    );
  }

  // Difficulty transition banner
  if (showDifficultyBanner) {
    const diffInfo = DIFFICULTY_LABELS[showDifficultyBanner];
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center animate-in zoom-in duration-500">
          <div className="text-7xl mb-4">{diffInfo.emoji}</div>
          <h2 className="text-4xl font-bold mb-2">{diffInfo.label} Mode</h2>
          <p className="text-muted-foreground">Difficulty increasing...</p>
        </div>
      </div>
    );
  }

  const comboMultiplier = Math.min(1 + combo * 0.25, 3);
  const diffInfo = DIFFICULTY_LABELS[currentQuestion.difficulty] || DIFFICULTY_LABELS.easy;
  const timerPercent = (questionTimer / 30) * 100;
  const timerColor = questionTimer <= 5 ? 'bg-red-500' : questionTimer <= 10 ? 'bg-yellow-500' : 'bg-primary';

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* HUD */}
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1 ${shakeLife ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}>
              {[...Array(3)].map((_, i) => (
                <Heart key={i} className={`h-5 w-5 transition-all duration-300 ${i < lives ? 'text-red-500 fill-red-500' : 'text-muted-foreground/30'}`} />
              ))}
            </div>

            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/30">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-bold text-sm">{score}</span>
            </div>

            <div className="px-3 py-1 rounded-full bg-muted/50 border border-border">
              <span className="text-xs font-medium">Wave {wave}</span>
            </div>

            <Badge variant="outline" className={`${diffInfo.color} text-xs`}>
              {diffInfo.emoji} {diffInfo.label}
            </Badge>
          </div>
        </div>

        {/* Timer bar */}
        <div className="mb-4 h-2 rounded-full bg-muted overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-1000 ${timerColor}`} style={{ width: `${timerPercent}%` }} />
        </div>
        <div className="flex justify-between items-center mb-4">
          <span className={`text-xs font-mono ${questionTimer <= 5 ? 'text-red-500 animate-pulse font-bold' : 'text-muted-foreground'}`}>
            ⏱ {questionTimer}s
          </span>
          <span className="text-xs text-muted-foreground font-mono">{formatTime(totalTime)}</span>
        </div>

        {/* Combo Bar */}
        {combo > 0 && (
          <div className="mb-4 p-2 rounded-lg bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-bold">{combo}x Combo!</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-orange-400">Multiplier: {comboMultiplier.toFixed(2)}x</span>
              {combo >= 5 && <TrendingUp className="h-4 w-4 text-orange-500" />}
            </div>
          </div>
        )}

        {/* Question */}
        <Card className={`p-6 mb-4 transition-all duration-300 ${
          showResult && selectedAnswer === currentQuestion.correctAnswer 
            ? 'border-green-500 bg-green-500/5' 
            : showResult && selectedAnswer !== null && selectedAnswer !== currentQuestion.correctAnswer 
              ? 'border-red-500 bg-red-500/5' 
              : 'border-border'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs text-muted-foreground">
              +{Math.round(currentQuestion.xpReward * comboMultiplier)} XP
            </span>
          </div>

          <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>

          {currentQuestion.code && (
            <pre className="bg-muted p-4 rounded-lg mb-4 text-sm font-mono overflow-x-auto">
              {currentQuestion.code}
            </pre>
          )}

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;

              let borderClass = 'border-border hover:border-primary/50 cursor-pointer';
              if (showResult) {
                if (isCorrect) borderClass = 'border-green-500 bg-green-500/10';
                else if (isSelected) borderClass = 'border-red-500 bg-red-500/10';
                else borderClass = 'border-border opacity-50';
              }

              return (
                <button
                  key={index}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all ${borderClass}`}
                  onClick={() => handleAnswer(index)}
                  disabled={showResult}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                      showResult && isCorrect ? 'border-green-500 bg-green-500 text-white' :
                      showResult && isSelected ? 'border-red-500 bg-red-500 text-white' :
                      'border-muted-foreground/30'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1 text-sm">{option}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Result feedback */}
        {showResult && (
          <Card className="p-4 bg-muted/30 animate-fade-in">
            <p className="text-sm">
              <span className="font-medium">📖 </span>
              {currentQuestion.explanation}
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SurvivalMode;
