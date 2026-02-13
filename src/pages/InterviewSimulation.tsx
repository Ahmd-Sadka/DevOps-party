import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  ArrowLeft, 
  Briefcase, 
  MessageSquare, 
  User, 
  CheckCircle2, 
  XCircle,
  Volume2,
  VolumeX,
  Lightbulb,
  Award,
  Timer,
  PenLine,
  RotateCcw,
  ChevronRight,
  Star,
  Brain,
  Target,
  TrendingUp
} from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface InterviewQuestion {
  id: string;
  question: string;
  hints: string[];
  keyPoints: string[];
  category: string;
  difficulty: 'junior' | 'mid' | 'senior';
  followUp?: string;
}

const interviewQuestions: InterviewQuestion[] = [
  {
    id: 'sim-001',
    question: 'Walk me through how you would troubleshoot a production server that has become unresponsive.',
    hints: ['Start with basic connectivity checks', 'Consider resource usage', 'Think about recent changes'],
    keyPoints: ['Check ping/SSH connectivity', 'Review resource usage (CPU, memory, disk)', 'Check logs', 'Review recent deployments/changes', 'Escalation if needed'],
    category: 'Troubleshooting',
    difficulty: 'junior',
    followUp: 'What if the server is reachable but the application is returning 502 errors?',
  },
  {
    id: 'sim-002',
    question: 'Explain the difference between TCP and UDP. When would you use each?',
    hints: ['Think about reliability vs speed', 'Consider connection state', 'Real-world examples help'],
    keyPoints: ['TCP: connection-oriented, reliable, ordered', 'UDP: connectionless, faster, no guarantee', 'TCP: web, email, file transfer', 'UDP: streaming, gaming, DNS'],
    category: 'Networking',
    difficulty: 'junior',
    followUp: 'Can you explain the TCP three-way handshake process?',
  },
  {
    id: 'sim-003',
    question: 'How would you design a CI/CD pipeline for a microservices application?',
    hints: ['Think about stages', 'Consider testing strategy', 'Deployment strategies matter'],
    keyPoints: ['Source control triggers', 'Build and unit tests', 'Integration tests', 'Security scanning', 'Staging deployment', 'Production deployment with rollback'],
    category: 'CI/CD',
    difficulty: 'mid',
    followUp: 'How would you handle database schema migrations in this pipeline?',
  },
  {
    id: 'sim-004',
    question: 'What is the purpose of Kubernetes liveness and readiness probes?',
    hints: ['Think about container health', 'Consider traffic routing', 'What happens when they fail?'],
    keyPoints: ['Liveness: restart if unhealthy', 'Readiness: traffic routing control', 'Different failure actions', 'Configuration best practices'],
    category: 'Kubernetes',
    difficulty: 'junior',
    followUp: 'What happens if you only configure a liveness probe but not a readiness probe?',
  },
  {
    id: 'sim-005',
    question: 'Explain Infrastructure as Code. What are the benefits and challenges?',
    hints: ['Think about version control', 'Consider reproducibility', 'Team collaboration aspects'],
    keyPoints: ['Version controlled infrastructure', 'Reproducible environments', 'Automated provisioning', 'Challenges: state management, drift, learning curve'],
    category: 'IaC',
    difficulty: 'junior',
    followUp: 'How would you handle secrets and sensitive data in your IaC repository?',
  },
  {
    id: 'sim-006',
    question: 'How would you implement zero-downtime deployments?',
    hints: ['Think about deployment strategies', 'Consider load balancing', 'Database migrations matter'],
    keyPoints: ['Blue-green or canary deployments', 'Load balancer health checks', 'Rolling updates', 'Database backward compatibility', 'Rollback strategy'],
    category: 'Deployment',
    difficulty: 'mid',
    followUp: 'What metrics would you monitor during a canary deployment to decide whether to proceed?',
  },
  {
    id: 'sim-007',
    question: 'What security measures would you implement for a cloud-based application?',
    hints: ['Think layers of security', 'Consider access control', 'Data protection is key'],
    keyPoints: ['Network segmentation', 'IAM and least privilege', 'Encryption at rest and transit', 'Security scanning', 'Logging and monitoring', 'Secrets management'],
    category: 'Security',
    difficulty: 'mid',
    followUp: 'How would you respond if you discovered a compromised IAM credential?',
  },
  {
    id: 'sim-008',
    question: 'Describe how you would monitor a distributed system effectively.',
    hints: ['Think about the three pillars', 'Consider alerting strategy', 'Dashboards and visualization'],
    keyPoints: ['Metrics, logs, and traces', 'Centralized logging', 'APM tools', 'Alerting thresholds', 'SLOs and SLIs', 'On-call procedures'],
    category: 'Monitoring',
    difficulty: 'mid',
    followUp: 'How would you reduce alert fatigue while ensuring critical issues are caught?',
  },
  {
    id: 'sim-009',
    question: 'What is your approach to incident management and postmortems?',
    hints: ['Think about communication', 'Consider blameless culture', 'Focus on improvement'],
    keyPoints: ['Clear escalation paths', 'Communication channels', 'Blameless postmortems', 'Root cause analysis', 'Action items and follow-up', 'Documentation'],
    category: 'Incident Response',
    difficulty: 'senior',
    followUp: 'Give an example of an action item from a postmortem that prevented future incidents.',
  },
  {
    id: 'sim-010',
    question: 'How do containers differ from virtual machines?',
    hints: ['Think about isolation level', 'Consider resource usage', 'Startup time matters'],
    keyPoints: ['Containers share OS kernel', 'VMs have full OS', 'Containers are lighter', 'Different isolation levels', 'Use cases for each'],
    category: 'Containers',
    difficulty: 'junior',
    followUp: 'When would you choose a VM over a container for a production workload?',
  },
  {
    id: 'sim-011',
    question: 'Explain the concept of GitOps and how it improves deployment workflows.',
    hints: ['Git as single source of truth', 'Declarative infrastructure', 'Pull-based deployments'],
    keyPoints: ['Git repository as source of truth', 'Declarative desired state', 'Automated reconciliation', 'Audit trail via git history', 'Tools: ArgoCD, Flux'],
    category: 'GitOps',
    difficulty: 'mid',
    followUp: 'How would you handle drift detection between the desired state in Git and the actual cluster state?',
  },
  {
    id: 'sim-012',
    question: 'How would you design a disaster recovery plan for a multi-region application?',
    hints: ['RTO and RPO targets', 'Data replication strategies', 'Failover automation'],
    keyPoints: ['Define RTO/RPO objectives', 'Active-passive vs active-active', 'Data replication and backup', 'Automated failover mechanisms', 'Regular DR testing drills'],
    category: 'Disaster Recovery',
    difficulty: 'senior',
    followUp: 'What is the difference between RTO and RPO, and how do they affect your architecture choices?',
  },
  {
    id: 'sim-013',
    question: 'Describe the Twelve-Factor App methodology and why it matters for DevOps.',
    hints: ['Think about portability', 'Config management', 'Stateless processes'],
    keyPoints: ['Codebase tracked in version control', 'Config in environment variables', 'Stateless processes', 'Port binding', 'Dev/prod parity', 'Logs as event streams'],
    category: 'Architecture',
    difficulty: 'mid',
    followUp: 'Which factor do teams most commonly violate, and what problems does it cause?',
  },
  {
    id: 'sim-014',
    question: 'How would you implement role-based access control (RBAC) in a Kubernetes cluster?',
    hints: ['Think about Roles vs ClusterRoles', 'Service accounts', 'Least privilege principle'],
    keyPoints: ['Roles and RoleBindings for namespace-scoped', 'ClusterRoles for cluster-wide', 'Service accounts for pods', 'Principle of least privilege', 'Audit logging for access'],
    category: 'Kubernetes',
    difficulty: 'senior',
    followUp: 'How would you audit and review RBAC permissions periodically to prevent privilege creep?',
  },
  {
    id: 'sim-015',
    question: 'Explain service mesh architecture and when you would introduce one.',
    hints: ['Think about service-to-service communication', 'Observability benefits', 'Sidecar pattern'],
    keyPoints: ['Sidecar proxy pattern (Envoy)', 'mTLS between services', 'Traffic management and routing', 'Observability (traces, metrics)', 'Complexity tradeoff considerations'],
    category: 'Networking',
    difficulty: 'senior',
    followUp: 'What are the performance implications of adding a sidecar proxy to every pod?',
  },
];

interface QuestionResponse {
  questionId: string;
  selfRating: 'poor' | 'okay' | 'good' | 'excellent' | null;
  timeSpent: number;
  usedHints: boolean;
  notes: string;
  followUpRating?: 'poor' | 'okay' | 'good' | 'excellent' | null;
}

const InterviewSimulation = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { playSound, isSoundEnabled, toggleSound } = useSoundEffects();
  const isMuted = !isSoundEnabled();
  const notesRef = useRef<HTMLTextAreaElement>(null);
  
  const [phase, setPhase] = useState<'intro' | 'interview' | 'followup' | 'review' | 'complete'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [questionTimer, setQuestionTimer] = useState(0);
  const [responses, setResponses] = useState<QuestionResponse[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [interviewerMood, setInterviewerMood] = useState<'neutral' | 'impressed' | 'encouraging' | 'challenging'>('neutral');
  const [currentNotes, setCurrentNotes] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [confidenceBoost, setConfidenceBoost] = useState(0);

  const currentQuestion = interviewQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interviewQuestions.length) * 100;

  // Global timer
  useEffect(() => {
    if (phase === 'interview' || phase === 'followup') {
      const timer = setInterval(() => setTimeElapsed(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Per-question timer
  useEffect(() => {
    if (phase === 'interview' || phase === 'followup') {
      const timer = setInterval(() => setQuestionTimer(prev => prev + 1), 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Dynamic interviewer mood based on performance
  useEffect(() => {
    const recentRatings = responses.slice(-3).map(r => r.selfRating);
    const excellentCount = recentRatings.filter(r => r === 'excellent').length;
    const poorCount = recentRatings.filter(r => r === 'poor').length;
    
    if (excellentCount >= 2) setInterviewerMood('impressed');
    else if (poorCount >= 2) setInterviewerMood('encouraging');
    else if (currentQuestion?.difficulty === 'senior') setInterviewerMood('challenging');
    else setInterviewerMood('neutral');
  }, [currentQuestionIndex, responses, currentQuestion?.difficulty]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = () => {
    playSound('levelUp');
    setPhase('interview');
    setQuestionStartTime(Date.now());
    setQuestionTimer(0);
  };

  const getInterviewerMessage = () => {
    switch (interviewerMood) {
      case 'impressed':
        return "Excellent answers so far! You clearly have strong experience. Let's see how you handle this one.";
      case 'encouraging':
        return "Take your time with this one. Think about what you've seen in real projects and walk me through it step by step.";
      case 'challenging':
        return "This is a senior-level question. I'm looking for depth and real-world experience in your answer.";
      default:
        return "Please walk me through your answer when you're ready. There's no rush.";
    }
  };

  const getInterviewerEmoji = () => {
    switch (interviewerMood) {
      case 'impressed': return '😊';
      case 'encouraging': return '🤔';
      case 'challenging': return '🧐';
      default: return '👤';
    }
  };

  const handleSelfRating = (rating: 'poor' | 'okay' | 'good' | 'excellent') => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);

    if (rating === 'excellent' || rating === 'good') {
      playSound('correct');
      setConfidenceBoost(prev => prev + 1);
    }

    const response: QuestionResponse = {
      questionId: currentQuestion.id,
      selfRating: rating,
      timeSpent,
      usedHints: showHints,
      notes: currentNotes,
    };

    setResponses(prev => [...prev, response]);

    // Show follow-up question if available
    if (currentQuestion.followUp && (rating === 'good' || rating === 'excellent')) {
      setShowFollowUp(true);
      setPhase('followup');
      setQuestionTimer(0);
    } else {
      moveToNextQuestion();
    }
  };

  const handleFollowUpRating = (rating: 'poor' | 'okay' | 'good' | 'excellent') => {
    // Update the last response with follow-up rating
    setResponses(prev => {
      const updated = [...prev];
      updated[updated.length - 1] = { ...updated[updated.length - 1], followUpRating: rating };
      return updated;
    });

    if (rating === 'excellent' || rating === 'good') playSound('correct');
    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHints(false);
      setShowAnswer(false);
      setShowFollowUp(false);
      setCurrentNotes('');
      setQuestionStartTime(Date.now());
      setQuestionTimer(0);
      setPhase('interview');
    } else {
      setPhase('review');
      playSound('badge');
    }
  };

  const calculateScore = useCallback(() => {
    const ratingPoints = { poor: 0, okay: 1, good: 2, excellent: 3 };
    let totalPoints = 0;
    let maxPoints = responses.length * 3;
    
    responses.forEach(r => {
      if (r.selfRating) {
        totalPoints += ratingPoints[r.selfRating];
        if (!r.usedHints && (r.selfRating === 'good' || r.selfRating === 'excellent')) {
          totalPoints += 0.5;
        }
        // Bonus for follow-up answers
        if (r.followUpRating) {
          totalPoints += ratingPoints[r.followUpRating] * 0.5;
          maxPoints += 1.5;
        }
      }
    });

    return Math.min(Math.round((totalPoints / maxPoints) * 100), 100);
  }, [responses]);

  const handleComplete = () => {
    const score = calculateScore();
    const xpEarned = Math.round((score / 100) * 300);
    dispatch({ type: 'ADD_XP', payload: xpEarned });
    playSound('levelUp');
    navigate('/');
  };

  if (!state.user) {
    navigate('/');
    return null;
  }

  // INTRO
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Interview Simulation</h1>
            </div>
          </div>

          <Card className="p-8 text-center border-primary/20 bg-gradient-to-b from-background to-primary/5">
            <div className="text-7xl mb-6">🎯</div>
            <h2 className="text-3xl font-bold mb-2">Mock Interview Session</h2>
            <p className="text-muted-foreground mb-2">
              Face {interviewQuestions.length} real DevOps interview questions from junior to senior level.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              Take notes, use hints, answer follow-up questions, and review your performance.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
              <div className="p-3 bg-muted/50 rounded-xl border border-border">
                <MessageSquare className="h-5 w-5 mx-auto mb-1 text-primary" />
                <p className="text-xs font-medium">{interviewQuestions.length} Questions</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl border border-border">
                <Brain className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                <p className="text-xs font-medium">Follow-ups</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl border border-border">
                <PenLine className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                <p className="text-xs font-medium">Note-taking</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl border border-border">
                <Award className="h-5 w-5 mx-auto mb-1 text-green-500" />
                <p className="text-xs font-medium">Up to 300 XP</p>
              </div>
            </div>

            <div className="mb-6 p-4 rounded-xl bg-muted/30 border border-border text-left">
              <p className="text-sm font-medium mb-2">📋 How it works:</p>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Read the question and think through your answer</li>
                <li>Take notes to organize your thoughts</li>
                <li>Use hints if you're stuck (affects score)</li>
                <li>Rate your confidence honestly</li>
                <li>Answer follow-up questions for bonus points</li>
                <li>Review all answers at the end</li>
              </ol>
            </div>

            <Button onClick={startInterview} className="btn-glow" size="lg">
              <Briefcase className="mr-2 h-5 w-5" />
              Begin Interview
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // FOLLOW-UP
  if (phase === 'followup') {
    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Follow-up Question</h1>
                <p className="text-sm text-muted-foreground">Bonus round for Q{currentQuestionIndex + 1}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Timer className="h-4 w-4" />
              <span className="font-mono">{formatTime(timeElapsed)}</span>
            </div>
          </div>

          <Card className="p-4 mb-6 bg-purple-500/10 border-purple-500/30">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">
                🧐
              </div>
              <div className="flex-1">
                <p className="font-medium mb-1">Interviewer — Follow-up</p>
                <p className="text-sm italic text-muted-foreground">"Good answer. Let me dig deeper..."</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 mb-6 border-purple-500/20">
            <Badge variant="outline" className="mb-4 border-purple-500/50 text-purple-500">⭐ Bonus Follow-up</Badge>
            <h2 className="text-xl font-semibold mb-6">{currentQuestion.followUp}</h2>

            <div className="border-t pt-6">
              <p className="font-medium mb-4">How well did you answer the follow-up?</p>
              <div className="grid grid-cols-4 gap-3">
                {(['poor', 'okay', 'good', 'excellent'] as const).map(rating => (
                  <Button
                    key={rating}
                    variant="outline"
                    className={`flex flex-col gap-1 h-auto py-3 ${
                      rating === 'poor' ? 'hover:bg-red-500/10 hover:border-red-500/50' :
                      rating === 'okay' ? 'hover:bg-yellow-500/10 hover:border-yellow-500/50' :
                      rating === 'good' ? 'hover:bg-blue-500/10 hover:border-blue-500/50' :
                      'hover:bg-green-500/10 hover:border-green-500/50'
                    }`}
                    onClick={() => handleFollowUpRating(rating)}
                  >
                    <span className="text-xl">
                      {rating === 'poor' ? '😓' : rating === 'okay' ? '😐' : rating === 'good' ? '😊' : '🌟'}
                    </span>
                    <span className="text-xs capitalize">{rating}</span>
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          <Button variant="ghost" className="w-full" onClick={moveToNextQuestion}>
            Skip follow-up <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // INTERVIEW
  if (phase === 'interview') {
    const timerColor = questionTimer > 180 ? 'text-red-500' : questionTimer > 120 ? 'text-yellow-500' : 'text-muted-foreground';

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold">Interview Session</h1>
                <p className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {interviewQuestions.length}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${timerColor}`}>
                <Timer className="h-4 w-4" />
                <span className="font-mono text-sm">{formatTime(questionTimer)}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="font-mono text-xs">Total: {formatTime(timeElapsed)}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => toggleSound(!isSoundEnabled())}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <Progress value={progress} className="mb-6" />

          {/* Confidence streak */}
          {confidenceBoost >= 3 && (
            <div className="mb-4 p-2 rounded-lg bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-500">Confidence streak! {confidenceBoost} strong answers in a row</span>
            </div>
          )}

          {/* Interviewer */}
          <Card className="p-4 mb-6 bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-2xl">
                {getInterviewerEmoji()}
              </div>
              <div className="flex-1">
                <p className="font-medium mb-1">Interviewer</p>
                <p className="text-sm text-muted-foreground italic">"{getInterviewerMessage()}"</p>
              </div>
            </div>
          </Card>

          {/* Question */}
          <Card className="p-6 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">{currentQuestion.category}</Badge>
              <Badge variant={
                currentQuestion.difficulty === 'junior' ? 'default' :
                currentQuestion.difficulty === 'mid' ? 'secondary' : 'destructive'
              }>
                {currentQuestion.difficulty}
              </Badge>
              {currentQuestion.followUp && (
                <Badge variant="outline" className="border-purple-500/50 text-purple-500 text-xs">
                  Has follow-up
                </Badge>
              )}
            </div>

            <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

            {/* Notes */}
            <div className="mb-4">
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <PenLine className="h-4 w-4 text-blue-500" />
                Your Notes (optional)
              </label>
              <Textarea
                ref={notesRef}
                placeholder="Jot down key points, structure your answer..."
                value={currentNotes}
                onChange={e => setCurrentNotes(e.target.value)}
                className="min-h-[80px] text-sm"
              />
            </div>

            {/* Hints */}
            {!showHints ? (
              <Button variant="outline" className="mb-4" onClick={() => setShowHints(true)}>
                <Lightbulb className="mr-2 h-4 w-4" /> Show Hints (affects score)
              </Button>
            ) : (
              <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" /> Hints:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {currentQuestion.hints.map((hint, i) => <li key={i}>{hint}</li>)}
                </ul>
              </div>
            )}

            {/* Key Points */}
            {!showAnswer ? (
              <Button variant="secondary" className="mb-6" onClick={() => setShowAnswer(true)}>
                <CheckCircle2 className="mr-2 h-4 w-4" /> Reveal Key Points
              </Button>
            ) : (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Key Points to Cover:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {currentQuestion.keyPoints.map((point, i) => <li key={i}>{point}</li>)}
                </ul>
              </div>
            )}

            {/* Self Rating */}
            <div className="border-t pt-6">
              <p className="font-medium mb-4">How well did you answer this question?</p>
              <div className="grid grid-cols-4 gap-3">
                {(['poor', 'okay', 'good', 'excellent'] as const).map(rating => (
                  <Button
                    key={rating}
                    variant="outline"
                    className={`flex flex-col gap-1 h-auto py-3 ${
                      rating === 'poor' ? 'hover:bg-red-500/10 hover:border-red-500/50' :
                      rating === 'okay' ? 'hover:bg-yellow-500/10 hover:border-yellow-500/50' :
                      rating === 'good' ? 'hover:bg-blue-500/10 hover:border-blue-500/50' :
                      'hover:bg-green-500/10 hover:border-green-500/50'
                    }`}
                    onClick={() => handleSelfRating(rating)}
                  >
                    <span className="text-xl">
                      {rating === 'poor' ? '😓' : rating === 'okay' ? '😐' : rating === 'good' ? '😊' : '🌟'}
                    </span>
                    <span className="text-xs capitalize">{rating}</span>
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // REVIEW PHASE
  if (phase === 'review') {
    const score = calculateScore();
    const xpEarned = Math.round((score / 100) * 300);
    const excellentCount = responses.filter(r => r.selfRating === 'excellent').length;
    const goodCount = responses.filter(r => r.selfRating === 'good').length;
    const noHintsCount = responses.filter(r => !r.usedHints).length;
    const followUpCount = responses.filter(r => r.followUpRating).length;
    const avgTime = Math.round(responses.reduce((sum, r) => sum + r.timeSpent, 0) / responses.length);

    const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
    const gradeColor = score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : 'text-red-500';

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <Card className="p-8 text-center mb-6">
            <div className="text-7xl mb-4">🎉</div>
            <h2 className="text-3xl font-bold mb-2">Interview Complete!</h2>
            <p className="text-muted-foreground mb-6">Here's your detailed performance breakdown</p>

            <div className="flex items-center justify-center gap-6 mb-8">
              <div>
                <p className={`text-6xl font-bold ${gradeColor}`}>{grade}</p>
                <p className="text-sm text-muted-foreground">Grade</p>
              </div>
              <div className="h-16 w-px bg-border" />
              <div>
                <p className="text-5xl font-bold">{score}%</p>
                <p className="text-sm text-muted-foreground">Confidence Score</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
              <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                <p className="text-2xl font-bold text-green-500">{excellentCount}</p>
                <p className="text-xs text-muted-foreground">Excellent</p>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                <p className="text-2xl font-bold text-blue-500">{goodCount}</p>
                <p className="text-xs text-muted-foreground">Good</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <p className="text-2xl font-bold text-yellow-500">{noHintsCount}</p>
                <p className="text-xs text-muted-foreground">No Hints</p>
              </div>
              <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                <p className="text-2xl font-bold text-purple-500">{followUpCount}</p>
                <p className="text-xs text-muted-foreground">Follow-ups</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-xl border border-border">
                <p className="text-2xl font-bold">{formatTime(avgTime)}</p>
                <p className="text-xs text-muted-foreground">Avg Time</p>
              </div>
            </div>
          </Card>

          {/* Per-question review */}
          <h3 className="text-lg font-bold mb-4">📋 Question-by-Question Review</h3>
          <div className="space-y-3 mb-8">
            {responses.map((response, idx) => {
              const question = interviewQuestions.find(q => q.id === response.questionId);
              if (!question) return null;
              const ratingEmoji = response.selfRating === 'excellent' ? '🌟' : response.selfRating === 'good' ? '😊' : response.selfRating === 'okay' ? '😐' : '😓';
              return (
                <Card key={idx} className="p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{ratingEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{question.question}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{question.category}</Badge>
                        <span className="text-xs text-muted-foreground">{formatTime(response.timeSpent)}</span>
                        {response.usedHints && <span className="text-xs text-yellow-500">Used hints</span>}
                        {response.followUpRating && <span className="text-xs text-purple-500">+follow-up</span>}
                      </div>
                      {response.notes && (
                        <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">📝 {response.notes}</p>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <Card className="p-6 mb-6 bg-primary/10 border-primary/30 text-center">
            <p className="text-2xl font-bold">+{xpEarned} XP</p>
            <p className="text-sm text-muted-foreground">Total interview time: {formatTime(timeElapsed)}</p>
          </Card>

          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => {
              setPhase('intro');
              setCurrentQuestionIndex(0);
              setResponses([]);
              setTimeElapsed(0);
              setConfidenceBoost(0);
            }}>
              <RotateCcw className="mr-2 h-4 w-4" /> Retry Interview
            </Button>
            <Button onClick={handleComplete} className="btn-glow">
              <Award className="mr-2 h-4 w-4" /> Claim XP & Finish
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default InterviewSimulation;
