import { NextRequest, NextResponse } from 'next/server';
import { generatePaletteFromMood } from '@/lib/palette-utils';

export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        const { mood } = await request.json() as { mood?: string };

        if (!mood || typeof mood !== 'string') {
            return NextResponse.json({ error: 'Mood/keyword is required' }, { status: 400 });
        }

        // TODO: Use Azure OpenAI when configured
        // For now, use the fallback algorithmic generation
        const colors = generatePaletteFromMood(mood.trim());

        return NextResponse.json({
            name: `${mood.trim()} Palette`,
            colors,
            mood: mood.trim(),
            source: 'ai',
        });
    } catch (error) {
        console.error('Generate palette error:', error);
        return NextResponse.json({ error: 'Failed to generate palette' }, { status: 500 });
    }
}
