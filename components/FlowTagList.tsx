import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface FlowTagListProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

export default function FlowTagList({ children, style }: FlowTagListProps) {
  return <View style={[styles.container, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
});
