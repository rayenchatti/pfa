import React, { useState, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, Platform } from 'react-native';
import { Header } from '../components/shared/Header';
import { ChatInterface } from '../components/chat/ChatInterface';
import { ComprehensionGate } from '../components/quiz/ComprehensionGate';
import { QuizInterface } from '../components/quiz/QuizInterface';
import { QuizResults } from '../components/quiz/QuizResults';
import { StudyMaterials } from '../components/quiz/StudyMaterials';
import { Dialog, DialogContent } from '../components/ui/Dialog';
import { useApp } from '../contexts/AppContext';
import { getFallbackResponse, StudyData } from '../utils/mockData';
import { submitQuizToBackend } from '../services/api';
import { Question } from '../types';

type ModalState = 'closed' | 'gate' | 'quiz' | 'results' | 'study';

export function ChatPage() {
    const { messages, updateMessage, addScore, updateStats, stats } = useApp();
    const [modalState, setModalState] = useState<ModalState>('closed');
    const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
    const [currentStudyData, setCurrentStudyData] = useState<StudyData | null>(null);
    const [quizScore, setQuizScore] = useState({ correct: 0, total: 0, points: 0 });
    const [isRetry, setIsRetry] = useState(false);
    const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);

    const handleOpenGate = useCallback((messageId: string) => {
        setCurrentMessageId(messageId);
        const assistantMessage = messages.find(m => m.id === messageId);

        if (assistantMessage && assistantMessage.studyData) {
            setCurrentStudyData(assistantMessage.studyData);
        } else {
            const messageIndex = messages.findIndex(m => m.id === messageId);
            if (messageIndex > 0) {
                const userQuestion = messages[messageIndex - 1].content;
                setCurrentStudyData(getFallbackResponse(userQuestion));
            }
        }
        setModalState('gate');
        setIsRetry(false);
    }, [messages]);

    const handleCopy = useCallback(() => {
        if (currentMessageId) {
            updateMessage(currentMessageId, { locked: false, unlocked: true });
            addScore(0, 'Copied AI answer without quiz');
        }
        setModalState('closed');
        setCurrentStudyData(null);
    }, [currentMessageId, updateMessage, addScore]);

    const handleLearn = useCallback(() => {
        if (currentStudyData) {
            const questions = isRetry ? currentStudyData.easyQuiz : currentStudyData.quiz;
            setActiveQuestions(questions);
        }
        setModalState('quiz');
    }, [currentStudyData, isRetry]);

    const handleQuizComplete = useCallback(async (correct: number, total: number, userAnswers: number[]) => {
        try {
            const topic = currentStudyData?.topic ?? 'Unknown';
            const questions = activeQuestions;

            // Submit to backend: server validates, scores, and unlocks chat_access
            const result = await submitQuizToBackend(topic, userAnswers, questions, isRetry);

            setQuizScore({ correct: result.score, total: result.total, points: result.pointsEarned });

            if (result.passed && currentMessageId) {
                updateMessage(currentMessageId, { locked: false, unlocked: true });
                addScore(result.pointsEarned, `Passed quiz${isRetry ? ' (retry)' : ''}: ${result.score}/${result.total} correct`);
                updateStats({
                    questionsAnswered: stats.questionsAnswered + 1,
                    quizPassRate: Math.round(
                        ((stats.quizPassRate * stats.questionsAnswered + 100) / (stats.questionsAnswered + 1))
                    ),
                });
            }
        } catch (err: any) {
            console.error('Quiz submission error:', err);
            // Fallback: use client-side scoring if backend fails
            const percentage = correct / total;
            const passed = percentage >= 0.7;
            const points = passed ? (isRetry ? 30 : 50) : 0;
            setQuizScore({ correct, total, points });
            if (passed && currentMessageId) {
                updateMessage(currentMessageId, { locked: false, unlocked: true });
                addScore(points, `Passed quiz (offline): ${correct}/${total}`);
            }
        }

        setModalState('results');
    }, [isRetry, currentMessageId, currentStudyData, activeQuestions, updateMessage, addScore, updateStats, stats]);


    const handleRetry = useCallback(() => {
        setIsRetry(true);
        setModalState('quiz');
    }, []);

    const handleContinue = useCallback(() => {
        if (quizScore.points > 0 && currentStudyData) {
            setModalState('study');
        } else {
            setModalState('closed');
            setCurrentStudyData(null);
            setCurrentMessageId(null);
        }
    }, [quizScore.points, currentStudyData]);

    const handleClose = useCallback(() => {
        if (modalState === 'gate') {
            setModalState('closed');
            setCurrentStudyData(null);
            setCurrentMessageId(null);
        }
    }, [modalState]);

    const handleCloseStudy = useCallback(() => {
        setModalState('closed');
        setCurrentStudyData(null);
        setCurrentMessageId(null);
    }, []);

    return (
        <SafeAreaView style={styles.container}>
            <Header />
            <View style={styles.main}>
                <ChatInterface onOpenGate={handleOpenGate} />
            </View>

            {/* Modals */}
            <ComprehensionGate
                open={modalState === 'gate'}
                onClose={handleClose}
                onCopy={handleCopy}
                onLearn={handleLearn}
            />

            <Dialog open={modalState === 'quiz'} onClose={() => {}}>
                {currentStudyData && (
                    <QuizInterface
                        questions={isRetry ? currentStudyData.easyQuiz : currentStudyData.quiz}
                        onComplete={handleQuizComplete}
                    />
                )}
            </Dialog>

            <Dialog open={modalState === 'results'} onClose={() => {}}>
                <QuizResults
                    score={quizScore.correct}
                    totalQuestions={quizScore.total}
                    pointsEarned={quizScore.points}
                    onRetry={quizScore.points === 0 ? handleRetry : undefined}
                    onContinue={handleContinue}
                    isRetry={isRetry}
                />
            </Dialog>

            <Dialog open={modalState === 'study'} onClose={handleCloseStudy}>
                {currentStudyData && (
                    <StudyMaterials
                        topic={currentStudyData.topic}
                        summary={currentStudyData.humanized}
                        keyPoints={currentStudyData.keyPoints}
                        flashcards={currentStudyData.flashcards}
                    />
                )}
            </Dialog>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ffffff',
        paddingTop: Platform.OS === 'android' ? 25 : 0,
    },
    main: {
        flex: 1,
        paddingTop: 16,
    },
});
