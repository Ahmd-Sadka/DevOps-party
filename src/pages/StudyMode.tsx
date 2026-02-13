import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LEVELS } from '@/types/game';
import { getStudyContentForLevel, StudyCard } from '@/data/study-cards';
import { ArrowLeft, BookOpen, Lightbulb, AlertTriangle, Code2, ChevronLeft, ChevronRight, Play } from 'lucide-react';

const StudyMode = () => {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCode, setShowCode] = useState(false);

  const level = LEVELS.find(l => l.id === levelId);
  const cards = getStudyContentForLevel(levelId || '');

  if (!level || cards.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md p-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h2 className="text-xl font-bold mb-2">No Study Content Yet</h2>
          <p className="text-muted-foreground mb-4">Study cards for this level are coming soon!</p>
          <Button onClick={() => navigate('/levels')}>Back to Levels</Button>
        </Card>
      </div>
    );
  }

  const card = cards[currentIndex];

  const goNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setShowCode(false);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setShowCode(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/levels')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{level.emoji}</span>
              <div>
                <h1 className="text-xl font-bold">{level.name} - Study</h1>
                <p className="text-xs text-muted-foreground">{cards.length} concept cards</p>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate(`/quiz/${levelId}`)} className="btn-glow">
            <Play className="mr-2 h-4 w-4" />
            Start Quiz
          </Button>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => { setCurrentIndex(i); setShowCode(false); }}
              className={`w-3 h-3 rounded-full transition-all ${
                i === currentIndex ? 'bg-primary scale-125' : i < currentIndex ? 'bg-primary/40' : 'bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Study Card */}
        <Card className="p-6 mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start gap-3 mb-4">
            <div className="p-2 bg-primary/20 rounded-lg shrink-0">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{card.title}</h2>
              <p className="text-xs text-muted-foreground">Card {currentIndex + 1} of {cards.length}</p>
            </div>
          </div>

          <p className="text-sm leading-relaxed mb-6">{card.explanation}</p>

          {/* Code Example (expandable) */}
          {card.codeExample && (
            <div className="mb-6">
              <button
                onClick={() => setShowCode(!showCode)}
                className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors mb-2"
              >
                <Code2 className="h-4 w-4" />
                {showCode ? 'Hide Code Example' : 'Show Code Example'}
              </button>
              {showCode && (
                <pre className="bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto animate-in slide-in-from-top-2 duration-200">
                  {card.codeExample}
                </pre>
              )}
            </div>
          )}

          {/* Pro Tip */}
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 mb-4">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-green-500 uppercase mb-1">Pro Tip</p>
                <p className="text-sm">{card.proTip}</p>
              </div>
            </div>
          </div>

          {/* Common Mistake */}
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-medium text-red-500 uppercase mb-1">Common Mistake</p>
                <p className="text-sm">{card.commonMistake}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            {currentIndex + 1} / {cards.length}
          </span>

          {currentIndex < cards.length - 1 ? (
            <Button onClick={goNext}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={() => navigate(`/quiz/${levelId}`)} className="btn-glow">
              <Play className="mr-1 h-4 w-4" />
              Start Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyMode;
