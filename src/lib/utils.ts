import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

import { Day } from './constants';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function compareDays(a: Day, b: Day) {
  const dayOrder = {
    L: 0, // Lunes
    M: 1, // Martes
    X: 2, // Miércoles
    J: 3, // Jueves
    V: 4, // Viernes
    S: 5, // Sábado
    D: 6, // Domingo
  };
  return dayOrder[a] - dayOrder[b];
}
