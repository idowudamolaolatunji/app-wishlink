import { BaseColors, radius } from '@/constants/theme';
import { verticalScale } from '@/utils/styling';
import { BackButtonProps } from '@/utils/types';
import { useRouter } from 'expo-router';
import { CaretDownIcon, CaretLeftIcon, XIcon } from 'phosphor-react-native';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function BackButton({ style, iconSize=26, iconType="back", customAction }: BackButtonProps) {
    const router = useRouter();
    const hasCustomAction = customAction;

    const handlePress = function() {
        if(hasCustomAction) {
            customAction();
        } else {
            router.back();
        }
    }

    return (
        <TouchableOpacity style={[styles.button, style]} onPress={handlePress}>
            {iconType === "back" && (
                <CaretLeftIcon
                    size={verticalScale(iconSize)}
                    color={BaseColors.white}
                    weight='bold'
                />
            )}

            {iconType === "cancel" && (
                <XIcon
                    size={verticalScale(iconSize)}
                    color={BaseColors.white}
                    weight='bold'
                />
            )}

            {iconType === "drop" && (
                <CaretDownIcon
                    size={verticalScale(iconSize)}
                    color={BaseColors.white}
                    weight='bold'
                />
            )}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: BaseColors.neutral600,
        alignSelf: "flex-start",
        borderRadius: radius._12,
        borderCurve: "continuous",
        padding: 5
    }
})