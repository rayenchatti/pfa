/**
 * api.ts — Secure API layer for VeritasLearn
 *
 * All calls go through Supabase Edge Functions.
 * The Gemini API key NEVER leaves the server.
 */

import { supabase } from './supabase';
import { StudyData } from '../utils/mockData';

// ─────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  timeLimit: number;
}

export interface QuizSubmitResult {
  passed: boolean;
  score: number;
  total: number;
  scorePercent: number;
  pointsEarned: number;
  passThreshold: number;
}

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

async function getAuthHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated. Please sign in.');
  }
  return {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

// ─────────────────────────────────────────────────
// 1. Generate study data (secure Gemini gateway)
// ─────────────────────────────────────────────────

export async function generateStudyDataSecure(
  prompt: string,
  topic: string
): Promise<StudyData> {
  const headers = await getAuthHeaders();

  const { data, error } = await supabase.functions.invoke('generate', {
    headers,
    body: { prompt, topic },
  });

  if (error) {
    // Supabase wraps HTTP errors — extract the message
    const msg = (error as any)?.message ?? 'Failed to generate study data';
    throw new Error(msg);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  const parsed: StudyData = data.data;

  // Ensure unique IDs
  parsed.quiz = parsed.quiz.map((q, i) => ({ ...q, id: q.id || `q_${Date.now()}_${i}` }));
  parsed.easyQuiz = parsed.easyQuiz.map((q, i) => ({ ...q, id: q.id || `eq_${Date.now()}_${i}` }));
  parsed.flashcards = parsed.flashcards.map((f, i) => ({ ...f, id: f.id || `fc_${Date.now()}_${i}` }));

  return parsed;
}

// ─────────────────────────────────────────────────
// 2. Submit quiz answers (server-side scoring)
// ─────────────────────────────────────────────────

export async function submitQuizToBackend(
  topic: string,
  userAnswers: number[],
  questions: QuizQuestion[],
  isRetry: boolean = false
): Promise<QuizSubmitResult> {
  const headers = await getAuthHeaders();

  const { data, error } = await supabase.functions.invoke('submit-quiz', {
    headers,
    body: { topic, userAnswers, questions, isRetry },
  });

  if (error) {
    const msg = (error as any)?.message ?? 'Failed to submit quiz';
    throw new Error(msg);
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data as QuizSubmitResult;
}

// ─────────────────────────────────────────────────
// 3. Fetch user stats from Supabase
// ─────────────────────────────────────────────────

export async function fetchUserStats(userId: string) {
  const { data: attempts, error } = await supabase
    .from('user_quiz_attempts')
    .select('passed, score, total, points_earned, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !attempts) return null;

  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.passed).length;
  const totalPoints = attempts.reduce((sum, a) => sum + (a.points_earned ?? 0), 0);
  const passRate = totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0;

  // Calculate streak (consecutive days with a passed attempt)
  const streak = calculateStreak(attempts);

  return {
    questionsAnswered: totalAttempts,
    quizPassRate: passRate,
    currentStreak: streak,
    totalXP: totalPoints,
    aiRelianceDecrease: Math.min(passRate, 100),
    totalStudyTime: totalAttempts * 5, // estimate ~5 min per quiz
  };
}

function calculateStreak(attempts: { created_at: string; passed: boolean }[]): number {
  if (!attempts.length) return 0;
  const passedDays = new Set(
    attempts
      .filter(a => a.passed)
      .map(a => a.created_at.split('T')[0])
  );
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    if (passedDays.has(key)) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
}
