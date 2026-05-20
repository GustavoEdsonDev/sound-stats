import { spotifyService } from '@/services/spotify';
import { AuthResponseSchema } from '@/types/spotify';
import { NextRequest, NextResponse } from 'next/server';
import { logAuthEvent } from '@/utils/authLogger';

/**
 * GET /api/auth/login
 * Recebe o redirect do Spotify com o authorization code
 * Processa a autenticação e redireciona pro login page
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('🔐 Auth login GET request received');
    console.log('  - Has code:', !!code);
    console.log('  - Has error:', !!error);
    console.log('  - Redirect URI:', process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI);

    // Se Spotify retornou um erro
    if (error) {
      console.error('❌ Spotify returned error:', error);
      logAuthEvent('AUTH_ERROR', `Spotify OAuth error: ${error}`);
      const errorDescription = searchParams.get('error_description') || error;
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription)}`, request.url)
      );
    }

    if (!code) {
      console.error('❌ No code received from Spotify');
      logAuthEvent('AUTH_ERROR', 'No authorization code received from Spotify');
      return NextResponse.redirect(new URL('/login?error=no_code', request.url));
    }

    logAuthEvent('LOGIN_START', 'Processing Spotify authorization code', { code: code.substring(0, 20) + '...' });

    console.log('🔄 Exchanging code for token...');
    // Trocar código por token de acesso
    const token = await spotifyService.exchangeCodeForToken(code);
    console.log('✅ Token received:', { access_token: token.access_token?.substring(0, 20) + '...' });

    if (!token.access_token) {
      console.error('❌ No access token in response');
      logAuthEvent('LOGIN_FAILED', 'Failed to exchange code for token', { status: 400 });
      return NextResponse.redirect(new URL('/login?error=token_exchange_failed', request.url));
    }

    console.log('👤 Fetching user profile...');
    // Obter perfil do usuário
    const user = await spotifyService.getUserProfile(token.access_token);
    console.log('✅ User profile received:', { userId: user.id, displayName: user.display_name });

    if (!user.id) {
      console.error('❌ No user ID in profile');
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

    console.log('🎉 Auth successful, redirecting to login with auth data');

    // Codificar dados de autenticação em URL para passar pro cliente
    const authData = encodeURIComponent(JSON.stringify(authResponse));
    return NextResponse.redirect(new URL(`/login?auth=${authData}`, request.url));
  } catch (error) {
    console.error('🔴 Auth login error:', error);
    
    let message = 'Falha na autenticação';
    
    if (error instanceof Error) {
      message = error.message;
      console.error('  - Error message:', message);
      console.error('  - Error name:', error.name);
      
      // Se for erro de validação do Zod
      if (error.name === 'ZodError') {
        message = 'Erro ao validar dados de autenticação';
        console.error('  - Validation details:', (error as any).issues);
        logAuthEvent('AUTH_ERROR', 'Validation error in auth response', { details: (error as any).issues });
      }
    }
    
    logAuthEvent('LOGIN_FAILED', message);
    console.log('  - Redirecting to login with error:', message);
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

    console.log('🔐 Auth login POST request received');
    
    // Trocar código por token de acesso
    const token = await spotifyService.exchangeCodeForToken(code);

    // Obter perfil do usuário
    const user = await spotifyService.getUserProfile(token.access_token);

    // Validar se a resposta corresponde ao schema
    const authResponse = AuthResponseSchema.parse({
      user,
      token,
    });

    logAuthEvent('LOGIN_SUCCESS', 'Successfully authenticated via POST', {
      userId: user.id,
      displayName: user.display_name
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('🔴 Auth login POST error:', error);
    
    let message = 'Falha na autenticação';
    
    if (error instanceof Error) {
      message = error.message;
      
      // Se for erro de validação do Zod
      if (error.name === 'ZodError') {
        message = 'Erro ao validar dados de autenticação';
        console.error('Validation details:', (error as any).issues);
        logAuthEvent('AUTH_ERROR', 'Validation error in auth response POST', { details: (error as any).issues });
      }
    }
    
    logAuthEvent('LOGIN_FAILED', message);
    
    return NextResponse.json(
      { message },
      { status: 500 }
    );
  }
}
