import { BaseColors, radius, spacingX, spacingY } from '@/constants/theme'
import { useTheme } from '@/hooks/useTheme'
import { getFilePath, getProfileImage } from '@/services/imageService'
import { calculatePercentage, formatCurrency, formatShortCurrency } from '@/utils/helpers'
import { verticalScale } from '@/utils/styling'
import { FeaturedWishlistProps, WishlistType } from '@/utils/types'
import { Image, ImageBackground } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { useRouter } from 'expo-router'
import * as Icons from "phosphor-react-native"
import React from 'react'
import { Dimensions, FlatList, Pressable, StyleSheet, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'
import Loading from './Loading'
import Rangebar from './Rangebar'
import Typography from './Typography'
import WishlistCreator from './WishlistCreator'


const { width } = Dimensions.get("window");

export default function FeaturedWishlists({ data, loading }: FeaturedWishlistProps) {
    const router = useRouter();
    const { Colors, currentTheme } = useTheme();

    const getPercentage = function(recieved=0, goal=0) {
        return calculatePercentage(recieved ?? 0, goal ?? 0)
    }

    return (
        <View style={styles.container}>
            <View style={styles.row}>
                <Typography size={21} fontFamily="urbanist-semibold" color={Colors.text}>
                    Featured Wishlists
                </Typography>

                <Pressable onPress={() => router.push("/(modals)/seeMoreFeaturedWishlistsModal")}>
                    <Typography size={16} fontFamily='urbanist-bold' color={BaseColors.primaryLight} style={{ minWidth: 30 }}>
                        Show All
                    </Typography>
                </Pressable>
            </View>

            {(loading) && (
                <View style={{ height: 100 }}>
                    <Loading color={BaseColors[currentTheme == "light" ? "primaryLight" : "accent"]} />
                </View>
            )}

            {!loading && data.length > 0 && (
                <View style={styles.itemDisplay}>
                    <FlatList
                        data={data as WishlistType[]}
                        horizontal={true}
                        showsHorizontalScrollIndicator={false}
                        bounces={false}
                        overScrollMode="never" // default, always, never
                        contentContainerStyle={{ gap: spacingX._15, paddingRight: spacingX._30 }}
                        renderItem={({ item, index }) => (
                            <Animated.View entering={FadeInDown.delay(index * 70)}>
                                <Pressable
                                    style={[styles.card, {
                                        backgroundColor: Colors.background200,
                                        width: verticalScale(width - (data?.length > 1 ? 60 : 38)),
                                    }]}
                                    onPress={() => router.push(`https://pay.wishers.app/w/${item?.slug}`)}
                                >
                                    <ImageBackground
                                        source={getFilePath(item?.image)}
                                        contentFit="cover"
                                        style={styles.cardImage}
                                    >
                                        <LinearGradient
                                            colors={currentTheme == "dark" ? ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.8)'] : ['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
                                            style={{ flex: 1, justifyContent: 'flex-end' }}
                                        >
                                            <View style={styles.cardDetails}>
                                                <WishlistCreator uid={item?.uid!} />
                                                {/* <WishlistCreator creator={item?.boostingCreator!} /> */}

                                                <Typography size={22} fontFamily="urbanist-bold" color={BaseColors.neutral100}>
                                                    {item?.title}
                                                </Typography>
                            
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <View style={{ flexDirection: "row", gap: 3, alignItems: "center" }}>
                                                        {(item?.contributorsImages && (item?.contributorsImages?.length || 0) > 1) ? (
                                                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                                                {(item?.contributorsImages as string[])?.map((img, i) => (
                                                                    <Image
                                                                        source={getProfileImage(img)}
                                                                        style={[styles.contributorImage, { backgroundColor: BaseColors.neutral300, borderColor: BaseColors.white, marginRight: i == ((item?.contributorsImages?.length || 1) - 1) ? 0 : -10, }]}
                                                                        contentFit="cover"
                                                                        key={i}
                                                                    />
                                                                ))}
                                                            </View>
                                                        ) : (
                                                            <Icons.UsersThreeIcon size={21} color={BaseColors.neutral350} />
                                                        )}
                                                        <Typography fontFamily="urbanist-medium" size={verticalScale(17)} color={BaseColors.neutral350}>{item.totalContributors} Giver{item?.totalContributors === 1 ? "" : "s"}</Typography>
                                                    </View>
                                                    <View style={{ flexDirection: "row", gap: 3 }}>
                                                        <Icons.GiftIcon size={21} color={BaseColors.neutral350} />
                                                        <Typography fontFamily="urbanist-medium" size={verticalScale(17)} color={BaseColors.neutral350}>{item.totalWishItems} Wish{item?.totalWishItems === 1 ? "" : "es"}</Typography>
                                                    </View>
                                                </View>
                            
                                                <Rangebar value={getPercentage(item?.totalAmountReceived, item?.totalGoalAmount)} height={6} />
                            
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(18)} color={BaseColors.neutral350}>{getPercentage(item?.totalAmountReceived, item?.totalGoalAmount)}% Raised</Typography>
                                                    <Typography fontFamily="urbanist-bold" size={verticalScale(19)} color={BaseColors.primaryLight}>{item?.totalAmountReceived ? `${formatShortCurrency(item?.totalAmountReceived ?? 0)} / ${formatShortCurrency(item?.totalGoalAmount ?? 0)}` : formatCurrency(0)}</Typography>
                                                </View>
                                            </View>
                                        </LinearGradient>
                                    </ImageBackground>
                                </Pressable>
                            </Animated.View>
                        )}
                    />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: spacingY._20,
    },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    itemDisplay: {
        flex: 1,
        marginHorizontal: -15,
    },
    card: {
        // width: verticalScale(width - 35),
        marginLeft: 16,
        height: verticalScale(210),
        minWidth: "100%",
        borderRadius: radius._10,
        gap: spacingY._10,
        overflow: "hidden",
    },
    cardImage: {
        width: "100%",
        height: "100%",
    },
    cardDetails: {
        gap: spacingY._10,
        padding: spacingY._10,
    },
    contributorImage: {
        height: verticalScale(24),
        width: verticalScale(24),
        borderRadius: 100,
        borderWidth: 1,
    },
})