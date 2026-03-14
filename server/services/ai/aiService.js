// AI Service: Budget Recommendation + Smart Matching
// Uses Gemini if API key is set, otherwise falls back to rule-based engine

const OpenAI = require("openai");

let groq = null;

if (process.env.GROQ_API_KEY) {
  groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
  });

  console.log("🤖 Groq AI initialized");
}


/**
 * Safely extract JSON from Gemini responses
 */
function extractJson(text) {
  try {
    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    return JSON.parse(cleaned);
  } catch (err) {
    console.warn("⚠️ Failed to parse AI JSON:", err.message);
    return null;
  }
}


/**
 * Parse a natural language budget query.
 */
function parseQuery(query) {
  const lowerQ = query.toLowerCase();

  const budgetMatch = query.match(/[₹\$]?\s*(\d[\d,]*)/);
  const budget = budgetMatch
    ? parseInt(budgetMatch[1].replace(/,/g, ""))
    : 2000;

  const occasions = {
    birthday: ["birthday", "bday", "party"],
    office: ["office", "work", "professional", "corporate", "formal"],
    college: ["college", "campus", "casual", "university"],
    date: ["date", "romantic", "evening", "dinner"],
    gym: ["gym", "workout", "fitness", "sport"],
    wedding: ["wedding", "marriage", "formal"],
    travel: ["travel", "trip", "vacation", "trek"],
  };

  let occasion = "general";

  for (const [key, keywords] of Object.entries(occasions)) {
    if (keywords.some((k) => lowerQ.includes(k))) {
      occasion = key;
      break;
    }
  }

  const categoryHints = {
    Electronics: ["laptop", "phone", "gadget", "tech", "setup"],
    Fashion: ["outfit", "wear", "clothes", "shirt", "pants", "shoes"],
    "Sports & Fitness": ["gym", "workout", "fitness"],
    "Home & Kitchen": ["home", "kitchen", "cook"],
  };

  let preferredCategory = null;

  for (const [cat, keywords] of Object.entries(categoryHints)) {
    if (keywords.some((k) => lowerQ.includes(k))) {
      preferredCategory = cat;
      break;
    }
  }

  return { occasion, budget, preferredCategory, rawQuery: query };
}


/**
 * Rule-based bundle optimizer
 */
function selectBundle(products, { budget, preferredCategory }) {
  let pool = preferredCategory
    ? products.filter(
        (p) => p.category === preferredCategory || p.price <= budget * 0.6
      )
    : products;

  pool = pool
    .filter((p) => p.price > 0 && p.price <= budget)
    .sort((a, b) => b.purchaseCount - a.purchaseCount);

  if (pool.length === 0) {
    pool = products
      .filter((p) => p.price <= budget)
      .sort((a, b) => b.purchaseCount - a.purchaseCount);
  }

  const selected = [];
  let remaining = budget;

  for (const product of pool) {
    if (
      product.price <= remaining &&
      !selected.find((s) => s._id.toString() === product._id.toString())
    ) {
      selected.push(product);
      remaining -= product.price;

      if (selected.length >= 5) break;
    }
  }

  const total = selected.reduce((sum, p) => sum + p.price, 0);

  return {
    bundle: selected,
    total: parseFloat(total.toFixed(2)),
    remaining: parseFloat(remaining.toFixed(2)),
  };
}


/**
 * Gemini AI Recommendation
 */
async function getGroqRecommendation(query, products, parsed) {

  const productList = products.slice(0, 50).map(p =>
    `ID:${p._id}|Name:${p.name}|Price:${p.price}|Category:${p.category}`
  ).join("\n");

  const prompt = `
You are a smart shopping assistant.

User request: "${query}"
Budget: ${parsed.budget}
Occasion: ${parsed.occasion}

Available products:
${productList}

Return JSON:

{
 "bundle":[
   {"id":"productId","reason":"why selected"}
 ],
 "message":"short message"
}
`;

const completion = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [
    {
      role: "system",
      content: "You are an API. Always respond ONLY with valid JSON."
    },
    {
      role: "user",
      content: prompt
    }
  ],
  temperature: 0.2,
  response_format: { type: "json_object" }
});

const text = completion.choices[0].message.content
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

let aiResult;

try {
  aiResult = JSON.parse(text);
} catch (err) {
  console.log("AI returned non-JSON:", text);
  throw err;
}

  const bundle = aiResult.bundle.map(item => {
    const product = products.find(p => p._id.toString() === item.id);
    return product ? { ...product, reason: item.reason } : null;
  }).filter(Boolean);

  const total = bundle.reduce((sum, p) => sum + p.price, 0);

  return {
    occasion: parsed.occasion,
    budget: parsed.budget,
    bundle,
    total,
    remaining: parsed.budget - total,
    message: aiResult.message,
    source: "groq"
  };
}

/**
 * Main AI entry point
 */
async function getBudgetRecommendation(query, products) {

  const parsed = parseQuery(query);

  if (groq) {
    try {
      return await getGroqRecommendation(query, products, parsed);
    } catch (err) {
      console.warn("Groq failed, falling back to rule-based:", err.message);
    }
  }

  const { bundle, total, remaining } = selectBundle(products, parsed);

  return {
    occasion: parsed.occasion,
    budget: parsed.budget,
    bundle,
    total,
    remaining,
    message: `Smart picks within your ₹${parsed.budget} budget`,
    source: "rule-based"
  };
}

module.exports = { getBudgetRecommendation, parseQuery };