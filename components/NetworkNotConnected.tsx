import { BaseColors, spacingY } from '@/constants/theme'
import { useTheme } from '@/hooks/useTheme'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, View } from 'react-native'
import Button from './Button'
import Typography from './Typography'

interface LocationProps {
    location?: "wallet" | "wishlist" 
}

export default function NetworkNotConnected({ location }: LocationProps) {
    const router = useRouter();
    const { Colors, currentTheme } = useTheme();

  return (
    <View style={{ marginTop: spacingY._15, gap: spacingY._10 }}>
        <Typography
            size={verticalScale(24)}
            color={Colors.text}
            fontFamily="urbanist-semibold"
        >
            Connect to the internet
        </Typography>
        <Typography
            size={15.5}
            color={Colors.textLighter}
            fontFamily="urbanist-semibold"
        >
            You're offline
        </Typography>
        {/* @ts-ignore */}
        <Button onPress={() => router.replace(`/(tabs)${location ? "/"+location : ""}`)} style={{ backgroundColor: BaseColors[currentTheme == "dark" ? "neutral400" : "neutral600"]}}>
            <Typography
                size={20}
                color={Colors.white}
                fontFamily="urbanist-semibold"
            >
                Retry
            </Typography>
        </Button>
    </View>
  )
}

const styles = StyleSheet.create({})