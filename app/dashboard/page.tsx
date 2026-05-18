'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/components/UserProfile';
import { StatCard } from '@/components/StatCard';
import { LogoutButton } from '@/components/LogoutButton';
import { PopularityChart } from '@/components/PopularityChart';
import { ArtistsChart } from '@/components/ArtistsChart';
import { spotifyService } from '@/services/spotify';
import { useEffect, useState } from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

function DashboardContent() {
  const { user, token, logout } = useAuth();
  const router = useRouter();
  const [topTracks, setTopTracks] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token?.access_token) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        console.log('[Dashboard] Buscando dados...');
        const [tracksRes, artistsRes, playlistsRes] = await Promise.all([
          spotifyService.getUserTopTracks(token.access_token, 'medium_term', 10),
          spotifyService.getUserTopArtists(token.access_token, 'medium_term', 8),
          spotifyService.getUserPlaylists(token.access_token, 50),
        ]);
        
        console.log('[Dashboard] Tracks recebidos:', tracksRes);
        console.log('[Dashboard] Artists recebidos:', artistsRes);
        console.log('[Dashboard] Playlists recebidos:', playlistsRes);
        
        // Buscar detalhes completos com popularity
        const trackIds = tracksRes.items?.map((t: any) => t.id) || [];
        const artistIds = artistsRes.items?.map((a: any) => a.id) || [];
        
        let tracksWithDetails = tracksRes.items || [];
        let artistsWithDetails = artistsRes.items || [];
        
        if (trackIds.length > 0) {
          const detailedTracks = await spotifyService.getTracksDetails(token.access_token, trackIds);
          tracksWithDetails = detailedTracks.tracks;
          console.log('[Dashboard] Tracks com popularity:', tracksWithDetails);
        }
        
        if (artistIds.length > 0) {
          const detailedArtists = await spotifyService.getArtistsDetails(token.access_token, artistIds);
          artistsWithDetails = detailedArtists.artists;
          console.log('[Dashboard] Artists com popularity:', artistsWithDetails);
        }
        
        setTopTracks(tracksWithDetails);
        setTopArtists(artistsWithDetails);
        setPlaylists(playlistsRes.items || []);
        console.log('[Dashboard] Dados carregados');
      } catch (error) {
        console.error('[Dashboard] Erro ao buscar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [token]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Cabeçalho */}
        {user && <UserProfile user={user} />}

        <div className="flex justify-end mb-8">
          <LogoutButton onClick={handleLogout} />
        </div>

        {/* Cartões de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Seguidores" value={user?.followers?.total.toLocaleString() || 0} variant="highlight" />
          <StatCard label="Tipo de Conta" value={user?.product || 'Premium'} variant="highlight" />
          <StatCard label="Playlists" value={playlists.length.toString()} variant="highlight" />
        </div>

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {topTracks.length > 0 && <PopularityChart tracks={topTracks} />}
              {topArtists.length > 0 && <ArtistsChart artists={topArtists} />}
            </div>
          </>
        )}

        {/* Links Rápidos */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Navegação</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Top Músicas', href: '/tracks' },
              { name: 'Top Artistas', href: '/artists' },
              { name: 'Tocadas Recentemente', href: '/recently-played' },
              { name: 'Playlists', href: '/playlists' },
            ].map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="bg-green-600 hover:bg-green-700 px-4 py-3 rounded-lg text-center font-semibold transition"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
