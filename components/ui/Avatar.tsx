import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { colors, fonts } from '../../constants/tokens'

interface AvatarProps {
  initial: string
  size?: number
  bg?: string
  textColor?: string
}

export function Avatar({ initial, size = 44, bg = colors.accent2, textColor = '#fff' }: AvatarProps) {
  const fontSize = size * 0.4

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.text, { fontSize, color: textColor }]}>{initial}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fonts.display,
    fontWeight: '400',
  },
})
