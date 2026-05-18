import type { SpotifyUser } from '@/types/spotify';
import { countryCodeToName } from '@/utils/auth';

interface UserProfileProps {
  user: SpotifyUser;
}

export function UserProfile({ user }: UserProfileProps) {
  const countryName = countryCodeToName(user?.country);

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
          <h1 className="text-4xl font-bold">Bem vindo, {user?.display_name || 'Usuário'}</h1>
          {countryName && <p className="text-gray-400">{countryName}</p>}
          <p className="text-gray-400">Spotify ID: {user?.id}</p>
        </div>
      </div>
    </div>
  );
}
