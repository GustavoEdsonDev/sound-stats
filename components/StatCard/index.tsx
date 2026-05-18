interface StatCardProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'highlight';
}

export function StatCard({ label, value, variant = 'default' }: StatCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <p className="text-gray-400 text-sm mb-2">{label}</p>
      <p className={`text-3xl font-bold ${variant === 'highlight' ? 'text-green-500' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}
