import React, { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView, Swipeable } from 'react-native-gesture-handler';
import { Plus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import { useInventoryStore } from '@/contexts/InventoryStoreContext';
import { AdminInventoryAlert } from '@/types';

const CATEGORIES = ['Meat', 'Produce', 'Dairy', 'Dry Goods', 'Beverages', 'Other'];

function AddAlertForm({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addAlert } = useInventoryStore();
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Produce');
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  React.useEffect(() => {
    if (visible) { setName(''); setCategory('Produce'); setMessage(''); setError(''); }
  }, [visible]);

  const handleSave = () => {
    if (!name.trim() || !message.trim()) { setError('Name and message are required.'); return; }
    addAlert({ id: `alert-${Date.now()}`, itemName: name.trim(), category, message: message.trim(), isNew: true });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modalShell}>
        <View style={styles.modalHeader}>
          <Pressable onPress={onClose}><Text style={styles.cancelText}>Cancel</Text></Pressable>
          <Text style={styles.modalTitle}>New Inventory Alert</Text>
          <Pressable onPress={handleSave}><Text style={styles.saveText}>Add</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={styles.formContent}>
          <Card style={styles.formCard}>
            <Text style={styles.label}>Item Name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} placeholder="Fresh Yogurt Cups" placeholderTextColor={Colors.textSecondary} />
            <Text style={styles.label}>Category</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((cat) => (
                <Pressable key={cat} onPress={() => setCategory(cat)} style={[styles.categoryChip, category === cat && styles.categoryChipActive]}>
                  <Text style={[styles.categoryChipText, category === cat && styles.categoryChipTextActive]}>{cat}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.label}>Alert Message</Text>
            <TextInput value={message} onChangeText={setMessage} style={[styles.input, styles.textArea]} multiline placeholder="Describe the issue" placeholderTextColor={Colors.textSecondary} />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </Card>
        </ScrollView>
      </View>
    </Modal>
  );
}

function AlertRow({ alert, onResolve }: { alert: AdminInventoryAlert; onResolve: (a: AdminInventoryAlert) => void }) {
  return (
    <Swipeable renderRightActions={() => (
      <Pressable onPress={() => onResolve(alert)} style={styles.resolveAction}>
        <Text style={styles.resolveActionText}>Resolve</Text>
      </Pressable>
    )}>
      <View style={styles.alertRow}>
        <View style={styles.alertHeader}>
          <View style={styles.alertTitleRow}>
            <Text style={styles.alertName}>{alert.itemName}</Text>
            {alert.isNew ? (
              <View style={styles.newBadge}><Text style={styles.newBadgeText}>New</Text></View>
            ) : null}
          </View>
          <Text style={styles.alertCategory}>{alert.category}</Text>
        </View>
        <Text style={styles.alertMessage}>{alert.message}</Text>
      </View>
    </Swipeable>
  );
}

export default function AdminInventoryScreen() {
  const { alerts, resolveAlert } = useInventoryStore();
  const [showForm, setShowForm] = useState<boolean>(false);

  const handleResolve = (alert: AdminInventoryAlert) => {
    Alert.alert(`Mark ${alert.itemName} as resolved?`, 'This will remove it from the alerts list.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Resolve', style: 'destructive', onPress: () => resolveAlert(alert.id) },
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <>
        <Stack.Screen
          options={{
            headerRight: () => (
              <Pressable onPress={() => setShowForm(true)} hitSlop={12} style={styles.headerAddBtn}>
                <Plus size={18} color={Colors.brandPrimary} />
                <Text style={styles.headerAddText}>Add Alert</Text>
              </Pressable>
            ),
          }}
        />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {alerts.length === 0 ? (
            <Card style={styles.emptyCard}>
              <Text style={styles.healthyText}>✓ No active alerts. All inventory levels are healthy.</Text>
            </Card>
          ) : (
            <Card style={styles.listCard}>
              {alerts.map((alert, index) => (
                <View key={alert.id} style={index < alerts.length - 1 ? styles.rowBorder : undefined}>
                  <AlertRow alert={alert} onResolve={handleResolve} />
                </View>
              ))}
            </Card>
          )}
        </ScrollView>
        <AddAlertForm visible={showForm} onClose={() => setShowForm(false)} />
      </>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.backgroundMain },
  content: { padding: 16, paddingBottom: 24 },
  headerAddBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerAddText: { color: Colors.brandPrimary, fontSize: 15, fontWeight: '600' as const },
  listCard: { padding: 4 },
  emptyCard: { padding: 24, alignItems: 'center' },
  healthyText: { color: Colors.accentGreen, fontSize: 15, fontWeight: '600' as const, textAlign: 'center' as const },
  alertRow: { padding: 14 },
  alertHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 },
  alertTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexShrink: 1 },
  alertName: { fontSize: 16, fontWeight: '600' as const, color: Colors.textPrimary },
  alertCategory: { fontSize: 13, color: Colors.textSecondary },
  alertMessage: { fontSize: 14, color: Colors.textSecondary },
  newBadge: { backgroundColor: 'rgba(155,64,64,0.12)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  newBadgeText: { color: Colors.brandPrimary, fontSize: 11, fontWeight: '700' as const },
  resolveAction: { backgroundColor: Colors.accentGreen, justifyContent: 'center', alignItems: 'center', width: 92 },
  resolveActionText: { color: Colors.white, fontWeight: '700' as const },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.borderSubtle },
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
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  categoryChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, backgroundColor: Colors.chipUnselected },
  categoryChipActive: { backgroundColor: Colors.brandPrimary },
  categoryChipText: { color: Colors.textSecondary, fontSize: 13, fontWeight: '600' as const },
  categoryChipTextActive: { color: Colors.white },
  errorText: { color: Colors.destructive, fontSize: 13, marginTop: 12 },
});
