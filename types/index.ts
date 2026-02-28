// ============================================
// PaletteAI — Shared Type Definitions
// ============================================

/** A single color in a palette */
export interface Color {
    hex: string;
    name: string;
}

/** Palette document shape from MongoDB */
export interface Palette {
    _id?: string;
    name: string;
    colors: Color[];
    mood?: string;
    source: 'ai' | 'image' | 'manual' | 'fallback' | 'image-ai' | 'image-fallback';
    tags: string[];
    createdAt?: string;
    updatedAt?: string;
}

/** RGB color representation */
export interface RGB {
    r: number;
    g: number;
    b: number;
}

/** HSL color representation */
export interface HSL {
    h: number;
    s: number;
    l: number;
}

/** Export format types */
export type ExportFormat = 'css' | 'json' | 'svg';

/** Component prop types */
export interface ColorSwatchProps {
    hex: string;
    name?: string;
    size?: 'small' | 'medium' | 'large';
}

export interface PaletteCardProps {
    palette: Palette;
}

export interface ImageDropzoneProps {
    onImageUpload: (file: File) => void;
    isLoading?: boolean;
}

export interface ExportModalProps {
    palette: { colors: Color[]; name: string };
    onClose: () => void;
}
