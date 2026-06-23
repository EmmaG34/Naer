import React, { useState } from 'react'
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, Share } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ArrowLeft, Copy, Send } from 'lucide-react-native'
import { colors, fonts, shadow } from '../../constants/tokens'
import { PEOPLE } from '../../store/data'
import { Avatar } from '../../components/ui/Avatar'
import { SuccessOverlay } from '../../components/ui/SuccessOverlay'
import { useStore } from '../../store/useStore'

type ToneKey = 'warm' | 'playful' | 'short' | 'heartfelt'
const TONES: { key: ToneKey; label: string; emoji: string }[] = [
  { key: 'warm', label: 'Warm', emoji: '☀️' },
  { key: 'playful', label: 'Playful', emoji: '😄' },
  { key: 'short', label: 'Short', emoji: '⚡' },
  { key: 'heartfelt', label: 'Heartfelt', emoji: '💜' },
]

export default function ComposeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const insets = useSafeAreaInsets()
  const [tone, setTone] = useState<ToneKey>('warm')
  const [text, setText] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const { showToast, addSentMessage } = useStore()

  const person = PEOPLE.find((p) => p.id === id)
  if (!person) return null

  const draft = person.drafts[tone]

  const handleToneChange = (t: ToneKey) => {
    setTone(t)
    setText('')
  }

  const currentText = text || draft

  const handleSend = async () => {
    addSentMessage({
      id: Date.now().toString(),
      personId: person.id,
      personName: person.name,
      message: currentText,
      tone,
      sentAt: new Date(),
    })
    try {
      await Share.share({ message: currentText })
    } catch {
      // ignored
    }
    setShowSuccess(true)
  }

  const handleCopy = () => {
    showToast('Copied to clipboard!')
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Send a note</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.personCard}>
          <Avatar initial={person.initial} size={48} />
          <View style={styles.personInfo}>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={styles.personRelation}>{person.relation}</Text>
          </View>
        </View>

        <View style={styles.contextCard}>
          <Text style={styles.contextLabel}>💬 What Naer remembers</Text>
          <Text style={styles.contextText}>{person.pulled}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Choose your tone</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tonesScroll}>
            {TONES.map((t) => (
              <Pressable
                key={t.key}
                onPress={() => handleToneChange(t.key)}
                style={[styles.toneChip, tone === t.key && styles.toneChipSelected]}
              >
                <Text style={styles.toneEmoji}>{t.emoji}</Text>
                <Text style={[styles.toneLabel, tone === t.key && styles.toneLabelSelected]}>{t.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Your message</Text>
          <View style={styles.messageCard}>
            <TextInput
              value={text || draft}
              onChangeText={setText}
              multiline
              style={styles.messageInput}
              textAlignVertical="top"
            />
            <Pressable onPress={handleCopy} style={styles.copyBtn}>
              <Copy size={16} color={colors.muted} />
              <Text style={styles.copyBtnText}>Copy</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.section}>
          <Pressable
            onPress={handleSend}
            style={({ pressed }) => [styles.sendBtn, pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] }]}
          >
            <Send size={18} color="#fff" />
            <Text style={styles.sendBtnText}>Send to {person.first}</Text>
          </Pressable>
          <Text style={styles.sendHint}>Opens your share sheet</Text>
        </View>
      </ScrollView>

      <SuccessOverlay
        visible={showSuccess}
        message={`Sent to ${person.first}!`}
        onDone={() => {
          setShowSuccess(false)
          router.back()
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.small },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  personCard: { flexDirection: 'row', alignItems: 'center', gap: 14, marginHorizontal: 16, backgroundColor: colors.surface, borderRadius: 16, padding: 16, ...shadow.small, marginBottom: 12 },
  personInfo: { flex: 1 },
  personName: { fontFamily: fonts.uiMedium, fontSize: 16, color: colors.ink },
  personRelation: { fontFamily: fonts.ui, fontSize: 13, color: colors.muted, marginTop: 2 },
  contextCard: { marginHorizontal: 16, backgroundColor: colors.accent2Soft, borderRadius: 14, padding: 14, marginBottom: 8 },
  contextLabel: { fontFamily: fonts.uiSemiBold, fontSize: 10, letterSpacing: 1, color: colors.accent2, marginBottom: 6 },
  contextText: { fontFamily: fonts.ui, fontSize: 14, color: colors.ink, fontStyle: 'italic' },
  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionLabel: { fontFamily: fonts.uiSemiBold, fontSize: 12, color: colors.muted, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 10 },
  tonesScroll: { marginLeft: -2 },
  toneChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.line, marginRight: 8 },
  toneChipSelected: { backgroundColor: colors.accent2, borderColor: colors.accent2 },
  toneEmoji: { fontSize: 14 },
  toneLabel: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.ink },
  toneLabelSelected: { color: '#fff' },
  messageCard: { backgroundColor: colors.surface, borderRadius: 16, padding: 16, ...shadow.small },
  messageInput: { fontFamily: fonts.ui, fontSize: 16, color: colors.ink, lineHeight: 24, minHeight: 120 },
  copyBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', marginTop: 10, paddingVertical: 6, paddingHorizontal: 12, backgroundColor: colors.bg, borderRadius: 8 },
  copyBtnText: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.muted },
  sendBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.accent, borderRadius: 18, paddingVertical: 18, ...shadow.small },
  sendBtnText: { fontFamily: fonts.uiSemiBold, fontSize: 16, color: '#fff' },
  sendHint: { fontFamily: fonts.ui, fontSize: 12, color: colors.muted, textAlign: 'center', marginTop: 8 },
})
