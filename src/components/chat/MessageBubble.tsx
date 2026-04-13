import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Lock, AlertTriangle, Bot, User } from 'lucide-react-native';

interface MessageBubbleProps {
    role: 'user' | 'assistant';
    content: string;
    locked?: boolean;
    onLockedClick?: () => void;
}

export function MessageBubble({ role, content, locked = false, onLockedClick }: MessageBubbleProps) {
    const isUser = role === 'user';

    return (
        <View style={[styles.container, isUser ? styles.containerUser : styles.containerAssistant]}>
            {/* Avatar */}
            <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAssistant]}>
                {isUser ? (
                    <User color="#ffffff" size={18} />
                ) : (
                    <Bot color="#4b5563" size={18} />
                )}
            </View>

            {/* Message content */}
            <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
                {locked ? (
                    <TouchableOpacity activeOpacity={0.8} onPress={onLockedClick} style={styles.lockedContainer}>
                        {/* Fake Burred Text placeholder since true Blur is complex in bare RN without expo-blur */}
                        <Text style={styles.blurredText} numberOfLines={3}>
                            {content.slice(0, 150)}...
                        </Text>
                        
                        <View style={styles.lockedOverlay}>
                            <Lock color="#6366f1" size={24} style={styles.lockIcon} />
                            <Text style={styles.lockedText}>Click to unlock</Text>
                            <View style={styles.warningContainer}>
                                <AlertTriangle color="#f59e0b" size={12} />
                                <Text style={styles.warningText}>AI-generated content</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                ) : (
                    <View>
                        {content.split('\n').map((line, i) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                                return <Text key={i} style={[styles.text, isUser ? styles.textUser : styles.textAssistant, styles.boldText]}>{line.slice(2, -2)}</Text>;
                            }
                            if (line.startsWith('- ')) {
                                return <Text key={i} style={[styles.text, isUser ? styles.textUser : styles.textAssistant, styles.listItem]}>• {line.slice(2)}</Text>;
                            }
                            if (line.startsWith('> ')) {
                                return <Text key={i} style={[styles.text, styles.blockquote]}>{line.slice(2)}</Text>;
                            }
                            return (
                                <Text key={i} style={[styles.text, isUser ? styles.textUser : styles.textAssistant, line.trim() === '' ? styles.emptyLine : null]}>
                                    {line}
                                </Text>
                            );
                        })}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    containerUser: {
        flexDirection: 'row-reverse',
    },
    containerAssistant: {
        flexDirection: 'row',
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarUser: {
        backgroundColor: '#6366f1',
    },
    avatarAssistant: {
        backgroundColor: '#e5e7eb',
    },
    bubble: {
        maxWidth: '80%',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    bubbleUser: {
        backgroundColor: '#6366f1',
    },
    bubbleAssistant: {
        backgroundColor: '#f3f4f6',
    },
    text: {
        fontSize: 16,
        lineHeight: 24,
    },
    textUser: {
        color: '#ffffff',
    },
    textAssistant: {
        color: '#111827',
    },
    boldText: {
        fontWeight: 'bold',
    },
    listItem: {
        marginLeft: 8,
    },
    blockquote: {
        borderLeftWidth: 2,
        borderLeftColor: '#a5b4fc',
        paddingLeft: 12,
        fontStyle: 'italic',
        color: '#4b5563',
        marginVertical: 8,
    },
    emptyLine: {
        height: 8,
    },
    lockedContainer: {
        position: 'relative',
        minHeight: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    blurredText: {
        color: '#9ca3af',
        opacity: 0.5,
    },
    lockedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(243, 244, 246, 0.85)',
        borderRadius: 16,
    },
    lockIcon: {
        marginBottom: 8,
    },
    lockedText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    warningContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 8,
    },
    warningText: {
        fontSize: 12,
        color: '#d97706',
    },
});
