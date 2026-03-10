import { ColorSchemeName } from 'react-native';

const LightColors = {
  brandPrimary: '#8B2F2F',
  brandPrimaryLight: 'rgba(139,47,47,0.08)',
  brandPrimaryMedium: 'rgba(139,47,47,0.15)',
  backgroundMain: '#F5F3F0',
  backgroundCard: '#FFFFFF',
  accentGreen: '#4CAF7D',
  accentGreenLight: 'rgba(76,175,125,0.12)',
  accentPink: '#F3D7D7',
  accentGold: '#C5993A',
  accentGoldLight: 'rgba(197,153,58,0.12)',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  surfaceTimeBlock: '#EDE9E4',
  borderSubtle: '#E8E4E0',
  chipUnselected: '#EDE9E4',
  systemGray6: '#F2F0ED',
  preparingBg: '#FFF3CD',
  preparingText: '#856404',
  destructive: '#D32F2F',
  white: '#FFFFFF',
  shadow: '#000000',
  tabBarBg: '#FAFAF8',
  cardShadow: 'rgba(0,0,0,0.06)',
  overlayBg: 'rgba(0,0,0,0.35)',
};

const DarkColors: typeof LightColors = {
  brandPrimary: '#C46A6A',
  brandPrimaryLight: 'rgba(196,106,106,0.1)',
  brandPrimaryMedium: 'rgba(196,106,106,0.2)',
  backgroundMain: '#121212',
  backgroundCard: '#1E1E1E',
  accentGreen: '#6FBF73',
  accentGreenLight: 'rgba(111,191,115,0.15)',
  accentPink: 'rgba(196,106,106,0.15)',
  accentGold: '#D4A84B',
  accentGoldLight: 'rgba(212,168,75,0.15)',
  textPrimary: '#F2F2F7',
  textSecondary: '#9E9E9E',
  surfaceTimeBlock: '#2A2A2A',
  borderSubtle: '#2C2C2E',
  chipUnselected: '#2A2A2A',
  systemGray6: '#1E1E1E',
  preparingBg: '#3D3520',
  preparingText: '#D4A84B',
  destructive: '#FF453A',
  white: '#FFFFFF',
  shadow: '#000000',
  tabBarBg: '#161616',
  cardShadow: 'rgba(0,0,0,0.3)',
  overlayBg: 'rgba(0,0,0,0.55)',
};

const HighContrastOverrides = {
  brandPrimary: '#6B1C1C',
};

const HighContrastDarkOverrides = {
  brandPrimary: '#E08080',
};

export function getColors(scheme: ColorSchemeName, highContrast: boolean = false) {
  const base = scheme === 'dark' ? DarkColors : LightColors;
  if (highContrast) {
    const override = scheme === 'dark' ? HighContrastDarkOverrides : HighContrastOverrides;
    return {
      ...base,
      brandPrimary: override.brandPrimary,
      textSecondary: base.textPrimary,
    };
  }
  return base;
}

const Colors = LightColors;

export default Colors;
