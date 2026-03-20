import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileUrl(path: string | null | undefined) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;
  // Get API base URL and strip /api if specificed in .env or default to localhost:3001
  const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace('/api', '');
  return `${baseUrl}${path}`;
}
