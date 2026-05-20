# Guia de Acesso à API Spotify com Access Token

## Visão Geral

O Access Token é uma string que contém as credenciais e permissões necessárias para acessar recursos da API do Spotify (artistas, álbuns, tracks) ou dados do usuário (perfil, playlists).

### Características do Token
- **Formato**: String codificada em base64
- **Validade**: 3600 segundos (1 hora)
- **Header Obrigatório**: `Authorization: Bearer <access_token>`
- **Renovação**: Use o refresh token após expiração

---

## Implementação

### 1. Obter o Access Token

O token é obtido após o usuário fazer login via Spotify OAuth:

```typescript
// No callback da autenticação (app/api/auth/callback/route.ts)
const token = await spotifyService.exchangeCodeForToken(code);
const user = await spotifyService.getUserProfile(token.access_token);

// Armazenar o token de forma segura
storeAuth(token.access_token, user, token.expires_in, token.refresh_token);
```

### 2. Usar o Token em Requisições

Todos os métodos da `SpotifyService` já incluem automaticamente o header de autorização:

```typescript
// O token é adicionado automaticamente ao header
const topTracks = await spotifyService.getUserTopTracks(accessToken, 'medium_term', 50);
// Header enviado: Authorization: Bearer <accessToken>
```

### 3. Criar Header de Autorização Manualmente

Se precisar fazer uma requisição customizada:

```typescript
import { createAuthorizationHeader } from '@/utils/auth';

const headers = createAuthorizationHeader(accessToken);
// Retorna: { 'Authorization': 'Bearer <token>', 'Content-Type': 'application/json' }

const response = await fetch('https://api.spotify.com/v1/me/top/tracks', {
  headers: headers,
});
```

---

## Formato do Header

### Correto ✅
```
Authorization: Bearer NgCXRK...MzYjw
Content-Type: application/json
```

### Incorreto ❌
```
Authorization: NgCXRK...MzYjw  // Falta "Bearer"
Authorization: bearer NgCXRK...MzYjw  // 'bearer' deve ser maiúsculo
```

---

## Gerenciamento do Token

### Armazenamento
- **AccessToken**: `sessionStorage` (sessão do usuário)
- **RefreshToken**: `localStorage` (persistência entre abas)
- **ExpiresAt**: `sessionStorage` (timestamp de expiração)

### Validação

```typescript
import { getAccessToken, isTokenExpired, isTokenNearExpiration } from '@/utils/auth';

// Obter token válido
const token = getAccessToken();

// Verificar se está expirado
if (isTokenExpired(expiresAt)) {
  // Renovar token
  await refreshToken();
}

// Verificar se está próximo de expirar (< 5 min)
if (isTokenNearExpiration()) {
  // Renovar proativamente
  await refreshToken();
}

// Tempo restante
const minutesLeft = getTokenExpirationMinutes();
console.log(`Token expira em ${minutesLeft} minutos`);
```

---

## Renovação do Token

Quando o token expira, use o refresh token para obter um novo:

```typescript
import { spotifyService } from '@/services/spotify';
import { storeAuth } from '@/utils/auth';

async function refreshAccessToken(refreshToken: string) {
  const newToken = await spotifyService.refreshAccessToken(refreshToken);
  
  // Armazenar o novo token
  storeAuth(
    newToken.access_token,
    userProfile, // mantém o perfil anterior
    newToken.expires_in,
    newToken.refresh_token
  );
  
  return newToken.access_token;
}
```

---

## Exemplos de Uso

### Buscar Top Tracks
```typescript
import { spotifyService } from '@/services/spotify';
import { getAccessToken } from '@/utils/auth';

export async function fetchTopTracks() {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('Token de acesso não disponível');
  }
  
  // Header "Authorization: Bearer <token>" é adicionado automaticamente
  const tracks = await spotifyService.getUserTopTracks(token, 'medium_term', 50);
  return tracks;
}
```

### Buscar Playlists
```typescript
export async function fetchUserPlaylists() {
  const token = getAccessToken();
  
  if (!token) {
    throw new Error('Token expirou. Faça login novamente.');
  }
  
  const playlists = await spotifyService.getUserPlaylists(token, 50);
  return playlists;
}
```

### Requisição Customizada
```typescript
import { createAuthorizationHeader } from '@/utils/auth';

async function getCustomEndpoint(accessToken: string) {
  const headers = createAuthorizationHeader(accessToken);
  
  const response = await fetch('https://api.spotify.com/v1/me/shows', {
    headers,
  });
  
  return response.json();
}
```

---

## Segurança

⚠️ **Nunca compartilhe o Access Token publicamente!**

### Boas Práticas
- ✅ Armazene em `sessionStorage` (apenas na sessão atual)
- ✅ Use o refresh token para renovação
- ✅ Valide a expiração antes de usar
- ✅ Limpe os tokens ao fazer logout
- ❌ Não exponha em URLs
- ❌ Não commit em Git
- ❌ Não envie em logs publicamente

---

## Ciclo de Vida do Token

```
1. Login do Usuário
        ↓
2. Spotify retorna: access_token + refresh_token + expires_in
        ↓
3. Armazenar token com expiração
        ↓
4. Usar token em requisições à API (Bearer <token>)
        ↓
5. Token válido por 3600 segundos (1 hora)
        ↓
6. Quando próximo a expirar:
   - Usar refresh_token para obter novo access_token
   - Atualizar armazenamento
        ↓
7. Logout: Limpar todos os tokens
```

---

## Scopes Configurados

O app solicita os seguintes scopes:
- `user-read-private` - Dados privados do perfil
- `user-read-email` - Email do usuário
- `user-top-read` - Top tracks e artistas
- `playlist-read-private` - Playlists privadas
- `playlist-read-collaborative` - Playlists colaborativas
- `user-read-recently-played` - Músicas tocadas recentemente

---

## Referências

- [Spotify Web API - Authorization](https://developer.spotify.com/documentation/general/guides/authorization/)
- [Spotify Web API - Access Token](https://developer.spotify.com/documentation/general/guides/authorization/code-flow/)
- [OAuth 2.0 Bearer Token Usage](https://tools.ietf.org/html/rfc6750)
