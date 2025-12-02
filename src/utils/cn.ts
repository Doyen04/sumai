// Utility functions for class name composition
import { clsx, type ClassValue } from 'clsx';

/**
 * Combines class names with clsx
 * Tailwind CSS 4.0 handles merge automatically
 */
export function cn(...inputs: ClassValue[]): string {
    return clsx(inputs);
}
