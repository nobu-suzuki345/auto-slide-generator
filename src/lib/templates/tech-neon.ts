import type { Template } from '@/types';

export const techNeon: Template = {
  id: 'tech-neon',
  name: 'Tech Neon',
  description: 'Dark background with vibrant neon accents for IT and technology demos',
  colors: {
    primary: '#7928ca',
    secondary: '#ff0080',
    accent: '#00d4ff',
    background: '#0a0a0a',
    text: '#e2e8f0',
    titleText: '#ffffff',
  },
  fonts: {
    title: 'Consolas',
    body: 'Segoe UI',
  },
  style: {
    titleLayout: 'diagonal',
    bulletIcon: 'check',
    decorations: ['diagonal-stripe', 'dot-pattern'],
  },
};
