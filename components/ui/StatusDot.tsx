import React from 'react'
import { View, StyleSheet } from 'react-native'
import { colors } from '../../constants/tokens'

interface StatusDotProps {
  status: 'needs' | 'fading' | 'good'
  size?: number
}

function dotColor(status: string): string {
  if (status === 'good') return colors.good
  if (status === 'fading') return colors.fading
  return colors.accent
}

export function StatusDot({ status, size = 8 }: StatusDotProps) {
  return (
    <View
      style={[
        styles.dot,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: dotColor(status) },
      ]}
    />
  )
}

const styles = StyleSheet.create({
  dot: {},
})
