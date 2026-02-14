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

        // Pad to 5 colors by generating tint/shade variations of existing colors
        if (colors.length > 0 && colors.length < 5) {
            const baseColors = [...colors];
            let idx = 0;
            while (colors.length < 5) {
                const base = baseColors[idx % baseColors.length];
                const hsl = hexToHsl(base.hex);
                if (hsl) {
                    // Alternate between lighter and darker shades of existing palette colors
                    const direction = colors.length % 2 === 0 ? 1 : -1;
                    const shift = 12 + (colors.length * 5);
                    const newL = Math.max(15, Math.min(90, hsl.l + (direction * shift)));
                    const newS = Math.max(15, Math.min(95, hsl.s - 5));
                    const varied = hslToHex(hsl.h, newS, newL);
                    if (!uniqueHexes.has(varied)) {
                        uniqueHexes.add(varied);
                        colors.push({ hex: varied, name: getColorName(varied) });
                    }
                }
                idx++;
                if (idx > 20) break; // Safety valve
            }
        }

        return colors.length >= 3 ? colors.slice(0, 5) : null;
    } catch (error) {
        console.error('Azure Vision error:', error);
        return null;
    }
}

// Map CSS color names returned by Azure Vision to more accurate hex values
function cssColorToHex(name: string): string | null {
    const map: Record<string, string> = {
        black: '#1a1a1a', white: '#f5f5f5', red: '#dc2626', green: '#16a34a',
        blue: '#2563eb', yellow: '#eab308', orange: '#ea580c', purple: '#9333ea',
        pink: '#ec4899', brown: '#92400e', gray: '#6b7280', grey: '#6b7280',
        cyan: '#06b6d4', magenta: '#d946ef', teal: '#0d9488', navy: '#1e3a5f',
        maroon: '#7f1d1d', olive: '#4d7c0f', lime: '#65a30d', aqua: '#22d3ee',
        silver: '#9ca3af', coral: '#f97316', salmon: '#fb923c', gold: '#ca8a04',
        khaki: '#bef264', indigo: '#4f46e5', violet: '#8b5cf6', beige: '#d6d3d1',
        ivory: '#fafaf9', tan: '#a8a29e', sienna: '#b45309', crimson: '#be123c',
    };
    return map[name.toLowerCase()] || null;
}

// Fallback: extract average colors by sampling decoded pixel-like regions
// Note: This works on raw buffer data — results are approximate since we're sampling
// encoded bytes, not decoded pixels. It's a last resort when Azure Vision is unavailable.
function extractColorsFromBuffer(buffer: Buffer): Color[] {
    // Use a simple approach: sample evenly spaced groups of 3 bytes,
    // then cluster them into 5 representative colors
    const samples: { r: number; g: number; b: number }[] = [];
    const sampleCount = 200;
    const step = Math.max(3, Math.floor(buffer.length / sampleCount));

    // Skip initial bytes (likely file headers)
    const headerOffset = Math.min(100, Math.floor(buffer.length * 0.1));

    for (let i = headerOffset; i < buffer.length - 2 && samples.length < sampleCount; i += step) {
        samples.push({
            r: buffer[i],
            g: buffer[i + 1],
            b: buffer[i + 2],
        });
    }

    if (samples.length === 0) {
        // Return a safe default
        return generateDefaultPalette();
    }

    // Simple k-means-ish: divide samples into 5 buckets by sorting on hue
    const hslSamples = samples.map(s => {
        const r = s.r / 255, g = s.g / 255, b = s.b / 255;
        const max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h = 0;
        const l = (max + min) / 2;
        const d = max - min;
        const sat = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

        if (d !== 0) {
            switch (max) {
                case r: h = ((g - b) / d + (g < b ? 6 : 0)) * 60; break;
                case g: h = ((b - r) / d + 2) * 60; break;
                case b: h = ((r - g) / d + 4) * 60; break;
            }
        }

        return { h, s: sat * 100, l: l * 100 };
    });

    // Sort by hue and pick 5 evenly spaced
    hslSamples.sort((a, b) => a.h - b.h);
    const bucketSize = Math.floor(hslSamples.length / 5);
    const colors: Color[] = [];

    for (let i = 0; i < 5; i++) {
        const bucket = hslSamples.slice(i * bucketSize, (i + 1) * bucketSize);
        if (bucket.length === 0) continue;

        const avgH = bucket.reduce((sum, c) => sum + c.h, 0) / bucket.length;
        const avgS = bucket.reduce((sum, c) => sum + c.s, 0) / bucket.length;
        const avgL = bucket.reduce((sum, c) => sum + c.l, 0) / bucket.length;

        // Ensure the color is visually pleasant
        const finalS = Math.max(25, Math.min(85, avgS));
        const finalL = Math.max(20, Math.min(80, avgL));

        const hex = hslToHex(Math.round(avgH), Math.round(finalS), Math.round(finalL));
        colors.push({ hex, name: getColorName(hex) });
    }

    return colors.length >= 3 ? colors : generateDefaultPalette();
}

function generateDefaultPalette(): Color[] {
    // A balanced neutral palette as ultimate fallback
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
