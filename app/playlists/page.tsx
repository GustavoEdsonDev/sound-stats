'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { spotifyService } from '@/services/spotify';
import { useEffect, useState } from 'react';

function PlaylistsContent() {
  const { token } = useAuth();
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token?.access_token) return;

    const fetchPlaylists = async () => {
      setIsLoading(true);
      try {
        const response = await spotifyService.getUserPlaylists(token.access_token, 50);
        setPlaylists(response.items || []);
      } catch (error) {
        console.error('Failed to fetch playlists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Playlists</h1>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {playlists.map((playlist) => (
              <div key={playlist.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition">
                {playlist.images?.[0] && (
                  <img src={playlist.images[0].url} alt={playlist.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <p className="font-semibold text-lg mb-2">{playlist.name}</p>
                  <p className="text-gray-400 text-sm mb-2">{playlist.tracks?.total || 0} tracks</p>
                  <p className="text-gray-400 text-sm line-clamp-2">{playlist.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <a href="/dashboard" className="inline-block mt-8 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition">
          Back to Dashboard
        </a>
      </div>
    </div>
  );
}

export default function Playlists() {
  return (
    <ProtectedRoute>
      <PlaylistsContent />
    </ProtectedRoute>
  );
}
