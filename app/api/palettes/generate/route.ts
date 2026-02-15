import { NextRequest, NextResponse } from 'next/server';
import { generatePaletteFromMood, getColorName } from '@/lib/palette-utils';
import type { Color } from '@/types';

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

async function generateWithAzureOpenAI(mood: string): Promise<Color[] | null> {
    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY || !AZURE_OPENAI_DEPLOYMENT) {
        console.log('Azure OpenAI not configured — missing env vars');
        return null;
    }

    try {
        const { AzureOpenAI } = await import('openai');

        const client = new AzureOpenAI({
            endpoint: AZURE_OPENAI_ENDPOINT,
            apiKey: AZURE_OPENAI_KEY,
            deployment: AZURE_OPENAI_DEPLOYMENT,
            apiVersion: '2025-01-01-preview',
        });

        const response = await client.chat.completions.create({
            model: AZURE_OPENAI_DEPLOYMENT,
            messages: [
                {
                    role: 'system',
                    content: `You are a world-class color palette designer and color theory expert. Given a mood, feeling, theme, keyword, or NAME, generate exactly 5 harmonized hex color codes that perfectly evoke that concept.

IMPORTANT: If the input is a CHARACTER NAME (from anime, movies, games, comics, TV shows, books, etc.), think about that character's VISUAL IDENTITY:
- Their signature colors (hair, eyes, outfit, powers, aura)
- The color palette of their most iconic scenes
- The emotional tone associated with them
For example:
- "Ryomen Sukuna" = deep crimson reds, blood red, dark scarlet, fiery orange-red (his cursed energy, tattoos, and fire)
- "Satoru Gojo" = electric blue, ice white, deep violet, indigo (his Infinity, Six Eyes, blindfold)
- "Naruto" = bright orange, sunny yellow, black accents, blue
- "Darth Vader" = black, dark red, charcoal, crimson glow
- "Elsa" = icy blue, frost white, pale lavender, silver

Color guidelines for moods/themes:
- "sunset" = warm oranges, deep reds, golden yellows, soft pinks
- "ocean" / "sea" = deep blues, teals, aquas, seafoam greens
- "forest" = rich greens, earthy browns, mossy tones, olive
- "midnight" / "dark" = deep navy, dark purple, charcoal, muted blues
- "pastel" = soft, light, desaturated versions of any hue
- "neon" / "vibrant" = highly saturated, electric, bold colors
- "autumn" / "fall" = burnt orange, deep red, golden brown, amber
- "romantic" / "love" = roses, blush pink, deep red, mauve
- "winter" / "ice" = cool whites, light blues, silver, pale lavender
- "tropical" = bright green, turquoise, coral, hot pink, sunny yellow
- If the input is a COLOR NAME (e.g. "red", "blue"), generate 5 shades/tints/tones of that color from dark to light
- For brands, places, or objects, use their real-world associated colors
- For any other keyword, think about what real-world colors are associated with it

Rules:
- Return ONLY a valid JSON array of 5 hex color strings, nothing else
- Colors must be visually harmonious
- Include a mix of 2-3 dominant colors and 2-3 supporting/accent colors
- Vary lightness: include at least one darker and one lighter shade
- Each hex must start with # and have exactly 6 hex digits
- No explanation, no markdown, no code blocks — just the raw JSON array

Example: ["#FF6B35","#F7C59F","#EFEFD0","#004E89","#1A659E"]`
                },
                {
                    role: 'user',
                    content: `Generate a beautiful 5-color palette for: "${mood}"`
                }
            ],
            temperature: 0.4,
            max_tokens: 150,
        });

        let content = response.choices[0]?.message?.content?.trim();
        if (!content) return null;

        // Strip markdown code fences if present (e.g. ```json ... ```)
        content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

        // Parse the JSON array of hex colors
        const hexColors: string[] = JSON.parse(content);
        if (!Array.isArray(hexColors) || hexColors.length !== 5) return null;

        // Validate and map to Color objects
        const colors: Color[] = hexColors
            .filter(hex => /^#[0-9a-fA-F]{6}$/.test(hex))
            .map(hex => ({ hex: hex.toLowerCase(), name: getColorName(hex) }));

        return colors.length >= 3 ? colors : null;
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Azure OpenAI error:', msg);
        console.error('Full error:', error);
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
