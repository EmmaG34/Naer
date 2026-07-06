import React, { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X, Mic, Type, Play, Square, RotateCcw, Check, Calendar, Info } from 'lucide-react-native'
import { Audio } from 'expo-av'
import { colors, fonts, shadow } from '../constants/tokens'
import { useStore } from '../store/useStore'
import { PEOPLE } from '../store/data'
import { requestAudioPermissions, startRecording, stopRecording, playAudio, stopPlayback } from '../utils/audio'
import { transcribeAudio } from '../utils/transcribe'
import { parseTranscript, ParsedTranscript } from '../utils/parseTranscript'

const BAR_COUNT = 28

function useWaveform(active: boolean) {
  const bars = useRef<Animated.Value[]>(
    Array.from({ length: BAR_COUNT }, () => new Animated.Value(0.2))
  ).current
  useEffect(() => {
    if (!active) {
      bars.forEach((b) => Animated.spring(b, { toValue: 0.2, useNativeDriver: false }).start())
      return
    }
    let cancelled = false
    const pulse = () => {
      if (cancelled) return
      bars.forEach((bar) =>
        Animated.timing(bar, {
          toValue: 0.15 + Math.random() * 0.85,
          duration: 120 + Math.random() * 180,
          useNativeDriver: false,
        }).start()
      )
      setTimeout(pulse, 150)
    }
    pulse()
    return () => { cancelled = true }
  }, [active, bars])
  return bars
}

type RecordPhase = 'idle' | 'recording' | 'transcribing' | 'review'

export default function CaptureScreen() {
  const insets = useSafeAreaInsets()
  const [mode, setMode] = useState<'voice' | 'text'>('voice')
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<RecordPhase>('idle')
  const [loadingMsg, setLoadingMsg] = useState('Transcribing…')
  const [recordingUri, setRecordingUri] = useState<string | null>(null)
  const [transcript, setTranscript] = useState('')
  const [parsed, setParsed] = useState<ParsedTranscript | null>(null)
  const [acceptedFollowUps, setAcceptedFollowUps] = useState<Set<number>>(new Set())
  const [acceptedInfoUpdates, setAcceptedInfoUpdates] = useState<Set<number>>(new Set())
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const soundRef = useRef<Audio.Sound | null>(null)
  const { showToast, addCapture, addContactNote, addFollowUp } = useStore()
  const waveformBars = useWaveform(phase === 'recording')

  const clearTimer = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null }
  }
  useEffect(() => () => { clearTimer(); stopPlayback() }, [])

  const handleStartRecording = async () => {
    const granted = await requestAudioPermissions()
    if (!granted) {
      Alert.alert('Microphone access needed', 'Enable microphone access in Settings to record voice notes.', [{ text: 'OK' }])
      return
    }
    try {
      await startRecording()
      setPhase('recording')
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } catch { showToast('Could not start recording') }
  }

  const handleStopRecording = async () => {
    clearTimer()
    try {
      const uri = await stopRecording()
      setRecordingUri(uri)
      setPhase('transcribing')
      setLoadingMsg('Transcribing…')

      const text = await transcribeAudio(uri ?? '')
      setTranscript(text)

      setLoadingMsg('Analysing…')
      const result = await parseTranscript(text)
      setParsed(result)
      setAcceptedFollowUps(new Set(result.followUps.map((_, i) => i)))
      setAcceptedInfoUpdates(new Set(result.infoUpdates.map((_, i) => i)))

      setPhase('review')
    } catch {
      showToast('Something went wrong — please try again')
      setPhase('idle')
    }
  }

  const handlePlayback = async () => {
    if (!recordingUri) return
    if (isPlaying) { await stopPlayback(); setIsPlaying(false); return }
    setIsPlaying(true)
    try {
      const sound = await playAudio(recordingUri)
      soundRef.current = sound
      sound.setOnPlaybackStatusUpdate((s) => {
        if (s.isLoaded && s.didJustFinish) { setIsPlaying(false); sound.unloadAsync() }
      })
    } catch { setIsPlaying(false) }
  }

  const handleReset = async () => {
    await stopPlayback()
    setIsPlaying(false); setRecordingUri(null); setTranscript('')
    setParsed(null); setSelectedPersonId(null); setElapsed(0); setPhase('idle')
  }

  const toggleFollowUp = (i: number) =>
    setAcceptedFollowUps((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })

  const toggleInfoUpdate = (i: number) =>
    setAcceptedInfoUpdates((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n })

  const handleSaveVoice = () => {
    if (!transcript.trim()) return
    const baseId = String(Date.now())

    addCapture({ id: baseId, type: 'voice', content: transcript.trim(), uri: recordingUri ?? undefined, createdAt: new Date() })

    if (selectedPersonId) {
      addContactNote({ id: baseId, personId: selectedPersonId, text: transcript.trim(), uri: recordingUri ?? undefined, createdAt: new Date() })

      // Accepted info updates also saved as contact notes
      parsed?.infoUpdates.forEach((u, i) => {
        if (acceptedInfoUpdates.has(i)) {
          addContactNote({ id: `${baseId}-info-${i}`, personId: selectedPersonId, text: `${u.field}: ${u.value}`, createdAt: new Date() })
        }
      })
    }

    // Accepted follow-ups saved to follow-ups store
    parsed?.followUps.forEach((fu, i) => {
      if (acceptedFollowUps.has(i)) {
        addFollowUp({
          id: `${baseId}-fu-${i}`,
          personId: selectedPersonId ?? undefined,
          personName: selectedPersonId ? PEOPLE.find((p) => p.id === selectedPersonId)?.first : undefined,
          description: fu.description,
          dueDate: fu.dueDate ?? undefined,
          createdAt: new Date(),
          completed: false,
        })
      }
    })

    const person = PEOPLE.find((p) => p.id === selectedPersonId)
    showToast(person ? `Saved to ${person.first}` : 'Note saved')
    router.back()
  }

  const handleSaveText = () => {
    if (!text.trim()) return
    addCapture({ id: String(Date.now()), type: 'text', content: text.trim(), createdAt: new Date() })
    showToast('Note saved!')
    router.back()
  }

  const fmt = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}>
          <X size={20} color={colors.ink} />
        </Pressable>
        <Text style={styles.title}>Quick capture</Text>
        <View style={{ width: 36 }} />
      </View>

      {(phase === 'idle' || mode === 'text') && (
        <View style={styles.modeRow}>
          <Pressable onPress={() => setMode('voice')} style={[styles.modeBtn, mode === 'voice' && styles.modeBtnActive]}>
            <Mic size={16} color={mode === 'voice' ? '#fff' : colors.muted} />
            <Text style={[styles.modeBtnText, mode === 'voice' && styles.modeBtnTextActive]}>Voice</Text>
          </Pressable>
          <Pressable onPress={() => setMode('text')} style={[styles.modeBtn, mode === 'text' && styles.modeBtnActive]}>
            <Type size={16} color={mode === 'text' ? '#fff' : colors.muted} />
            <Text style={[styles.modeBtnText, mode === 'text' && styles.modeBtnTextActive]}>Text</Text>
          </Pressable>
        </View>
      )}

      <View style={styles.body}>
        {mode === 'text' ? (
          <>
            <TextInput value={text} onChangeText={setText} placeholder="What happened? Who did you see?" placeholderTextColor={colors.muted} style={styles.input} multiline textAlignVertical="top" autoFocus />
            <Pressable onPress={handleSaveText} style={({ pressed }) => [styles.saveBtn, !text.trim() && styles.saveBtnDisabled, pressed && { opacity: 0.8 }]} disabled={!text.trim()}>
              <Text style={styles.saveBtnText}>Save note</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.voiceArea}>

            {(phase === 'idle' || phase === 'recording') && (
              <View style={styles.waveformWrap}>
                {waveformBars.map((bar, i) => (
                  <Animated.View key={i} style={[styles.waveBar, {
                    height: bar.interpolate({ inputRange: [0, 1], outputRange: [4, 52] }),
                    backgroundColor: phase === 'recording' ? colors.accent : colors.accent2,
                    opacity: phase === 'idle' ? 0.25 : 1,
                  }]} />
                ))}
              </View>
            )}

            {phase === 'recording' && (
              <Text style={styles.timerRecording}>{fmt(elapsed)}</Text>
            )}

            {phase === 'idle' && (
              <>
                <Pressable onPress={handleStartRecording} style={({ pressed }) => [styles.recordBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}>
                  <Mic size={36} color="#fff" />
                </Pressable>
                <Text style={styles.recordHint}>Tap to start recording</Text>
              </>
            )}

            {phase === 'recording' && (
              <Pressable onPress={handleStopRecording} style={({ pressed }) => [styles.recordBtn, styles.recordBtnActive, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}>
                <Square size={28} color="#fff" fill="#fff" />
              </Pressable>
            )}

            {phase === 'transcribing' && (
              <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={colors.accent2} />
                <Text style={styles.loadingText}>{loadingMsg}</Text>
                <Text style={styles.loadingSub}>Naer is listening…</Text>
              </View>
            )}

            {phase === 'review' && (
              <ScrollView style={styles.reviewScroll} contentContainerStyle={styles.reviewContent} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

                {/* Playback */}
                <Pressable onPress={handlePlayback} style={({ pressed }) => [styles.playRow, pressed && { opacity: 0.8 }]}>
                  <View style={styles.playBtn}>
                    {isPlaying ? <Square size={16} color="#fff" fill="#fff" /> : <Play size={16} color="#fff" fill="#fff" />}
                  </View>
                  <Text style={styles.playLabel}>{isPlaying ? 'Playing…' : 'Play recording'}</Text>
                  <Pressable onPress={handleReset} style={styles.retakeBtn}>
                    <RotateCcw size={14} color={colors.muted} />
                    <Text style={styles.retakeText}>Retake</Text>
                  </Pressable>
                </Pressable>

                {/* Transcript */}
                <Text style={styles.reviewLabel}>TRANSCRIPT</Text>
                <TextInput value={transcript} onChangeText={setTranscript} style={styles.transcriptInput} multiline textAlignVertical="top" placeholderTextColor={colors.muted} />

                {/* Contact picker */}
                <Text style={styles.reviewLabel}>WHO IS THIS ABOUT?</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.contactScroll} contentContainerStyle={{ paddingRight: 8 }}>
                  {PEOPLE.map((person) => {
                    const selected = selectedPersonId === person.id
                    return (
                      <Pressable key={person.id} onPress={() => setSelectedPersonId(selected ? null : person.id)} style={styles.contactChip}>
                        <View style={[styles.contactAvatar, selected && styles.contactAvatarSelected]}>
                          <Text style={[styles.contactInitial, selected && { color: '#fff' }]}>{person.initial}</Text>
                          {selected && <View style={styles.contactCheck}><Check size={10} color="#fff" /></View>}
                        </View>
                        <Text style={[styles.contactName, selected && styles.contactNameSelected]}>{person.first}</Text>
                      </Pressable>
                    )
                  })}
                </ScrollView>

                {/* AI suggestions */}
                {parsed && (parsed.followUps.length > 0 || parsed.infoUpdates.length > 0) && (
                  <View>
                    <Text style={styles.reviewLabel}>NAER NOTICED</Text>

                    {parsed.followUps.map((fu, i) => (
                      <Pressable key={`fu-${i}`} onPress={() => toggleFollowUp(i)} style={[styles.suggestionCard, acceptedFollowUps.has(i) && styles.suggestionCardOn]}>
                        <View style={[styles.suggestionTick, acceptedFollowUps.has(i) && styles.suggestionTickOn]}>
                          {acceptedFollowUps.has(i) && <Check size={11} color="#fff" />}
                        </View>
                        <View style={styles.suggestionBody}>
                          <Text style={styles.suggestionText}>{fu.description}</Text>
                          {fu.dueDate && (
                            <View style={styles.suggestionDateRow}>
                              <Calendar size={11} color={colors.accent} />
                              <Text style={styles.suggestionDate}>{fmtDate(fu.dueDate)}</Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.suggestionTag}>
                          <Text style={styles.suggestionTagText}>FOLLOW-UP</Text>
                        </View>
                      </Pressable>
                    ))}

                    {parsed.infoUpdates.map((u, i) => (
                      <Pressable key={`iu-${i}`} onPress={() => toggleInfoUpdate(i)} style={[styles.suggestionCard, acceptedInfoUpdates.has(i) && styles.suggestionCardOn]}>
                        <View style={[styles.suggestionTick, acceptedInfoUpdates.has(i) && styles.suggestionTickOn]}>
                          {acceptedInfoUpdates.has(i) && <Check size={11} color="#fff" />}
                        </View>
                        <View style={styles.suggestionBody}>
                          <Text style={styles.suggestionLabel}>{u.field}</Text>
                          <Text style={styles.suggestionText}>{u.value}</Text>
                        </View>
                        <View style={[styles.suggestionTag, { backgroundColor: colors.accent2Soft }]}>
                          <Text style={[styles.suggestionTagText, { color: colors.accent2 }]}>INFO</Text>
                        </View>
                      </Pressable>
                    ))}
                  </View>
                )}

                <Pressable
                  onPress={handleSaveVoice}
                  style={({ pressed }) => [styles.saveBtn, !transcript.trim() && styles.saveBtnDisabled, pressed && { opacity: 0.8 }]}
                  disabled={!transcript.trim()}
                >
                  <Text style={styles.saveBtnText}>
                    {selectedPersonId ? `Save to ${PEOPLE.find((p) => p.id === selectedPersonId)?.first}` : 'Save note'}
                  </Text>
                </Pressable>
              </ScrollView>
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
  saveBtn: { backgroundColor: colors.accent, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnDisabled: { opacity: 0.4 },
  saveBtnText: { fontFamily: fonts.uiSemiBold, fontSize: 16, color: '#fff' },
  voiceArea: { flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' },
  waveformWrap: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 60, paddingHorizontal: 8, marginBottom: 28 },
  waveBar: { width: 5, borderRadius: 3 },
  timerRecording: { fontFamily: fonts.display, fontSize: 32, color: colors.accent, letterSpacing: 2, marginBottom: 28 },
  recordBtn: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.accent2, alignItems: 'center', justifyContent: 'center', ...shadow.card, marginBottom: 20 },
  recordBtnActive: { backgroundColor: colors.accent },
  recordHint: { fontFamily: fonts.ui, fontSize: 15, color: colors.muted },
  loadingWrap: { alignItems: 'center', gap: 16 },
  loadingText: { fontFamily: fonts.display, fontSize: 22, color: colors.ink },
  loadingSub: { fontFamily: fonts.ui, fontSize: 14, color: colors.muted },
  reviewScroll: { width: '100%' },
  reviewContent: { paddingBottom: 20 },
  playRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, gap: 12, ...shadow.small, marginBottom: 20 },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.accent2, alignItems: 'center', justifyContent: 'center' },
  playLabel: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 14, color: colors.ink },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  retakeText: { fontFamily: fonts.ui, fontSize: 13, color: colors.muted },
  reviewLabel: { fontFamily: fonts.uiSemiBold, fontSize: 11, color: colors.muted, letterSpacing: 0.8, marginBottom: 8, marginTop: 4 },
  transcriptInput: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, fontFamily: fonts.ui, fontSize: 15, color: colors.ink, minHeight: 90, ...shadow.small, marginBottom: 20 },
  contactScroll: { marginBottom: 20, marginHorizontal: -20 },
  contactChip: { alignItems: 'center', marginLeft: 20, gap: 6, width: 56 },
  contactAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.accent2Soft, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'transparent' },
  contactAvatarSelected: { borderColor: colors.accent2, backgroundColor: colors.accent2 },
  contactInitial: { fontFamily: fonts.display, fontSize: 18, color: colors.accent2 },
  contactCheck: { position: 'absolute', bottom: 0, right: 0, width: 16, height: 16, borderRadius: 8, backgroundColor: colors.good, alignItems: 'center', justifyContent: 'center' },
  contactName: { fontFamily: fonts.ui, fontSize: 11, color: colors.muted, textAlign: 'center' },
  contactNameSelected: { color: colors.accent2, fontFamily: fonts.uiMedium },
  suggestionCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, gap: 10, marginBottom: 8, borderWidth: 1.5, borderColor: 'transparent', ...shadow.small },
  suggestionCardOn: { borderColor: colors.good, backgroundColor: '#f0fbf7' },
  suggestionTick: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  suggestionTickOn: { backgroundColor: colors.good, borderColor: colors.good },
  suggestionBody: { flex: 1 },
  suggestionLabel: { fontFamily: fonts.uiSemiBold, fontSize: 11, color: colors.muted, marginBottom: 2 },
  suggestionText: { fontFamily: fonts.uiMedium, fontSize: 13, color: colors.ink },
  suggestionDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  suggestionDate: { fontFamily: fonts.ui, fontSize: 12, color: colors.accent },
  suggestionTag: { backgroundColor: colors.accentSoft, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 3 },
  suggestionTagText: { fontFamily: fonts.uiSemiBold, fontSize: 9, letterSpacing: 0.6, color: colors.accent },
})
