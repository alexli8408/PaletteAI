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
    source: 'ai' | 'image' | 'manual';
    likes: number;
    likedBy?: string[];
    tags: string[];
    createdAt?: string;
    updatedAt?: string;
}

/** Query params for the GET /api/palettes route */
export interface PaletteQueryParams {
    sort?: 'recent' | 'trending' | 'name';
    limit?: number;
    page?: number;
    search?: string;
    mood?: string;
}

/** Response shape for paginated palette list */
export interface PaletteListResponse {
    palettes: Palette[];
    total: number;
    page: number;
    totalPages: number;
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
    onLike?: (id: string) => void;
    isLiked?: boolean;
}

export interface ImageDropzoneProps {
    onImageUpload: (file: File) => void;
    isLoading?: boolean;
}

export interface ExportModalProps {
    palette: { colors: Color[]; name: string };
    onClose: () => void;
}
