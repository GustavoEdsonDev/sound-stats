/**
 * EXEMPLOS PRÁTICOS: Como usar Top Tracks da API Spotify
 * 
 * Este arquivo contém exemplos práticos de como integrar
 * a busca de top tracks no seu projeto
 * 
 * NOTA: Este é um arquivo de referência/documentação.
 * Para usar estes exemplos, copie o código para seus componentes.
 */

// NÃO USE 'use client' AQUI - Este é um arquivo de exemplos/referência

import { useEffect, useState } from 'react';
import { spotifyService } from '@/services/spotify';
import { getAccessToken, isTokenNearExpiration } from '@/utils/auth';
import { 
  formatTopTracks, 
  getTrackDetails,
  getAveragePopularity, 
  getTotalDuration, 
  groupTracksByArtist,
  getExplicitTracks 
} from '@/utils/spotifyFormatter';
import { useAuth } from '@/hooks/useAuth';
import type { SpotifyTrack } from '@/types/spotify';

// ============================================
// EXEMPLO 1: Forma Simples (Recomendado)
// ============================================
// 
// COPIE ESTE CÓDIGO PARA SEU COMPONENTE:
//
// async function buscarTopTracks() {
//   try {
//     const token = getAccessToken();
//     if (!token) throw new Error('Token não disponível');
//
//     const response = await spotifyService.getUserTopTracks(token, 'long_term', 5);
//     const formatted = formatTopTracks(response.items);
//     
//     console.log('Meus 5 Top Tracks:');
//     formatted.forEach((track, i) => {
//       console.log(`${i + 1}. ${track}`);
//     });
//   } catch (error) {
//     console.error('Erro:', error);
//   }
// }

// ============================================
// EXEMPLO 2: Com Detalhes Completos
// ============================================
//
// COPIE ESTE CÓDIGO PARA SEU COMPONENTE:
//
// async function buscarComDetalhes() {
//   try {
//     const token = getAccessToken();
//     if (!token) throw new Error('Token não disponível');
//
//     const response = await spotifyService.getUserTopTracks(token, 'medium_term', 3);
//     response.items.forEach((track, index) => {
//       const details = getTrackDetails(track);
//       console.log(`🎵 #${index + 1}: ${details.name}`);
//       console.log(`👤 Artistas: ${details.artists.join(', ')}`);
//     });
//   } catch (error) {
//     console.error('Erro:', error);
//   }
// }

// ============================================
// EXEMPLO 3: Usar em Componente React
// ============================================

export function TopTracksExample() {
  const { token } = useAuth();
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [timeRange, setTimeRange] = useState<'long_term' | 'medium_term' | 'short_term'>('medium_term');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!token?.access_token) return;

    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        const response = await spotifyService.getUserTopTracks(
          token.access_token,
          timeRange,
          10
        );
        setTracks(response.items);
      } catch (error) {
        console.error('Erro:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTracks();
  }, [token, timeRange]);

  if (isLoading) {
    return <div className="p-6 text-center">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Meus Top Tracks</h1>

      <select 
        value={timeRange}
        onChange={(e) => setTimeRange(e.target.value as any)}
        className="mb-4 p-2 border rounded"
      >
        <option value="short_term">Últimas 4 semanas</option>
        <option value="medium_term">Últimos 6 meses</option>
        <option value="long_term">Todo o tempo</option>
      </select>

      <div className="grid grid-cols-1 gap-4">
        {tracks.map((track, index) => (
          <div key={track.id} className="border p-4 rounded-lg hover:bg-gray-50">
            <div className="flex gap-4">
              {track.album?.images?.[0]?.url && (
                <img 
                  src={track.album.images[0].url} 
                  alt={track.name}
                  className="w-16 h-16 rounded"
                />
              )}
              <div className="flex-1">
                <div className="font-bold text-lg">
                  #{index + 1} - {track.name}
                </div>
                <div className="text-gray-600">
                  {track.artists.map(a => a.name).join(', ')}
                </div>
                <div className="text-sm text-gray-500">
                  {track.album?.name} • {Math.round(track.duration_ms / 60000)}:{Math.round((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}
                </div>
                <div className="mt-2 flex gap-2">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                    ⭐ {track.popularity}% Popular
                  </span>
                  {track.explicit && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                      🔞 Explicit
                    </span>
                  )}
                </div>
              </div>
              {track.external_urls?.spotify && (
                <a 
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="self-center text-green-500 hover:text-green-700"
                >
                  ▶ Abrir no Spotify
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EXEMPLO 4: Com Estatísticas (USE EM SEU HOOK)
// ============================================
//
// COPIE ESTE CÓDIGO PARA SEU HOOK/COMPONENTE:
//
// const response = await spotifyService.getUserTopTracks(token, 'long_term', 50);
// const items = response.items;
//
// console.log(`Total de tracks: ${items.length}`);
// console.log(`Popularidade média: ${getAveragePopularity(items)}%`);
// console.log(`Tempo total: ${getTotalDuration(items)}`);
// console.log(`Tracks com explicit content: ${getExplicitTracks(items).length}`);
//
// const grouped = groupTracksByArtist(items);
// Object.entries(grouped)
//   .sort(([, a], [, b]) => b.length - a.length)
//   .slice(0, 10)
//   .forEach(([artist, tracks]) => {
//     console.log(`${artist}: ${tracks.length} música(s)`);
//   });

// ============================================
// DICAS DE USO
// ============================================
//
// 1. COMPONENTE PRONTO:
//    import { TopTracksExample } from '@/path/to/examples';
//    <TopTracksExample />
//
// 2. EM UM HOOK:
//    const { token } = useAuth();
//    const [tracks, setTracks] = useState([]);
//    useEffect(() => {
//      if (token?.access_token) {
//        spotifyService.getUserTopTracks(token.access_token, 'long_term', 10)
//          .then(res => setTracks(res.items));
//      }
//    }, [token]);
//
// 3. FORMATAR PARA EXIBIÇÃO:
//    const formatted = formatTopTracks(tracks);
//    const details = getTrackDetails(tracks[0]);
//    const grouped = groupTracksByArtist(tracks);
//    const avgPop = getAveragePopularity(tracks);
//    const duration = getTotalDuration(tracks);
