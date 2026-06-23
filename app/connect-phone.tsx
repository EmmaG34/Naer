import React, { useState, useRef } from 'react'
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { X, Phone } from 'lucide-react-native'
import { colors, fonts, shadow } from '../constants/tokens'
import { useStore } from '../store/useStore'

export default function ConnectPhoneScreen() {
  const insets = useSafeAreaInsets()
  const { showToast } = useStore()
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const inputRefs = useRef<(TextInput | null)[]>([])

  const handleSendCode = () => {
    if (phone.length < 8) { showToast('Please enter a valid phone number'); return }
    setStep('otp')
    showToast('Code sent! Check your messages.')
  }

  const handleOtpChange = (val: string, idx: number) => {
    const updated = [...otp]
    updated[idx] = val
    setOtp(updated)
    if (val && idx < 5) inputRefs.current[idx + 1]?.focus()
  }

  const handleVerify = () => {
    const code = otp.join('')
    if (code.length < 6) { showToast('Please enter the full code'); return }
    showToast('Phone connected!')
    router.back()
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.closeBtn}><X size={20} color={colors.ink} /></Pressable>
        <Text style={styles.title}>Connect phone</Text>
        <View style={{ width: 36 }} />
      </View>
      <View style={styles.iconWrap}><View style={styles.iconCircle}><Phone size={32} color={colors.accent} /></View></View>
      {step === 'phone' ? (
        <>
          <Text style={styles.heading}>Your phone number</Text>
          <Text style={styles.sub}>We\'ll send a one-time code to verify.</Text>
          <View style={styles.inputRow}>
            <TextInput value={phone} onChangeText={setPhone} placeholder="+44 7700 900123" placeholderTextColor={colors.muted} style={styles.phoneInput} keyboardType="phone-pad" autoFocus />
          </View>
          <Pressable onPress={handleSendCode} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}>
            <Text style={styles.btnText}>Send code</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.heading}>Enter your code</Text>
          <Text style={styles.sub}>We sent a 6-digit code to {phone}</Text>
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput key={i} ref={(r) => { inputRefs.current[i] = r }} value={digit} onChangeText={(v) => handleOtpChange(v.slice(-1), i)} style={[styles.otpInput, digit && styles.otpInputFilled]} keyboardType="number-pad" maxLength={1} textAlign="center" />
            ))}
          </View>
          <Pressable onPress={handleVerify} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}>
            <Text style={styles.btnText}>Verify</Text>
          </Pressable>
          <Pressable onPress={() => setStep('phone')} style={styles.resendBtn}>
            <Text style={styles.resendText}>Resend code</Text>
          </Pressable>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, paddingHorizontal: 24 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', ...shadow.small },
  title: { fontFamily: fonts.display, fontSize: 18, color: colors.ink },
  iconWrap: { alignItems: 'center', marginBottom: 24 },
  iconCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  heading: { fontFamily: fonts.display, fontSize: 28, color: colors.ink, marginBottom: 8 },
  sub: { fontFamily: fonts.ui, fontSize: 15, color: colors.muted, marginBottom: 32 },
  inputRow: { backgroundColor: colors.surface, borderRadius: 16, marginBottom: 16, ...shadow.small },
  phoneInput: { paddingHorizontal: 16, paddingVertical: 16, fontFamily: fonts.ui, fontSize: 18, color: colors.ink },
  otpRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  otpInput: { flex: 1, height: 52, backgroundColor: colors.surface, borderRadius: 14, fontFamily: fonts.display, fontSize: 22, color: colors.ink, borderWidth: 2, borderColor: colors.line, ...shadow.small },
  otpInputFilled: { borderColor: colors.accent2, backgroundColor: colors.accent2Soft },
  btn: { backgroundColor: colors.accent, borderRadius: 18, paddingVertical: 18, alignItems: 'center', marginBottom: 12 },
  btnText: { fontFamily: fonts.uiSemiBold, fontSize: 16, color: '#fff' },
  resendBtn: { alignItems: 'center', paddingVertical: 8 },
  resendText: { fontFamily: fonts.ui, fontSize: 14, color: colors.muted },
})
