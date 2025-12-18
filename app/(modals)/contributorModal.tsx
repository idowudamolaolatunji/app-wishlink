import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import Loading from "@/components/Loading";
import ModalWrapper from "@/components/ModalWrapper";
import ScreenHeader from "@/components/ScreenHeader";
import Typography from "@/components/Typography";
import { BaseColors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import useFetchData from "@/hooks/useFetchData";
import { useTheme } from "@/hooks/useTheme";
import { getProfileImage } from "@/services/imageService";
import { formatCurrency, formatDateFull } from "@/utils/helpers";
import { verticalScale } from "@/utils/styling";
import { ContributorType, WishItemType } from "@/utils/types";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { limit, where } from "firebase/firestore";
import React, { useState } from "react";
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ContributorModal() {
	const router = useRouter();
	const { user } = useAuth();
	const { currentTheme, Colors } = useTheme();
	const { refId }: { refId: string } = useLocalSearchParams();

    const [refreshing, setRefreshing] = useState(false);

	const { data: contibutorData, loading: contributorLoading, refetch: refetchContributor } = useFetchData<ContributorType>(
		"contributors", user?.uid ? [where("uid", "==", user?.uid), where("refId", "==", refId), limit(1)] : [],
	);

	const contributor = contibutorData?.[0];
	const { data: wishData } = useFetchData<WishItemType>(
		"wishitems", (contributor?.wishSlug) ? [where("uid", "==", user?.uid), where("slug", "==", contributor?.wishSlug)] : [],
	);
	const wishItem = wishData?.filter((item) => item?.slug === contributor?.wishSlug)[0];

    const handleRefresh = function() {
        setRefreshing(true);
        refetchContributor();
        setRefreshing(false);
    }


	return (
		<ModalWrapper>
			<View style={styles.container}>
				<ScreenHeader title="Contribution Details" leftElement={<BackButton />} style={{ marginBottom: spacingY._10 }} />

				<ScrollView
					bounces={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
					showsVerticalScrollIndicator={false}
				>
					{contributorLoading && (
						<View style={{ flex: 1, alignItems: "center", justifyContent: "center", height: 200, }}>
							<Loading color={BaseColors[currentTheme == "light" ? "primaryLight" : "accentDark"]} />
						</View>
					)}

                    {(!contributorLoading && contributor) && (
						<View style={styles.contributor}>
							<View style={styles.contributorTop}>
								<View style={[styles.imageContainer, { backgroundColor: BaseColors.neutral500 }]}>
									<Image
										source={getProfileImage(!contributor?.isAnonymous ? contributor?.image : null)}
										contentFit="cover"
										style={{
											height: verticalScale(55),
											width: verticalScale(55),
											borderRadius: 200,
										}}
									/>
								</View>

								<Typography fontFamily='urbanist-bold' size={verticalScale(24)} style={{ textAlign: "center" }}>{contributor?.name || "Anonymous"}</Typography>
								{contributor?.message && <Typography fontFamily='urbanist-medium' size={verticalScale(18)} style={{ textAlign: "center" }}>{contributor?.message}</Typography>}
							</View>

							<View style={styles.contributorBody}>
								<View style={styles.bodyDetail}>
									<Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Amount paid</Typography>
									<Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text}>{formatCurrency(contributor?.amount)}</Typography>
								</View>
								<View style={styles.bodyDetail}>
									<Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Reference ID</Typography>
									<Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text}>#{contributor?.refId}</Typography>
								</View>
								<View style={styles.bodyDetail}>
									<Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Date & Time</Typography>
									<Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text}>{formatDateFull(contributor?.createdAt)}</Typography>
								</View>
								<View style={styles.bodyDetail}>
									<Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Status</Typography>
									<Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors.primaryLight} style={{ textTransform: "capitalize" }}>Successful</Typography>
								</View>
							</View>

							<View style={styles.contributorBody}>
								{(contributor?.wishSlug && wishItem) ? (
									<Animated.View entering={FadeInDown.delay(1 * 70)}>
										<TouchableOpacity
											activeOpacity={0.8}
											style={[styles.itemCard, { backgroundColor: Colors.cardBackground }]}
											onPress={() => router.push({
												pathname: "/(modals)/wishItemDetailModal",
												params: { slug: wishItem?.slug, title: wishItem?.title, id: wishItem.id },
											})}
										>
											<View style={styles.itemImageContainer}>
												<Image
													contentFit="cover"
													source={wishItem?.images[0]}
													style={{
														height: verticalScale(60),
														width: verticalScale(60),
														borderRadius: radius._6,
														backgroundColor: Colors.background300,
													}}
												/>
											</View>
							
											<View style={styles.itemDetails}>
												<Typography size={21} fontFamily="urbanist-bold">
													{wishItem?.title}
												</Typography>
							
												<Typography fontFamily="urbanist-bold" size={verticalScale(19)} color={BaseColors.primaryLight}>
													{formatCurrency(wishItem?.goalAmount ?? 0)}
												</Typography>
											</View>
										</TouchableOpacity>
									</Animated.View>
								) : null}

								<Button style={{ marginTop: spacingY._10 }} onPress={() => router.push({ pathname: "/(modals)/transactionDetailsModal", params: { refId: contributor?.refId, }})}>
									<Typography fontFamily="urbanist-semibold" size={25} color={BaseColors.white}>View Transaction Details</Typography>
								</Button>
							</View>
						</View>
					)}
				</ScrollView>
			</View>
		</ModalWrapper>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "space-between",
		paddingHorizontal: spacingY._20,
	},
	contributor: {
        marginTop: spacingY._25,
        gap: spacingY._50,
        alignItems: "center",
    },
    contributorTop: {
        alignItems: "center",
        gap: spacingY._7
    },
    imageContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: verticalScale(60),
        height: verticalScale(60),
        borderRadius: 200,
    },
	contributorBody: {
        alignSelf: "stretch",
        gap: spacingY._15
    },
    bodyDetail: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
		flexWrap: "wrap",
    },

	///////////////////////
	///////////////////////

	itemCard: {
		padding: spacingY._7,
		borderRadius: radius._10,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		gap: spacingX._15,
	},
	itemImageContainer: {
		justifyContent: "center",
		alignItems: "center",
	},
	itemDetails: {
		flex: 1,
		gap: spacingY._7,
	},
});
