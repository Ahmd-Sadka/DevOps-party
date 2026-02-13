import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useGame } from '@/contexts/GameContext';
import { AVATARS } from '@/types/game';
import { ArrowRight, Sparkles } from 'lucide-react';

const funMessages = [
  "Nice to meet you! Ready to break some production servers? 😈",
  "Awesome name! Let's turn you into a DevOps wizard 🧙",
  "Welcome aboard! Time to master the terminal 💻",
  "Great choice! Your DevOps journey begins now 🚀",
  "Legend has it, this name will appear on many git commits! 🌟",
  "Excellent! The Kubernetes cluster trembles at your name 😱",
  "That's the name of a future SRE legend right there! 🏆",
  "Perfect! Even Terraform couldn't plan a better name 🏗️",
];

const Onboarding = () => {
  const { createUser, dispatch } = useGame();
  const [step, setStep] = useState<'name' | 'avatar'>('name');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].id);
  const [funMessage, setFunMessage] = useState('');

  const handleNameSubmit = () => {
    if (username.trim().length >= 2) {
      setFunMessage(funMessages[Math.floor(Math.random() * funMessages.length)]);
      setStep('avatar');
    }
  };

  const handleComplete = () => {
    createUser(username.trim(), selectedAvatar);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {step === 'name' ? (
          <div className="animate-slide-up">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">👋</div>
              <h1 className="text-3xl font-bold mb-2">Welcome, Adventurer!</h1>
              <p className="text-muted-foreground">What should we call you?</p>
            </div>

            <div className="space-y-4">
              <Input
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
                className="text-center text-lg h-14 bg-card border-border"
                maxLength={20}
              />
              
              <Button 
                onClick={handleNameSubmit}
                disabled={username.trim().length < 2}
                className="w-full h-12 text-lg btn-glow"
              >
                Continue
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-4">
              2-20 characters, be creative!
            </p>
          </div>
        ) : (
          <div className="animate-slide-up">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 text-primary mb-2">
                <Sparkles className="h-5 w-5" />
                <span className="font-mono text-sm">{funMessage}</span>
              </div>
              <h1 className="text-3xl font-bold mb-2">Choose Your Avatar</h1>
              <p className="text-muted-foreground">Pick your terminal identity, <span className="text-primary font-semibold">{username}</span></p>
            </div>

            <div className="grid grid-cols-5 gap-3 mb-8">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => setSelectedAvatar(avatar.id)}
                  className={`aspect-square text-4xl rounded-xl border-2 transition-all duration-200 flex items-center justify-center ${
                    selectedAvatar === avatar.id
                      ? 'border-primary bg-primary/20 scale-110 shadow-lg'
                      : 'border-border bg-card hover:border-primary/50 hover:scale-105'
                  }`}
                  title={avatar.name}
                >
                  {avatar.emoji}
                </button>
              ))}
            </div>

            <div className="text-center mb-6">
              <p className="text-lg font-semibold">
                {AVATARS.find(a => a.id === selectedAvatar)?.name}
              </p>
              <p className="text-sm text-muted-foreground">
                {AVATARS.find(a => a.id === selectedAvatar)?.description}
              </p>
            </div>

            <Button 
              onClick={handleComplete}
              className="w-full h-12 text-lg btn-glow"
            >
              Begin Your Quest
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>

            <button 
              onClick={() => setStep('name')}
              className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Change username
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
