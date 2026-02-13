import { NextRequest, NextResponse } from 'next/server';
import { generatePaletteFromMood, getColorName } from '@/lib/palette-utils';
import type { Color } from '@/types';

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

async function generateWithAzureOpenAI(mood: string): Promise<Color[] | null> {
    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY || !AZURE_OPENAI_DEPLOYMENT) {
        return null;
    }

    try {
        const { AzureOpenAI } = await import('openai');

        const client = new AzureOpenAI({
            endpoint: AZURE_OPENAI_ENDPOINT,
            apiKey: AZURE_OPENAI_KEY,
            deployment: AZURE_OPENAI_DEPLOYMENT,
            apiVersion: '2024-08-01-preview',
        });

        const response = await client.chat.completions.create({
            model: AZURE_OPENAI_DEPLOYMENT,
            messages: [
                {
                    role: 'system',
                    content: `You are a color palette expert. When given a mood, feeling, or keyword, generate exactly 5 harmonized hex color codes that perfectly represent that concept.

Rules:
- Return ONLY a valid JSON array of 5 hex color strings
- Colors must be visually harmonious and pleasing
- Each hex must start with # and have 6 digits
- No explanation, no markdown, just the JSON array

Example response: ["#FF6B35","#F7C59F","#EFEFD0","#004E89","#1A659E"]`
                },
                {
                    role: 'user',
                    content: `Generate a beautiful 5-color palette for: "${mood}"`
                }
            ],
            temperature: 0.8,
            max_tokens: 100,
        });

        const content = response.choices[0]?.message?.content?.trim();
        if (!content) return null;

        // Parse the JSON array of hex colors
        const hexColors: string[] = JSON.parse(content);
        if (!Array.isArray(hexColors) || hexColors.length !== 5) return null;

        // Validate and map to Color objects
        const colors: Color[] = hexColors
            .filter(hex => /^#[0-9a-fA-F]{6}$/.test(hex))
            .map(hex => ({ hex: hex.toLowerCase(), name: getColorName(hex) }));

        return colors.length >= 3 ? colors : null;
    } catch (error) {
        console.error('Azure OpenAI error:', error);
        return null;
    }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { mood } = await request.json() as { mood?: string };

        if (!mood || typeof mood !== 'string') {
            return NextResponse.json({ error: 'Mood/keyword is required' }, { status: 400 });
        }

        const trimmedMood = mood.trim();

        // Try Azure OpenAI first, fall back to algorithmic generation
        const aiColors = await generateWithAzureOpenAI(trimmedMood);
        const colors = aiColors || generatePaletteFromMood(trimmedMood);
        const source = aiColors ? 'ai' : 'fallback';

        return NextResponse.json({
            name: `${trimmedMood} Palette`,
            colors,
            mood: trimmedMood,
            source,
        });
    } catch (error) {
        console.error('Generate palette error:', error);
        return NextResponse.json({ error: 'Failed to generate palette' }, { status: 500 });
    }
}
