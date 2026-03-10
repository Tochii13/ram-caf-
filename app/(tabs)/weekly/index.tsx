import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { getColors } from '@/constants/colors';
import FlowTagList from '@/components/FlowTagList';
import { useMenuStore } from '@/contexts/MenuStoreContext';
import { useSession } from '@/contexts/SessionContext';
import {
  ALLERGEN_LABELS,
  Allergen,
  DIETARY_TAG_EMOJIS,
  DIETARY_TAG_LABELS,
  MealPeriod,
  MEAL_PERIOD_LABELS,
  MEAL_PERIOD_TIMES,
  MEAL_PERIOD_TIMES_WEEKDAY,
  MEAL_PERIOD_TIMES_WEEKEND,
  MenuItem,
  WeeklyMenuItem,
} from '@/types';

function getTimeRangeForPeriod(period: MealPeriod, isWeekend: boolean): string {
  if (isWeekend && (period === 'brunch' || period === 'dinner')) return MEAL_PERIOD_TIMES_WEEKEND[period].timeRange;
  if (period in MEAL_PERIOD_TIMES_WEEKDAY) return MEAL_PERIOD_TIMES_WEEKDAY[period as keyof typeof MEAL_PERIOD_TIMES_WEEKDAY].timeRange;
  return MEAL_PERIOD_TIMES[period].timeRange;
}

function WeeklyMenuItemRow({
  item,
  colors,
  highContrast,
  allergens,
}: {
  item: WeeklyMenuItem;
  colors: ReturnType<typeof getColors>;
  highContrast: boolean;
  allergens?: Allergen[];
}) {
  const { effectiveAllergies } = useSession();

  const warningAllergens = useMemo<Allergen[]>(() => {
    if (!allergens || allergens.length === 0 || effectiveAllergies.length === 0) return [];
    return allergens.filter((a) => effectiveAllergies.includes(a));
  }, [allergens, effectiveAllergies]);

  const warningText = useMemo(
    () => warningAllergens.map((a) => ALLERGEN_LABELS[a]).join(', '),
    [warningAllergens],
  );

  const showCaution = warningAllergens.length > 0;

  return (
    <View
      style={styles.menuRow}
      accessible
      accessibilityLabel={`${item.name}, ${item.calories} calories. ${item.description || ''}. ${item.dietaryTags.map((t) => DIETARY_TAG_LABELS[t]).join(', ')}`}
    >
      <View style={styles.menuRowTop}>
        <View style={[styles.menuEmojiSquare, { backgroundColor: colors.surfaceTimeBlock }]} accessible={false}>
          <Text style={styles.menuEmoji}>{item.emoji}</Text>
        </View>
        <View style={styles.menuRowContent}>
          <View style={styles.menuNameRow}>
            <Text style={[styles.menuName, { color: colors.textPrimary }]} numberOfLines={1}>{item.name}</Text>
            <Text style={[styles.menuCalories, { color: colors.textSecondary }]}>{item.calories} cal</Text>
          </View>
          {item.description ? (
            <Text style={[styles.menuDescription, { color: colors.textSecondary }]} numberOfLines={2}>{item.description}</Text>
          ) : null}
          {item.dietaryTags.length > 0 ? (
            <FlowTagList style={styles.tagsWrap}>
              {item.dietaryTags.map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.tagPill,
                    highContrast
                      ? { backgroundColor: colors.brandPrimary }
                      : { backgroundColor: colors.brandPrimaryMedium },
                  ]}
                >
                  <Text style={[styles.tagPillText, { color: highContrast ? '#FFFFFF' : colors.brandPrimary }]}>
                    {DIETARY_TAG_EMOJIS[tag]} {DIETARY_TAG_LABELS[tag]}
                  </Text>
                </View>
              ))}
            </FlowTagList>
          ) : null}
          {showCaution ? (
            <View style={[styles.menuWarningRow, { backgroundColor: 'rgba(230,126,34,0.08)' }]}>
              <Text
                style={[
                  styles.menuWarningText,
                  highContrast && styles.menuWarningTextHighContrast,
                ]}
              >
                ⚠️ Contains {warningText}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

export default function WeeklyScreen() {
  const { weeklyDays, menuItems } = useMenuStore();
  const { resolvedColorScheme, highContrastEnabled } = useSession();
  const colors = getColors(resolvedColorScheme, highContrastEnabled);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const contentFade = useRef(new Animated.Value(1)).current;
  const contentSlide = useRef(new Animated.Value(0)).current;

  const baseItemsByName = useMemo(() => {
    const map: Record<string, MenuItem> = {};
    menuItems.forEach((item) => {
      map[item.name.toLowerCase()] = item;
    });
    return map;
  }, [menuItems]);

  useEffect(() => {
    const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    const foundIndex = weeklyDays.findIndex((item) => item.weekday === weekday);
    setSelectedIndex(foundIndex >= 0 ? foundIndex : 0);
  }, [weeklyDays]);

  const animateContentChange = () => {
    contentFade.setValue(0);
    contentSlide.setValue(12);
    Animated.parallel([
      Animated.timing(contentFade, { toValue: 1, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }),
      Animated.timing(contentSlide, { toValue: 0, duration: 250, easing: Easing.out(Easing.ease), useNativeDriver: true }),
    ]).start();
  };

  const handleSelectDay = (index: number) => {
    if (index === selectedIndex) return;
    if (Platform.OS !== 'web') void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIndex(index);
    animateContentChange();
  };

  const handlePrev = () => {
    if (selectedIndex > 0) handleSelectDay(selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex < weeklyDays.length - 1) handleSelectDay(selectedIndex + 1);
  };

  const selectedDay = weeklyDays[selectedIndex] ?? weeklyDays[0];

  return (
    <View style={[styles.screen, { backgroundColor: colors.backgroundMain }]}>
      <View style={styles.dayStripContainer}>
        <Pressable
          onPress={handlePrev}
          style={[styles.arrowButton, { opacity: selectedIndex > 0 ? 1 : 0.3 }]}
          disabled={selectedIndex === 0}
          accessibilityLabel="Previous day"
          accessibilityRole="button"
          hitSlop={8}
        >
          <ChevronLeft size={22} color={colors.textSecondary} />
        </Pressable>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.dayStripContent}
          style={styles.dayStrip}
        >
          {weeklyDays.map((day, index) => {
            const selected = index === selectedIndex;
            const dateNum = day.dateLabel.split(' ')[1] ?? '';
            const isToday = day.weekday === new Date().toLocaleDateString('en-US', { weekday: 'long' });
            return (
              <Pressable
                key={day.id}
                onPress={() => handleSelectDay(index)}
                style={[
                  styles.dayCardTop,
                  {
                    backgroundColor: selected ? colors.brandPrimary : colors.backgroundCard,
                    shadowColor: colors.shadow,
                  },
                ]}
                accessibilityLabel={`${day.weekday}, ${day.dateLabel}`}
                accessibilityRole="button"
                accessibilityState={{ selected }}
              >
                <Text style={[styles.dayCardTopWeekday, { color: selected ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                  {day.weekday.slice(0, 3).toUpperCase()}
                </Text>
                <Text style={[styles.dayCardTopDate, { color: selected ? '#FFFFFF' : colors.textPrimary }]}>{dateNum}</Text>
                {isToday && !selected ? (
                  <View style={[styles.todayDot, { backgroundColor: colors.brandPrimary }]} />
                ) : null}
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable
          onPress={handleNext}
          style={[styles.arrowButton, { opacity: selectedIndex < weeklyDays.length - 1 ? 1 : 0.3 }]}
          disabled={selectedIndex >= weeklyDays.length - 1}
          accessibilityLabel="Next day"
          accessibilityRole="button"
          hitSlop={8}
        >
          <ChevronRight size={22} color={colors.textSecondary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {selectedDay ? (() => {
          const isWeekendDay = ['Saturday', 'Sunday'].includes(selectedDay.weekday);
          const periods = isWeekendDay ? (['brunch', 'dinner'] as const) : (['breakfast', 'lunch', 'dinner'] as const);
          const dayItemsByPeriod: Record<string, WeeklyMenuItem[]> = { breakfast: [], lunch: [], dinner: [], brunch: [] };
          selectedDay.items.forEach((item) => dayItemsByPeriod[item.mealPeriod].push(item));
          if (isWeekendDay) dayItemsByPeriod.brunch = [...dayItemsByPeriod.breakfast, ...dayItemsByPeriod.lunch];
          return (
            <Animated.View style={{ opacity: contentFade, transform: [{ translateY: contentSlide }] }}>
              <Text style={[styles.weekTitle, { color: colors.textSecondary }]}>
                {selectedDay.weekday} · {selectedDay.dateLabel}
              </Text>
              {periods.map((period) => {
                const items = dayItemsByPeriod[period] ?? [];
                const timeRange = getTimeRangeForPeriod(period, isWeekendDay);
                return (
                  <View key={period} style={[styles.periodCard, { backgroundColor: colors.backgroundCard, shadowColor: colors.shadow }]}>
                    <View style={[styles.periodTop, { backgroundColor: colors.surfaceTimeBlock }]}>
                      <Text style={[styles.periodTitle, { color: colors.textPrimary }]}>{MEAL_PERIOD_LABELS[period]}</Text>
                      <Text style={[styles.periodTime, { color: colors.textSecondary }]}>{timeRange}</Text>
                    </View>
                    <View style={styles.periodBody}>
                      {items.map((item, i) => {
                        const base = baseItemsByName[item.name.toLowerCase()];
                        return (
                          <View
                            key={item.id}
                            style={[
                              styles.periodRowWrap,
                              i < items.length - 1 && {
                                borderBottomWidth: 0.5,
                                borderBottomColor: colors.borderSubtle,
                              },
                            ]}
                          >
                            <WeeklyMenuItemRow
                              item={item}
                              colors={colors}
                              highContrast={highContrastEnabled}
                              allergens={base?.allergens}
                            />
                          </View>
                        );
                      })}
                      {items.length === 0 ? (
                        <View style={styles.periodRowWrap}>
                          <Text style={[styles.emptyPeriodText, { color: colors.textSecondary }]}>No items planned yet.</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>
                );
              })}
              <View style={styles.bottomPad} />
            </Animated.View>
          );
        })() : (
          <Text style={[styles.emptyPeriodText, { color: colors.textSecondary }]}>Select a day above.</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  dayStripContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  arrowButton: {
    width: 36,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayStrip: {
    flex: 1,
    flexGrow: 0,
  },
  dayStripContent: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 4,
  },
  dayCardTop: {
    minWidth: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
      android: { elevation: 1 },
      web: {
        shadowOpacity: 0.06,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
      },
    }),
  },
  dayCardTopWeekday: {
    fontSize: 11,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  dayCardTopDate: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginTop: 4,
  },
  todayDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginTop: 4,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  weekTitle: {
    fontSize: 13,
    fontWeight: '600' as const,
    letterSpacing: 0.5,
    marginBottom: 14,
    textTransform: 'uppercase' as const,
  },
  periodCard: {
    marginBottom: 16,
    overflow: 'hidden' as const,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
      android: { elevation: 2 },
      web: {
        shadowOpacity: 0.07,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 3 },
      },
    }),
  },
  periodTop: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodTitle: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  periodTime: {
    fontSize: 13,
  },
  periodBody: {},
  periodRowWrap: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emptyPeriodText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 8,
  },
  menuRow: {
    gap: 0,
  },
  menuRowTop: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  menuEmojiSquare: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: {
    fontSize: 20,
  },
  menuRowContent: {
    flex: 1,
  },
  menuNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  menuName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  menuCalories: {
    fontSize: 13,
  },
  menuDescription: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  tagsWrap: {
    marginTop: 8,
  },
  tagPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  menuWarningRow: {
    marginTop: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  menuWarningText: {
    fontSize: 11,
    color: '#E67E22',
    fontWeight: '600' as const,
  },
  menuWarningTextHighContrast: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  bottomPad: {
    height: 24,
  },
});
