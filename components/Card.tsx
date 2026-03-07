import React from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { getColors } from '@/constants/colors';
import { useSession } from '@/contexts/SessionContext';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, style }: CardProps) {
  const { resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.backgroundCard,
        borderColor: colors.borderSubtle,
        borderWidth: highContrastEnabled ? 2 : 1,
      },
      style,
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
});
