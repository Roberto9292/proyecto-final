import type { SelectHTMLAttributes } from "react";
import { inputStyles, inputTone } from "./Input";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export default function Select({ className = "", ...rest }: SelectProps) {
  return (
    <select
      className={`${inputStyles} ${inputTone(false)} cursor-pointer ${className}`}
      {...rest}
    />
  );
}
