import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}


export const isEqual = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

const toTitleCase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

export const normalizeAttributes = (
  attrs: Record<string, string>,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(attrs).map(([k, v]) => {
      const normalizedKey = toTitleCase(k.trim());
      const normalizedValue =
        normalizedKey.toLowerCase() === "size"
          ? v.trim().toUpperCase()
          : toTitleCase(v.trim());
      return [normalizedKey, normalizedValue];
    }),
  );