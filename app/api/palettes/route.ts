import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Palette from '@/models/Palette';
import { auth } from '@/lib/auth';
import type { Color } from '@/types';

// GET /api/palettes — list user's palettes
export async function GET(request: NextRequest): Promise<NextResponse> {
    try {
        await connectDB();

        const session = await auth().catch(() => null);
        if (!session?.user?.id) {
            return NextResponse.json({ palettes: [], total: 0, page: 1, totalPages: 0 });
        }

        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');
        const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);
        const page = Math.max(parseInt(searchParams.get('page') || '1'), 1);

        const query: Record<string, unknown> = { userId: session.user.id };
        if (search) query.name = { $regex: search, $options: 'i' };

        const sortObj: Record<string, 1 | -1> = { createdAt: -1 };

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

        const session = await auth().catch(() => null);
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
            userId: session?.user?.id,
        });

        return NextResponse.json(palette, { status: 201 });
    } catch (error) {
        console.error('Save palette error:', error);
        return NextResponse.json({ error: 'Failed to save palette' }, { status: 500 });
    }
}
