import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Terminal, Rocket, Trophy, Zap, Skull, Heart, Swords, Gamepad2, Shield, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';

const TYPEWRITER_LINES = [
  "$ kubectl get skills --all-namespaces",
  "$ terraform plan your-career",
  "$ docker run -it devops-mastery",
  "$ ansible-playbook level-up.yml",
  "$ git push origin legendary-status",
  "$ aws s3 sync brain://knowledge/ .",
];

const FUN_SUBTITLES = [
  "Ready to break some production servers?",
  "Where 'rm -rf /' is just a learning experience",
  "Because StackOverflow isn't always enough",
  "Turning 'it works on my machine' into confidence",
  "The only game where YAML errors are the boss fights",
  "Level up from 'sudo everything' to DevOps legend",
];

const Landing = () => {
  const { dispatch } = useGame();
  const [typedText, setTypedText] = useState('');
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [subtitle] = useState(() => FUN_SUBTITLES[Math.floor(Math.random() * FUN_SUBTITLES.length)]);
  const [glitchText, setGlitchText] = useState(false);

  // Typewriter effect
  useEffect(() => {
    const currentLine = TYPEWRITER_LINES[lineIndex];
    if (charIndex < currentLine.length) {
      const timer = setTimeout(() => {
        setTypedText(currentLine.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setLineIndex((lineIndex + 1) % TYPEWRITER_LINES.length);
        setCharIndex(0);
        setTypedText('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [charIndex, lineIndex]);

  // Periodic glitch effect on title
  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchText(true);
      setTimeout(() => setGlitchText(false), 200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Animated background grid */}
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(hsl(270 80% 60% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(270 80% 60% / 0.3) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
      }} />

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center relative">
        {/* Floating emoji decorations */}
        <div className="absolute top-20 left-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '0s' }}>🐧</div>
        <div className="absolute top-40 right-16 text-3xl opacity-20 animate-float" style={{ animationDelay: '1s' }}>🐳</div>
        <div className="absolute bottom-40 left-20 text-3xl opacity-20 animate-float" style={{ animationDelay: '2s' }}>☸️</div>
        <div className="absolute bottom-20 right-10 text-4xl opacity-20 animate-float" style={{ animationDelay: '0.5s' }}>🔥</div>
        <div className="absolute top-60 left-1/4 text-2xl opacity-15 animate-float" style={{ animationDelay: '1.5s' }}>⚡</div>
        <div className="absolute bottom-60 right-1/4 text-2xl opacity-15 animate-float" style={{ animationDelay: '2.5s' }}>🏗️</div>

        <div className="animate-float mb-6">
          <div className="text-8xl md:text-9xl mb-2 relative">
            🎮
            <span className="absolute -top-2 -right-2 text-3xl animate-ping">✨</span>
          </div>
        </div>
        
        <h1 className={`text-5xl md:text-7xl font-black mb-4 transition-all ${glitchText ? 'translate-x-[2px] skew-x-1' : ''}`}>
          <span className="gradient-text">DevOps Party</span>
        </h1>

        {/* Terminal-style typing animation */}
        <div className="bg-muted/50 border border-border rounded-xl px-6 py-3 mb-4 font-mono text-sm md:text-base max-w-lg">
          <span className="text-green-400">~</span>{' '}
          <span className="text-muted-foreground">{typedText}</span>
          <span className="animate-pulse text-primary">|</span>
        </div>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-2 max-w-2xl">
          Master Linux, Bash, Git, Docker, K8s & more through an <span className="text-primary font-semibold">addictive RPG adventure</span>
        </p>
        
        <p className="text-lg text-muted-foreground/70 mb-8 font-mono">
          <span className="cursor-blink">{subtitle}</span>
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 btn-glow bg-primary hover:bg-primary/90"
            onClick={() => dispatch({ type: 'SET_ONBOARDING', payload: true })}
          >
            <Rocket className="mr-2 h-5 w-5" />
            Start Your Quest
          </Button>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl w-full">
          <div className="glow-card p-5 text-left">
            <Terminal className="h-7 w-7 text-primary mb-3" />
            <h3 className="font-semibold text-sm mb-1">300+ Questions</h3>
            <p className="text-xs text-muted-foreground">
              From easy to evil mode
            </p>
          </div>
          
          <div className="glow-card p-5 text-left">
            <Trophy className="h-7 w-7 text-xp mb-3" />
            <h3 className="font-semibold text-sm mb-1">Earn Badges</h3>
            <p className="text-xs text-muted-foreground">
              25+ achievements to unlock
            </p>
          </div>
          
          <div className="glow-card p-5 text-left">
            <Flame className="h-7 w-7 text-streak mb-3" />
            <h3 className="font-semibold text-sm mb-1">Kill Streaks</h3>
            <p className="text-xs text-muted-foreground">
              Combo multipliers & FX
            </p>
          </div>

          <div className="glow-card p-5 text-left">
            <Skull className="h-7 w-7 text-destructive mb-3" />
            <h3 className="font-semibold text-sm mb-1">Boss Battles</h3>
            <p className="text-xs text-muted-foreground">
              Epic scenario challenges
            </p>
          </div>

          <div className="glow-card p-5 text-left">
            <Heart className="h-7 w-7 text-red-500 mb-3" />
            <h3 className="font-semibold text-sm mb-1">Survival Mode</h3>
            <p className="text-xs text-muted-foreground">
              3 lives, endless questions
            </p>
          </div>

          <div className="glow-card p-5 text-left">
            <Shield className="h-7 w-7 text-blue-500 mb-3" />
            <h3 className="font-semibold text-sm mb-1">Interview Prep</h3>
            <p className="text-xs text-muted-foreground">
              Real-world scenarios
            </p>
          </div>
        </div>

        {/* Tech stack badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {['🐧 Linux', '🧪 Bash', '🌱 Git', '🐳 Docker', '🤖 Ansible', '☸️ K8s', '🏗️ Terraform', '☁️ AWS', '🔄 CI/CD', '🎯 OpenShift'].map((tech) => (
            <span key={tech} className="px-3 py-1 rounded-full bg-muted/50 border border-border text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-all cursor-default">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Learn DevOps the fun way - because production incidents shouldn't be your teacher 🚀</p>
      </footer>
    </div>
  );
};

export default Landing;
