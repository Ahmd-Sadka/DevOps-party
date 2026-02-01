// Badge checking and awarding hook
import { useCallback } from 'react';
import { UserProgress, BADGES, LEVELS } from '@/types/game';

export function useBadges() {
  const checkAndAwardBadges = useCallback((user: UserProgress): string[] => {
    const newBadges: string[] = [];

    // First Blood - Answer first question correctly
    if (user.stats.correctAnswers >= 1 && !user.earnedBadges.includes('first-blood')) {
      newBadges.push('first-blood');
    }

    // Linux Survivor - Complete Linux level
    if (user.levelProgress.linux?.completed && !user.earnedBadges.includes('linux-survivor')) {
      newBadges.push('linux-survivor');
    }

    // Script Breaker - Complete Bash level
    if (user.levelProgress.bash?.completed && !user.earnedBadges.includes('script-breaker')) {
      newBadges.push('script-breaker');
    }

    // Git Conflict Slayer - Complete Git level
    if (user.levelProgress.git?.completed && !user.earnedBadges.includes('conflict-slayer')) {
      newBadges.push('conflict-slayer');
    }

    // Docker Whisperer - Complete Docker level
    if (user.levelProgress.docker?.completed && !user.earnedBadges.includes('docker-whisperer')) {
      newBadges.push('docker-whisperer');
    }

    // Ansible Automator - Complete Ansible level
    if (user.levelProgress.ansible?.completed && !user.earnedBadges.includes('ansible-automator')) {
      newBadges.push('ansible-automator');
    }

    // K8s Captain - Complete Kubernetes level
    if (user.levelProgress.kubernetes?.completed && !user.earnedBadges.includes('k8s-captain')) {
      newBadges.push('k8s-captain');
    }

    // Terraform Titan - Complete Terraform level
    if (user.levelProgress.terraform?.completed && !user.earnedBadges.includes('terraform-titan')) {
      newBadges.push('terraform-titan');
    }

    // AWS Warrior - Complete AWS level
    if (user.levelProgress.aws?.completed && !user.earnedBadges.includes('aws-warrior')) {
      newBadges.push('aws-warrior');
    }

    // CI/CD Commander - Complete CI/CD level
    if (user.levelProgress.cicd?.completed && !user.earnedBadges.includes('cicd-commander')) {
      newBadges.push('cicd-commander');
    }

    // OpenShift Operator - Complete OpenShift level
    if (user.levelProgress.openshift?.completed && !user.earnedBadges.includes('openshift-operator')) {
      newBadges.push('openshift-operator');
    }

    // DevOps Legend - Complete all levels
    const allCompleted = LEVELS.every(level => user.levelProgress[level.id]?.completed);
    if (allCompleted && !user.earnedBadges.includes('devops-legend')) {
      newBadges.push('devops-legend');
    }

    // Cloud Master - Complete AWS, K8s, and OpenShift
    const cloudLevelsCompleted = 
      user.levelProgress.aws?.completed && 
      user.levelProgress.kubernetes?.completed && 
      user.levelProgress.openshift?.completed;
    if (cloudLevelsCompleted && !user.earnedBadges.includes('cloud-master')) {
      newBadges.push('cloud-master');
    }

    // Perfectionist - 100% accuracy on any level
    const hasPerfectLevel = Object.values(user.levelProgress).some(
      progress => progress.completed && progress.questionsAnswered > 0 &&
        (progress.correctAnswers / progress.questionsAnswered) === 1
    );
    if (hasPerfectLevel && !user.earnedBadges.includes('perfectionist')) {
      newBadges.push('perfectionist');
    }

    // Streak Master - 7 day streak
    if (user.streak.longestStreak >= 7 && !user.earnedBadges.includes('streak-master')) {
      newBadges.push('streak-master');
    }

    // Centurion - Answer 100 questions
    if (user.stats.totalQuestionsAnswered >= 100 && !user.earnedBadges.includes('centurion')) {
      newBadges.push('centurion');
    }

    // Night Owl - Practice after midnight (check current hour)
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 5 && !user.earnedBadges.includes('night-owl')) {
      newBadges.push('night-owl');
    }

    // Early Bird - Practice before 6 AM
    if (currentHour >= 5 && currentHour < 6 && !user.earnedBadges.includes('early-bird')) {
      newBadges.push('early-bird');
    }

    // Speed Demon - Complete level in under 10 minutes (600 seconds)
    const hasSpeedRun = Object.values(user.levelProgress).some(
      progress => progress.completed && progress.bestTime && progress.bestTime < 600
    );
    if (hasSpeedRun && !user.earnedBadges.includes('speed-demon')) {
      newBadges.push('speed-demon');
    }

    // Boss Slayer - Defeat 5 bosses
    if (user.stats.bossesDefeated >= 5 && !user.earnedBadges.includes('boss-slayer')) {
      newBadges.push('boss-slayer');
    }

    // Daily Warrior - Complete 10 daily challenges
    if (user.stats.dailyChallengesCompleted >= 10 && !user.earnedBadges.includes('daily-warrior')) {
      newBadges.push('daily-warrior');
    }

    return newBadges;
  }, []);

  const getBadgeById = useCallback((badgeId: string) => {
    return BADGES.find(b => b.id === badgeId);
  }, []);

  const getRarityColor = useCallback((rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-muted-foreground';
      case 'rare': return 'text-blue-400';
      case 'epic': return 'text-purple-400';
      case 'legendary': return 'text-yellow-400';
      default: return 'text-foreground';
    }
  }, []);

  const getRarityBorder = useCallback((rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-border';
      case 'rare': return 'border-blue-500/50';
      case 'epic': return 'border-purple-500/50';
      case 'legendary': return 'border-yellow-500/50 shadow-lg shadow-yellow-500/20';
      default: return 'border-border';
    }
  }, []);

  return { checkAndAwardBadges, getBadgeById, getRarityColor, getRarityBorder };
}
