import ContributionList from "@/components/ContributionList";
import HomeReferral from "@/components/HomeReferral";
import ScreenWrapper from "@/components/ScreenWrapper";
import { BaseColors, radius, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from "@/contexts/AuthContext";
import useFetchData from "@/hooks/useFetchData";
import { useTheme } from "@/hooks/useTheme";
import { formatCurrency } from "@/utils/helpers";
import { ContributorType, WalletType } from "@/utils/types";
import { useRouter } from "expo-router";
import { limit, orderBy, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import { useState } from "react";
import { ImageBackground, Platform, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from "react-native-reanimated";
import Typography from '../../components/Typography';
import { scale, verticalScale } from '../../utils/styling';

const isIOS = Platform.OS === "ios";

export default function HomeScreen() {
	const router = useRouter();
	const { user } = useAuth();
	const { Colors, currentTheme } = useTheme();
	const displayName = user?.name?.split(" ").slice(0, 2).join(" ")

	const [showBanner, setShowBanner] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	const { data, loading: walletLoading, refetch: refetchWallet } = useFetchData<WalletType>(
		"wallets", (user?.uid) ? [where("uid", "==", user.uid), limit(50)] : [],
	);
	const wallet = data?.[0];

	const { data: contributors, error, loading: contributorLoading, refetch: refetchContributor } = useFetchData<ContributorType>(
		"contributors", (user?.uid) ? [where("uid", "==", user?.uid), orderBy("createdAt", "desc"), limit(10)] : [],
	);

	const handleRefresh = function() {
		setRefreshing(true);
		refetchWallet();
		refetchContributor();
    	setRefreshing(false);
	}

	return (
		<ScreenWrapper>
			<View style={styles.container}>
				
				<View style={styles.header}>
					<Animated.View style={{ gap: 4 }}
						entering={FadeInDown.duration(500)}
					>
						<Typography size={isIOS ? 16 : 18} fontFamily="urbanist-medium" color={Colors.textLighter}>Hello,</Typography>
						<Typography size={isIOS ? 20 : 24} fontFamily="urbanist-semibold">{displayName}</Typography>
					</Animated.View>

					<TouchableOpacity style={[styles.headerIcn, { backgroundColor: Colors.background300 }]} onPress={() => router.push("/(modals)/notificationModal")}>
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
									<Typography color={BaseColors[currentTheme == "dark" ? "neutral600" : "neutral700"]} fontFamily='urbanist-bold' size={isIOS ? 17 : 19}>
										All-Time Accumulated
									</Typography>
									<Icons.DotsThreeOutlineIcon
										size={verticalScale(23)}
										color={BaseColors.black}
										weight="fill"
									/>
								</View>

								<Typography color={BaseColors.neutral800} fontFamily="urbanist-bold" size={isIOS ? 31 : 33}>
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
										<Typography size={isIOS ? 16 : 17.5} color={BaseColors.neutral700} fontFamily="urbanist-semibold">
											Total Raised
										</Typography>
									</View>

									<View style={{ alignSelf: "flex-start" }}>
										<Typography size={isIOS ? 17 : 20} color={BaseColors.primaryLight} fontFamily="urbanist-bold">
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
										<Typography size={isIOS ? 16 : 18} color={BaseColors.neutral700} fontFamily="urbanist-semibold">
											Referrals
										</Typography>
									</View>

									<View style={{ alignSelf: "flex-end" }}>
										<Typography size={isIOS ? 17 : 20} color={BaseColors.lemon} fontFamily="urbanist-bold">
											{walletLoading ? "---" : formatCurrency(wallet?.referralEarnings ?? 0, 0)}
										</Typography>
									</View>
								</View>
							</View>
						</View>
					</ImageBackground>


					{/* REFERRAL */}
					{showBanner && <HomeReferral handleClose={() => setShowBanner(false)} />}


					{(!contributorLoading && error) && (
						<Typography
							size={isIOS ? 15 : 17}
							color={Colors.textLighter}
							style={{ textAlign: "center", marginTop: spacingY._15 }}
						>
							{error}
						</Typography>
					)}

					{!error && (
						<ContributionList
							title="Recent Contributions"
							data={contributors as ContributorType[]}
							loading={contributorLoading}
							emptyListMessage="No contribution yet!"
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
		borderRadius: 50
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

		// temps
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