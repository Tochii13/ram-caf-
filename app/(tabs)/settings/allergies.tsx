import React, { useState, useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TextInput, View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import Card from '@/components/Card';
import { useSession } from '@/contexts/SessionContext';
import { getColors } from '@/constants/colors';
import { ALLERGEN_LABELS, Allergen } from '@/types';

const ALL_ALLERGENS: Allergen[] = ['nuts', 'dairy', 'shellfish', 'gluten', 'soy', 'eggs', 'pork'];

export default function AllergiesSettingsScreen() {
  const {
    effectiveAllergies,
    effectiveOtherAllergies,
    updateAllergies,
    resolvedColorScheme,
    highContrastEnabled,
  } = useSession();
  const router = useRouter();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);

  const [localAllergies, setLocalAllergies] = useState<Allergen[]>(() => effectiveAllergies);
  const [otherAllergiesText, setOtherAllergiesText] = useState<string>(() => (effectiveOtherAllergies ?? []).join(', '));
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  useEffect(() => {
    setLocalAllergies(effectiveAllergies);
    setOtherAllergiesText((effectiveOtherAllergies ?? []).join(', '));
  }, [effectiveAllergies, effectiveOtherAllergies]);

  const summary = useMemo(() => {
    const labels = localAllergies.map((a) => ALLERGEN_LABELS[a]);
    const other = otherAllergiesText.trim()
      ? otherAllergiesText.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    const all = [...labels, ...other];
    if (all.length === 0) return 'No allergies added.';
    return all.join(', ');
  }, [localAllergies, otherAllergiesText]);

  const toggleAllergy = (allergen: Allergen, enabled: boolean) => {
    setLocalAllergies((prev) => (enabled ? [...prev, allergen] : prev.filter((a) => a !== allergen)));
  };

  const handleSave = () => {
    const other = otherAllergiesText.trim()
      ? otherAllergiesText.split(',').map((s) => s.trim()).filter(Boolean)
      : [];
    updateAllergies(localAllergies, other.length ? other : undefined);
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
        <Text style={[styles.summaryText, { color: colors.textPrimary }]}>{summary}</Text>
      </Card>

      <Card style={styles.card}>
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>ALLERGIES</Text>
        <Text style={[styles.subtitleSmall, { color: colors.textSecondary }]}>
          We&apos;ll show a caution on menu items that contain these. Admin can also view this list.
        </Text>
        {ALL_ALLERGENS.map((allergen, index) => (
          <View key={allergen}>
            <View style={styles.toggleRow}>
              <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>{ALLERGEN_LABELS[allergen]}</Text>
              <Switch
                value={localAllergies.includes(allergen)}
                onValueChange={(value) => toggleAllergy(allergen, value)}
                trackColor={{ true: colors.brandPrimary, false: colors.borderSubtle }}
                thumbColor="#FFFFFF"
                accessibilityLabel={`${ALLERGEN_LABELS[allergen]} allergy`}
              />
            </View>
            {index < ALL_ALLERGENS.length - 1 ? (
              <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
            ) : null}
          </View>
        ))}
        <View style={[styles.divider, { backgroundColor: colors.borderSubtle }]} />
        <Text style={[styles.rowLabel, { color: colors.textPrimary }]}>Other allergies (comma-separated)</Text>
        <TextInput
          style={[styles.textInput, { backgroundColor: colors.backgroundCard, borderColor: colors.borderSubtle, color: colors.textPrimary }]}
          placeholder="e.g. sesame, kiwi"
          placeholderTextColor={colors.textSecondary}
          value={otherAllergiesText}
          onChangeText={setOtherAllergiesText}
        />
      </Card>

      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [
          styles.saveButton,
          { backgroundColor: colors.brandPrimary },
          pressed && styles.saveButtonPressed,
        ]}
        accessibilityLabel="Save allergies"
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
  subtitleSmall: {
    fontSize: 13,
    marginBottom: 12,
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

