import type { ReactNode } from "react";

interface ToolbarProps {
  children: ReactNode;
}

export default function Toolbar({ children }: ToolbarProps) {
  return (
    <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      {children}
    </div>
  );
}
