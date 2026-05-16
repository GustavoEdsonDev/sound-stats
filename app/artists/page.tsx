'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { spotifyService } from '@/services/spotify';
import { useEffect, useState } from 'react';

function ArtistsContent() {
  const { token } = useAuth();
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'long_term' | 'medium_term' | 'short_term'>('medium_term');

  useEffect(() => {
    if (!token?.access_token) return;

    const fetchTopArtists = async () => {
      setIsLoading(true);
      try {
        const response = await spotifyService.getUserTopArtists(token.access_token, timeRange, 50);
        setTopArtists(response.items || []);
      } catch (error) {
        console.error('Failed to fetch top artists:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopArtists();
  }, [token, timeRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Your Top Artists</h1>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
          >
            <option value="short_term">Last 4 Weeks</option>
            <option value="medium_term">Last 6 Months</option>
            <option value="long_term">All Time</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-green-500 border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topArtists.map((artist, index) => (
              <div key={artist.id} className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition">
                {artist.images?.[0] && (
                  <img src={artist.images[0].url} alt={artist.name} className="w-full h-48 object-cover" />
                )}
                <div className="p-4">
                  <p className="text-gray-400 text-sm">#{index + 1}</p>
                  <p className="font-semibold text-lg mb-2">{artist.name}</p>
                  <p className="text-gray-400 text-sm mb-2">Popularity: {artist.popularity}%</p>
                  <p className="text-gray-400 text-sm">{artist.genres?.slice(0, 2).join(', ')}</p>
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

export default function Artists() {
  return (
    <ProtectedRoute>
      <ArtistsContent />
    </ProtectedRoute>
  );
}
