import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "danger" | "warning" | "info" | "purple";

interface BadgeProps {
  tone?: Tone;
  color?: string | null;
  children: ReactNode;
}

const tones: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-700 ring-gray-200",
  success: "bg-green-50 text-green-700 ring-green-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  info: "bg-blue-50 text-blue-700 ring-blue-200",
  purple: "bg-purple-50 text-purple-700 ring-purple-200",
};

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";

export default function Badge({ tone = "neutral", color, children }: BadgeProps) {
  if (color) {
    return (
      <span
        className={`${base} ring-transparent`}
        style={{ backgroundColor: `${color}1A`, color }}
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
        {children}
      </span>
    );
  }

  return <span className={`${base} ${tones[tone]}`}>{children}</span>;
}
