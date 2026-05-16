import type { SpotifyUser } from '@/types/spotify';

interface UserProfileProps {
  user: SpotifyUser;
}

export function UserProfile({ user }: UserProfileProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        {user?.images && user.images.length > 0 && (
          <img
            src={user.images[0].url}
            alt={user.display_name || 'User avatar'}
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h1 className="text-4xl font-bold">Welcome, {user?.display_name || 'User'}</h1>
          <p className="text-gray-400">Spotify ID: {user?.id}</p>
        </div>
      </div>
    </div>
  );
}
