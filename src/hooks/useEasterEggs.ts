import { useState, useEffect, useCallback } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useConfetti } from '@/hooks/useConfetti';
import { useSoundEffects } from '@/hooks/useSoundEffects';
import { toast } from 'sonner';

interface EasterEgg {
  id: string;
  name: string;
  emoji: string;
  description: string;
  reward: { type: 'xp' | 'powerup'; amount: number; powerupId?: string };
}

const EASTER_EGGS: EasterEgg[] = [
  {
    id: 'konami',
    name: 'Konami Code Master',
    emoji: '🎮',
    description: 'You found the legendary Konami Code!',
    reward: { type: 'xp', amount: 100 },
  },
  {
    id: 'dev-tools',
    name: 'Inspector Gadget',
    emoji: '🔍',
    description: 'A true developer always checks the console!',
    reward: { type: 'xp', amount: 50 },
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    emoji: '⚡',
    description: 'Triple-clicked for ultimate power!',
    reward: { type: 'powerup', amount: 1, powerupId: 'time_freeze' },
  },
  {
    id: 'night-coder',
    name: 'Night Coder',
    emoji: '🌙',
    description: 'The best code is written at midnight!',
    reward: { type: 'xp', amount: 75 },
  },
];

const KONAMI_CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

export function useEasterEggs() {
  const { state, dispatch } = useGame();
  const { burstConfetti, sidesConfetti } = useConfetti();
  const { playSound } = useSoundEffects();
  
  const [konamiProgress, setKonamiProgress] = useState<string[]>([]);
  const [discoveredEggs, setDiscoveredEggs] = useState<string[]>(() => {
    const saved = localStorage.getItem('devops-quest-easter-eggs');
    return saved ? JSON.parse(saved) : [];
  });
  const [tripleClickCount, setTripleClickCount] = useState(0);
  const [lastClickTime, setLastClickTime] = useState(0);

  // Save discovered eggs
  useEffect(() => {
    localStorage.setItem('devops-quest-easter-eggs', JSON.stringify(discoveredEggs));
  }, [discoveredEggs]);

  const triggerEasterEgg = useCallback((eggId: string) => {
    if (discoveredEggs.includes(eggId)) return;
    
    const egg = EASTER_EGGS.find(e => e.id === eggId);
    if (!egg) return;

    setDiscoveredEggs(prev => [...prev, eggId]);
    
    // Visual feedback
    sidesConfetti();
    burstConfetti();
    playSound('levelUp');
    
    // Give reward
    if (egg.reward.type === 'xp') {
      dispatch({ type: 'ADD_XP', payload: egg.reward.amount });
    } else if (egg.reward.type === 'powerup' && egg.reward.powerupId) {
      dispatch({ type: 'ADD_POWERUP', payload: { id: egg.reward.powerupId, amount: egg.reward.amount } });
    }
    
    // Show notification
    toast.success(
      `${egg.emoji} Secret Found: ${egg.name}! ${egg.description} +${egg.reward.amount} ${egg.reward.type === 'xp' ? 'XP' : egg.reward.powerupId}!`,
      { duration: 5000 }
    );
  }, [discoveredEggs, dispatch, burstConfetti, sidesConfetti, playSound]);

  // Konami Code listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const newProgress = [...konamiProgress, key];
      
      // Check if sequence matches so far
      const expectedKey = KONAMI_CODE[konamiProgress.length];
      if (key === expectedKey) {
        setKonamiProgress(newProgress);
        
        // Check if complete
        if (newProgress.length === KONAMI_CODE.length) {
          triggerEasterEgg('konami');
          setKonamiProgress([]);
        }
      } else {
        // Reset if wrong key
        setKonamiProgress([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [konamiProgress, triggerEasterEgg]);

  // Triple-click detector
  const handleClick = useCallback(() => {
    const now = Date.now();
    if (now - lastClickTime < 300) {
      const newCount = tripleClickCount + 1;
      setTripleClickCount(newCount);
      if (newCount >= 3) {
        triggerEasterEgg('speed-demon');
        setTripleClickCount(0);
      }
    } else {
      setTripleClickCount(1);
    }
    setLastClickTime(now);
  }, [lastClickTime, tripleClickCount, triggerEasterEgg]);

  // Night coder check (after 11 PM)
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 23 || hour < 5) {
      const timer = setTimeout(() => {
        triggerEasterEgg('night-coder');
      }, 30000); // Trigger after 30 seconds of late-night coding
      return () => clearTimeout(timer);
    }
  }, [triggerEasterEgg]);

  // Console easter egg
  useEffect(() => {
    console.log(
      '%c🎮 DevOps Quest Easter Egg Hunt! 🎮',
      'color: #8B5CF6; font-size: 20px; font-weight: bold;'
    );
    console.log(
      '%cType discoverSecret() to find a hidden reward!',
      'color: #10B981; font-size: 14px;'
    );
    
    // @ts-ignore
    window.discoverSecret = () => {
      triggerEasterEgg('dev-tools');
      return '🎉 You found the developer secret!';
    };
    
    return () => {
      // @ts-ignore
      delete window.discoverSecret;
    };
  }, [triggerEasterEgg]);

  return {
    discoveredEggs,
    totalEggs: EASTER_EGGS.length,
    handleClick,
    konamiProgress: konamiProgress.length,
    konamiTotal: KONAMI_CODE.length,
  };
}
