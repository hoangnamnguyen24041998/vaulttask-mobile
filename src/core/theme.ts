export type Brand = 'enterprise' | 'retail';

export interface AppTheme {
  brand: Brand;
  colors: {
    background: string;
    surface: string;
    surfaceMuted: string;
    text: string;
    muted: string;
    primary: string;
    primaryText: string;
    border: string;
    danger: string;
    success: string;
    warning: string;
  };
  spacing: { xs: number; sm: number; md: number; lg: number; xl: number; xxl: number };
  typography: { caption: number; body: number; subtitle: number; title: number; display: number };
  radii: { sm: number; md: number; lg: number; pill: number };
}

const shared = {
  spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 },
  typography: { caption: 12, body: 16, subtitle: 18, title: 24, display: 32 },
};

export const themes: Record<Brand, AppTheme> = {
  enterprise: {
    brand: 'enterprise',
    colors: {
      background: '#F4F6F8',
      surface: '#FFFFFF',
      surfaceMuted: '#E9EEF3',
      text: '#122337',
      muted: '#64748B',
      primary: '#0755A5',
      primaryText: '#FFFFFF',
      border: '#D5DEE8',
      danger: '#B42318',
      success: '#14804A',
      warning: '#A15C00',
    },
    ...shared,
    radii: { sm: 6, md: 10, lg: 14, pill: 999 },
  },
  retail: {
    brand: 'retail',
    colors: {
      background: '#F8F6F2',
      surface: '#FFFFFF',
      surfaceMuted: '#F0EDE6',
      text: '#27231F',
      muted: '#776F66',
      primary: '#6C4DE6',
      primaryText: '#FFFFFF',
      border: '#E3DED5',
      danger: '#C33745',
      success: '#16836B',
      warning: '#A15C00',
    },
    ...shared,
    radii: { sm: 10, md: 16, lg: 24, pill: 999 },
  },
};
