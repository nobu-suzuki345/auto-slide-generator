import type { Template } from '@/types';

export const gradientSunset: Template = {
  id: 'gradient-sunset',
  name: 'Gradient Sunset',
  description: 'Warm orange-pink tones for marketing and creative presentations',
  colors: {
    primary: '#e53e3e',
    secondary: '#dd6b20',
    accent: '#d69e2e',
    background: '#fffaf0',
    text: '#2d3748',
    titleText: '#c53030',
  },
  fonts: {
    title: 'Georgia',
    body: 'Calibri',
  },
  style: {
    titleLayout: 'split',
    bulletIcon: 'circle',
    decorations: ['top-gradient', 'corner-circle'],
  },
};
