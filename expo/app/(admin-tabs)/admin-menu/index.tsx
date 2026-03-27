import React, { useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Plus, UtensilsCrossed } from 'lucide-react-native';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import FlowTagList from '@/components/FlowTagList';
import { useMenuStore } from '@/contexts/MenuStoreContext';
import { AvailabilityStatus, DietaryTag, DIETARY_TAG_LABELS, MealPeriod, MEAL_PERIOD_LABELS, MEAL_PERIOD_TIMES, MenuItem, WeeklyMenuItem } from '@/types';

type ViewMode = 'today' | 'week';

const ALL_DIETARY_TAGS: DietaryTag[] = ['vegetarian', 'vegan', 'glutenFree', 'highProtein', 'dairyFree', 'nutFree', 'halal'];

const AVAILABILITY_OPTIONS: { key: AvailabilityStatus; label: string }[] = [
  { key: 'available', label: 'Available' },
  { key: 'limited', label: 'Limited' },
  { key: 'soldOut', label: 'Sold Out' },
];

function MenuItemForm({ visible, item, onClose }: { visible: boolean; item?: MenuItem | null; onClose: () => void }) {
  const { addItem, updateItem } = useMenuStore();
  const [name, setName] = useState<string>(item?.name ?? '');
  const [emoji, setEmoji] = useState<string>(item?.emoji ?? '🍽️');
  const [description, setDescription] = useState<string>(item?.description ?? '');
  const [calories, setCalories] = useState<string>(item ? String(item.calories) : '');
  const [mealPeriod, setMealPeriod] = useState<MealPeriod>(item?.mealPeriod ?? 'breakfast');
  const [selectedTags, setSelectedTags] = useState<DietaryTag[]>(item?.dietaryTags ?? []);
  const [availability, setAvailability] = useState<AvailabilityStatus>(item?.availability ?? 'available');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    setName(item?.name ?? '');
    setEmoji(item?.emoji ?? '🍽️');
    setDescription(item?.description ?? '');
    setCalories(item ? String(item.calories) : '');
    setMealPeriod(item?.mealPeriod ?? 'breakfast');
    setSelectedTags(item?.dietaryTags ?? []);
    setAvailability(item?.availability ?? 'available');
    setError('');
  }, [item, visible]);

  const toggleTag = (tag: DietaryTag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSave = () => {
    const parsedCal = Number.parseInt(calories, 10);
    if (!name.trim() || !description.trim() || !calories.trim()) {
      setError('Name, description, and calories are required.');
      return;
    }
    if (Number.isNaN(parsedCal) || parsedCal <= 0) {
      setError('Calories must be a positive integer.');
      return;
    }
    const next: MenuItem = {
      id: item?.id ?? `menu-${Date.now()}`,
      name: name.trim(),
      emoji: emoji.trim() || '🍽️',
      description: description.trim(),
      calories: parsedCal,
      mealPeriod,
      dietaryTags: selectedTags,
      allergens: item?.allergens ?? [],
      ingredients: item?.ingredients ?? '',
      nutrition: item?.nutrition ?? { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      availability,
      lastUpdated: new Date(),
    };
    if (item) {
      updateItem(next);
    } else {
      addItem(next);
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
              {(['breakfast', 'lunch', 'dinner'] as MealPeriod[]).map((p) => (
                <Pressable key={p} onPress={() => setMealPeriod(p)} style={[styles.segmentButton, mealPeriod === p && styles.segmentButtonActive]}>
                  <Text style={[styles.segmentText, mealPeriod === p && styles.segmentTextActive]}>{MEAL_PERIOD_LABELS[p]}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Availability</Text>
            <View style={styles.segmentRow}>
              {AVAILABILITY_OPTIONS.map((opt) => (
                <Pressable key={opt.key} onPress={() => setAvailability(opt.key)} style={[styles.segmentButton, availability === opt.key && styles.segmentButtonActive]}>
                  <Text style={[styles.segmentText, availability === opt.key && styles.segmentTextActive]}>{opt.label}</Text>
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
  const [calories, setCalories] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<DietaryTag[]>([]);
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (visible) { setName(''); setCalories(''); setSelectedTags([]); setError(''); }
  }, [visible]);

  const toggleTag = (tag: DietaryTag) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handleSave = () => {
    const parsedCal = Number.parseInt(calories, 10);
    if (!name.trim() || !calories.trim()) { setError('Name and calories are required.'); return; }
    if (Number.isNaN(parsedCal) || parsedCal <= 0) { setError('Calories must be a positive integer.'); return; }
    addWeeklyItem({ id: `weekly-${Date.now()}`, name: name.trim(), description: '', calories: parsedCal, dietaryTags: selectedTags, mealPeriod: period, emoji: '🍽️' }, dayId);
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

function TodayMenuView() {
  const { menuItems, deleteItem } = useMenuStore();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formVisible, setFormVisible] = useState<boolean>(false);

  const grouped = useMemo(() => ({
    breakfast: menuItems.filter((i) => i.mealPeriod === 'breakfast'),
    lunch: menuItems.filter((i) => i.mealPeriod === 'lunch'),
    dinner: menuItems.filter((i) => i.mealPeriod === 'dinner'),
  }), [menuItems]);

  const openNew = () => { setEditingItem(null); setFormVisible(true); };
  const openEdit = (item: MenuItem) => { setEditingItem(item); setFormVisible(true); };
  const confirmDelete = (item: MenuItem) => {
    Alert.alert(`Delete ${item.name}?`, 'This will remove it from the student menu immediately.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteItem(item.id) },
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
        <Pressable onPress={openNew} style={styles.addItemBanner} testID="admin-menu-add-today">
          <Plus size={18} color={Colors.brandPrimary} />
          <Text style={styles.addItemBannerText}>Add Item</Text>
        </Pressable>
        {(['breakfast', 'lunch', 'dinner'] as MealPeriod[]).map((period) => (
          <View key={period} style={styles.periodSection}>
            <Text style={styles.periodSectionTitle}>{MEAL_PERIOD_LABELS[period]}</Text>
            {grouped[period].length === 0 ? (
              <Card style={styles.emptyCard}>
                <UtensilsCrossed size={36} color={Colors.textSecondary} />
                <Text style={styles.emptyText}>No items for this period.</Text>
                <Text style={styles.emptySubtext}>Tap + Add Item to add one.</Text>
              </Card>
            ) : (
              <Card style={styles.listCard}>
                {grouped[period].map((item, idx) => (
                  <View key={item.id} style={idx < grouped[period].length - 1 ? styles.rowBorder : undefined}>
                    <Swipeable renderRightActions={() => (
                      <Pressable onPress={() => confirmDelete(item)} style={styles.deleteAction}><Text style={styles.deleteActionText}>Delete</Text></Pressable>
                    )}>
                      <Pressable onPress={() => openEdit(item)} style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}>
                        <Text style={styles.rowEmoji}>{item.emoji}</Text>
                        <View style={styles.rowInfo}>
                          <Text style={styles.rowName}>{item.name}</Text>
                          <Text style={styles.rowMeta}>{item.calories} cal</Text>
                        </View>
                      </Pressable>
                    </Swipeable>
                  </View>
                ))}
              </Card>
            )}
          </View>
        ))}
      </ScrollView>
      <MenuItemForm visible={formVisible} item={editingItem} onClose={() => setFormVisible(false)} />
    </GestureHandlerRootView>
  );
}

function WeekMenuView() {
  const { weeklyDays, removeWeeklyItem } = useMenuStore();
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [activeForm, setActiveForm] = useState<{ period: MealPeriod; dayId: string } | null>(null);

  const selectedDay = weeklyDays[selectedIndex] ?? weeklyDays[0];

  const itemsByPeriod = useMemo(() => ({
    breakfast: selectedDay?.items.filter((i) => i.mealPeriod === 'breakfast') ?? [],
    lunch: selectedDay?.items.filter((i) => i.mealPeriod === 'lunch') ?? [],
    dinner: selectedDay?.items.filter((i) => i.mealPeriod === 'dinner') ?? [],
  }), [selectedDay]);

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
        <ScrollView contentContainerStyle={styles.screenContent}>
          {(['breakfast', 'lunch', 'dinner'] as MealPeriod[]).map((period) => (
            <Card key={period} style={styles.weekPeriodCard}>
              <View style={styles.weekPeriodTop}>
                <Text style={styles.weekPeriodTitle}>{MEAL_PERIOD_LABELS[period]}</Text>
                <Text style={styles.weekPeriodTime}>{MEAL_PERIOD_TIMES[period].timeRange}</Text>
              </View>
              <View style={styles.weekPeriodBody}>
                {itemsByPeriod[period].map((item: WeeklyMenuItem, idx: number) => (
                  <View key={item.id} style={idx < itemsByPeriod[period].length - 1 ? styles.rowBorder : undefined}>
                    <Swipeable renderRightActions={() => (
                      <Pressable onPress={() => removeWeeklyItem(item.id, selectedDay.id)} style={styles.deleteAction}><Text style={styles.deleteActionText}>Delete</Text></Pressable>
                    )}>
                      <View style={styles.weeklyItemRow}>
                        <View style={styles.weeklyItemTop}>
                          <Text style={styles.weeklyItemEmoji}>{item.emoji}</Text>
                          <Text style={styles.weeklyItemName}>{item.name}</Text>
                          <Text style={styles.weeklyItemCal}>{item.calories} cal</Text>
                        </View>
                        {item.dietaryTags.length > 0 ? (
                          <FlowTagList style={styles.weeklyTagsWrap}>
                            {item.dietaryTags.map((tag) => (
                              <View key={tag} style={styles.tagPill}><Text style={styles.tagPillText}>{DIETARY_TAG_LABELS[tag]}</Text></View>
                            ))}
                          </FlowTagList>
                        ) : null}
                      </View>
                    </Swipeable>
                  </View>
                ))}
                <Pressable onPress={() => setActiveForm({ period, dayId: selectedDay.id })} style={({ pressed }) => [styles.addRowBtn, pressed && styles.rowPressed]}>
                  <Text style={styles.addRowText}>＋ Add Item</Text>
                </Pressable>
              </View>
            </Card>
          ))}
        </ScrollView>
      </View>
      {activeForm ? <WeeklyItemForm visible period={activeForm.period} dayId={activeForm.dayId} onClose={() => setActiveForm(null)} /> : null}
    </GestureHandlerRootView>
  );
}

export default function AdminMenuScreen() {
  const [mode, setMode] = useState<ViewMode>('today');

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => null,
        }}
      />
      <View style={styles.screen}>
        <View style={styles.modeToggleRow}>
          <Pressable onPress={() => setMode('today')} style={[styles.modeButton, mode === 'today' && styles.modeButtonActive]} testID="admin-menu-mode-today">
            <Text style={[styles.modeButtonText, mode === 'today' && styles.modeButtonTextActive]}>Today</Text>
          </Pressable>
          <Pressable onPress={() => setMode('week')} style={[styles.modeButton, mode === 'week' && styles.modeButtonActive]} testID="admin-menu-mode-week">
            <Text style={[styles.modeButtonText, mode === 'week' && styles.modeButtonTextActive]}>This Week</Text>
          </Pressable>
        </View>
        {mode === 'today' ? <TodayMenuView /> : <WeekMenuView />}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.backgroundMain },
  screenContent: { padding: 16, paddingBottom: 24 },
  modeToggleRow: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 8, paddingBottom: 4, gap: 8 },
  modeButton: { flex: 1, minHeight: 40, borderRadius: 12, borderWidth: 1, borderColor: Colors.borderSubtle, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.backgroundCard },
  modeButtonActive: { backgroundColor: Colors.brandPrimary, borderColor: Colors.brandPrimary },
  modeButtonText: { color: Colors.textPrimary, fontSize: 14, fontWeight: '600' as const },
  modeButtonTextActive: { color: Colors.white },
  addItemBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, marginBottom: 12, borderRadius: 12, borderWidth: 1, borderColor: Colors.brandPrimary, borderStyle: 'dashed' as const },
  addItemBannerText: { color: Colors.brandPrimary, fontSize: 15, fontWeight: '600' as const },
  periodSection: { marginBottom: 18 },
  periodSectionTitle: { fontSize: 18, fontWeight: '700' as const, color: Colors.textPrimary, marginBottom: 10 },
  listCard: { padding: 4 },
  emptyCard: { padding: 24, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '500' as const },
  emptySubtext: { fontSize: 13, color: Colors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  rowPressed: { opacity: 0.65 },
  rowEmoji: { fontSize: 24 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 16, fontWeight: '600' as const, color: Colors.textPrimary },
  rowMeta: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
  deleteAction: { backgroundColor: Colors.destructive, justifyContent: 'center', alignItems: 'center', width: 92 },
  deleteActionText: { color: Colors.white, fontWeight: '700' as const },
  dayPickerScroll: { flexGrow: 0 },
  dayPickerRow: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 8, gap: 10 },
  dayChip: { width: 64, minHeight: 70, borderRadius: 10, backgroundColor: Colors.backgroundCard, borderWidth: 1, borderColor: Colors.borderSubtle, alignItems: 'center', justifyContent: 'center' },
  dayChipSelected: { backgroundColor: Colors.brandPrimary, borderColor: Colors.brandPrimary },
  dayChipWeekday: { fontSize: 14, fontWeight: '600' as const, color: Colors.textPrimary },
  dayChipWeekdaySelected: { color: Colors.white },
  dayChipDate: { marginTop: 4, fontSize: 16, fontWeight: '700' as const, color: Colors.textPrimary },
  dayChipDateSelected: { color: Colors.white },
  weekPeriodCard: { marginBottom: 14, overflow: 'hidden' as const },
  weekPeriodTop: { backgroundColor: Colors.surfaceTimeBlock, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  weekPeriodTitle: { fontSize: 17, fontWeight: '600' as const, color: Colors.textPrimary },
  weekPeriodTime: { fontSize: 13, color: Colors.textSecondary },
  weekPeriodBody: { backgroundColor: Colors.backgroundCard },
  weeklyItemRow: { paddingHorizontal: 14, paddingVertical: 12 },
  weeklyItemTop: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  weeklyItemEmoji: { fontSize: 24 },
  weeklyItemName: { flex: 1, fontSize: 15, color: Colors.textPrimary },
  weeklyItemCal: { fontSize: 13, color: Colors.textSecondary },
  weeklyTagsWrap: { marginLeft: 32, marginTop: 8 },
  tagPill: { backgroundColor: 'rgba(155,64,64,0.15)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 },
  tagPillText: { fontSize: 11, color: Colors.brandPrimary, fontWeight: '500' as const },
  addRowBtn: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  addRowText: { color: Colors.brandPrimary, fontSize: 14, fontWeight: '700' as const },
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
