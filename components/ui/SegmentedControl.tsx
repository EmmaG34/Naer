import React from 'react'
import { View, Text, StyleSheet, Pressable } from 'react-native'
import { colors, fonts } from '../../constants/tokens'

interface SegmentedControlProps {
  options: string[]
  selected: number
  onChange: (index: number) => void
}

export function SegmentedControl({ options, selected, onChange }: SegmentedControlProps) {
  return (
    <View style={styles.container}>
      {options.map((opt, i) => (
        <Pressable
          key={i}
          onPress={() => onChange(i)}
          style={[styles.segment, selected === i && styles.segmentSelected]}
        >
          <Text style={[styles.label, selected === i && styles.labelSelected]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.bg,
    borderRadius: 10,
    padding: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentSelected: {
    backgroundColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  label: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    color: colors.muted,
  },
  labelSelected: {
    color: colors.ink,
  },
})
