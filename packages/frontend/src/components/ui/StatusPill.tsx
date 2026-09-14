import Icon from "./Icon";
import type { IconName } from "./Icon";

type Tone = "neutral" | "success" | "danger" | "warning";

interface StatusPillProps {
  tone: Tone;
  icon: IconName;
  label: string;
  /** Al pasarlo, la píldora se vuelve el control que cambia el estado. */
  onToggle?: () => void;
  /** Qué va a pasar si se hace clic. Requerido si hay onToggle. */
  actionLabel?: string;
  pressed?: boolean;
}

const tones: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-600 ring-gray-200",
  success: "bg-green-50 text-green-700 ring-green-200",
  danger: "bg-red-50 text-red-700 ring-red-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
};

const hoverTones: Record<Tone, string> = {
  neutral: "hover:bg-gray-200",
  success: "hover:bg-green-100",
  danger: "hover:bg-red-100",
  warning: "hover:bg-amber-100",
};

const base =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset";

export default function StatusPill({
  tone,
  icon,
  label,
  onToggle,
  actionLabel,
  pressed,
}: StatusPillProps) {
  if (!onToggle) {
    return (
      <span className={`${base} ${tones[tone]}`}>
        <Icon name={icon} className="h-3.5 w-3.5" />
        {label}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={onToggle}
      title={actionLabel}
      aria-label={actionLabel}
      aria-pressed={pressed}
      className={`${base} ${tones[tone]} ${hoverTones[tone]} cursor-pointer transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600`}
    >
      <Icon name={icon} className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
