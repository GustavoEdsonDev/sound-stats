interface TimeRangeSelectorProps {
  value: 'long_term' | 'medium_term' | 'short_term';
  onChange: (value: 'long_term' | 'medium_term' | 'short_term') => void;
}

export function TimeRangeSelector({ value, onChange }: TimeRangeSelectorProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as any)}
      className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700"
    >
      <option value="short_term">Last 4 Weeks</option>
      <option value="medium_term">Last 6 Months</option>
      <option value="long_term">All Time</option>
    </select>
  );
}
