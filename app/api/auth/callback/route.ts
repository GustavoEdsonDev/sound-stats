import { spotifyService } from '@/services/spotify';
import { AuthResponseSchema } from '@/types/spotify';
import { NextRequest, NextResponse } from 'next/server';
import { logAuthEvent } from '@/utils/authLogger';

/**
 * GET /api/auth/callback
 * Recebe o redirect do Spotify com o authorization code
 * Depois redireciona pro login page para processar
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const state = searchParams.get('state');

    // Se Spotify retornou um erro
    if (error) {
      logAuthEvent('AUTH_ERROR', `Spotify OAuth error: ${error}`);
      const errorDescription = searchParams.get('error_description') || error;
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription)}`, request.url)
      );
    }

    if (!code) {
      logAuthEvent('AUTH_ERROR', 'No authorization code received from Spotify');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    logAuthEvent('LOGIN_START', 'Processing Spotify authorization code', { code: code.substring(0, 20) + '...' });

    // Trocar código por token de acesso
    const token = await spotifyService.exchangeCodeForToken(code);

    if (!token.access_token) {
      logAuthEvent('LOGIN_FAILED', 'Failed to exchange code for token', { status: 400 });
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    // Obter perfil do usuário
    const user = await spotifyService.getUserProfile(token.access_token);

    if (!user.id) {
      logAuthEvent('AUTH_ERROR', 'Failed to get user profile');
      return NextResponse.redirect(new URL('/login?error=user_profile_failed', request.url));
    }

    // Validar se a resposta corresponde ao schema
    const authResponse = AuthResponseSchema.parse({
      user,
      token,
    });

    logAuthEvent('LOGIN_SUCCESS', 'Successfully authenticated', {
      userId: user.id,
      displayName: user.display_name
    });

    // Codificar dados de autenticação em URL para passar pro cliente
    const authData = encodeURIComponent(JSON.stringify(authResponse));
    return NextResponse.redirect(new URL(`/login?auth=${authData}`, request.url));
  } catch (error) {
    console.error('Auth callback error:', error);
    
    let message = 'Falha na autenticação';
    
    if (error instanceof Error) {
      message = error.message;
      
      // Se for erro de validação do Zod
      if (error.name === 'ZodError') {
        message = 'Erro ao validar dados de autenticação';
        console.error('Validation details:', (error as any).issues);
        logAuthEvent('AUTH_ERROR', 'Validation error in auth response', { details: (error as any).issues });
      }
    }
    
    logAuthEvent('LOGIN_FAILED', message);
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(message)}`, request.url));
  }
}

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

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Auth callback error:', error);
    
    let message = 'Falha na autenticação';
    
    if (error instanceof Error) {
      message = error.message;
      
      // Se for erro de validação do Zod
      if (error.name === 'ZodError') {
        message = 'Erro ao validar dados de autenticação';
        console.error('Validation details:', (error as any).issues);
      }
    }
    
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
