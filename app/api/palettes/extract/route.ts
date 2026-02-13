import { NextRequest, NextResponse } from 'next/server';
import { hexToHsl, hslToHex, getColorName } from '@/lib/palette-utils';
import type { Color } from '@/types';

const AZURE_VISION_ENDPOINT = process.env.AZURE_VISION_ENDPOINT;
const AZURE_VISION_KEY = process.env.AZURE_VISION_KEY;

async function extractWithAzureVision(buffer: Buffer): Promise<Color[] | null> {
    if (!AZURE_VISION_ENDPOINT || !AZURE_VISION_KEY) {
        return null;
    }

    try {
        // Use the REST API directly for image analysis
        const url = `${AZURE_VISION_ENDPOINT.replace(/\/$/, '')}/computervision/imageanalysis:analyze?features=color&api-version=2024-02-01`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': AZURE_VISION_KEY,
                'Content-Type': 'application/octet-stream',
            },
            body: new Uint8Array(buffer),
        });

        if (!response.ok) {
            console.error('Azure Vision API error:', response.status, await response.text());
            return null;
        }

        const data = await response.json();
        const colorResult = data.color;

        if (!colorResult) return null;

        // Collect all colors: dominant + accent
        const allColorNames: string[] = [];

        if (colorResult.dominantColorForeground) {
            allColorNames.push(colorResult.dominantColorForeground);
        }
        if (colorResult.dominantColorBackground) {
            allColorNames.push(colorResult.dominantColorBackground);
        }
        if (colorResult.dominantColors) {
            allColorNames.push(...colorResult.dominantColors);
        }
        if (colorResult.accentColor) {
            allColorNames.push(`#${colorResult.accentColor}`);
        }

        // Convert CSS color names to hex, deduplicate
        const uniqueHexes = new Set<string>();
        const colors: Color[] = [];

        for (const colorStr of allColorNames) {
            const hex = colorStr.startsWith('#')
                ? colorStr.toLowerCase()
                : cssColorToHex(colorStr);

            if (hex && !uniqueHexes.has(hex)) {
                uniqueHexes.add(hex);
                colors.push({ hex, name: getColorName(hex) });
            }
        }

        // Pad to 5 colors if needed by generating variations
        while (colors.length < 5 && colors.length > 0) {
            const base = colors[colors.length - 1].hex;
            const hsl = hexToHsl(base);
            if (hsl) {
                const varied = hslToHex(
                    (hsl.h + 30 * colors.length) % 360,
                    Math.max(20, hsl.s - 10),
                    Math.min(85, hsl.l + 10)
                );
                if (!uniqueHexes.has(varied)) {
                    uniqueHexes.add(varied);
                    colors.push({ hex: varied, name: getColorName(varied) });
                } else {
                    break;
                }
            } else {
                break;
            }
        }

        return colors.length >= 3 ? colors.slice(0, 5) : null;
    } catch (error) {
        console.error('Azure Vision error:', error);
        return null;
    }
}

// Map common CSS color names returned by Azure Vision to hex
function cssColorToHex(name: string): string | null {
    const map: Record<string, string> = {
        black: '#000000', white: '#ffffff', red: '#ff0000', green: '#008000',
        blue: '#0000ff', yellow: '#ffff00', orange: '#ffa500', purple: '#800080',
        pink: '#ffc0cb', brown: '#a52a2a', gray: '#808080', grey: '#808080',
        cyan: '#00ffff', magenta: '#ff00ff', teal: '#008080', navy: '#000080',
        maroon: '#800000', olive: '#808000', lime: '#00ff00', aqua: '#00ffff',
        silver: '#c0c0c0', coral: '#ff7f50', salmon: '#fa8072', gold: '#ffd700',
        khaki: '#f0e68c', indigo: '#4b0082', violet: '#ee82ee', beige: '#f5f5dc',
        ivory: '#fffff0', tan: '#d2b48c', sienna: '#a0522d', crimson: '#dc143c',
    };
    return map[name.toLowerCase()] || null;
}

// Fallback: extract colors from raw image buffer bytes
function extractColorsFromBuffer(buffer: Buffer): Color[] {
    const colors: Color[] = [];
    const step = Math.max(1, Math.floor(buffer.length / 6));

    for (let i = 0; i < 5; i++) {
        const offset = (i * step) % (buffer.length - 3);
        const r = buffer[offset] || 128;
        const g = buffer[offset + 1] || 128;
        const b = buffer[offset + 2] || 128;

        const hex = '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
        const hsl = hexToHsl(hex);

        if (hsl) {
            const adjustedHex = hslToHex(
                hsl.h,
                Math.max(30, Math.min(85, hsl.s)),
                Math.max(25, Math.min(75, hsl.l))
            );
            colors.push({ hex: adjustedHex, name: getColorName(adjustedHex) });
        } else {
            colors.push({ hex, name: getColorName(hex) });
        }
    }

    return colors;
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

        // Try Azure Computer Vision first, fall back to buffer extraction
        const aiColors = await extractWithAzureVision(buffer);
        const colors = aiColors || extractColorsFromBuffer(buffer);
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
