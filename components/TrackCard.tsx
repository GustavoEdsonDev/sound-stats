interface TrackCardProps {
  track: {
    id: string;
    name: string;
    artists?: Array<{ name: string }>;
    album?: { images?: Array<{ url: string }> };
    duration_ms: number;
  };
  index: number;
}

export function TrackCard({ track, index }: TrackCardProps) {
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
      <p className="text-gray-400">{formatDuration(track.duration_ms)}</p>
    </div>
  );
}
