import React, { useState } from 'react'
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ChevronRight, Phone, Bell, Shield, Clock, Heart } from 'lucide-react-native'
import { colors, fonts, shadow } from '../../constants/tokens'
import { Avatar } from '../../components/ui/Avatar'
import { Toggle } from '../../components/ui/Toggle'
import { useStore } from '../../store/useStore'

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const { currentUser } = useStore()
  const [notifs, setNotifs] = useState(true)
  const [weeklyDigest, setWeeklyDigest] = useState(true)

  const stats = [
    { label: 'Friends', value: '5' },
    { label: 'This month', value: '12' },
    { label: 'Streak', value: '7d' },
  ]

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <LinearGradient
          colors={[colors.heroFrom, colors.heroTo]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
        >
          <Avatar initial="M" size={72} bg="rgba(255,255,255,0.2)" />
          <Text style={styles.userName}>{currentUser.name}</Text>
          <Text style={styles.userEmail}>{currentUser.email}</Text>
          <Pressable
            style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.editBtnText}>Edit profile</Text>
          </Pressable>
        </LinearGradient>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={styles.statTile}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connected phone</Text>
          <View style={styles.phoneCard}>
            <View style={styles.phoneIcon}>
              <Phone size={20} color={colors.accent} />
            </View>
            <View style={styles.phoneInfo}>
              <Text style={styles.phoneText}>+44 7700 900123</Text>
              <Text style={styles.phoneStatus}>Connected · Synced today</Text>
            </View>
            <Pressable
              onPress={() => router.push('/connect-phone')}
              style={styles.phoneChange}
            >
              <Text style={styles.phoneChangeText}>Change</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={[styles.card, shadow.small]}>
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Bell size={18} color={colors.muted} />
                <Text style={styles.prefLabel}>Notifications</Text>
              </View>
              <Toggle value={notifs} onValueChange={setNotifs} />
            </View>
            <View style={styles.divider} />
            <View style={styles.prefRow}>
              <View style={styles.prefLeft}>
                <Heart size={18} color={colors.muted} />
                <Text style={styles.prefLabel}>Weekly digest</Text>
              </View>
              <Toggle value={weeklyDigest} onValueChange={setWeeklyDigest} />
            </View>
            <View style={styles.divider} />
            <Pressable
              onPress={() => router.push('/follow-up-schedules')}
              style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.prefLeft}>
                <Clock size={18} color={colors.muted} />
                <Text style={styles.prefLabel}>Follow-up schedules</Text>
              </View>
              <ChevronRight size={16} color={colors.muted} />
            </Pressable>
            <View style={styles.divider} />
            <Pressable
              onPress={() => router.push('/privacy')}
              style={({ pressed }) => [styles.prefRow, pressed && { opacity: 0.7 }]}
            >
              <View style={styles.prefLeft}>
                <Shield size={18} color={colors.muted} />
                <Text style={styles.prefLabel}>Privacy & data</Text>
              </View>
              <ChevronRight size={16} color={colors.muted} />
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={() => router.push('/health')}
            style={({ pressed }) => [styles.healthBtn, pressed && { opacity: 0.8 }]}
          >
            <Text style={styles.healthBtnText}>View relationship health</Text>
            <ChevronRight size={16} color={colors.accent} />
          </Pressable>
        </View>

        <Text style={styles.version}>Naer v1.0 · Made with care</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: 20, paddingBottom: 32, alignItems: 'center' },
  userName: { fontFamily: fonts.display, fontSize: 26, color: '#fff', marginTop: 12 },
  userEmail: { fontFamily: fonts.ui, fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  editBtn: {
    marginTop: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  editBtnText: { fontFamily: fonts.uiMedium, fontSize: 13, color: '#fff' },
  statsRow: { flexDirection: 'row', margin: 20, backgroundColor: colors.surface, borderRadius: 20, ...shadow.card },
  statTile: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  statValue: { fontFamily: fonts.display, fontSize: 24, color: colors.ink },
  statLabel: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted, marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: {
    fontFamily: fonts.uiSemiBold, fontSize: 13, color: colors.muted,
    letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10,
  },
  phoneCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', ...shadow.small },
  phoneIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  phoneInfo: { flex: 1 },
  phoneText: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink },
  phoneStatus: { fontFamily: fonts.ui, fontSize: 12, color: colors.good, marginTop: 2 },
  phoneChange: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: colors.accentSoft },
  phoneChangeText: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.accent },
  card: { backgroundColor: colors.surface, borderRadius: 16 },
  prefRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  prefLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  prefLabel: { fontFamily: fonts.ui, fontSize: 15, color: colors.ink },
  divider: { height: 1, backgroundColor: colors.line, marginHorizontal: 16 },
  healthBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderRadius: 16, padding: 16, gap: 8, ...shadow.small,
  },
  healthBtnText: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.accent },
  version: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 8 },
})
