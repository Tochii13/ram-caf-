import { ColorSchemeName } from 'react-native';

const LightColors = {
  brandPrimary: '#722F37',
  brandPrimaryLight: 'rgba(114,47,55,0.07)',
  brandPrimaryMedium: 'rgba(114,47,55,0.14)',
  backgroundMain: '#FAF8F5',
  backgroundCard: '#FFFFFF',
  accentGreen: '#2E9E6A',
  accentGreenLight: 'rgba(46,158,106,0.10)',
  accentPink: '#F3D7D7',
  accentGold: '#C5993A',
  accentGoldLight: 'rgba(197,153,58,0.10)',
  textPrimary: '#1A1A1A',
  textSecondary: '#787878',
  surfaceTimeBlock: '#F0ECE6',
  borderSubtle: '#E8E4DE',
  chipUnselected: '#EFEBE5',
  systemGray6: '#F2F0ED',
  preparingBg: '#FFF8E8',
  preparingText: '#9A7B2A',
  destructive: '#C93535',
  white: '#FFFFFF',
  shadow: '#000000',
  tabBarBg: '#FDFCFA',
  cardShadow: 'rgba(0,0,0,0.06)',
  overlayBg: 'rgba(0,0,0,0.4)',
  shimmer: 'rgba(114,47,55,0.04)',
};

const DarkColors: typeof LightColors = {
  brandPrimary: '#D4838A',
  brandPrimaryLight: 'rgba(212,131,138,0.10)',
  brandPrimaryMedium: 'rgba(212,131,138,0.18)',
  backgroundMain: '#0F0F0F',
  backgroundCard: '#1A1A1A',
  accentGreen: '#5CC98C',
  accentGreenLight: 'rgba(92,201,140,0.12)',
  accentPink: 'rgba(212,131,138,0.12)',
  accentGold: '#E0B854',
  accentGoldLight: 'rgba(224,184,84,0.12)',
  textPrimary: '#F5F5F5',
  textSecondary: '#A0A0A0',
  surfaceTimeBlock: '#252525',
  borderSubtle: '#2A2A2A',
  chipUnselected: '#252525',
  systemGray6: '#1A1A1A',
  preparingBg: '#2D2818',
  preparingText: '#E0B854',
  destructive: '#FF5252',
  white: '#FFFFFF',
  shadow: '#000000',
  tabBarBg: '#141414',
  cardShadow: 'rgba(0,0,0,0.35)',
  overlayBg: 'rgba(0,0,0,0.6)',
  shimmer: 'rgba(212,131,138,0.06)',
};

const HighContrastOverrides = {
  brandPrimary: '#5A1A20',
};

const HighContrastDarkOverrides = {
  brandPrimary: '#F0A0A8',
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
