import React, { useMemo, useRef } from 'react';
import { Animated, Pressable, Text, View, StyleSheet, Platform } from 'react-native';
import { AlertTriangle, ChevronRight } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

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

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, speed: 50, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 40, bounciness: 6 }).start();
  };

  const content = (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.backgroundCard,
        shadowColor: colors.shadow,
      },
      isSoldOut && styles.soldOutCard,
    ]}>
      <View style={styles.row}>
        <View style={[styles.emojiSquare, { backgroundColor: colors.surfaceTimeBlock }]} accessible={false}>
          <Text style={styles.emoji}>{item.emoji}</Text>
        </View>
        <View style={styles.content}>
          <View style={styles.nameRow}>
            <Text style={[styles.name, { color: isSoldOut ? colors.textSecondary : colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
            {onPress ? <ChevronRight size={16} color={colors.textSecondary} /> : null}
          </View>
          <View style={styles.metaRow}>
            <Text style={[styles.calories, { color: colors.textSecondary }]}>{item.calories} cal</Text>
            <View style={[styles.availDot, { backgroundColor: availConfig.color }]} />
            <Text style={[styles.availText, { color: availConfig.color }]}>{availConfig.label}</Text>
          </View>
          <Text style={[styles.description, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
          {item.dietaryTags.length > 0 ? (
            <FlowTagList style={styles.pills}>
              {item.dietaryTags.map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.pill,
                    highContrastEnabled
                      ? { backgroundColor: colors.brandPrimary }
                      : { backgroundColor: colors.brandPrimaryMedium },
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
          ) : null}
          {showCaution ? (
            <View style={[styles.warningRow, { backgroundColor: 'rgba(230,126,34,0.08)' }]}>
              <AlertTriangle size={13} color="#E67E22" />
              <Text style={[styles.warningText, highContrastEnabled && styles.warningTextHighContrast]}>Contains {warningText}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );

  if (onPress) {
    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Pressable
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          testID={`menu-item-${item.id}`}
        >
          {content}
        </Pressable>
      </Animated.View>
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
  card: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
    }),
  },
  soldOutCard: {
    opacity: 0.5,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  emojiSquare: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  calories: {
    fontSize: 13,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  availText: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  description: {
    fontSize: 14,
    marginTop: 6,
    lineHeight: 20,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
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
