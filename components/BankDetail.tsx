import Typography from "@/components/Typography";
import { BaseColors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from "@/contexts/AuthContext";
import { useBiometricAuth } from "@/hooks/useBiometricsAuth";
import { useTheme } from '@/hooks/useTheme';
import { truncateString } from "@/utils/helpers";
import { scale, verticalScale } from '@/utils/styling';
import * as Icons from "phosphor-react-native";
import React, { useState } from 'react';
import { Platform, Pressable, StyleSheet, TouchableOpacity, View } from 'react-native';
import ModalView from "react-native-modal";
import BackButton from "./BackButton";
import FormInput from "./FormInput";
import Loading from "./Loading";
import ScreenHeader from "./ScreenHeader";


interface Props {
    bankName: string;
    accountName: string;
    accountNumber: string;
    loading?: boolean;
    handleDeleteBankWithPassword: (p: string) => void;
    handleDeleteBankWithBiometrics: () => void;
}

export default function BankDetail({
    bankName, loading,
    accountName,
    accountNumber,
    handleDeleteBankWithPassword,
    handleDeleteBankWithBiometrics,
}: Props) {
    const { biometricEnabled } = useAuth();
    const { Colors, currentTheme } = useTheme();
    const { isBiometricSupported, isEnrolled } = useBiometricAuth();

    const [showModal, setShowModal] = useState({ delete: false, password_confirm: false })
    const [password, setPassword] = useState("");

    const biometricsIsEnabled = isBiometricSupported && isEnrolled && biometricEnabled;

    return (
        <React.Fragment>
            <View style={[styles.itemRow, { backgroundColor: Colors[currentTheme == "dark" ? "cardBackground" : "neutral200"] }]}>
                <View style={[styles.iconContainer, { backgroundColor: BaseColors[currentTheme == "dark" ? "accentLight" : "accent"] }]}>
                    <Icons.BankIcon color={BaseColors.primaryLight} weight="regular" size={verticalScale(25)} />
                </View>

                <View style={styles.details}>
                    <Typography size={20} fontFamily="urbanist-semibold">{bankName}</Typography>

                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Typography size={14} color={Colors.textLighter}>{accountNumber}</Typography>
                        <Icons.DotIcon color={BaseColors.neutral400} weight="bold" size={20} />
                        <Typography size={14} color={Colors.textLighter}>{truncateString(accountName, 23)}</Typography>
                    </View>
                </View>

                <Pressable style={{ marginLeft: "auto" }} onPress={() => setShowModal({ ...showModal, delete: true })}>
                    <Icons.TrashIcon color={BaseColors.red} weight="bold" size={22} />
                </Pressable>
            </View>

            {/* DELETE BANK MODAL */}
            <ModalView
                isVisible={showModal.delete}
                backdropOpacity={0.7}
                backdropTransitionInTiming={800}
                backdropTransitionOutTiming={500}
                onBackdropPress={() => setShowModal({ ...showModal, delete: false })}
            >
                <View style={[styles.modalCard, { backgroundColor: Colors.cardBackground }]}>
                    <ScreenHeader
                        title="Delete bank detail"
                        leftElement={
                            <BackButton
                                iconType="cancel"
                                customAction={() => setShowModal({ ...showModal, delete: false })}
                            />
                        } 
                        style={{ marginBottom: spacingY._10 }}
                    />

                    <View style={{ marginVertical: spacingY._10 }}>
                        <Typography size={verticalScale(20)} fontFamily="urbanist-medium" color={Colors.text} style={{ lineHeight: 25 }}>
                            Are you sure that you want to delete your "{bankName}" details from this account
                        </Typography>
                    </View>

                    <View style={[styles.flexRow, styles.footerArea, { borderTopColor: BaseColors[currentTheme == "dark" ? "neutral700" : "neutral400"] } ]}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: Colors.neutral300 }]} onPress={() => setShowModal({ ...showModal, delete: false })}>
                            <Typography size={20} fontFamily="urbanist-bold" color={Colors.black}>Cancel</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, { backgroundColor: Colors.rose }]} onPress={() => setShowModal({ ...showModal, delete: false, password_confirm: true })}>
                            <Typography size={20} fontFamily="urbanist-bold" color={BaseColors.white}>Yes, Proceed</Typography>
                        </TouchableOpacity>
                    </View>
                </View>
            </ModalView>

            {/* CONFIRM PASSWORD FOR DELETION */}
            <ModalView
                isVisible={showModal.password_confirm}
                backdropOpacity={0.7}
                backdropTransitionInTiming={800}
                backdropTransitionOutTiming={500}
                onBackdropPress={() => setShowModal({ ...showModal, password_confirm: false })}
            >
                <View style={[styles.modalCard, { backgroundColor: Colors.cardBackground }]}>
                    <ScreenHeader
                        title="Authorize this action"
                        leftElement={
                            <BackButton
                                iconType="cancel"
                                customAction={() => setShowModal({ ...showModal, password_confirm: false })}
                            />
                        } 
                        style={{ marginBottom: spacingY._7 }}
                    />

                    <View style={{ width: "100%", gap: spacingY._15, }}>
                        <Typography size={verticalScale(20)} fontFamily="urbanist-medium" color={Colors.textLighter} style={{ lineHeight: 25, marginBottom: spacingY._5 }}>
                            We would need yout to confirm with password {biometricsIsEnabled && (Platform.OS == "ios" ? "or Face Id /Fingerprint" : "or Biometrics")}
                        </Typography>

                        <View style={{ gap: spacingY._7 }}>
                            <Typography fontFamily="urbanist-bold" color={Colors.textLighter} style={{ marginLeft: 5 }}>Enter Password</Typography>
                            <FormInput
                                placeholder="Enter your password"
                                isPassword={true}
                                autoCapitalize="none"
                                autoCorrect={false}
                                value={password}
                                onChangeText={(value) => setPassword(value)}
                                icon={<Icons.PasswordIcon size={verticalScale(26)} color={BaseColors.neutral400} />}
                            />
                        </View>

                        {biometricsIsEnabled ? (
                            <Typography style={{ textAlign: "center" }}>or</Typography>
                        ) : null}

                        {(biometricsIsEnabled) && (
                            <TouchableOpacity
                                onPress={() => {
                                    handleDeleteBankWithBiometrics();
                                    // setShowModal({ ...showModal, password_confirm: false });
                                }}
                                activeOpacity={0.7}
                                style={{
                                    marginTop: "auto",
                                    alignItems: 'center',
                                    justifyContent: "center",
                                    gap: 6,
                                    paddingVertical: spacingY._15,
                                }}
                            >
                                {Platform.OS === "ios" ? (
                                    <Icons.UserFocusIcon
                                        color={Colors.textLighter}
                                        weight="regular"
                                        size={verticalScale(40)}
                                    />
                                ) : (
                                    <Icons.FingerprintIcon
                                        color={Colors.textLighter}
                                        weight="regular"
                                        size={verticalScale(40)}
                                    />
                                )}
                                <Typography color={Colors.textLighter} fontFamily="urbanist-semibold" size={verticalScale(20)}>
                                    Continue with {biometricsIsEnabled && (Platform.OS == "ios" ? "Face Id / Fingerprint" : "Biometrics")}
                                </Typography>
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={[styles.flexRow, styles.footerArea, { borderTopColor: BaseColors[currentTheme == "dark" ? "neutral700" : "neutral400"] } ]}>
                        <TouchableOpacity style={[styles.button, { backgroundColor: Colors.neutral300 }]} onPress={() => setShowModal({ ...showModal, password_confirm: false })}>
                            <Typography size={20} fontFamily="urbanist-bold" color={Colors.black}>Cancel</Typography>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, { backgroundColor: Colors.rose }]} onPress={() => {
                            handleDeleteBankWithPassword(password);
                            // setShowModal({ ...showModal, password_confirm: false });
                        }}>
                            {loading ? <Loading /> : (
                                <Typography size={20} fontFamily="urbanist-bold" color={BaseColors.white}>Yes, Delete</Typography>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </ModalView>
            
        </React.Fragment>
    )
}

const styles = StyleSheet.create({
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._12,
        marginBottom: spacingY._7,
        padding: spacingY._10,
        paddingHorizontal: spacingY._10,
        borderRadius: radius._12,
    },
	iconContainer: {
		justifyContent: "center",
        alignItems: "center",
        width: verticalScale(45),
        height: verticalScale(45),
        borderRadius: radius._10,
	},
	details: {
        flex: 1,
        gap: spacingY._5,
    },

    modalCard: {
        minHeight: verticalScale(100),
        borderRadius: radius._10,
        padding: spacingY._15,
        paddingVertical: spacingY._20,

        alignItems: "center",
        gap: spacingY._25,
        textAlign: "center",
    },
    flexRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._12
    },
    footerArea: {
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "center",
        gap: scale(12),
        paddingTop: spacingY._15,
        borderTopWidth: 1,
    },
    button: {
        minWidth: "47%",
        padding: spacingY._10,
        borderRadius: radius._12,
        borderCurve: "continuous",
        height: verticalScale(52),
        justifyContent: "center",
        alignItems: "center",
    },
})