import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const PHOTO_ANALYSIS_PROMPT = `You are an AI assistant helping a nonprofit log physical donations accurately.

Analyze the photo and return ONLY a valid JSON object — no markdown, no explanation, just JSON.

{
  "category": "food | clothing | electronics | hygiene | furniture | medical | books | toys | other",
  "subcategory": "brief item description (e.g. 'canned vegetables', 'winter coats', 'laptops')",
  "estimatedQuantity": <number>,
  "unit": "items | boxes | bags | pounds | gallons | cases | pallets",
  "condition": "new | good | fair | poor",
  "estimatedValueUSD": <number — fair market value, not retail>,
  "confidence": "high | medium | low",
  "notes": "what you can see in the photo",
  "warnings": ["list any caveats like 'back rows not visible' or 'image partially blurry'"]
}

Guidelines:
- Be conservative with quantity (err low — a human will confirm)
- For pallets/stacks, note that back rows are hidden
- estimatedValueUSD = realistic fair market value (not retail price)
- If image is unclear, set confidence to "low" and explain in warnings`;
