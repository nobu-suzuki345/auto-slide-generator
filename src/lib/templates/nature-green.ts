import type { Template } from '@/types';

export const natureGreen: Template = {
  id: 'nature-green',
  name: 'Nature Green',
  description: 'Calming green tones for environmental, CSR, and healthcare presentations',
  colors: {
    primary: '#276749',
    secondary: '#38a169',
    accent: '#68d391',
    background: '#f0fff4',
    text: '#2d3748',
    titleText: '#22543d',
  },
  fonts: {
    title: 'Cambria',
    body: 'Calibri',
  },
  style: {
    titleLayout: 'overlay',
    bulletIcon: 'number',
    decorations: ['sidebar', 'top-gradient'],
  },
};
