# Spotify Authentication Setup

## Overview

This project uses Zod for schema validation and integrates with Spotify's OAuth2 API for authentication.

## Architecture

### Files Created:

**Types & Validation:**
- `types/spotify.ts` - Zod schemas for Spotify API responses

**Services:**
- `services/spotify.ts` - SpotifyService class for OAuth and API calls

**API Routes:**
- `app/api/auth/spotify-auth-url/route.ts` - Generate OAuth authorization URL
- `app/api/auth/login/route.ts` - Handle OAuth callback and token exchange

**Components & Hooks:**
- `components/ProtectedRoute.tsx` - Route protection wrapper
- `hooks/useAuth.ts` - Custom hook for auth state management

**Pages:**
- `app/login/page.tsx` - Login page with Spotify integration
- `app/dashboard/page.tsx` - Protected dashboard showing user profile

## Setup Instructions

### 1. Create Spotify Developer Application

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in or create a Spotify account
3. Create a new application
4. Accept terms and create the app
5. You'll receive:
   - Client ID
   - Client Secret
   - You need to set the Redirect URI

### 2. Configure Environment Variables

Create a `.env.local` file (already created for you):

```env
NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
NEXT_PUBLIC_SPOTIFY_REDIRECT_URI=http://localhost:3000/login
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

### 3. Set Redirect URI in Spotify Dashboard

In your Spotify app settings, add the redirect URI:
- For development: `http://localhost:3000/login`
- For production: `https://yourdomain.com/login`

### 4. Scopes Requested

The app requests the following Spotify scopes:
- `user-read-private` - Read user private info
- `user-read-email` - Read user email
- `user-top-read` - Read user's top artists/tracks
- `playlist-read-private` - Read private playlists
- `playlist-read-collaborative` - Read collaborative playlists

## Authentication Flow

1. User clicks "Conectar com Spotify" on login page
2. Redirected to Spotify authorization page
3. User grants permissions
4. Spotify redirects to `/login?code=AUTH_CODE`
5. Frontend exchanges code for access token via `/api/auth/login`
6. Token and user data stored in sessionStorage
7. Redirected to dashboard

## Usage Examples

### Get Current User in Components

```typescript
import { useAuth } from '@/hooks/useAuth';

export function MyComponent() {
  const { user, token, isAuthenticated } = useAuth();
  
  if (isAuthenticated) {
    return <p>Welcome, {user?.display_name}</p>;
  }
  return <p>Please log in</p>;
}
```

### Get User Top Tracks

```typescript
import { spotifyService } from '@/services/spotify';

const topTracks = await spotifyService.getUserTopTracks(
  accessToken,
  'medium_term', // 'long_term', 'medium_term', 'short_term'
  50 // limit
);
```

### Get User Top Artists

```typescript
const topArtists = await spotifyService.getUserTopArtists(
  accessToken,
  'medium_term',
  50
);
```

### Get User Playlists

```typescript
const playlists = await spotifyService.getUserPlaylists(accessToken, 50);
```

## Data Validation

All API responses are validated using Zod schemas:

```typescript
import { SpotifyTokenSchema, SpotifyUserSchema } from '@/types/spotify';

// These will throw if data doesn't match schema
const validToken = SpotifyTokenSchema.parse(spotifyResponse);
const validUser = SpotifyUserSchema.parse(userResponse);
```

## Security Notes

1. **Never expose Client Secret** - Keep it server-side only
2. **Access Token in SessionStorage** - Lost on page refresh; for production consider refresh tokens
3. **CORS** - All Spotify API calls go through your backend to avoid CORS issues
4. **Environment Variables** - Use NEXT_PUBLIC_ only for public values

## Troubleshooting

### "Missing Spotify configuration" Error
- Check that `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` and `NEXT_PUBLIC_SPOTIFY_REDIRECT_URI` are set in `.env.local`
- Restart the dev server after adding env variables

### "Redirect URI mismatch"
- Ensure the redirect URI in `.env.local` matches exactly what's set in Spotify Dashboard
- Default: `http://localhost:3000/login`

### Token Not Persisting
- Check browser's sessionStorage is enabled
- Check browser console for errors
- Verify API response contains valid token

## Next Steps

1. Implement `/tracks`, `/artists`, `/playlists` pages using `useAuth()` hook
2. Add pagination for API results
3. Implement token refresh mechanism for longer sessions
4. Add loading states and error boundaries
5. Style pages with Tailwind CSS
