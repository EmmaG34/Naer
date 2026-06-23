import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X, Mic, ChevronRight } from 'lucide-react-native'
import { colors, fonts, shadow } from '../constants/tokens'
import { PEOPLE } from '../store/data'
import { Avatar } from '../components/ui/Avatar'
import { useStore } from '../store/useStore'

const PROMPTS = [
  'ran into someone I haven\'t seen in ages',
  'my friend just went through something big',
  'I want to reconnect with someone',
  'someone did something kind for me',
  'I\'m thinking of a friend out of the blue',
]

export default function TellNaerScreen() {
  const insets = useSafeAreaInsets()
  const [text, setText] = useState('')
  const [selectedPerson, setSelectedPerson] = useState<string | null>(null)
  const { showToast } = useStore()

  const handleSubmit = () => {
    if (!text.trim()) return
    showToast('Got it! I\'ll remember that.')
    router.back()
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Tell Naer</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.heading}>What\'s on your mind?</Text>
        <Text style={styles.sub}>Share something and I\'ll help you stay connected.</Text>

        <View style={styles.inputWrap}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="e.g. Priya mentioned she's moving to a new flat..."
            placeholderTextColor={colors.muted}
            style={styles.input}
            multiline
            textAlignVertical="top"
            autoFocus
          />
          <Pressable style={styles.micBtn}>
            <Mic size={18} color={colors.accent} />
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>Quick prompts</Text>
        {PROMPTS.map((prompt) => (
          <Pressable
            key={prompt}
            onPress={() => setText('I ' + prompt)}
            style={({ pressed }) => [styles.promptRow, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.promptText}>I {prompt}</Text>
            <ChevronRight size={14} color={colors.muted} />
          </Pressable>
        ))}

        <Text style={styles.sectionLabel}>About someone?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {PEOPLE.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => setSelectedPerson(selectedPerson === p.id ? null : p.id)}
              style={[styles.personChip, selectedPerson === p.id && styles.personChipSelected]}
            >
              <Avatar initial={p.initial} size={28} />
              <Text style={[styles.personChipText, selectedPerson === p.id && { color: '#fff' }]}>
                {p.first}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.submitBtn,
            !text.trim() && styles.submitBtnDisabled,
            pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
          ]}
          disabled={!text.trim()}
        >
          <Text style={styles.submitBtnText}>Save this</Text>
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.small },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
  heading: { fontFamily: fonts.display, fontSize: 26, color: colors.ink, marginBottom: 6 },
  sub: { fontFamily: fonts.ui, fontSize: 15, color: colors.muted, marginBottom: 20 },
  inputWrap: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, marginBottom: 24, minHeight: 120, ...shadow.small },
  input: { fontFamily: fonts.ui, fontSize: 15, color: colors.ink, flex: 1, minHeight: 80 },
  micBtn: { alignSelf: 'flex-end', width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  sectionLabel: { fontFamily: fonts.uiSemiBold, fontSize: 12, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10, marginTop: 4 },
  promptRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.surface, borderRadius: 12, padding: 14, marginBottom: 8 },
  promptText: { fontFamily: fonts.ui, fontSize: 14, color: colors.ink, flex: 1 },
  personChip: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.surface, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginTop: 4, borderWidth: 1, borderColor: colors.line },
  personChipSelected: { backgroundColor: colors.accent2, borderColor: colors.accent2 },
  personChipText: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.ink },
  footer: { paddingHorizontal: 20 },
  submitBtn: { backgroundColor: colors.accent, borderRadius: 18, paddingVertical: 18, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { fontFamily: fonts.uiSemiBold, fontSize: 16, color: '#fff' },
})
