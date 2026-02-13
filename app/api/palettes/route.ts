import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Palette from '@/models/Palette';
import type { Color } from '@/types';

// GET /api/palettes — list palettes
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);
        const sort = searchParams.get('sort') || 'recent';
        const tag = searchParams.get('tag');
        const search = searchParams.get('search');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

        const query: Record<string, unknown> = {};
        if (tag) query.tags = tag;
        if (search) query.$text = { $search: search };

        let sortObj: Record<string, 1 | -1> = {};
        switch (sort) {
            case 'trending': sortObj = { likes: -1 }; break;
            case 'oldest': sortObj = { createdAt: 1 }; break;
            case 'recent':
            default: sortObj = { createdAt: -1 }; break;
        }

        const [palettes, total] = await Promise.all([
            Palette.find(query).sort(sortObj).skip((page - 1) * limit).limit(limit).lean(),
            Palette.countDocuments(query),
        ]);

        return NextResponse.json({
            palettes,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('List palettes error:', error);
        return NextResponse.json({ error: 'Failed to fetch palettes' }, { status: 500 });
    }
}

// POST /api/palettes — save a palette
export async function POST(request: NextRequest): Promise<NextResponse> {
    try {
        await connectDB();

        const body = await request.json() as {
            name?: string;
            colors?: Color[];
            mood?: string;
            source?: string;
            tags?: string[];
        };
        const { name, colors, mood, source, tags } = body;

        if (!name || !colors || colors.length < 2) {
            return NextResponse.json({ error: 'Name and at least 2 colors are required' }, { status: 400 });
        }

        const palette = await Palette.create({
            name: name.trim(),
            colors,
            mood: mood?.trim(),
            source: source || 'manual',
            tags: tags || [],
        });

        return NextResponse.json(palette, { status: 201 });
    } catch (error) {
        console.error('Save palette error:', error);
        return NextResponse.json({ error: 'Failed to save palette' }, { status: 500 });
    }
}
