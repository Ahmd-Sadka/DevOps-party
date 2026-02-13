import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "@/contexts/GameContext";
import { AchievementToastProvider } from "@/components/game/AchievementToast";
import ChallengeMode from "./pages/ChallengeMode";
import Index from "./pages/Index";
import Quiz from "./pages/Quiz";
import LevelMap from "./pages/LevelMap";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import BossBattle from "./pages/BossBattle";
import Interview from "./pages/Interview";
import InterviewDiscussion from "./pages/InterviewDiscussion";
import InterviewSimulation from "./pages/InterviewSimulation";
import Terminal from "./pages/Terminal";
import Settings from "./pages/Settings";
import SurvivalMode from "./pages/SurvivalMode";
import ReviewMode from "./pages/ReviewMode";
import StudyMode from "./pages/StudyMode";
import CheatSheet from "./pages/CheatSheet";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <GameProvider>
      <AchievementToastProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/levels" element={<LevelMap />} />
            <Route path="/quiz/:levelId" element={<Quiz />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/boss" element={<BossBattle />} />
            <Route path="/interview" element={<Interview />} />
            <Route path="/interview/discussion" element={<InterviewDiscussion />} />
            <Route path="/interview/simulation" element={<InterviewSimulation />} />
            <Route path="/terminal" element={<Terminal />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/survival" element={<SurvivalMode />} />
            <Route path="/review" element={<ReviewMode />} />
            <Route path="/study/:levelId" element={<StudyMode />} />
            <Route path="/cheatsheet" element={<CheatSheet />} />
            <Route path="/challenge" element={<ChallengeMode />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      </AchievementToastProvider>
    </GameProvider>
  </QueryClientProvider>
);

export default App;
