import type { Template } from '@/types';
import { corporateBlue } from './corporate-blue';
import { modernDark } from './modern-dark';
import { gradientSunset } from './gradient-sunset';
import { minimalWhite } from './minimal-white';
import { techNeon } from './tech-neon';
import { natureGreen } from './nature-green';

export const TEMPLATES: Template[] = [
  corporateBlue,
  modernDark,
  gradientSunset,
  minimalWhite,
  techNeon,
  natureGreen,
];

export function getTemplate(id: string): Template {
  const template = TEMPLATES.find((t) => t.id === id);
  if (!template) {
    throw new Error(`Template not found: ${id}`);
  }
  return template;
}

export {
  corporateBlue,
  modernDark,
  gradientSunset,
  minimalWhite,
  techNeon,
  natureGreen,
};
