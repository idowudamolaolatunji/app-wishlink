import BackButton from '@/components/BackButton'
import ModalWrapper from '@/components/ModalWrapper'
import ScreenHeader from '@/components/ScreenHeader'
import ThemeButton from '@/components/ThemeButton'
import Typography from '@/components/Typography'
import { BaseColors, radius, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/AuthContext'
import { useThemeContext } from '@/contexts/ThemeContext'
import { useBiometricAuth } from '@/hooks/useBiometricsAuth'
import { useTheme } from '@/hooks/useTheme'
import { verticalScale } from '@/utils/styling'
import * as Burnt from "burnt"
import { useRouter } from 'expo-router'
import * as Icons from "phosphor-react-native"
import React, { useState } from 'react'
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import ToggleSwitch from 'toggle-switch-react-native'

const isIOS = Platform.OS === "ios";

export default function SettingsModal() {
    const router = useRouter();
    const { Colors } = useTheme();
    const { currentTheme, toggleTheme, useSystemTheme, isSystemTheme } = useThemeContext();
    const { enableBiometric, disableBiometric, biometricEnabled } = useAuth();
    const { isBiometricSupported, isEnrolled } = useBiometricAuth();
    const [loading, setLoading] = useState({ main: false, biometric: false });
    const [bioEnabled, setBioEnabled] = useState(false);

    const toggleBiometric = async (value: boolean) => {
        setLoading({ ...loading, biometric: true });
        
        try {
            if (value) {
                const success = await enableBiometric();
                if (!success) {
                    throw new Error("Could not enable biometric authentication");
                }

                setBioEnabled(true);
                Burnt.toast({ title: 'Biometric authentication enabled!', haptic: "success" });
            } else {
                await disableBiometric();
                setBioEnabled(false);
                Burnt.toast({ title: 'Biometric authentication disabled', haptic: "success" });
            }
        } catch(err: any) {
            Burnt.toast({ title: err?.message, haptic: "error" });
        } finally {
            setLoading({ ...loading, biometric: false });
        }
    };

    return (
        <ModalWrapper>
            <View style={styles.container}>
                <ScreenHeader title='Settings & Account' leftElement={<BackButton />} style={{ marginBottom: spacingY._30 }} />

                <ScrollView contentContainerStyle={styles.contentView}>
                    <View style={{ borderRadius: radius._6 }}>
                        <Typography fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 16.5 : 20)} style={{ marginBottom: spacingY._15 }}>Security & Biometrics</Typography>

                        <TouchableOpacity activeOpacity={0.95} style={[styles.cardItem, { backgroundColor: Colors.cardBackground }]} onPress={() => router.push("/(modals)/passwordChangeModal")}>
                            <Typography size={isIOS ? 16 : 18} fontFamily="urbanist-medium">Change Password</Typography>

                            <Icons.CaretRightIcon
                                size={verticalScale(20)}
                                weight="bold" color={Colors.text}
                            />
                        </TouchableOpacity>
                                
                        {(isBiometricSupported && isEnrolled) && (
                            <View style={[styles.cardItem, { backgroundColor: Colors.cardBackground }]}>
                                <Typography size={isIOS ? 16 : 18} fontFamily="urbanist-medium">Login with {isIOS ? "Face ID or Pin" : "Fingerprint"}</Typography>
                                
                                {!loading.biometric && (
                                    <ToggleSwitch
                                        isOn={biometricEnabled || bioEnabled}
                                        onColor={BaseColors.primary}
                                        offColor={BaseColors.accentDarker}
                                        size="small"
                                        onToggle={isOn => toggleBiometric(isOn)}
                                    />
                                )}
                            </View>
                        )}
                    </View>

                    <View style={{ borderRadius: radius._6 }}>
                        <Typography fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 16.5 : 20)} style={{ marginBottom: spacingY._15 }}>Theme Setting</Typography>

                        <ThemeButton
                            title='Light'
                            icon={<Icons.SunIcon size={verticalScale(18)} color={Colors.text} />}
                            onPress={() => toggleTheme("light")}
                            isActive={!isSystemTheme && currentTheme === "light"}
                        />
                        <ThemeButton
                            title='Dark'
                            icon={<Icons.MoonIcon size={verticalScale(18)} color={Colors.text} />}
                            onPress={() => toggleTheme("dark")}
                            isActive={!isSystemTheme && currentTheme === "dark"}
                        />
                        <ThemeButton
                            title='System'
                            icon={<Icons.LightningAIcon size={verticalScale(18)} color={Colors.text} />}
                            onPress={() => useSystemTheme()}
                            isActive={isSystemTheme}
                        />
                    </View>

                    {/* the rest of it */}
                </ScrollView>
            </View>
        </ModalWrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: spacingY._20,
        // paddingVertical: spacingY._20,
    },
    contentView: {
        gap: spacingY._30,
        marginTop: spacingY._15
    },
    cardItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderRadius: radius._10,
        marginBottom: spacingY._10
    }
})