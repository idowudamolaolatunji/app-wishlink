import BackButton from '@/components/BackButton'
import ModalWrapper from '@/components/ModalWrapper'
import ScreenHeader from '@/components/ScreenHeader'
import Typography from '@/components/Typography'
import WishInsight from '@/components/WishInsight'
import { BaseColors, radius, spacingX, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/hooks/useTheme'
import { formatCurrency } from '@/utils/helpers'
import { verticalScale } from '@/utils/styling'
import { FontAwesome } from '@expo/vector-icons'
import * as Burnt from "burnt"
import * as Clipboard from "expo-clipboard"
import { Image } from 'expo-image'
import * as Icons from "phosphor-react-native"
import React, { useState } from 'react'
import { Dimensions, Linking, Platform, Pressable, ScrollView, Share, StatusBar, StyleSheet, View } from 'react-native'

const isIOS = Platform.OS === "ios";
const { height } = Dimensions.get("window");

export default function ReferralsModal() {
    const { user } = useAuth();
    const { Colors } = useTheme();
    const [copied, setCopied] = useState(false);

    const openFacebook = async function() {
        const url = `fb://share?text=Join%20Wishers%20App,%20using%20my%20referral%20code`;
        Linking.openURL(url).catch(function() {
            Linking.openURL('https://www.facebook.com/');
        });
    };

    const openWhatsAppChat = async function() {
        const url = `whatsapp://send?text=Join Wishers App, using my referral code "${user?.inviteCode}"\n \nDownload the Wishers app and use my code`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Burnt.toast({ haptic: "error", title: "WhatsApp is not installed" });
        }
    };

    const handleShareCode = async () => {
        try {
            await Share.share({
                message: `Join Wishers App, using my referral code "${user?.inviteCode}"\n \nDownload the Wishers app and use my code`,
            });
        } catch (error) {
            return error;
        }
    };

    const copyToClipboard = async function() {
        Clipboard.setStringAsync(user?.inviteCode!);
        Burnt.toast({ haptic: "success", title: "Copied Invite Code" });
    };

    return (
        <ModalWrapper style={{ paddingTop: 0 }}>
            <StatusBar barStyle="dark-content" backgroundColor={BaseColors.purpleAccent} />

            <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
                <View style={[styles.topInfoView]}>
                    <ScreenHeader rightElement={<BackButton iconType='drop' />} />
                    {/* <View style={styles.topHandle} /> */}

                    <View style={{ width: "100%", flexDirection: "row", alignItems: "center", gap: spacingX._10, justifyContent: "space-evenly" }}>
                        <Image
                            source={require("@/assets/images/chest.png")}
                            style={{ width: verticalScale(90), height: verticalScale(90) }}
                        />
                        <View style={{ alignItems: "flex-start" }}>
                            <Typography size={40} color={BaseColors.purple} fontFamily="urbanist-semibold">
                                Refer a Friend 
                            </Typography>
                            <Typography size={17} color={BaseColors.purple} fontFamily="urbanist-medium">
                                Earn 1% from of "Each" friend earnings
                            </Typography>
                        </View>
                    </View>

                    <View style={styles.insights}>
                        <WishInsight
                            title="Total Referals"
                            value="0"
                            icon={<Icons.UsersThreeIcon size={24}  weight="bold" color="#1e40af" />}
                            iconbgColor="#dbeafe"
                            useDefaultTheme={false}
                        />
                        <WishInsight
                            title="Total Earned"
                            value={formatCurrency(0)}
                            icon={<Icons.MoneyIcon size={24} weight="bold" color="#9f1239" />}
                            iconbgColor="#fce7f3"
                            useDefaultTheme={false}
                        />
                    </View>

                    <View style={{ marginVertical: spacingY._15 }}>
                        <Typography fontFamily='urbanist-semibold' size={18} color={BaseColors.black}>Share your code</Typography>

                        <View style={styles.actionsContainer}>
                            <Pressable style={styles.copyContainer} onPress={copyToClipboard}>
                                <View style={{ paddingVertical: spacingY._8_5, paddingHorizontal: spacingX._20, backgroundColor: BaseColors.white, justifyContent: "center" }}>
                                    <Typography color={BaseColors.black} fontFamily='urbanist-semibold' size={verticalScale(21)}>{user?.inviteCode}</Typography>
                                </View>
                                <View style={{ padding: spacingY._8_5, backgroundColor: BaseColors.accent }}>
                                    <Icons.CopyIcon size={verticalScale(26)} weight="regular" color={BaseColors.primaryLight} />
                                </View>
                            </Pressable>

                            <Pressable onPress={openFacebook} style={[styles.actionBtn, { backgroundColor: "#1877F2" }]}>
                                <FontAwesome name="facebook-f" size={verticalScale(30)} color={BaseColors.white} />
                            </Pressable>

                            <Pressable onPress={openWhatsAppChat} style={[styles.actionBtn, { backgroundColor: "#25D366" }]}>
                                <FontAwesome name="whatsapp" size={verticalScale(34)} color={BaseColors.white} />
                            </Pressable>
                            
                            <Pressable onPress={handleShareCode} style={[styles.actionBtn, { backgroundColor: BaseColors.accent }]}>
                                <Icons.ShareNetworkIcon size={verticalScale(30)} weight="regular" color={BaseColors.primaryLight} />
                            </Pressable>
                        </View>
                    </View>
                </View>

                <View style={{ marginTop: spacingY._30, paddingHorizontal: spacingY._20, gap: spacingY._15, }}>
                    <Typography size={24} fontFamily="urbanist-semibold">
                        How it works
                    </Typography>

                    <View style={styles.howLists}>
                        <View style={styles.howItem}>
                            <View style={{ position: "relative" }}>
                                <Icons.ShareNetworkIcon size={verticalScale(28)} weight="regular" color={BaseColors.primaryLight} />
                                <View style={styles.howIconLine} />                           
                            </View>
                            
                            <Typography size={verticalScale(17)} fontFamily='urbanist-medium' color={Colors.textLighter} style={{ lineHeight: 24, wordWrap: "wrap", width: "92%" }}>Share your referral link with your friends</Typography>
                        </View>
                        <View style={styles.howItem}>
                            <View style={{ position: "relative" }}>
                                <Icons.UserPlusIcon size={verticalScale(28)} weight="regular" color={BaseColors.primaryLight} />
                                <View style={styles.howIconLine} />                           
                            </View>
                            
                            <Typography size={verticalScale(17)} fontFamily='urbanist-medium' color={Colors.textLighter} style={{ lineHeight: 24, wordWrap: "wrap", width: "92%" }}>Your friend downloads the app and signs up with your code</Typography>
                        </View>
                        <View style={styles.howItem}>
                            <Icons.MoneyIcon size={verticalScale(28)} weight="regular" color={BaseColors.primaryLight} />
                            <Typography size={verticalScale(17)} fontFamily='urbanist-medium' color={Colors.textLighter} style={{ lineHeight: 24, wordWrap: "wrap", width: "92%" }}>Rewards will be acredited when the get paid</Typography>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </ModalWrapper>
    )
}

const styles = StyleSheet.create({
      topHandle: {
        width: 100,
        height: 6,
        borderRadius: 10,
        backgroundColor: BaseColors.neutral600,
        marginBottom: spacingY._20,
        marginTop: -10,
    },
    topInfoView: {
        paddingTop: isIOS ? spacingY._15 : 34,
        minHeight: verticalScale(height * 0.45),
        paddingHorizontal: spacingY._20,
        backgroundColor: BaseColors.purpleAccent,
        alignItems: "center",
        borderBottomLeftRadius: radius._30,
        borderBottomRightRadius: radius._30,
    },
    insights: {
        flexDirection: "row",
        justifyContent: "space-between",
        gap: spacingY._10,
        marginTop: spacingY._20,
    },
    copyContainer: {
        flexDirection: "row",
        borderRadius: radius._6,
        overflow: "hidden",
    },
    actionsContainer: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    actionBtn: {
        width: verticalScale(55),
        height: verticalScale(55),
        borderRadius: 100,
        alignItems: "center",
        justifyContent: "center"
    },
    // how to process
    howLists: {
        gap: spacingY._20,
    },
    howItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._15,
        marginTop: 5,
    },
    howIconLine: {
        width: 0.75,
        height: 22,
        backgroundColor: BaseColors.primaryLight,
        position: "absolute",
        bottom: -22,
        right: "50%",
    },
})