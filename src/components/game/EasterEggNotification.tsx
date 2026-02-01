import { useEffect, useState } from 'react';
import { Sparkles, Star, Zap } from 'lucide-react';

interface EasterEggMessage {
  emoji: string;
  text: string;
}

interface EasterEggNotificationProps {
  message: EasterEggMessage | null;
  onClose: () => void;
}

export function EasterEggNotification({ message, onClose }: EasterEggNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message || !isVisible) return null;

  return (
    <div className="fixed top-1/4 left-1/2 -translate-x-1/2 z-50">
      {/* Sparkle effects */}
      <div className="absolute -top-4 -left-4 animate-ping">
        <Sparkles className="h-4 w-4 text-yellow-400" />
      </div>
      <div className="absolute -top-2 -right-4 animate-pulse">
        <Star className="h-5 w-5 text-yellow-400" />
      </div>
      
      {/* Main notification */}
      <div className="relative bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 min-w-[280px] justify-center animate-bounce">
        <span className="text-3xl">{message.emoji}</span>
        <div className="text-left">
          <p className="font-bold text-sm uppercase tracking-wider opacity-90">Easter Egg!</p>
          <p className="font-semibold">{message.text}</p>
        </div>
        <Zap className="h-6 w-6 ml-2 animate-pulse" />
      </div>
    </div>
  );
}

