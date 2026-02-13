import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getQuizQuestions } from '@/data/questions';
import { LEVELS, LevelId, Question } from '@/types/game';
import { ArrowLeft, Check, X, Zap, Ghost, Bookmark, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useConfetti } from '@/hooks/useConfetti';
import { useBadges } from '@/hooks/useBadges';
import { BadgeQueue } from '@/components/game/BadgeNotification';
import { PowerUpBar } from '@/components/game/PowerUps';
import { EasterEggNotification } from '@/components/game/EasterEggNotification';
import { useAchievementToast } from '@/components/game/AchievementToast';

// Fun loading messages
const LOADING_MESSAGES = [
  "Summoning quiz questions from the cloud...",
  "Polishing the correct answers...",
  "Convincing the server to behave...",
  "Debugging reality's source code...",
  "Loading DevOps wisdom from /dev/brain...",
  "Compiling knowledge with -O3 flag...",
  "Deploying questions to your brain pod...",
  "Initializing neural terminal...",
  "Pulling latest questions from origin/main...",
  "Configuring quiz pipeline stage 1 of 1...",
  "Defragmenting your knowledge base...",
  "Running terraform plan on your skills...",
  "Warming up the question microservices...",
  "kubectl apply -f quiz-manifest.yaml...",
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
  { emoji: "🦄", text: "Unicorn Moment! Legendary!" },
  { emoji: "👑", text: "Crown Achievement! +25 XP!" },
];

// Kill streak announcements (gaming style)
const STREAK_ANNOUNCEMENTS = [
  { min: 2, emoji: "🔥", text: "DOUBLE KILL!", color: "text-orange-400" },
  { min: 3, emoji: "⚡", text: "TRIPLE KILL!", color: "text-yellow-400" },
  { min: 4, emoji: "💥", text: "MEGA STREAK!", color: "text-red-400" },
  { min: 5, emoji: "🌟", text: "UNSTOPPABLE!", color: "text-purple-400" },
  { min: 7, emoji: "👑", text: "GODLIKE!", color: "text-yellow-300" },
  { min: 10, emoji: "🏆", text: "LEGENDARY!", color: "text-amber-300" },
];

// Roast messages when you get answers wrong
const WRONG_ROASTS = [
  "Even your Kubernetes cluster is facepalming right now 🤦",
  "That answer just triggered a PagerDuty incident 📟",
  "Somewhere, a senior engineer felt a disturbance in the Force 🧘",
  "Your CI/CD pipeline is writing a postmortem about this 📋",
  "git revert --hard that-answer 🔙",
  "The monitoring dashboard just turned red... for you 🔴",
  "That's not even wrong, it's a whole new category 🆕",
  "Your SSH key to success has been revoked 🔑",
  "ROLLBACK! ROLLBACK! ROLLBACK! 🚨",
  "Houston, we have a knowledge gap 🚀",
  "Error 404: Correct answer not found in brain 🧠",
  "That answer just failed the health check 💔",
  "Your answer got OOMKilled by reality 💀",
  "Deploying that answer would be a career-limiting move 📉",
];

// Correct answer celebrations
const CORRECT_CELEBRATIONS = [
  "Nailed it like a perfect deployment! 🎯",
  "Zero downtime on that answer! 💯",
  "That answer passed all integration tests! ✅",
  "The pipeline is green! Ship it! 🟢",
  "Prometheus metrics looking great! 📈",
  "Your brain's SLA is at 99.99% 🏆",
  "kubectl get genius --output=you 🧠",
  "That answer just got promoted to production! 🚀",
];

// Developer quotes for breaks
const DEV_QUOTES = [
  "sudo make-me-a-sandwich 🍔",
  "Works on my machine! 🖥️",
  "It's not a bug, it's a feature! 🐛✨",
  "Have you tried turning it off and on again? 🔄",
  "The code was perfect when I wrote it... 📝",
  "I'll just quick-fix this... famous last words 😅",
  "It compiles! Ship it! 🚢",
  "Stack Overflow said it would work... 👀",
  "Let me add one more thing... 3 hours later 🎸",
  "Comment? Nah, code is self-documenting... 📚",
  "DNS... it's always DNS 🌐",
  "This meeting could have been a YAML file 📄",
  "My code doesn't have bugs, it has surprise features 🎁",
  "I don't always test, but when I do, I test in production 🔥",
  "There are only 2 hard things in CS: cache invalidation and naming things 🤔",
  "404: Motivation not found 💤",
  "rm -rf problems/ (if only it were that easy) 🗑️",
  "I'm not lazy, I'm on energy-saving mode ♻️",
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
  streakAnnouncement: { emoji: string; text: string; color: string } | null;
  wrongRoast: string | null;
  correctCelebration: string | null;
  totalCorrect: number;
  totalWrong: number;
  fastestAnswer: number;
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
    streakAnnouncement: null,
    wrongRoast: null,
    correctCelebration: null,
    totalCorrect: 0,
    totalWrong: 0,
    fastestAnswer: Infinity,
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
  const { checkAchievements } = useAchievementToast();

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
      streakAnnouncement: null,
      wrongRoast: null,
      correctCelebration: null,
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

    const answerTime = Math.round((Date.now() - quizState.questionStartTime) / 1000);

    if (isCorrect) {
      const newConsecutive = quizState.consecutiveCorrect + 1;
      const celebration = CORRECT_CELEBRATIONS[Math.floor(Math.random() * CORRECT_CELEBRATIONS.length)];
      
      // Check for streak announcement
      const streakInfo = [...STREAK_ANNOUNCEMENTS].reverse().find(s => newConsecutive >= s.min);
      
      setQuizState(prev => ({ 
        ...prev, 
        showResult: true,
        consecutiveCorrect: newConsecutive,
        correctCelebration: celebration,
        totalCorrect: prev.totalCorrect + 1,
        fastestAnswer: Math.min(prev.fastestAnswer, answerTime),
        streakAnnouncement: streakInfo || null,
      }));
      
      // Check micro-achievements
      checkAchievements({
        consecutiveCorrect: newConsecutive,
        answerTimeSeconds: answerTime,
      });

      if (newConsecutive >= 3 && Math.random() > 0.5) {
        triggerEasterEgg();
      }
      
      // Extra confetti for big streaks
      if (newConsecutive >= 5) {
        sidesConfetti();
      }
    } else {
      const roast = WRONG_ROASTS[Math.floor(Math.random() * WRONG_ROASTS.length)];
      setQuizState(prev => ({ 
        ...prev, 
        showResult: true,
        consecutiveCorrect: 0, 
        wrongRoast: roast,
        totalWrong: prev.totalWrong + 1,
        streakAnnouncement: null,
      }));
      // Track wrong answer for review mode
      dispatch({ type: 'RECORD_WRONG_ANSWER', payload: currentQuestion.id });
      // Check micro-achievements (night deployer, etc.)
      checkAchievements({
        consecutiveCorrect: 0,
        consecutiveWrong: quizState.totalWrong + 1,
        answerTimeSeconds: answerTime,
      });
    }

    // Submit the answer immediately (updates XP/stats), but do NOT auto-advance.
    // The user must click "Next Question" to proceed, giving them time to read
    // the explanation, the "Learn Why" section, and optionally bookmark.
    submitAnswer(currentQuestion.id, selectedAnswer, isCorrect, timeSpent, xpEarned);
  };

  const advanceToNext = () => {
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex >= quizQuestions.length) {
      // Quiz will complete via useEffect
    } else {
      setCurrentQuestionIndex(nextIndex);
    }
    setQuizState(prev => ({
      ...prev,
      showResult: false,
      selectedAnswer: null,
      correctCelebration: null,
      wrongRoast: null,
      streakAnnouncement: null,
      questionStartTime: Date.now(),
      hintShown: false,
      fiftyFiftyUsed: null,
    }));
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
            {accuracy === 100 ? '👑' : accuracy >= 90 ? '🏆' : accuracy >= 70 ? '🎉' : accuracy >= 50 ? '💪' : '📚'}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {accuracy === 100 ? 'FLAWLESS VICTORY!' : accuracy >= 90 ? 'Outstanding!' : accuracy >= 70 ? 'Level Complete!' : accuracy >= 50 ? 'Good Effort!' : 'Keep Learning!'}
          </h1>
          <p className="text-muted-foreground mb-2">
            {accuracy === 100
              ? 'Not a single mistake. You are the DevOps legend!'
              : accuracy >= 90
              ? 'Almost perfect! Production is safe with you.'
              : accuracy >= 70 
              ? 'You passed! The CI/CD pipeline approves.' 
              : accuracy >= 50 ? 'Almost there! git rebase your knowledge and try again.' : 'Every senior was once a junior. Practice makes perfect!'}
          </p>

          {/* Fun accuracy-based roast/praise */}
          <p className="text-sm italic text-muted-foreground/70 mb-6">
            {accuracy === 100 ? '"This developer needs a raise" - kubectl' :
             accuracy >= 90 ? '"Deploying to production with confidence" - Terraform' :
             accuracy >= 70 ? '"Tests passing... mostly" - Jenkins' :
             accuracy >= 50 ? '"Needs more unit tests" - Code Review Bot' :
             '"Have you tried Stack Overflow?" - Every Senior Ever'}
          </p>
          
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-2xl font-bold">{correct}/{total}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl">
              <p className="text-2xl font-bold gradient-text-xp">+{totalXP}</p>
              <p className="text-xs text-muted-foreground">XP Earned</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
              <p className="text-2xl font-bold">{accuracy}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </div>

          {/* Best streak display */}
          {quizState.consecutiveCorrect >= 2 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-lg border border-orange-500/30">
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl">🔥</span>
                <span className="font-bold">{quizState.consecutiveCorrect}x Answer Streak!</span>
              </div>
            </div>
          )}

          {/* Fun stats */}
          {quizState.fastestAnswer !== Infinity && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fastest answer:</span>
                <span className="font-mono font-bold">{quizState.fastestAnswer}s ⚡</span>
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
              {accuracy >= 70 ? '🚀 Continue Quest' : '🔄 Try Again'}
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

        {/* Kill Streak Announcement */}
        {quizState.streakAnnouncement && quizState.showResult && (
          <div className="mb-4 p-3 bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-red-500/20 rounded-xl border border-yellow-500/30 text-center animate-in zoom-in duration-300">
            <div className="flex items-center justify-center gap-2">
              <span className="text-3xl">{quizState.streakAnnouncement.emoji}</span>
              <span className={`text-xl font-black uppercase tracking-wider ${quizState.streakAnnouncement.color}`}>
                {quizState.streakAnnouncement.text}
              </span>
              <span className="text-3xl">{quizState.streakAnnouncement.emoji}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{quizState.consecutiveCorrect}x combo multiplier active!</p>
          </div>
        )}

        {/* Streak indicator */}
        {quizState.consecutiveCorrect >= 2 && !quizState.streakAnnouncement && (
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
        <Card className={`p-6 mb-6 bg-card border-border transition-all ${quizState.showResult && quizState.selectedAnswer === currentQuestion.correctAnswer ? 'correct-glow border-green-500 screen-flash-green' : quizState.showResult && quizState.selectedAnswer !== null && quizState.selectedAnswer !== currentQuestion.correctAnswer ? 'dramatic-shake border-red-500 screen-flash-red' : ''} ${quizState.consecutiveCorrect >= 3 && !quizState.showResult ? 'streak-glow' : ''}`}>
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
        {quizState.showResult && (() => {
          const isCorrectAnswer = quizState.selectedAnswer === currentQuestion.correctAnswer;
          const isBookmarked = state.user?.bookmarkedQuestionIds?.includes(currentQuestion.id);
          return (
            <>
              <Card className={`p-4 mb-4 ${isCorrectAnswer ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-medium mb-1">
                      {isCorrectAnswer 
                        ? `✅ Correct! +${currentQuestion.xpReward} XP`
                        : '❌ Wrong answer!'}
                    </p>
                    {/* Celebration or Roast */}
                    {quizState.correctCelebration && isCorrectAnswer && (
                      <p className="text-xs font-medium text-green-400 mb-2 italic">{quizState.correctCelebration}</p>
                    )}
                    {quizState.wrongRoast && !isCorrectAnswer && (
                      <p className="text-xs font-medium text-red-400 mb-2 italic">{quizState.wrongRoast}</p>
                    )}
                    <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                  </div>
                  {/* Bookmark button */}
                  {!isCorrectAnswer && (
                    <button
                      className={`ml-3 p-2 rounded-lg transition-colors shrink-0 ${isBookmarked ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-muted text-muted-foreground'}`}
                      onClick={() => {
                        if (isBookmarked) {
                          dispatch({ type: 'UNBOOKMARK_QUESTION', payload: currentQuestion.id });
                        } else {
                          dispatch({ type: 'BOOKMARK_QUESTION', payload: currentQuestion.id });
                        }
                      }}
                      title={isBookmarked ? 'Remove bookmark' : 'Bookmark for later review'}
                    >
                      <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-blue-400' : ''}`} />
                    </button>
                  )}
                </div>
              </Card>

              {/* Learn Why - deeper educational content for wrong answers */}
              {!isCorrectAnswer && (
                <Card className="p-4 mb-6 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-blue-500/20">
                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-400 uppercase mb-1">Learn Why</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        The correct answer is: <strong className="text-foreground">{currentQuestion.options[currentQuestion.correctAnswer]}</strong>
                      </p>
                      <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
                      {currentQuestion.code && (
                        <pre className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono overflow-x-auto">{currentQuestion.code}</pre>
                      )}
                      <p className="text-xs text-muted-foreground/70 mt-2 italic">
                        This question has been added to your review list. Practice it again later!
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          );
        })()}

        {/* Submit Button */}
        {!quizState.showResult && (
          <div className="space-y-3">
            <Button 
              className="w-full h-12 btn-glow" 
              onClick={() => handleSubmit(quizState.selectedAnswer!, quizState.selectedAnswer === currentQuestion.correctAnswer, Math.round((Date.now() - quizState.questionStartTime) / 1000))}
              disabled={quizState.selectedAnswer === null}
            >
              {quizState.consecutiveCorrect >= 3 ? '🔥 Lock In Answer' : quizState.consecutiveCorrect >= 1 ? '⚡ Submit Answer' : 'Submit Answer'}
            </Button>
          </div>
        )}

        {/* Next Question Button (manual advance) */}
        {quizState.showResult && (
          <Button 
            className="w-full h-12 btn-glow mt-2" 
            onClick={advanceToNext}
          >
            {currentQuestionIndex + 1 >= quizQuestions.length ? '📊 See Results' : '→ Next Question'}
          </Button>
        )}

        {/* Score tracker at bottom */}
        {(quizState.totalCorrect > 0 || quizState.totalWrong > 0) && (
          <div className="mt-4 flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" /> {quizState.totalCorrect}
            </span>
            <span className="flex items-center gap-1">
              <X className="h-4 w-4 text-red-500" /> {quizState.totalWrong}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;

