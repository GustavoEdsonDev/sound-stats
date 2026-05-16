/**
 * Auth storage utilities
 */

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

/**
 * Store auth data with expiration timestamp
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
}

/**
 * Get stored auth data with expiration check
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
    return {
      accessToken: token,
      user: JSON.parse(userStr),
      expiresAt,
      refreshToken: refreshToken || undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Get access token if valid
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;

  const token = sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const expiresAtStr = sessionStorage.getItem(STORAGE_KEYS.EXPIRES_AT);

  if (!token || !expiresAtStr) return null;

  const expiresAt = parseInt(expiresAtStr, 10);

  if (isTokenExpired(expiresAt)) {
    clearAuth();
    return null;
  }

  return token;
}

/**
 * Check if token is expired
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
  sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(STORAGE_KEYS.USER);
  sessionStorage.removeItem(STORAGE_KEYS.EXPIRES_AT);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
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
