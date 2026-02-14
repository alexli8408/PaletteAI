/**
 * PaletteAI — Color utility functions
 * Handles color conversions, harmony algorithms, and export generators.
 */

import type { Color, RGB, HSL } from '@/types';

// --- Color Conversions ---

export function hexToRgb(hex: string): RGB | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    } : null;
}

export function rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    }).join('');
}

export function hexToHsl(hex: string): HSL | null {
    const rgb = hexToRgb(hex);
    if (!rgb) return null;
    let { r, g, b } = rgb;
    r /= 255; g /= 255; b /= 255;

    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0;
    let s: number;
    const l = (max + min) / 2;

    if (max === min) {
        h = s = 0;
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
}

export function hslToHex(h: number, s: number, l: number): string {
    s /= 100; l /= 100;
    const a = s * Math.min(l, 1 - l);
    const f = (n: number): number => {
        const k = (n + h / 30) % 12;
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * Math.max(0, Math.min(1, color)));
    };
    return rgbToHex(f(0), f(8), f(4));
}

// --- Color Names ---

interface ColorNameEntry {
    name: string;
    range: [number, number];
}

const COLOR_NAMES: ColorNameEntry[] = [
    { name: 'Crimson Blaze', range: [0, 15] },
    { name: 'Sunset Orange', range: [15, 35] },
    { name: 'Golden Hour', range: [35, 55] },
    { name: 'Lime Zest', range: [55, 80] },
    { name: 'Emerald Dream', range: [80, 150] },
    { name: 'Teal Whisper', range: [150, 180] },
    { name: 'Ocean Depth', range: [180, 210] },
    { name: 'Cobalt Sky', range: [210, 240] },
    { name: 'Indigo Night', range: [240, 270] },
    { name: 'Royal Violet', range: [270, 300] },
    { name: 'Magenta Pulse', range: [300, 330] },
    { name: 'Rose Petal', range: [330, 360] },
];

const LIGHTNESS_MODIFIERS: ColorNameEntry[] = [
    { name: 'Deep', range: [0, 25] },
    { name: 'Rich', range: [25, 40] },
    { name: '', range: [40, 60] },
    { name: 'Soft', range: [60, 75] },
    { name: 'Pale', range: [75, 90] },
    { name: 'Whisper', range: [90, 100] },
];

export function getColorName(hex: string): string {
    const hsl = hexToHsl(hex);
    if (!hsl) return 'Unknown';

    if (hsl.s < 10) {
        if (hsl.l < 15) return 'Midnight Black';
        if (hsl.l < 30) return 'Charcoal';
        if (hsl.l < 50) return 'Slate Gray';
        if (hsl.l < 70) return 'Silver Mist';
        if (hsl.l < 85) return 'Cloud White';
        return 'Snow White';
    }

    const colorEntry = COLOR_NAMES.find(c => hsl.h >= c.range[0] && hsl.h < c.range[1]) || COLOR_NAMES[0];
    const lightnessEntry = LIGHTNESS_MODIFIERS.find(l => hsl.l >= l.range[0] && hsl.l < l.range[1]);
    const modifier = lightnessEntry?.name || '';

    return modifier ? `${modifier} ${colorEntry.name}` : colorEntry.name;
}

// --- Harmony Algorithms ---

export function generateComplementary(hex: string): string[] {
    const hsl = hexToHsl(hex);
    if (!hsl) return [];
    return [
        hex,
        hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l),
        hslToHex(hsl.h, Math.max(20, hsl.s - 20), Math.min(85, hsl.l + 15)),
        hslToHex((hsl.h + 180) % 360, Math.max(20, hsl.s - 20), Math.min(85, hsl.l + 15)),
        hslToHex(hsl.h, Math.max(10, hsl.s - 40), Math.min(90, hsl.l + 30)),
    ];
}

export function generateAnalogous(hex: string): string[] {
    const hsl = hexToHsl(hex);
    if (!hsl) return [];
    return [
        hslToHex((hsl.h - 30 + 360) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h - 15 + 360) % 360, hsl.s, hsl.l),
        hex,
        hslToHex((hsl.h + 15) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l),
    ];
}

export function generateTriadic(hex: string): string[] {
    const hsl = hexToHsl(hex);
    if (!hsl) return [];
    return [
        hex,
        hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 240) % 360, hsl.s, hsl.l),
        hslToHex(hsl.h, Math.max(20, hsl.s - 30), Math.min(85, hsl.l + 20)),
        hslToHex((hsl.h + 120) % 360, Math.max(20, hsl.s - 30), Math.min(85, hsl.l + 20)),
    ];
}

export function generateSplitComplementary(hex: string): string[] {
    const hsl = hexToHsl(hex);
    if (!hsl) return [];
    return [
        hex,
        hslToHex((hsl.h + 150) % 360, hsl.s, hsl.l),
        hslToHex((hsl.h + 210) % 360, hsl.s, hsl.l),
        hslToHex(hsl.h, Math.max(15, hsl.s - 25), Math.min(90, hsl.l + 20)),
        hslToHex((hsl.h + 180) % 360, Math.max(15, hsl.s - 40), Math.min(92, hsl.l + 30)),
    ];
}

// --- Mood-based Palette Generation (fallback for when Azure is not configured) ---

const MOOD_PALETTES: Record<string, () => string[]> = {
    // Moods
    warm: () => generateFromHue(25, 70, 55),
    cool: () => generateFromHue(210, 60, 50),
    vibrant: () => generateFromHue(320, 85, 55),
    pastel: () => generateFromHue(280, 45, 80),
    dark: () => generateFromHue(240, 50, 25),
    earthy: () => generateFromHue(30, 40, 40),
    ocean: () => generateFromHue(200, 65, 50),
    sunset: () => generateFromHue(20, 80, 55),
    forest: () => generateFromHue(120, 55, 40),
    candy: () => generateFromHue(330, 70, 70),
    midnight: () => generateFromHue(235, 60, 20),
    autumn: () => generateFromHue(25, 65, 45),
    spring: () => generateFromHue(110, 60, 65),
    winter: () => generateFromHue(210, 30, 75),
    neon: () => generateFromHue(300, 100, 55),
    retro: () => generateFromHue(40, 55, 50),
    luxury: () => generateFromHue(42, 45, 30),
    minimal: () => generateFromHue(220, 10, 60),
    romantic: () => generateFromHue(340, 55, 65),
    tropical: () => generateFromHue(160, 75, 55),
    // Color names
    red: () => generateFromHue(0, 75, 50),
    orange: () => generateFromHue(25, 80, 55),
    yellow: () => generateFromHue(50, 80, 55),
    green: () => generateFromHue(120, 65, 45),
    teal: () => generateFromHue(175, 60, 45),
    blue: () => generateFromHue(220, 70, 50),
    indigo: () => generateFromHue(250, 65, 40),
    purple: () => generateFromHue(280, 65, 50),
    pink: () => generateFromHue(330, 70, 65),
    brown: () => generateFromHue(25, 50, 35),
    black: () => generateFromHue(0, 5, 15),
    white: () => generateFromHue(0, 5, 85),
    gray: () => generateFromHue(0, 5, 50),
    grey: () => generateFromHue(0, 5, 50),
    gold: () => generateFromHue(45, 75, 50),
    silver: () => generateFromHue(210, 10, 70),
    coral: () => generateFromHue(15, 75, 60),
    lavender: () => generateFromHue(270, 50, 70),
    magenta: () => generateFromHue(310, 80, 50),
    cyan: () => generateFromHue(185, 75, 50),
    maroon: () => generateFromHue(0, 65, 30),
    navy: () => generateFromHue(230, 70, 25),
};

function generateFromHue(baseHue: number, baseSat: number, baseLit: number): string[] {
    const colors: string[] = [];
    const offsets = [-20, -8, 0, 12, 25];
    const satOffsets = [5, -5, 0, -10, -20];
    const litOffsets = [-15, -5, 0, 10, 25];

    for (let i = 0; i < 5; i++) {
        const h = (baseHue + offsets[i] + 360) % 360;
        const s = Math.max(5, Math.min(100, baseSat + satOffsets[i]));
        const l = Math.max(10, Math.min(92, baseLit + litOffsets[i]));
        colors.push(hslToHex(h, s, l));
    }
    return colors;
}

export function generatePaletteFromMood(mood: string): Color[] {
    const key = mood.toLowerCase().trim();

    // Check for direct match
    if (MOOD_PALETTES[key]) {
        const hexColors = MOOD_PALETTES[key]();
        return hexColors.map(hex => ({ hex, name: getColorName(hex) }));
    }

    // Check for partial match
    const partialMatch = Object.keys(MOOD_PALETTES).find(k => key.includes(k) || k.includes(key));
    if (partialMatch) {
        const hexColors = MOOD_PALETTES[partialMatch]();
        return hexColors.map(hex => ({ hex, name: getColorName(hex) }));
    }

    // Hash the mood string to get a deterministic-ish but varied hue
    let hash = 0;
    for (let i = 0; i < key.length; i++) {
        hash = key.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    const sat = 50 + (Math.abs(hash >> 8) % 40);
    const lit = 40 + (Math.abs(hash >> 16) % 30);

    const hexColors = generateFromHue(hue, sat, lit);
    return hexColors.map(hex => ({ hex, name: getColorName(hex) }));
}

// --- Contrast & Accessibility ---

export function getLuminance(hex: string): number {
    const rgb = hexToRgb(hex);
    if (!rgb) return 0;
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(v => {
        v /= 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function getContrastRatio(hex1: string, hex2: string): number {
    const l1 = getLuminance(hex1);
    const l2 = getLuminance(hex2);
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
}

export function getTextColor(bgHex: string): string {
    const luminance = getLuminance(bgHex);
    return luminance > 0.4 ? '#1a1a2e' : '#f0f0f5';
}

// --- Export Generators ---

export function exportAsCSS(colors: Color[], name: string = 'palette'): string {
    const vars = colors.map((c, i) => `  --${name}-${i + 1}: ${c.hex};`).join('\n');
    return `:root {\n${vars}\n}`;
}

export function exportAsJSON(colors: Color[], name: string = 'palette'): string {
    return JSON.stringify({
        name,
        colors: colors.map(c => ({
            hex: c.hex,
            name: c.name,
            rgb: hexToRgb(c.hex),
            hsl: hexToHsl(c.hex),
        })),
    }, null, 2);
}

export function exportAsSVG(colors: Color[]): string {
    const width = 500;
    const swatchWidth = width / colors.length;
    const height = 200;

    const rects = colors.map((c, i) =>
        `  <rect x="${i * swatchWidth}" y="0" width="${swatchWidth}" height="${height}" fill="${c.hex}" />`
    ).join('\n');

    const labels = colors.map((c, i) => {
        const textColor = getTextColor(c.hex);
        const x = i * swatchWidth + swatchWidth / 2;
        return `  <text x="${x}" y="${height - 15}" text-anchor="middle" fill="${textColor}" font-family="Inter, sans-serif" font-size="12">${c.hex}</text>`;
    }).join('\n');

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">\n${rects}\n${labels}\n</svg>`;
}

// --- Random Palette Generation ---

export function generateRandomPalette(): Color[] {
    const baseHue = Math.random() * 360;
    const baseSat = 50 + Math.random() * 40;
    const baseLit = 40 + Math.random() * 25;
    const hexColors = generateFromHue(baseHue, baseSat, baseLit);
    return hexColors.map(hex => ({ hex, name: getColorName(hex) }));
}
