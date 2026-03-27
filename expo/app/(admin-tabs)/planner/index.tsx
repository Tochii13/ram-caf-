import React, { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import FlowTagList from '@/components/FlowTagList';
import { useMenuStore } from '@/contexts/MenuStoreContext';
import { DietaryTag, DIETARY_TAG_LABELS, MealPeriod, MEAL_PERIOD_LABELS, MEAL_PERIOD_TIMES, WeeklyMenuItem } from '@/types';

function WeeklyItemForm({ visible, period, dayId, onClose }: { visible: boolean; period: MealPeriod; dayId: string; onClose: () => void }) {
  const { addWeeklyItem } = useMenuStore();
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [calories, setCalories] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<DietaryTag[]>([]);
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (visible) {
      setName('');
      setDescription('');
      setCalories('');
      setSelectedTags([]);
      setError('');
    }
  }, [visible]);

  const toggleTag = (tag: DietaryTag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag]));
  };

  const handleSave = () => {
    const parsedCalories = Number.parseInt(calories, 10);
    if (!name.trim() || !calories.trim()) {
      setError('Name and calories are required.');
      return;
    }
    if (Number.isNaN(parsedCalories) || parsedCalories <= 0) {
      setError('Calories must be a positive integer.');
      return;
    }
    addWeeklyItem({ id: `weekly-${Date.now()}`, name: name.trim(), description: description.trim(), calories: parsedCalories, dietaryTags: selectedTags, mealPeriod: period, emoji: '🍽️' }, dayId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalShell}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></Pressable>
          <Text style={styles.modalTitle}>Add to {MEAL_PERIOD_LABELS[period]}</Text>
          <Pressable onPress={handleSave}><Text style={styles.saveText}>Save</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.formContent}>
          <Card style={styles.formCard}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Weekend Brunch Bowl" placeholderTextColor={Colors.textSecondary} />
            <Text style={styles.label}>Description</Text>
            <TextInput value={description} onChangeText={setDescription} style={[styles.input, styles.textArea]} multiline placeholder="Describe the dish" placeholderTextColor={Colors.textSecondary} />
            <Text style={styles.label}>Calories</Text>
            <TextInput value={calories} onChangeText={setCalories} style={styles.input} keyboardType="number-pad" placeholder="390" placeholderTextColor={Colors.textSecondary} />
            <Text style={styles.label}>Dietary Tags</Text>
            <View style={styles.tagsGrid}>
              {(['vegetarian', 'vegan', 'glutenFree', 'highProtein'] as DietaryTag[]).map((tag) => (
                <Pressable key={tag} onPress={() => toggleTag(tag)} style={[styles.tagButton, selectedTags.includes(tag) && styles.tagButtonActive]}>
                  <Text style={[styles.tagButtonText, selectedTags.includes(tag) && styles.tagButtonTextActive]}>{DIETARY_TAG_LABELS[tag]}</Text>
                </Pressable>
              ))}
            </View>
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function AdminPlannerScreen() {
  const { weeklyDays, removeWeeklyItem } = useMenuStore();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeForm, setActiveForm] = useState<{ period: MealPeriod; dayId: string } | null>(null);

  const selectedDay = weeklyDays[selectedIndex] ?? weeklyDays[0];

  const itemsByPeriod = useMemo(() => {
    const map: Record<MealPeriod, WeeklyMenuItem[]> = { breakfast: [], lunch: [], dinner: [] };
    selectedDay?.items.forEach((item) => {
      map[item.mealPeriod].push(item);
    });
    return map;
  }, [selectedDay]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.screen}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayPickerRow} style={styles.dayPickerScroll}>
          {weeklyDays.map((day, index) => {
            const selected = index === selectedIndex;
            return (
              <Pressable key={day.id} onPress={() => setSelectedIndex(index)} style={[styles.dayChip, selected && styles.dayChipSelected]}>
                <Text style={[styles.dayChipWeekday, selected && styles.dayChipWeekdaySelected]}>{day.weekday.slice(0, 3)}</Text>
                <Text style={[styles.dayChipDate, selected && styles.dayChipDateSelected]}>{day.dateLabel.split(' ')[1]}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {(['breakfast', 'lunch', 'dinner'] as MealPeriod[]).map((period) => (
            <Card key={period} style={styles.periodCard}>
              <View style={styles.periodTop}>
                <Text style={styles.periodTitle}>{MEAL_PERIOD_LABELS[period]}</Text>
                <Text style={styles.periodTime}>{MEAL_PERIOD_TIMES[period].timeRange}</Text>
              </View>
              <View style={styles.periodBody}>
                {itemsByPeriod[period].map((item, index) => (
                  <View key={item.id} style={index < itemsByPeriod[period].length - 1 ? styles.rowBorder : undefined}>
                    <Swipeable renderRightActions={() => (
                      <Pressable onPress={() => removeWeeklyItem(item.id, selectedDay.id)} style={styles.deleteAction}><Text style={styles.deleteActionText}>Delete</Text></Pressable>
                    )}>
                      <View style={styles.weeklyRow}>
                        <View style={styles.weeklyRowTop}>
                          <Text style={styles.weeklyEmoji}>{item.emoji}</Text>
                          <Text style={styles.weeklyName}>{item.name}</Text>
                          <Text style={styles.weeklyCalories}>{item.calories} cal</Text>
                        </View>
                        {item.description ? <Text style={styles.weeklyDesc} numberOfLines={2}>{item.description}</Text> : null}
                        <FlowTagList style={styles.weeklyTags}>
                          {item.dietaryTags.map((tag) => (
                            <View key={tag} style={styles.tagPill}><Text style={styles.tagPillText}>{DIETARY_TAG_LABELS[tag]}</Text></View>
                          ))}
                        </FlowTagList>
                      </View>
                    </Swipeable>
                  </View>
                ))}
                <Pressable onPress={() => setActiveForm({ period, dayId: selectedDay.id })} style={({ pressed }) => [styles.addRow, pressed && styles.rowPressed]}>
                  <Text style={styles.addRowText}>＋ Add Item</Text>
                </Pressable>
              </View>
            </Card>
          ))}
          <View style={styles.bottomPad} />
        </ScrollView>
      </View>
      {activeForm ? <WeeklyItemForm visible period={activeForm.period} dayId={activeForm.dayId} onClose={() => setActiveForm(null)} /> : null}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundMain },
  dayPickerScroll: { flexGrow: 0 },
  dayPickerRow: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, gap: 10 },
  dayChip: { width: 64, minHeight: 70, borderRadius: 10, backgroundColor: Colors.backgroundCard, borderWidth: 1, borderColor: Colors.borderSubtle, alignItems: 'center', justifyContent: 'center' },
  dayChipSelected: { backgroundColor: Colors.brandPrimary, borderColor: Colors.brandPrimary },
  dayChipWeekday: { fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary },
  dayChipWeekdaySelected: { color: Colors.white },
  dayChipDate: { marginTop: 4, fontSize: 16, fontWeight: '700' as const, color: Colors.textPrimary },
  dayChipDateSelected: { color: Colors.white },
  content: { padding: 16, paddingTop: 8 },
  periodCard: { marginBottom: 14, overflow: 'hidden' as const },
  periodTop: { backgroundColor: Colors.surfaceTimeBlock, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  periodTitle: { fontSize: 17, fontWeight: '600' as const, color: Colors.textPrimary },
  periodTime: { fontSize: 13, color: Colors.textSecondary },
  periodBody: { backgroundColor: Colors.backgroundCard },
  weeklyRow: { paddingHorizontal: 14, paddingVertical: 12 },
  weeklyRowTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weeklyEmoji: { fontSize: 24 },
  weeklyName: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  weeklyCalories: { fontSize: 13, color: Colors.textSecondary },
  weeklyDesc: { marginLeft: 32, marginTop: 4, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  weeklyTags: { marginLeft: 32, marginTop: 8 },
  tagPill: { backgroundColor: 'rgba(155,64,64,0.15)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  tagPillText: { fontSize: 11, color: Colors.brandPrimary, fontWeight: '500' as const },
  addRow: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  addRowText: { color: Colors.brandPrimary, fontSize: 14, fontWeight: '700' as const },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  rowPressed: { opacity: 0.65 },
  deleteAction: { backgroundColor: Colors.destructive, justifyContent: 'center', alignItems: 'center', width: 92 },
  deleteActionText: { color: Colors.white, fontWeight: '700' as const },
  bottomPad: { height: 24 },
  modalShell: { flex: 1, backgroundColor: Colors.backgroundMain },
  modalHeader: { paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { fontSize: 17, fontWeight: '700' as const, color: Colors.textPrimary },
  cancelText: { color: Colors.textSecondary, fontSize: 15, fontWeight: '600' as const },
  saveText: { color: Colors.brandPrimary, fontSize: 15, fontWeight: '700' as const },
  formContent: { padding: 16 },
  formCard: { padding: 16 },
  label: { fontSize: 12, color: Colors.textSecondary, marginBottom: 6, marginTop: 10 },
  input: { minHeight: 44, borderWidth: 1, borderColor: Colors.borderSubtle, borderRadius: 12, paddingHorizontal: 12, color: Colors.textPrimary, backgroundColor: Colors.backgroundCard },
  textArea: { minHeight: 80, paddingTop: 12, textAlignVertical: 'top' as const },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tagButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.chipUnselected },
  tagButtonActive: { backgroundColor: Colors.brandPrimary },
  tagButtonText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' as const },
  tagButtonTextActive: { color: Colors.white },
  errorText: { color: Colors.destructive, fontSize: 13, marginTop: 12 },
});
