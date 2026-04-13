import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Question } from '../../types';
import { Button } from '../ui/Button';
import { CheckCircle, XCircle, ChevronRight, Clock } from 'lucide-react-native';

interface QuizInterfaceProps {
    questions: Question[];
    onComplete: (score: number, totalQuestions: number) => void;
}

export function QuizInterface({ questions, onComplete }: QuizInterfaceProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 30);
    const [timerActive, setTimerActive] = useState(true);

    const currentQuestion = questions[currentIndex];
    const isCorrect = selectedAnswer === currentQuestion?.correctAnswer;

    const handleTimeUp = useCallback(() => {
        if (!isAnswered) {
            setIsAnswered(true);
            setTimerActive(false);
        }
    }, [isAnswered]);

    useEffect(() => {
        if (timerActive && timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timerActive && timeLeft === 0) {
            handleTimeUp();
        }
    }, [timerActive, timeLeft, handleTimeUp]);

    if (!currentQuestion) return null;

    const progress = ((currentIndex + 1) / questions.length) * 100;

    const handleSelectAnswer = (index: number) => {
        if (isAnswered) return;
        setSelectedAnswer(index);
    };

    const handleSubmit = () => {
        if (selectedAnswer === null) return;

        setIsAnswered(true);
        setTimerActive(false);

        if (selectedAnswer === currentQuestion.correctAnswer) {
            setCorrectAnswers(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedAnswer(null);
            setIsAnswered(false);
            setTimeLeft(questions[currentIndex + 1].timeLimit);
            setTimerActive(true);
        } else {
            // Quiz complete
            onComplete(correctAnswers, questions.length);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Progress header */}
            <View style={styles.progressHeader}>
                <View style={styles.progressTextRow}>
                    <Text style={styles.progressTextMain}>Question {currentIndex + 1} of {questions.length}</Text>
                    <Text style={styles.progressTextSub}>{correctAnswers} correct so far</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
            </View>

            {/* Timer */}
            <View style={styles.timerContainer}>
                <Clock size={16} color={timeLeft < 10 ? '#ef4444' : '#6b7280'} />
                <Text style={[styles.timerText, timeLeft < 10 && styles.timerTextDanger]}>
                    00:{timeLeft.toString().padStart(2, '0')}
                </Text>
            </View>

            {/* Question */}
            <View style={styles.questionCard}>
                <Text style={styles.questionText}>{currentQuestion.question}</Text>

                {/* Options */}
                <View style={styles.optionsContainer}>
                    {currentQuestion.options.map((option, index) => {
                        const isSelected = selectedAnswer === index;
                        const isCorrectAnswer = index === currentQuestion.correctAnswer;

                        let cardStyle: any[] = [styles.optionCard];
                        let textStyle: any[] = [styles.optionText];
                        let letterBgStyle: any[] = [styles.letterBg];
                        let letterTextStyle: any[] = [styles.letterText];

                        if (isAnswered) {
                            if (isCorrectAnswer) {
                                cardStyle.push(styles.optionCorrectBg);
                                textStyle.push(styles.textCorrect);
                                letterBgStyle.push(styles.bgCorrect);
                                letterTextStyle.push(styles.textWhite);
                            } else if (isSelected && !isCorrectAnswer) {
                                cardStyle.push(styles.optionWrongBg);
                                textStyle.push(styles.textWrong);
                                letterBgStyle.push(styles.bgWrong);
                                letterTextStyle.push(styles.textWhite);
                            } else {
                                cardStyle.push(styles.optionDisabled);
                            }
                        } else if (isSelected) {
                            cardStyle.push(styles.optionSelectedBg);
                            textStyle.push(styles.textSelected);
                            letterBgStyle.push(styles.bgSelected);
                            letterTextStyle.push(styles.textWhite);
                        }

                        return (
                            <TouchableOpacity
                                key={index}
                                onPress={() => handleSelectAnswer(index)}
                                disabled={isAnswered}
                                activeOpacity={0.7}
                                style={cardStyle}
                            >
                                <View style={letterBgStyle}>
                                    <Text style={letterTextStyle}>{String.fromCharCode(65 + index)}</Text>
                                </View>
                                <Text style={[textStyle, { flex: 1 }]}>{option}</Text>
                                
                                {isAnswered && isCorrectAnswer && (
                                    <CheckCircle size={20} color="#22c55e" />
                                )}
                                {isAnswered && isSelected && !isCorrectAnswer && (
                                    <XCircle size={20} color="#ef4444" />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Explanation */}
            {isAnswered && (
                <View style={[styles.explanationBox, isCorrect ? styles.explanationBoxCorrect : styles.explanationBoxWrong]}>
                    <View style={styles.explanationHeader}>
                        {isCorrect ? (
                            <>
                                <CheckCircle size={20} color="#16a34a" />
                                <Text style={styles.explanationTitleCorrect}>Correct!</Text>
                            </>
                        ) : (
                            <>
                                <XCircle size={20} color="#dc2626" />
                                <Text style={styles.explanationTitleWrong}>
                                    {selectedAnswer === null ? "Time's up!" : 'Incorrect'}
                                </Text>
                            </>
                        )}
                    </View>
                    <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                </View>
            )}

            {/* Actions */}
            <View style={styles.actionsContainer}>
                {!isAnswered ? (
                    <Button onPress={handleSubmit} disabled={selectedAnswer === null}>
                        Submit Answer
                    </Button>
                ) : (
                    <Button onPress={handleNext}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.nextBtnText}>
                                {currentIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
                            </Text>
                            <ChevronRight size={18} color="#ffffff" style={{ marginLeft: 4 }} />
                        </View>
                    </Button>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    content: {
        paddingBottom: 24,
    },
    progressHeader: {
        marginBottom: 16,
    },
    progressTextRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    progressTextMain: {
        fontWeight: '500',
        color: '#111827',
    },
    progressTextSub: {
        color: '#6b7280',
        fontSize: 12,
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#6366f1',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginBottom: 16,
    },
    timerText: {
        color: '#4b5563',
        fontWeight: 'bold',
    },
    timerTextDanger: {
        color: '#ef4444',
    },
    questionCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
    },
    questionText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    optionsContainer: {
        gap: 12,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#e5e7eb',
        backgroundColor: '#ffffff',
        gap: 12,
    },
    optionSelectedBg: {
        borderColor: '#6366f1',
        backgroundColor: '#eef2ff',
    },
    optionCorrectBg: {
        borderColor: '#22c55e',
        backgroundColor: '#f0fdf4',
    },
    optionWrongBg: {
        borderColor: '#ef4444',
        backgroundColor: '#fef2f2',
    },
    optionDisabled: {
        opacity: 0.6,
    },
    letterBg: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bgSelected: { backgroundColor: '#6366f1' },
    bgCorrect: { backgroundColor: '#22c55e' },
    bgWrong: { backgroundColor: '#ef4444' },
    letterText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#4b5563',
    },
    textWhite: { color: '#ffffff' },
    optionText: {
        fontSize: 15,
        color: '#374151',
    },
    textSelected: { color: '#4338ca' },
    textCorrect: { color: '#15803d' },
    textWrong: { color: '#b91c1c' },
    explanationBox: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
    },
    explanationBoxCorrect: {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
    },
    explanationBoxWrong: {
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
    },
    explanationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 8,
    },
    explanationTitleCorrect: {
        fontWeight: 'bold',
        color: '#15803d',
    },
    explanationTitleWrong: {
        fontWeight: 'bold',
        color: '#b91c1c',
    },
    explanationText: {
        fontSize: 14,
        color: '#4b5563',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    nextBtnText: {
        color: '#ffffff',
        fontWeight: 'bold',
    },
});
