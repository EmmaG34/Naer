import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  Animated,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X, Mic, Type, Play, Square, RotateCcw } from 'lucide-react-native'
import { Audio } from 'expo-av'
import { colors, fonts, shadow } from '../constants/tokens'
import { useStore } from '../store/useStore'
import {
  requestAudioPermissions,
  startRecording,
  stopRecording,
  playAudio,
  stopPlayback,
} from '../utils/audio'

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
      bars.forEach((bar) => {
        Animated.timing(bar, {
          toValue: 0.15 + Math.random() * 0.85,
          duration: 120 + Math.random() * 180,
          useNativeDriver: false,
        }).start()
      })
      setTimeout(pulse, 150)
    }

    pulse()
    return () => { cancelled = true }
  }, [active, bars])

  return bars
}

type RecordPhase = 'idle' | 'recording' | 'stopped'

export default function CaptureScreen() {
  const insets = useSafeAreaInsets()
  const [mode, setMode] = useState<'voice' | 'text'>('voice')
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<RecordPhase>('idle')
  const [recordingUri, setRecordingUri] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [note, setNote] = useState('')
  const [elapsed, setElapsed] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const soundRef = useRef<Audio.Sound | null>(null)
  const { showToast, addCapture } = useStore()

  const waveformBars = useWaveform(phase === 'recording')

  const clearTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearTimer()
      stopPlayback()
    }
  }, [])

  const handleStartRecording = async () => {
    const granted = await requestAudioPermissions()
    if (!granted) {
      Alert.alert(
        'Microphone access needed',
        'Enable microphone access for Naer in your device Settings to record voice notes.',
        [{ text: 'OK' }]
      )
      return
    }
    try {
      await startRecording()
      setPhase('recording')
      setElapsed(0)
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } catch {
      showToast('Could not start recording')
    }
  }

  const handleStopRecording = async () => {
    clearTimer()
    try {
      const uri = await stopRecording()
      setRecordingUri(uri)
      setPhase('stopped')
    } catch {
      showToast('Recording error — please try again')
      setPhase('idle')
    }
  }

  const handlePlayback = async () => {
    if (!recordingUri) return
    if (isPlaying) {
      await stopPlayback()
      setIsPlaying(false)
      return
    }
    setIsPlaying(true)
    try {
      const sound = await playAudio(recordingUri)
      soundRef.current = sound
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          setIsPlaying(false)
          sound.unloadAsync()
        }
      })
    } catch {
      setIsPlaying(false)
      showToast('Could not play recording')
    }
  }

  const handleReset = async () => {
    await stopPlayback()
    setIsPlaying(false)
    setRecordingUri(null)
    setNote('')
    setElapsed(0)
    setPhase('idle')
  }

  const handleSaveVoice = () => {
    if (!recordingUri) return
    addCapture({
      id: String(Date.now()),
      type: 'voice',
      content: note.trim() || '(voice note)',
      uri: recordingUri,
      createdAt: new Date(),
    })
    showToast('Voice note saved!')
    router.back()
  }

  const handleSaveText = () => {
    if (!text.trim()) return
    addCapture({
      id: String(Date.now()),
      type: 'text',
      content: text.trim(),
      createdAt: new Date(),
    })
    showToast('Note saved!')
    router.back()
  }

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

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
        <Pressable onPress={() => setMode('voice')} style={[styles.modeBtn, mode === 'voice' && styles.modeBtnActive]}>
          <Mic size={16} color={mode === 'voice' ? '#fff' : colors.muted} />
          <Text style={[styles.modeBtnText, mode === 'voice' && styles.modeBtnTextActive]}>Voice</Text>
        </Pressable>
        <Pressable onPress={() => setMode('text')} style={[styles.modeBtn, mode === 'text' && styles.modeBtnActive]}>
          <Type size={16} color={mode === 'text' ? '#fff' : colors.muted} />
          <Text style={[styles.modeBtnText, mode === 'text' && styles.modeBtnTextActive]}>Text</Text>
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
              onPress={handleSaveText}
              style={({ pressed }) => [styles.saveBtn, !text.trim() && styles.saveBtnDisabled, pressed && { opacity: 0.8 }]}
              disabled={!text.trim()}
            >
              <Text style={styles.saveBtnText}>Save note</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.voiceArea}>
            {/* Waveform */}
            <View style={styles.waveformWrap}>
              {waveformBars.map((bar, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.waveBar,
                    {
                      height: bar.interpolate({ inputRange: [0, 1], outputRange: [4, 52] }),
                      backgroundColor: phase === 'recording' ? colors.accent : colors.accent2,
                      opacity: phase === 'idle' ? 0.25 : 1,
                    },
                  ]}
                />
              ))}
            </View>

            {/* Timer */}
            {phase !== 'idle' && (
              <Text style={[styles.timer, phase === 'recording' && styles.timerRecording]}>
                {formatTime(elapsed)}
              </Text>
            )}

            {/* Record button */}
            {phase === 'idle' && (
              <Pressable
                onPress={handleStartRecording}
                style={({ pressed }) => [styles.recordBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
              >
                <Mic size={36} color="#fff" />
              </Pressable>
            )}

            {phase === 'recording' && (
              <Pressable
                onPress={handleStopRecording}
                style={({ pressed }) => [styles.recordBtn, styles.recordBtnActive, pressed && { opacity: 0.85, transform: [{ scale: 0.96 }] }]}
              >
                <Square size={28} color="#fff" fill="#fff" />
              </Pressable>
            )}

            {/* Post-recording controls */}
            {phase === 'stopped' && recordingUri && (
              <View style={styles.postRecord}>
                <View style={styles.playRow}>
                  <Pressable onPress={handlePlayback} style={styles.playBtn}>
                    {isPlaying
                      ? <Square size={20} color="#fff" fill="#fff" />
                      : <Play size={20} color="#fff" fill="#fff" />}
                  </Pressable>
                  <Text style={styles.playLabel}>{isPlaying ? 'Playing...' : 'Preview recording'}</Text>
                  <Pressable onPress={handleReset} style={styles.retakeBtn}>
                    <RotateCcw size={16} color={colors.muted} />
                    <Text style={styles.retakeText}>Retake</Text>
                  </Pressable>
                </View>

                <TextInput
                  value={note}
                  onChangeText={setNote}
                  placeholder="Add a note (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.noteInput}
                />

                <Pressable
                  onPress={handleSaveVoice}
                  style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.8 }]}
                >
                  <Text style={styles.saveBtnText}>Save voice note</Text>
                </Pressable>
              </View>
            )}

            {phase === 'idle' && (
              <Text style={styles.recordHint}>Tap to start recording</Text>
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
  voiceArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 28, width: '100%' },
  waveformWrap: { flexDirection: 'row', alignItems: 'center', gap: 3, height: 60, paddingHorizontal: 8 },
  waveBar: { width: 5, borderRadius: 3 },
  timer: { fontFamily: fonts.display, fontSize: 32, color: colors.muted, letterSpacing: 2 },
  timerRecording: { color: colors.accent },
  recordBtn: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.accent2, alignItems: 'center', justifyContent: 'center', ...shadow.card },
  recordBtnActive: { backgroundColor: colors.accent },
  recordHint: { fontFamily: fonts.ui, fontSize: 15, color: colors.muted },
  postRecord: { width: '100%', gap: 12 },
  playRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, borderRadius: 14, padding: 14, gap: 12, ...shadow.small },
  playBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent2, alignItems: 'center', justifyContent: 'center' },
  playLabel: { flex: 1, fontFamily: fonts.uiMedium, fontSize: 14, color: colors.ink },
  retakeBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  retakeText: { fontFamily: fonts.ui, fontSize: 13, color: colors.muted },
  noteInput: { backgroundColor: colors.surface, borderRadius: 14, padding: 14, fontFamily: fonts.ui, fontSize: 14, color: colors.ink, ...shadow.small },
})
