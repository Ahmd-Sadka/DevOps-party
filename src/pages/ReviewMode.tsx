import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getQuestionsByIds, shuffleArray, shuffleQuestionOptions } from '@/data/questions';
import { Question } from '@/types/game';
import { ArrowLeft, RotateCcw, Bookmark, Check, X, Zap, BookOpen, Trash2 } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

const ReviewMode = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, dispatch, addXP } = useGame();
  const { playSound } = useSoundEffects();
  const user = state.user;

  const isBookmarkMode = searchParams.get('mode') === 'bookmarks';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [reviewStats, setReviewStats] = useState({ correct: 0, total: 0 });
  const [phase, setPhase] = useState<'review' | 'complete'>('review');

  useEffect(() => {
    if (!user) { navigate('/'); return; }
    const ids = isBookmarkMode ? user.bookmarkedQuestionIds : user.wrongQuestionIds;
    if (!ids || ids.length === 0) { navigate('/'); return; }
    const fetched = getQuestionsByIds(ids);
    const shuffled = shuffleArray(fetched).map(shuffleQuestionOptions);
    setQuestions(shuffled);
  }, []);

  if (!user || questions.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RotateCcw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading review questions...</p>
        </div>
      </div>
    );
  }

  if (phase === 'complete') {
    const accuracy = reviewStats.total > 0 ? Math.round((reviewStats.correct / reviewStats.total) * 100) : 0;
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-7xl mb-4">
            {accuracy >= 80 ? '🧠' : accuracy >= 50 ? '📈' : '💪'}
          </div>
          <h1 className="text-2xl font-bold mb-2">
            {accuracy >= 80 ? 'Great Improvement!' : accuracy >= 50 ? 'Getting Better!' : 'Keep Practicing!'}
          </h1>
          <p className="text-muted-foreground mb-2">
            {isBookmarkMode ? 'Bookmark Review Complete' : 'Mistake Review Complete'}
          </p>
          <p className="text-sm text-muted-foreground/70 italic mb-6">
            {accuracy >= 80 
              ? '"The best engineers learn from their mistakes and never repeat them."' 
              : '"Repetition is the mother of all learning. Come back and try again!"'}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="p-4 bg-muted rounded-xl">
              <p className="text-2xl font-bold">{reviewStats.correct}/{reviewStats.total}</p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
              <p className="text-2xl font-bold">{accuracy}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
          </div>

          <div className="space-y-3">
            <Button className="w-full" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
            {(isBookmarkMode ? user.bookmarkedQuestionIds.length : user.wrongQuestionIds.length) > 0 && (
              <Button variant="outline" className="w-full" onClick={() => {
                setCurrentIndex(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setReviewStats({ correct: 0, total: 0 });
                setPhase('review');
                const ids = isBookmarkMode ? user.bookmarkedQuestionIds : user.wrongQuestionIds;
                const fetched = getQuestionsByIds(ids);
                setQuestions(shuffleArray(fetched).map(shuffleQuestionOptions));
              }}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Review Again
              </Button>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) {
    setPhase('complete');
    return null;
  }

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const isCorrect = index === currentQuestion.correctAnswer;
    if (isCorrect) {
      playSound('correct');
      addXP(5); // Small XP for review
      // Remove from wrong answers if they got it right in review
      if (!isBookmarkMode) {
        dispatch({ type: 'REMOVE_WRONG_ANSWER', payload: currentQuestion.id });
      }
      setReviewStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      playSound('wrong');
      setReviewStats(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setPhase('complete');
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              {isBookmarkMode ? <Bookmark className="h-5 w-5 text-blue-400" /> : <RotateCcw className="h-5 w-5 text-orange-400" />}
              <h1 className="text-xl font-bold">
                {isBookmarkMode ? 'Bookmarked Questions' : 'Review Mistakes'}
              </h1>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Progress */}
        <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <Card className="p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              currentQuestion.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
              currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
              currentQuestion.difficulty === 'hard' ? 'bg-orange-500/10 text-orange-500' :
              'bg-red-500/10 text-red-500'
            }`}>
              {currentQuestion.difficulty}
            </span>
            <span className="text-xs text-muted-foreground capitalize">{currentQuestion.levelId}</span>
          </div>

          <h2 className="text-lg font-semibold mb-4">{currentQuestion.question}</h2>

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
                    {showResult && isCorrect && <Check className="h-5 w-5 text-green-500" />}
                    {showResult && isSelected && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Explanation (shown after answer) */}
        {showResult && (
          <Card className="p-4 mb-4 bg-gradient-to-r from-blue-500/5 to-cyan-500/5 border-blue-500/20">
            <div className="flex items-start gap-3">
              <BookOpen className="h-5 w-5 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-medium mb-1">Explanation</p>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Actions */}
        {showResult && (
          <div className="flex items-center gap-3">
            <Button className="flex-1" onClick={handleNext}>
              {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
            </Button>
            {isBookmarkMode && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  dispatch({ type: 'UNBOOKMARK_QUESTION', payload: currentQuestion.id });
                }}
                title="Remove bookmark"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewMode;
