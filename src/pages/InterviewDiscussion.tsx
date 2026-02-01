import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  getShuffledDiscussionQuestions,
  DISCUSSION_CATEGORIES,
} from '@/data/interview-discussion-questions';
import type { InterviewDiscussionQuestion } from '@/types/game';
import { ArrowLeft, BookOpen, Lightbulb, Eye, ArrowRight } from 'lucide-react';

const InterviewDiscussion = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') as InterviewDiscussionQuestion['category'] | null;

  const [questions, setQuestions] = useState<InterviewDiscussionQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [hintShown, setHintShown] = useState(false);
  const [answerShown, setAnswerShown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<InterviewDiscussionQuestion['category'] | ''>(
    categoryParam && DISCUSSION_CATEGORIES.includes(categoryParam) ? categoryParam : ''
  );

  const currentQuestion = questions[index];

  useEffect(() => {
    const list = getShuffledDiscussionQuestions(
      categoryFilter ? (categoryFilter as InterviewDiscussionQuestion['category']) : undefined
    );
    setQuestions(list);
    setIndex(0);
    setHintShown(false);
    setAnswerShown(false);
  }, [categoryFilter]);

  const goNext = () => {
    if (index < questions.length - 1) {
      setIndex((i) => i + 1);
      setHintShown(false);
      setAnswerShown(false);
    }
  };

  const goPrev = () => {
    if (index > 0) {
      setIndex((i) => i - 1);
      setHintShown(false);
      setAnswerShown(false);
    }
  };

  if (!currentQuestion && questions.length > 0) return null;
  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Button variant="ghost" size="icon" onClick={() => navigate('/interview')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <p className="text-muted-foreground mt-4">No questions in this category. Try another.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/interview')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <span className="font-semibold">Discussion-style interview</span>
          </div>
        </div>

        {/* Category filter */}
        <div className="mb-4">
          <label className="text-sm text-muted-foreground mr-2">Category:</label>
          <select
            value={categoryFilter}
            onChange={(e) =>
              setCategoryFilter(e.target.value as InterviewDiscussionQuestion['category'] | '')
            }
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All</option>
            {DISCUSSION_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          Question {index + 1} of {questions.length}. Think through your answer, use the hint if you
          need it, then reveal the answer.
        </p>

        <Card className="p-6 mb-6 bg-card border-border">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-medium uppercase text-primary rounded bg-primary/10 px-2 py-1">
              {currentQuestion.category}
            </span>
          </div>
          <h2 className="text-lg font-semibold mb-4">{currentQuestion.question}</h2>

          {currentQuestion.hint && (
            <div className="mb-4">
              {!hintShown ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setHintShown(true)}
                  className="gap-2"
                >
                  <Lightbulb className="h-4 w-4" />
                  Show hint
                </Button>
              ) : (
                <div className="rounded-lg bg-muted/50 border border-border p-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Hint: </span>
                  {currentQuestion.hint}
                </div>
              )}
            </div>
          )}

          {!answerShown ? (
            <Button
              variant="default"
              size="sm"
              onClick={() => setAnswerShown(true)}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Reveal answer
            </Button>
          ) : (
            <div className="rounded-lg bg-success/10 border border-success/30 p-4 text-sm">
              <p className="font-medium text-success mb-2">Answer</p>
              <p className="text-foreground whitespace-pre-wrap">{currentQuestion.answer}</p>
            </div>
          )}
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={index === 0}
            className="gap-2"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            {index + 1} / {questions.length}
          </span>
          <Button
            variant="outline"
            onClick={goNext}
            disabled={index >= questions.length - 1}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InterviewDiscussion;
