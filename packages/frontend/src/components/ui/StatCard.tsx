import Icon from "./Icon";
import type { IconName } from "./Icon";

type Tone = "blue" | "green" | "amber" | "purple";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: IconName;
  tone?: Tone;
}

const tones: Record<Tone, string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-green-50 text-green-600",
  amber: "bg-amber-50 text-amber-600",
  purple: "bg-purple-50 text-purple-600",
};

export default function StatCard({
  label,
  value,
  icon,
  tone = "blue",
}: StatCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tones[tone]}`}
      >
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xl font-semibold tracking-tight text-gray-900">
          {value}
        </p>
        <p className="truncate text-xs text-gray-500">{label}</p>
      </div>
    </div>
  );
}
