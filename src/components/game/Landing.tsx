import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { Terminal, Rocket, Trophy, Zap } from 'lucide-react';

const Landing = () => {
  const { dispatch } = useGame();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="animate-float mb-8">
          <div className="text-8xl mb-4">🎮</div>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-4">
          <span className="gradient-text">DevOps Quest</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-2 max-w-2xl">
          Master Linux, Bash, Git & Docker through an addictive game-like adventure
        </p>
        
        <p className="text-lg text-muted-foreground/70 mb-8 font-mono">
          <span className="cursor-blink">Ready to break some production servers?</span>
        </p>

        <Button 
          size="lg" 
          className="text-lg px-8 py-6 btn-glow bg-primary hover:bg-primary/90"
          onClick={() => dispatch({ type: 'SET_ONBOARDING', payload: true })}
        >
          <Rocket className="mr-2 h-5 w-5" />
          Start Your Journey
        </Button>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
          <div className="glow-card p-6 text-left">
            <Terminal className="h-8 w-8 text-primary mb-3" />
            <h3 className="font-semibold text-lg mb-2">100+ Challenges</h3>
            <p className="text-sm text-muted-foreground">
              From basics to evil mode interview questions
            </p>
          </div>
          
          <div className="glow-card p-6 text-left">
            <Trophy className="h-8 w-8 text-xp mb-3" />
            <h3 className="font-semibold text-lg mb-2">Earn Badges</h3>
            <p className="text-sm text-muted-foreground">
              Collect achievements and climb the leaderboard
            </p>
          </div>
          
          <div className="glow-card p-6 text-left">
            <Zap className="h-8 w-8 text-streak mb-3" />
            <h3 className="font-semibold text-lg mb-2">Build Streaks</h3>
            <p className="text-sm text-muted-foreground">
              Stay consistent and watch your skills grow
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-muted-foreground">
        <p>Learn DevOps the fun way 🚀</p>
      </footer>
    </div>
  );
};

export default Landing;
