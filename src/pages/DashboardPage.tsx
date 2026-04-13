import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Header } from '../components/shared/Header';
import { useApp } from '../contexts/AppContext';

export function DashboardPage() {
    const { stats, tier, score } = useApp();

    return (
        <SafeAreaView style={styles.safeArea}>
            <Header />
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.pageTitle}>Dashboard</Text>

                <View style={styles.statsGrid}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.questionsAnswered}</Text>
                        <Text style={styles.statLabel}>Questions Answered</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.quizPassRate}%</Text>
                        <Text style={styles.statLabel}>Avg Quiz Score</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{stats.currentStreak} 🔥</Text>
                        <Text style={styles.statLabel}>Current Streak</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{score}</Text>
                        <Text style={styles.statLabel}>Total XP</Text>
                    </View>
                    <View style={[styles.statCard, {width: '100%'}]}>
                        <Text style={styles.statValue}>{stats.aiRelianceDecrease}%</Text>
                        <Text style={styles.statLabel}>Decrease in Copying / AI Reliance</Text>
                    </View>
                </View>
                
                <View style={styles.placeholderChart}>
                    <Text style={styles.placeholderTitle}>Learning Progress Over Time</Text>
                    <Text style={styles.placeholderSubtitle}>Charts will be implemented in future phase</Text>
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
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
        gap: 12,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#4f46e5',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
    placeholderChart: {
        height: 200,
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    placeholderTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4b5563',
        marginBottom: 8,
    },
    placeholderSubtitle: {
        fontSize: 12,
        color: '#9ca3af',
    },
});
