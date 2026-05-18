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

    // Trocar código por token de acesso
    const token = await spotifyService.exchangeCodeForToken(code);

    // Obter perfil do usuário
    const user = await spotifyService.getUserProfile(token.access_token);

    // Validar se a resposta corresponde ao schema
    const authResponse = AuthResponseSchema.parse({
      user,
      token,
    });

    console.error('[API Callback] Erro:', error);
    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('[API Callback] Erro:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Authentication failed' },
      { status: 500 }
    );
  }
}
