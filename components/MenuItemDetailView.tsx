import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, Text, View, Platform } from 'react-native';
import { AlertTriangle, Flame } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import { tFood, tFoodDesc, t, tMealPeriod, tAllergen } from '@/constants/i18n';
import FlowTagList from '@/components/FlowTagList';
import { useSession } from '@/contexts/SessionContext';
import {
  Allergen,
  AVAILABILITY_CONFIG,
  DietaryTag,
  DIETARY_TAG_EMOJIS,
  DIETARY_TAG_LABELS,
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

function NutritionBar({ label, value, icon, delay, colors }: { label: string; value: string; icon: string; delay: number; colors: ReturnType<typeof getColors> }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 350, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim, delay]);

  return (
    <Animated.View style={[styles.nutritionItem, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      <View style={[styles.nutritionIconWrap, { backgroundColor: colors.surfaceTimeBlock }]}>
        <Text style={styles.nutritionIcon}>{icon}</Text>
      </View>
      <Text style={[styles.nutritionValue, { color: colors.textPrimary }]}>{value}</Text>
      <Text style={[styles.nutritionLabel, { color: colors.textSecondary }]}>{label}</Text>
    </Animated.View>
  );
}

export default function MenuItemDetailView({ item }: MenuItemDetailViewProps) {
  const { effectiveDietaryTags, resolvedColorScheme, highContrastEnabled, appLanguage } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const conflicts = useMemo(() => getConflictingAllergens(effectiveDietaryTags, item.allergens), [effectiveDietaryTags, item.allergens]);
  const availConfig = AVAILABILITY_CONFIG[item.availability];
  const updatedTime = item.lastUpdated ? new Date(item.lastUpdated).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const emojiScale = useRef(new Animated.Value(0.5)).current;
  const emojiRotate = useRef(new Animated.Value(-0.05)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(emojiScale, { toValue: 1, friction: 5, tension: 70, useNativeDriver: true }),
      Animated.timing(emojiRotate, { toValue: 0, duration: 600, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
    ]).start();
  }, [fadeAnim, slideAnim, emojiScale, emojiRotate]);

  const rotateInterpolation = emojiRotate.interpolate({
    inputRange: [-0.05, 0],
    outputRange: ['-5deg', '0deg'],
  });

  const nutritionData = [
    { label: 'Calories', value: `${item.calories}`, icon: '🔥' },
    { label: 'Protein', value: `${item.nutrition.protein}g`, icon: '💪' },
    { label: 'Carbs', value: `${item.nutrition.carbs}g`, icon: '🌾' },
    { label: 'Fat', value: `${item.nutrition.fat}g`, icon: '🥑' },
    { label: 'Fiber', value: `${item.nutrition.fiber}g`, icon: '🥬' },
  ];

  return (
    <ScrollView
      style={[styles.scroll, { backgroundColor: colors.backgroundMain }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Animated.View style={[styles.heroSection, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Animated.View style={[styles.emojiContainer, { backgroundColor: colors.surfaceTimeBlock, transform: [{ scale: emojiScale }, { rotate: rotateInterpolation }] }]}>
          <Text style={styles.emoji} accessible={false}>{item.emoji}</Text>
        </Animated.View>

        <Text style={[styles.name, { color: colors.textPrimary }]}>{tFood(appLanguage, item.name)}</Text>

        <View style={styles.metaRow}>
          <View style={[styles.periodChip, { backgroundColor: colors.brandPrimaryLight }]}>
            <Text style={[styles.periodChipText, { color: colors.brandPrimary }]}>{tMealPeriod(appLanguage, item.mealPeriod)}</Text>
          </View>
          <View style={[styles.calChip, { backgroundColor: colors.accentGoldLight }]}>
            <Flame size={12} color={colors.accentGold} />
            <Text style={[styles.calChipText, { color: colors.accentGold }]}>{item.calories} cal</Text>
          </View>
          <View style={[styles.availChip, { backgroundColor: `${availConfig.color}18` }]}>
            <View style={[styles.availDot, { backgroundColor: availConfig.color }]} />
            <Text style={[styles.availText, { color: availConfig.color }]}>{availConfig.label}</Text>
          </View>
        </View>

        <Text style={[styles.description, { color: colors.textSecondary }]}>{tFoodDesc(appLanguage, item.name, item.description)}</Text>
      </Animated.View>

      {item.dietaryTags.length > 0 ? (
        <FlowTagList style={styles.tags}>
          {item.dietaryTags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tagPill,
                highContrastEnabled
                  ? { backgroundColor: colors.brandPrimary }
                  : { backgroundColor: colors.brandPrimaryMedium },
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
        <View style={[styles.allergenCard, { backgroundColor: 'rgba(230,126,34,0.08)', borderLeftColor: '#E67E22', borderLeftWidth: 3 }]}>
          <View style={styles.allergenRow}>
            <View style={[styles.allergenIcon, { backgroundColor: 'rgba(230,126,34,0.15)' }]}>
              <AlertTriangle size={16} color="#E67E22" />
            </View>
            <View style={styles.allergenTextWrap}>
              <Text style={styles.allergenLabel}>Allergen Warning</Text>
              <Text style={styles.allergenText}>
                {t(appLanguage, 'contains')}: {conflicts.map((a) => tAllergen(appLanguage, a)).join(', ')}
              </Text>
            </View>
          </View>
        </View>
      ) : null}

      <View style={[styles.sectionCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Nutrition Facts</Text>
        <View style={styles.nutritionGrid}>
          {nutritionData.map((row, i) => (
            <NutritionBar
              key={row.label}
              label={row.label}
              value={row.value}
              icon={row.icon}
              delay={400 + i * 80}
              colors={colors}
            />
          ))}
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Ingredients</Text>
        <Text style={[styles.sectionBody, { color: colors.textSecondary }]}>{item.ingredients}</Text>
      </View>

      {updatedTime ? (
        <Text style={[styles.updatedText, { color: colors.textSecondary }]}>Last updated {updatedTime}</Text>
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
    padding: 20,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    width: '100%',
  },
  emojiContainer: {
    width: 110,
    height: 110,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  emoji: {
    fontSize: 52,
  },
  name: {
    fontSize: 26,
    fontWeight: '700' as const,
    textAlign: 'center',
    letterSpacing: -0.4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  periodChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  periodChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  calChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  calChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  availChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  availDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  availText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 8,
  },
  tags: {
    marginTop: 16,
    justifyContent: 'center',
  },
  tagPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  tagPillText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  allergenCard: {
    width: '100%',
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
  },
  allergenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  allergenIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allergenTextWrap: {
    flex: 1,
  },
  allergenLabel: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: '#E67E22',
    marginBottom: 2,
  },
  allergenText: {
    fontSize: 13,
    fontWeight: '500' as const,
    color: '#E67E22',
  },
  sectionCard: {
    width: '100%',
    marginTop: 18,
    padding: 18,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowOpacity: 0.08,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 4 },
      },
    }),
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 16,
    letterSpacing: -0.2,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 23,
  },
  nutritionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  nutritionItem: {
    alignItems: 'center',
    minWidth: 60,
    paddingVertical: 10,
    paddingHorizontal: 8,
    flex: 1,
  },
  nutritionIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  nutritionIcon: {
    fontSize: 18,
  },
  nutritionValue: {
    fontSize: 17,
    fontWeight: '700' as const,
    marginBottom: 2,
  },
  nutritionLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
  },
  updatedText: {
    fontSize: 12,
    marginTop: 18,
  },
  bottomPad: {
    height: 32,
  },
});
