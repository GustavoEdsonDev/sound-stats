interface TrackCardProps {
  track: {
    id: string;
    name: string;
    artists?: Array<{ name: string }>;
    album?: { images?: Array<{ url: string }> };
    duration_ms: number;
    popularity?: number;
  };
  index: number;
  playedAt?: string;
}

export function TrackCard({ track, index, playedAt }: TrackCardProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatPlayedAt = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `há ${diffMins}m`;
    if (diffHours < 24) return `há ${diffHours}h`;
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `há ${diffDays}d`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition flex items-center gap-4">
      <div className="text-gray-400 font-semibold w-8">{index + 1}</div>
      {track.album?.images?.[0] && (
        <img src={track.album.images[0].url} alt={track.name} className="w-12 h-12 rounded" />
      )}
      <div className="flex-1">
        <p className="font-semibold">{track.name}</p>
        <p className="text-gray-400 text-sm">{track.artists?.map((a) => a.name).join(', ')}</p>
      </div>
      <div className="flex items-center gap-4">
        {playedAt && (
          <div className="text-gray-400 text-sm min-w-max">
            {formatPlayedAt(playedAt)}
          </div>
        )}
        {track.popularity !== undefined && (
          <div className="flex items-center gap-2 text-center">
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-xs mb-1">Popularidade</span>
              <div className="w-16 bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${track.popularity}%` }}
                />
              </div>
              <span className="text-green-400 text-sm font-semibold mt-1">{track.popularity}%</span>
            </div>
          </div>
        )}
        <p className="text-gray-400 w-12">{formatDuration(track.duration_ms)}</p>
      </div>
    </div>
  );
}
