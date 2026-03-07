import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import Card from '@/components/Card';
import FlowTagList from '@/components/FlowTagList';
import { useSession } from '@/contexts/SessionContext';
import {
  ALLERGEN_LABELS,
  Allergen,
  AVAILABILITY_CONFIG,
  DietaryTag,
  DIETARY_TAG_EMOJIS,
  DIETARY_TAG_LABELS,
  MEAL_PERIOD_LABELS,
  MenuItem,
} from '@/types';

function getConflictingAllergens(tags: DietaryTag[], allergens: Allergen[]): Allergen[] {
  const conflicts = new Set<Allergen>();
  if (tags.includes('glutenFree') && allergens.includes('gluten')) conflicts.add('gluten');
  if (tags.includes('vegan')) {
    if (allergens.includes('dairy')) conflicts.add('dairy');
    if (allergens.includes('eggs')) conflicts.add('eggs');
  }
  if (tags.includes('vegetarian') && allergens.includes('shellfish')) conflicts.add('shellfish');
  if (tags.includes('dairyFree') && allergens.includes('dairy')) conflicts.add('dairy');
  if (tags.includes('nutFree') && allergens.includes('nuts')) conflicts.add('nuts');
  return Array.from(conflicts);
}

interface MenuItemDetailViewProps {
  item: MenuItem;
}

export default function MenuItemDetailView({ item }: MenuItemDetailViewProps) {
  const { effectiveDietaryTags, resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const conflicts = useMemo(() => getConflictingAllergens(effectiveDietaryTags, item.allergens), [effectiveDietaryTags, item.allergens]);
  const availConfig = AVAILABILITY_CONFIG[item.availability];
  const updatedTime = item.lastUpdated ? new Date(item.lastUpdated).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.backgroundMain }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.emojiContainer, { backgroundColor: colors.surfaceTimeBlock }]}>
        <Text style={styles.emoji} accessible={false}>{item.emoji}</Text>
      </View>

      <Text style={[styles.name, { color: colors.textPrimary }]}>{item.name}</Text>

      <View style={styles.metaRow}>
        <View style={[styles.periodChip, { backgroundColor: colors.surfaceTimeBlock }]}>
          <Text style={[styles.periodChipText, { color: colors.textPrimary }]}>{MEAL_PERIOD_LABELS[item.mealPeriod]}</Text>
        </View>
        <Text style={[styles.calories, { color: colors.textSecondary }]}>{item.calories} cal</Text>
        <View style={styles.availRow}>
          <Text style={[styles.availText, { color: availConfig.color }]}>{availConfig.icon} {availConfig.label}</Text>
        </View>
      </View>

      <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>

      {item.dietaryTags.length > 0 ? (
        <FlowTagList style={styles.tags}>
          {item.dietaryTags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tagPill,
                highContrastEnabled
                  ? { backgroundColor: colors.brandPrimary }
                  : { backgroundColor: 'rgba(155,64,64,0.15)' },
              ]}
            >
              <Text style={[
                styles.tagPillText,
                { color: highContrastEnabled ? '#FFFFFF' : colors.brandPrimary },
              ]}>
                {DIETARY_TAG_EMOJIS[tag]} {DIETARY_TAG_LABELS[tag]}
              </Text>
            </View>
          ))}
        </FlowTagList>
      ) : null}

      {conflicts.length > 0 ? (
        <Card style={[styles.allergenCard, { backgroundColor: colors.accentPink }]}>
          <View style={styles.allergenRow}>
            <AlertTriangle size={16} color="#E67E22" />
            <Text style={styles.allergenText}>
              Contains: {conflicts.map((a) => ALLERGEN_LABELS[a]).join(', ')}
            </Text>
          </View>
        </Card>
      ) : null}

      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ingredients</Text>
        <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{item.ingredients}</Text>
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Nutrition Facts</Text>
        <View style={styles.nutritionGrid}>
          {[
            { label: 'Calories', value: `${item.calories}` },
            { label: 'Protein', value: `${item.nutrition.protein}g` },
            { label: 'Carbs', value: `${item.nutrition.carbs}g` },
            { label: 'Fat', value: `${item.nutrition.fat}g` },
            { label: 'Fiber', value: `${item.nutrition.fiber}g` },
          ].map((row) => (
            <View key={row.label} style={[styles.nutritionRow, { borderBottomColor: colors.borderSubtle }]}>
              <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>{row.label}</Text>
              <Text style={[styles.nutritionValue, { color: colors.textPrimary }]}>{row.value}</Text>
            </View>
          ))}
        </View>
      </Card>

      {updatedTime ? (
        <Text style={[styles.updatedText, { color: colors.textSecondary }]}>Updated {updatedTime}</Text>
      ) : null}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  emojiContainer: {
    width: 120,
    height: 120,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  emoji: {
    fontSize: 56,
  },
  name: {
    fontSize: 28,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 12,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
  },
  periodChipText: {
    fontSize: 13,
    fontWeight: '500' as const,
  },
  calories: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  availText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginTop: 14,
    paddingHorizontal: 8,
  },
  tags: {
    marginTop: 14,
    justifyContent: 'center',
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  tagPillText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  allergenCard: {
    width: '100%',
    marginTop: 16,
    padding: 14,
    borderColor: 'transparent',
  },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  allergenText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#E67E22',
  },
  sectionCard: {
    width: '100%',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
    marginBottom: 10,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  nutritionGrid: {
    gap: 0,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  nutritionLabel: {
    fontSize: 14,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  updatedText: {
    fontSize: 12,
    marginTop: 16,
  },
  bottomPad: {
    height: 24,
  },
});
