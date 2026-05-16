interface ArtistCardProps {
  artist: {
    id: string;
    name: string;
    images?: Array<{ url: string }>;
    genres?: string[];
    popularity?: number;
  };
  index: number;
}

export function ArtistCard({ artist, index }: ArtistCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition">
      {artist.images?.[0] && (
        <img src={artist.images[0].url} alt={artist.name} className="w-full h-48 object-cover" />
      )}
      <div className="p-4">
        <p className="text-gray-400 text-sm">#{index + 1}</p>
        <p className="font-semibold text-lg mb-2">{artist.name}</p>
        {artist.popularity !== undefined && (
          <p className="text-gray-400 text-sm mb-2">Popularity: {artist.popularity}%</p>
        )}
        {artist.genres && artist.genres.length > 0 && (
          <p className="text-gray-400 text-sm">{artist.genres.slice(0, 2).join(', ')}</p>
        )}
      </div>
    </div>
  );
}
