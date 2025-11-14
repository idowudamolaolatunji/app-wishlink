import Button from '@/components/Button'
import ScreenWrapper from '@/components/ScreenWrapper'
import Typography from '@/components/Typography'
import { BaseColors, spacingX, spacingY } from '@/constants/theme'
import { useTheme } from '@/hooks/useTheme'
import { verticalScale } from '@/utils/styling'
import { useRouter } from 'expo-router'
import React from 'react'
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated'

export default function WelcomeScreen() {
    const router = useRouter();
    const { Colors } = useTheme();

    return (
        <ScreenWrapper>
            <View style={styles.container}>
                {/* Login Button and Image */}
                <View>
                    <TouchableOpacity style={styles.loginButton} onPress={() => router.push("/(auth)/login")}>
                        <Typography fontWeight="500" fontFamily="urbanist-semibold" size={Platform.OS == "ios" ? 21 : 26}>Login</Typography>
                    </TouchableOpacity>

                    <Animated.Image
                        entering={FadeIn.duration(1000)}
                        source={require("@/assets/images/test.png")}
                        style={styles.welcomeImage}
                        resizeMode="contain"
                    />
                </View>

                {/* Footer Area */}
                <View style={styles.footerArea}>
                    <Animated.View style={{ alignItems: "center" }}
                        entering={FadeInDown.duration(1000)}
                    >
                        <Typography size={ Platform.OS == "ios" ? 30 : 38} fontFamily='urbanist-bold' fontWeight="600" style={{ letterSpacing: 1 }}>
                            Make your 
                        </Typography>
                        <Typography size={ Platform.OS == "ios" ? 30 : 38} fontFamily='urbanist-bold' fontWeight="600" style={{ letterSpacing: 1 }}>
                            wishes come through
                        </Typography>
                    </Animated.View>
                    <Animated.View style={{ alignItems: "center", gap: 2 }}
                        entering={FadeInDown.duration(1000).delay(100)}
                    >
                        <Typography size={Platform.OS == "ios" ? 16.5 : 18} color={Colors.textLighter} fontFamily='urbanist-medium' style={{ letterSpacing: 0.7 }}>
                            Lorem ipsum dolor sit amet consectetur
                        </Typography>
                        <Typography size={Platform.OS == "ios" ? 16.5 : 18} color={Colors.textLighter} fontFamily='urbanist-medium' style={{ letterSpacing: 0.7 }}>
                            Lorem, ipsum dolor.
                        </Typography>
                    </Animated.View>

                    <View style={styles.ctaButtonConatiner}>
                        <Button onPress={() => router.push("/(auth)/sign-up")}>
                            <Typography size={Platform.OS == "ios" ? 20 : 25} color={BaseColors.white} fontWeight="600" fontFamily='urbanist-bold'
                                // this wasnt neccessary but there is a bug inside this side
                                style={{ borderWidth: 1, borderColor: "transparent" }}>
                                Get Started
                            </Typography>
                        </Button>
                    </View>
                </View>
            </View>
        </ScreenWrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingTop: spacingY._7,
    },
    welcomeImage: {
        width: "100%",
        height: verticalScale(300),
        marginTop: verticalScale(100),
        alignSelf: "center",
    },
    loginButton: {
        alignSelf: "flex-end",
        marginRight: spacingX._20
    },

    footerArea: {
        width: "100%",
        alignItems: "center",
        paddingTop: verticalScale(30),
        paddingBottom: verticalScale(45),
        gap: spacingY._20,
        shadowColor: "#aaa",
        shadowOffset: { width: 0, height: -10 },
        elevation: 10,
        shadowRadius: 25,
        shadowOpacity: 0.15
    },
    ctaButtonConatiner: {
        width: "100%",
        paddingHorizontal: spacingX._25
    },
})