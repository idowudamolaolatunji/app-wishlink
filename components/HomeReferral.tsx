import { BaseColors, radius, spacingX, spacingY } from "@/constants/theme";
import { scale, verticalScale } from "@/utils/styling";
import { useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React from "react";
import { Image, ImageBackground, Pressable, StyleSheet, View } from 'react-native';
import Typography from "./Typography";


export default function HomeReferral({ handleClose, referralEarnings }: { handleClose: () => void, referralEarnings?: number }) {
    const router = useRouter();

	return (
		// <View style={styles.container}
		<ImageBackground style={styles.container}
            // entering={FadeInRight.duration(1000)}
            source={require("@/assets/images/circle-treatment-half.png")}
            resizeMode="cover"
            imageStyle={{
                width: '45%',
            }}
        >
            <View style={styles.referralFlex}>
                <Pressable style={styles.closeIcon} onPress={handleClose}>
                    <Icons.XCircleIcon
                        size={24}
                        color={BaseColors.neutral600}
                        weight="fill"
                    />
                </Pressable>

                <View>
                    <Typography
                        // color={BaseColors.neutral600}
                        color={BaseColors.purple}
                        fontFamily="urbanist-semibold"
                        size={verticalScale(19)}
                    >
                        Get 1% of your friend's earnings
                    </Typography>
                    <Typography
                        // color={BaseColors.neutral600}
                        color={BaseColors.purple}
                        fontFamily="urbanist-semibold"
                        size={verticalScale(19)}
                    >
                        when they use your referral code
                    </Typography>
                    
                    <Pressable style={styles.referralBtn} onPress={() => router.push({ pathname: "/(modals)/referralsModal", params: { referralEarnings: referralEarnings } })}>
                        <Typography fontFamily="urbanist-bold" size={verticalScale(19)} color={BaseColors.white}>See Details</Typography>
                        <Icons.ArrowRightIcon
                            size={19}
                            color={BaseColors.white}
                            weight="bold"
                        />
                    </Pressable>
                </View>

                <Image
                    // source={require("@/assets/images/icon-confetti.png")}
                    // style={{ height: 85 }}
                    source={require("@/assets/images/icon-gift.png")}
                    style={{ height: 80 }}
                    resizeMode="contain"
                />
            </View>
        </ImageBackground>
	);
}

const styles = StyleSheet.create({
	container: {
		height: scale(100),
		width: "100%",
        // backgroundColor: "#fff5faff",
        backgroundColor: BaseColors.purpleAccent,
        borderRadius: radius._10,
        borderWidth: 1,
        borderColor: BaseColors.neutral200,
        position: "relative",        
	},
    closeIcon: {
        position: "absolute",
        top: verticalScale(4),
        right: verticalScale(4),
        borderRadius: 50,
        zIndex: 1
    },
    referralFlex: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: spacingY._10
    },
    referralBtn: {
        marginTop: spacingY._10,
        alignSelf: "flex-start",
        padding: spacingY._5,
        paddingHorizontal: spacingX._10,
        borderRadius: radius._6,
        borderCurve: "continuous",
        flexDirection: "row",
        gap: 4,
        // width: verticalScale(100),
        justifyContent: "center",
        alignItems: "flex-start",
        // backgroundColor: BaseColors.primaryLight
        backgroundColor: BaseColors.purple,
    }
});

// <LinearGradient
//     style={styles.bgImage}
//     colors={[BaseColors.accent, ""]}
//     start={{ x: 0.1, y: 0.2 }}
//     end={{ x: 1, y: 1 }}
// >
// 	<Typography>Referral</Typography>
// </LinearGradient>