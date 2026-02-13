import { NextResponse } from 'next/server';
import { hexToHsl, hslToHex, getColorName } from '@/lib/palette-utils';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('image');

        if (!file) {
            return NextResponse.json({ error: 'Image file is required' }, { status: 400 });
        }

        // TODO: Use Azure Computer Vision when configured
        // For now, extract colors using canvas-based approach or generate from image hash

        // Read the file buffer and generate a palette based on byte data
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Use some bytes from the image to seed color generation
        const colors = extractColorsFromBuffer(buffer);

        return NextResponse.json({
            name: 'Extracted Palette',
            colors,
            source: 'image',
        });
    } catch (error) {
        console.error('Extract palette error:', error);
        return NextResponse.json({ error: 'Failed to extract colors' }, { status: 500 });
    }
}

function extractColorsFromBuffer(buffer) {
    // Use sample bytes from the image to generate varied colors
    const colors = [];
    const step = Math.max(1, Math.floor(buffer.length / 6));

    for (let i = 0; i < 5; i++) {
        const offset = (i * step) % (buffer.length - 3);
        const r = buffer[offset] || 128;
        const g = buffer[offset + 1] || 128;
        const b = buffer[offset + 2] || 128;

        // Convert to HSL and adjust for more pleasing colors
        const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
        const hsl = hexToHsl(hex);

        if (hsl) {
            // Ensure colors are vibrant enough
            const adjustedHex = hslToHex(
                hsl.h,
                Math.max(30, Math.min(85, hsl.s)),
                Math.max(25, Math.min(75, hsl.l))
            );
            colors.push({
                hex: adjustedHex,
                name: getColorName(adjustedHex),
            });
        } else {
            colors.push({ hex, name: getColorName(hex) });
        }
    }

    return colors;
}
