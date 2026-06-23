import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft } from 'lucide-react-native'
import { colors, fonts, shadow } from '../constants/tokens'
import { PEOPLE } from '../store/data'
import { Avatar } from '../components/ui/Avatar'
import { useStore } from '../store/useStore'

const FREQUENCIES = ['Weekly', 'Fortnightly', 'Monthly', 'Quarterly', 'As needed']

export default function FollowUpSchedulesScreen() {
  const insets = useSafeAreaInsets()
  const { showToast } = useStore()
  const [schedules, setSchedules] = useState<Record<string, string>>({ '1': 'Monthly', '2': 'Weekly', '3': 'Fortnightly', '4': 'Monthly', '5': 'Quarterly' })

  const setSchedule = (id: string, freq: string) => {
    setSchedules((s) => ({ ...s, [id]: freq }))
    showToast('Schedule updated!')
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}><ArrowLeft size={20} color={colors.ink} /></Pressable>
        <Text style={styles.title}>Follow-up schedules</Text>
        <View style={{ width: 36 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.intro}>Set how often Naer should remind you to reach out to each person.</Text>
        {PEOPLE.map((person) => (
          <View key={person.id} style={styles.personSection}>
            <View style={styles.personRow}>
              <Avatar initial={person.initial} size={40} />
              <View style={styles.personInfo}><Text style={styles.personName}>{person.name}</Text><Text style={styles.personRelation}>{person.relation}</Text></View>
              <View style={styles.currentChip}><Text style={styles.currentText}>{schedules[person.id] ?? 'Monthly'}</Text></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {FREQUENCIES.map((freq) => {
                const selected = schedules[person.id] === freq
                return (
                  <Pressable key={freq} onPress={() => setSchedule(person.id, freq)} style={[styles.freqChip, selected && styles.freqChipSelected]}>
                    <Text style={[styles.freqText, selected && styles.freqTextSelected]}>{freq}</Text>
                  </Pressable>
                )
              })}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.small },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  intro: { fontFamily: fonts.ui, fontSize: 14, color: colors.muted, paddingHorizontal: 20, marginBottom: 20, lineHeight: 22 },
  personSection: { backgroundColor: colors.surface, marginHorizontal: 16, marginBottom: 12, borderRadius: 16, padding: 16, ...shadow.small },
  personRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  personInfo: { flex: 1, marginLeft: 12 },
  personName: { fontFamily: fonts.uiMedium, fontSize: 15, color: colors.ink },
  personRelation: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted, marginTop: 2 },
  currentChip: { backgroundColor: colors.accent2Soft, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  currentText: { fontFamily: fonts.uiMedium, fontSize: 12, color: colors.accent2 },
  freqChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 999, backgroundColor: colors.bg, marginRight: 8, borderWidth: 1, borderColor: colors.line },
  freqChipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  freqText: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.ink },
  freqTextSelected: { color: '#fff' },
})
