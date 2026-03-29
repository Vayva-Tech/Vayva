/**
 * Class Name Utilities
 * 
 * Conditional class merging with Tailwind CSS optimization
 */

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with Tailwind CSS conflict resolution
 * 
 * @example
 * cn('px-2 py-1', 'px-4') // => 'py-1 px-4'
 * cn('text-red-500', error && 'text-red-700') // conditional merging
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Create conditional class object
 * 
 * @example
 * classes({
 *   base: 'px-4 py-2',
 *   variants: {
 *     primary: 'bg-blue-500',
 *     secondary: 'bg-gray-500',
 *   },
 *   compoundVariants: [
 *     { variant: 'primary', size: 'large', class: 'text-lg' },
 *   ],
 * })
 */
export interface ClassConfig {
  base?: ClassValue | ClassValue[];
  variants?: Record<string, Record<string, ClassValue>>;
  compoundVariants?: Array<{
    [key: string]: string;
    class: ClassValue;
  }>;
  defaultVariants?: Record<string, string>;
}

export function createClassManager(config: ClassConfig) {
  const { base = '', variants = {}, compoundVariants = [], defaultVariants = {} } = config;

  return function classes(variantsProps: Record<string, string | undefined> = {}): string {
    const allClasses: ClassValue[] = Array.isArray(base) ? base : [base];

    // Add variant classes
    Object.entries(variantsProps).forEach(([key, value]) => {
      if (value && variants[key]?.[value]) {
        allClasses.push(variants[key][value]);
      } else if (defaultVariants[key] && variants[key]?.[defaultVariants[key]]) {
        allClasses.push(variants[key][defaultVariants[key]]);
      }
    });

    // Add compound variant classes
    compoundVariants.forEach((compound) => {
      const matches = Object.entries(compound)
        .filter(([key]) => key !== 'class')
        .every(([key, value]) => variantsProps[key] === value);

      if (matches) {
        allClasses.push(compound.class);
      }
    });

    return cn(...allClasses);
  };
}

/**
 * Merge component default classes with user overrides
 */
export function mergeClasses(
  defaultClasses: string,
  userClasses?: ClassValue
): string {
  return cn(defaultClasses, userClasses);
}

/**
 * Create state-based class mapper
 */
export function createStateClasses<T extends string>(
  mapping: Record<T, string>
) {
  return function classes(state: T): string {
    return mapping[state] || '';
  };
}

/**
 * Boolean to class helper
 */
export function booleanClass(
  condition: boolean,
  trueClass: string,
  falseClass: string = ''
): string {
  return condition ? trueClass : falseClass;
}
