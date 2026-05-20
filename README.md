# 📊 Sound Stats - Documentação Completa

## 📋 Índice
1. [Visão Geral](#visão-geral)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Estrutura do Projeto](#estrutura-do-projeto)
4. [Configuração e Setup](#configuração-e-setup)
5. [Fluxo de Autenticação](#fluxo-de-autenticação)
6. [Componentes](#componentes)
7. [Páginas](#páginas)
8. [Services e Utilities](#services-e-utilities)
9. [Tipos e Schemas](#tipos-e-schemas)
10. [Deployment](#deployment)

---

## 🎯 Visão Geral

**Sound Stats** é uma aplicação web que permite aos usuários visualizar e analisar suas estatísticas de música no Spotify. A aplicação integra-se com a Spotify Web API para fornecer dados sobre as músicas mais tocadas, artistas favoritos, playlists e histórico recente.

### Funcionalidades Principais
- 🔐 Autenticação OAuth 2.0 com Spotify
- 📊 Dashboard com estatísticas personalizadas
- 🎵 Visualização de top tracks com gráficos de popularidade
- 🎤 Visualização de top artistas com gráficos de pizza
- 📅 Histórico de músicas tocadas recentemente
- 🕐 Exibição de timestamps de quando as músicas foram tocadas
- 📱 Interface responsiva com Tailwind CSS
- 📈 Gráficos interativos com Recharts

---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16.2.6** - Framework React com Turbopack
- **React 19.2.4** - Biblioteca UI
- **TypeScript 5** - Tipagem estática
- **Tailwind CSS 4** - Estilização utilitária
- **Recharts 3.8.1** - Biblioteca de gráficos

### Backend
- **Next.js API Routes** - Endpoints serverless
- **Node.js** - Runtime JavaScript

### Validação e Schema
- **Zod 4.4.3** - Validação de tipos em runtime
- **TypeScript Zod Inference** - Type safety com Zod

### Autenticação
- **Spotify Web API** - OAuth 2.0
- **Session Storage** - Armazenamento de tokens
- **Local Storage** - Armazenamento de refresh tokens

### Linting
- **ESLint 9** - Análise estática de código

### Deployment
- **Vercel** - Plataforma de hosting
- **GitHub** - Repositório e CI/CD

---

## 📁 Estrutura do Projeto

```
sound-stats/
├── app/
│   ├── layout.tsx              # Layout raiz com meta tags
│   ├── page.tsx                # Página inicial (redirecionamento)
│   ├── globals.css             # Estilos globais
│   ├── api/
│   │   └── auth/
│   │       ├── callback/route.ts       # Callback OAuth
│   │       └── spotify-auth-url/route.ts # Gerador de URL OAuth
│   ├── login/
│   │   └── page.tsx            # Página de login
│   ├── dashboard/
│   │   └── page.tsx            # Dashboard principal
│   ├── tracks/
│   │   └── page.tsx            # Página de top tracks
│   ├── artists/
│   │   └── page.tsx            # Página de top artistas
│   ├── playlists/
│   │   └── page.tsx            # Página de playlists
│   └── recently-played/
│       └── page.tsx            # Página de histórico recente
├── components/
│   ├── ProtectedRoute/         # HOC para rotas protegidas
│   ├── UserProfile/            # Exibição do perfil do usuário
│   ├── LogoutButton/           # Botão de logout
│   ├── LoadingSpinner/         # Spinner de carregamento
│   ├── StatCard/               # Card de estatísticas
│   ├── TrackCard/              # Card de música
│   ├── PlaylistCard/           # Card de playlist
│   ├── ArtistCard/             # Card de artista
│   ├── PopularityChart/        # Gráfico de popularidade de tracks
│   ├── ArtistsChart/           # Gráfico de artistas (pie chart)
│   └── TimeRangeSelector/      # Seletor de período
├── hooks/
│   └── useAuth.ts              # Hook de autenticação
├── services/
│   └── spotify.ts              # Serviço de integração Spotify
├── types/
│   └── spotify.ts              # Tipos e schemas Zod
├── utils/
│   └── auth.ts                 # Utilities de autenticação
├── public/                     # Arquivos estáticos
├── certificates/               # Certificados SSL (dev)
├── package.json                # Dependências
├── tsconfig.json               # Configuração TypeScript
├── next.config.ts              # Configuração Next.js
├── eslint.config.mjs           # Configuração ESLint
├── tailwind.config.ts          # Configuração Tailwind
├── postcss.config.mjs          # Configuração PostCSS
├── DOCUMENTATION.md            # Esta documentação
├── SPOTIFY_AUTH_SETUP.md       # Guia de setup OAuth
└── AGENTS.md                   # Configurações de agentes
```

---

## ⚙️ Configuração e Setup

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta Spotify (gratuita ou premium)
- Credenciais da Spotify Developer Application

### Instalação Local

1. **Clone o repositório**
```bash
git clone https://github.com/GustavoEdsonDev/sound-stats.git
cd sound-stats
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
Crie um arquivo `.env.local` na raiz do projeto:
```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=seu_client_id_aqui
SPOTIFY_CLIENT_SECRET=seu_client_secret_aqui
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/api/auth/login
```

4. **Execute em desenvolvimento**
```bash
npm run dev
```

5. **Acesse a aplicação**
Abra [http://localhost:3000](http://localhost:3000) no navegador.

### Obtenção de Credenciais Spotify

1. Vá para [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Crie uma nova aplicação
3. Aceite os termos e crie a app
4. Na seção "Authentication", copie seu `Client ID` e `Client Secret`
5. Configure o `Redirect URI` como: `http://localhost:3000/api/auth/login`

Para instruções detalhadas, veja [SPOTIFY_AUTH_SETUP.md](SPOTIFY_AUTH_SETUP.md)

---

## 🔐 Fluxo de Autenticação

### OAuth 2.0 Flow

```
┌─────────────┐
│   Usuário   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────────┐
│ 1. Clica em "Login com Spotify" (/login)    │
└──────────────┬──────────────────────────────┘
               │
               ▼
    ┌──────────────────────────────────┐
    │ 2. getAuthorizationUrl()         │
    │    Gera URL de autorização      │
    └──────────────┬───────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────────┐
    │ 3. Redireciona para Spotify (/authorize)    │
    │    com client_id, redirect_uri, scope       │
    └──────────────┬───────────────────────────────┘
                   │
                   ▼ (usuário autoriza)
    ┌──────────────────────────────────────────────┐
    │ 4. Spotify redireciona para /api/auth/login
    │    com código de autorização                 │
    └──────────────┬───────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────────┐
    │ 5. exchangeCodeForToken()                    │
    │    Troca código por access_token             │
    └──────────────┬───────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────────┐
    │ 6. getUserProfile()                          │
    │    Busca dados do usuário autenticado        │
    └──────────────┬───────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────────┐
    │ 7. storeAuth()                               │
    │    Armazena token e user no sessionStorage   │
    └──────────────┬───────────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────────┐
    │ 8. Redireciona para /dashboard               │
    │    Usuário autenticado                       │
    └──────────────────────────────────────────────┘
```

### Armazenamento de Tokens

**SessionStorage** (perdido ao fechar a aba):
- `auth_access_token` - Token de acesso
- `auth_expires_at` - Timestamp de expiração
- `auth_user` - Dados do usuário (JSON)

**LocalStorage** (persiste):
- `auth_refresh_token` - Token para renovação

### Verificação de Expiração

O hook `useAuth` verifica a expiração do token a cada minuto:
- Se expirado, chama `clearAuth()` e faz logout automático
- Se válido, continua usando o token atual
- Possibilidade futura de implementar refresh automático

---

## 🧩 Componentes

### ProtectedRoute
**Arquivo**: `components/ProtectedRoute/index.tsx`
**Propósito**: HOC que protege rotas de usuários não autenticados
**Props**:
- `children`: Conteúdo a renderizar se autenticado

**Comportamento**:
- Se não autenticado: Redireciona para `/login`
- Se autenticado: Renderiza os children

### UserProfile
**Arquivo**: `components/UserProfile/index.tsx`
**Propósito**: Exibe informações do perfil do usuário
**Props**:
- `user: SpotifyUser` - Dados do usuário Spotify

**Exibe**:
- Foto de perfil
- Nome de exibição
- Tipo de conta
- Número de seguidores

### LogoutButton
**Arquivo**: `components/LogoutButton/index.tsx`
**Propósito**: Botão para fazer logout
**Props**:
- `onClick: () => void` - Função ao clicar

### LoadingSpinner
**Arquivo**: `components/LoadingSpinner/index.tsx`
**Propósito**: Indicador de carregamento animado

### StatCard
**Arquivo**: `components/StatCard/index.tsx`
**Propósito**: Card para exibir uma estatística
**Props**:
- `label: string` - Rótulo da estatística
- `value: string | number` - Valor a exibir

### TrackCard
**Arquivo**: `components/TrackCard/index.tsx`
**Propósito**: Card para exibir informações de uma música
**Props**:
- `track: Track` - Dados da música
- `playedAt?: string` - Data/hora da reprodução (ISO string)

**Exibe**:
- Capa do álbum
- Nome da música
- Artista(s)
- **Popularidade** (visualização com barra + percentual)
- **Timestamp relativo** da última reprodução (ex: "há 30m", "Ontem")

**Funções Helper**:
- `formatPlayedAt()`: Converte timestamp ISO para formato relativo português

### PlaylistCard
**Arquivo**: `components/PlaylistCard/index.tsx`
**Propósito**: Card para exibir informações de uma playlist
**Props**:
- `playlist: Playlist` - Dados da playlist

**Exibe**:
- Imagem da playlist
- Nome
- Quantidade de tracks

### ArtistCard
**Arquivo**: `components/ArtistCard/index.tsx`
**Propósito**: Card para exibir informações de um artista
**Props**:
- `artist: Artist` - Dados do artista

**Exibe**:
- Foto do artista
- Nome
- Gêneros
- Número de seguidores

### PopularityChart
**Arquivo**: `components/PopularityChart/index.tsx`
**Propósito**: Gráfico de barras da popularidade dos top tracks
**Props**:
- `tracks: Track[]` - Lista de tracks

**Funcionalidade**:
- Exibe até 10 tracks
- Eixo X: Nome do track
- Eixo Y: Valor de popularidade (0-100)
- **Fallback**: Se popularidade indefinida, usa valores decrescentes (100, 90, 80...)

### ArtistsChart
**Arquivo**: `components/ArtistsChart/index.tsx`
**Propósito**: Gráfico de pizza dos top artistas
**Props**:
- `artists: Artist[]` - Lista de artistas

**Funcionalidade**:
- Exibe até 8 artistas
- Cada fatia representa um artista
- Cores diferentes para cada artista
- **Fallback**: Se popularidade indefinida, usa valores decrescentes (80, 70, 60...)

### TimeRangeSelector
**Arquivo**: `components/TimeRangeSelector/index.tsx`
**Propósito**: Seletor de período de tempo
**Opções**:
- `long_term` - Todos os tempos (> 6 meses)
- `medium_term` - 6 meses
- `short_term` - 4 semanas

---

## 📄 Páginas

### /login
**Arquivo**: `app/login/page.tsx`
**Tipo**: Client Component
**Propósito**: Página de autenticação

**Funcionalidade**:
- Exibe botão de login via Spotify
- Gerencia o fluxo OAuth
- Armazena token e perfil após autorização
- Redireciona para `/dashboard` após login bem-sucedido
- Exibe loading spinner durante autenticação
- Trata e exibe erros

### /dashboard
**Arquivo**: `app/dashboard/page.tsx`
**Tipo**: Client Component com ProtectedRoute
**Propósito**: Dashboard principal com estatísticas

**Funcionalidade**:
- Protegida por autenticação
- Busca 3 dados em paralelo:
  - Top 10 tracks (medium_term)
  - Top 8 artistas (medium_term)
  - Top 50 playlists
- Exibe:
  - Perfil do usuário
  - Botão de logout
  - Cards de estatísticas (seguidores, tipo de conta, playlists)
  - Gráfico de popularidade de tracks
  - Gráfico de artistas em pizza

### /tracks
**Arquivo**: `app/tracks/page.tsx`
**Tipo**: Client Component com ProtectedRoute
**Propósito**: Exibição de top tracks

**Funcionalidade**:
- Lista top 50 tracks
- TimeRangeSelector para filtrar por período
- Grid de TrackCards com popularidade

### /artists
**Arquivo**: `app/artists/page.tsx`
**Tipo**: Client Component com ProtectedRoute
**Propósito**: Exibição de top artistas

**Funcionalidade**:
- Lista top 50 artistas
- TimeRangeSelector para filtrar por período
- Grid de ArtistCards

### /playlists
**Arquivo**: `app/playlists/page.tsx`
**Tipo**: Client Component com ProtectedRoute
**Propósito**: Exibição de playlists

**Funcionalidade**:
- Lista playlists do usuário
- Grid de PlaylistCards

### /recently-played
**Arquivo**: `app/recently-played/page.tsx`
**Tipo**: Client Component com ProtectedRoute
**Propósito**: Histórico de músicas tocadas recentemente

**Funcionalidade**:
- Exibe últimas 50 músicas tocadas
- TrackCards com `playedAt` prop
- Mostra quando cada música foi tocada (relativo)
- Exibe popularidade de cada track

---

## 🔌 Services e Utilities

### SpotifyService
**Arquivo**: `services/spotify.ts`
**Propósito**: Camada de integração com Spotify Web API
**Padrão**: Singleton

#### Métodos

**`getAuthorizationUrl(): string`**
- Gera URL de autorização do Spotify
- Inclui scopes necessários
- Retorna URL completa para redirecionamento

**`exchangeCodeForToken(code: string): Promise<SpotifyToken>`**
- Troca código de autorização por token de acesso
- Valida resposta com Zod
- Lança erro se falhar

**`refreshAccessToken(refreshToken: string): Promise<SpotifyToken>`**
- Renova token usando refresh token
- Implementado para uso futuro

**`getUserProfile(accessToken: string): Promise<SpotifyUser>`**
- Busca perfil do usuário autenticado
- Endpoint: `/me`

**`getUserTopTracks(accessToken, timeRange, limit)`**
- Busca top tracks do usuário
- `timeRange`: 'long_term' | 'medium_term' | 'short_term'
- `limit`: quantidade (padrão 50, máx 50)
- Retorna: `{ items: Track[], total: number, ... }`

**`getUserTopArtists(accessToken, timeRange, limit)`**
- Busca top artistas do usuário
- Parâmetros similares a getUserTopTracks
- Retorna: `{ items: Artist[], total: number, ... }`

**`getUserPlaylists(accessToken, limit)`**
- Busca playlists do usuário
- Retorna: `{ items: Playlist[], total: number, ... }`

**`getUserRecentlyPlayed(accessToken, limit)`**
- Busca músicas tocadas recentemente
- Endpoint: `/me/player/recently-played`
- **OBS**: Requer scope `user-read-recently-played`
- Retorna: `{ items: PlayHistoryItem[], total: number, ... }`

### Auth Utilities
**Arquivo**: `utils/auth.ts`
**Propósito**: Funções auxiliares de autenticação

**`storeAuth(accessToken, user, expiresIn, refreshToken?)`**
- Armazena token e perfil em session/local storage
- Calcula `expiresAt` como `now + (expiresIn * 1000)`

**`getStoredAuth(): AuthResponse | null`**
- Recupera auth armazenada
- Valida expiração
- Retorna null se expirada ou ausente

**`getAccessToken(): string | null`**
- Obtém token de acesso válido
- Retorna null se expirado

**`isTokenExpired(expiresAt: number): boolean`**
- Verifica se timestamp de expiração já passou

**`clearAuth()`**
- Remove todos os dados de autenticação do storage

### useAuth Hook
**Arquivo**: `hooks/useAuth.ts`
**Propósito**: Hook React para gerenciar estado de autenticação

**Estado Retornado**:
```typescript
{
  user: SpotifyUser | null,
  token: SpotifyToken | null,
  isLoading: boolean,
  logout: () => void,
  isAuthenticated: boolean
}
```

**Funcionalidade**:
- Inicializa auth do storage no mount
- Verifica expiração a cada minuto
- Auto-logout se token expirado
- Hook seguro para SSR (verifica `typeof window`)

---

## 🔤 Tipos e Schemas

**Arquivo**: `types/spotify.ts`

### SpotifyToken
```typescript
{
  access_token: string        // Token de acesso
  token_type: string          // "Bearer"
  expires_in: number          // Segundos até expiração
  refresh_token?: string      // Token para renovação
  scope?: string              // Scopes concedidos
}
```

### SpotifyUser
```typescript
{
  id: string                  // ID do usuário
  display_name: string | null // Nome de exibição
  email?: string              // Email
  external_urls: {
    spotify: string           // URL do perfil Spotify
  }
  followers: {
    total: number             // Número de seguidores
  }
  images: Array<{
    url: string               // URL da imagem
    height: number | null
    width: number | null
  }>
  product?: string            // Tipo de conta ("free", "premium")
  country?: string            // País
  // ... outros campos
}
```

### Track
```typescript
{
  id: string
  name: string
  artists: Array<{ name: string, id: string }>
  album: { 
    name: string, 
    images: Array<{ url: string, ... }>
  }
  popularity?: number         // 0-100
  duration_ms: number
  explicit: boolean
  uri: string
}
```

### Artist
```typescript
{
  id: string
  name: string
  images: Array<{ url: string, ... }>
  popularity?: number         // 0-100
  followers: { total: number }
  genres: string[]
  uri: string
}
```

### Playlist
```typescript
{
  id: string
  name: string
  images: Array<{ url: string, ... }>
  tracks: { total: number }
  owner: { display_name: string }
  uri: string
}
```

---

## 🚀 Deployment

### Deployment no Vercel

1. **Push para GitHub**
```bash
git push origin main
```

2. **Vercel faz deploy automático**
- Vercel detecta Next.js
- Executa `npm run build`
- Deploy em produção

3. **Configure variáveis de ambiente no Vercel**
- Acesse [Vercel Dashboard](https://vercel.com/dashboard)
- Vá para Settings → Environment Variables
- Adicione:
  ```
  NEXT_PUBLIC_SPOTIFY_CLIENT_ID=seu_client_id
  SPOTIFY_CLIENT_SECRET=seu_client_secret
  NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=https://seu-dominio.vercel.app/api/auth/login
  ```

4. **Atualize OAuth Redirect URI no Spotify**
- Vá para [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
- Na sua aplicação, adicione: `https://seu-dominio.vercel.app/api/auth/login`

### Build Vercel
```bash
npm run build
```

- Compila TypeScript
- Otimiza com Turbopack
- Cria `.next/` build
- Pronto para produção

### Monitoramento

**Ver logs de deployment:**
```bash
npx vercel logs [deployment-id]
```

**Inspecionar deployment:**
```bash
npx vercel inspect [deployment-id]
```

---

## 🐛 Troubleshooting

### "Insufficient client scope"
- **Causa**: Scopes necessários não configurados
- **Solução**: Verifique scopes em `SpotifyService.getAuthorizationUrl()`
  - Deve incluir: `user-read-recently-played` para histórico

### Token expirado
- **Causa**: Token com TTL de 1 hora expirou
- **Solução**: Auto-logout implementado. Usuário retorna para login
- **Futuro**: Implementar refresh automático

### CORS Error
- **Causa**: Requisição cross-origin bloqueada
- **Solução**: Todas as requisições Spotify passam por Next.js API (sem CORS issue)

### Build fail no Vercel
- **Causa**: Erros de tipo TypeScript
- **Solução**: 
  - Verificar com `npm run build` localmente
  - Corrigir tipos antes de push

---

## 📝 Notas Importantes

### Padrões de Código
- **Portuguese**: Todo código comentado em português
- **TypeScript**: Tipagem estrita em todos os arquivos
- **Server vs Client**: Usa `'use client'` onde necessário
- **Error Handling**: Try-catch com mensagens amigáveis

### Segurança
- ✅ Client Secret nunca é exposto ao frontend
- ✅ Tokens armazenados em sessionStorage (não cookies por enquanto)
- ✅ Validação com Zod em runtime
- ✅ Environment variables para credenciais

### Performance
- ✅ Requisições Spotify em paralelo (Promise.all)
- ✅ Lazy loading de componentes
- ✅ Otimização de imagens com Next.js
- ✅ Gráficos Recharts otimizados

### Limitações Atuais
- ⚠️ Sem refresh automático de token
- ⚠️ Sem cache persistente de dados
- ⚠️ Sem busca de músicas/artistas (API preparado mas não implementado no UI)
- ⚠️ Sem persistência entre abas

---

## 📚 Recursos Úteis

- [Spotify Web API Docs](https://developer.spotify.com/documentation/web-api)
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zod Documentation](https://zod.dev)
- [Recharts](https://recharts.org)

---

## 👤 Autor
Desenvolvido por Gustavo Edson

## 📄 Licença
Privado

---

**Última atualização**: Maio 2026
