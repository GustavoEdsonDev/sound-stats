'use client';

import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

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
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Followers</p>
            <p className="text-3xl font-bold text-green-500">
              {user?.followers?.total.toLocaleString() || 0}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Account Type</p>
            <p className="text-3xl font-bold text-green-500 capitalize">
              {user?.product || 'Premium'}
            </p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <p className="text-gray-400 text-sm mb-2">Status</p>
            <p className="text-3xl font-bold text-green-500">Active</p>
          </div>
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
