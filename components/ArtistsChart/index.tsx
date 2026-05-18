'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface ArtistsChartProps {
  artists: Array<{
    name: string;
    popularity: number;
  }>;
}

const COLORS = ['#22C55E', '#16A34A', '#15803D', '#166534', '#052E16', '#3B82F6', '#06B6D4', '#EC4899'];

export function ArtistsChart({ artists }: ArtistsChartProps) {
  const data = artists.slice(0, 8).map((artist) => ({
    name: artist.name.length > 15 ? artist.name.substring(0, 12) + '...' : artist.name,
    value: artist.popularity,
  }));

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4">Artistas Mais Populares</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, value }) => `${name} (${value})`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
