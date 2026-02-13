import { useState, useEffect, useRef } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getQuestionsByLevel, shuffleArray, shuffleQuestionOptions } from '@/data/questions';
import { LEVELS, Question } from '@/types/game';
import { Skull, Clock, Trophy, Zap, ArrowLeft, Snowflake } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { PowerUpBar } from '@/components/game/PowerUps';

const BOSS_LEVELS = LEVELS.filter((l) => l.id !== 'junior-interview');

const BossBattle = () => {
  const { state, dispatch, usePowerUp, clearQuiz } = useGame();
  const navigate = useNavigate();
  const { burstConfetti, sidesConfetti } = useConfetti();
  const { playSound } = useSoundEffects();

  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [bossQuestion, setBossQuestion] = useState<Question | null>(null);
  const [phase, setPhase] = useState<'select' | 'intro' | 'countdown' | 'battle' | 'victory' | 'defeat'>('select');
  const [timeLeft, setTimeLeft] = useState(60);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [bossHealth, setBossHealth] = useState(100);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [combo, setCombo] = useState(0);
  const [lastBossTaunt, setLastBossTaunt] = useState<string | null>(null);
  const [introCountdown, setIntroCountdown] = useState(3);
  const [timeFrozen, setTimeFrozen] = useState(false);
  const timeUpProcessedRef = useRef(false);

  const BOSS_TAUNTS_CORRECT = [
    "Lucky guess... Next one will hurt!",
    "You got one. Don't get cocky.",
    "The next question will be your doom!",
    "Pathetic. Try the next.",
    "One hit. Many more to go.",
    "Even a broken pipeline deploys twice a day...",
    "My YAML indentation will destroy you!",
    "You dare oppose the master of outages?!",
    "That was the easy one. Now face true DevOps pain!",
    "Your kubectl skills are... adequate. Barely.",
  ];
  const BOSS_TAUNTS_WRONG = [
    "Too slow! Too weak!",
    "Your knowledge is no match for me!",
    "Wrong! Feel my power!",
    "Another one bites the dust!",
    "Is that all you've got?",
    "Back to studying, mortal!",
    "I've seen interns with better answers!",
    "Your terraform plan has been REJECTED!",
    "That answer just triggered a P0 incident!",
    "Even ChatGPT wouldn't give that answer!",
  ];

  const user = state.user;

  // Redirect to home if user is not logged in (only runs once on mount)
  useEffect(() => {
    const checkUserAndRedirect = () => {
      if (!user) {
        navigate('/');
      }
    };
    checkUserAndRedirect();
  }, []); // Empty dependency - only run once on mount

  // If user is not loaded, show loading state
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleBossPowerUp = (powerUp: { id: string; effect: string }) => {
    if (powerUp.effect === 'time_freeze' && phase === 'battle' && !timeFrozen) {
      if (usePowerUp(powerUp.id)) {
        setTimeFrozen(true);
        setTimeout(() => setTimeFrozen(false), 30000);
      }
    }
  };
  
  useEffect(() => {
    if (phase === 'countdown') {
      if (introCountdown > 0) {
        const t = setTimeout(() => setIntroCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => {
        setPhase('battle');
        loadNextQuestion();
      }, 600);
      return () => clearTimeout(t);
    }
  }, [phase, introCountdown]);

  useEffect(() => {
    if (phase === 'battle' && !timeFrozen && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [phase, timeLeft, timeFrozen]);

  useEffect(() => {
    if (phase !== 'battle' || timeLeft !== 0) return;
    if (timeUpProcessedRef.current) return;
    timeUpProcessedRef.current = true;
    setPlayerHealth((h) => {
      const newH = Math.max(0, h - 50);
      if (newH <= 0) setTimeout(() => setPhase('defeat'), 100);
      else setTimeout(() => loadNextQuestion(), 100);
      return newH;
    });
  }, [phase, timeLeft]);
  
  const loadNextQuestion = () => {
    if (!selectedLevel) return;
    timeUpProcessedRef.current = false;
    const questions = getQuestionsByLevel(selectedLevel).filter(
      (q) => q.difficulty === 'hard' || q.difficulty === 'evil'
    );
    if (questions.length === 0) {
      setPhase('victory');
      return;
    }
    const randomQuestion = shuffleArray(questions)[0];
    setBossQuestion(shuffleQuestionOptions(randomQuestion));
    setTimeLeft(60);
    setSelectedAnswer(null);
    setLastBossTaunt(null);
    setTimeFrozen(false);
  };

  const startBattle = (levelId: string) => {
    setSelectedLevel(levelId);
    setPhase('intro');
    setBossHealth(100);
    setPlayerHealth(100);
    setCombo(0);
    setLastBossTaunt(null);
    setIntroCountdown(3);
    setTimeFrozen(false);
    timeUpProcessedRef.current = false;
    setTimeout(() => setPhase('countdown'), 2500);
  };
  
  const handleAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || !bossQuestion) return;

    setSelectedAnswer(answerIndex);
    const isCorrect = answerIndex === bossQuestion.correctAnswer;

    const damage = 35;
    const comboBonus = isCorrect ? Math.min(combo * 5, 15) : 0;
    const totalBossDamage = isCorrect ? damage + comboBonus : 0;
    const totalPlayerDamage = isCorrect ? 0 : damage;

    if (isCorrect) {
      playSound('correct');
      setCombo((c) => c + 1);
      setLastBossTaunt(BOSS_TAUNTS_CORRECT[Math.floor(Math.random() * BOSS_TAUNTS_CORRECT.length)]);
      setBossHealth((h) => {
        const newHealth = h - totalBossDamage;
        if (newHealth <= 0) {
          setTimeout(() => {
            setPhase('victory');
            sidesConfetti();
            burstConfetti();
            playSound('levelUp');
            if (selectedLevel) {
              dispatch({ type: 'DEFEAT_BOSS', payload: selectedLevel as any });
              dispatch({ type: 'ADD_XP', payload: 200 + combo * 10 });
            }
          }, 500);
        }
        return Math.max(0, newHealth);
      });
    } else {
      playSound('wrong');
      setCombo(0);
      setLastBossTaunt(BOSS_TAUNTS_WRONG[Math.floor(Math.random() * BOSS_TAUNTS_WRONG.length)]);
      setPlayerHealth((h) => {
        const newHealth = h - totalPlayerDamage;
        if (newHealth <= 0) {
          setTimeout(() => setPhase('defeat'), 500);
        }
        return Math.max(0, newHealth);
      });
    }

    const newBossH = bossHealth - (isCorrect ? totalBossDamage : 0);
    const newPlayerH = playerHealth - (isCorrect ? 0 : totalPlayerDamage);
    if (newBossH > 0 && newPlayerH > 0) {
      setTimeout(loadNextQuestion, 1500);
    }
  };
  
  const level = selectedLevel ? LEVELS.find(l => l.id === selectedLevel) : null;
  
  // Clear any existing quiz session on mount only
  useEffect(() => {
    clearQuiz();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Skull className="h-6 w-6 text-destructive" />
            <h1 className="text-2xl font-bold">Boss Battle Arena</h1>
          </div>
        </div>
        
        {phase === 'select' && (
          <div className="space-y-4">
            <p className="text-muted-foreground text-center mb-6">
              Choose a level to face its Boss! Defeat bosses to earn bonus XP and badges.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {BOSS_LEVELS.filter((l) => user.levelProgress[l.id]?.unlocked).map((level) => {
                const defeated = user.levelProgress[level.id]?.bossDefeated;
                return (
                  <Card
                    key={level.id}
                    className={`p-6 cursor-pointer transition-all hover:scale-105 ${
                      defeated ? 'border-success/50 bg-success/5' : 'hover:border-destructive/50'
                    }`}
                    onClick={() => startBattle(level.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-5xl">{level.emoji}</div>
                      <div>
                        <h3 className="font-bold text-lg">{level.name} Boss</h3>
                        <p className="text-sm text-muted-foreground">
                          {defeated ? '✅ Defeated' : '⚔️ Challenge'}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <Skull className={`h-8 w-8 ${defeated ? 'text-muted-foreground' : 'text-destructive animate-pulse'}`} />
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
        
        {phase === 'intro' && level && (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="text-8xl animate-pulse dramatic-shake">{level.emoji}</div>
            <h2 className="text-4xl font-bold text-destructive">
              {level.name} BOSS APPROACHES!
            </h2>
            <p className="text-xl text-muted-foreground">Prepare yourself...</p>
            <p className="text-sm text-destructive/60 italic animate-pulse">
              "Only the hard and evil questions await you here..."
            </p>
          </div>
        )}

        {phase === 'countdown' && level && (
          <div className="text-center space-y-6 animate-scale-in">
            <div className="text-9xl font-mono font-bold text-primary animate-pulse">
              {introCountdown > 0 ? introCountdown : 'GO!'}
            </div>
            <p className="text-xl text-muted-foreground">
              {introCountdown > 0 ? 'Get ready...' : 'Fight!'}
            </p>
          </div>
        )}
        
        {phase === 'battle' && bossQuestion && level && (
          <div className="space-y-6">
            {/* Power-ups (Time Freeze in battle) */}
            <div className="flex items-center justify-end gap-2">
              <span className="text-xs text-muted-foreground mr-2">Power-ups:</span>
              <PowerUpBar
                disabled={selectedAnswer !== null || timeFrozen}
                onUsePowerUp={handleBossPowerUp}
              />
              {timeFrozen && (
                <span className="flex items-center gap-1 text-sm text-primary">
                  <Snowflake className="h-4 w-4 animate-pulse" />
                  Time frozen!
                </span>
              )}
            </div>
            {/* Combo & Boss Taunt */}
            {(combo > 0 || lastBossTaunt) && (
              <div className="flex flex-wrap items-center justify-center gap-4">
                {combo > 0 && (
                  <span className="px-3 py-1 rounded-full bg-xp/20 text-xp font-bold text-sm">
                    🔥 {combo} Combo!
                  </span>
                )}
                {lastBossTaunt && (
                  <span className="px-3 py-1 rounded-lg bg-destructive/10 text-destructive text-sm italic max-w-md">
                    Boss: &quot;{lastBossTaunt}&quot;
                  </span>
                )}
              </div>
            )}
            {/* Health Bars */}
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">Your HP</span>
                  <span className="text-success">{playerHealth}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-success to-green-400 transition-all duration-500"
                    style={{ width: `${playerHealth}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-destructive">Boss HP</span>
                  <span className="text-destructive">{bossHealth}%</span>
                </div>
                <div className="h-4 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-destructive to-red-400 transition-all duration-500"
                    style={{ width: `${bossHealth}%` }}
                  />
                </div>
              </div>
            </div>
            
            {/* Timer */}
            <div className="flex items-center justify-center gap-2">
              <Clock className={`h-5 w-5 ${timeLeft < 10 ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`} />
              <span className={`text-2xl font-mono ${timeLeft < 10 ? 'text-destructive' : ''}`}>
                {timeLeft}s
              </span>
            </div>
            
            {/* Question */}
            <Card className="p-6">
              <p className="text-lg font-medium mb-4">{bossQuestion.question}</p>
              {bossQuestion.code && (
                <pre className="bg-muted p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
                  {bossQuestion.code}
                </pre>
              )}
              
              <div className="grid grid-cols-1 gap-3">
                {bossQuestion.options.map((option, index) => {
                  const isSelected = selectedAnswer === index;
                  const isCorrect = bossQuestion.correctAnswer === index;
                  const showResult = selectedAnswer !== null;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={selectedAnswer !== null}
                      className={`
                        p-4 rounded-lg text-left transition-all
                        ${showResult && isCorrect ? 'bg-success/20 border-success' : ''}
                        ${showResult && isSelected && !isCorrect ? 'bg-destructive/20 border-destructive wrong-shake' : ''}
                        ${!showResult ? 'bg-muted hover:bg-muted/80 hover:scale-[1.02]' : ''}
                        border-2 border-transparent
                      `}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>
        )}
        
        {phase === 'victory' && (
          <div className="text-center space-y-6 animate-scale-in">
            <Trophy className="h-24 w-24 text-xp mx-auto" />
            <h2 className="text-4xl font-bold gradient-text">VICTORY!</h2>
            <p className="text-xl text-muted-foreground">You defeated the {level?.name} Boss!</p>
            <p className="text-sm text-muted-foreground/70 italic">
              {combo >= 3 ? `"${combo}-hit combo! The boss never stood a chance!"` :
               `"The boss has been vanquished. Your DevOps knowledge prevails!"`}
            </p>
            <div className="flex items-center justify-center gap-2 text-xp">
              <Zap className="h-6 w-6" />
              <span className="text-2xl font-bold">+{200 + combo * 10} XP</span>
            </div>
            {combo > 0 && (
              <p className="text-xs text-muted-foreground">({combo} combo bonus: +{combo * 10} XP)</p>
            )}
            <Button onClick={() => setPhase('select')} className="btn-glow">
              Return to Arena
            </Button>
          </div>
        )}
        
        {phase === 'defeat' && (
          <div className="text-center space-y-6 animate-scale-in">
            <Skull className="h-24 w-24 text-destructive mx-auto" />
            <h2 className="text-4xl font-bold text-destructive">DEFEATED</h2>
            <p className="text-xl text-muted-foreground">The boss was too strong this time...</p>
            <p className="text-sm text-muted-foreground/70 italic">
              {playerHealth <= 0 && bossHealth > 50 
                ? '"Sometimes the deployment fails. Rollback and try again."' 
                : '"So close! You almost had it. Review and come back stronger!"'}
            </p>
            <Button onClick={() => setPhase('select')} variant="outline">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BossBattle;
