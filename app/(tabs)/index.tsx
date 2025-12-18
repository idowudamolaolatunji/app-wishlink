import ContributionList from "@/components/ContributionList";
import FeaturedWishlists from "@/components/FeaturedWishlists";
import HomeReferral from "@/components/HomeReferral";
import ScreenWrapper from "@/components/ScreenWrapper";
import { BaseColors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import useFetchData from "@/hooks/useFetchData";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/helpers";
import { ContributorType, WalletType, WishlistType } from "@/utils/types";
import { useRouter } from "expo-router";
import { limit, orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import { useState } from "react";
import { ImageBackground, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from "react-native-reanimated";
import Typography from '../../components/Typography';
import { scale, verticalScale } from '../../utils/styling';


export default function HomeScreen() {
	const router = useRouter();
	const { user } = useAuth();
	const { notificationCount } = useNotification();
	const { Colors, currentTheme } = useTheme();
	const displayName = user?.name?.split(" ").slice(0, 2).join(" ")

	const [showBanner, setShowBanner] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const { data, loading: walletLoading, refetch: refetchWallet } = useFetchData<WalletType>(
		"wallets", (user?.uid) ? [where("uid", "==", user.uid), limit(1)] : [],
	);
	const wallet = data?.[0];

	const { data: contributors, error, loading: contributorLoading, refetch: refetchContributor } = useFetchData<ContributorType>(
		"contributors", (user?.uid) ? [where("uid", "==", user?.uid), orderBy("createdAt", "desc"), limit(30)] : [],
	);

	const { data: featuredWishlists, loading: featuredLoading, refetch: refetchFeatured } = useFetchData<WishlistType>(
		"wishlists", [
			where("currentboostExpiresAt", ">=", new Date().toISOString()), // active boosts
			orderBy("totalAmountReceived", "desc"), // highest paying first
			orderBy("lastBoostedAt", "desc"), // most recent boost next
			orderBy("totalContributors", "desc"), // highestes contributors next
			orderBy("previousBoostingCount", "desc"), // most recent boost next
			limit(25)
		],
	);

	const handleRefresh = function() {
		setRefreshing(true);
		refetchWallet();
		refetchContributor();
		refetchFeatured();
    	setRefreshing(false);
	}

	return (
		<ScreenWrapper>
			<View style={styles.container}>
				
				<View style={styles.header}>
					<Animated.View style={{ gap: 4 }}
						entering={FadeInDown.duration(500)}
					>
						<Typography size={17} fontFamily="urbanist-medium" color={Colors.textLighter}>Hello,</Typography>
						<Typography size={21} fontFamily="urbanist-semibold">{displayName || "---"}</Typography>
					</Animated.View>

					<TouchableOpacity style={[styles.headerIcn, { backgroundColor: Colors.background300 }]} onPress={() => router.push("/(modals)/notificationModal")}>
						{notificationCount != 0 && (
							<View style={styles.notificationCount}>
								<Typography fontFamily="urbanist-semibold" size={14}>{notificationCount >= 10 ? "9+" : notificationCount || 0}</Typography>
							</View>
						)}
						<Icons.BellIcon weight="bold" size={verticalScale(23)} color={Colors.textLighter} />
					</TouchableOpacity>
				</View>

				<ScrollView
					refreshControl={
						<RefreshControl
							refreshing={refreshing}
							onRefresh={handleRefresh}
						/>
					}
					contentContainerStyle={styles.scrollViewStyle}
					showsVerticalScrollIndicator={false}
				>

					{/* THE BALANCE CARD */}
					{/* <HomeCard /> */}
					<ImageBackground
						source={require("@/assets/images/card-full.png")}
						resizeMode="stretch"
						style={styles.bgImage}
					>
						<View style={styles.bgImgContainer}>
							{/* this view container only covers the first card area */}

							<View>
								<View style={styles.totalBalanceRow}>
									<Typography color={BaseColors[currentTheme == "dark" ? "neutral600" : "neutral700"]} fontFamily='urbanist-bold' size={18}>
										All-Time Accumulated
									</Typography>
									<Icons.DotsThreeOutlineIcon
										size={verticalScale(23)}
										color={BaseColors.black}
										weight="fill"
									/>
								</View>

								<Typography color={BaseColors.neutral800} fontFamily="urbanist-bold" size={31.5}>
									{walletLoading ? "----" : formatCurrency(wallet?.allTimeBalance ?? 0, 2)}
								</Typography>
							</View>

							{/* raised & referral earnings */}
							<View style={styles.stats}>
								<View style={{ gap: verticalScale(3) }}>
									<View style={styles.statsElement}>
										<View style={[styles.statsIcon, { alignSelf: "flex-start", borderRadius: 100 }]}>
											<Icons.HandCoinsIcon
												color={BaseColors.primaryLight}
												size={verticalScale(16)}
												weight="bold"
											/>
										</View>
										<Typography size={16} color={BaseColors.neutral700} fontFamily="urbanist-semibold">
											Total Raised
										</Typography>
									</View>

									<View style={{ alignSelf: "flex-start" }}>
										<Typography size={18} color={BaseColors.primaryLight} fontFamily="urbanist-bold">
											{walletLoading ? "---" : formatCurrency(wallet?.contributedEarning ?? 0, 0)}
										</Typography>
									</View>
								</View>

								<View style={{ gap: verticalScale(3) }}>
									<View style={styles.statsElement}>
										<View style={[styles.statsIcon, { alignSelf: "flex-end", borderRadius: 100 }]}>
											<Icons.UsersThreeIcon
												// color={BaseColors.neutral800}
												color={BaseColors.lemon}
												size={verticalScale(16)}
												weight="bold"
											/>
										</View>
										<Typography size={17} color={BaseColors.neutral700} fontFamily="urbanist-semibold">
											Referrals
										</Typography>
									</View>

									<View style={{ alignSelf: "flex-end" }}>
										<Typography size={18} color={BaseColors.lemon} fontFamily="urbanist-bold">
											{walletLoading ? "---" : formatCurrency(wallet?.referralEarnings ?? 0, 0)}
										</Typography>
									</View>
								</View>
							</View>
						</View>
					</ImageBackground>


					{/* REFERRAL */}
					{showBanner && (
						<HomeReferral
							handleClose={() => setShowBanner(false)}
							referralEarnings={wallet?.referralEarnings}
						/>
					)}

					{/* FEATURED WISHLISTS */}
					{(featuredLoading || featuredWishlists?.length > 0) && (
						<FeaturedWishlists
							data={featuredWishlists as WishlistType[]}
							loading={featuredLoading}
						/>
					)}

					{(!contributorLoading && error) && (
						<Typography
							size={15.5}
							color={Colors.textLighter}
							style={{ textAlign: "center", marginTop: spacingY._15 }}
						>
							{error}
						</Typography>
					)}

					{!error && (
						<ContributionList
							title="Recent Givers"
							data={contributors as ContributorType[]}
							loading={contributorLoading}
							emptyListMessage="No givers yet!"
						/>
					)}
				</ScrollView>
			</View>
		</ScreenWrapper>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		marginTop: verticalScale(8),
		position: "relative",
		// paddingHorizontal: spacingX._18,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacingY._10,
		paddingHorizontal: spacingX._18,
	},
	headerIcn: {
		padding: spacingX._10,
		borderRadius: 50,
		position: "relative",
	},
	notificationCount: {
		position: "absolute",
		top: -5,
		right: 1,
		borderRadius: 50,
		width: verticalScale(20),
		height: verticalScale(20),
		backgroundColor: BaseColors.red,
		alignItems: "center",
	},
	scrollViewStyle: {
		paddingHorizontal: spacingX._18,
		marginTop: spacingY._10,
		paddingBottom: verticalScale(50),
		gap: spacingY._25
	},
	bgImage: {
		// height: scale(210),
		height: scale(185),
		width: "100%",
		borderRadius: radius._20,
		overflow: "hidden",
	},
	bgImgContainer: {
		// padding: spacingX._20,
		padding: spacingX._15,
		paddingHorizontal: scale(20),
		// height: "87%",
		height: "100%",
		width: "100%",
		justifyContent: "space-between",
	},
	totalBalanceRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: spacingY._5,
	},
	stats: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	statsElement: {
		// flexDirection: "row",
		alignItems: "center",
		gap: spacingY._7
	},
	statsIcon: {
		backgroundColor: BaseColors.neutral300,
		padding: spacingY._7,
		borderCurve: "continuous",
	},
});