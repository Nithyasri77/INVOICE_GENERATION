/**
 * Purpose: Merge Tailwind class strings safely (resolves conflicting utility classes)
 * Responsibilities: Combine clsx conditional class logic with tailwind-merge de-duplication
 * Dependencies: clsx, tailwind-merge
 * Export: cn()
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
