import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X, Mic, Type } from 'lucide-react-native'
import { colors, fonts, shadow } from '../constants/tokens'
import { useStore } from '../store/useStore'

export default function CaptureScreen() {
  const insets = useSafeAreaInsets()
  const [mode, setMode] = useState<'voice' | 'text'>('text')
  const [text, setText] = useState('')
  const [isRecording, setIsRecording] = useState(false)
  const { showToast } = useStore()

  const handleSave = () => {
    if (!text.trim()) return
    showToast('Captured!')
    router.back()
  }

  const toggleRecord = () => {
    setIsRecording(!isRecording)
    if (isRecording) {
      showToast('Note saved from voice!')
      router.back()
    }
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Quick capture</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.modeRow}>
        <Pressable onPress={() => setMode('text')} style={[styles.modeBtn, mode === 'text' && styles.modeBtnActive]}>
          <Type size={16} color={mode === 'text' ? '#fff' : colors.muted} />
          <Text style={[styles.modeBtnText, mode === 'text' && styles.modeBtnTextActive]}>Text</Text>
        </Pressable>
        <Pressable onPress={() => setMode('voice')} style={[styles.modeBtn, mode === 'voice' && styles.modeBtnActive]}>
          <Mic size={16} color={mode === 'voice' ? '#fff' : colors.muted} />
          <Text style={[styles.modeBtnText, mode === 'voice' && styles.modeBtnTextActive]}>Voice</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {mode === 'text' ? (
          <>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder="What happened? Who did you see?"
              placeholderTextColor={colors.muted}
              style={styles.input}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [styles.saveBtn, !text.trim() && styles.saveBtnDisabled, pressed && { opacity: 0.8 }]}
              disabled={!text.trim()}
            >
              <Text style={styles.saveBtnText}>Save note</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.voiceArea}>
            <Pressable onPress={toggleRecord} style={[styles.recordBtn, isRecording && styles.recordBtnActive]}>
              <Mic size={36} color="#fff" />
            </Pressable>
            <Text style={styles.recordHint}>
              {isRecording ? 'Recording... tap to stop' : 'Tap to start recording'}
            </Text>
            {isRecording && (
              <View style={styles.waveform}>
                {Array.from({ length: 20 }).map((_, i) => (
                  <View key={i} style={[styles.waveBar, { height: 8 + (i % 5) * 8 }]} />
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 12 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.small },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  modeRow: { flexDirection: 'row', marginHorizontal: 20, marginBottom: 20, backgroundColor: colors.surface, borderRadius: 14, padding: 4, ...shadow.small },
  modeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 10 },
  modeBtnActive: { backgroundColor: colors.accent2 },
  modeBtnText: { fontFamily: fonts.uiMedium, fontSize: 14, color: colors.muted },
  modeBtnTextActive: { color: '#fff' },
  body: { flex: 1, paddingHorizontal: 20 },
  input: { flex: 1, backgroundColor: colors.surface, borderRadius: 16, padding: 16, fontFamily: fonts.ui, fontSize: 15, color: colors.ink, marginBottom: 16, ...shadow.small },
  saveBtn: { backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontFamily: fonts.uiSemiBold, fontSize: 16, color: '#fff' },
  voiceArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 24 },
  recordBtn: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.accent2, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  recordBtnActive: { backgroundColor: colors.accent },
  recordHint: { fontFamily: fonts.ui, fontSize: 15, color: colors.muted },
  waveform: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 48 },
  waveBar: { width: 4, borderRadius: 2, backgroundColor: colors.accent },
})
