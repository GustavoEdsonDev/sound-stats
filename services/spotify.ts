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
   * Método privado para fazer requisições à API do Spotify com headers de autorização
   * Formata automaticamente o header Authorization como "Bearer <token>"
   */
  private async makeRequest<T>(
    url: string,
    accessToken: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Falha na requisição Spotify: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Gerar URL de autorização do Spotify
   */
  getAuthorizationUrl(): string {
    if (!this.clientId) {
      throw new Error(
        'ID do Cliente do Spotify não está configurado. Defina NEXT_PUBLIC_SPOTIFY_CLIENT_ID em .env.local'
      );
    }
    if (!this.redirectUri) {
      throw new Error(
        'URI de Redirecionação do Spotify não está configurado. Defina NEXT_PUBLIC_SPOTIFY_REDIRECT_URI em .env.local'
      );
    }

    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-top-read',
      'playlist-read-private',
      'playlist-read-collaborative',
      'user-read-recently-played',
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
   * Trocar código de autorização por token de acesso
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
      throw new Error(`Falha ao trocar código por token: ${error.error_description || error.error}`);
    }

    const data = await response.json();
    return SpotifyTokenSchema.parse(data);
  }

  /**
   * Renovar token de acesso usando refresh token
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
      throw new Error(`Falha ao renovar token: ${error.error_description || error.error}`);
    }

    const data = await response.json();
    return SpotifyTokenSchema.parse(data);
  }

  /**
   * Obter perfil do usuário atual
   */
  async getUserProfile(accessToken: string): Promise<z.infer<typeof SpotifyUserSchema>> {
    const data = await this.makeRequest<any>(
      `${SPOTIFY_API_BASE}/me`,
      accessToken
    );
    return SpotifyUserSchema.parse(data);
  }

  /**
   * Obter top tracks do usuário
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

    return this.makeRequest<any>(
      `${SPOTIFY_API_BASE}/me/top/tracks?${params}`,
      accessToken
    );
  }

  /**
   * Obter top artistas do usuário
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

    return this.makeRequest<any>(
      `${SPOTIFY_API_BASE}/me/top/artists?${params}`,
      accessToken
    );
  }

  /**
   * Obter playlists do usuário
   */
  async getUserPlaylists(accessToken: string, limit: number = 50) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    return this.makeRequest<any>(
      `${SPOTIFY_API_BASE}/me/playlists?${params}`,
      accessToken
    );
  }

  /**
   * Obter músicas tocadas recentemente
   */
  async getUserRecentlyPlayed(accessToken: string, limit: number = 50) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    return this.makeRequest<any>(
      `${SPOTIFY_API_BASE}/me/player/recently-played?${params}`,
      accessToken
    );
  }

  /**
   * Obter detalhes completos de múltiplos tracks (inclui popularity)
   */
  async getTracksDetails(accessToken: string, trackIds: string[]) {
    if (trackIds.length === 0) return { tracks: [] };

    const params = new URLSearchParams({
      ids: trackIds.join(','),
    });

    return this.makeRequest<any>(
      `${SPOTIFY_API_BASE}/tracks?${params}`,
      accessToken
    );
  }

  /**
   * Obter detalhes completos de múltiplos artistas (inclui popularity)
   */
  async getArtistsDetails(accessToken: string, artistIds: string[]) {
    if (artistIds.length === 0) return { artists: [] };

    const params = new URLSearchParams({
      ids: artistIds.join(','),
    });

    return this.makeRequest<any>(
      `${SPOTIFY_API_BASE}/artists?${params}`,
      accessToken
    );
  }
}

export const spotifyService = new SpotifyService();
