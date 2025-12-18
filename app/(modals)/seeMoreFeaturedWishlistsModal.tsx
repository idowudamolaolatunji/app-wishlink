import BackButton from "@/components/BackButton";
import Loading from "@/components/Loading";
import ModalWrapper from "@/components/ModalWrapper";
import Rangebar from "@/components/Rangebar";
import ScreenHeader from "@/components/ScreenHeader";
import Typography from "@/components/Typography";
import WishlistCreator from "@/components/WishlistCreator";
import { BaseColors, radius, spacingY } from "@/constants/theme";
import useFetchData from "@/hooks/useFetchData";
import { useTheme } from "@/hooks/useTheme";
import { getFilePath, getProfileImage } from "@/services/imageService";
import { calculatePercentage, formatCurrency, formatShortCurrency } from "@/utils/helpers";
import { verticalScale } from "@/utils/styling";
import { WishlistType } from "@/utils/types";
import { FlashList } from "@shopify/flash-list";
import { Image, ImageBackground } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { limit, orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import { useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";


export default function SeeMoreFeaturedWishlistsModal() {
    const router = useRouter();
    const { Colors, currentTheme } = useTheme();

    // const [searchQuery, setSearchQuery] = useState("");
    const [refreshing, setRefreshing] = useState(false);

    const { data: featuredWishlists, loading: featuredLoading, refetch: refetchFeatured } = useFetchData<WishlistType>(
        "wishlists", [
            where("currentboostExpiresAt", ">=", new Date().toISOString()), // active boosts
			orderBy("previousBoostingCount", "desc"), // most recent boost next
			orderBy("lastBoostedAt", "desc"), // most recent boost next
			orderBy("totalAmountReceived", "desc"), // highest paying first
			orderBy("totalContributors", "desc"), // highestes contributors next
			limit(100)
        ],
    );

    const handleRefresh = function() {
        setRefreshing(true);
        refetchFeatured();
        setRefreshing(false);
    }

    const getPercentage = function(recieved=0, goal=0) {
        return calculatePercentage(recieved ?? 0, goal ?? 0)
    }

    return (
        <ModalWrapper>
            <View style={styles.container}>
                <ScreenHeader title="Featured Wishlists" leftElement={<BackButton />} style={{ marginBottom: spacingY._15 }} />
                
                {/* <View style={{ flexDirection: "row" , alignItems: "center", gap: spacingX._10 }}>
                    <FormInput
                        placeholder="Search wishlists"
                        icon={<Icons.MagnifyingGlassIcon size={verticalScale(24)} color={BaseColors.primary} weight="bold" />}
                        value={searchQuery}
                        onChangeText={(value: string) => setSearchQuery(value)}
                        containerStyle={{ flex: 1 }}
                    />

                    <Button style={{ paddingHorizontal: spacingX._15 }}>
                        <Icons.SlidersHorizontalIcon color={BaseColors.white} size={verticalScale(25)} weight="bold" />
                    </Button>
                </View> */}

                <ScrollView
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ marginTop: spacingY._10, paddingBottom: spacingY._35 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                >
                    {featuredLoading && (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", height: 200, }}>
                            <Loading color={BaseColors[currentTheme == "light" ? "primaryLight" : "accentDark"]} />
                        </View>
                    )}

                    {(!featuredLoading && featuredWishlists.length > 0) && (
                        <View style={{ minHeight: 3, marginTop: spacingY._20 }}>
                            <FlashList
                                data={featuredWishlists as WishlistType[]}
                                renderItem={({ item, index }) => (
                                    <Animated.View entering={FadeInDown.delay(index * 70)}>
                                        <Pressable
                                            style={[styles.card, { backgroundColor: Colors.background200, marginBottom: spacingY._15, }]}
                                            onPress={() => router.push(`https://pay.wishers.app/w/${item?.slug}`)}
                                        >
                                            <ImageBackground
                                                source={getFilePath(item?.image)}
                                                contentFit="cover"
                                                style={styles.cardImage}
                                            >
                                                <LinearGradient
                                                    colors={currentTheme == "dark" ? ['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.8)'] : ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.7)']}
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
    card: {
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
});