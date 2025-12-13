import { spacingY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { modalWrapperProps } from '@/utils/types';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

const isIOS = Platform.OS === "ios";
export default function ModalWrapper({ style, children, bgColor }: modalWrapperProps) {
    const { Colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: bgColor || Colors.background }, style]}>
            {children}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: isIOS ? spacingY._15 : 35,
        // paddingBottom: isIOS ? spacingY._20 : spacingY._10
        paddingBottom: isIOS ? spacingY._15 : spacingY._5
    }
})