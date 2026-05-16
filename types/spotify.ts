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
});

export type SpotifyUser = z.infer<typeof SpotifyUserSchema>;

// Auth Response
export const AuthResponseSchema = z.object({
  user: SpotifyUserSchema,
  token: SpotifyTokenSchema,
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
