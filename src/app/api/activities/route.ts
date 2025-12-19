import { NextRequest, NextResponse } from 'next/server';
import { getCurrentDbUser } from '@/lib/auth/getCurrentUser';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentDbUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query params for pagination
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const type = searchParams.get('type'); // Optional filter by activity type

    // Fetch activities from database
    const activities = await prisma.activity.findMany({
      where: {
        userId: user.id,
        ...(type ? { type } : {}),
      },
      orderBy: { startDate: 'desc' },
      take: limit,
      skip: offset,
      include: {
        gear: {
          select: {
            name: true,
            type: true,
            distance: true,
          },
        },
      },
    });

    // Get total count for pagination
    const total = await prisma.activity.count({
      where: {
        userId: user.id,
        ...(type ? { type } : {}),
      },
    });

    return NextResponse.json({ activities, total, limit, offset });
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentDbUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Create activity in database
    const activity = await prisma.activity.create({
      data: {
        userId: user.id,
        source: body.source || 'manual',
        name: body.name,
        type: body.type,
        startDate: new Date(body.startDate),
        startDateLocal: new Date(body.startDateLocal || body.startDate),
        distance: body.distance || 0,
        movingTime: body.movingTime || 0,
        elapsedTime: body.elapsedTime || body.movingTime || 0,
        totalElevationGain: body.totalElevationGain,
        description: body.description,
      },
    });

    return NextResponse.json({ success: true, activity });
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
