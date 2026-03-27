import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import { useSession } from '@/contexts/SessionContext';
import { ADMIN_EMAIL } from '@/mocks/data';

export default function AdminSettingsScreen() {
  const { logout } = useSession();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Card style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>A</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Campus Admin</Text>
            <Text style={styles.profileEmail}>{ADMIN_EMAIL}</Text>
          </View>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Admin</Text>
          </View>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>PREFERENCES</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Display Name</Text>
          <Text style={styles.infoValue}>Campus Admin</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Campus</Text>
          <Text style={styles.infoValue}>Ram University</Text>
        </View>
      </Card>

      <Card style={styles.card}>
        <Text style={styles.sectionLabel}>APP</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>About Ram Café</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>App Version</Text>
          <Text style={styles.infoValueSecondary}>1.0.0</Text>
        </View>
      </Card>

      <Pressable
        onPress={logout}
        style={({ pressed }) => [styles.logoutButton, pressed && styles.logoutPressed]}
        testID="admin-logout-button"
      >
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: Colors.backgroundMain },
  content: { padding: 16, gap: 16, paddingBottom: 24 },
  profileCard: { padding: 16 },
  profileRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: Colors.brandPrimary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: Colors.white, fontSize: 22, fontWeight: '700' as const },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 17, fontWeight: '600' as const, color: Colors.textPrimary },
  profileEmail: { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  roleBadge: { backgroundColor: 'rgba(155,64,64,0.12)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 14 },
  roleBadgeText: { color: Colors.brandPrimary, fontSize: 13, fontWeight: '600' as const },
  card: { padding: 16 },
  sectionLabel: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary, letterSpacing: 0.8, marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', minHeight: 44 },
  infoLabel: { fontSize: 16, color: Colors.textPrimary },
  infoValue: { fontSize: 16, color: Colors.textSecondary },
  infoValueSecondary: { fontSize: 14, color: Colors.textSecondary },
  chevron: { fontSize: 24, color: Colors.textSecondary },
  divider: { height: 1, backgroundColor: Colors.borderSubtle, marginVertical: 4 },
  logoutButton: { minHeight: 52, borderRadius: 12, backgroundColor: 'rgba(155,64,64,0.1)', alignItems: 'center', justifyContent: 'center' },
  logoutPressed: { opacity: 0.7 },
  logoutText: { fontSize: 16, color: Colors.destructive, fontWeight: '600' as const },
  bottomPad: { height: 24 },
});
