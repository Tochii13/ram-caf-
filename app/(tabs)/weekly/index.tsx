import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { getColors } from '@/constants/colors';
import Card from '@/components/Card';
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
                      : { backgroundColor: 'rgba(155,64,64,0.15)' },
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
            <View style={styles.menuWarningRow}>
              <Text
                style={[
                  styles.menuWarningText,
                  highContrast && styles.menuWarningTextHighContrast,
                ]}
              >
                ⚠️ Caution: contains {warningText}
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

  const selectedDay = weeklyDays[selectedIndex] ?? weeklyDays[0];

  return (
    <View style={[styles.screen, { backgroundColor: colors.backgroundMain }]}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayStripContent}
        style={styles.dayStrip}
      >
        {weeklyDays.map((day, index) => {
          const selected = index === selectedIndex;
          const dateNum = day.dateLabel.split(' ')[1] ?? '';
          return (
            <Pressable
              key={day.id}
              onPress={() => setSelectedIndex(index)}
              style={[styles.dayCardTop, { backgroundColor: colors.backgroundCard }]}
              accessibilityLabel={`${day.weekday}, ${day.dateLabel}`}
              accessibilityRole="button"
              accessibilityState={{ selected }}
            >
              <Text style={[styles.dayCardTopWeekday, { color: selected ? colors.brandPrimary : colors.textSecondary }]}>
                {day.weekday.slice(0, 3).toUpperCase()}
              </Text>
              <View style={[styles.dayCardTopDateWrap, selected && { backgroundColor: colors.brandPrimary }]}>
                <Text style={[styles.dayCardTopDate, { color: selected ? '#FFFFFF' : colors.textPrimary }]}>{dateNum}</Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {selectedDay ? (() => {
          const isWeekendDay = ['Saturday', 'Sunday'].includes(selectedDay.weekday);
          const periods = isWeekendDay ? (['brunch', 'dinner'] as const) : (['breakfast', 'lunch', 'dinner'] as const);
          const dayItemsByPeriod: Record<string, WeeklyMenuItem[]> = { breakfast: [], lunch: [], dinner: [], brunch: [] };
          selectedDay.items.forEach((item) => dayItemsByPeriod[item.mealPeriod].push(item));
          if (isWeekendDay) dayItemsByPeriod.brunch = [...dayItemsByPeriod.breakfast, ...dayItemsByPeriod.lunch];
          return (
            <>
              <Text style={[styles.weekTitle, { color: colors.textSecondary }]}>{selectedDay.weekday}, {selectedDay.dateLabel}</Text>
              {periods.map((period) => {
                const items = dayItemsByPeriod[period] ?? [];
                const timeRange = getTimeRangeForPeriod(period, isWeekendDay);
                return (
                  <Card key={period} style={styles.periodCard}>
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
                                borderBottomWidth: 1,
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
                          <Text style={[styles.emptyPeriodText, { color: colors.textSecondary }]}>No items for this period.</Text>
                        </View>
                      ) : null}
                    </View>
                  </Card>
                );
              })}
              <View style={styles.bottomPad} />
            </>
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
  // New top day strip (SUN 8, MON 9, etc.)
  dayStrip: {
    flexGrow: 0,
  },
  dayStripContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 8,
  },
  dayCardTop: {
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  dayCardTopWeekday: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.3,
  },
  dayCardTopDateWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  dayCardTopDate: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  // Old picker styles (no longer used, safe to keep)
  dayPickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  arrowButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayPickerScroll: {
    flex: 1,
    flexGrow: 0,
  },
  dayPickerRow: {
    paddingTop: 6,
    paddingBottom: 2,
    gap: 10,
  },
  dayChip: {
    width: 64,
    minHeight: 70,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayChipWeekday: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  dayChipDate: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: '700' as const,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 24,
  },
  weekTitle: {
    fontSize: 12,
    fontWeight: '600' as const,
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  dayCard: {
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    overflow: 'hidden' as const,
  },
  dayCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  dayCardWeekday: {
    fontSize: 17,
    fontWeight: '700' as const,
  },
  dayCardDate: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  dayCardBadge: {
    marginLeft: 'auto' as const,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  dayCardBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600' as const,
  },
  dayCardBody: {
    paddingHorizontal: 0,
    paddingBottom: 12,
  },
  dayCardPeriod: {
    marginTop: 0,
  },
  dayCardPeriodHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 12,
    borderRadius: 8,
    marginBottom: 4,
  },
  dayCardPreview: {
    fontSize: 13,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  bottomPad: {
    height: 24,
  },
  periodCard: {
    marginBottom: 14,
    overflow: 'hidden' as const,
  },
  periodTop: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodTitle: {
    fontSize: 17,
    fontWeight: '600' as const,
  },
  periodTime: {
    fontSize: 13,
  },
  periodBody: {},
  periodRowWrap: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyPeriodText: {
    fontSize: 14,
    textAlign: 'center',
  },
  menuRow: {
    gap: 0,
  },
  menuRowTop: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
  },
  menuEmojiSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: {
    fontSize: 18,
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
    fontSize: 15,
    fontWeight: '500' as const,
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
    paddingVertical: 3,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '500' as const,
  },
  menuWarningRow: {
    marginTop: 8,
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
});
