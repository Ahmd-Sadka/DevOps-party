// Badge unlock notification component
import { useEffect, useState } from 'react';
import { Badge as BadgeType, BADGES } from '@/types/game';
import { useBadges } from '@/hooks/useBadges';
import { X } from 'lucide-react';

interface BadgeNotificationProps {
  badgeId: string;
  onClose: () => void;
}

export function BadgeNotification({ badgeId, onClose }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { getRarityColor, getRarityBorder } = useBadges();
  const badge = BADGES.find(b => b.id === badgeId);

  useEffect(() => {
    // Trigger animation
    setTimeout(() => setIsVisible(true), 50);
    
    // Auto-close after 4 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 4000);

    return () => clearTimeout(timer);
  }, [onClose]);

  if (!badge) return null;

  return (
    <div 
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className={`relative bg-card border-2 ${getRarityBorder(badge.rarity)} rounded-xl p-4 shadow-2xl min-w-[280px] badge-unlock`}>
        <button 
          onClick={() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
          }}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-4xl">{badge.emoji}</div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Badge Unlocked!</p>
            <h3 className={`font-bold ${getRarityColor(badge.rarity)}`}>{badge.name}</h3>
            <p className="text-xs text-muted-foreground">{badge.description}</p>
          </div>
        </div>
        
        <div className="mt-2 flex justify-end">
          <span className={`text-xs px-2 py-0.5 rounded-full ${
            badge.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-400' :
            badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-400' :
            badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-400' :
            'bg-muted text-muted-foreground'
          }`}>
            {badge.rarity}
          </span>
        </div>
      </div>
    </div>
  );
}

// Multi-badge queue manager
interface BadgeQueueProps {
  badgeIds: string[];
  onComplete: () => void;
}

export function BadgeQueue({ badgeIds, onComplete }: BadgeQueueProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleClose = () => {
    if (currentIndex < badgeIds.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onComplete();
    }
  };

  if (currentIndex >= badgeIds.length) return null;

  return (
    <BadgeNotification 
      key={badgeIds[currentIndex]}
      badgeId={badgeIds[currentIndex]} 
      onClose={handleClose} 
    />
  );
}
