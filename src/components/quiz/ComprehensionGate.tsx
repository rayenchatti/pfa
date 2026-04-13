import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Dialog, DialogContent } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Copy, Brain, X, Check, Star, FileText, Zap } from 'lucide-react-native';

interface ComprehensionGateProps {
    open: boolean;
    onClose: () => void;
    onCopy: () => void;
    onLearn: () => void;
}

export function ComprehensionGate({ open, onClose, onCopy, onLearn }: ComprehensionGateProps) {
    return (
        <Dialog open={open} onClose={onClose}>
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.title}>Make Your Choice</Text>
                    <Text style={styles.subtitle}>How do you want to use this AI-generated answer?</Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {/* Path B - Understand & Learn (Recommended first on mobile) */}
                    <View style={styles.cardGreen}>
                        <View style={styles.badgeRecommended}>
                            <Text style={styles.badgeRecommendedText}>Recommended</Text>
                        </View>
                        <View style={styles.badgePoints}>
                            <Text style={styles.badgePointsText}>+50 pts</Text>
                        </View>

                        <View style={styles.cardContent}>
                            <View style={styles.iconContainerGreen}>
                                <Brain size={28} color="#16a34a" />
                            </View>

                            <Text style={styles.cardTitleGreen}>Understand & Learn</Text>

                            <View style={styles.list}>
                                <View style={styles.listItem}>
                                    <Check size={16} color="#15803d" />
                                    <Text style={styles.listItemTextGreen}>Take comprehension quiz</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <Star size={16} color="#eab308" />
                                    <Text style={[styles.listItemTextGreen, styles.fontMedium]}>Earn 50 points if pass (70%+)</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <Zap size={16} color="#15803d" />
                                    <Text style={styles.listItemTextGreen}>Get humanized answer in your style</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <FileText size={16} color="#15803d" />
                                    <Text style={styles.listItemTextGreen}>Bonus: Flashcards + Study Guide</Text>
                                </View>
                            </View>

                            <Button onPress={onLearn} style={styles.btnGreen}>
                                <Text style={styles.btnTextWhite}>Prove Understanding</Text>
                            </Button>
                        </View>
                    </View>

                    {/* Path A - Just Copy */}
                    <View style={styles.cardRed}>
                        <View style={styles.badgeQuick}>
                            <Text style={styles.badgeQuickText}>Quick Path</Text>
                        </View>

                        <View style={styles.cardContent}>
                            <View style={styles.iconContainerRed}>
                                <Copy size={28} color="#ef4444" />
                            </View>

                            <Text style={styles.cardTitleRed}>Just Copy</Text>

                            <View style={styles.list}>
                                <View style={styles.listItem}>
                                    <X size={16} color="#dc2626" />
                                    <Text style={styles.listItemTextRed}>Copy without understanding</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <X size={16} color="#dc2626" />
                                    <Text style={styles.listItemTextRed}>0 points earned</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <X size={16} color="#dc2626" />
                                    <Text style={styles.listItemTextRed}>Plain AI text only</Text>
                                </View>
                                <View style={styles.listItem}>
                                    <X size={16} color="#dc2626" />
                                    <Text style={styles.listItemTextRed}>No study materials</Text>
                                </View>
                            </View>

                            <Button variant="outline" onPress={onCopy} style={styles.btnRedOutline}>
                                <Text style={styles.btnTextRed}>Copy Anyway</Text>
                            </Button>
                        </View>
                    </View>
                </ScrollView>
                
                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>💡 Your choice matters. Building real understanding leads to lasting knowledge.</Text>
                </View>
            </View>
        </Dialog>
    );
}

const styles = StyleSheet.create({
    container: {
        maxHeight: '95%',
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
    },
    cardGreen: {
        position: 'relative',
        backgroundColor: '#f0fdf4',
        borderWidth: 2,
        borderColor: '#86efac',
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        marginTop: 10,
    },
    cardRed: {
        position: 'relative',
        backgroundColor: '#fef2f2',
        borderWidth: 2,
        borderColor: '#fecaca',
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        marginTop: 10,
    },
    badgeRecommended: {
        position: 'absolute',
        top: -12,
        left: 16,
        backgroundColor: '#ffffff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeRecommendedText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#16a34a',
    },
    badgePoints: {
        position: 'absolute',
        top: -12,
        right: 16,
        backgroundColor: '#22c55e',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    badgePointsText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    badgeQuick: {
        position: 'absolute',
        top: -12,
        left: 16,
        backgroundColor: '#ffffff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
    },
    badgeQuickText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#ef4444',
    },
    cardContent: {
        alignItems: 'center',
    },
    iconContainerGreen: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#dcfce7',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconContainerRed: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#fee2e2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    cardTitleGreen: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#15803d',
        marginBottom: 16,
    },
    cardTitleRed: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#b91c1c',
        marginBottom: 16,
    },
    list: {
        width: '100%',
        marginBottom: 16,
        gap: 8,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    listItemTextGreen: {
        fontSize: 13,
        color: '#15803d',
    },
    listItemTextRed: {
        fontSize: 13,
        color: '#dc2626',
    },
    fontMedium: {
        fontWeight: '600',
    },
    btnGreen: {
        width: '100%',
        backgroundColor: '#22c55e',
    },
    btnTextWhite: {
        color: '#ffffff',
        fontWeight: '600',
    },
    btnRedOutline: {
        width: '100%',
        borderColor: '#fca5a5',
    },
    btnTextRed: {
        color: '#dc2626',
        fontWeight: '600',
    },
    footer: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: '#f3f4f6',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
});
