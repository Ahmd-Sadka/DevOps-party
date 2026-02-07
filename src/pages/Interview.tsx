import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LEVELS } from '@/types/game';
import { ArrowLeft, BookOpen, Lock, MessageCircle, Play, Sparkles, Briefcase, Mic } from 'lucide-react';

const JUNIOR_LEVEL = LEVELS.find((l) => l.id === 'junior-interview');

const Interview = () => {
  const { state } = useGame();
  const navigate = useNavigate();
  const user = state.user;

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Interview Prep</h1>
          </div>
        </div>

        <p className="text-muted-foreground mb-6">
          Practice common DevOps & SRE interview questions. Choose your preferred mode below.
        </p>

        {/* NEW: Mock Interview Simulation */}
        <Card className="p-6 mb-6 border-primary bg-gradient-to-br from-primary/10 to-primary/5 hover:border-primary/70 transition-colors">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/20 rounded-xl">
              <Mic className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">Mock Interview Simulation</h2>
                <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">NEW</span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Practice answering real interview questions. Get hints, review key points, and rate your own performance. Earn up to 200 XP!
              </p>
              <Button
                className="btn-glow gap-2"
                onClick={() => navigate('/interview/simulation')}
              >
                <Briefcase className="h-4 w-4" />
                Start Simulation
              </Button>
            </div>
          </div>
        </Card>

        {/* Junior Interview */}
        <Card className="p-6 mb-6 border-border bg-card hover:border-primary/30 transition-colors">
          <div className="flex items-start gap-4">
            <div className="text-5xl">{JUNIOR_LEVEL?.emoji ?? '📋'}</div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">Junior Level Questions</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Linux, networking, Bash, containers, Kubernetes, Terraform, CI/CD, Ansible, AWS & general DevOps — like real junior DevOps/SRE interviews.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => navigate('/interview/discussion')}
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Discussion style
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => navigate('/quiz/junior-interview')}
                >
                  <Play className="h-4 w-4" />
                  MCQ quiz mode
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Senior — Coming Soon */}
        <Card className="p-6 border-muted bg-muted/30 opacity-90">
          <div className="flex items-start gap-4">
            <div className="text-5xl grayscale">{JUNIOR_LEVEL?.emoji ?? '📋'}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">Senior Level</h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium">
                  <Lock className="h-3 w-3" />
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Architecture, scaling, incident response, SLOs, and system design. We're building this section — check back later.
              </p>
              <Button variant="outline" disabled className="opacity-70">
                <Sparkles className="mr-2 h-4 w-4" />
                Senior Prep (Coming Soon)
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Interview;
