import { useNavigate } from 'react-router-dom';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AVATARS } from '@/types/game';
import { ArrowLeft, Trophy, Medal } from 'lucide-react';

// Mock leaderboard data for now - will be replaced with Supabase
const mockLeaderboard = [
  { id: '1', username: 'DevMaster', avatarId: 'wizard', totalXP: 5420, level: 10, accuracy: 94 },
  { id: '2', username: 'TerminalNinja', avatarId: 'ninja', totalXP: 4890, level: 9, accuracy: 91 },
  { id: '3', username: 'DockerWhale', avatarId: 'whale', totalXP: 4350, level: 8, accuracy: 88 },
  { id: '4', username: 'GitGuru', avatarId: 'brain', totalXP: 3920, level: 7, accuracy: 85 },
  { id: '5', username: 'BashKing', avatarId: 'fire', totalXP: 3540, level: 7, accuracy: 82 },
  { id: '6', username: 'LinuxLord', avatarId: 'penguin', totalXP: 3100, level: 6, accuracy: 79 },
  { id: '7', username: 'CloudRunner', avatarId: 'rocket', totalXP: 2780, level: 5, accuracy: 76 },
  { id: '8', username: 'PipelineProz', avatarId: 'robot', totalXP: 2340, level: 5, accuracy: 73 },
];

const Leaderboard = () => {
  const navigate = useNavigate();
  const { state } = useGame();
  const user = state.user;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-muted-foreground">{rank}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Leaderboard</h1>
            <p className="text-muted-foreground">Top DevOps Champions</p>
          </div>
        </div>

        {/* User's Rank (if exists) */}
        {user && (
          <Card className="p-4 mb-6 bg-primary/10 border-primary/30">
            <div className="flex items-center gap-4">
              <div className="text-3xl">{AVATARS.find(a => a.id === user.avatarId)?.emoji}</div>
              <div className="flex-1">
                <p className="font-semibold">{user.username} (You)</p>
                <p className="text-sm text-muted-foreground">
                  {user.totalXP} XP • Level {user.currentLevel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-xl font-bold">#{mockLeaderboard.length + 1}</p>
              </div>
            </div>
          </Card>
        )}

        {/* Leaderboard List */}
        <div className="space-y-3">
          {mockLeaderboard.map((entry, index) => {
            const avatar = AVATARS.find(a => a.id === entry.avatarId);
            const rank = index + 1;
            
            return (
              <Card 
                key={entry.id}
                className={`p-4 bg-card border-border ${rank <= 3 ? 'border-l-4' : ''} ${
                  rank === 1 ? 'border-l-yellow-500' : 
                  rank === 2 ? 'border-l-gray-400' : 
                  rank === 3 ? 'border-l-amber-600' : ''
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 flex justify-center">
                    {getRankIcon(rank)}
                  </div>
                  <div className="text-2xl">{avatar?.emoji}</div>
                  <div className="flex-1">
                    <p className="font-semibold">{entry.username}</p>
                    <p className="text-sm text-muted-foreground">
                      Level {entry.level} • {entry.accuracy}% accuracy
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold gradient-text-xp">{entry.totalXP.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Info */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          🏆 Leaderboard updates in real-time. Keep learning to climb!
        </p>
      </div>
    </div>
  );
};

export default Leaderboard;
