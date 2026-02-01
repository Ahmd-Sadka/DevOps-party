// Sound effects hook for game feedback
import { useCallback, useRef } from 'react';

type SoundType = 'correct' | 'wrong' | 'levelUp' | 'badge' | 'click' | 'streak';

// Audio context for generating sounds programmatically
const createAudioContext = () => {
  if (typeof window !== 'undefined') {
    return new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return null;
};

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef<boolean>(true);

  // Initialize from localStorage
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('devops-quest-sound');
    enabledRef.current = saved !== 'false';
  }

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = createAudioContext();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.3) => {
    const ctx = getAudioContext();
    if (!ctx || !enabledRef.current) return;

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, [getAudioContext]);

  const playSound = useCallback((type: SoundType) => {
    const ctx = getAudioContext();
    if (!ctx) return;

    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    switch (type) {
      case 'correct':
        // Cheerful ascending notes
        playTone(523.25, 0.1, 'sine', 0.3); // C5
        setTimeout(() => playTone(659.25, 0.1, 'sine', 0.3), 100); // E5
        setTimeout(() => playTone(783.99, 0.15, 'sine', 0.3), 200); // G5
        break;

      case 'wrong':
        // Descending buzz
        playTone(200, 0.15, 'sawtooth', 0.2);
        setTimeout(() => playTone(150, 0.2, 'sawtooth', 0.15), 150);
        break;

      case 'levelUp':
        // Triumphant fanfare
        playTone(523.25, 0.15, 'sine', 0.3);
        setTimeout(() => playTone(659.25, 0.15, 'sine', 0.3), 150);
        setTimeout(() => playTone(783.99, 0.15, 'sine', 0.3), 300);
        setTimeout(() => playTone(1046.50, 0.3, 'sine', 0.4), 450);
        break;

      case 'badge':
        // Magical sparkle
        playTone(880, 0.1, 'sine', 0.2);
        setTimeout(() => playTone(1100, 0.1, 'sine', 0.2), 80);
        setTimeout(() => playTone(1320, 0.1, 'sine', 0.2), 160);
        setTimeout(() => playTone(1760, 0.2, 'sine', 0.3), 240);
        break;

      case 'click':
        playTone(800, 0.05, 'sine', 0.1);
        break;

      case 'streak':
        // Fire crackle
        playTone(600, 0.1, 'triangle', 0.2);
        setTimeout(() => playTone(800, 0.1, 'triangle', 0.2), 100);
        setTimeout(() => playTone(1000, 0.15, 'triangle', 0.25), 200);
        break;
    }
  }, [getAudioContext, playTone]);

  const toggleSound = useCallback((enabled: boolean) => {
    enabledRef.current = enabled;
    localStorage.setItem('devops-quest-sound', String(enabled));
  }, []);

  const isSoundEnabled = useCallback(() => {
    return enabledRef.current;
  }, []);

  return { playSound, toggleSound, isSoundEnabled };
}
