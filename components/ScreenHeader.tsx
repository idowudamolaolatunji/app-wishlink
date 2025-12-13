import { HeaderProps } from '@/utils/types';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import Typography from './Typography';

export default function ScreenHeader({ title, leftElement, rightElement, style }: HeaderProps) {
    return (
        <View style={[styles.container, style]}>
            {leftElement && (
                <View style={styles.leftElement}>
                    {leftElement}
                </View>
            )}

            {rightElement && (
                <View style={styles.rightElement}>
                    {rightElement}
                </View>
            )}

            {title && (
                <Typography
                    size={Platform.OS === "ios" ? 22 : 23.5}
                    fontFamily="urbanist-bold"
                    style={{
                        textAlign: "center",
                        width: leftElement ? "82%" : "100%"
                    }}
                >
                    {title}
                </Typography>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: "100%",
        alignItems: "center",
        flexDirection: "row"
    },
    leftElement: {
        alignSelf: "flex-start"
    },
    rightElement: {
        alignSelf: "flex-end",
        marginLeft: "auto",
    },
});