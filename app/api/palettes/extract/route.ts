import { NextRequest, NextResponse } from 'next/server';
import { getColorName } from '@/lib/palette-utils';
import type { Color } from '@/types';

const AZURE_OPENAI_ENDPOINT = process.env.AZURE_OPENAI_ENDPOINT;
const AZURE_OPENAI_KEY = process.env.AZURE_OPENAI_KEY;
const AZURE_OPENAI_DEPLOYMENT = process.env.AZURE_OPENAI_DEPLOYMENT;

async function extractWithVisionAI(buffer: Buffer, mimeType: string): Promise<Color[] | null> {
    if (!AZURE_OPENAI_ENDPOINT || !AZURE_OPENAI_KEY || !AZURE_OPENAI_DEPLOYMENT) {
        console.log('Azure OpenAI not configured for vision extraction');
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

        const base64Image = buffer.toString('base64');
        const dataUrl = `data:${mimeType};base64,${base64Image}`;

        const response = await client.chat.completions.create({
            model: AZURE_OPENAI_DEPLOYMENT,
            messages: [
                {
                    role: 'system',
                    content: `You are an expert color analyst. Given an image, extract the 5 most visually dominant and representative colors from the image as hex codes.

Rules:
- Return ONLY a valid JSON array of exactly 5 hex color strings
- Extract ACTUAL colors visible in the image — sample from the most prominent areas
- Order from most dominant to least dominant
- Include both foreground and background colors if they are prominent
- Vary the selection: don't pick 5 near-identical shades if the image has variety
- Each hex must start with # and have exactly 6 hex digits
- No explanation, no markdown, no code blocks — just the raw JSON array

Example output: ["#2C4A3E","#8B6914","#D4A853","#F0E4C8","#1A1A1A"]`
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Extract the 5 most dominant colors from this image as hex codes.',
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: dataUrl,
                                detail: 'low',
                            },
                        },
                    ],
                },
            ],
            temperature: 0.2,
            max_tokens: 100,
        });

        let content = response.choices[0]?.message?.content?.trim();
        if (!content) return null;

        // Strip markdown code fences if present
        content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

        const hexColors: string[] = JSON.parse(content);
        if (!Array.isArray(hexColors) || hexColors.length < 3) return null;

        const colors: Color[] = hexColors
            .filter(hex => /^#[0-9a-fA-F]{6}$/.test(hex))
            .map(hex => ({ hex: hex.toLowerCase(), name: getColorName(hex) }));

        return colors.length >= 3 ? colors.slice(0, 5) : null;
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Vision AI extraction error:', msg);
        return null;
    }
}

function generateDefaultPalette(): Color[] {
    const defaults = ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981'];
    return defaults.map(hex => ({ hex, name: getColorName(hex) }));
}

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const formData = await request.formData();
        const file = formData.get('image') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const mimeType = file.type || 'image/jpeg';

        // Use GPT-4o-mini vision to analyze the image
        const aiColors = await extractWithVisionAI(buffer, mimeType);
        const colors = aiColors || generateDefaultPalette();
        const source = aiColors ? 'image-ai' : 'image-fallback';

        return NextResponse.json({
            name: 'Extracted Palette',
            colors,
            source,
        });
    } catch (error) {
        console.error('Extract palette error:', error);
        return NextResponse.json({ error: 'Failed to extract colors' }, { status: 500 });
    }
}
