import { BaseColors, radius, spacingY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { verticalScale } from '@/utils/styling';
import { CaretDownIcon } from 'phosphor-react-native';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, { Extrapolation, FadeInDown, interpolate, measure, useAnimatedRef, useAnimatedStyle, useDerivedValue, useSharedValue, withTiming } from 'react-native-reanimated';
import { runOnUIAsync } from 'react-native-worklets';
import Typography from './Typography';

type AccordionType = {
    title: string;
    content: string;
}

export default function Accordion({ data, index }: { data: AccordionType, index: number }) {
    const { Colors, currentTheme } = useTheme();

    const listRef = useAnimatedRef<Animated.View>();
    const heightValue = useSharedValue(0);
    
    const open = useSharedValue(false);
    const progress = useDerivedValue(() => open.value ? withTiming(1) : withTiming(0))
    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ rotate: `${progress.value * -180}deg` }]
    }))

    const heightAnimationStyle = useAnimatedStyle(() => ({
        height: interpolate(
            progress.value,
            [0, 1],
            [0, heightValue.value],
            // Extrapolate.CLAMP
            Extrapolation.CLAMP
        )
    }))
    
  return (
    <Animated.View entering={FadeInDown.delay(index * 50)} style={[styles.container, { backgroundColor: Colors.background200, borderColor: currentTheme == "dark" ? BaseColors.neutral800 : "transparent" }]}>
        <Pressable style={styles.titleContainer} 
            onPress={() => {
                if(heightValue.value === 0) {
                    // runOnUI(() => {
                    runOnUIAsync(() => {
                        "worklet";
                        heightValue.value = measure(listRef)?.height || 0;
                    })();
                }
                open.value = !open.value
            }}
        >
            <Typography fontFamily="urbanist-medium" size={verticalScale(21)} style={{ textTransform: "capitalize" }}>{data?.title}</Typography>
            <Animated.View style={[styles.iconContainer, iconStyle]}>
                <CaretDownIcon color={Colors.accent} size={verticalScale(20)} weight="bold" />
            </Animated.View>
        </Pressable>

        <Animated.View style={heightAnimationStyle}>
            <Animated.View ref={listRef} style={[styles.content, { backgroundColor: Colors.cardBackground }]}>
                <Typography color={Colors.textLighter} size={verticalScale(18)} style={{ lineHeight: 26, }}>{data?.content}</Typography>
            </Animated.View>
        </Animated.View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
    container: {
        marginVertical: spacingY._10,
        borderRadius: radius._10,
        borderWidth: 1,
        position: "relative",
        overflow: "hidden",
    },
    titleContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: spacingY._20,
        paddingVertical: spacingY._15,
    },
    iconContainer: {
        width: verticalScale(24),
        height: verticalScale(24),
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 100,
        backgroundColor: BaseColors.primaryLight,
    },
    content: {
        position: "absolute",
        width: "100%",
        top: 0,
        padding: spacingY._20,
        paddingVertical: spacingY._12,
    }
})