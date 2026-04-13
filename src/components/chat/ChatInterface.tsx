import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useApp } from '../../contexts/AppContext';
import { MessageBubble } from './MessageBubble';
import { Button } from '../ui/Button';
import { Send, Trash2 } from 'lucide-react-native';
import { generateStudyData } from '../../services/gemini';
import { Message } from '../../types';

interface ChatInterfaceProps {
    onOpenGate: (messageId: string) => void;
}

export function ChatInterface({ onOpenGate }: ChatInterfaceProps) {
    const { messages, addMessage, clearMessages } = useApp();
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewRef = useRef<ScrollView>(null);

    const scrollToBottom = () => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            locked: false,
            timestamp: new Date(),
        };

        addMessage(userMessage);
        const currentInput = input;
        setInput('');
        setIsLoading(true);

        try {
            const response = await generateStudyData(currentInput);

            const assistantMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: response.answer,
                locked: true,
                timestamp: new Date(),
                humanizedContent: response.humanized,
                studyData: response,
            };

            addMessage(assistantMessage);
        } catch (error) {
            console.error("ChatInterface Error:", error);
            const errorMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: "Sorry, I couldn't process that. Please check your Gemini API key in `src/services/gemini.ts`.",
                locked: false,
                timestamp: new Date(),
            };
            addMessage(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const suggestedQuestions = ['Explain photosynthesis', "Newton's First Law", 'What is gravity?'];

    return (
        <KeyboardAvoidingView 
            style={styles.container} 
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        >
            <View style={styles.chatBoxContainer}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>AI Learning Assistant</Text>
                        <Text style={styles.headerSubtitle}>Ask any question to start learning</Text>
                    </View>
                    {messages.length > 0 && (
                        <TouchableOpacity style={styles.clearBtn} onPress={clearMessages}>
                            <Trash2 size={16} color="#6b7280" />
                            <Text style={styles.clearBtnText}>Clear</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Messages area */}
                <ScrollView 
                    ref={scrollViewRef}
                    style={styles.messagesArea} 
                    contentContainerStyle={styles.messagesContent}
                    onContentSizeChange={scrollToBottom}
                >
                    {messages.length === 0 ? (
                        <View style={styles.emptyState}>
                            <View style={styles.iconContainer}>
                                <Send size={28} color="#6366f1" />
                            </View>
                            <Text style={styles.emptyStateTitle}>Start a conversation</Text>
                            <Text style={styles.emptyStateText}>
                                Ask about any topic like "Explain photosynthesis" or "What is Newton's First Law?"
                            </Text>
                            <View style={styles.suggestionsContainer}>
                                {suggestedQuestions.map((q) => (
                                    <TouchableOpacity 
                                        key={q} 
                                        style={styles.suggestionBtn}
                                        onPress={() => setInput(q)}
                                    >
                                        <Text style={styles.suggestionText}>{q}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ) : (
                        messages.map((message) => (
                            <MessageBubble
                                key={message.id}
                                role={message.role}
                                content={message.unlocked ? (message.humanizedContent || message.content) : message.content}
                                locked={message.role === 'assistant' && message.locked && !message.unlocked}
                                onLockedClick={() => onOpenGate(message.id)}
                            />
                        ))
                    )}

                    {isLoading && (
                        <View style={styles.loadingContainer}>
                            <View style={styles.loadingAvatar}>
                                <ActivityIndicator size="small" color="#4b5563" />
                            </View>
                            <View style={styles.loadingBubble}>
                                <Text style={styles.loadingText}>Thinking...</Text>
                            </View>
                        </View>
                    )}
                </ScrollView>

                {/* Input area */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.input}
                        value={input}
                        onChangeText={setInput}
                        placeholder="Ask a question..."
                        placeholderTextColor="#9ca3af"
                        editable={!isLoading}
                        onSubmitEditing={handleSubmit}
                    />
                    <Button
                        size="icon"
                        variant="default"
                        onPress={handleSubmit}
                        disabled={!input.trim() || isLoading}
                    >
                        {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Send size={20} color="#fff" />}
                    </Button>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    chatBoxContainer: {
        flex: 1,
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginHorizontal: 16,
        marginBottom: 16,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    headerTitle: {
        fontWeight: '600',
        fontSize: 16,
        color: '#111827',
    },
    headerSubtitle: {
        fontSize: 12,
        color: '#6b7280',
    },
    clearBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    clearBtnText: {
        fontSize: 14,
        color: '#6b7280',
    },
    messagesArea: {
        flex: 1,
    },
    messagesContent: {
        padding: 16,
        flexGrow: 1,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#e0e7ff',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    emptyStateTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 8,
    },
    emptyStateText: {
        fontSize: 14,
        color: '#6b7280',
        textAlign: 'center',
        marginBottom: 24,
    },
    suggestionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    suggestionBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 16,
    },
    suggestionText: {
        fontSize: 12,
        color: '#374151',
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    loadingAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#e5e7eb',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingBubble: {
        backgroundColor: '#f3f4f6',
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    loadingText: {
        color: '#6b7280',
        fontSize: 14,
    },
    inputContainer: {
        flexDirection: 'row',
        padding: 16,
        backgroundColor: '#ffffff',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        gap: 12,
    },
    input: {
        flex: 1,
        height: 44,
        backgroundColor: '#ffffff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
    },
});
