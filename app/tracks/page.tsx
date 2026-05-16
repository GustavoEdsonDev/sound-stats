'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { spotifyService } from '@/services/spotify';
import { useEffect, useState } from 'react';

function TracksContent() {
  const { token } = useAuth();
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'long_term' | 'medium_term' | 'short_term'>('medium_term');

  useEffect(() => {
    if (!token?.access_token) return;

    const fetchTopTracks = async () => {
      setIsLoading(true);
      try {
        const response = await spotifyService.getUserTopTracks(token.access_token, timeRange, 50);
        setTopTracks(response.items || []);
      } catch (error) {
        console.error('Failed to fetch top tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopTracks();
  }, [token, timeRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Your Top Tracks</h1>
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
          <div className="space-y-2">
            {topTracks.map((track, index) => (
              <div key={track.id} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition flex items-center gap-4">
                <div className="text-gray-400 font-semibold w-8">{index + 1}</div>
                {track.album?.images?.[0] && (
                  <img src={track.album.images[0].url} alt={track.name} className="w-12 h-12 rounded" />
                )}
                <div className="flex-1">
                  <p className="font-semibold">{track.name}</p>
                  <p className="text-gray-400 text-sm">{track.artists?.map((a: any) => a.name).join(', ')}</p>
                </div>
                <p className="text-gray-400">{Math.floor(track.duration_ms / 60000)}:{Math.floor((track.duration_ms % 60000) / 1000).toString().padStart(2, '0')}</p>
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

export default function Tracks() {
  return (
    <ProtectedRoute>
      <TracksContent />
    </ProtectedRoute>
  );
}
