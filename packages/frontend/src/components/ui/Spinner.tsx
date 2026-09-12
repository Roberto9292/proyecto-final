interface SpinnerProps {
  label?: string;
}

export default function Spinner({ label = "Cargando..." }: SpinnerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-3 p-12"
    >
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-blue-600" />
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}
