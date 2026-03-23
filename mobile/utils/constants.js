/**
 * App-wide constants
 */

export const ROLES = [
  {
    id: 'ml_engineer',
    label: 'ML Engineer',
    icon: '🤖',
    description: 'Machine Learning & AI',
    color: '#7C3AED',
    gradient: ['#7C3AED', '#4F46E5'],
  },
  {
    id: 'frontend_developer',
    label: 'Frontend Developer',
    icon: '🎨',
    description: 'UI/UX & Web Design',
    color: '#0EA5E9',
    gradient: ['#0EA5E9', '#06B6D4'],
  },
  {
    id: 'backend_developer',
    label: 'Backend Developer',
    icon: '⚙️',
    description: 'APIs & Server-Side',
    color: '#10B981',
    gradient: ['#10B981', '#059669'],
  },
];

export const PROCESSING_STEPS = [
  { id: 1, label: 'Uploading Resume...', sublabel: 'Sending file securely' },
  { id: 2, label: 'Extracting Skills...', sublabel: 'NLP analysis in progress' },
  { id: 3, label: 'Calculating Match Score...', sublabel: 'Comparing with role requirements' },
  { id: 4, label: 'Verifying GitHub...', sublabel: 'Checking repositories & activity' },
  { id: 5, label: 'Generating Result...', sublabel: 'Finalizing AI decision' },
];

export const COLORS = {
  bg: '#0F0F1A',
  card: '#1A1A2E',
  cardBorder: '#2D2D44',
  accent: '#7C3AED',
  accentLight: '#A855F7',
  success: '#10B981',
  error: '#EF4444',
  warning: '#F59E0B',
  textPrimary: '#F1F5F9',
  textSecondary: '#94A3B8',
  textMuted: '#475569',
};
