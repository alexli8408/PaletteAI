import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Palette from '@/models/Palette';
import { auth } from '@/lib/auth';

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

// PATCH /api/palettes/[id] — toggle like (auth required)
export async function PATCH(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
    try {
        await connectDB();

        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Sign in to like palettes' }, { status: 401 });
        }

        const { id } = await params;
        const userId = session.user.id;

        const palette = await Palette.findById(id);
        if (!palette) {
            return NextResponse.json({ error: 'Palette not found' }, { status: 404 });
        }

        const alreadyLiked = palette.likedBy?.includes(userId);

        if (alreadyLiked) {
            // Unlike
            palette.likedBy = palette.likedBy.filter((uid: string) => uid !== userId);
            palette.likes = Math.max(0, palette.likes - 1);
        } else {
            // Like
            if (!palette.likedBy) palette.likedBy = [];
            palette.likedBy.push(userId);
            palette.likes += 1;
        }

        await palette.save();

        return NextResponse.json({
            likes: palette.likes,
            liked: !alreadyLiked,
        });
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
