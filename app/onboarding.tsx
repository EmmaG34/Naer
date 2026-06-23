import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
} from 'react-native'
import { router } from 'expo-router'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts } from '../constants/tokens'
import { useStore } from '../store/useStore'

const STEPS = [
  {
    title: 'Friendships,\nnot forgotten',
    subtitle: 'Naer helps you stay close to the people who matter — without the mental overhead.',
    illustration: '🌱',
  },
  {
    title: 'We remember,\nso you don\'t have to',
    subtitle: 'Naer notices when it\'s been a while and nudges you with the perfect thing to say.',
    illustration: '💬',
  },
  {
    title: 'What\'s your name?',
    subtitle: 'We\'ll personalise your experience.',
    illustration: null,
    isForm: true,
  },
]

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const { setHasOnboarded } = useStore()

  const current = STEPS[step]

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      setHasOnboarded(true)
      router.replace('/(tabs)')
    }
  }

  return (
    <LinearGradient
      colors={[colors.heroFrom, colors.heroTo]}
      style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}
    >
      <View style={styles.stepRow}>
        {STEPS.map((_, i) => (
          <View key={i} style={[styles.stepDot, i === step && styles.stepDotActive]} />
        ))}
      </View>

      <View style={styles.content}>
        {current.illustration && (
          <Text style={styles.illustration}>{current.illustration}</Text>
        )}
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.subtitle}>{current.subtitle}</Text>

        {current.isForm && (
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Your first name"
            placeholderTextColor="rgba(255,255,255,0.5)"
            style={styles.input}
            autoFocus
          />
        )}
      </View>

      <Pressable
        onPress={handleNext}
        style={({ pressed }) => [
          styles.nextBtn,
          pressed && { opacity: 0.8, transform: [{ scale: 0.97 }] },
        ]}
      >
        <Text style={styles.nextBtnText}>
          {step < STEPS.length - 1 ? 'Continue' : 'Get started'}
        </Text>
      </Pressable>

      {step < STEPS.length - 1 && (
        <Pressable onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
          <Text style={styles.skipText}>Skip</Text>
        </Pressable>
      )}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 28 },
  stepRow: { flexDirection: 'row', gap: 8, marginTop: 16, alignSelf: 'center' },
  stepDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)' },
  stepDotActive: { backgroundColor: '#fff', width: 24 },
  content: { flex: 1, justifyContent: 'center' },
  illustration: { fontSize: 64, textAlign: 'center', marginBottom: 32 },
  title: { fontFamily: fonts.display, fontSize: 36, color: '#fff', lineHeight: 44, marginBottom: 16 },
  subtitle: { fontFamily: fonts.ui, fontSize: 17, color: 'rgba(255,255,255,0.75)', lineHeight: 26 },
  input: {
    marginTop: 32,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 18,
    fontFamily: fonts.ui,
    fontSize: 17,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  nextBtn: { backgroundColor: '#fff', borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginBottom: 16 },
  nextBtnText: { fontFamily: fonts.uiSemiBold, fontSize: 17, color: colors.heroFrom },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { fontFamily: fonts.ui, fontSize: 15, color: 'rgba(255,255,255,0.55)' },
})
