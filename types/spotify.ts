import { z } from 'zod';

// Spotify OAuth
export const SpotifyTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
  refresh_token: z.string().optional(),
  scope: z.string().optional(),
});

export type SpotifyToken = z.infer<typeof SpotifyTokenSchema>;

// Spotify User Profile
export const SpotifyUserSchema = z.object({
  id: z.string(),
  display_name: z.string().nullable(),
  email: z.string().optional(),
  external_urls: z.object({
    spotify: z.string(),
  }),
  followers: z.object({
    href: z.string().nullable(),
    total: z.number(),
  }),
  href: z.string(),
  images: z.array(
    z.object({
      height: z.number().nullable(),
      url: z.string(),
      width: z.number().nullable(),
    })
  ),
  uri: z.string(),
  explicit_content: z
    .object({
      filter_content: z.boolean().optional(),
      show_content: z.boolean().optional(),
    })
    .optional(),
  product: z.string().optional(),
  country: z.string().optional(),
});

export type SpotifyUser = z.infer<typeof SpotifyUserSchema>;

// Auth Response
export const AuthResponseSchema = z.object({
  user: SpotifyUserSchema,
  token: SpotifyTokenSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Spotify Artist
export const SpotifyArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
  href: z.string(),
  external_urls: z.object({
    spotify: z.string(),
  }),
  genres: z.array(z.string()).optional(),
  images: z.array(
    z.object({
      height: z.number().nullable(),
      url: z.string(),
      width: z.number().nullable(),
    })
  ).optional(),
  popularity: z.number().optional(),
  uri: z.string(),
});

export type SpotifyArtist = z.infer<typeof SpotifyArtistSchema>;

// Spotify Track
export const SpotifyTrackSchema = z.object({
  id: z.string(),
  name: z.string(),
  href: z.string(),
  uri: z.string(),
  external_urls: z.object({
    spotify: z.string(),
  }),
  artists: z.array(SpotifyArtistSchema),
  album: z.object({
    id: z.string(),
    name: z.string(),
    href: z.string(),
    release_date: z.string().optional(),
    images: z.array(
      z.object({
        height: z.number().nullable(),
        url: z.string(),
        width: z.number().nullable(),
      })
    ).optional(),
    external_urls: z.object({
      spotify: z.string(),
    }),
  }).optional(),
  duration_ms: z.number(),
  explicit: z.boolean().optional(),
  popularity: z.number().optional(),
  preview_url: z.string().nullable().optional(),
});

export type SpotifyTrack = z.infer<typeof SpotifyTrackSchema>;

// Spotify Top Tracks Response
export const SpotifyTopTracksResponseSchema = z.object({
  items: z.array(SpotifyTrackSchema),
  total: z.number().optional(),
  limit: z.number().optional(),
  offset: z.number().optional(),
  href: z.string().optional(),
  next: z.string().nullable().optional(),
  previous: z.string().nullable().optional(),
});

export type SpotifyTopTracksResponse = z.infer<typeof SpotifyTopTracksResponseSchema>;
