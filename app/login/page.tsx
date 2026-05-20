'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { storeAuth, clearAuth } from '@/utils/auth';
import { logAuthEvent } from '@/utils/authLogger';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = searchParams.get('auth');
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    // Se houver erro do Spotify
    if (errorParam) {
      setError(`Spotify auth failed: ${errorParam}`);
      return;
    }

    // Novo fluxo: Spotify redireciona para /api/auth/login (GET)
    // que processa o código e redireciona aqui com ?auth={data}
    if (auth) {
      try {
        const authData = JSON.parse(decodeURIComponent(auth));
        handleAuthSuccess(authData);
      } catch (err) {
        logAuthEvent('AUTH_ERROR', 'Failed to parse auth data from URL');
        setError('Falha ao processar dados de autenticação');
      }
      return;
    }

    // Fallback: Se houver código (fluxo antigo), processar no cliente
    if (code) {
      handleCallback(code);
    }
  }, [searchParams]);

  const handleAuthSuccess = (authData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const user = authData.user;
      const token = authData.token;

      if (!user || !token) {
        logAuthEvent('AUTH_ERROR', 'Invalid auth data received', {
          hasUser: !!user,
          hasToken: !!token,
        });
        throw new Error('Dados de autenticação inválidos');
      }

      // Armazenar token
      storeAuth(
        token.access_token,
        user,
        token.expires_in || 3600,
        token.refresh_token
      );

      logAuthEvent('LOGIN_SUCCESS', 'User logged in successfully', {
        userId: user.id,
        displayName: user.display_name,
      });

      // Redirecionar para dashboard
      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro';

      logAuthEvent('AUTH_ERROR', `Auth error: ${errorMessage}`, {
        errorType: err instanceof Error ? err.name : 'Unknown',
      });

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Fallback: Se o novo fluxo falhar, tentar processamento no cliente (compatibilidade)
  const handleCallback = async (code: string) => {
    setIsLoading(true);
    setError(null);

    logAuthEvent('LOGIN_START', 'Processing auth code (client-side fallback)', {
      codeLength: code.length,
    });

    try {
      // Fallback: fazer POST para endpoint que ainda suporta POST
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.message || 'Falha ao autenticar';

        logAuthEvent('LOGIN_FAILED', `Auth failed: ${errorMsg}`, {
          statusCode: response.status,
        });

        if (errorMsg.includes('Invalid authorization code') || errorMsg.includes('invalid_grant')) {
          throw new Error('Código de autorização expirou. Faça login novamente.');
        }
        throw new Error(errorMsg);
      }

      const data = await response.json();
      handleAuthSuccess(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro';

      logAuthEvent('AUTH_ERROR', `Client-side auth error: ${errorMessage}`);

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleSpotifyLogin = () => {
    setIsLoading(true);
    
    logAuthEvent('LOGIN_START', 'Redirecionando para login do Spotify');
    
    try {
      const response = fetch('/api/auth/spotify-auth-url', {
        method: 'GET',
      });
      response
        .then((res) => res.json())
        .then(({ authUrl }) => {
          window.location.href = authUrl;
        })
        .catch((err) => {
          logAuthEvent('LOGIN_FAILED', 'Falha ao obter URL de autenticação do Spotify', {
            error: err instanceof Error ? err.message : 'Erro desconhecido',
          });
          setError('Falha ao iniciar login do Spotify');
          setIsLoading(false);
        });
    } catch (err) {
      logAuthEvent('AUTH_ERROR', 'Erro ao iniciar login', {
        error: err instanceof Error ? err.message : 'Erro desconhecido',
      });
      setError('Falha ao iniciar login do Spotify');
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    setError(null);
  };

  const isAuthenticated = typeof window !== 'undefined' && !!sessionStorage.getItem('spotify_access_token');

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-black flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Sound Stats</h1>
          <p className="text-gray-400">Descubra suas estatísticas de música</p>
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded mb-6">
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">

          {!isAuthenticated ? (
            <button
              onClick={handleSpotifyLogin}
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  Conectando...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.398-.645.643-1.11.643-.46 0-.946-.246-1.1-.643-.154-.398-.154-.846 0-1.244.154-.398.64-.644 1.1-.644.465 0 .87.246 1.11.643.24.398.24.846 0 1.244zm3.364-9.663c-.122.244-.605.406-.999.406-.394 0-.877-.162-.999-.406-.121-.244-.121-.608 0-.852.122-.244.605-.406.999-.406.394 0 .877.162.999.406.12.244.12.608 0 .852z" />
                  </svg>
                  Conectar com Spotify
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition duration-200"
            >
              {isLoading ? 'Desconectando...' : 'Desconectar'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-green-900 to-black flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
