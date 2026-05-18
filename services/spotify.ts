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
    console.log('[Spotify] Resposta de Troca de Token:', data);
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
    console.log('[Spotify] Resposta de Renovação de Token:', data);
    return SpotifyTokenSchema.parse(data);
  }

  /**
   * Obter perfil do usuário atual
   */
  async getUserProfile(accessToken: string): Promise<z.infer<typeof SpotifyUserSchema>> {
    console.log('[Spotify] Buscando perfil do usuário com token:', accessToken.slice(0, 20) + '...');

    const response = await fetch(`${SPOTIFY_API_BASE}/me`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('[Spotify] Status da Resposta do Perfil:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Spotify] Erro no Perfil do Usuário:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(`Falha ao buscar perfil do usuário: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log('[Spotify] Perfil do Usuário:', data);
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

    console.log('[Spotify] Buscando top tracks com token:', accessToken.slice(0, 20) + '...');

    const response = await fetch(`${SPOTIFY_API_BASE}/me/top/tracks?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('[Spotify] Status da Resposta de Top Tracks:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Spotify] Erro em Top Tracks:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(`Falha ao buscar top tracks: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log('[Spotify] Top Tracks:', data);
    return data;
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

    console.log('[Spotify] Buscando top artistas com token:', accessToken.slice(0, 20) + '...');

    const response = await fetch(`${SPOTIFY_API_BASE}/me/top/artists?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('[Spotify] Status da Resposta de Top Artistas:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Spotify] Erro em Top Artistas:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(`Falha ao buscar top artistas: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log('[Spotify] Top Artistas:', data);
    return data;
  }

  /**
   * Obter playlists do usuário
   */
  async getUserPlaylists(accessToken: string, limit: number = 50) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    console.log('[Spotify] Buscando playlists com token:', accessToken.slice(0, 20) + '...');

    const response = await fetch(`${SPOTIFY_API_BASE}/me/playlists?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('[Spotify] Status da Resposta de Playlists:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Spotify] Erro em Playlists:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(`Falha ao buscar playlists do usuário: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log('[Spotify] Playlists:', data);
    return data;
  }

  /**
   * Obter músicas tocadas recentemente
   */
  async getUserRecentlyPlayed(accessToken: string, limit: number = 50) {
    const params = new URLSearchParams({
      limit: limit.toString(),
    });

    console.log('[Spotify] Buscando tocadas recentemente com token:', accessToken.slice(0, 20) + '...');

    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/recently-played?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    console.log('[Spotify] Status da Resposta de Tocadas Recentes:', response.status);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Spotify] Erro em Tocadas Recentes:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(`Falha ao buscar tocadas recentemente: ${response.status} - ${errorData.error?.message || 'Erro desconhecido'}`);
    }

    const data = await response.json();
    console.log('[Spotify] Tocadas Recentemente:', data);
    return data;
  }

  /**
   * Obter detalhes completos de múltiplos tracks (inclui popularity)
   */
  async getTracksDetails(accessToken: string, trackIds: string[]) {
    if (trackIds.length === 0) return { tracks: [] };

    const params = new URLSearchParams({
      ids: trackIds.join(','),
    });

    console.log('[Spotify] Buscando detalhes de tracks com IDs:', trackIds);

    const response = await fetch(`${SPOTIFY_API_BASE}/tracks?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Spotify] Erro ao buscar detalhes de tracks:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(`Falha ao buscar detalhes de tracks: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Spotify] Detalhes de Tracks:', data);
    return data;
  }

  /**
   * Obter detalhes completos de múltiplos artistas (inclui popularity)
   */
  async getArtistsDetails(accessToken: string, artistIds: string[]) {
    if (artistIds.length === 0) return { artists: [] };

    const params = new URLSearchParams({
      ids: artistIds.join(','),
    });

    console.log('[Spotify] Buscando detalhes de artistas com IDs:', artistIds);

    const response = await fetch(`${SPOTIFY_API_BASE}/artists?${params}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[Spotify] Erro ao buscar detalhes de artistas:', {
        status: response.status,
        error: errorData,
      });
      throw new Error(`Falha ao buscar detalhes de artistas: ${response.status}`);
    }

    const data = await response.json();
    console.log('[Spotify] Detalhes de Artistas:', data);
    return data;
  }
}

export const spotifyService = new SpotifyService();
