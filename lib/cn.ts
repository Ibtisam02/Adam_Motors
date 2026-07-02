import { clsx, type ClassValue } from "clsx";

/** Merge conditional class names together */
export default function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
