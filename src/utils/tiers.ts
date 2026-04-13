import { TierType, TIER_CONFIG, TierConfig } from '../types';

export function getTier(score: number): TierType {
    if (score >= 10000) return TierType.TITAN;
    if (score >= 5000) return TierType.LEGEND;
    if (score >= 2500) return TierType.MASTER;
    if (score >= 1200) return TierType.SCHOLAR;
    if (score >= 500) return TierType.EXPLORER;
    return TierType.SEEKER;
}

export function getTierConfig(tier: TierType): TierConfig {
    return TIER_CONFIG[tier];
}

export function getNextTier(currentTier: TierType): TierType | null {
    const tiers = Object.values(TierType);
    const currentIndex = tiers.indexOf(currentTier);
    if (currentIndex < tiers.length - 1) {
        return tiers[currentIndex + 1];
    }
    return null;
}

export function getProgressToNextTier(score: number, currentTier: TierType): number {
    const currentConfig = getTierConfig(currentTier);
    const nextTier = getNextTier(currentTier);

    if (!nextTier) return 100; // Already at max tier

    const nextConfig = getTierConfig(nextTier);
    const pointsInCurrentTier = score - currentConfig.minScore;
    const pointsNeeded = nextConfig.minScore - currentConfig.minScore;

    return Math.min(100, Math.round((pointsInCurrentTier / pointsNeeded) * 100));
}

export function getPointsToNextTier(score: number, currentTier: TierType): number {
    const nextTier = getNextTier(currentTier);
    if (!nextTier) return 0;

    const nextConfig = getTierConfig(nextTier);
    return nextConfig.minScore - score;
}
