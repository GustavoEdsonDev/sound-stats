'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PopularityChartProps {
  tracks: Array<{
    name: string;
    popularity: number;
    artists?: Array<{ name: string }>;
  }>;
}

export function PopularityChart({ tracks }: PopularityChartProps) {
  console.log('[PopularityChart] Recebido tracks:', tracks.length, tracks);
  
  const data = tracks.slice(0, 10).map((track) => ({
    name: track.name.length > 20 ? track.name.substring(0, 17) + '...' : track.name,
    Popularidade: track.popularity,
  }));

  console.log('[PopularityChart] Dados do gráfico:', data);

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 className="text-2xl font-bold mb-4">Popularidade das Melhores Músicas</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
            labelStyle={{ color: '#F3F4F6' }}
          />
          <Legend />
          <Bar dataKey="Popularidade" fill="#22C55E" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
