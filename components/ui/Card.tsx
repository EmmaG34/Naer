import React from 'react'
import { View, StyleSheet, ViewStyle } from 'react-native'
import { colors, shadow } from '../../constants/tokens'

interface CardProps {
  children: React.ReactNode
  style?: ViewStyle
  padding?: number
}

export function Card({ children, style, padding = 20 }: CardProps) {
  return (
    <View style={[styles.card, { padding }, style]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    ...shadow.card,
  },
})
