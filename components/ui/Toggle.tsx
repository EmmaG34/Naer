import React, { useEffect, useRef } from 'react'
import { Pressable, Animated, StyleSheet } from 'react-native'
import { colors } from '../../constants/tokens'

interface ToggleProps {
  value: boolean
  onValueChange: (val: boolean) => void
}

export function Toggle({ value, onValueChange }: ToggleProps) {
  const translateX = useRef(new Animated.Value(value ? 22 : 2)).current

  useEffect(() => {
    Animated.spring(translateX, {
      toValue: value ? 22 : 2,
      useNativeDriver: true,
    }).start()
  }, [value])

  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[styles.track, value && styles.trackOn]}
    >
      <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.ringTrack,
    justifyContent: 'center',
  },
  trackOn: {
    backgroundColor: colors.accent,
  },
  thumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
})
