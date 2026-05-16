interface PlaylistCardProps {
  playlist: {
    id: string;
    name: string;
    description?: string;
    images?: Array<{ url: string }>;
    tracks?: { total: number };
  };
}

export function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition">
      {playlist.images?.[0] && (
        <img src={playlist.images[0].url} alt={playlist.name} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <p className="font-semibold text-lg mb-2">{playlist.name}</p>
        {playlist.tracks?.total !== undefined && (
          <p className="text-gray-400 text-sm mb-2">{playlist.tracks.total} tracks</p>
        )}
        {playlist.description && (
          <p className="text-gray-400 text-sm line-clamp-2">{playlist.description}</p>
        )}
      </div>
    </div>
  );
}
