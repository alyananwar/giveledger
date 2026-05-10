import { NextRequest, NextResponse } from "next/server";
import { anthropic, PHOTO_ANALYSIS_PROMPT } from "@/lib/anthropic";

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, mimeType = "image/jpeg" } = await req.json();

    if (!imageBase64) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      // Demo mode — return mock analysis
      return NextResponse.json({
        analysis: {
          category: "food",
          subcategory: "canned goods",
          estimatedQuantity: 48,
          unit: "items",
          condition: "good",
          estimatedValueUSD: 72,
          confidence: "medium",
          notes:
            "Demo mode: boxes of canned vegetables visible on shelving unit",
          warnings: ["DEMO MODE — connect ANTHROPIC_API_KEY for real analysis"],
        },
      });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: PHOTO_ANALYSIS_PROMPT,
            },
          ],
        },
      ],
    });

    const rawText =
      response.content[0].type === "text" ? response.content[0].text : "";

    // Strip markdown code fences if present
    const jsonStr = rawText
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();
    const analysis = JSON.parse(jsonStr);

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Photo analysis error:", err);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
