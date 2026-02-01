import { useState } from 'react';
import { useGame } from '@/contexts/GameContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  ArrowLeft, 
  Settings as SettingsIcon, 
  Volume2, 
  VolumeX, 
  Moon, 
  Sun,
  Trash2,
  Download,
  Upload,
  AlertTriangle,
  Sparkles,
  Info
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const SettingsPage = () => {
  const { state, dispatch } = useGame();
  const navigate = useNavigate();
  const user = state.user;

  // Load settings from localStorage
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('devops-quest-sound') !== 'false';
  });
  const [particlesEnabled, setParticlesEnabled] = useState(() => {
    return localStorage.getItem('devops-quest-particles') !== 'false';
  });
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('devops-quest-theme') !== 'light';
  });

  const handleSoundToggle = (enabled: boolean) => {
    setSoundEnabled(enabled);
    localStorage.setItem('devops-quest-sound', enabled.toString());
    toast.success(enabled ? '🔊 Sound enabled' : '🔇 Sound disabled');
  };

  const handleParticlesToggle = (enabled: boolean) => {
    setParticlesEnabled(enabled);
    localStorage.setItem('devops-quest-particles', enabled.toString());
    toast.success(enabled ? '✨ Particles enabled' : '💫 Particles disabled');
  };

  const handleThemeToggle = (isDark: boolean) => {
    setDarkMode(isDark);
    localStorage.setItem('devops-quest-theme', isDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('light', !isDark);
    toast.success(isDark ? '🌙 Dark mode' : '☀️ Light mode');
  };

  const handleExportData = () => {
    if (!user) return;
    
    const data = JSON.stringify(user, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `devops-quest-${user.username}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📥 Progress exported successfully!');
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.username && data.totalXP !== undefined) {
          dispatch({ type: 'SET_USER', payload: data });
          toast.success('📤 Progress imported successfully!');
        } else {
          toast.error('Invalid save file format');
        }
      } catch {
        toast.error('Failed to parse save file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleResetProgress = () => {
    dispatch({ type: 'RESET_GAME' });
    navigate('/');
    toast.success('🔄 Progress reset. Starting fresh!');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Please complete onboarding first.</p>
        <Button onClick={() => navigate('/')} className="ml-4">Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <SettingsIcon className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Settings</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* Sound & Effects */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Volume2 className="h-5 w-5" />
              Sound & Effects
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="h-5 w-5 text-primary" /> : <VolumeX className="h-5 w-5 text-muted-foreground" />}
                  <div>
                    <p className="font-medium">Sound Effects</p>
                    <p className="text-sm text-muted-foreground">Play sounds for correct/wrong answers</p>
                  </div>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={handleSoundToggle} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Sparkles className={`h-5 w-5 ${particlesEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                  <div>
                    <p className="font-medium">Particle Effects</p>
                    <p className="text-sm text-muted-foreground">Show confetti and celebrations</p>
                  </div>
                </div>
                <Switch checked={particlesEnabled} onCheckedChange={handleParticlesToggle} />
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Moon className="h-5 w-5" />
              Appearance
            </h2>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-yellow-500" />}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                </div>
              </div>
              <Switch checked={darkMode} onCheckedChange={handleThemeToggle} />
            </div>
          </Card>

          {/* Data Management */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Download className="h-5 w-5" />
              Data Management
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Export Progress</p>
                  <p className="text-sm text-muted-foreground">Download your progress as JSON</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Import Progress</p>
                  <p className="text-sm text-muted-foreground">Restore from a backup file</p>
                </div>
                <label>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" asChild>
                    <span className="cursor-pointer">
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </span>
                  </Button>
                </label>
              </div>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-6 border-destructive/30">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h2>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Reset All Progress</p>
                <p className="text-sm text-muted-foreground">This cannot be undone!</p>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all your progress, including:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>{user.totalXP} XP earned</li>
                        <li>{user.earnedBadges.length} badges collected</li>
                        <li>{user.stats.totalQuestionsAnswered} questions answered</li>
                        <li>{user.streak.longestStreak} day longest streak</li>
                      </ul>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetProgress} className="bg-destructive hover:bg-destructive/90">
                      Yes, reset everything
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>

          {/* About */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              About DevOps Quest
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Version 1.0.0</p>
              <p>A gamified learning platform for DevOps mastery.</p>
              <p className="text-xs mt-4">
                Built with React, TypeScript, and ❤️
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
