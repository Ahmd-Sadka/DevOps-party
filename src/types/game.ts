// DevOps Quest - Game Types

export type Difficulty = 'easy' | 'medium' | 'hard' | 'evil';

export type LevelId = 'linux' | 'bash' | 'git' | 'docker' | 'ansible' | 'kubernetes' | 'terraform' | 'aws' | 'cicd' | 'openshift' | 'devops' | 'junior-interview';

export interface Level {
  id: LevelId;
  name: string;
  emoji: string;
  description: string;
  color: string;
  unlockRequirement: number;
  totalQuestions: number;
}

export interface Question {
  id: string;
  levelId: LevelId;
  difficulty: Difficulty;
  question: string;
  code?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  wrongFeedback: string[];
  xpReward: number;
  tags: string[];
  isBoss?: boolean;
}

/** Discussion-style interview: question → hint (optional) → reveal answer. No MCQ. */
export interface InterviewDiscussionQuestion {
  id: string;
  question: string;
  hint?: string;
  answer: string;
  category: 'Linux' | 'Bash' | 'Docker' | 'Kubernetes' | 'Terraform' | 'CI/CD' | 'Ansible' | 'AWS' | 'General DevOps';
}

export interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  condition: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface PowerUp {
  id: string;
  name: string;
  emoji: string;
  description: string;
  cost: number;
  effect: 'fifty_fifty' | 'skip' | 'time_freeze' | 'hint';
}

export interface UserProgress {
  username: string;
  avatarId: string;
  totalXP: number;
  currentLevel: number;
  completedQuestions: string[];
  wrongQuestionIds: string[];
  bookmarkedQuestionIds: string[];
  levelProgress: Record<LevelId, LevelProgress>;
  earnedBadges: string[];
  streak: StreakData;
  stats: UserStats;
  powerUps: Record<string, number>;
  dailyChallengeCompleted: string[];
  createdAt: string;
  lastActiveAt: string;
}

export interface LevelProgress {
  unlocked: boolean;
  completed: boolean;
  questionsAnswered: number;
  correctAnswers: number;
  bestTime?: number;
  attempts: number;
  bossDefeated?: boolean;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string;
  streakShields: number;
  freezesUsed: number;
}

export interface UserStats {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  totalTimeSpent: number;
  averageAccuracy: number;
  fastestAnswer: number;
  evilModeCompleted: number;
  bossesDefeated: number;
  dailyChallengesCompleted: number;
}

export interface QuizSession {
  levelId: LevelId;
  questions: Question[];
  currentQuestionIndex: number;
  answers: AnswerRecord[];
  startTime: number;
  isComplete: boolean;
  isBossBattle?: boolean;
  activePowerUp?: string;
  timeFreezed?: boolean;
}

export interface AnswerRecord {
  questionId: string;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
  xpEarned: number;
}

export interface LeaderboardEntry {
  id: string;
  username: string;
  avatarId: string;
  totalXP: number;
  level: number;
  accuracy: number;
  completedLevels: number;
  createdAt: string;
}

export interface DailyChallenge {
  id: string;
  date: string;
  title: string;
  description: string;
  levelId: LevelId;
  questionIds: string[];
  bonusXP: number;
  timeLimit: number;
  isActive: boolean;
}

export interface Avatar {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

// Constants
export const LEVELS: Level[] = [
  {
    id: 'linux',
    name: 'Linux Rookie',
    emoji: '🐧',
    description: 'Master basic commands, permissions, users, and processes',
    color: 'level-linux',
    unlockRequirement: 0,
    totalQuestions: 20,
  },
  {
    id: 'bash',
    name: 'Bash Ninja',
    emoji: '🧪',
    description: 'Conquer scripts, loops, conditions, and debugging',
    color: 'level-bash',
    unlockRequirement: 500,
    totalQuestions: 20,
  },
  {
    id: 'git',
    name: 'Git Survivor',
    emoji: '🌱',
    description: 'Navigate branching, merging, conflicts, and CI scenarios',
    color: 'level-git',
    unlockRequirement: 1200,
    totalQuestions: 20,
  },
  {
    id: 'docker',
    name: 'Docker Architect',
    emoji: '🐳',
    description: 'Build with images, containers, Dockerfiles, and volumes',
    color: 'level-docker',
    unlockRequirement: 2000,
    totalQuestions: 25,
  },
  {
    id: 'ansible',
    name: 'Ansible Automator',
    emoji: '🤖',
    description: 'Master playbooks, roles, inventories, and automation',
    color: 'level-ansible',
    unlockRequirement: 2800,
    totalQuestions: 25,
  },
  {
    id: 'kubernetes',
    name: 'K8s Captain',
    emoji: '☸️',
    description: 'Orchestrate pods, deployments, services, and clusters',
    color: 'level-kubernetes',
    unlockRequirement: 3600,
    totalQuestions: 25,
  },
  {
    id: 'terraform',
    name: 'Terraform Titan',
    emoji: '🏗️',
    description: 'Infrastructure as Code with providers, modules, and state',
    color: 'level-terraform',
    unlockRequirement: 4500,
    totalQuestions: 25,
  },
  {
    id: 'aws',
    name: 'AWS Warrior',
    emoji: '☁️',
    description: 'Conquer EC2, S3, IAM, Lambda, and cloud services',
    color: 'level-aws',
    unlockRequirement: 5500,
    totalQuestions: 25,
  },
  {
    id: 'cicd',
    name: 'CI/CD Commander',
    emoji: '🔄',
    description: 'Master pipelines, GitHub Actions, Jenkins, and deployments',
    color: 'level-cicd',
    unlockRequirement: 6500,
    totalQuestions: 25,
  },
  {
    id: 'openshift',
    name: 'OpenShift Operator',
    emoji: '🎯',
    description: 'Enterprise Kubernetes with Routes, BuildConfigs, and more',
    color: 'level-openshift',
    unlockRequirement: 7500,
    totalQuestions: 25,
  },
  {
    id: 'devops',
    name: 'DevOps Legend',
    emoji: '⚔️',
    description: 'Face mixed advanced scenarios and interview challenges',
    color: 'level-devops',
    unlockRequirement: 8500,
    totalQuestions: 30,
  },
  {
    id: 'junior-interview',
    name: 'Junior Interview Prep',
    emoji: '📋',
    description: 'Practice common DevOps/SRE junior interview questions',
    color: 'level-linux',
    unlockRequirement: 0,
    totalQuestions: 60,
  },
];

export const AVATARS: Avatar[] = [
  { id: 'terminal', name: 'Terminal Pro', emoji: '💻', description: 'Classic terminal cursor' },
  { id: 'penguin', name: 'Tux', emoji: '🐧', description: 'Linux mascot' },
  { id: 'whale', name: 'Moby', emoji: '🐳', description: 'Docker whale' },
  { id: 'ninja', name: 'Code Ninja', emoji: '🥷', description: 'Silent but deadly' },
  { id: 'rocket', name: 'Deployer', emoji: '🚀', description: 'Always shipping' },
  { id: 'robot', name: 'Bot', emoji: '🤖', description: 'Automate everything' },
  { id: 'wizard', name: 'Wizard', emoji: '🧙', description: 'Command line magic' },
  { id: 'fire', name: 'Hotfix', emoji: '🔥', description: 'Production is fine' },
  { id: 'brain', name: 'Big Brain', emoji: '🧠', description: 'Galaxy brain solutions' },
  { id: 'skull', name: 'Destroyer', emoji: '💀', description: 'rm -rf survivor' },
  { id: 'cloud', name: 'Cloud Native', emoji: '☁️', description: 'Born in the cloud' },
  { id: 'helm', name: 'Helmsman', emoji: '⚓', description: 'Kubernetes navigator' },
];

export const BADGES: Badge[] = [
  // Progression badges
  { id: 'linux-survivor', name: 'Linux Survivor', emoji: '🥉', description: 'Complete Level 1', condition: 'Complete Linux Rookie level', rarity: 'common' },
  { id: 'script-breaker', name: 'Script Breaker', emoji: '🥈', description: 'Complete Level 2', condition: 'Complete Bash Ninja level', rarity: 'common' },
  { id: 'conflict-slayer', name: 'Git Conflict Slayer', emoji: '🥇', description: 'Complete Level 3', condition: 'Complete Git Survivor level', rarity: 'rare' },
  { id: 'docker-whisperer', name: 'Docker Whisperer', emoji: '🏆', description: 'Complete Level 4', condition: 'Complete Docker Architect level', rarity: 'epic' },
  { id: 'ansible-automator', name: 'Ansible Automator', emoji: '🤖', description: 'Complete Level 5', condition: 'Complete Ansible Automator level', rarity: 'epic' },
  { id: 'k8s-captain', name: 'K8s Captain', emoji: '☸️', description: 'Complete Level 6', condition: 'Complete Kubernetes level', rarity: 'epic' },
  { id: 'terraform-titan', name: 'Terraform Titan', emoji: '🏗️', description: 'Complete Level 7', condition: 'Complete Terraform level', rarity: 'epic' },
  { id: 'aws-warrior', name: 'AWS Warrior', emoji: '☁️', description: 'Complete Level 8', condition: 'Complete AWS level', rarity: 'legendary' },
  { id: 'cicd-commander', name: 'CI/CD Commander', emoji: '🔄', description: 'Complete Level 9', condition: 'Complete CI/CD level', rarity: 'legendary' },
  { id: 'openshift-operator', name: 'OpenShift Operator', emoji: '🎯', description: 'Complete Level 10', condition: 'Complete OpenShift level', rarity: 'legendary' },
  { id: 'devops-legend', name: 'DevOps Legend', emoji: '👑', description: 'Complete all levels', condition: 'Complete all 11 levels', rarity: 'legendary' },
  
  // Special achievements
  { id: 'speed-demon', name: 'Speed Demon', emoji: '⚡', description: 'Complete any level in under 10 minutes', condition: 'Speed run a level', rarity: 'rare' },
  { id: 'perfectionist', name: 'Perfectionist', emoji: '💯', description: '100% accuracy on any level', condition: 'Perfect score', rarity: 'epic' },
  { id: 'streak-master', name: 'Streak Master', emoji: '🔥', description: '7-day learning streak', condition: 'Practice 7 days in a row', rarity: 'rare' },
  { id: 'night-owl', name: 'Night Owl', emoji: '🌙', description: 'Practice after midnight', condition: 'Study late', rarity: 'common' },
  { id: 'early-bird', name: 'Early Bird', emoji: '🌅', description: 'Practice before 6 AM', condition: 'Study early', rarity: 'common' },
  { id: 'evil-conqueror', name: 'Evil Conqueror', emoji: '😈', description: 'Complete all Evil mode questions', condition: 'Master the hardest challenges', rarity: 'legendary' },
  { id: 'first-blood', name: 'First Blood', emoji: '🎯', description: 'Answer your first question correctly', condition: 'Get started', rarity: 'common' },
  { id: 'centurion', name: 'Centurion', emoji: '💪', description: 'Answer 100 questions', condition: 'Dedication', rarity: 'rare' },
  { id: 'boss-slayer', name: 'Boss Slayer', emoji: '🗡️', description: 'Defeat 5 boss battles', condition: 'Conquer bosses', rarity: 'epic' },
  { id: 'daily-warrior', name: 'Daily Warrior', emoji: '📅', description: 'Complete 10 daily challenges', condition: 'Daily dedication', rarity: 'rare' },
  { id: 'power-user', name: 'Power User', emoji: '⚡', description: 'Use 20 power-ups', condition: 'Strategic player', rarity: 'common' },
  { id: 'cloud-master', name: 'Cloud Master', emoji: '🌩️', description: 'Complete AWS, K8s, and OpenShift', condition: 'Cloud expertise', rarity: 'legendary' },
];

export const POWER_UPS: PowerUp[] = [
  { id: 'fifty_fifty', name: '50/50', emoji: '✂️', description: 'Remove two wrong answers', cost: 50, effect: 'fifty_fifty' },
  { id: 'skip', name: 'Skip Question', emoji: '⏭️', description: 'Skip without penalty', cost: 75, effect: 'skip' },
  { id: 'time_freeze', name: 'Time Freeze', emoji: '❄️', description: 'Freeze timer for 30 seconds', cost: 100, effect: 'time_freeze' },
  { id: 'hint', name: 'Hint Reveal', emoji: '💡', description: 'Get a helpful hint', cost: 60, effect: 'hint' },
];

export const XP_REWARDS: Record<Difficulty, number> = {
  easy: 10,
  medium: 20,
  hard: 35,
  evil: 50,
};

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500];

export function calculateLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getXPForNextLevel(currentXP: number): { current: number; required: number; progress: number } {
  const level = calculateLevel(currentXP);
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] || 0;
  const nextThreshold = LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  
  const current = currentXP - currentThreshold;
  const required = nextThreshold - currentThreshold;
  const progress = Math.min((current / required) * 100, 100);
  
  return { current, required, progress };
}
