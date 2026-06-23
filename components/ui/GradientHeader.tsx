import React from 'react'
import { StyleSheet, ViewStyle } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../../constants/tokens'

interface GradientHeaderProps {
  children: React.ReactNode
  style?: ViewStyle
  from?: string
  to?: string
  paddingBottom?: number
}

export function GradientHeader({
  children,
  style,
  from = colors.heroFrom,
  to = colors.heroTo,
  paddingBottom = 24,
}: GradientHeaderProps) {
  const insets = useSafeAreaInsets()

  return (
    <LinearGradient
      colors={[from, to]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.header, { paddingTop: insets.top + 12, paddingBottom }, style]}
    >
      {children}
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
  },
})
