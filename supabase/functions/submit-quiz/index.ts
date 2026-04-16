// =====================================================
// Supabase Edge Function: /submit-quiz
// Quiz Submission + Chat Access Unlocking
// =====================================================
// Deploy with: supabase functions deploy submit-quiz

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PASS_THRESHOLD = parseInt(Deno.env.get("PASS_THRESHOLD") ?? "70");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Validate JWT ───────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return errorResponse(401, "Missing Authorization header");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return errorResponse(401, "Invalid or expired token");
    }

    const userId = user.id;

    // ── 2. Parse request body ─────────────────────────────────
    const { topic, userAnswers, questions, isRetry } = await req.json();

    if (!topic || !userAnswers || !questions) {
      return errorResponse(400, "Missing required fields: topic, userAnswers, questions");
    }

    if (!Array.isArray(userAnswers) || !Array.isArray(questions)) {
      return errorResponse(400, "userAnswers and questions must be arrays");
    }

    if (userAnswers.length !== questions.length) {
      return errorResponse(400, "Mismatch between answers and questions count");
    }

    // ── 3. Calculate score server-side ────────────────────────
    let correct = 0;
    for (let i = 0; i < questions.length; i++) {
      if (userAnswers[i] === questions[i].correctAnswer) {
        correct++;
      }
    }

    const total = questions.length;
    const scorePercent = Math.round((correct / total) * 100);
    const passed = scorePercent >= PASS_THRESHOLD;
    const pointsEarned = passed ? (isRetry ? 30 : 50) : 0;

    // ── 4. Store attempt ──────────────────────────────────────
    const { error: insertError } = await supabase
      .from("user_quiz_attempts")
      .insert({
        user_id: userId,
        topic,
        score: correct,
        total,
        passed,
        points_earned: pointsEarned,
        is_retry: isRetry ?? false,
      });

    if (insertError) {
      console.error("Failed to insert attempt:", insertError);
      return errorResponse(500, "Failed to record quiz attempt");
    }

    // ── 5. If passed → unlock chat access for this topic ─────
    if (passed) {
      const { error: upsertError } = await supabase
        .from("chat_access")
        .upsert({
          user_id: userId,
          topic,
          unlocked: true,
          updated_at: new Date().toISOString(),
        });

      if (upsertError) {
        console.error("Failed to unlock chat access:", upsertError);
        // Non-fatal: still return success, client can retry
      }
    }

    // ── 6. Return result ──────────────────────────────────────
    return new Response(
      JSON.stringify({
        passed,
        score: correct,
        total,
        scorePercent,
        pointsEarned,
        passThreshold: PASS_THRESHOLD,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (err) {
    console.error("Unexpected error:", err);
    return errorResponse(500, "Internal server error");
  }
});

function errorResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
