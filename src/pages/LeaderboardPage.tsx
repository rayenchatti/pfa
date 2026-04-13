import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Header } from '../components/shared/Header';
import { MOCK_LEADERBOARD } from '../utils/mockData';
import { getTierConfig } from '../utils/tiers';

export function LeaderboardPage() {
    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.pageTitle}>Campus Leaderboard</Text>
                    <Text style={styles.pageSubtitle}>Compare your progress with other students</Text>
                </View>

                <View style={styles.listContainer}>
                    {MOCK_LEADERBOARD.map((entry, index) => {
                        const tierConfig = getTierConfig(entry.tier);
                        
                        return (
                            <View 
                                key={index} 
                                style={[
                                    styles.listItem, 
                                    entry.isCurrentUser && styles.listItemCurrentUser
                                ]}
                            >
                                <View style={styles.rankContainer}>
                                    <Text style={styles.rankText}>#{entry.rank}</Text>
                                </View>
                                
                                <View style={styles.avatarContainer}>
                                    <Text style={styles.avatarText}>{entry.avatar}</Text>
                                </View>

                                <View style={styles.infoContainer}>
                                    <Text style={[styles.nameText, entry.isCurrentUser && styles.textPrimary]}>
                                        {entry.name} {entry.isCurrentUser && '(You)'}
                                    </Text>
                                    <View style={styles.tierContainer}>
                                        <Text style={styles.tierIcon}>{tierConfig.icon}</Text>
                                        <Text style={styles.tierName}>{tierConfig.name}</Text>
                                    </View>
                                </View>

                                <View style={styles.scoreContainer}>
                                    <Text style={styles.scoreText}>{entry.score.toLocaleString()}</Text>
                                    <Text style={styles.xpText}>XP</Text>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    container: {
        flex: 1,
    },
    content: {
        padding: 16,
    },
    headerTitleContainer: {
        marginBottom: 20,
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
    },
    pageSubtitle: {
        fontSize: 14,
        color: '#6b7280',
        marginTop: 4,
    },
    listContainer: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    listItemCurrentUser: {
        backgroundColor: '#eef2ff',
    },
    rankContainer: {
        width: 40,
    },
    rankText: {
        fontWeight: 'bold',
        color: '#6b7280',
        fontSize: 16,
    },
    avatarContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontWeight: 'bold',
        color: '#4b5563',
    },
    infoContainer: {
        flex: 1,
    },
    nameText: {
        fontWeight: 'bold',
        color: '#111827',
        fontSize: 16,
        marginBottom: 4,
    },
    textPrimary: {
        color: '#4f46e5',
    },
    tierContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    tierIcon: {
        fontSize: 12,
    },
    tierName: {
        fontSize: 12,
        color: '#6b7280',
    },
    scoreContainer: {
        alignItems: 'flex-end',
    },
    scoreText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#111827',
    },
    xpText: {
        fontSize: 12,
        color: '#6b7280',
    },
});
