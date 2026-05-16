import { spotifyService } from '@/services/spotify';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authUrl = spotifyService.getAuthorizationUrl();
    return NextResponse.json({ authUrl });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
