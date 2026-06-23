import React from 'react'
import { View } from 'react-native'
import Svg, { Circle } from 'react-native-svg'
import { colors } from '../../constants/tokens'
import { Avatar } from './Avatar'

interface HealthRingProps {
  initial: string
  pct: number
  size?: number
  status?: 'needs' | 'fading' | 'good'
}

function statusColor(status?: string, pct?: number): string {
  if (status === 'good') return colors.good
  if (status === 'fading') return colors.fading
  if (status === 'needs') return colors.accent
  if (pct !== undefined) {
    if (pct >= 70) return colors.good
    if (pct >= 40) return colors.fading
    return colors.accent
  }
  return colors.accent
}

export function HealthRing({ initial, pct, size = 56, status }: HealthRingProps) {
  const strokeWidth = 3
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - pct / 100)
  const ringColor = statusColor(status, pct)

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.ringTrack}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: strokeWidth,
          left: strokeWidth,
          right: strokeWidth,
          bottom: strokeWidth,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Avatar initial={initial} size={size - strokeWidth * 2 - 4} />
      </View>
    </View>
  )
}
