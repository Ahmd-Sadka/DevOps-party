import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useGame } from '@/contexts/GameContext';
import { POWER_UPS, PowerUp } from '@/types/game';
import { Scissors, SkipForward, Snowflake, Lightbulb, ShoppingCart, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const getPowerUpIcon = (effect: string) => {
  switch (effect) {
    case 'fifty_fifty': return <Scissors className="h-5 w-5" />;
    case 'skip': return <SkipForward className="h-5 w-5" />;
    case 'time_freeze': return <Snowflake className="h-5 w-5" />;
    case 'hint': return <Lightbulb className="h-5 w-5" />;
    default: return <Sparkles className="h-5 w-5" />;
  }
};

const getPowerUpColor = (effect: string) => {
  switch (effect) {
    case 'fifty_fifty': return 'from-orange-500 to-red-500';
    case 'skip': return 'from-blue-500 to-cyan-500';
    case 'time_freeze': return 'from-cyan-400 to-blue-400';
    case 'hint': return 'from-yellow-400 to-orange-400';
    default: return 'from-primary to-accent';
  }
};

interface PowerUpBarProps {
  onUsePowerUp?: (powerUp: PowerUp) => void;
  disabled?: boolean;
}

export function PowerUpBar({ onUsePowerUp, disabled }: PowerUpBarProps) {
  const { state, usePowerUp } = useGame();
  const user = state.user;
  
  if (!user) return null;
  
  const handleUsePowerUp = (powerUp: PowerUp) => {
    if (disabled) {
      toast({ title: "Can't use power-up now", variant: 'destructive' });
      return;
    }
    
    if (usePowerUp(powerUp.id)) {
      onUsePowerUp?.(powerUp);
      toast({
        title: `${powerUp.emoji} ${powerUp.name} activated!`,
        description: powerUp.description,
      });
    } else {
      toast({
        title: 'No power-ups left',
        description: `You don't have any ${powerUp.name} power-ups remaining.`,
        variant: 'destructive',
      });
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      {POWER_UPS.map((powerUp) => {
        const count = user.powerUps[powerUp.id] || 0;
        return (
          <button
            key={powerUp.id}
            onClick={() => handleUsePowerUp(powerUp)}
            disabled={count === 0 || disabled}
            className={`
              relative group flex items-center justify-center
              w-12 h-12 rounded-xl transition-all duration-300
              ${count > 0 && !disabled
                ? `bg-gradient-to-br ${getPowerUpColor(powerUp.effect)} hover:scale-110 hover:shadow-lg cursor-pointer`
                : 'bg-muted/50 opacity-50 cursor-not-allowed'
              }
            `}
            title={`${powerUp.name}: ${powerUp.description}`}
          >
            <span className="text-xl">{powerUp.emoji}</span>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-background border border-border rounded-full text-xs font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function PowerUpShop() {
  const { state, dispatch } = useGame();
  const user = state.user;
  
  if (!user) return null;
  
  const buyPowerUp = (powerUp: PowerUp) => {
    if (user.totalXP < powerUp.cost) {
      toast({
        title: 'Not enough XP',
        description: `You need ${powerUp.cost} XP to buy ${powerUp.name}`,
        variant: 'destructive',
      });
      return;
    }
    
    dispatch({ type: 'ADD_XP', payload: -powerUp.cost });
    dispatch({ type: 'ADD_POWERUP', payload: { id: powerUp.id, amount: 1 } });
    
    toast({
      title: `${powerUp.emoji} Purchased!`,
      description: `You bought ${powerUp.name}`,
    });
  };
  
  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingCart className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg">Power-Up Shop</h3>
        <span className="ml-auto text-sm text-xp font-semibold">{user.totalXP} XP</span>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {POWER_UPS.map((powerUp) => (
          <div
            key={powerUp.id}
            className="p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${getPowerUpColor(powerUp.effect)}`}>
                <span className="text-2xl">{powerUp.emoji}</span>
              </div>
              <div>
                <h4 className="font-semibold">{powerUp.name}</h4>
                <p className="text-xs text-muted-foreground">{powerUp.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xp font-bold">{powerUp.cost} XP</span>
              <Button
                size="sm"
                variant={user.totalXP >= powerUp.cost ? 'default' : 'outline'}
                disabled={user.totalXP < powerUp.cost}
                onClick={() => buyPowerUp(powerUp)}
              >
                Buy
              </Button>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Owned: {user.powerUps[powerUp.id] || 0}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default PowerUpBar;
