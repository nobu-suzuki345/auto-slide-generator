import type { Template } from '@/types';

export const corporateBlue: Template = {
  id: 'corporate-blue',
  name: 'Corporate Blue',
  description: 'Professional blue gradient theme for business proposals and meeting materials',
  colors: {
    primary: '#1a365d',
    secondary: '#2b6cb0',
    accent: '#63b3ed',
    background: '#ffffff',
    text: '#2d3748',
    titleText: '#1a365d',
  },
  fonts: {
    title: 'Calibri',
    body: 'Calibri',
  },
  style: {
    titleLayout: 'left-bold',
    bulletIcon: 'arrow',
    decorations: ['sidebar', 'bottom-line'],
  },
};
