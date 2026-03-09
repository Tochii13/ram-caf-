import React, { useMemo, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/Card';
import { useSession } from '@/contexts/SessionContext';
import { getColors } from '@/constants/colors';
import { DIETARY_TAG_EMOJIS, DIETARY_TAG_LABELS, DietaryTag } from '@/types';

const ALL_DIETARY_TAGS: DietaryTag[] = ['vegetarian', 'vegan', 'glutenFree', 'highProtein', 'dairyFree', 'nutFree', 'halal'];

function hasTag(tags: DietaryTag[], tag: DietaryTag): boolean {
  return tags.includes(tag);
}

export default function DietarySettingsScreen() {
  const {
    currentUser,
    effectiveDietaryTags,
    updateDietaryPreferences,
    updateOtherDietary,
    resolvedColorScheme,
    highContrastEnabled,
  } = useSession();
  const router = useRouter();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);

  const [localDietary, setLocalDietary] = useState<DietaryTag[]>(() => effectiveDietaryTags);
  const [otherDietaryText, setOtherDietaryText] = useState<string>(
    () => (currentUser?.profile?.otherDietaryRestrictions ?? []).join(', '),
  );
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    setLocalDietary(effectiveDietaryTags);
    setOtherDietaryText((currentUser?.profile?.otherDietaryRestrictions ?? []).join(', '));
  }, [effectiveDietaryTags, currentUser?.profile?.otherDietaryRestrictions]);

  const dietarySummary = useMemo(() => {
    if (localDietary.length === 0) return 'No preferences set.';
    return localDietary.map((tag) => DIETARY_TAG_LABELS[tag]).join(', ');
  }, [localDietary]);

  const toggleDietaryTag = (tag: DietaryTag, enabled: boolean) => {
    setLocalDietary((prev) => (enabled ? [...prev, tag] : prev.filter((item) => item !== tag)));
  };

  const handleSave = () => {
    const other = otherDietaryText.trim()
      ? otherDietaryText.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    updateDietaryPreferences(localDietary);
    updateOtherDietary(other);
    setSaveFeedback('Saved');
    setTimeout(() => setSaveFeedback(null), 1500);
    router.back();
  };

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.backgroundMain }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Card style={styles.card}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>CURRENT SUMMARY</Text>
        <Text style={[styles.summaryText, { color: colors.textPrimary }]}>{dietarySummary}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>DIETARY PREFERENCES</Text>
        {ALL_DIETARY_TAGS.map((tag, index) => (
          <View key={tag}>
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>
                {DIETARY_TAG_EMOJIS[tag]} {DIETARY_TAG_LABELS[tag]}
              </Text>
              <Switch
                value={hasTag(localDietary, tag)}
                onValueChange={(value) => toggleDietaryTag(tag, value)}
                trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }}
                thumbColor="#FFFFFF"
                accessibilityLabel={`${DIETARY_TAG_LABELS[tag]} dietary preference`}
              />
            </View>
            {index < ALL_DIETARY_TAGS.length - 1 ? (
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            ) : null}
          </View>
        ))}
        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
        <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Other (comma-separated)</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.backgroundCard, borderColor: colors.borderSubtle, color: colors.textPrimary }]}
          placeholder="e.g. low sodium, no pork"
          placeholderTextColor={colors.textSecondary}
          value={otherDietaryText}
          onChangeText={setOtherDietaryText}
        />
      </Card>

      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [
          styles.saveButton,
          { backgroundColor: colors.brandPrimary },
          pressed && styles.saveButtonPressed,
        ]}
        accessibilityLabel="Save dietary preferences"
        accessibilityRole="button"
      >
        <Text style={styles.saveButtonText}>{saveFeedback ?? 'Save'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 16,
  },
  card: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    marginBottom: 14,
  },
  summaryText: {
    fontSize: 14,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '500' as const,
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  toggleLabel: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    marginVertical: 10,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 24,
    minHeight: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonPressed: {
    opacity: 0.9,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700' as const,
  },
});

