import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getQuizQuestions } from '@/data/questions';
import { LEVELS, LevelId, Question } from '@/types/game';
import { ArrowLeft, Check, X, Zap, Ghost } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useConfetti } from '@/hooks/useConfetti';
import { useBadges } from '@/hooks/useBadges';
import { BadgeQueue } from '@/components/game/BadgeNotification';
import { PowerUpBar } from '@/components/game/PowerUps';
import { EasterEggNotification } from '@/components/game/EasterEggNotification';

// Fun loading messages
const LOADING_MESSAGES = [
  "Summoning quiz questions...",
  "Polishing the correct answers...",
  "Convincing the server to behave...",
  "Debugging reality...",
  "Loading DevOps wisdom...",
  "Compiling knowledge...",
  "Deploying questions to brain...",
  "Initializing terminal...",
  "Pulling latest questions...",
  "Configuring quiz pipeline...",
];

const EGG_MESSAGES = [
  { emoji: "🎲", text: "Lucky Roll! +5 XP Bonus!" },
  { emoji: "⚡", text: "Speed Demon Bonus! +10 XP!" },
  { emoji: "🧠", text: "Big Brain Energy! +15 XP!" },
  { emoji: "🔥", text: "On Fire! Streak Multiplier x2!" },
  { emoji: "🌟", text: "Star Power! Hidden Bonus!" },
  { emoji: "💎", text: "Rare Drop! +20 XP!" },
  { emoji: "🎯", text: "Bullseye! Perfect Timing!" },
  { emoji: "🚀", text: "Launch Ready! XP Boost!" },
];

// Developer quotes for breaks
const DEV_QUOTES = [
  "sudo make-me-a-sandwich 🍔",
  "Works on my machine! 🖥️",
  "It's not a bug, it's a feature! 🐛✨",
  "Have you tried turning it off and on again? 🔄",
  "The code was perfect when I wrote it... 📝",
  "I'll just quick-fix this... 😅",
  "It compiles! Ship it! 🚢",
  "Stack Overflow said it would work... 👀",
  "Let me add one more thing... 🎸",
  "Comment? Nah, code is self-documenting... 📚",
];

interface QuizState {
  selectedAnswer: number | null;
  showResult: boolean;
  questionStartTime: number;
  pendingBadges: string[];
  fiftyFiftyUsed: number[] | null;
  hintShown: boolean;
  easterEggTriggered: boolean;
  easterEggMessage: { emoji: string; text: string } | null;
  currentQuote: string;
  consecutiveCorrect: number;
}

const Quiz = () => {
  const { levelId: urlLevelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const { state, startQuiz, submitAnswer, completeQuiz, clearQuiz, dispatch, addXP } = useGame();
  const [quizState, setQuizState] = useState<QuizState>({
    selectedAnswer: null,
    showResult: false,
    questionStartTime: Date.now(),
    pendingBadges: [],
    fiftyFiftyUsed: null,
    hintShown: false,
    easterEggTriggered: false,
    easterEggMessage: null,
    currentQuote: '',
    consecutiveCorrect: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_MESSAGES[0]);
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [quizResults, setQuizResults] = useState<{ correct: number; total: number; totalXP: number } | null>(null);

  const { playSound } = useSoundEffects();
  const { burstConfetti, sidesConfetti } = useConfetti();
  const { checkAndAwardBadges } = useBadges();

  // Default to 'linux' if no levelId provided, validate against known levels
  const levelId = urlLevelId && LEVELS.find(l => l.id === urlLevelId) ? urlLevelId : 'linux';
  const level = LEVELS.find(l => l.id === levelId);

  // Initialize quiz
  useEffect(() => {
    if (!levelId) return;

    const initQuiz = async () => {
      setLoading(true);
      // Cycle through loading messages
      let msgIndex = 0;
      const msgInterval = setInterval(() => {
        msgIndex = (msgIndex + 1) % LOADING_MESSAGES.length;
        setLoadingMessage(LOADING_MESSAGES[msgIndex]);
      }, 500);

      try {
        // Wait a bit for user state to be ready
        await new Promise(resolve => setTimeout(resolve, 300));

        if (!state.user) {
          // Redirect to home if no user
          navigate('/');
          return;
        }

        const questions = getQuizQuestions(levelId, 10);
        setQuizQuestions(questions);
        setCurrentQuestionIndex(0);
        setQuizCompleted(false);
        setQuizResults(null);
        
        // Initialize quiz state in context
        startQuiz(levelId as LevelId, questions);
      } catch (error) {
        console.error('Failed to initialize quiz:', error);
      } finally {
        clearInterval(msgInterval);
        setLoading(false);
      }
    };

    initQuiz();
  }, [levelId]);

  // Reset per-question state
  useEffect(() => {
    setQuizState(prev => ({
      ...prev,
      selectedAnswer: null,
      showResult: false,
      questionStartTime: Date.now(),
      fiftyFiftyUsed: null,
      hintShown: false,
      easterEggTriggered: false,
      currentQuote: DEV_QUOTES[Math.floor(Math.random() * DEV_QUOTES.length)],
    }));
  }, [currentQuestionIndex]);

  // Check for quiz completion from context
  useEffect(() => {
    if (state.currentQuiz?.isComplete && !quizCompleted) {
      handleQuizComplete();
    }
  }, [state.currentQuiz?.isComplete]);

  const handleQuizComplete = () => {
    const correct = state.currentQuiz?.answers.filter(a => a.isCorrect).length || 0;
    const total = state.currentQuiz?.answers.length || 0;
    const totalXP = state.currentQuiz?.answers.reduce((sum, a) => sum + a.xpEarned, 0) || 0;

    setQuizCompleted(true);
    setQuizResults({ correct, total, totalXP });

    // Badge checks
    if (state.user) {
      const newBadges = checkAndAwardBadges(state.user);
      if (newBadges.length > 0) {
        setQuizState(prev => ({ ...prev, pendingBadges: newBadges }));
        newBadges.forEach(badgeId => {
          dispatch({ type: 'UNLOCK_BADGE', payload: badgeId });
        });
        playSound('badge');
        sidesConfetti();
      }

      const accuracy = Math.round((correct / total) * 100);
      if (accuracy >= 70) {
        playSound('levelUp');
        burstConfetti();
      }
    }
  };

  const triggerEasterEgg = () => {
    if (quizState.easterEggTriggered || quizState.showResult) return;

    const egg = EGG_MESSAGES[Math.floor(Math.random() * EGG_MESSAGES.length)];
    setQuizState(prev => ({
      ...prev,
      easterEggTriggered: true,
      easterEggMessage: egg,
    }));

    // Award bonus XP
    const bonusXP = Math.floor(Math.random() * 15) + 5;
    addXP(bonusXP);
    playSound('badge');
    sidesConfetti();

    // Hide message after delay
    setTimeout(() => {
      setQuizState(prev => ({
        ...prev,
        easterEggMessage: null,
      }));
    }, 3000);
  };

  const handleUsePowerUp = (effect: string) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (!currentQuestion) return;

    if (effect === 'fifty_fifty' && !quizState.fiftyFiftyUsed && currentQuestion.options.length >= 3) {
      const wrongIndices = currentQuestion.options
        .map((_, i) => i)
        .filter((i) => i !== currentQuestion.correctAnswer);
      const toHide = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
      setQuizState(prev => ({ ...prev, fiftyFiftyUsed: toHide }));
    }
    if (effect === 'skip') {
      handleSubmit(-1, false, 0);
    }
    if (effect === 'hint') {
      setQuizState(prev => ({ ...prev, hintShown: true }));
    }
  };

  const handleSubmit = (selectedAnswer: number, isCorrect: boolean, timeSpent: number, skip: boolean = false) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    if (!currentQuestion && !skip) return;

    if (skip) {
      // Skip without XP
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex >= quizQuestions.length) {
        // Complete quiz
        dispatch({ type: 'COMPLETE_QUIZ' });
      } else {
        setCurrentQuestionIndex(nextIndex);
      }
      return;
    }

    const xpEarned = isCorrect ? currentQuestion.xpReward : 0;
    
    // Play sound
    playSound(isCorrect ? 'correct' : 'wrong');

    setQuizState(prev => ({ ...prev, showResult: true }));

    // Trigger easter egg on 3+ consecutive correct answers
    if (isCorrect) {
      const newConsecutive = quizState.consecutiveCorrect + 1;
      setQuizState(prev => ({ ...prev, consecutiveCorrect: newConsecutive }));
      
      if (newConsecutive >= 3 && Math.random() > 0.5) {
        triggerEasterEgg();
      }
    } else {
      setQuizState(prev => ({ ...prev, consecutiveCorrect: 0 }));
    }

    setTimeout(() => {
      submitAnswer(currentQuestion.id, selectedAnswer, isCorrect, timeSpent, xpEarned);
      
      const nextIndex = currentQuestionIndex + 1;
      if (nextIndex >= quizQuestions.length) {
        // Quiz will complete via useEffect
      } else {
        setCurrentQuestionIndex(nextIndex);
      }
    }, 2000);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      case 'hard': return 'text-orange-500';
      case 'evil': return 'text-red-500';
      default: return 'text-muted-foreground';
    }
  };

  // Loading state
  if (loading || !state.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6">
            <Zap className="h-12 w-12 text-primary animate-pulse" />
          </div>
          <p className="text-lg font-medium animate-pulse">{loadingMessage}</p>
          <p className="text-sm text-muted-foreground mt-2">Preparing your quiz...</p>
        </div>
      </div>
    );
  }

  // Quiz completion screen
  if (quizCompleted && quizResults) {
    const { correct, total, totalXP } = quizResults;
    const accuracy = Math.round((correct / total) * 100);

    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        {quizState.pendingBadges.length > 0 && (
          <BadgeQueue 
            badgeIds={quizState.pendingBadges} 
            onComplete={() => setQuizState(prev => ({ ...prev, pendingBadges: [] }))} 
          />
        )}
        
        <EasterEggNotification 
          message={quizState.easterEggMessage} 
          onClose={() => setQuizState(prev => ({ ...prev, easterEggMessage: null }))}
        />

        <Card className="max-w-md w-full p-8 text-center bg-card border-border">
          <div className="text-7xl mb-4 animate-bounce">
            {accuracy >= 70 ? '🎉' : accuracy >= 50 ? '💪' : '📚'}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {accuracy >= 70 ? 'Level Complete!' : accuracy >= 50 ? 'Good Effort!' : 'Keep Learning!'}
          </h1>
          <p className="text-muted-foreground mb-6">
            {accuracy >= 70 
              ? 'You passed this level!' 
              : accuracy >= 50 ? 'Almost there! Try again for a better score.' : 'Practice makes perfect!'}
          </p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-3xl font-bold">{correct}/{total}</p>
              <p className="text-sm text-muted-foreground">Correct</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
              <p className="text-3xl font-bold gradient-text-xp">+{totalXP}</p>
              <p className="text-sm text-muted-foreground">XP Earned</p>
            </div>
          </div>

          {/* Streak display */}
          {quizState.consecutiveCorrect >= 3 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-500/30">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="font-bold">{quizState.consecutiveCorrect} Answer Streak!</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button 
              className="w-full h-12 btn-glow" 
              onClick={() => {
                completeQuiz();
                navigate('/levels');
              }}
            >
              Continue
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => {
                completeQuiz();
                navigate('/levels');
              }}
            >
              Back to Levels
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // No questions or level
  if (!level || quizQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <Ghost className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">No Questions Found</h2>
          <p className="text-muted-foreground mb-4">
            This level doesn't have any questions yet.
          </p>
          <Button onClick={() => navigate('/levels')}>
            Back to Levels
          </Button>
        </Card>
      </div>
    );
  }

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progressPercent = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <EasterEggNotification 
        message={quizState.easterEggMessage} 
        onClose={() => setQuizState(prev => ({ ...prev, easterEggMessage: null }))}
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/levels')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{level.emoji} {level.name}</span>
              <span className="text-sm text-muted-foreground">
                {currentQuestionIndex + 1} / {quizQuestions.length}
              </span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
          <PowerUpBar
            disabled={quizState.showResult}
            onUsePowerUp={(pu) => handleUsePowerUp(pu.effect)}
          />
        </div>

        {/* Streak indicator */}
        {quizState.consecutiveCorrect >= 2 && (
          <div className="mb-4 p-2 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-lg flex items-center justify-center gap-2">
            <span>🔥</span>
            <span className="text-sm font-medium">{quizState.consecutiveCorrect}x Streak!</span>
          </div>
        )}

        {/* Developer quote between questions */}
        {quizState.currentQuote && (
          <div className="mb-4 p-3 bg-muted/50 rounded-lg text-center text-sm text-muted-foreground italic">
            "{quizState.currentQuote}"
          </div>
        )}

        {/* Question Card */}
        <Card className={`p-6 mb-6 bg-card border-border ${quizState.showResult && quizState.selectedAnswer === currentQuestion.correctAnswer ? 'success-pulse border-green-500' : quizState.showResult && quizState.selectedAnswer !== null && quizState.selectedAnswer !== currentQuestion.correctAnswer ? 'wrong-shake border-red-500' : ''}`}>
          <div className="flex items-center gap-2 mb-4">
            <span className={`text-xs font-medium uppercase px-2 py-1 rounded ${getDifficultyColor(currentQuestion.difficulty)} bg-background/50`}>
              {currentQuestion.difficulty === 'evil' ? '😈 Evil' : currentQuestion.difficulty}
            </span>
            <span className="text-xs text-muted-foreground">+{currentQuestion.xpReward} XP</span>
          </div>
          
          <h2 className="text-xl font-semibold mb-4">{currentQuestion.question}</h2>
          
          {currentQuestion.code && (
            <pre className="bg-muted p-4 rounded-lg mb-4 text-sm font-mono overflow-x-auto">
              {currentQuestion.code}
            </pre>
          )}

          {quizState.hintShown && !quizState.showResult && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 border border-primary/30 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">💡 Hint: </span>
              {(currentQuestion.explanation.split(/[.!]/)[0] || currentQuestion.explanation).trim()}.
            </div>
          )}

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => {
              const hiddenBy5050 = quizState.fiftyFiftyUsed !== null && quizState.fiftyFiftyUsed.includes(index);
              if (hiddenBy5050) return null;

              const isSelected = quizState.selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;

              let optionClass = 'border-border hover:border-primary/50';
              if (quizState.showResult) {
                if (isCorrect) optionClass = 'border-green-500 bg-green-500/10';
                else if (isSelected) optionClass = 'border-red-500 bg-red-500/10';
              } else if (isSelected) {
                optionClass = 'border-primary bg-primary/10';
              }

              return (
                <button
                  key={index}
                  onClick={() => !quizState.showResult && setQuizState(prev => ({ ...prev, selectedAnswer: index }))}
                  disabled={quizState.showResult}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${optionClass}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm">{option}</span>
                    {quizState.showResult && isCorrect && <Check className="h-5 w-5 text-green-500" />}
                    {quizState.showResult && isSelected && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Result Feedback */}
        {quizState.showResult && (
          <Card className={`p-4 mb-6 ${quizState.selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
            <p className="font-medium mb-2">
              {quizState.selectedAnswer === currentQuestion.correctAnswer 
                ? `✅ Correct! +${currentQuestion.xpReward} XP`
                : '❌ Wrong answer!'}
            </p>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </Card>
        )}

        {/* Submit Button */}
        {!quizState.showResult && (
          <Button 
            className="w-full h-12 btn-glow" 
            onClick={() => handleSubmit(quizState.selectedAnswer!, quizState.selectedAnswer === currentQuestion.correctAnswer, Math.round((Date.now() - quizState.questionStartTime) / 1000))}
            disabled={quizState.selectedAnswer === null}
          >
            Submit Answer
          </Button>
        )}
      </div>
    </div>
  );
};

export default Quiz;

