require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const Anthropic = require("@anthropic-ai/sdk");

// --- Anthropic client ---
const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// --- Reusable Claude helper with Retry Logic ---
async function callClaude(prompt, systemPrompt = "", maxRetries = 3) {
  const params = {
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  };
  
  if (systemPrompt) {
    params.system = systemPrompt;
  }

  let attempt = 0;
  while (attempt <= maxRetries) {
    try {
      console.log(`MODEL USED: ${params.model} (Attempt ${attempt + 1})`);
      const message = await client.messages.create(params);
      return message.content[0].text;
    } catch (err) {
      const isRetryable = err.status === 529 || err.status === 429 || (err.error && err.error.type === 'overloaded_error');
      
      if (isRetryable && attempt < maxRetries) {
        attempt++;
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Anthropic API overloaded. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
}

// --- Express setup ---
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from the React build directory
const frontendPath = path.join(__dirname, "../frontend/dist");
console.log(`Serving static files from: ${frontendPath}`);
app.use(express.static(frontendPath));

// --- Level descriptions ---
const LEVEL_DESCRIPTIONS = {
  beginner: "a complete beginner with no prior knowledge. Use very simple language, everyday analogies, and avoid jargon. Explain every term you use.",
  intermediate: "someone with basic knowledge who understands foundational concepts. Use some technical terms but always briefly explain them. Include practical examples.",
  advanced: "an advanced learner who is comfortable with technical depth. Use precise terminology, dive into nuances, edge cases, and deeper theory.",
  expert: "an expert or professional. Be highly technical, reference advanced theory, industry practices, and assume deep familiarity with related concepts.",
};

// --- Routes ---
app.post("/api/study", async (req, res) => {
  const { topic, level, mode } = req.body;

  if (!topic || !topic.trim()) {
    return res.status(400).json({ error: "Topic is required." });
  }

  const levelDesc = LEVEL_DESCRIPTIONS[level] || LEVEL_DESCRIPTIONS.beginner;

  const modePrompts = {
    explain: `Explain the topic "${topic}" clearly and thoroughly. Tailor your explanation for ${levelDesc}`,
    quiz: `Create a short quiz (4-5 questions) about "${topic}" for ${levelDesc} Include the answers at the end.`,
    summarize: `Give a concise, well-structured summary of "${topic}" for ${levelDesc} Use bullet points where appropriate.`,
    examples: `Provide 3-4 practical, real-world examples that illustrate "${topic}" for ${levelDesc} Make each example memorable and easy to connect with.`,
  };

  const systemPrompt =
    `You are an adaptive AI study buddy. Your goal is to help the user genuinely understand topics. ` +
    `Be encouraging, clear, and always match your language complexity to the user's level. ` +
    `Format your response using markdown — use headings, bullet points, bold for key terms, and code blocks if relevant. ` +
    `Always end with one thought-provoking question to deepen understanding.`;

  const userPrompt = modePrompts[mode] || modePrompts.explain;

  try {
    const responseText = await callClaude(userPrompt, systemPrompt);
    res.json({ response: responseText });
  } catch (err) {
    console.error("Anthropic API error:", err);
    res.status(500).json({ error: "Failed to get AI response. Check your API key and try again." });
  }
});

// Catch-all route to serve index.html
app.get("*", (req, res) => {
  const indexPath = path.join(frontendPath, "index.html");
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(500).send("Please build the frontend first (npm run build in frontend folder).");
    }
  });
});

app.listen(PORT, () => {
  console.log(`Study Buddy running at http://localhost:${PORT}`);
});
