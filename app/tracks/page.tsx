'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { spotifyService } from '@/services/spotify';
import { useEffect, useState } from 'react';
import { TimeRangeSelector } from '@/components/TimeRangeSelector';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TrackCard } from '@/components/TrackCard';

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
        console.error('Falha ao buscar músicas top:', error);
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
          <h1 className="text-4xl font-bold">Suas Músicas Top</h1>
          <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-2">
            {topTracks.map((track, index) => (
              <TrackCard key={track.id} track={track} index={index} />
            ))}
          </div>
        )}

        <a href="/dashboard" className="inline-block mt-8 bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition">
          Voltar ao Painel
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
