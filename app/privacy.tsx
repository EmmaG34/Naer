import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Shield, Eye, Trash2, Download, Lock } from 'lucide-react-native'
import { colors, fonts, shadow } from '../constants/tokens'
import { Toggle } from '../components/ui/Toggle'
import { useStore } from '../store/useStore'

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets()
  const { showToast } = useStore()
  const [localOnly, setLocalOnly] = useState(true)
  const [analytics, setAnalytics] = useState(false)
  const [contactSync, setContactSync] = useState(true)

  const items = [
    { icon: <Lock size={20} color={colors.accent2} />, label: 'Store data locally only', desc: 'Your data never leaves your device', value: localOnly, onChange: setLocalOnly },
    { icon: <Eye size={20} color={colors.accent2} />, label: 'Anonymous analytics', desc: 'Help us improve Naer', value: analytics, onChange: setAnalytics },
    { icon: <Shield size={20} color={colors.accent2} />, label: 'Contacts sync', desc: 'Read contact birthdays & info', value: contactSync, onChange: setContactSync },
  ]

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><ArrowLeft size={20} color={colors.ink} /></Pressable>
        <Text style={styles.title}>Privacy & data</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.heroCard}>
          <Shield size={32} color={colors.accent2} />
          <Text style={styles.heroTitle}>Your data is yours</Text>
          <Text style={styles.heroSub}>Naer is built with privacy first. By default, everything stays on your device.</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Data settings</Text>
          <View style={[styles.card, shadow.small]}>
            {items.map((item, i) => (
              <React.Fragment key={item.label}>
                <View style={styles.row}>
                  <View style={styles.rowIcon}>{item.icon}</View>
                  <View style={styles.rowInfo}><Text style={styles.rowLabel}>{item.label}</Text><Text style={styles.rowDesc}>{item.desc}</Text></View>
                  <Toggle value={item.value} onValueChange={item.onChange} />
                </View>
                {i < items.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your data</Text>
          <Pressable onPress={() => showToast('Export ready!')} style={({ pressed }) => [styles.actionRow, pressed && { opacity: 0.7 }]}>
            <View style={styles.actionIcon}><Download size={18} color={colors.good} /></View>
            <View style={styles.actionInfo}><Text style={styles.actionLabel}>Export all data</Text><Text style={styles.actionDesc}>Download a copy of everything in Naer</Text></View>
          </Pressable>
          <Pressable onPress={() => showToast('All data cleared.')} style={({ pressed }) => [styles.actionRow, styles.actionRowDanger, pressed && { opacity: 0.7 }]}>
            <View style={[styles.actionIcon, styles.actionIconDanger]}><Trash2 size={18} color={colors.accent} /></View>
            <View style={styles.actionInfo}><Text style={[styles.actionLabel, { color: colors.accent }]}>Delete all data</Text><Text style={styles.actionDesc}>This cannot be undone</Text></View>
          </Pressable>
        </View>
        <Text style={styles.footer}>Naer never sells your data. We don\'t have ads. Your friendships stay private.</Text>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.small },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  heroCard: { margin: 16, backgroundColor: colors.accent2Soft, borderRadius: 20, padding: 24, alignItems: 'center', gap: 10 },
  heroTitle: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  heroSub: { fontFamily: fonts.ui, fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 22 },
  section: { paddingHorizontal: 16, marginBottom: 20 },
  sectionLabel: { fontFamily: fonts.uiSemiBold, fontSize: 12, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  card: { backgroundColor: colors.surface, borderRadius: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: colors.accent2Soft, alignItems: 'center', justifyContent: 'center' },
  rowInfo: { flex: 1 },
  rowLabel: { fontFamily: fonts.uiMedium, fontSize: 14, color: colors.ink },
  rowDesc: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted, marginTop: 2 },
  divider: { height: 1, backgroundColor: colors.line, marginHorizontal: 16 },
  actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, gap: 12, marginBottom: 10, ...shadow.small },
  actionRowDanger: { borderWidth: 1, borderColor: colors.accentSoft },
  actionIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#e8f7f1', alignItems: 'center', justifyContent: 'center' },
  actionIconDanger: { backgroundColor: colors.accentSoft },
  actionInfo: { flex: 1 },
  actionLabel: { fontFamily: fonts.uiMedium, fontSize: 14, color: colors.ink },
  actionDesc: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted, marginTop: 2 },
  footer: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted, textAlign: 'center', paddingHorizontal: 32, lineHeight: 20, marginTop: 8 },
})
