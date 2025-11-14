import { useTheme } from '@/hooks/useTheme';
import { Image } from 'expo-image';
import React from 'react';
import { StyleSheet, View } from 'react-native';

export default function index() {
    const { Colors } = useTheme();
    
    return (
        <View style={[styles.container, { backgroundColor: Colors.background }]}>
            <Image
                style={styles.logo}
                contentFit='contain'
                source={require("../assets/svgs/logo.svg")}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 250,
        aspectRatio: 1,
    }
})