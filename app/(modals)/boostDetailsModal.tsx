import BackButton from '@/components/BackButton'
import ModalWrapper from '@/components/ModalWrapper'
import Rangebar from '@/components/Rangebar'
import ScreenHeader from '@/components/ScreenHeader'
import Typography from '@/components/Typography'
import { BaseColors, radius, spacingX, spacingY } from '@/constants/theme'
import { useCountdown } from '@/hooks/useCountdown'
import { useTheme } from '@/hooks/useTheme'
import { calculatePercentage, formatCurrency, formatDateFull } from '@/utils/helpers'
import { verticalScale } from '@/utils/styling'
import { Image } from 'expo-image'
import { useLocalSearchParams } from 'expo-router'
import * as Icons from "phosphor-react-native"
import React from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

export default function BoostDetailsModal() {
    const { currentTheme, Colors } = useTheme();
    const params: {
        id: string,
        slug: string,
        title: string,
        image: string,
        totalAmountReceived: string,
        totalGoalAmount: string,
        totalContributors: string,
        currentboostExpiresAt: string,
        lastBoostedAt: string,
        lastBoostingPlanName?: string,
        previousBoostingCount: string,
    } = useLocalSearchParams();

    const percentage = calculatePercentage(Number(params?.totalAmountReceived ?? 0), Number(params?.totalGoalAmount ?? 0));
    const timeLeft = useCountdown(params?.currentboostExpiresAt);

    return (
        <ModalWrapper>
            <View style={styles.container}>
                <ScreenHeader title="Boosting Overview" leftElement={<BackButton iconType="drop" />} style={{ marginBottom: spacingY._10 }} />

                <ScrollView showsVerticalScrollIndicator={false}>


                    <View style={{ marginTop: spacingY._17, gap: spacingY._30 }}>
                        <View style={{ gap: spacingY._10 }}>
                            <Typography size={verticalScale(20)} fontFamily="urbanist-semibold" color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Boosted Wishlist</Typography>
                            <View style={[styles.itemCard, { backgroundColor: Colors.cardBackground }]}>
                                <View style={styles.itemImageContainer}>
                                    <Image
                                        contentFit="cover"
                                        source={params?.image}
                                        style={{
                                            height: verticalScale(90),
                                            width: verticalScale(80),
                                            borderRadius: radius._6,
                                            backgroundColor: Colors.background300,
                                        }}
                                    />
                                </View>
                
                                <View style={styles.itemDetails}>
                                    <Typography size={21} fontFamily="urbanist-bold">
                                        {params?.title}
                                    </Typography>
                
                                    <Typography fontFamily="urbanist-bold" size={verticalScale(19)} color={BaseColors.primaryLight}>
                                        {formatCurrency(Number(params?.totalGoalAmount ?? 0))}
                                    </Typography>
                                    <Rangebar value={percentage} height={5} />
                
                                    <View style={styles.flexRow}>
                                        <Typography fontFamily="urbanist-semibold" size={verticalScale(17.5)} color={Colors.textLighter}>
                                            {percentage ?? 0}% Funded
                                        </Typography>
                
                                        <View style={{ flexDirection: "row", gap: 3 }}>
                                            <Icons.UsersThreeIcon size={verticalScale(20)} color={Colors.textLighter} />
                                            <Typography fontFamily="urbanist-semibold" size={verticalScale(17.5)} color={Colors.textLighter}>
                                                {params?.totalContributors} Contributor{+params?.totalContributors === 1 ? "" : "s"}
                                            </Typography>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>

                        <View style={styles.boostingInfoBody}>
                            <View style={styles.bodyDetail}>
                                <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Boosting Plan</Typography>
                                <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors.primaryLight}>{params?.lastBoostingPlanName || "24 hours"} plan</Typography>
                            </View>
                            <View style={styles.bodyDetail}>
                                <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Boosting Start</Typography>
                                <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text}>{formatDateFull(params?.lastBoostedAt)}</Typography>
                            </View>
                            <View style={styles.bodyDetail}>
                                <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Boosting Ends At</Typography>
                                <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text}>{formatDateFull(params?.currentboostExpiresAt)}</Typography>
                            </View>
                            <View style={styles.bodyDetail}>
                                <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Remaining Time</Typography>
                                <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors.primaryLight}>{timeLeft?.days ? timeLeft?.days + " days," : ""} {`${timeLeft?.hours} hrs, ${timeLeft?.minutes} mins, ${timeLeft?.seconds} secs`}</Typography>
                            </View>
                            <View style={styles.bodyDetail}>
                                <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Boosting History</Typography>
                                <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text}>{params?.previousBoostingCount} Previous boosts</Typography>
                            </View>
                        </View>                
                    </View>
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
    },

    flexRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemCard: {
        padding: spacingY._7,
        borderRadius: radius._10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: spacingX._12,
    },
    itemImageContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    itemDetails: {
        flex: 1,
        gap: spacingY._7,
    },
//////////////////////////////////
    boostingInfoBody: {
        alignSelf: "stretch",
        gap: spacingY._15,
    },
    bodyDetail: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
		flexWrap: "wrap",
    },
})