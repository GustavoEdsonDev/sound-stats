/**
 * Utilitários para formatar dados da API Spotify
 */

import type { SpotifyTrack, SpotifyTopTracksResponse } from '@/types/spotify';

/**
 * Formatar track como string legível
 * Exemplo: "Blinding Lights by The Weeknd"
 */
export function formatTrack(track: SpotifyTrack): string {
  const artistNames = track.artists
    .map(artist => artist.name)
    .join(', ');
  
  return `${track.name} by ${artistNames}`;
}

/**
 * Formatar múltiplos tracks para array de strings
 * Exemplo: ["Blinding Lights by The Weeknd", "Heat Waves by Glass Animals"]
 */
export function formatTopTracks(tracks: SpotifyTrack[]): string[] {
  return tracks.map(formatTrack);
}

/**
 * Formatar resposta de top tracks completa
 */
export function formatTopTracksResponse(response: SpotifyTopTracksResponse): {
  tracks: string[];
  count: number;
  total: number;
} {
  return {
    tracks: formatTopTracks(response.items),
    count: response.items.length,
    total: response.total || response.items.length,
  };
}

/**
 * Obter informações detalhadas de um track
 */
export function getTrackDetails(track: SpotifyTrack) {
  return {
    id: track.id,
    name: track.name,
    artists: track.artists.map(a => a.name),
    album: track.album?.name || 'Desconhecido',
    duration: formatDuration(track.duration_ms),
    popularity: track.popularity || 0,
    explicit: track.explicit || false,
    previewUrl: track.preview_url || null,
    spotifyUrl: track.external_urls?.spotify || '#',
    albumArt: track.album?.images?.[0]?.url || null,
  };
}

/**
 * Formatar duração em milissegundos para MM:SS
 */
function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Agrupar top tracks por artista
 */
export function groupTracksByArtist(tracks: SpotifyTrack[]) {
  const grouped: Record<string, SpotifyTrack[]> = {};

  tracks.forEach(track => {
    const primaryArtist = track.artists[0]?.name || 'Desconhecido';
    
    if (!grouped[primaryArtist]) {
      grouped[primaryArtist] = [];
    }
    
    grouped[primaryArtist].push(track);
  });

  return grouped;
}

/**
 * Calcular popularidade média dos top tracks
 */
export function getAveragePopularity(tracks: SpotifyTrack[]): number {
  if (tracks.length === 0) return 0;
  
  const total = tracks.reduce((sum, track) => sum + (track.popularity || 0), 0);
  return Math.round(total / tracks.length);
}

/**
 * Tracks explicitos
 */
export function getExplicitTracks(tracks: SpotifyTrack[]): SpotifyTrack[] {
  return tracks.filter(track => track.explicit);
}

/**
 * Calcular tempo total em horas:minutos
 */
export function getTotalDuration(tracks: SpotifyTrack[]): string {
  const totalMs = tracks.reduce((sum, track) => sum + track.duration_ms, 0);
  const totalSeconds = Math.floor(totalMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
