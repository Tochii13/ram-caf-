import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Colors from '@/constants/colors';
import { MealServiceStatus, PlanStatus } from '@/types';

type ChipVariant = MealServiceStatus | PlanStatus;

const CHIP_CONFIG: Record<ChipVariant, { bg: string; text: string; label: string }> = {
  completed: { bg: Colors.chipUnselected, text: Colors.textSecondary, label: 'Completed' },
  serving: { bg: 'rgba(111,191,115,0.2)', text: Colors.accentGreen, label: 'Serving Now' },
  preparing: { bg: Colors.preparingBg, text: Colors.preparingText, label: 'Preparing' },
  ready: { bg: 'rgba(111,191,115,0.2)', text: Colors.accentGreen, label: 'Ready' },
  inProgress: { bg: Colors.preparingBg, text: Colors.preparingText, label: 'In Progress' },
  notStarted: { bg: Colors.chipUnselected, text: Colors.textSecondary, label: 'Not Started' },
};

interface StatusChipProps {
  status: ChipVariant;
}

export default function StatusChip({ status }: StatusChipProps) {
  const config = CHIP_CONFIG[status];
  return (
    <View style={[styles.chip, { backgroundColor: config.bg }]}>
      <Text style={[styles.label, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start' as const,
  },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
});
