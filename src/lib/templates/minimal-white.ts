import type { Template } from '@/types';

export const minimalWhite: Template = {
  id: 'minimal-white',
  name: 'Minimal White',
  description: 'Clean design with generous whitespace for reports and academic presentations',
  colors: {
    primary: '#4a5568',
    secondary: '#718096',
    accent: '#a0aec0',
    background: '#ffffff',
    text: '#2d3748',
    titleText: '#1a202c',
  },
  fonts: {
    title: 'Arial',
    body: 'Arial',
  },
  style: {
    titleLayout: 'bottom-bar',
    bulletIcon: 'dash',
    decorations: ['bottom-line'],
  },
};
