import type { ButtonHTMLAttributes } from "react";
import Icon from "./Icon";
import type { IconName } from "./Icon";

type Tone = "neutral" | "danger";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: IconName;
  label: string;
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  neutral: "text-gray-400 hover:bg-gray-100 hover:text-gray-700",
  danger: "text-gray-400 hover:bg-red-50 hover:text-red-600",
};

export default function IconButton({
  icon,
  label,
  tone = "neutral",
  className = "",
  ...rest
}: IconButtonProps) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]} ${className}`}
      {...rest}
    >
      <Icon name={icon} className="h-4 w-4" />
    </button>
  );
}
