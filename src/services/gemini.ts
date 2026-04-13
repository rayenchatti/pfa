import { StudyData } from '../utils/mockData';

// Replace with your actual Gemini API Key from Google AI Studio
export const GEMINI_API_KEY = "AIzaSyBpkOxakLWJ5BPii_stdkVuT5cgot1oZdY";

export async function generateStudyData(prompt: string, apiKey: string = GEMINI_API_KEY): Promise<StudyData> {
    if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        throw new Error("Missing Gemini API Key. Please update GEMINI_API_KEY in src/services/gemini.ts");
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are VeritasLearn, an elite AI tutor. A user is asking you a question or giving a conceptual topic: "${prompt}".

You MUST respond strictly in the following JSON format matching this exact interface. Write raw JSON, no markdown blocks.

Interface:
{
  "topic": "Short title of the concept (e.g., Photosynthesis)",
  "answer": "A comprehensive, formal, academic explanation of the concept or direct answer to the question using Markdown formatting.",
  "humanized": "A fun, simple, 'explain-it-to-me-like-im-5' style friendly text with emojis.",
  "keyPoints": ["3 to 5 core bullet points extracting the most vital info"],
  "quiz": [
    {
      "id": "q1",
      "question": "A challenging multiple choice question relating to the core concept.",
      "options": ["Wrong", "Correct", "Wrong", "Wrong"],
      "correctAnswer": 1, // index of the correct string in options array
      "explanation": "Why this answer is correct",
      "timeLimit": 30
    } // Generate exactly 2-3 questions for the standard quiz
  ],
  "easyQuiz": [
    // Generate exactly 1-2 easier questions intended for someone who just failed the main quiz and needs simpler reinforcement. Use same object structure as quiz.
  ],
  "flashcards": [
    { "id": "fc1", "front": "Concept name", "back": "Definition" } // Generate exactly 3 flashcards
  ]
}`;

    const payload = {
        contents: [{
            role: "user",
            parts: [{ text: systemInstruction }]
        }],
        generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json",
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error:", errorText);
            throw new Error(`Gemini API returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        // Extract the valid JSON text from Gemini's response structure
        if (data.candidates && data.candidates[0].content && data.candidates[0].content.parts[0].text) {
            const jsonText = data.candidates[0].content.parts[0].text;
            const parsed: StudyData = JSON.parse(jsonText);
            
            // Ensure ID generation uniqueness via timestamp fallback if Gemini fails to use unique IDs
            parsed.quiz = parsed.quiz.map((q, i) => ({ ...q, id: q.id || `q_${Date.now()}_${i}` }));
            parsed.easyQuiz = parsed.easyQuiz.map((q, i) => ({ ...q, id: q.id || `eq_${Date.now()}_${i}` }));
            parsed.flashcards = parsed.flashcards.map((f, i) => ({ ...f, id: f.id || `fc_${Date.now()}_${i}` }));
            
            return parsed;
        } else {
            throw new Error("Unexpected response structure from Gemini API");
        }
    } catch (error) {
        console.error("Failed to fetch from Gemini:", error);
        throw error;
    }
}
