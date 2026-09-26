import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { imageBase64, mimeType, customApiKey } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image data is required for OCR scanning' }, { status: 400 });
    }

    const apiKey = customApiKey || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'No Gemini API key found. An API key is only needed for the Photo OCR scanner. You can enter one in the OCR scanner or type ingredients directly.' },
        { status: 400 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    let cleanBase64 = imageBase64;
    let detectedMimeType = mimeType || 'image/jpeg';

    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      const prefix = parts[0];
      cleanBase64 = parts[1] || '';
      if (prefix.includes(':')) {
        detectedMimeType = prefix.split(':')[1];
      }
    }
    cleanBase64 = cleanBase64.replace(/\s/g, '');

    // Stage 1: Fast, pure OCR extraction of ingredients and product name
    const ocrPrompt = `You are a high-speed OCR tool for food packages and ingredient labels.
Extract the product name (if visible) and all ingredients listed on the food package.
Ensure all enzymes (especially lactase enzyme, tilactase), dairy components, additives, and spices are accurately captured.
Respond ONLY with a JSON object in this exact schema:
{
  "productName": "Brand or product name, or empty string if not visible",
  "ingredients": ["ingredient 1", "ingredient 2"]
}
If no food label or ingredient list is legible, respond with:
{
  "productName": "",
  "ingredients": []
}`;

    const contents = [
      {
        role: 'user',
        parts: [
          { text: ocrPrompt },
          {
            inlineData: {
              data: cleanBase64,
              mimeType: detectedMimeType,
            },
          },
        ],
      },
    ];

    // Priority: gemini-3.1-flash-lite (fastest, lightweight), fallback to gemini-3.8-flash, gemini-flash-latest, and gemini-2.5-flash
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest', 'gemini-2.5-flash'];
    let response: any = null;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        response = await withTimeout(
          ai.models.generateContent({
            model,
            contents,
            config: {
              responseMimeType: 'application/json',
            },
          }),
          6500,
          `Model ${model} timed out after 6.5s`
        );
        if (response?.text) {
          break;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} encountered error or high demand, trying next fallback:`, err?.message || err);
      }
    }

    if (!response?.text) {
      throw lastError || new Error('Vision AI failed to read image label.');
    }

    const responseText = response.text || '';
    let parsed: any = null;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          parsed = JSON.parse(jsonMatch[0]);
        } catch {
          // fallback
        }
      }
    }

    if (!parsed || !Array.isArray(parsed.ingredients)) {
      parsed = {
        productName: parsed?.productName || '',
        ingredients: [],
      };
    }

    return NextResponse.json({
      productName: parsed.productName || '',
      ingredients: parsed.ingredients || [],
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Gemini OCR error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to analyze label image with Gemini' },
      { status: 500 }
    );
  }
}
