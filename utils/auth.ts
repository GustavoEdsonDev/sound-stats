/**
 * Utilitários de armazenamento de autenticação
 */

import { logAuthEvent } from './authLogger';

export interface StoredAuthData {
  accessToken: string;
  refreshToken?: string;
  user: any;
  expiresAt: number;
}

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  USER: 'spotify_user',
  EXPIRES_AT: 'spotify_expires_at',
} as const;

const COOKIE_NAMES = {
  ACCESS_TOKEN: 'spotify_access_token',
  REFRESH_TOKEN: 'spotify_refresh_token',
  USER: 'spotify_user',
} as const;

/**
 * Armazenar dados de autenticação com timestamp de expiração
 */
export function storeAuth(
  accessToken: string,
  user: any,
  expiresIn: number,
  refreshToken?: string
): void {
  if (typeof window === 'undefined') return;

  const expiresAt = Date.now() + expiresIn * 1000;

  sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  sessionStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  sessionStorage.setItem(STORAGE_KEYS.EXPIRES_AT, expiresAt.toString());
  
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
  
  // Log de autenticação bem-sucedida
  logAuthEvent('LOGIN_SUCCESS', 'Usuário autenticado com sucesso', {
    userId: user?.id,
    displayName: user?.display_name,
    expiresIn,
    tokenLength: accessToken.length,
  }, user?.id);
}

/**
 * Obter dados de autenticação armazenados com verificação de expiração
 */
export function getStoredAuth(): StoredAuthData | null {
  if (typeof window === 'undefined') return null;

  const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const userStr = sessionStorage.getItem(STORAGE_KEYS.USER);
  const expiresAtStr = sessionStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
  const refreshToken = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

  if (!token || !userStr || !expiresAtStr) return null;

  const expiresAt = parseInt(expiresAtStr, 10);

  // Check if token is expired
  if (isTokenExpired(expiresAt)) {
    clearAuth();
    return null;
  }

  try {
    const parsedUser = JSON.parse(userStr);
    if (!parsedUser || typeof parsedUser !== 'object') {
      clearAuth();
      return null;
    }
    return {
      accessToken: token,
      user: parsedUser,
      expiresAt,
      refreshToken: refreshToken || undefined,
    };
  } catch (err) {
    clearAuth();
    return null;
  }
}

/**
 * Obter token de acesso se válido
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const expiresAtStr = sessionStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

  if (!token || !expiresAtStr) return null;

  const expiresAt = parseInt(expiresAtStr, 10);

  if (isTokenExpired(expiresAt)) {
    logAuthEvent('TOKEN_EXPIRED', 'Token de acesso expirou', {
      expiresAt: new Date(expiresAt).toISOString(),
      now: new Date().toISOString(),
    });
    clearAuth();
    return null;
  }

  return token;
}

/**
 * Verificar se o token expirou
 */
export function isTokenExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}

/**
 * Get time until token expiration in seconds
 */
export function getTokenTimeToExpire(): number {
  if (typeof window === 'undefined') return 0;

  const expiresAtStr = sessionStorage.getItem(STORAGE_KEYS.EXPIRES_AT);
  if (!expiresAtStr) return 0;

  const expiresAt = parseInt(expiresAtStr, 10);
  const secondsLeft = Math.floor((expiresAt - Date.now()) / 1000);

  return Math.max(0, secondsLeft);
}

/**
 * Clear all auth data
 */
export function clearAuth(): void {
  if (typeof window === 'undefined') return;
  
  // Obter dados do usuário antes de limpar para o log
  const userStr = sessionStorage.getItem(STORAGE_KEYS.USER);
  let userId: string | undefined;
  
  try {
    if (userStr) {
      const user = JSON.parse(userStr);
      userId = user?.id;
    }
  } catch (err) {
    // Ignorar erros de parsing
  }
  
  sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.USER);
  sessionStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  
  // Log de logout
  logAuthEvent('LOGOUT', 'Usuário desconectado e dados de autenticação removidos', {}, userId);
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Format time duration in seconds to MM:SS
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Get the English country name for an ISO 3166-1 alpha-2 country code.
 *
 * @param countryCode - Two-letter country code (case-insensitive). If omitted or not length 2, it is treated as invalid.
 * @returns The country name in English, or an empty string if the code is missing, invalid, or has no mapping.
 */
export function countryCodeToName(countryCode?: string): string {
  if (!countryCode || countryCode.length !== 2) return '';

  const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
  return regionNames.of(countryCode.toUpperCase()) || '';
}

/**
 * Builds an authorization header object for Spotify API requests.
 *
 * @param accessToken - The Spotify access token to include in the `Authorization` header
 * @returns An object containing `Authorization: Bearer <accessToken>` and `Content-Type: application/json`
 * @throws Error if `accessToken` is falsy
 */
export function createAuthorizationHeader(accessToken: string): Record<string, string> {
  if (!accessToken) {
    throw new Error('Access token é obrigatório');
  }

  return {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Determines whether a given access token appears valid by checking type and minimum length.
 *
 * @param token - The access token to validate; may be `null`.
 * @returns `true` if `token` is a string longer than 10 characters, `false` otherwise.
 */
export function isValidAccessToken(token: string | null): boolean {
  if (!token) return false;
  // Token do Spotify é uma string base64url, deve ter comprimento > 10
  return typeof token === 'string' && token.length > 10;
}

/**
 * Get the remaining token lifetime rounded down to whole minutes.
 *
 * @returns The number of whole minutes until the token expires; 0 if expired or unavailable.
 */
export function getTokenExpirationMinutes(): number {
  const seconds = getTokenTimeToExpire();
  return Math.floor(seconds / 60);
}

/**
 * Indicates whether the stored access token will expire in less than five minutes.
 *
 * @returns `true` if fewer than five minutes remain until expiration, `false` otherwise.
 */
export function isTokenNearExpiration(): boolean {
  const minutesLeft = getTokenExpirationMinutes();
  return minutesLeft < 5;
}

/**
 * Funções de Cookie (Comentadas - Causam aviso de cross-site)
 * 
 * Para segurança, use apenas sessionStorage/localStorage no cliente.
 * Para cookies HttpOnly seguros, implemente no servidor (NextResponse.cookies.set()).
 * 
 * Essas funções estão aqui como referência se precisar
 * implementar cookies no lado do servidor no futuro.
 */

// export function setAuthCookie(name: string, value: string, maxAge?: number): void {
//   if (typeof window === 'undefined') return;
//   let cookieString = `${name}=${encodeURIComponent(value)}`;
//   if (maxAge) cookieString += `; Max-Age=${maxAge}`;
//   cookieString += '; Path=/; SameSite=Strict';
//   if (process.env.NODE_ENV === 'production') cookieString += '; Secure';
//   document.cookie = cookieString;
// }

// export function getAuthCookie(name: string): string | null {
//   if (typeof window === 'undefined') return null;
//   const cookieArray = document.cookie.split(';');
//   for (const cookie of cookieArray) {
//     const [cookieName, cookieValue] = cookie.trim().split('=');
//     if (cookieName === name && cookieValue) {
//       return decodeURIComponent(cookieValue);
//     }
//   }
//   return null;
// }

// export function removeAuthCookie(name: string): void {
//   if (typeof window === 'undefined') return;
//   document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Strict`;
// }

// export function clearAuthCookies(): void {
//   if (typeof window === 'undefined') return;
//   removeAuthCookie(COOKIE_NAMES.ACCESS_TOKEN);
//   removeAuthCookie(COOKIE_NAMES.REFRESH_TOKEN);
//   removeAuthCookie(COOKIE_NAMES.USER);
// }

// export function storeTokenInCookie(accessToken: string, expiresIn: number): void {
//   setAuthCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, expiresIn);
// }

// export function storeAuthAsCookies(
//   accessToken: string,
//   user: any,
//   expiresIn: number,
//   refreshToken?: string
// ): void {
//   setAuthCookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, expiresIn);
//   setAuthCookie(COOKIE_NAMES.USER, JSON.stringify(user));
//   if (refreshToken) {
//     setAuthCookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, 7 * 24 * 60 * 60);
//   }
// }

