import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { BookOpen, Lightbulb, FileText, CheckCircle } from 'lucide-react-native';

export interface FlashcardType {
    id: string;
    front: string;
    back: string;
}

interface StudyMaterialsProps {
    topic: string;
    summary: string;
    keyPoints: string[];
    flashcards: FlashcardType[];
}

function FlashcardItem({ card }: { card: FlashcardType }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <TouchableOpacity 
            activeOpacity={0.8} 
            onPress={() => setFlipped(!flipped)}
            style={[styles.flashcard, flipped ? styles.flashcardBack : styles.flashcardFront]}
        >
            <Text style={[styles.flashcardText, flipped ? styles.flashcardTextBack : styles.flashcardTextFront]}>
                {flipped ? card.back : card.front}
            </Text>
            <Text style={styles.flashcardHint}>
                {flipped ? 'Tap to see question' : 'Tap to flip'}
            </Text>
        </TouchableOpacity>
    );
}

export function StudyMaterials({ topic, summary, keyPoints, flashcards }: StudyMaterialsProps) {
    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.unlockedPill}>
                    <CheckCircle size={16} color="#15803d" />
                    <Text style={styles.unlockedText}>Study Materials Unlocked!</Text>
                </View>
                <Text style={styles.title}>{topic}</Text>
            </View>

            {/* Summary card */}
            <View style={styles.card}>
                <View style={[styles.cardHeader, styles.bgBlue]}>
                    <BookOpen size={20} color="#2563eb" />
                    <Text style={styles.cardTitle}>Summary</Text>
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.summaryText}>{summary}</Text>
                </View>
            </View>

            {/* Key points */}
            <View style={styles.card}>
                <View style={[styles.cardHeader, styles.bgYellow]}>
                    <Lightbulb size={20} color="#ca8a04" />
                    <Text style={styles.cardTitle}>Key Points to Remember</Text>
                </View>
                <View style={styles.cardContent}>
                    {keyPoints.map((point, index) => (
                        <View key={index} style={styles.pointItem}>
                            <View style={styles.pointNumber}>
                                <Text style={styles.pointNumberText}>{index + 1}</Text>
                            </View>
                            <Text style={styles.pointText}>{point}</Text>
                        </View>
                    ))}
                </View>
            </View>

            {/* Flashcards */}
            {flashcards.length > 0 && (
                <View style={styles.flashcardsSection}>
                    <Text style={styles.sectionTitle}>Practice Flashcards</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.flashcardsList}>
                        {flashcards.map(card => (
                            <FlashcardItem key={card.id} card={card} />
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Tip */}
            <View style={styles.tipBox}>
                <FileText size={20} color="#9333ea" style={{ marginTop: 2 }} />
                <View style={styles.tipContent}>
                    <Text style={styles.tipTitle}>Study Tip</Text>
                    <Text style={styles.tipText}>
                        Review these flashcards again tomorrow to strengthen your memory. Spaced repetition is key to long-term retention!
                    </Text>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        maxHeight: '95%',
    },
    content: {
        paddingTop: 10,
        paddingBottom: 30,
    },
    header: {
        alignItems: 'center',
        marginBottom: 24,
    },
    unlockedPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dcfce7',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        gap: 6,
        marginBottom: 16,
    },
    unlockedText: {
        color: '#15803d',
        fontWeight: 'bold',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        overflow: 'hidden',
        marginBottom: 24,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    bgBlue: { backgroundColor: '#eff6ff' },
    bgYellow: { backgroundColor: '#fefce8' },
    cardTitle: {
        fontWeight: 'bold',
        color: '#111827',
    },
    cardContent: {
        padding: 16,
    },
    summaryText: {
        color: '#4b5563',
        lineHeight: 24,
    },
    pointItem: {
        flexDirection: 'row',
        marginBottom: 12,
        alignItems: 'flex-start',
        gap: 12,
    },
    pointNumber: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#6366f1',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 2,
    },
    pointNumberText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: 'bold',
    },
    pointText: {
        flex: 1,
        color: '#111827',
        lineHeight: 22,
    },
    flashcardsSection: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    flashcardsList: {
        gap: 16,
        paddingBottom: 16,
    },
    flashcard: {
        width: 280,
        height: 180,
        borderRadius: 16,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    flashcardFront: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
    },
    flashcardBack: {
        backgroundColor: '#4f46e5',
        borderColor: '#4338ca',
    },
    flashcardText: {
        fontSize: 16,
        textAlign: 'center',
        marginBottom: 16,
        lineHeight: 24,
    },
    flashcardTextFront: {
        color: '#111827',
        fontWeight: '500',
    },
    flashcardTextBack: {
        color: '#ffffff',
    },
    flashcardHint: {
        position: 'absolute',
        bottom: 16,
        fontSize: 12,
        color: '#9ca3af',
    },
    tipBox: {
        flexDirection: 'row',
        backgroundColor: '#faf5ff',
        borderWidth: 1,
        borderColor: '#f3e8ff',
        borderRadius: 16,
        padding: 16,
        gap: 12,
    },
    tipContent: {
        flex: 1,
    },
    tipTitle: {
        fontWeight: 'bold',
        color: '#581c87',
        marginBottom: 4,
    },
    tipText: {
        color: '#7e22ce',
        fontSize: 14,
        lineHeight: 20,
    },
});
