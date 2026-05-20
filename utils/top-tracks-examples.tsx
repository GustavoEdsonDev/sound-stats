/**
 * EXEMPLOS PRÁTICOS: Como usar Top Tracks da API Spotify
 * 
 * Este arquivo contém exemplos práticos de como integrar
 * a busca de top tracks no seu projeto
 */

'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { spotifyService } from '@/services/spotify';
import { getAccessToken } from '@/utils/auth';
import { formatTopTracks, getTrackDetails, getAveragePopularity, getTotalDuration, groupTracksByArtist, getExplicitTracks } from '@/utils/spotifyFormatter';
import type { SpotifyTrack } from '@/types/spotify';

/**
 * Buscar e formatar top tracks de forma simples
 */
export async function exemplo1_Simples() {
  try {
    const token = getAccessToken();
    if (!token) throw new Error('Token não disponível');

    // Buscar
    const response = await spotifyService.getUserTopTracks(
      token,
      'long_term',  // Meses: long_term, medium_term, short_term
      5
    );

    // Formatar como o exemplo do Spotify
    const formatted = formatTopTracks(response.items);
    
    console.log('Meus 5 Top Tracks:');
    formatted.forEach((track, i) => {
      console.log(`${i + 1}. ${track}`);
    });

    // Saída:
    // 1. Blinding Lights by The Weeknd
    // 2. Heat Waves by Glass Animals
    // 3. As It Was by Harry Styles
    // ...
  } catch (error) {
    console.error('Erro:', error);
  }
}

/**
 * Mostrar detalhes de cada track
 */
export async function exemplo2_Detalhado() {
  try {
    const token = getAccessToken();
    if (!token) throw new Error('Token não disponível');

    const response = await spotifyService.getUserTopTracks(
      token,
      'medium_term',
      3
    );

    // Mostrar detalhes de cada track
    response.items.forEach((track, index) => {
      const details = getTrackDetails(track);
      
      console.log(`\n🎵 #${index + 1}: ${details.name}`);
      console.log(`👤 Artistas: ${details.artists.join(', ')}`);
      console.log(`💿 Álbum: ${details.album}`);
      console.log(`⏱️  Duração: ${details.duration}`);
      console.log(`📈 Popularidade: ${details.popularity}%`);
      console.log(`🔗 Ouvir no Spotify: ${details.spotifyUrl}`);
      
      if (details.albumArt) {
        console.log(`🖼️  Capa: ${details.albumArt}`);
      }
    });
  } catch (error) {
    console.error('Erro:', error);
  }
}

/**
 * Componente React para listar Top Tracks
 */
export function TopTracksExample() {
  const { token } = useAuth();
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [timeRange, setTimeRange] = useState<'long_term' | 'medium_term' | 'short_term'>('medium_term');

  useEffect(() => {
    if (!token?.access_token) return;

    const fetchTracks = async () => {
      try {
        const response = await spotifyService.getUserTopTracks(
          token.access_token,
          timeRange,
          10
        );
        setTracks(response.items);
      } catch (error) {
        console.error('Erro:', error);
      }
    };

    fetchTracks();
  }, [token, timeRange]);

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

/**
 * Análise com estatísticas
 */
export async function exemplo4_Estatisticas() {
  try {
    const token = getAccessToken();
    if (!token) throw new Error('Token não disponível');

    const response = await spotifyService.getUserTopTracks(token, 'long_term', 50);
    const items = response.items;

    console.log('\n📊 ESTATÍSTICAS DOS MEU TOP 50 TRACKS\n');
    
    console.log(`Total de tracks: ${items.length}`);
    console.log(`Popularidade média: ${getAveragePopularity(items)}%`);
    console.log(`Tempo total: ${getTotalDuration(items)}`);
    console.log(`Tracks com explicit content: ${getExplicitTracks(items).length}`);

    console.log('\n🎤 TOP ARTISTAS');
    const grouped = groupTracksByArtist(items);
    Object.entries(grouped)
      .sort(([, a], [, b]) => b.length - a.length)
      .slice(0, 10)
      .forEach(([artist, tracks]) => {
        console.log(`${artist}: ${tracks.length} música(s)`);
      });

  } catch (error) {
    console.error('Erro:', error);
  }
}

/**
 * Exemplo com tratamento de erros robusto
 */
export async function exemplo5_Robusto() {
  try {
    // 1. Verificar autenticação
    const token = getAccessToken();
    if (!token) {
      throw new Error('Usuário não autenticado');
    }

    // 2. Buscar com timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch('https://api.spotify.com/v1/me/top/tracks?limit=10', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Token inválido ou expirado');
      }
      if (response.status === 429) {
        throw new Error('Muitas requisições. Tente novamente em alguns momentos.');
      }
      throw new Error(`Erro ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Top tracks carregados com sucesso!');
    return data.items;

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('❌ Timeout: Requisição demorou muito');
      } else {
        console.error(`❌ Erro: ${error.message}`);
      }
    } else {
      console.error('❌ Erro desconhecido');
    }
  }
}

/*
COMO USAR:

1. Para entender o básico:
   await exemplo1_Simples();

2. Para ver todos os detalhes:
   await exemplo2_Detalhado();

3. Para usar em componente:
   import { TopTracksExample } from '@/utils/top-tracks-example';
   <TopTracksExample />

4. Para analisar estatísticas:
   await exemplo4_Estatisticas();

5. Para produção com tratamento robusto:
   await exemplo5_Robusto();
*/
