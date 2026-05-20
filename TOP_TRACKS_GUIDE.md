# Guia de Implementação: Top Tracks com OAuth 2.0

Este guia demonstra como buscar e processar os top tracks do usuário usando a API Spotify com autenticação OAuth 2.0.

## Visão Geral

A API do Spotify permite buscar as músicas mais ouvidas do usuário em diferentes períodos:
- `long_term` - Meses (recomendado para análise geral)
- `medium_term` - Semanas (tendências recentes)
- `short_term` - Dias (últimas descobertas)

---

## Implementação Básica

### 1. Obter o Token de Acesso

```typescript
import { getAccessToken } from '@/utils/auth';

const token = getAccessToken();

if (!token) {
  throw new Error('Token expirado. Faça login novamente.');
}
```

### 2. Buscar Top Tracks

```typescript
import { spotifyService } from '@/services/spotify';

async function getTopTracks() {
  const token = getAccessToken();
  
  // Buscar top 5 tracks de longo termo
  const response = await spotifyService.getUserTopTracks(
    token,
    'long_term',  // time_range: long_term | medium_term | short_term
    5             // limit: máximo 50
  );

  return response.items;
}

const topTracks = await getTopTracks();
```

### 3. Formatar para Exibição

#### Exemplo 1: Lista Simples (conforme o exemplo do Spotify)

```typescript
import { formatTopTracks } from '@/utils/spotifyFormatter';

const topTracks = await spotifyService.getUserTopTracks(token, 'long_term', 5);
const formatted = formatTopTracks(topTracks.items);

console.log(formatted);
// Saída:
// [
//   "Blinding Lights by The Weeknd",
//   "Heat Waves by Glass Animals",
//   "As It Was by Harry Styles",
//   "Levitating by Dua Lipa",
//   "Anti-Hero by Taylor Swift"
// ]
```

#### Exemplo 2: Informações Detalhadas

```typescript
import { getTrackDetails } from '@/utils/spotifyFormatter';

topTracks.items.forEach(track => {
  const details = getTrackDetails(track);
  
  console.log(`
    Música: ${details.name}
    Artista: ${details.artists.join(', ')}
    Álbum: ${details.album}
    Duração: ${details.duration}
    Popularidade: ${details.popularity}%
  `);
});
```

#### Exemplo 3: Agrupar por Artista

```typescript
import { groupTracksByArtist } from '@/utils/spotifyFormatter';

const grouped = groupTracksByArtist(topTracks.items);

Object.entries(grouped).forEach(([artist, tracks]) => {
  console.log(`${artist}: ${tracks.length} música(s)`);
  tracks.forEach(t => console.log(`  - ${t.name}`));
});

// Saída:
// The Weeknd: 3 música(s)
//   - Blinding Lights
//   - Starboy
//   - Save Your Tears
// Harry Styles: 2 música(s)
//   - As It Was
//   - Music For A Sushi Restaurant
```

---

## Uso em Componentes React

### Exemplo: Top Tracks Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { spotifyService } from '@/services/spotify';
import { formatTopTracks, getAveragePopularity, getTotalDuration } from '@/utils/spotifyFormatter';
import type { SpotifyTopTracksResponse } from '@/types/spotify';

export default function TopTracksPage() {
  const { token, isAuthenticated } = useAuth();
  const [topTracks, setTopTracks] = useState<SpotifyTopTracksResponse | null>(null);
  const [timeRange, setTimeRange] = useState<'long_term' | 'medium_term' | 'short_term'>('medium_term');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !token?.access_token) return;

    const fetchTopTracks = async () => {
      setIsLoading(true);
      try {
        const response = await spotifyService.getUserTopTracks(
          token.access_token,
          timeRange,
          50
        );
        setTopTracks(response);
      } catch (error) {
        console.error('Erro ao buscar top tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopTracks();
  }, [token, timeRange, isAuthenticated]);

  if (!isAuthenticated) {
    return <div>Faça login para ver seus top tracks</div>;
  }

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  if (!topTracks || topTracks.items.length === 0) {
    return <div>Nenhum top track encontrado</div>;
  }

  const formatted = formatTopTracks(topTracks.items);
  const avgPopularity = getAveragePopularity(topTracks.items);
  const duration = getTotalDuration(topTracks.items);

  return (
    <div>
      <h1>Meus Top Tracks</h1>
      
      <div>
        <label>Período:</label>
        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value as any)}
        >
          <option value="short_term">Últimas 4 semanas</option>
          <option value="medium_term">Últimos 6 meses</option>
          <option value="long_term">Todo o tempo</option>
        </select>
      </div>

      <div className="stats">
        <p>Total de tracks: {topTracks.items.length}</p>
        <p>Popularidade média: {avgPopularity}%</p>
        <p>Tempo total: {duration}</p>
      </div>

      <ol>
        {formatted.map((track, index) => (
          <li key={index}>{track}</li>
        ))}
      </ol>
    </div>
  );
}
```

---

## Requisição Raw (sem SDK)

Se preferir fazer a requisição manualmente:

```typescript
const token = 'seu_access_token';

async function fetchWebApi(endpoint: string, method: string = 'GET', body?: any) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    method,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status}`);
  }

  return res.json();
}

async function getTopTracks() {
  return (await fetchWebApi(
    'v1/me/top/tracks?time_range=long_term&limit=5',
    'GET'
  )).items;
}

const topTracks = await getTopTracks();
console.log(
  topTracks.map(
    ({ name, artists }) =>
      `${name} by ${artists.map(artist => artist.name).join(', ')}`
  )
);
```

---

## Parâmetros Disponíveis

| Parâmetro | Valores | Padrão | Descrição |
|-----------|---------|--------|-----------|
| `time_range` | `long_term` \| `medium_term` \| `short_term` | `medium_term` | Período de análise |
| `limit` | 1-50 | 20 | Número de resultados |
| `offset` | 0+ | 0 | Deslocamento para paginação |

---

## Estrutura de Resposta

```typescript
{
  items: [
    {
      id: "string",
      name: "Track Name",
      artists: [
        {
          id: "string",
          name: "Artist Name"
        }
      ],
      album: {
        name: "Album Name",
        images: [
          {
            url: "string", // URL da capa
            height: 640,
            width: 640
          }
        ]
      },
      duration_ms: 245000,
      popularity: 85,
      explicit: false,
      external_urls: {
        spotify: "https://open.spotify.com/track/..."
      }
    }
  ],
  total: 100,
  limit: 5,
  offset: 0
}
```

---

## Casos de Uso

### Dashboard
- Mostrar os 5 top tracks com capas de álbum
- Exibir popularidade e duração
- Link direto para Spotify

### Análise
- Agrupar por artista
- Calcular estatísticas (popularidade média, duração total)
- Filtrar por período

### Recomendações
- Usar artistas dos top tracks para sugerir novas músicas
- Analisar gêneros

### Exportação
- Gerar lista para copiar/compartilhar
- Exportar para CSV
- Criar playlist automática

---

## Limitações da API

⚠️ Coisas que **NÃO** são possíveis:

- ❌ Não consegue buscar todas as músicas ouvidas (apenas top e recently played)
- ❌ Não consegue modificar preferências (apenas leitura)
- ❌ Histórico limitado aos últimos ~50 itens em recently-played
- ❌ Dados agregados do usuário não expostos diretamente

✅ Coisas que **SÃO** possíveis:

- ✅ Top tracks em diferentes períodos (semanas, meses, tudo)
- ✅ Top artistas
- ✅ Playlists do usuário
- ✅ Músicas tocadas recentemente
- ✅ Detalhes completos (popularidade, artistas, álbuns)
- ✅ Imagens e URLs de preview

---

## Referências

- [Spotify Web API - Get User's Top Tracks](https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks)
- [Spotify Web API - Track Object](https://developer.spotify.com/documentation/web-api/reference/get-track)
- [OAuth 2.0 Authorization](https://developer.spotify.com/documentation/general/guides/authorization/code-flow/)
