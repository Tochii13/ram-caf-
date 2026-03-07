import { ColorSchemeName } from 'react-native';

const LightColors = {
  brandPrimary: '#9B4040',
  backgroundMain: '#F6F5F5',
  backgroundCard: '#FFFFFF',
  accentGreen: '#6FBF73',
  accentPink: '#F3D7D7',
  textPrimary: '#2F2F2F',
  textSecondary: '#7A7A7A',
  surfaceTimeBlock: '#E8E4E1',
  borderSubtle: '#E5E5E5',
  chipUnselected: '#ECECEC',
  systemGray6: '#F2F2F7',
  preparingBg: '#FFF3CD',
  preparingText: '#856404',
  destructive: '#D32F2F',
  white: '#FFFFFF',
  shadow: '#000000',
};

const DarkColors: typeof LightColors = {
  brandPrimary: '#9B4040',
  backgroundMain: '#1C1C1E',
  backgroundCard: '#2C2C2E',
  accentGreen: '#6FBF73',
  accentPink: '#F3D7D7',
  textPrimary: '#F2F2F7',
  textSecondary: '#AEAEB2',
  surfaceTimeBlock: '#3A3A3C',
  borderSubtle: '#3A3A3C',
  chipUnselected: '#3A3A3C',
  systemGray6: '#2C2C2E',
  preparingBg: '#FFF3CD',
  preparingText: '#856404',
  destructive: '#FF453A',
  white: '#FFFFFF',
  shadow: '#000000',
};

const HighContrastOverrides = {
  brandPrimary: '#6B1C1C',
};

export function getColors(scheme: ColorSchemeName, highContrast: boolean = false) {
  const base = scheme === 'dark' ? DarkColors : LightColors;
  if (highContrast) {
    return {
      ...base,
      brandPrimary: HighContrastOverrides.brandPrimary,
      textSecondary: base.textPrimary,
    };
  }
  return base;
}

const Colors = LightColors;

export default Colors;
