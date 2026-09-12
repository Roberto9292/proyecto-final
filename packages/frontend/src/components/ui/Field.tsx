import { useId } from "react";
import type { ReactElement } from "react";

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: { id: string; describedBy: string }) => ReactElement;
}

export default function Field({
  label,
  hint,
  error,
  required = false,
  children,
}: FieldProps) {
  const id = useId();
  const describedBy = `${id}-help`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {children({ id, describedBy })}

      {(error || hint) && (
        <p
          id={describedBy}
          className={`text-xs ${error ? "text-red-600" : "text-gray-500"}`}
        >
          {error ?? hint}
        </p>
      )}
    </div>
  );
}
