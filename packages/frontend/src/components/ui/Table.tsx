import type { ReactNode } from "react";

interface TableProps {
  headers: string[];
  caption: string;
  children: ReactNode;
}

export function Table({ headers, caption, children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                scope="col"
                className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 last:text-right"
              >
                {header.startsWith("_") ? (
                  <span className="sr-only">{header.slice(1)}</span>
                ) : (
                  header
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">{children}</tbody>
      </table>
    </div>
  );
}

export function Row({ children }: { children: ReactNode }) {
  return <tr className="transition-colors hover:bg-gray-50">{children}</tr>;
}

export function Cell({
  children,
  align = "left",
}: {
  children: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      className={`whitespace-nowrap px-6 py-4 text-sm ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </td>
  );
}

export function TableFooter({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-3">
      {children}
    </div>
  );
}
