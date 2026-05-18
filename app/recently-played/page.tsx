'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { spotifyService } from '@/services/spotify';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { TrackCard } from '@/components/TrackCard';

function RecentlyPlayedContent() {
  const { token } = useAuth();
  const [recentlyPlayed, setRecentlyPlayed] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('[Recentemente Tocadas] Token disponível:', !!token?.access_token);
    if (!token?.access_token) {
      console.log('[Recentemente Tocadas] Sem token, pulando busca');
      return;
    }

    const fetchRecentlyPlayed = async () => {
      setIsLoading(true);
      try {
        console.log('[Recentemente Tocadas] Buscando com token:', token.access_token.slice(0, 20) + '...');
        const response = await spotifyService.getUserRecentlyPlayed(token.access_token, 50);
        console.log('[Recentemente Tocadas] Resposta recebida:', response);
        setRecentlyPlayed(response.items || []);
      } catch (error) {
        console.error('[Recentemente Tocadas] Falha ao buscar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentlyPlayed();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Tocadas Recentemente</h1>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="space-y-2">
            {recentlyPlayed.map((item, index) => (
              <TrackCard key={`${item.track.id}-${index}`} track={item.track} index={index} />
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

export default function RecentlyPlayed() {
  return (
    <ProtectedRoute>
      <RecentlyPlayedContent />
    </ProtectedRoute>
  );
}
