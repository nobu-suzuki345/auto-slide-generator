import type { Template } from '@/types';

export const modernDark: Template = {
  id: 'modern-dark',
  name: 'Modern Dark',
  description: 'Dark background with light text and sharp design for tech and startups',
  colors: {
    primary: '#1a1a2e',
    secondary: '#16213e',
    accent: '#0f3460',
    background: '#0f0f1a',
    text: '#e2e8f0',
    titleText: '#ffffff',
  },
  fonts: {
    title: 'Segoe UI',
    body: 'Segoe UI',
  },
  style: {
    titleLayout: 'center',
    bulletIcon: 'diamond',
    decorations: ['diagonal-stripe', 'corner-circle'],
  },
};
