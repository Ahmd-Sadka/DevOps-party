import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Briefcase, 
  Clock, 
  MessageSquare, 
  User, 
  CheckCircle2, 
  XCircle,
  Volume2,
  VolumeX,
  Lightbulb,
  Award,
  Timer
} from 'lucide-react';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface InterviewQuestion {
  id: string;
  question: string;
  hints: string[];
  keyPoints: string[];
  category: string;
  difficulty: 'junior' | 'mid' | 'senior';
}

const interviewQuestions: InterviewQuestion[] = [
  {
    id: 'sim-001',
    question: 'Walk me through how you would troubleshoot a production server that has become unresponsive.',
    hints: ['Start with basic connectivity checks', 'Consider resource usage', 'Think about recent changes'],
    keyPoints: ['Check ping/SSH connectivity', 'Review resource usage (CPU, memory, disk)', 'Check logs', 'Review recent deployments/changes', 'Escalation if needed'],
    category: 'Troubleshooting',
    difficulty: 'junior',
  },
  {
    id: 'sim-002',
    question: 'Explain the difference between TCP and UDP. When would you use each?',
    hints: ['Think about reliability vs speed', 'Consider connection state', 'Real-world examples help'],
    keyPoints: ['TCP: connection-oriented, reliable, ordered', 'UDP: connectionless, faster, no guarantee', 'TCP: web, email, file transfer', 'UDP: streaming, gaming, DNS'],
    category: 'Networking',
    difficulty: 'junior',
  },
  {
    id: 'sim-003',
    question: 'How would you design a CI/CD pipeline for a microservices application?',
    hints: ['Think about stages', 'Consider testing strategy', 'Deployment strategies matter'],
    keyPoints: ['Source control triggers', 'Build and unit tests', 'Integration tests', 'Security scanning', 'Staging deployment', 'Production deployment with rollback'],
    category: 'CI/CD',
    difficulty: 'mid',
  },
  {
    id: 'sim-004',
    question: 'What is the purpose of Kubernetes liveness and readiness probes?',
    hints: ['Think about container health', 'Consider traffic routing', 'What happens when they fail?'],
    keyPoints: ['Liveness: restart if unhealthy', 'Readiness: traffic routing control', 'Different failure actions', 'Configuration best practices'],
    category: 'Kubernetes',
    difficulty: 'junior',
  },
  {
    id: 'sim-005',
    question: 'Explain Infrastructure as Code. What are the benefits and challenges?',
    hints: ['Think about version control', 'Consider reproducibility', 'Team collaboration aspects'],
    keyPoints: ['Version controlled infrastructure', 'Reproducible environments', 'Automated provisioning', 'Challenges: state management, drift, learning curve'],
    category: 'IaC',
    difficulty: 'junior',
  },
  {
    id: 'sim-006',
    question: 'How would you implement zero-downtime deployments?',
    hints: ['Think about deployment strategies', 'Consider load balancing', 'Database migrations matter'],
    keyPoints: ['Blue-green or canary deployments', 'Load balancer health checks', 'Rolling updates', 'Database backward compatibility', 'Rollback strategy'],
    category: 'Deployment',
    difficulty: 'mid',
  },
  {
    id: 'sim-007',
    question: 'What security measures would you implement for a cloud-based application?',
    hints: ['Think layers of security', 'Consider access control', 'Data protection is key'],
    keyPoints: ['Network segmentation', 'IAM and least privilege', 'Encryption at rest and transit', 'Security scanning', 'Logging and monitoring', 'Secrets management'],
    category: 'Security',
    difficulty: 'mid',
  },
  {
    id: 'sim-008',
    question: 'Describe how you would monitor a distributed system effectively.',
    hints: ['Think about the three pillars', 'Consider alerting strategy', 'Dashboards and visualization'],
    keyPoints: ['Metrics, logs, and traces', 'Centralized logging', 'APM tools', 'Alerting thresholds', 'SLOs and SLIs', 'On-call procedures'],
    category: 'Monitoring',
    difficulty: 'mid',
  },
  {
    id: 'sim-009',
    question: 'What is your approach to incident management and postmortems?',
    hints: ['Think about communication', 'Consider blameless culture', 'Focus on improvement'],
    keyPoints: ['Clear escalation paths', 'Communication channels', 'Blameless postmortems', 'Root cause analysis', 'Action items and follow-up', 'Documentation'],
    category: 'Incident Response',
    difficulty: 'senior',
  },
  {
    id: 'sim-010',
    question: 'How do containers differ from virtual machines?',
    hints: ['Think about isolation level', 'Consider resource usage', 'Startup time matters'],
    keyPoints: ['Containers share OS kernel', 'VMs have full OS', 'Containers are lighter', 'Different isolation levels', 'Use cases for each'],
    category: 'Containers',
    difficulty: 'junior',
  },
];

const InterviewSimulation = () => {
  const navigate = useNavigate();
  const { state, dispatch } = useGame();
  const { playSound, isSoundEnabled, toggleSound } = useSoundEffects();
  const isMuted = !isSoundEnabled();
  
  const [phase, setPhase] = useState<'intro' | 'interview' | 'review' | 'complete'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showHints, setShowHints] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [responses, setResponses] = useState<Array<{
    questionId: string;
    selfRating: 'poor' | 'okay' | 'good' | 'excellent' | null;
    timeSpent: number;
    usedHints: boolean;
  }>>([]);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [interviewerMood, setInterviewerMood] = useState<'neutral' | 'impressed' | 'encouraging'>('neutral');

  const currentQuestion = interviewQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / interviewQuestions.length) * 100;

  // Timer effect
  useEffect(() => {
    if (phase === 'interview') {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase]);

  // Interviewer mood changes
  useEffect(() => {
    const moods: Array<'neutral' | 'impressed' | 'encouraging'> = ['neutral', 'impressed', 'encouraging'];
    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    setInterviewerMood(randomMood);
  }, [currentQuestionIndex]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startInterview = () => {
    playSound('levelUp');
    setPhase('interview');
    setQuestionStartTime(Date.now());
  };

  const handleSelfRating = (rating: 'poor' | 'okay' | 'good' | 'excellent') => {
    const timeSpent = Math.floor((Date.now() - questionStartTime) / 1000);
    
    setResponses(prev => [...prev, {
      questionId: currentQuestion.id,
      selfRating: rating,
      timeSpent,
      usedHints: showHints,
    }]);

    if (rating === 'excellent' || rating === 'good') {
      playSound('correct');
    }

    // Move to next question or complete
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setShowHints(false);
      setShowAnswer(false);
      setQuestionStartTime(Date.now());
    } else {
      setPhase('complete');
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
        // Bonus for not using hints
        if (!r.usedHints && (r.selfRating === 'good' || r.selfRating === 'excellent')) {
          totalPoints += 0.5;
        }
      }
    });

    return Math.round((totalPoints / maxPoints) * 100);
  }, [responses]);

  const getInterviewerMessage = () => {
    switch (interviewerMood) {
      case 'impressed':
        return "Great question understanding! Take your time to think through this.";
      case 'encouraging':
        return "Don't worry, you're doing well. Feel free to think out loud.";
      default:
        return "Please walk me through your answer when you're ready.";
    }
  };

  const handleComplete = () => {
    const score = calculateScore();
    const xpEarned = Math.round((score / 100) * 200);
    
    dispatch({ type: 'ADD_XP', payload: xpEarned });
    playSound('levelUp');
    navigate('/');
  };

  if (!state.user) {
    navigate('/');
    return null;
  }

  // Intro Phase
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

          <Card className="p-8 text-center">
            <div className="text-6xl mb-6">🎯</div>
            <h2 className="text-2xl font-bold mb-4">Mock Interview Session</h2>
            <p className="text-muted-foreground mb-6">
              Practice answering real DevOps interview questions. You'll be asked {interviewQuestions.length} questions 
              covering various topics. Think through your answers, use hints if needed, and rate your own performance.
            </p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-muted rounded-lg">
                <MessageSquare className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">{interviewQuestions.length} Questions</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <Lightbulb className="h-6 w-6 mx-auto mb-2 text-yellow-500" />
                <p className="text-sm font-medium">Hints Available</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <Award className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-medium">Up to 200 XP</p>
              </div>
            </div>

            <Button onClick={startInterview} className="btn-glow" size="lg">
              <Briefcase className="mr-2 h-5 w-5" />
              Start Interview
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  // Interview Phase
  if (phase === 'interview') {
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
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="h-4 w-4" />
                <span className="font-mono">{formatTime(timeElapsed)}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => toggleSound(!isSoundEnabled())}>
                {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Progress */}
          <Progress value={progress} className="mb-6" />

          {/* Interviewer */}
          <Card className="p-4 mb-6 bg-muted/50">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-medium mb-1">Interviewer</p>
                <p className="text-sm text-muted-foreground italic">"{getInterviewerMessage()}"</p>
              </div>
            </div>
          </Card>

          {/* Question Card */}
          <Card className="p-6 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="outline">{currentQuestion.category}</Badge>
              <Badge variant={
                currentQuestion.difficulty === 'junior' ? 'default' :
                currentQuestion.difficulty === 'mid' ? 'secondary' : 'destructive'
              }>
                {currentQuestion.difficulty}
              </Badge>
            </div>

            <h2 className="text-xl font-semibold mb-6">{currentQuestion.question}</h2>

            {/* Hints Section */}
            {!showHints ? (
              <Button 
                variant="outline" 
                className="mb-4"
                onClick={() => setShowHints(true)}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Show Hints
              </Button>
            ) : (
              <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Hints:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  {currentQuestion.hints.map((hint, i) => (
                    <li key={i}>{hint}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Points (Answer) */}
            {!showAnswer ? (
              <Button 
                variant="secondary" 
                className="mb-6"
                onClick={() => setShowAnswer(true)}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Reveal Key Points
              </Button>
            ) : (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <p className="font-medium mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  Key Points to Cover:
                </p>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {currentQuestion.keyPoints.map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Self Rating */}
            <div className="border-t pt-6">
              <p className="font-medium mb-4">How well did you answer this question?</p>
              <div className="grid grid-cols-4 gap-3">
                <Button 
                  variant="outline" 
                  className="flex flex-col gap-1 h-auto py-3 hover:bg-red-500/10 hover:border-red-500/50"
                  onClick={() => handleSelfRating('poor')}
                >
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-xs">Poor</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col gap-1 h-auto py-3 hover:bg-yellow-500/10 hover:border-yellow-500/50"
                  onClick={() => handleSelfRating('okay')}
                >
                  <span className="text-xl">😐</span>
                  <span className="text-xs">Okay</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col gap-1 h-auto py-3 hover:bg-blue-500/10 hover:border-blue-500/50"
                  onClick={() => handleSelfRating('good')}
                >
                  <span className="text-xl">😊</span>
                  <span className="text-xs">Good</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex flex-col gap-1 h-auto py-3 hover:bg-green-500/10 hover:border-green-500/50"
                  onClick={() => handleSelfRating('excellent')}
                >
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="text-xs">Excellent</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Complete Phase
  if (phase === 'complete') {
    const score = calculateScore();
    const xpEarned = Math.round((score / 100) * 200);
    const excellentCount = responses.filter(r => r.selfRating === 'excellent').length;
    const goodCount = responses.filter(r => r.selfRating === 'good').length;
    const noHintsCount = responses.filter(r => !r.usedHints).length;

    return (
      <div className="min-h-screen bg-background p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <Card className="p-8 text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
            <p className="text-muted-foreground mb-6">Great job practicing your interview skills!</p>

            <div className="text-5xl font-bold gradient-text mb-2">{score}%</div>
            <p className="text-muted-foreground mb-8">Overall Confidence Score</p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-green-500">{excellentCount}</p>
                <p className="text-sm text-muted-foreground">Excellent</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-blue-500">{goodCount}</p>
                <p className="text-sm text-muted-foreground">Good</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold text-yellow-500">{noHintsCount}</p>
                <p className="text-sm text-muted-foreground">No Hints</p>
              </div>
            </div>

            <div className="p-4 bg-primary/10 rounded-lg mb-8">
              <p className="text-lg font-semibold">+{xpEarned} XP Earned!</p>
              <p className="text-sm text-muted-foreground">Total time: {formatTime(timeElapsed)}</p>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={() => navigate('/interview')}>
                Back to Interview Prep
              </Button>
              <Button onClick={handleComplete} className="btn-glow">
                <Award className="mr-2 h-4 w-4" />
                Claim XP & Finish
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
};

export default InterviewSimulation;
