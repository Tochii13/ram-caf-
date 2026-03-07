import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { UtensilsCrossed } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import { useMenuStore } from '@/contexts/MenuStoreContext';
import { DietaryTag, DIETARY_TAG_LABELS, MealPeriod, MEAL_PERIOD_LABELS, MEAL_PERIOD_TIMES, MenuItem, WeeklyMenuItem } from '@/types';

const ALL_DIETARY_TAGS: DietaryTag[] = ['vegetarian', 'vegan', 'glutenFree', 'highProtein', 'dairyFree', 'nutFree', 'halal'];

type MenuTab = 'today' | 'week';

interface FormProps {
  visible: boolean;
  item?: MenuItem | null;
  onClose: () => void;
}

function MenuItemForm({ visible, item, onClose }: FormProps) {
  const { addItem, updateItem } = useMenuStore();
  const [name, setName] = useState<string>(item?.name ?? '');
  const [emoji, setEmoji] = useState<string>(item?.emoji ?? '🍽️');
  const [description, setDescription] = useState<string>(item?.description ?? '');
  const [calories, setCalories] = useState<string>(item ? String(item.calories) : '');
  const [mealPeriod, setMealPeriod] = useState<MealPeriod>(item?.mealPeriod ?? 'breakfast');
  const [selectedTags, setSelectedTags] = useState<DietaryTag[]>(item?.dietaryTags ?? []);
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    setName(item?.name ?? '');
    setEmoji(item?.emoji ?? '🍽️');
    setDescription(item?.description ?? '');
    setCalories(item ? String(item.calories) : '');
    setMealPeriod(item?.mealPeriod ?? 'breakfast');
    setSelectedTags(item?.dietaryTags ?? []);
    setError('');
  }, [item, visible]);

  const toggleTag = (tag: DietaryTag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((entry) => entry !== tag) : [...prev, tag]));
  };

  const handleSave = () => {
    const parsedCalories = Number.parseInt(calories, 10);
    if (!name.trim() || !description.trim() || !calories.trim()) {
      setError('Name, description, and calories are required.');
      return;
    }
    if (Number.isNaN(parsedCalories) || parsedCalories <= 0) {
      setError('Calories must be a positive integer.');
      return;
    }

    const nextItem: MenuItem = {
      id: item?.id ?? `menu-${Date.now()}`,
      name: name.trim(),
      emoji: emoji.trim() || '🍽️',
      description: description.trim(),
      calories: parsedCalories,
      mealPeriod,
      dietaryTags: selectedTags,
      allergens: item?.allergens ?? [],
      ingredients: item?.ingredients ?? '',
      nutrition: item?.nutrition ?? { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      availability: item?.availability ?? 'available',
      lastUpdated: new Date(),
    };

    if (item) {
      updateItem(nextItem);
    } else {
      addItem(nextItem);
    }
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalShell}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></Pressable>
          <Text style={styles.modalTitle}>{item ? 'Edit Item' : 'New Item'}</Text>
          <Pressable onPress={handleSave}><Text style={styles.saveText}>Save</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.formContent}>
          <Card style={styles.formCard}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Herb Rice Bowl" placeholderTextColor={Colors.textSecondary} />
            <Text style={styles.label}>Emoji</Text>
            <View style={styles.emojiRow}>
              <TextInput value={emoji} onChangeText={setEmoji} style={[styles.input, styles.emojiInput]} maxLength={2} placeholder="🍽️" placeholderTextColor={Colors.textSecondary} />
              <View style={styles.emojiPreview}><Text style={styles.emojiPreviewText}>{emoji || '🍽️'}</Text></View>
            </View>
            <Text style={styles.label}>Description</Text>
            <TextInput value={description} onChangeText={setDescription} style={[styles.input, styles.textArea]} multiline placeholder="Describe the dish" placeholderTextColor={Colors.textSecondary} />
            <Text style={styles.label}>Calories</Text>
            <TextInput value={calories} onChangeText={setCalories} style={styles.input} keyboardType="number-pad" placeholder="420" placeholderTextColor={Colors.textSecondary} />
            <Text style={styles.label}>Meal Period</Text>
            <View style={styles.segmentRow}>
              {(['breakfast', 'lunch', 'dinner'] as MealPeriod[]).map((period) => (
                <Pressable key={period} onPress={() => setMealPeriod(period)} style={[styles.segmentButton, mealPeriod === period && styles.segmentButtonActive]}>
                  <Text style={[styles.segmentText, mealPeriod === period && styles.segmentTextActive]}>{MEAL_PERIOD_LABELS[period]}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Dietary Tags</Text>
            <View style={styles.tagsGrid}>
              {ALL_DIETARY_TAGS.map((tag) => (
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
              {ALL_DIETARY_TAGS.map((tag) => (
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

function EmptyPeriod() {
  return (
    <View style={styles.emptyPeriod}>
      <UtensilsCrossed size={36} color={Colors.textSecondary} />
      <Text style={styles.emptyPeriodTitle}>No items for this period.</Text>
      <Text style={styles.emptyPeriodSub}>Tap ＋ to add one.</Text>
    </View>
  );
}

export default function AdminMenuScreen() {
  const { menuItems, weeklyDays, deleteItem, removeWeeklyItem } = useMenuStore();
  const [tab, setTab] = useState<MenuTab>('today');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formVisible, setFormVisible] = useState<boolean>(false);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [weeklyForm, setWeeklyForm] = useState<{ period: MealPeriod; dayId: string } | null>(null);

  const grouped = useMemo(() => ({
    breakfast: menuItems.filter((item) => item.mealPeriod === 'breakfast'),
    lunch: menuItems.filter((item) => item.mealPeriod === 'lunch'),
    dinner: menuItems.filter((item) => item.mealPeriod === 'dinner'),
  }), [menuItems]);

  const selectedDay = weeklyDays[selectedDayIndex] ?? weeklyDays[0];

  const weeklyByPeriod = useMemo(() => {
    const map: Record<MealPeriod, WeeklyMenuItem[]> = { breakfast: [], lunch: [], dinner: [] };
    selectedDay?.items.forEach((item) => {
      map[item.mealPeriod].push(item);
    });
    return map;
  }, [selectedDay]);

  const openNew = () => {
    setEditingItem(null);
    setFormVisible(true);
  };

  const openEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormVisible(true);
  };

  const confirmDelete = (item: MenuItem) => {
    Alert.alert(`Delete ${item.name}?`, 'This will remove it from the student menu immediately.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.screen}>
        <View style={styles.tabBar}>
          <Pressable onPress={() => setTab('today')} style={[styles.tabItem, tab === 'today' && styles.tabItemActive]}>
            <Text style={[styles.tabItemText, tab === 'today' && styles.tabItemTextActive]}>Today</Text>
          </Pressable>
          <Pressable onPress={() => setTab('week')} style={[styles.tabItem, tab === 'week' && styles.tabItemActive]}>
            <Text style={[styles.tabItemText, tab === 'week' && styles.tabItemTextActive]}>This Week</Text>
          </Pressable>
          <View style={styles.tabSpacer} />
          <Pressable onPress={tab === 'today' ? openNew : undefined} style={styles.addButton} testID="admin-add-item">
            <Text style={styles.addButtonText}>＋ Add Item</Text>
          </Pressable>
        </View>

        {tab === 'today' ? (
          <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
            {(['breakfast', 'lunch', 'dinner'] as MealPeriod[]).map((period) => (
              <View key={period} style={styles.periodSection}>
                <Text style={styles.periodSectionTitle}>{MEAL_PERIOD_LABELS[period]}</Text>
                <Card style={styles.listCard}>
                  {grouped[period].length === 0 ? (
                    <EmptyPeriod />
                  ) : (
                    grouped[period].map((item, index) => (
                      <View key={item.id} style={index < grouped[period].length - 1 ? styles.rowBorder : undefined}>
                        <Swipeable renderRightActions={() => (
                          <Pressable onPress={() => confirmDelete(item)} style={styles.deleteAction}><Text style={styles.deleteActionText}>Delete</Text></Pressable>
                        )}>
                          <Pressable onPress={() => openEdit(item)} style={({ pressed }) => [styles.menuRow, pressed && styles.rowPressed]}>
                            <Text style={styles.rowEmoji}>{item.emoji}</Text>
                            <View style={styles.rowInfo}>
                              <Text style={styles.rowName}>{item.name}</Text>
                              <Text style={styles.rowMeta}>{item.calories} cal</Text>
                            </View>
                          </Pressable>
                        </Swipeable>
                      </View>
                    ))
                  )}
                </Card>
              </View>
            ))}
            <View style={styles.bottomPad} />
          </ScrollView>
        ) : (
          <View style={styles.weekView}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayPickerRow} style={styles.dayPickerScroll}>
              {weeklyDays.map((day, index) => {
                const selected = index === selectedDayIndex;
                return (
                  <Pressable key={day.id} onPress={() => setSelectedDayIndex(index)} style={[styles.dayChip, selected && styles.dayChipSelected]}>
                    <Text style={[styles.dayChipWeekday, selected && styles.dayChipWeekdaySelected]}>{day.weekday.slice(0, 3)}</Text>
                    <Text style={[styles.dayChipDate, selected && styles.dayChipDateSelected]}>{day.dateLabel.split(' ')[1]}</Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <ScrollView contentContainerStyle={styles.listContent} showsVerticalScrollIndicator={false}>
              {(['breakfast', 'lunch', 'dinner'] as MealPeriod[]).map((period) => (
                <Card key={period} style={styles.weeklyPeriodCard}>
                  <View style={styles.weeklyPeriodTop}>
                    <Text style={styles.weeklyPeriodTitle}>{MEAL_PERIOD_LABELS[period]}</Text>
                    <Text style={styles.weeklyPeriodTime}>{MEAL_PERIOD_TIMES[period].timeRange}</Text>
                  </View>
                  <View style={styles.weeklyPeriodBody}>
                    {weeklyByPeriod[period].map((item, index) => (
                      <View key={item.id} style={index < weeklyByPeriod[period].length - 1 ? styles.rowBorder : undefined}>
                        <Swipeable renderRightActions={() => (
                          <Pressable onPress={() => removeWeeklyItem(item.id, selectedDay.id)} style={styles.deleteAction}><Text style={styles.deleteActionText}>Delete</Text></Pressable>
                        )}>
                          <View style={styles.weeklyItemRow}>
                            <Text style={styles.rowEmoji}>{item.emoji}</Text>
                            <Text style={styles.weeklyItemName}>{item.name}</Text>
                            <Text style={styles.weeklyItemCal}>{item.calories} cal</Text>
                          </View>
                        </Swipeable>
                      </View>
                    ))}
                    <Pressable onPress={() => setWeeklyForm({ period, dayId: selectedDay.id })} style={({ pressed }) => [styles.addRow, pressed && styles.rowPressed]}>
                      <Text style={styles.addRowText}>＋ Add Item</Text>
                    </Pressable>
                  </View>
                </Card>
              ))}
              <View style={styles.bottomPad} />
            </ScrollView>
          </View>
        )}
      </View>
      <MenuItemForm visible={formVisible} item={editingItem} onClose={() => setFormVisible(false)} />
      {weeklyForm ? <WeeklyItemForm visible period={weeklyForm.period} dayId={weeklyForm.dayId} onClose={() => setWeeklyForm(null)} /> : null}
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundMain },
  tabBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 4 },
  tabItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.chipUnselected },
  tabItemActive: { backgroundColor: Colors.brandPrimary },
  tabItemText: { fontSize: 14, fontWeight: '600' as const, color: Colors.textSecondary },
  tabItemTextActive: { color: Colors.white },
  tabSpacer: { flex: 1 },
  addButton: { paddingHorizontal: 12, paddingVertical: 8 },
  addButtonText: { color: Colors.brandPrimary, fontSize: 14, fontWeight: '700' as const },
  listContent: { padding: 16, paddingTop: 8 },
  periodSection: { marginBottom: 18 },
  periodSectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.textPrimary, marginBottom: 10 },
  listCard: { padding: 4 },
  menuRow: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowPressed: { opacity: 0.65 },
  rowEmoji: { fontSize: 24 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '600' as const, color: Colors.textPrimary },
  rowMeta: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  deleteAction: { backgroundColor: Colors.destructive, justifyContent: 'center', alignItems: 'center', width: 92 },
  deleteActionText: { color: Colors.white, fontWeight: '700' as const },
  emptyPeriod: { alignItems: 'center', padding: 24, gap: 8 },
  emptyPeriodTitle: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' as const },
  emptyPeriodSub: { fontSize: 13, color: Colors.textSecondary },
  weekView: { flex: 1 },
  dayPickerScroll: { flexGrow: 0 },
  dayPickerRow: { paddingHorizontal: 16, paddingBottom: 8, gap: 10 },
  dayChip: { width: 64, minHeight: 70, borderRadius: 10, backgroundColor: Colors.backgroundCard, borderWidth: 1, borderColor: Colors.borderSubtle, alignItems: 'center', justifyContent: 'center' },
  dayChipSelected: { backgroundColor: Colors.brandPrimary, borderColor: Colors.brandPrimary },
  dayChipWeekday: { fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary },
  dayChipWeekdaySelected: { color: Colors.white },
  dayChipDate: { marginTop: 4, fontSize: 16, fontWeight: '700' as const, color: Colors.textPrimary },
  dayChipDateSelected: { color: Colors.white },
  weeklyPeriodCard: { marginBottom: 14, overflow: 'hidden' as const },
  weeklyPeriodTop: { backgroundColor: Colors.surfaceTimeBlock, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weeklyPeriodTitle: { fontSize: 17, fontWeight: '600' as const, color: Colors.textPrimary },
  weeklyPeriodTime: { fontSize: 13, color: Colors.textSecondary },
  weeklyPeriodBody: { backgroundColor: Colors.backgroundCard },
  weeklyItemRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 8 },
  weeklyItemName: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  weeklyItemCal: { fontSize: 13, color: Colors.textSecondary },
  addRow: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  addRowText: { color: Colors.brandPrimary, fontSize: 14, fontWeight: '700' as const },
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
  textArea: { minHeight: 92, paddingTop: 12, textAlignVertical: 'top' as const },
  emojiRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiInput: { flex: 1 },
  emojiPreview: { width: 48, height: 48, borderRadius: 12, backgroundColor: Colors.surfaceTimeBlock, alignItems: 'center', justifyContent: 'center' },
  emojiPreviewText: { fontSize: 24 },
  segmentRow: { flexDirection: 'row', gap: 8, marginTop: 2 },
  segmentButton: { flex: 1, minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderSubtle, alignItems: 'center', justifyContent: 'center' },
  segmentButtonActive: { backgroundColor: Colors.brandPrimary, borderColor: Colors.brandPrimary },
  segmentText: { color: Colors.textPrimary, fontSize: 13, fontWeight: '600' as const },
  segmentTextActive: { color: Colors.white },
  tagsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  tagButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.chipUnselected },
  tagButtonActive: { backgroundColor: Colors.brandPrimary },
  tagButtonText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' as const },
  tagButtonTextActive: { color: Colors.white },
  errorText: { color: Colors.destructive, fontSize: 13, marginTop: 12 },
});
