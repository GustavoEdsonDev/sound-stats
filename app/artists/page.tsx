'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { spotifyService } from '@/services/spotify';
import { useEffect, useState } from 'react';
import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ArtistCard } from '@/components/ArtistCard';

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
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topArtists.map((artist, index) => (
              <ArtistCard key={artist.id} artist={artist} index={index} />
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
      <ArtistsContent />
    </ProtectedRoute>
  );
}
