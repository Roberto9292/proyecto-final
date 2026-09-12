import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

export const inputStyles =
  "w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-50";

export const inputTone = (invalid?: boolean) =>
  invalid
    ? "border-red-300 focus:border-red-500 focus:ring-red-500/30"
    : "border-gray-300 focus:border-blue-500 focus:ring-blue-500/30";

export default function Input({
  invalid,
  className = "",
  ...rest
}: InputProps) {
  return (
    <input
      aria-invalid={invalid}
      className={`${inputStyles} ${inputTone(invalid)} ${className}`}
      {...rest}
    />
  );
}
