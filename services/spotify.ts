import { SpotifyTokenSchema, SpotifyUserSchema, AuthResponseSchema } from '@/types/spotify';
import { z } from 'zod';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const SPOTIFY_AUTH_BASE = 'https://accounts.spotify.com';

export class SpotifyService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    this.redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI || '';
  }

  /**
   * Generate Spotify OAuth authorization URL
   */
  getAuthorizationUrl(): string {
    if (!this.clientId) {
      throw new Error(
        'Spotify Client ID is not configured. Set NEXT_PUBLIC_SPOTIFY_CLIENT_ID in .env.local'
      );
    }
    if (!this.redirectUri) {
      throw new Error(
        'Spotify Redirect URI is not configured. Set NEXT_PUBLIC_SPOTIFY_REDIRECT_URI in .env.local'
      );
    }

    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'playlist-read-private',
      'playlist-read-collaborative',
    ];

    const params = new URLSearchParams({
      client_id: this.clientId,
      response_type: 'code',
      redirect_uri: this.redirectUri,
      scope: scopes.join(' '),
    });

    return `${SPOTIFY_AUTH_BASE}/authorize?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<z.infer<typeof SpotifyTokenSchema>> {
    const params = new URLSearchParams({
      code,
      redirect_uri: this.redirectUri,
      grant_type: 'authorization_code',
    });

    const response = await fetch(`${SPOTIFY_AUTH_BASE}/api/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to exchange code for token: ${error.error_description || error.error}`);
    }

    const data = await response.json();
    return SpotifyTokenSchema.parse(data);
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<z.infer<typeof SpotifyTokenSchema>> {
    const params = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    const response = await fetch(`${SPOTIFY_AUTH_BASE}/api/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Failed to refresh token: ${error.error_description || error.error}`);
    }

    const data = await response.json();
    return SpotifyTokenSchema.parse(data);
  }

  /**
   * Get current user's profile
   */
  async getUserProfile(accessToken: string): Promise<z.infer<typeof SpotifyUserSchema>> {
    const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    const data = await response.json();
    return SpotifyUserSchema.parse(data);
  }

  /**
   * Get user's top tracks
   */
  async getUserTopTracks(
    accessToken: string,
    timeRange: 'long_term' | 'medium_term' | 'short_term' = 'medium_term',
    limit: number = 50
  ) {
    const params = new URLSearchParams({
      time_range: timeRange,
      limit: limit.toString(),
    });

    const response = await fetch(`${SPOTIFY_API_BASE}/me/top/tracks?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user top tracks');
    }

    return response.json();
  }

  /**
   * Get user's top artists
   */
  async getUserTopArtists(
    accessToken: string,
    timeRange: 'long_term' | 'medium_term' | 'short_term' = 'medium_term',
    limit: number = 50
  ) {
    const params = new URLSearchParams({
      time_range: timeRange,
      limit: limit.toString(),
    });

    const response = await fetch(`${SPOTIFY_API_BASE}/me/top/artists?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user top artists');
    }

    return response.json();
  }

  /**
   * Get user's playlists
   */
  async getUserPlaylists(accessToken: string, limit: number = 50) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    const response = await fetch(`${SPOTIFY_API_BASE}/me/playlists?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user playlists');
    }

    return response.json();
  }
}

export const spotifyService = new SpotifyService();
