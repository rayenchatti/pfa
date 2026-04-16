// =====================================================
// Supabase Edge Function: /generate
// Secure Gemini AI Gateway
// =====================================================
// Deploy with: supabase functions deploy generate

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Configurable via Supabase Secrets (supabase secrets set KEY=value)
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const PASS_THRESHOLD = parseInt(Deno.env.get("PASS_THRESHOLD") ?? "70");
const MAX_DAILY_REQUESTS = parseInt(Deno.env.get("MAX_DAILY_REQUESTS") ?? "20");

serve(async (req: Request) => {
  // Handle CORS preflight
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
    const { prompt, topic } = await req.json();
    if (!prompt || !topic) {
      return errorResponse(400, "Missing required fields: prompt, topic");
    }

    // ── 3. Check quiz access for this topic ───────────────────
    const { data: access } = await supabase
      .from("chat_access")
      .select("unlocked")
      .eq("user_id", userId)
      .eq("topic", topic)
      .single();

    if (!access?.unlocked) {
      return errorResponse(403, "Quiz not passed for this topic. Pass the quiz to unlock AI access.");
    }

    // ── 4. Check rate limit ───────────────────────────────────
    const today = new Date().toISOString().split("T")[0];
    const { data: rateLimit } = await supabase
      .from("user_rate_limits")
      .select("request_count")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    const currentCount = rateLimit?.request_count ?? 0;
    if (currentCount >= MAX_DAILY_REQUESTS) {
      return errorResponse(429, `Daily limit reached (${MAX_DAILY_REQUESTS} requests/day). Try again tomorrow.`);
    }

    // ── 5. Call Gemini ────────────────────────────────────────
    if (!GEMINI_API_KEY) {
      return errorResponse(500, "Server configuration error: missing Gemini API key");
    }

    const systemInstruction = buildPrompt(prompt);
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: systemInstruction }] }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return errorResponse(502, "AI service error. Please try again.");
    }

    const geminiData = await geminiRes.json();
    const jsonText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!jsonText) {
      return errorResponse(502, "Unexpected response from AI service");
    }

    // ── 6. Increment rate limit ───────────────────────────────
    await supabase.from("user_rate_limits").upsert({
      user_id: userId,
      date: today,
      request_count: currentCount + 1,
    });

    // ── 7. Return response ────────────────────────────────────
    const parsed = JSON.parse(jsonText);
    return new Response(JSON.stringify({ data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return errorResponse(500, "Internal server error");
  }
});

// ── Helpers ───────────────────────────────────────────────────

function errorResponse(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}

function buildPrompt(prompt: string): string {
  return `You are VeritasLearn, an elite AI tutor. The user has passed their comprehension quiz and is now asking: "${prompt}".

User must have passed the quiz before accessing this content. Focus on educational, clear explanations.

You MUST respond strictly in the following JSON format. Write raw JSON, no markdown blocks.

{
  "topic": "Short title of the concept",
  "answer": "A comprehensive, formal, academic explanation using Markdown formatting.",
  "humanized": "A fun, simple, explain-it-like-im-5 style with emojis.",
  "keyPoints": ["3 to 5 core bullet points"],
  "quiz": [
    {
      "id": "q1",
      "question": "A challenging multiple choice question.",
      "options": ["Wrong", "Correct", "Wrong", "Wrong"],
      "correctAnswer": 1,
      "explanation": "Why this answer is correct",
      "timeLimit": 30
    }
  ],
  "easyQuiz": [
    {
      "id": "eq1",
      "question": "An easier question for reinforcement.",
      "options": ["Correct", "Wrong"],
      "correctAnswer": 0,
      "explanation": "Explanation",
      "timeLimit": 30
    }
  ],
  "flashcards": [
    { "id": "fc1", "front": "Concept name", "back": "Definition" }
  ]
}

Generate exactly 2-3 quiz questions, 1-2 easyQuiz questions, and 3 flashcards.`;
}
