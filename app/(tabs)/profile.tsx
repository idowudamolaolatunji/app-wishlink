import ScreenHeader from "@/components/ScreenHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typography from "@/components/Typography";
import { auth } from "@/config/firebase";
import { BaseColors, radius, spacingX } from '@/constants/theme';
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { getProfileImage } from "@/services/imageService";
import { verticalScale } from "@/utils/styling";
import { AccountOptionType } from "@/utils/types";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import * as Icons from "phosphor-react-native";
import React from "react";
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { spacingY } from '../../constants/theme';


export default function ProfileScreen() {
    const { user } = useAuth();
    const { Colors } = useTheme();
    const router = useRouter();

    const accountOptions: AccountOptionType[] = [
        {
            title: "Edit Profile",
            icon: (
                <Icons.UserIcon
                    size={26}
                    color={Colors.text}
                    weight="fill"
                />
            ),
            routeName: "/(modals)/profileEditModal",
            text: "Update your profile information",
            bgColor: "#6366f1",
        },
        {
            title: "Apperance & Security",
            icon: (
                <Icons.GearSixIcon
                    size={26}
                    color={Colors.text}
                    weight="fill"
                />
            ),
            routeName: "/(modals)/settingsModal",
            text: "Manage your account security & appreance",
            bgColor: "#059669",
        },
        {
            title: "Legals & Policies",
            icon: (
                <Icons.GavelIcon
                    size={26}
                    color={Colors.text}
                    weight="fill"
                />
            ),
            routeName: "/(modals)/legalPoliciesModal",
            text: "See our policies and terms or use",
            bgColor: BaseColors.neutral500,
        },
        // {
        //     title: "Payment Bank",
        //     icon: (
        //         <Icons.BankIcon
        //             size={26}
        //             color={Colors.text}
        //             weight="fill"
        //         />
        //     ),
        //     routeName: "/(modals)/bankSetupModal",
        //     text: "Add your bank details to recieve payments",
        //     bgColor: "#D97D55",
        // },
        // {
        //     title: "Frequently Asked",
        //     icon: (
        //         <Icons.SealQuestionIcon
        //             size={26}
        //             color={Colors.text}
        //             weight="fill"
        //         />
        //     ),
        //     routeName: "/(modals)/faqModal",
        //     text: "Add your bank details to recieve payments",
        //     bgColor: "#FEB21A",
        // },
        {
            title: "Help Center",
            icon: (
                <Icons.SealQuestionIcon
                    size={26}
                    color={Colors.text}
                    weight="fill"
                />
            ),
            routeName: "/(modals)/helpModal",
            text: "Get all the help and support you need",
            bgColor: "#FEB21A",
        },
        // {
        //     title: "Delete Account",
        //     icon: (
        //         <Icons.TrashIcon
        //             size={26}
        //             color={Colors.text}
        //             weight="fill"
        //         />
        //     ),
        //     routeName: "/(modals)/deleteAccountModal",
        //     bgColor: BaseColors.red,
        //     text: "Delete account including account data"
        // },
        {
            title: "Logout",
            icon: (
                <Icons.SignOutIcon
                    size={26}
                    color={Colors.text}
                    weight="fill"
                />
            ),
            bgColor: BaseColors.red,
            text: "Logout of your account"
        },
    ];

    const handleLogout = async function() {
		await signOut(auth);
	}

    const showLogoutAlert = function() {
        Alert.alert("Confirm", "Are you sure you want to logout?", [
            {
                text: "Cancel",
                style: "cancel",
            },
            {
                text: "Yes, Logout",
                onPress: () => handleLogout(),
                style: "destructive"
            }
        ])
    }

    const handlePress = async function(item: AccountOptionType) {
        if(item.title == "Logout") showLogoutAlert();

        if(item.routeName) {
            router.push(item?.routeName);
        }
    }

	return (
		<ScreenWrapper>
            <View style={styles.container}>
                <ScreenHeader title="Profile" style={{ marginVertical: spacingY._10 }} />
                
                <ScrollView
                    bounces={false}
                    overScrollMode="never" // default, always, never
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: spacingX._20 }}
                >
                    <View style={styles.userInfo}>
                        <View style={styles.avatarContainer}>
                            <Image
                                source={getProfileImage(user?.image)}
                                style={[styles.avatar, { backgroundColor: Colors.background300 }]}
                                contentFit="cover"
                                transition={100}
                            />
                        </View>

                        {/* name & email */}
                        <View style={styles.nameContainer}>
                            <Typography size={24.5} fontFamily="urbanist-semibold" color={Colors.text}>
                                {user?.name || "---"}
                            </Typography>
                            <Typography size={16} color={Colors.textLighter}>
                                {user?.email}
                            </Typography>
                        </View>
                    </View>

                    {/* account options */}
                    <View style={styles.accountOptions}>
                        {accountOptions?.map((item, index) => (
                            <Animated.View key={index} style={styles.listItem}
                                entering={FadeInDown.delay(index * 50)}>
                                <TouchableOpacity style={styles.flexRow} activeOpacity={0.8} onPress={() => handlePress(item)}>
                                    <View style={[styles.listIcon, { backgroundColor: item.bgColor }]}>
                                        {item.icon && item.icon}
                                    </View>
                                    <View style={styles.flexCol}>
                                        <Typography
                                            fontFamily="urbanist-semibold"
                                            size={Platform.OS === "ios" ? 18 : 20}
                                            style={{ letterSpacing: 0.15 }}
                                        >
                                            {item.title}
                                        </Typography>
                                        <Typography
                                            fontFamily="urbanist-medium"
                                            size={15}
                                            style={{ color: Colors.textLighter }}
                                        >
                                            {item?.text}
                                        </Typography>
                                    </View>
                                    <Icons.CaretRightIcon
                                        size={verticalScale(20)}
                                        weight="bold" color={Colors.text}
                                    />
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>

                    <View style={styles.footerArea}>
                        {/* <Pressable onPress={() => showLogoutAlert()} style={[styles.flexRow, { gap: spacingX._7 }]}>
                            <Icons.SignOutIcon
                                size={24}
                                color={BaseColors.red}
                                weight="regular"
                            />
                            <Typography size={20.5} color={BaseColors.red} fontFamily="urbanist-medium">Logout</Typography>
                        </Pressable>
                        <Typography size={18} color={Colors.textLighter} fontFamily="urbanist-medium">Version 1.0.0</Typography> */}

                        <Typography size={16} color={BaseColors.neutral400} fontFamily="urbanist-medium">Copyright &copy; Wishers</Typography>
                        <Typography size={16} color={BaseColors.neutral400} fontFamily="urbanist-medium">Version 1.0.0</Typography>
                    </View>
                </ScrollView>
            </View>
		</ScreenWrapper>
	);
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingHorizontal: spacingX._20,
    },
    userInfo: {
        marginTop: verticalScale(30),
        alignItems: "center",
        gap: spacingY._12,
    },
    avatarContainer: {
        position: "relative",
        alignSelf: "center",
    },
    avatar: {
        alignSelf: "center",
        height: verticalScale(135),
        width: verticalScale(135),
        borderRadius: 200,
        // overflow: "hidden",
        // position: "relative"
    },
    editIcon: {
        position: "absolute",
        bottom: 5,
        right: 8,
        borderRadius: 50,
        // shadowColor
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        padding: 5
    },
    nameContainer: {
        gap: verticalScale(2),
        alignItems: "center"
    },
    listIcon: {
        height: verticalScale(44),
        width: verticalScale(44),
        backgroundColor: BaseColors.neutral600,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius._15,
        borderCurve: "continuous",
    },
    listItem: {
        // marginBottom: verticalScale(17),
        marginBottom: verticalScale(22),
    },
    accountOptions: {
        marginTop: spacingY._60,
    },
    flexRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._12
    },
    flexCol: {
        flex: 1,
        justifyContent: "center",
        gap: spacingX._5
    },

    footerArea: {
        flexDirection: "row",
        marginTop: spacingY._40,
        marginBottom: spacingY._30,
        alignItems: "center",
        justifyContent: "space-between"
    }
});
