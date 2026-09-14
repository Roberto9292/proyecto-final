import type { TextareaHTMLAttributes } from "react";
import { inputStyles, inputTone } from "./Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  invalid?: boolean;
}

export default function Textarea({
  invalid,
  rows = 3,
  className = "",
  ...rest
}: TextareaProps) {
  return (
    <textarea
      rows={rows}
      aria-invalid={invalid}
      className={`${inputStyles} ${inputTone(invalid)} resize-y ${className}`}
      {...rest}
    />
  );
}
