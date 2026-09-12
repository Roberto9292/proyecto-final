interface ColorSwatchProps {
  color: string | null;
  name: string;
}

export default function ColorSwatch({ color, name }: ColorSwatchProps) {
  return (
    <span
      role="img"
      aria-label={color ? `Color de ${name}: ${color}` : `${name} no tiene color`}
      title={color ?? "Sin color"}
      className="h-6 w-6 shrink-0 rounded-md ring-1 ring-inset ring-black/10"
      style={{
        backgroundColor: color ?? "transparent",
        backgroundImage: color
          ? undefined
          : "repeating-linear-gradient(45deg, #e5e7eb 0 4px, #f9fafb 4px 8px)",
      }}
    />
  );
}
