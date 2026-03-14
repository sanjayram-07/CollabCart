// AI Service: Budget Recommendation + Smart Matching
// Uses OpenAI if API key is set, otherwise falls back to rule-based engine

let openai = null;
try {
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
    const { OpenAI } = require('openai');
    openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
} catch (e) {
  console.log('OpenAI not available, using rule-based fallback');
}

/**
 * Parse a natural language budget query.
 * Returns { occasion, budget, category, keywords }
 */
function parseQuery(query) {
  const lowerQ = query.toLowerCase();

  // Extract budget (₹, Rs., INR, numbers)
  const budgetMatch = query.match(/[₹\$]?\s*(\d[\d,]*)/);
  const budget = budgetMatch ? parseInt(budgetMatch[1].replace(/,/g, '')) : 2000;

  // Detect occasion
  const occasions = {
    birthday: ['birthday', 'bday', 'party'],
    office: ['office', 'work', 'professional', 'corporate', 'formal'],
    college: ['college', 'campus', 'casual', 'university'],
    date: ['date', 'romantic', 'evening', 'dinner'],
    gym: ['gym', 'workout', 'fitness', 'sport'],
    wedding: ['wedding', 'marriage', 'formal'],
    travel: ['travel', 'trip', 'vacation', 'trek'],
  };

  let occasion = 'general';
  for (const [key, keywords] of Object.entries(occasions)) {
    if (keywords.some(k => lowerQ.includes(k))) { occasion = key; break; }
  }

  // Detect category hint
  const categoryHints = {
    Electronics: ['laptop', 'phone', 'gadget', 'tech', 'office setup', 'setup'],
    Fashion: ['outfit', 'wear', 'clothes', 'dress', 'shirt', 'pants', 'shoes', 'fashion'],
    'Sports & Fitness': ['gym', 'workout', 'fitness', 'sport', 'exercise'],
    'Home & Kitchen': ['home', 'kitchen', 'cook', 'house'],
  };

  let preferredCategory = null;
  for (const [cat, keywords] of Object.entries(categoryHints)) {
    if (keywords.some(k => lowerQ.includes(k))) { preferredCategory = cat; break; }
  }

  return { occasion, budget, preferredCategory, rawQuery: query };
}

/**
 * Rule-based bundle optimizer.
 * Selects items that fit within budget and make logical sense together.
 */
function selectBundle(products, { budget, occasion, preferredCategory }) {
  // Filter by category preference if given
  let pool = preferredCategory
    ? products.filter(p => p.category === preferredCategory || p.price <= budget * 0.6)
    : products;

  // Sort by purchase count / popularity
  pool = pool.filter(p => p.price > 0 && p.price <= budget)
             .sort((a, b) => b.purchaseCount - a.purchaseCount);

  if (pool.length === 0) {
    pool = products.filter(p => p.price <= budget).sort((a, b) => b.purchaseCount - a.purchaseCount);
  }

  // Greedy knapsack
  const selected = [];
  let remaining = budget;

  for (const product of pool) {
    if (product.price <= remaining && !selected.find(s => s._id.toString() === product._id.toString())) {
      selected.push(product);
      remaining -= product.price;
      if (selected.length >= 5) break;
    }
  }

  // Try to fill remaining budget with cheaper items
  if (remaining > 50 && selected.length < 5) {
    const filler = pool.filter(p =>
      p.price <= remaining &&
      !selected.find(s => s._id.toString() === p._id.toString())
    ).slice(0, 5 - selected.length);
    selected.push(...filler);
    remaining -= filler.reduce((sum, p) => sum + p.price, 0);
  }

  const total = selected.reduce((sum, p) => sum + p.price, 0);
  return { bundle: selected, total: parseFloat(total.toFixed(2)), remaining: parseFloat(remaining.toFixed(2)) };
}

/**
 * Use OpenAI to generate a smarter recommendation.
 */
async function getOpenAIRecommendation(query, products, parsed) {
  const productList = products.slice(0, 80).map(p =>
    `ID:${p._id}|Name:${p.name}|Price:₹${p.price}|Category:${p.category}|Tags:${(p.tags || []).join(',')}`
  ).join('\n');

  const prompt = `You are a smart shopping assistant. Given the user's request and available products, suggest the best combination of items.

User Request: "${query}"
Parsed: Budget=₹${parsed.budget}, Occasion=${parsed.occasion}

Available Products:
${productList}

Rules:
1. Total must NOT exceed ₹${parsed.budget}
2. Select 2-5 items that logically go together for the occasion
3. Maximize value and relevance
4. Return ONLY valid JSON in this exact format:
{
  "occasion": "string",
  "budget": number,
  "bundle": [
    {"id": "productId", "name": "product name", "price": number, "reason": "why this item"}
  ],
  "total": number,
  "message": "friendly message about the bundle"
}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    max_tokens: 1000,
  });

  const aiResult = JSON.parse(response.choices[0].message.content);

  // Hydrate with full product data
  const bundle = aiResult.bundle.map(item => {
    const product = products.find(p => p._id.toString() === item.id);
    return product ? { ...product, reason: item.reason } : null;
  }).filter(Boolean);

  return {
    occasion: aiResult.occasion,
    budget: parsed.budget,
    bundle,
    total: bundle.reduce((sum, p) => sum + p.price, 0),
    remaining: parsed.budget - bundle.reduce((sum, p) => sum + p.price, 0),
    message: aiResult.message,
    source: 'openai',
  };
}

/**
 * Main entry point for budget recommendation.
 */
async function getBudgetRecommendation(query, products) {
  const parsed = parseQuery(query);

  if (openai) {
    try {
      return await getOpenAIRecommendation(query, products, parsed);
    } catch (err) {
      console.warn('OpenAI failed, falling back to rule-based:', err.message);
    }
  }

  // Rule-based fallback
  const { bundle, total, remaining } = selectBundle(products, parsed);

  const occasionMessages = {
    birthday: `Perfect birthday ${parsed.preferredCategory || 'bundle'} within your budget! 🎉`,
    office: `Professional office setup curated for you! 💼`,
    college: `Stylish college essentials under ₹${parsed.budget}! 🎓`,
    date: `A perfect date-night ready selection! 💫`,
    gym: `Get fit with this optimized gym kit! 💪`,
    general: `Smart picks within your ₹${parsed.budget} budget! 🛍️`,
  };

  return {
    occasion: parsed.occasion,
    budget: parsed.budget,
    bundle,
    total,
    remaining,
    message: occasionMessages[parsed.occasion] || occasionMessages.general,
    source: 'rule-based',
  };
}

module.exports = { getBudgetRecommendation, parseQuery };
