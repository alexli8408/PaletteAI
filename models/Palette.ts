import mongoose, { type Document, type Model } from 'mongoose';

export interface IColor {
    hex: string;
    name: string;
}

export interface IPalette extends Document {
    name: string;
    colors: IColor[];
    mood?: string;
    source: 'ai' | 'image' | 'manual' | 'fallback' | 'image-ai' | 'image-fallback';
    tags: string[];
    userId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ColorSchema = new mongoose.Schema<IColor>({
    hex: {
        type: String,
        required: true,
        match: /^#[0-9a-fA-F]{6}$/,
    },
    name: {
        type: String,
        required: true,
    },
});

const PaletteSchema = new mongoose.Schema<IPalette>({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
    },
    colors: {
        type: [ColorSchema],
        required: true,
        validate: {
            validator: (v: IColor[]) => v.length >= 2 && v.length <= 10,
            message: 'A palette must have between 2 and 10 colors.',
        },
    },
    mood: {
        type: String,
        trim: true,
        maxlength: 100,
    },
    source: {
        type: String,
        enum: ['ai', 'image', 'manual', 'fallback', 'image-ai', 'image-fallback'],
        default: 'ai',
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
    }],
    userId: {
        type: String,
        index: true,
    },
}, {
    timestamps: true,
});

// Indexes for common queries
PaletteSchema.index({ createdAt: -1 });
PaletteSchema.index({ tags: 1 });
PaletteSchema.index({ mood: 'text', name: 'text' });

const Palette: Model<IPalette> = mongoose.models.Palette || mongoose.model<IPalette>('Palette', PaletteSchema);

export default Palette;
