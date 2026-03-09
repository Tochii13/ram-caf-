import React, { useMemo } from 'react';
import { Pressable, Text, View, StyleSheet } from 'react-native';
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
  MenuItem,
} from '@/types';

interface MenuItemCardProps {
  item: MenuItem;
  onPress?: () => void;
}

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
   if (tags.includes('halal') && allergens.includes('pork')) conflicts.add('pork');
  return Array.from(conflicts);
}

export default React.memo(function MenuItemCard({ item, onPress }: MenuItemCardProps) {
  const { effectiveDietaryTags, effectiveAllergies, resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);

  const conflicts = useMemo(() => getConflictingAllergens(effectiveDietaryTags, item.allergens), [effectiveDietaryTags, item.allergens]);
  const allergyMatch = useMemo(() => item.allergens.filter((a) => effectiveAllergies.includes(a)), [item.allergens, effectiveAllergies]);
  const allWarnings = useMemo(() => [...new Set([...conflicts, ...allergyMatch])], [conflicts, allergyMatch]);
  const warningText = useMemo(() => allWarnings.map((allergen) => ALLERGEN_LABELS[allergen]).join(', '), [allWarnings]);
  const showCaution = allWarnings.length > 0;
  const isSoldOut = item.availability === 'soldOut';
  const availConfig = AVAILABILITY_CONFIG[item.availability];

  const accessibilityLabel = useMemo(() => {
    let label = `${item.name}, ${item.calories} calories. ${item.description}. Dietary tags: ${item.dietaryTags.map((t) => DIETARY_TAG_LABELS[t]).join(', ') || 'none'}.`;
    if (item.availability !== 'available') {
      label += ` ${availConfig.label}.`;
    }
    return label;
  }, [item, availConfig.label]);

  const accessibilityHint = useMemo(() => {
    const parts: string[] = [];
    if (showCaution) {
      parts.push(`Caution: contains ${warningText}.`);
    }
    parts.push('Tap to view details.');
    return parts.join(' ');
  }, [showCaution, warningText]);

  const content = (
    <Card style={[styles.cardPadding, isSoldOut && styles.soldOutCard]}>
      <View style={styles.row}>
        <View style={[styles.emojiSquare, { backgroundColor: colors.surfaceTimeBlock }]} accessible={false}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <View style={styles.content}>
          <Text style={[styles.calories, { color: colors.textSecondary }]}>{item.calories} cal</Text>
          <Text style={[styles.name, { color: isSoldOut ? colors.textSecondary : colors.textPrimary }]}>{item.name}</Text>
          <View style={styles.availRow}>
            <Text style={[styles.availText, { color: availConfig.color }]}>{availConfig.icon} {availConfig.label}</Text>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]}>{item.description}</Text>
          <FlowTagList style={styles.pills}>
            {item.dietaryTags.map((tag) => (
              <View
                key={tag}
                style={[
                  styles.pill,
                  highContrastEnabled
                    ? { backgroundColor: colors.brandPrimary }
                    : { backgroundColor: 'rgba(155,64,64,0.15)' },
                ]}
              >
                <Text style={[
                  styles.pillText,
                  { color: highContrastEnabled ? '#FFFFFF' : colors.brandPrimary },
                ]}>
                  {DIETARY_TAG_EMOJIS[tag]} {DIETARY_TAG_LABELS[tag]}
                </Text>
              </View>
            ))}
          </FlowTagList>
          {showCaution ? (
            <View style={styles.warningRow}>
              <AlertTriangle size={13} color="#E67E22" />
              <Text style={[styles.warningText, highContrastEnabled && styles.warningTextHighContrast]}>⚠️Caution: contains {warningText}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </Card>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
        testID={`menu-item-${item.id}`}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <View
      accessible
      accessibilityRole="summary"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
    >
      {content}
    </View>
  );
});

const styles = StyleSheet.create({
  cardPadding: {
    padding: 14,
    marginBottom: 10,
  },
  soldOutCard: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  emojiSquare: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 22,
  },
  content: {
    flex: 1,
  },
  calories: {
    fontSize: 13,
    marginBottom: 2,
  },
  name: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  availText: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  description: {
    fontSize: 15,
    marginTop: 4,
    lineHeight: 21,
  },
  pills: {
    marginTop: 10,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  warningRow: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: '#E67E22',
    fontWeight: '600' as const,
  },
  warningTextHighContrast: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
});
