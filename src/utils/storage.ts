import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
    USER_SCORE: '@veritaslearn_user_score_v2',
    USER_STATS: '@veritaslearn_user_stats_v2',
    CONVERSATIONS: '@veritaslearn_conversations_v2',
    SCORE_HISTORY: '@veritaslearn_score_history_v2',
    ACTIVITIES: '@veritaslearn_activities_v2',
};

export async function saveScore(score: number): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_SCORE, score.toString());
    } catch (e) {
        console.error('Failed to save score', e);
    }
}

export async function loadScore(): Promise<number> {
    try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.USER_SCORE);
        return saved ? parseInt(saved, 10) : 0; 
    } catch (e) {
        console.error('Failed to load score', e);
        return 0;
    }
}

export async function saveStats(stats: object): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(stats));
    } catch (e) {
        console.error('Failed to save stats', e);
    }
}

export async function loadStats(): Promise<object | null> {
    try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.USER_STATS);
        return saved ? JSON.parse(saved) : null;
    } catch (e) {
        console.error('Failed to load stats', e);
        return null;
    }
}

export async function saveActivities(activities: object[]): Promise<void> {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(activities));
    } catch (e) {
        console.error('Failed to save activities', e);
    }
}

export async function loadActivities(): Promise<object[]> {
    try {
        const saved = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVITIES);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Failed to load activities', e);
        return [];
    }
}

export async function clearAllData(): Promise<void> {
    try {
        const keys = Object.values(STORAGE_KEYS);
        await Promise.all(keys.map(k => AsyncStorage.removeItem(k)));
    } catch (e) {
        console.error('Failed to clear data', e);
    }
}
