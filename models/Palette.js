import mongoose from 'mongoose';

const ColorSchema = new mongoose.Schema({
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

const PaletteSchema = new mongoose.Schema({
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
            validator: (v) => v.length >= 2 && v.length <= 10,
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
        enum: ['ai', 'image', 'manual'],
        default: 'ai',
    },
    sourceImage: {
        type: String,
    },
    likes: {
        type: Number,
        default: 0,
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true,
    }],
}, {
    timestamps: true,
});

// Indexes for common queries
PaletteSchema.index({ likes: -1 });
PaletteSchema.index({ createdAt: -1 });
PaletteSchema.index({ tags: 1 });
PaletteSchema.index({ mood: 'text', name: 'text' });

export default mongoose.models.Palette || mongoose.model('Palette', PaletteSchema);
