import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Palette from '@/models/Palette';

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/palettes/[id]
export async function GET(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        await connectDB();
        const { id } = await params;
        const palette = await Palette.findById(id).lean();

        if (!palette) {
            return NextResponse.json({ error: 'Palette not found' }, { status: 404 });
        }

        return NextResponse.json(palette);
    } catch (error) {
        console.error('Get palette error:', error);
        return NextResponse.json({ error: 'Failed to fetch palette' }, { status: 500 });
    }
}

// PATCH /api/palettes/[id] — like a palette
export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        await connectDB();
        const { id } = await params;
        const body = await request.json() as { action?: 'like' | 'unlike' };

        const update: Record<string, unknown> = {};
        if (body.action === 'like') {
            update.$inc = { likes: 1 };
        } else if (body.action === 'unlike') {
            update.$inc = { likes: -1 };
        }

        const palette = await Palette.findByIdAndUpdate(id, update, { new: true }).lean();

        if (!palette) {
            return NextResponse.json({ error: 'Palette not found' }, { status: 404 });
        }

        return NextResponse.json(palette);
    } catch (error) {
        console.error('Update palette error:', error);
        return NextResponse.json({ error: 'Failed to update palette' }, { status: 500 });
    }
}

// DELETE /api/palettes/[id]
export async function DELETE(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        await connectDB();
        const { id } = await params;
        const palette = await Palette.findByIdAndDelete(id);

        if (!palette) {
            return NextResponse.json({ error: 'Palette not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Palette deleted' });
    } catch (error) {
        console.error('Delete palette error:', error);
        return NextResponse.json({ error: 'Failed to delete palette' }, { status: 500 });
    }
}
