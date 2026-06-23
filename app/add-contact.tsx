import React, { useState } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X } from 'lucide-react-native'
import { colors, fonts, shadow } from '../constants/tokens'
import { useStore } from '../store/useStore'

export default function AddContactScreen() {
  const insets = useSafeAreaInsets()
  const { showToast } = useStore()
  const [form, setForm] = useState({ name: '', relation: '', birthday: '', work: '', orders: '', met: '', notes: '' })
  const [tier, setTier] = useState<'close' | 'friend' | 'acq'>('friend')
  const tiers = [
    { key: 'close' as const, label: 'Close friend', desc: 'Weekly check-ins' },
    { key: 'friend' as const, label: 'Friend', desc: 'Monthly touch-base' },
    { key: 'acq' as const, label: 'Acquaintance', desc: 'A few times a year' },
  ]
  const update = (key: keyof typeof form) => (val: string) => setForm((f) => ({ ...f, [key]: val }))
  const handleSave = () => {
    if (!form.name.trim()) { showToast('Please enter a name'); return }
    showToast(`${form.name} added!`)
    router.back()
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}><X size={20} color={colors.ink} /></Pressable>
        <Text style={styles.title}>Add contact</Text>
        <Pressable onPress={handleSave} style={styles.saveBtn}><Text style={styles.saveBtnText}>Save</Text></Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.field}><Text style={styles.fieldLabel}>Name *</Text><TextInput value={form.name} onChangeText={update('name')} placeholder="Full name" placeholderTextColor={colors.muted} style={styles.input} autoFocus /></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Relation</Text><TextInput value={form.relation} onChangeText={update('relation')} placeholder="e.g. Best friend, colleague..." placeholderTextColor={colors.muted} style={styles.input} /></View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Closeness</Text>
          <View style={styles.tierRow}>
            {tiers.map((t) => (
              <Pressable key={t.key} onPress={() => setTier(t.key)} style={[styles.tierCard, tier === t.key && styles.tierCardSelected]}>
                <Text style={[styles.tierLabel, tier === t.key && styles.tierLabelSelected]}>{t.label}</Text>
                <Text style={[styles.tierDesc, tier === t.key && styles.tierDescSelected]}>{t.desc}</Text>
              </Pressable>
            ))}
          </View>
        </View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Birthday</Text><TextInput value={form.birthday} onChangeText={update('birthday')} placeholder="e.g. Mar 15" placeholderTextColor={colors.muted} style={styles.input} /></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Works as</Text><TextInput value={form.work} onChangeText={update('work')} placeholder="Their job or work" placeholderTextColor={colors.muted} style={styles.input} /></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Usually orders</Text><TextInput value={form.orders} onChangeText={update('orders')} placeholder="Their go-to drink or food" placeholderTextColor={colors.muted} style={styles.input} /></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>How you met</Text><TextInput value={form.met} onChangeText={update('met')} placeholder="University, work, app..." placeholderTextColor={colors.muted} style={styles.input} /></View>
        <View style={styles.field}><Text style={styles.fieldLabel}>Notes</Text><TextInput value={form.notes} onChangeText={update('notes')} placeholder="Anything else Naer should remember..." placeholderTextColor={colors.muted} style={[styles.input, styles.inputMulti]} multiline textAlignVertical="top" /></View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.small },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: colors.accent, borderRadius: 12 },
  saveBtnText: { fontFamily: fonts.uiSemiBold, fontSize: 14, color: '#fff' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  field: { marginBottom: 20 },
  fieldLabel: { fontFamily: fonts.uiSemiBold, fontSize: 12, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 8 },
  input: { backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 13, fontFamily: fonts.ui, fontSize: 15, color: colors.ink, ...shadow.small },
  inputMulti: { minHeight: 100, paddingTop: 13 },
  tierRow: { flexDirection: 'row', gap: 10 },
  tierCard: { flex: 1, backgroundColor: colors.surface, borderRadius: 14, padding: 12, borderWidth: 2, borderColor: 'transparent', ...shadow.small },
  tierCardSelected: { borderColor: colors.accent2, backgroundColor: colors.accent2Soft },
  tierLabel: { fontFamily: fonts.uiSemiBold, fontSize: 13, color: colors.ink, marginBottom: 2 },
  tierLabelSelected: { color: colors.accent2 },
  tierDesc: { fontFamily: fonts.ui, fontSize: 11, color: colors.muted },
  tierDescSelected: { color: colors.accent2 },
})
