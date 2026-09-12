interface ColorPickerProps {
  id?: string;
  value: string;
  onChange: (color: string) => void;
}

const PRESETS = [
  "#EF4444",
  "#F59E0B",
  "#10B981",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#06B6D4",
  "#64748B",
];

export default function ColorPicker({ id, value, onChange }: ColorPickerProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Selector de color personalizado"
        className="h-10 w-14 cursor-pointer rounded-lg border border-gray-300 bg-white p-1 shadow-sm"
      />
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => onChange(preset)}
            aria-label={`Usar el color ${preset}`}
            aria-pressed={value.toUpperCase() === preset}
            style={{ backgroundColor: preset }}
            className={`h-6 w-6 rounded-full transition-transform hover:scale-110 ${
              value.toUpperCase() === preset
                ? "ring-2 ring-gray-900 ring-offset-2"
                : "ring-1 ring-gray-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
