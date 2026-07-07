import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const withStopPropagation = (fn?: ((e: React.MouseEvent) => void)) => (e: React.MouseEvent) => {
  e.stopPropagation();
  fn?.(e);
}

