import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Terminal as TerminalIcon, Zap, Trophy, Clock, SkipForward, FlaskConical, BookOpen } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { TERMINAL_SCENARIOS, TerminalScenario } from '@/data/terminal-scenarios';

interface TerminalChallenge {
  id: string;
  description: string;
  command: string;
  hint: string;
  category: 'linux' | 'git' | 'docker' | 'kubernetes';
  difficulty: 'easy' | 'medium' | 'hard';
  xp: number;
}

const TERMINAL_CHALLENGES: TerminalChallenge[] = [
  // Linux Basics
  { id: 'ls-1', description: 'List all files including hidden ones', command: 'ls -la', hint: 'Use ls with flags for all and long format', category: 'linux', difficulty: 'easy', xp: 10 },
  { id: 'cd-1', description: 'Go to the home directory', command: 'cd ~', hint: 'Tilde represents home', category: 'linux', difficulty: 'easy', xp: 10 },
  { id: 'mkdir-1', description: 'Create a directory called "projects"', command: 'mkdir projects', hint: 'mkdir creates directories', category: 'linux', difficulty: 'easy', xp: 10 },
  { id: 'chmod-1', description: 'Make a script executable', command: 'chmod +x script.sh', hint: '+x adds execute permission', category: 'linux', difficulty: 'medium', xp: 15 },
  { id: 'grep-1', description: 'Search for "error" in all log files', command: 'grep error *.log', hint: 'grep searches text patterns', category: 'linux', difficulty: 'medium', xp: 15 },
  { id: 'find-1', description: 'Find all .txt files in current directory', command: 'find . -name "*.txt"', hint: 'find with -name pattern', category: 'linux', difficulty: 'medium', xp: 15 },
  { id: 'ps-1', description: 'Show all running processes', command: 'ps aux', hint: 'ps with aux shows all processes', category: 'linux', difficulty: 'easy', xp: 10 },
  { id: 'kill-1', description: 'Force kill process with PID 1234', command: 'kill -9 1234', hint: '-9 is SIGKILL', category: 'linux', difficulty: 'medium', xp: 15 },
  
  // Git Commands
  { id: 'git-1', description: 'Initialize a new git repository', command: 'git init', hint: 'init starts a new repo', category: 'git', difficulty: 'easy', xp: 10 },
  { id: 'git-2', description: 'Stage all changes for commit', command: 'git add .', hint: 'add . stages everything', category: 'git', difficulty: 'easy', xp: 10 },
  { id: 'git-3', description: 'Commit with message "Initial commit"', command: 'git commit -m "Initial commit"', hint: '-m adds inline message', category: 'git', difficulty: 'easy', xp: 10 },
  { id: 'git-4', description: 'Create and switch to branch "feature"', command: 'git checkout -b feature', hint: '-b creates new branch', category: 'git', difficulty: 'medium', xp: 15 },
  { id: 'git-5', description: 'Push to origin main branch', command: 'git push origin main', hint: 'push to remote origin', category: 'git', difficulty: 'easy', xp: 10 },
  { id: 'git-6', description: 'Rebase current branch onto main', command: 'git rebase main', hint: 'rebase replays commits', category: 'git', difficulty: 'hard', xp: 25 },
  
  // Docker Commands
  { id: 'docker-1', description: 'List all running containers', command: 'docker ps', hint: 'ps shows containers', category: 'docker', difficulty: 'easy', xp: 10 },
  { id: 'docker-2', description: 'Pull the nginx image', command: 'docker pull nginx', hint: 'pull downloads images', category: 'docker', difficulty: 'easy', xp: 10 },
  { id: 'docker-3', description: 'Run nginx container on port 8080', command: 'docker run -p 8080:80 nginx', hint: '-p maps ports host:container', category: 'docker', difficulty: 'medium', xp: 15 },
  { id: 'docker-4', description: 'Build image with tag "myapp:latest"', command: 'docker build -t myapp:latest .', hint: '-t sets the tag', category: 'docker', difficulty: 'medium', xp: 15 },
  { id: 'docker-5', description: 'Stop container with ID abc123', command: 'docker stop abc123', hint: 'stop gracefully stops containers', category: 'docker', difficulty: 'easy', xp: 10 },
  { id: 'docker-6', description: 'Remove all stopped containers', command: 'docker container prune', hint: 'prune removes stopped containers', category: 'docker', difficulty: 'medium', xp: 15 },
  
  // Kubernetes Commands
  { id: 'k8s-1', description: 'Get all pods in current namespace', command: 'kubectl get pods', hint: 'get lists resources', category: 'kubernetes', difficulty: 'easy', xp: 10 },
  { id: 'k8s-2', description: 'Apply a configuration file', command: 'kubectl apply -f config.yaml', hint: '-f specifies file', category: 'kubernetes', difficulty: 'easy', xp: 10 },
  { id: 'k8s-3', description: 'Describe pod named "web-server"', command: 'kubectl describe pod web-server', hint: 'describe shows detailed info', category: 'kubernetes', difficulty: 'medium', xp: 15 },
  { id: 'k8s-4', description: 'Get logs from pod "api-server"', command: 'kubectl logs api-server', hint: 'logs shows container output', category: 'kubernetes', difficulty: 'easy', xp: 10 },
  { id: 'k8s-5', description: 'Scale deployment "web" to 3 replicas', command: 'kubectl scale deployment web --replicas=3', hint: 'scale changes replica count', category: 'kubernetes', difficulty: 'medium', xp: 15 },
  { id: 'k8s-6', description: 'Execute bash in pod "debug"', command: 'kubectl exec -it debug -- bash', hint: 'exec runs commands in containers', category: 'kubernetes', difficulty: 'hard', xp: 25 },
];

const CATEGORY_COLORS = {
  linux: 'text-green-400',
  git: 'text-orange-400',
  docker: 'text-blue-400',
  kubernetes: 'text-purple-400',
};

const CATEGORY_EMOJIS = {
  linux: '🐧',
  git: '📦',
  docker: '🐳',
  kubernetes: '☸️',
};

const TerminalPage = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const { burstConfetti } = useConfetti();
  const { playSound } = useSoundEffects();
  const inputRef = useRef<HTMLInputElement>(null);
  
  const [currentChallenge, setCurrentChallenge] = useState<TerminalChallenge | null>(null);
  const [userInput, setUserInput] = useState('');
  const [history, setHistory] = useState<Array<{ type: 'prompt' | 'output' | 'error' | 'success'; text: string }>>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'commands' | 'scenarios'>('commands');
  // Scenario Lab state
  const [activeScenario, setActiveScenario] = useState<TerminalScenario | null>(null);
  const [scenarioStep, setScenarioStep] = useState(0);
  const [scenarioHistory, setScenarioHistory] = useState<Array<{ type: 'prompt' | 'output' | 'error' | 'success' | 'info'; text: string }>>([]);
  const [scenarioInput, setScenarioInput] = useState('');
  const [scenarioPhase, setScenarioPhase] = useState<'select' | 'playing' | 'complete'>('select');
  const [scenarioXP, setScenarioXP] = useState(0);
  const terminalRef = useRef<HTMLDivElement>(null);
  const scenarioTermRef = useRef<HTMLDivElement>(null);
  const scenarioInputRef = useRef<HTMLInputElement>(null);

  const user = state.user;

  useEffect(() => {
    if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(timer);
    } else if (isPlaying && timeLeft === 0) {
      endGame();
    }
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  const startGame = (category: string | null = null) => {
    setSelectedCategory(category);
    setIsPlaying(true);
    setTimeLeft(120); // 2 minutes
    setScore(0);
    setStreak(0);
    setCompletedChallenges([]);
    setHistory([
      { type: 'output', text: '╔══════════════════════════════════════╗' },
      { type: 'output', text: '║   🖥️  TERMINAL CHALLENGE MODE  🖥️    ║' },
      { type: 'output', text: '╚══════════════════════════════════════╝' },
      { type: 'output', text: '' },
      { type: 'output', text: 'Type the correct command for each challenge!' },
      { type: 'output', text: 'Press TAB for hints, ENTER to submit.' },
      { type: 'output', text: '' },
    ]);
    nextChallenge(category);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const nextChallenge = useCallback((category: string | null = selectedCategory) => {
    const available = TERMINAL_CHALLENGES.filter(
      c => !completedChallenges.includes(c.id) && (!category || c.category === category)
    );
    
    if (available.length === 0) {
      endGame();
      return;
    }
    
    const challenge = available[Math.floor(Math.random() * available.length)];
    setCurrentChallenge(challenge);
    setShowHint(false);
    setUserInput('');
    
    setHistory(h => [
      ...h,
      { type: 'output', text: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━` },
      { type: 'output', text: `${CATEGORY_EMOJIS[challenge.category]} [${challenge.category.toUpperCase()}] ${challenge.difficulty.toUpperCase()}` },
      { type: 'prompt', text: `📋 ${challenge.description}` },
    ]);
  }, [completedChallenges, selectedCategory]);

  const endGame = () => {
    setIsPlaying(false);
    const bonusXP = Math.floor(score * 1.5);
    
    if (user && bonusXP > 0) {
      dispatch({ type: 'ADD_XP', payload: bonusXP });
    }
    
    setHistory(h => [
      ...h,
      { type: 'output', text: '' },
      { type: 'output', text: '╔══════════════════════════════════════╗' },
      { type: 'success', text: `║   🎉 GAME OVER! Score: ${score} XP   ` },
      { type: 'success', text: `║   🏆 Bonus XP Earned: +${bonusXP}   ` },
      { type: 'output', text: '╚══════════════════════════════════════╝' },
    ]);
    
    if (score > 50) {
      burstConfetti();
      playSound('levelUp');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChallenge || !isPlaying) return;
    
    const normalizedInput = userInput.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedCommand = currentChallenge.command.toLowerCase().replace(/\s+/g, ' ');
    
    setHistory(h => [...h, { type: 'prompt', text: `$ ${userInput}` }]);
    
    if (normalizedInput === normalizedCommand) {
      // Correct!
      playSound('correct');
      const xpEarned = currentChallenge.xp * (1 + streak * 0.1);
      setScore(s => s + Math.floor(xpEarned));
      setStreak(s => s + 1);
      setCompletedChallenges(c => [...c, currentChallenge.id]);
      
      setHistory(h => [
        ...h,
        { type: 'success', text: `✅ Correct! +${Math.floor(xpEarned)} XP ${streak > 0 ? `(🔥 ${streak + 1}x streak!)` : ''}` },
      ]);
      
      setTimeout(() => nextChallenge(), 800);
    } else {
      // Wrong
      playSound('wrong');
      setStreak(0);
      
      setHistory(h => [
        ...h,
        { type: 'error', text: `❌ Incorrect. Try again!` },
      ]);
    }
    
    setUserInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      setShowHint(true);
      if (currentChallenge) {
        setHistory(h => [...h, { type: 'output', text: `💡 Hint: ${currentChallenge.hint}` }]);
      }
    }
  };

  const skipChallenge = () => {
    if (!currentChallenge) return;
    setStreak(0);
    setHistory(h => [
      ...h,
      { type: 'output', text: `⏭️ Skipped. The answer was: ${currentChallenge.command}` },
    ]);
    setCompletedChallenges(c => [...c, currentChallenge.id]);
    setTimeout(() => nextChallenge(), 500);
  };

  useEffect(() => {
    if (scenarioTermRef.current) {
      scenarioTermRef.current.scrollTop = scenarioTermRef.current.scrollHeight;
    }
  }, [scenarioHistory]);

  const startScenario = (scenario: TerminalScenario) => {
    setActiveScenario(scenario);
    setScenarioStep(0);
    setScenarioXP(0);
    setScenarioPhase('playing');
    setScenarioInput('');
    const step = scenario.steps[0];
    setScenarioHistory([
      { type: 'output', text: `╔══════════════════════════════════════════╗` },
      { type: 'output', text: `║  ${scenario.emoji}  SCENARIO: ${scenario.title.toUpperCase()}` },
      { type: 'output', text: `╚══════════════════════════════════════════╝` },
      { type: 'output', text: '' },
      { type: 'info', text: scenario.description },
      { type: 'output', text: '' },
      { type: 'output', text: `━━━ Step 1/${scenario.steps.length} ━━━` },
      { type: 'prompt', text: `📋 ${step.instruction}` },
    ]);
    setTimeout(() => scenarioInputRef.current?.focus(), 100);
  };

  const handleScenarioSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeScenario || scenarioPhase !== 'playing') return;

    const step = activeScenario.steps[scenarioStep];
    const normalized = scenarioInput.trim().toLowerCase().replace(/\s+/g, ' ');
    const expected = step.expectedCommand.toLowerCase().replace(/\s+/g, ' ');
    const alts = (step.alternativeCommands || []).map(c => c.toLowerCase().replace(/\s+/g, ' '));
    const isCorrect = normalized === expected || alts.includes(normalized);

    setScenarioHistory(h => [...h, { type: 'prompt', text: `$ ${scenarioInput}` }]);

    if (isCorrect) {
      playSound('correct');
      const stepXP = Math.round(activeScenario.xpReward / activeScenario.steps.length);
      setScenarioXP(prev => prev + stepXP);

      setScenarioHistory(h => [
        ...h,
        { type: 'output', text: step.simulatedOutput },
        { type: 'success', text: `✅ Correct! +${stepXP} XP` },
        { type: 'info', text: `📖 ${step.educationalNote}` },
        { type: 'output', text: '' },
      ]);

      const nextStep = scenarioStep + 1;
      if (nextStep >= activeScenario.steps.length) {
        // Scenario complete
        const totalXP = scenarioXP + stepXP;
        dispatch({ type: 'ADD_XP', payload: totalXP });
        setScenarioHistory(h => [
          ...h,
          { type: 'output', text: `╔══════════════════════════════════════════╗` },
          { type: 'success', text: `║  🎉 SCENARIO COMPLETE! +${totalXP} XP  ` },
          { type: 'output', text: `╚══════════════════════════════════════════╝` },
        ]);
        burstConfetti();
        playSound('levelUp');
        setScenarioPhase('complete');
      } else {
        setScenarioStep(nextStep);
        const next = activeScenario.steps[nextStep];
        setScenarioHistory(h => [
          ...h,
          { type: 'output', text: `━━━ Step ${nextStep + 1}/${activeScenario.steps.length} ━━━` },
          { type: 'prompt', text: `📋 ${next.instruction}` },
        ]);
      }
    } else {
      playSound('wrong');
      setScenarioHistory(h => [
        ...h,
        { type: 'error', text: `❌ Not quite. Try again!` },
        { type: 'output', text: `💡 Hint: ${step.hint}` },
      ]);
    }

    setScenarioInput('');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <TerminalIcon className="h-6 w-6 text-green-400" />
            <h1 className="text-2xl font-bold">Terminal Challenge</h1>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'commands' ? 'default' : 'outline'}
            onClick={() => setActiveTab('commands')}
            className="flex-1"
          >
            <TerminalIcon className="mr-2 h-4 w-4" />
            Command Challenge
          </Button>
          <Button
            variant={activeTab === 'scenarios' ? 'default' : 'outline'}
            onClick={() => setActiveTab('scenarios')}
            className="flex-1"
          >
            <FlaskConical className="mr-2 h-4 w-4" />
            Scenario Lab
          </Button>
        </div>

        {/* Scenario Lab Tab */}
        {activeTab === 'scenarios' && (
          <>
            {scenarioPhase === 'select' && (
              <div className="space-y-4">
                <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/30">
                  <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-purple-400" />
                    Scenario Lab
                  </h2>
                  <p className="text-muted-foreground mb-4">
                    Real-world troubleshooting scenarios. Follow the steps, type the right commands, and learn the debugging process.
                  </p>
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {TERMINAL_SCENARIOS.map(scenario => (
                    <Card
                      key={scenario.id}
                      className="p-5 cursor-pointer transition-all hover:scale-[1.02] hover:border-primary/50"
                      onClick={() => startScenario(scenario)}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-3xl">{scenario.emoji}</span>
                        <div className="flex-1">
                          <h3 className="font-bold">{scenario.title}</h3>
                          <p className="text-xs text-muted-foreground mb-2">{scenario.description}</p>
                          <div className="flex items-center gap-3 text-xs">
                            <span className={`px-2 py-0.5 rounded-full ${
                              scenario.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                              scenario.difficulty === 'hard' ? 'bg-orange-500/10 text-orange-500' :
                              'bg-red-500/10 text-red-500'
                            }`}>
                              {scenario.difficulty}
                            </span>
                            <span className="text-muted-foreground">{scenario.steps.length} steps</span>
                            <span className="text-xp">+{scenario.xpReward} XP</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {(scenarioPhase === 'playing' || scenarioPhase === 'complete') && activeScenario && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{activeScenario.emoji}</span>
                    <div>
                      <p className="font-semibold text-sm">{activeScenario.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Step {Math.min(scenarioStep + 1, activeScenario.steps.length)}/{activeScenario.steps.length}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-xp">{scenarioXP} XP</span>
                    {scenarioPhase === 'complete' && (
                      <Button size="sm" variant="outline" onClick={() => { setScenarioPhase('select'); setActiveScenario(null); }}>
                        Back
                      </Button>
                    )}
                  </div>
                </div>

                <Card className="bg-gray-950 border-gray-800 overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="ml-4 text-xs text-gray-500 font-mono">scenario-lab ~ {activeScenario.title}</span>
                  </div>
                  <div ref={scenarioTermRef} className="p-4 h-[400px] overflow-y-auto font-mono text-sm">
                    {scenarioHistory.map((line, i) => (
                      <div
                        key={i}
                        className={`leading-relaxed ${
                          line.type === 'prompt' ? 'text-cyan-400' :
                          line.type === 'output' ? 'text-gray-400' :
                          line.type === 'error' ? 'text-red-400' :
                          line.type === 'success' ? 'text-green-400' :
                          line.type === 'info' ? 'text-blue-400 italic' : ''
                        }`}
                      >
                        {line.text || '\u00A0'}
                      </div>
                    ))}
                    {scenarioPhase === 'playing' && (
                      <form onSubmit={handleScenarioSubmit} className="flex items-center mt-2">
                        <span className="text-green-400 mr-2">$</span>
                        <input
                          ref={scenarioInputRef}
                          type="text"
                          value={scenarioInput}
                          onChange={(e) => setScenarioInput(e.target.value)}
                          className="flex-1 bg-transparent outline-none text-white caret-green-400"
                          autoFocus
                          autoComplete="off"
                          spellCheck={false}
                        />
                        <span className="animate-pulse text-green-400">▋</span>
                      </form>
                    )}
                  </div>
                </Card>
              </div>
            )}
          </>
        )}

        {/* Commands Tab */}
        {activeTab === 'commands' && !isPlaying && (
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TerminalIcon className="h-5 w-5 text-green-400" />
                Master the Command Line
              </h2>
              <p className="text-muted-foreground mb-6">
                Practice real DevOps commands in a simulated terminal. Type commands correctly to earn XP and build streaks!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {Object.entries(CATEGORY_EMOJIS).map(([cat, emoji]) => (
                  <Button
                    key={cat}
                    variant="outline"
                    className={`h-20 flex-col gap-2 ${selectedCategory === cat ? 'border-primary bg-primary/10' : ''}`}
                    onClick={() => startGame(cat)}
                  >
                    <span className="text-2xl">{emoji}</span>
                    <span className="text-xs capitalize">{cat}</span>
                  </Button>
                ))}
              </div>
              
              <Button 
                size="lg" 
                className="w-full btn-glow"
                onClick={() => startGame(null)}
              >
                <Zap className="mr-2 h-5 w-5" />
                Start Mixed Challenge
              </Button>
            </Card>

            {/* Recent Score */}
            {score > 0 && (
              <Card className="p-4 bg-card">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Score</span>
                  <span className="text-xl font-bold text-xp">{score} XP</span>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'commands' && isPlaying && (
          <div className="space-y-4">
            {/* Game Stats Bar */}
            <div className="flex items-center justify-between p-4 bg-card rounded-lg border">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-xp" />
                  <span className="font-bold">{score} XP</span>
                </div>
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-streak" />
                  <span className="font-bold">{streak}x</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 ${timeLeft < 30 ? 'text-destructive animate-pulse' : ''}`}>
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
                </div>
                <Button variant="ghost" size="sm" onClick={skipChallenge}>
                  <SkipForward className="h-4 w-4 mr-1" />
                  Skip
                </Button>
              </div>
            </div>

            {/* Terminal */}
            <Card className="bg-gray-950 border-gray-800 overflow-hidden">
              {/* Terminal Header */}
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-800">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-xs text-gray-500 font-mono">devops-quest ~ terminal</span>
              </div>
              
              {/* Terminal Body */}
              <div 
                ref={terminalRef}
                className="p-4 h-[400px] overflow-y-auto font-mono text-sm"
              >
                {history.map((line, i) => (
                  <div
                    key={i}
                    className={`
                      ${line.type === 'prompt' ? 'text-cyan-400' : ''}
                      ${line.type === 'output' ? 'text-gray-400' : ''}
                      ${line.type === 'error' ? 'text-red-400' : ''}
                      ${line.type === 'success' ? 'text-green-400' : ''}
                      leading-relaxed
                    `}
                  >
                    {line.text || '\u00A0'}
                  </div>
                ))}
                
                {/* Input Line */}
                <form onSubmit={handleSubmit} className="flex items-center mt-2">
                  <span className="text-green-400 mr-2">$</span>
                  <input
                    ref={inputRef}
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1 bg-transparent outline-none text-white caret-green-400"
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <span className="animate-pulse text-green-400">▋</span>
                </form>
              </div>
            </Card>

            <p className="text-center text-xs text-muted-foreground">
              Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">TAB</kbd> for hints • 
              Press <kbd className="px-1 py-0.5 bg-muted rounded text-xs">ENTER</kbd> to submit
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TerminalPage;
