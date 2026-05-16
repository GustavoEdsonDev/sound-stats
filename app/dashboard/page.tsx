'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/components/UserProfile';
import { StatCard } from '@/components/StatCard';
import { LogoutButton } from '@/components/LogoutButton';

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {user && <UserProfile user={user} />}

        <div className="flex justify-end mb-8">
          <LogoutButton onClick={handleLogout} />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard label="Followers" value={user?.followers?.total.toLocaleString() || 0} variant="highlight" />
          <StatCard label="Account Type" value={user?.product || 'Premium'} variant="highlight" />
          <StatCard label="Status" value="Active" variant="highlight" />
        </div>

        {/* Quick Links */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold mb-4">Navigation</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Top Tracks', href: '/tracks' },
              { name: 'Top Artists', href: '/artists' },
              { name: 'Playlists', href: '/playlists' },
              { name: 'Back to Login', href: '/login' },
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
