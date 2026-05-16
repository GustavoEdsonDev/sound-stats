import { spotifyService } from '@/services/spotify';
import { AuthResponseSchema } from '@/types/spotify';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { message: 'Authorization code is required' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const token = await spotifyService.exchangeCodeForToken(code);

    // Get user profile
    const user = await spotifyService.getUserProfile(token.access_token);

    // Validate response matches schema
    const authResponse = AuthResponseSchema.parse({
      user,
      token,
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
}
