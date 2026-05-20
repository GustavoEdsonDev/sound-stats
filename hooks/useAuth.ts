import { useEffect, useState, useCallback } from 'react';
import type { SpotifyUser, SpotifyToken } from '@/types/spotify';
import { getStoredAuth, clearAuth, getTokenTimeToExpire } from '@/utils/auth';
import { logAuthEvent } from '@/utils/authLogger';

interface AuthState {
  user: SpotifyUser | null;
  token: SpotifyToken | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  expiresIn: number; // seconds
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    expiresIn: 0,
  });

  // Initialize auth state and setup refresh interval
  useEffect(() => {
    const initAuth = () => {
      const storedAuth = getStoredAuth();

      if (storedAuth) {
        const expiresIn = getTokenTimeToExpire();
        
        logAuthEvent('SESSION_RESTORED', 'Sessão restaurada do armazenamento', {
          userId: storedAuth.user?.id,
          displayName: storedAuth.user?.display_name,
          expiresIn,
        }, storedAuth.user?.id);
        
        setAuthState({
          user: storedAuth.user,
          token: {
            access_token: storedAuth.accessToken,
            token_type: 'Bearer',
            expires_in: expiresIn,
            refresh_token: storedAuth.refreshToken,
          },
          isLoading: false,
          isAuthenticated: true,
          expiresIn,
        });
      } else {
        setAuthState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();

    // Check token expiration every minute
    const interval = setInterval(() => {
      const storedAuth = getStoredAuth();
      if (!storedAuth) {
        setAuthState((prev) => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          token: null,
        }));
      } else {
        const expiresIn = getTokenTimeToExpire();
        setAuthState((prev) => ({
          ...prev,
          expiresIn,
        }));
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setAuthState({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      expiresIn: 0,
    });
  }, []);

  return {
    ...authState,
    logout,
  };
}
