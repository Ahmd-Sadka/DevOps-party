import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { getQuestionsByIds, getQuizQuestions, shuffleQuestionOptions, allQuestions } from '@/data/questions';
import { juniorInterviewQuestions } from '@/data/junior-interview-questions';
import { Question, LEVELS, LevelId } from '@/types/game';
import { ArrowLeft, Share2, Check, X, Trophy, Zap, Copy, Link } from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { useConfetti } from '@/hooks/useConfetti';

const ChallengeMode = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { state, addXP } = useGame();
  const { playSound } = useSoundEffects();
  const { burstConfetti } = useConfetti();
  const user = state.user;

  // Decode challenge from URL
  const challengeData = useMemo(() => {
    const encoded = searchParams.get('d');
    if (!encoded) return null;
    try {
      const decoded = atob(encoded);
      const parsed = JSON.parse(decoded);
      return parsed as { ids: string[]; score: number; by: string; level?: string };
    } catch {
      return null;
    }
  }, [searchParams]);

  const [phase, setPhase] = useState<'create' | 'play' | 'result'>(() => challengeData ? 'play' : 'create');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  // Create challenge state
  const [selectedLevel, setSelectedLevel] = useState<string>('linux');
  const [questionCount, setQuestionCount] = useState(5);

  // Load challenge questions
  useEffect(() => {
    if (challengeData) {
      const qs = getQuestionsByIds(challengeData.ids).map(shuffleQuestionOptions);
      if (qs.length > 0) {
        setQuestions(qs);
      }
    }
  }, [challengeData]);

  const generateChallenge = () => {
    const qs = getQuizQuestions(selectedLevel, questionCount);
    if (qs.length === 0) return;

    setQuestions(qs);
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setStats({ correct: 0, total: 0 });
    setPhase('play');
  };

  const handleAnswer = (index: number) => {
    if (showResult) return;
    setSelectedAnswer(index);
    setShowResult(true);

    const q = questions[currentIndex];
    const isCorrect = index === q.correctAnswer;
    playSound(isCorrect ? 'correct' : 'wrong');
    if (isCorrect) {
      setStats(prev => ({ correct: prev.correct + 1, total: prev.total + 1 }));
    } else {
      setStats(prev => ({ ...prev, total: prev.total + 1 }));
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      // Done
      const finalCorrect = stats.correct;
      const bonusXP = finalCorrect * 5;
      if (bonusXP > 0) addXP(bonusXP);
      if (finalCorrect >= questions.length * 0.8) burstConfetti();
      setPhase('result');
    } else {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  const createShareLink = () => {
    const data = {
      ids: questions.map(q => q.id),
      score: stats.correct,
      by: user?.username || 'Anonymous',
      level: selectedLevel,
    };
    const encoded = btoa(JSON.stringify(data));
    const url = `${window.location.origin}/challenge?d=${encoded}`;
    setShareLink(url);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // CREATE phase
  if (phase === 'create') {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Share2 className="h-6 w-6 text-primary" />
                Challenge a Friend
              </h1>
              <p className="text-xs text-muted-foreground">Create a quiz challenge and share the link!</p>
            </div>
          </div>

          <Card className="p-6 mb-6">
            <h2 className="text-lg font-bold mb-4">Choose Topic</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
              {LEVELS.filter(l => l.id !== 'junior-interview').map(level => (
                <button
                  key={level.id}
                  onClick={() => setSelectedLevel(level.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all ${
                    selectedLevel === level.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/30'
                  }`}
                >
                  <span className="text-2xl">{level.emoji}</span>
                  <p className="text-sm font-medium mt-1">{level.name}</p>
                </button>
              ))}
            </div>

            <h2 className="text-lg font-bold mb-3">Number of Questions</h2>
            <div className="flex gap-3 mb-6">
              {[3, 5, 10].map(n => (
                <button
                  key={n}
                  onClick={() => setQuestionCount(n)}
                  className={`px-6 py-2 rounded-lg border-2 font-bold transition-all ${
                    questionCount === n ? 'border-primary bg-primary/10 text-primary' : 'border-border'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            <Button size="lg" className="w-full btn-glow" onClick={generateChallenge}>
              <Zap className="mr-2 h-5 w-5" />
              Start Challenge
            </Button>
          </Card>

          {challengeData && (
            <Card className="p-4 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30">
              <p className="text-sm text-center">
                <strong>{challengeData.by}</strong> scored <strong className="text-xp">{challengeData.score}/{challengeData.ids.length}</strong> — Can you beat it?
              </p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // PLAY phase
  if (phase === 'play') {
    const q = questions[currentIndex];
    if (!q) return null;

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Share2 className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-bold">Challenge Mode</h1>
              {challengeData && (
                <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded-full">
                  Beat {challengeData.score}/{challengeData.ids.length}
                </span>
              )}
            </div>
            <span className="text-sm text-muted-foreground">{currentIndex + 1}/{questions.length}</span>
          </div>

          <div className="h-2 bg-muted rounded-full mb-6 overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }} />
          </div>

          <Card className="p-6 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                q.difficulty === 'easy' ? 'bg-green-500/10 text-green-500' :
                q.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                q.difficulty === 'hard' ? 'bg-orange-500/10 text-orange-500' :
                'bg-red-500/10 text-red-500'
              }`}>{q.difficulty}</span>
            </div>

            <h2 className="text-lg font-semibold mb-4">{q.question}</h2>
            {q.code && <pre className="bg-muted p-4 rounded-lg mb-4 text-sm font-mono overflow-x-auto">{q.code}</pre>}

            <div className="space-y-3">
              {q.options.map((opt, i) => {
                const isSelected = selectedAnswer === i;
                const isCorrect = i === q.correctAnswer;
                let cls = 'border-border hover:border-primary/50 cursor-pointer';
                if (showResult) {
                  if (isCorrect) cls = 'border-green-500 bg-green-500/10';
                  else if (isSelected) cls = 'border-red-500 bg-red-500/10';
                  else cls = 'border-border opacity-50';
                }
                return (
                  <button key={i} onClick={() => handleAnswer(i)} disabled={showResult} className={`w-full p-4 rounded-xl border-2 text-left transition-all ${cls}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                        showResult && isCorrect ? 'border-green-500 bg-green-500 text-white' :
                        showResult && isSelected ? 'border-red-500 bg-red-500 text-white' :
                        'border-muted-foreground/30'
                      }`}>{String.fromCharCode(65 + i)}</span>
                      <span className="flex-1 text-sm">{opt}</span>
                      {showResult && isCorrect && <Check className="h-5 w-5 text-green-500" />}
                      {showResult && isSelected && !isCorrect && <X className="h-5 w-5 text-red-500" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {showResult && (
            <>
              <Card className={`p-3 mb-4 ${selectedAnswer === q.correctAnswer ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                <p className="text-sm text-muted-foreground">{q.explanation}</p>
              </Card>
              <Button className="w-full" onClick={handleNext}>
                {currentIndex + 1 >= questions.length ? 'See Results' : 'Next Question'}
              </Button>
            </>
          )}
        </div>
      </div>
    );
  }

  // RESULT phase
  const accuracy = questions.length > 0 ? Math.round((stats.correct / questions.length) * 100) : 0;
  const beatChallenge = challengeData ? stats.correct > challengeData.score : false;

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">
          {beatChallenge ? '🏆' : accuracy >= 80 ? '🎉' : accuracy >= 50 ? '💪' : '📚'}
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {beatChallenge ? 'You Beat the Challenge!' : accuracy >= 80 ? 'Great Score!' : 'Challenge Complete'}
        </h1>

        {challengeData && (
          <p className="text-sm text-muted-foreground mb-2">
            {beatChallenge
              ? `You beat ${challengeData.by}'s score of ${challengeData.score}!`
              : `${challengeData.by} scored ${challengeData.score}/${challengeData.ids.length}`}
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 my-6">
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-2xl font-bold">{stats.correct}/{questions.length}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl">
            <p className="text-2xl font-bold">{accuracy}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        {!shareLink ? (
          <Button className="w-full mb-3" onClick={createShareLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Create Challenge Link
          </Button>
        ) : (
          <div className="mb-4 space-y-2">
            <div className="flex items-center gap-2 p-2 bg-muted rounded-lg">
              <input
                type="text"
                value={shareLink}
                readOnly
                className="flex-1 bg-transparent text-xs outline-none font-mono truncate"
              />
              <Button size="sm" variant="ghost" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Share this link for your friend to beat your score!</p>
          </div>
        )}

        <div className="space-y-2">
          <Button variant="outline" className="w-full" onClick={() => { setPhase('create'); setShareLink(''); }}>
            New Challenge
          </Button>
          <Button variant="ghost" className="w-full" onClick={() => navigate('/')}>
            Back to Dashboard
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ChallengeMode;
