import React, { useEffect, useRef } from 'react'
import { Text, StyleSheet, Animated, Pressable } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors, fonts } from '../../constants/tokens'
import { useStore } from '../../store/useStore'

export function ToastContainer() {
  const { toasts, dismissToast } = useStore()
  const insets = useSafeAreaInsets()

  return (
    <>
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          message={toast.message}
          onDismiss={() => dismissToast(toast.id)}
          topOffset={insets.top + 8}
        />
      ))}
    </>
  )
}

function ToastItem({
  message,
  onDismiss,
  topOffset,
}: {
  message: string
  onDismiss: () => void
  topOffset: number
}) {
  const translateY = useRef(new Animated.Value(-80)).current
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
    ]).start()
  }, [])

  return (
    <Animated.View
      style={[
        styles.toast,
        { top: topOffset, opacity, transform: [{ translateY }] },
      ]}
    >
      <Pressable onPress={onDismiss} style={styles.inner}>
        <Text style={styles.text}>{message}</Text>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: 20,
    right: 20,
    zIndex: 9999,
    alignSelf: 'center',
  },
  inner: {
    backgroundColor: colors.ink,
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  text: {
    fontFamily: fonts.ui,
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
  },
})
