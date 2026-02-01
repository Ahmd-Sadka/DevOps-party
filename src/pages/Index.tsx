import { useGame } from '@/contexts/GameContext';
import Landing from '@/components/game/Landing';
import Onboarding from '@/components/game/Onboarding';
import Dashboard from '@/components/game/Dashboard';

const Index = () => {
  const { state } = useGame();

  // Show landing for new users
  if (!state.user && !state.isOnboarding) {
    return <Landing />;
  }

  // Show onboarding for users creating account
  if (state.isOnboarding && !state.user) {
    return <Onboarding />;
  }

  // Show dashboard for logged in users
  return <Dashboard />;
};

export default Index;
