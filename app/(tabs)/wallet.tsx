import BankDetail from "@/components/BankDetail";
import Button from "@/components/Button";
import FormInput from "@/components/FormInput";
import Loading from "@/components/Loading";
import NetworkNotConnected from "@/components/NetworkNotConnected";
import ScreenWrapper from "@/components/ScreenWrapper";
import Typography from "@/components/Typography";
import { auth } from "@/config/firebase";
import { BaseColors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useNetwork } from "@/contexts/NetworkContext";
import { useBiometricAuth } from "@/hooks/useBiometricsAuth";
import useFetchData from "@/hooks/useFetchData";
import { useTheme } from "@/hooks/useTheme";
import { deleteBankDetails } from "@/services/bankServices";
import { verticalScale } from "@/utils/styling";
import { BankAccountType, WalletType } from "@/utils/types";
import { useFocusEffect } from "@react-navigation/native";
import * as Burnt from "burnt";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { limit, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useRef, useState } from "react";
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import ModalView from "react-native-modal";
import Animated, { FadeInLeft } from "react-native-reanimated";
import { formatCurrency } from '../../utils/helpers';


export default function WalletScreen() {
	const router = useRouter();
	const { actions } = useAppContext();
	const { isConnected } = useNetwork();
	const { user, biometricEnabled } = useAuth();
	const { Colors, currentTheme } = useTheme();
	const { authenticate, isBiometricSupported, isEnrolled } = useBiometricAuth();

	const [refreshing, setRefreshing] = useState(false);
	const [loading, setLoading] = useState({ delete: false, process: false })
	const [showModal, setShowModal] = useState({ delete_completed: false });
	const [withdrawalAmount, setWithdrawalAmount] = useState({ amount_entered: "", amount_to_pay: "" });
	const [withdrawalSteps, setWithdrawalSteps] = useState<number | 1 | 2>(1);
	const [insufficientFund, setInsufficientFund] = useState(false);
	const [password, setPassword] = useState("");

	const amountInputRef = useRef<TextInput | any>(null);
    const biometricsIsEnabled = isBiometricSupported && isEnrolled && biometricEnabled;

	
	const { data: walletData, loading: walletLoading, refetch: refetchWallet } = useFetchData<WalletType>(
		"wallets", (user?.uid) ? [where("uid", "==", user.uid), limit(1)] : [],
	);
	const wallet = walletData?.[0];

	const { data: bankData, loading: bankLoading, refetch: refetchBank } = useFetchData<BankAccountType>(
		"bankaccounts", (user?.uid) ? [where("uid", "==", user.uid), limit(1)] : [],
	);
	const bankDetail = bankData?.[0];

	const handleRefresh = function() {
		setRefreshing(true);
		refetchWallet();
		refetchBank();
    	setRefreshing(false);
	}

	useFocusEffect(
		React.useCallback(function() {
			refetchWallet();
			setWithdrawalSteps(1);
			setWithdrawalAmount({ amount_entered: "", amount_to_pay: "" });
		}, [])
	);

	useEffect(function() {
		if(+withdrawalAmount?.amount_entered > 1) {
			const appPercent = ((actions?.appWithdrawalPercentage! / 100) * +withdrawalAmount?.amount_entered).toFixed(0);
			setWithdrawalAmount({ ...withdrawalAmount, amount_to_pay: (+withdrawalAmount?.amount_entered - +appPercent).toString() })
		} else {
			setWithdrawalAmount({ ...withdrawalAmount, amount_to_pay: "" })
		}

		setInsufficientFund(false);
	}, [withdrawalAmount.amount_entered, actions?.appWithdrawalPercentage]);


	const handleDeleteWithPassword = async function(password: string) {
		if(!password) return Burnt.toast({ title: "Password is required", haptic: "error" });
		setLoading({ ...loading, delete: true })

		try {
			const user = auth?.currentUser;
			
			// Reauthenticate
			const credential = EmailAuthProvider.credential(user?.email!, password);
			await reauthenticateWithCredential(user!, credential);
			setShowModal({ ...showModal, delete_completed: true })
			setWithdrawalSteps(1);

			// then proceed to deleting
			await deleteBankDetails(bankDetail?.id!);
		} catch(err: any) {
			Burnt.toast({ title: err?.message, haptic: "error" });
		} finally {
			setLoading({ ...loading, delete: false })
		}
	}


	const handleDeleteWithBiometric = async function() {
		setLoading({ ...loading, delete: true })

		try {
			await authenticate();
			setShowModal({ ...showModal, delete_completed: true })
			setWithdrawalSteps(1);

			// then proceed to deleting
			await deleteBankDetails(bankDetail?.id!);
		} catch(err: any) {
			Burnt.toast({ title: err?.message, haptic: "error" });
		} finally {
			setLoading({ ...loading, delete: false })
		}
	}

	const handleProcessWithdrawal = function() {
		if(+!withdrawalAmount.amount_entered) {
			return Burnt.toast({ haptic: "error", title: "Enter an amount to withdraw!" })
		}

		if(wallet?.remainingBalance < +withdrawalAmount.amount_entered!) {
			amountInputRef?.current?.focus();
			setInsufficientFund(true);
			return Burnt.toast({ haptic: "error", title: "Insufficient fund" })
		}

		if(+withdrawalAmount.amount_entered < actions?.minWithdrawalAmount!) {
			return Burnt.toast({ haptic: "error", title: `Withdrawal Amount cannot be less than ${formatCurrency(actions?.minWithdrawalAmount ?? 0)}` })
		}

		setWithdrawalSteps(2);
	}

	return (
		<ScreenWrapper>
			<ScrollView
				refreshControl={
					<RefreshControl
						refreshing={refreshing}
						onRefresh={handleRefresh}
					/>
				}
				bounces={false}
				contentContainerStyle={styles.container}
				showsVerticalScrollIndicator={false}
				scrollEnabled={false}
			>
                {/* balance */}
				<View style={[styles.balanceView]}>
					<Typography size={42.5} fontFamily="urbanist-semibold">
						{walletLoading ? "----" : formatCurrency(wallet?.remainingBalance ?? 0)}
					</Typography>
					<Typography size={17} color={Colors.textLighter} fontFamily="urbanist-medium">
						Remaining Balance
					</Typography>
				</View>

				{/* the action part */}
				<ScrollView
					bounces={false}
					showsVerticalScrollIndicator={false}
					scrollEnabled={true}
					contentContainerStyle={[styles.withdrawalView, { backgroundColor: Colors[currentTheme == "dark" ? "background300" : "cardBackground"] }]}
				>
					{(bankLoading && isConnected) ? <Loading /> : (isConnected) && ( 
						<React.Fragment>
							{(withdrawalSteps === 1 && !bankDetail) && (
								<React.Fragment>
									{/* bank details card */}
									<View style={{ backgroundColor: Colors[currentTheme == "dark" ? "cardBackground" : "background300"], alignItems: "center", padding: spacingY._15, paddingBottom: spacingY._25, borderRadius: radius._10, gap: spacingY._10, marginTop: spacingY._30 }}>
										<Icons.CardholderIcon size={verticalScale(50)} color={BaseColors.neutral400} weight="light" />
										<Typography fontFamily="urbanist-semibold" color={Colors[currentTheme == "dark" ? "textLighter" : "neutral500"]}>No Details</Typography>
										<Pressable onPress={() => router.push("/(modals)/bankSetupModal")} style={{
											paddingVertical: spacingY._10,
											paddingHorizontal: spacingY._20,
											borderRadius: radius._6,
											alignItems: "center",
											backgroundColor: BaseColors[currentTheme == "dark" ? "primaryAccent" : "accent"]
										}}>
											<Typography color={BaseColors.primaryLight} fontFamily="urbanist-semibold">Add Your Bank Details</Typography>
										</Pressable>
									</View>
									
									{/* the transaction history */}
									<Pressable onPress={() => router.push("/(modals)/transactionHistoryModal")} style={{ padding: spacingY._10 }}>
										<Typography
											fontFamily="urbanist-bold"
											size={22}
											color={BaseColors.primaryLight}
											style={{
												textAlign: "center",
												textDecorationLine: "underline",
												textDecorationColor: BaseColors.primaryLight,
											}}
										>
											View Transaction History
										</Typography>
									</Pressable>
								</React.Fragment>
							)}

							{(bankDetail && withdrawalSteps === 1) && (
								<React.Fragment>
									{/* the transaction history */}
									<Pressable onPress={() => router.push("/(modals)/transactionHistoryModal")} style={{ padding: spacingY._5 }}>
										<Typography
											fontFamily="urbanist-semibold"
											size={20}
											color={BaseColors.primaryLight}
											style={{
												textAlign: "center",
												textDecorationLine: "underline",
												textDecorationColor: BaseColors.primaryLight,
											}}
										>
											View Transaction History
										</Typography>
									</Pressable>

									<BankDetail
										loading={loading?.delete || bankLoading}
										bankName={bankDetail?.bankName}
										accountName={bankDetail?.accountName}
										accountNumber={bankDetail?.accountNumber}
										handleDeleteBankWithPassword={(password) => handleDeleteWithPassword(password)}
										handleDeleteBankWithBiometrics={handleDeleteWithBiometric}
									/>

									<View style={styles.withdrawalForm}>
										{/* the form container */}
										<View style={{ gap: spacingY._22 }}>
											<View style={{ gap: spacingY._10 }}>
												<Typography fontFamily="urbanist-bold" color={Colors.textLighter}>Enter an Amount</Typography>
												<FormInput
													placeholder={`₦10,000 (Minimum of ${formatCurrency(actions?.minWithdrawalAmount ?? 0)})`}
													icon={<Icons.CurrencyNgnIcon size={verticalScale(20)} color={BaseColors[insufficientFund ? "rose" : "primary"]} weight="bold" />}
													keyboardType="number-pad"
													value={withdrawalAmount.amount_entered?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
													maxLength={actions?.maxWithdrawalAmountDigits}
													onChangeText={(value) => setWithdrawalAmount({ ...withdrawalAmount, amount_entered: value.replace(/,/g, '') })}
													containerStyle={insufficientFund ? { borderColor: BaseColors.rose } : {}}
													inputRef={amountInputRef}
												/>
											</View>

											<View style={styles.flexRow}>
												<View style={{ flexDirection: "row", alignItems: "center", gap: spacingX._5 }}>
													<Typography size={16} fontFamily="urbanist-semibold" color={BaseColors.neutral400}>Service fee</Typography>
													<Icons.InfoIcon size={verticalScale(24)} color={Colors.neutral400} weight="regular" />
												</View>

												<Icons.ArrowsDownUpIcon size={verticalScale(24)} color={Colors.neutral400} weight="regular" />

												<Typography size={16} fontFamily="urbanist-semibold" color={BaseColors.neutral400}>{actions?.appWithdrawalPercentage}% of {formatCurrency(+withdrawalAmount?.amount_entered || 0)}</Typography>
											</View>

											<Pressable style={{ gap: spacingY._10 }} onPress={() => amountInputRef.current?.focus()}>
												<Typography fontFamily="urbanist-bold" color={Colors.textLighter}>Amount to Recieve</Typography>
												<FormInput
													placeholder="Amount to be paid"
													icon={<Icons.CurrencyNgnIcon size={verticalScale(20)} color={BaseColors.primary} weight="bold" />}
													keyboardType="number-pad"
													readOnly
													value={withdrawalAmount.amount_to_pay?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
												/>
											</Pressable>
										</View>

										<Button
											onPress={handleProcessWithdrawal}
											style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: BaseColors.primaryLight }}
										>
											{loading.process ? <Loading /> : (
												<Typography fontFamily="urbanist-semibold" size={22} color={BaseColors.white}>Continue</Typography>
											)}
										</Button>
									</View>
								</React.Fragment>
							)}

							{/* finalization part */}
							{withdrawalSteps === 2 && (
								<Animated.View style={styles.withdrawalForm} entering={FadeInLeft.delay(50)}>
									<View style={{ gap: spacingY._22, marginTop: spacingY._12 }}>
										<View style={{ flexDirection: "row", gap: spacingY._3, padding: spacingY._7, backgroundColor: BaseColors.brownAccent, borderRadius: radius._6 }}>
											<Icons.InfoIcon size={verticalScale(20)} color={BaseColors.brown} />
											<Typography size={verticalScale(20)} fontFamily="urbanist-medium" color={Colors.brown} style={{ lineHeight: 25, paddingRight: spacingX._10, }}>
												You're withdrawing {formatCurrency(+withdrawalAmount.amount_to_pay!)}, Please Enter your password{biometricsIsEnabled && (Platform.OS == "ios" ? " or Face Id /Fingerprint" : " or Biometrics")} to confirm
											</Typography>
										</View>

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
												onPress={() => {}}
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
													Continue with {biometricsIsEnabled && (Platform.OS == "ios" ? "Face Id /Fingerprint" : "Biometrics")}
												</Typography>
											</TouchableOpacity>
										)}
									</View>

									{/* action buttons */}
									<View style={{ gap: spacingY._10 }}>
										<Button
											onPress={() => {}}
											disabled={+withdrawalAmount?.amount_entered < 500 || loading.process}
											style={{ flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: BaseColors.primaryLight }}
										>
											{loading.process ? <Loading color={BaseColors.primaryLight} /> : (
												<Typography fontFamily="urbanist-semibold" size={22} color={BaseColors.white}>Confirm Withdrawal</Typography>
											)}
										</Button>

										<Button
											onPress={() => {
												setWithdrawalSteps(1);
												setWithdrawalAmount({ amount_entered: "", amount_to_pay: "" });
											}}
											style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: spacingX._15, backgroundColor: BaseColors[currentTheme == "dark" ? "primaryAccent" : "accent"]  }}
										>
											<Typography fontFamily="urbanist-semibold" size={22} color={BaseColors.primaryLight}>Cancel</Typography>
										</Button>
									</View>
								</Animated.View>
							)}
						</React.Fragment>
					)}

					{!isConnected && (
						<NetworkNotConnected location="wallet" />
					)}
				</ScrollView>
            </ScrollView>

			{/* COMPLETED ACTION */}
			<ModalView
				isVisible={showModal.delete_completed}
				backdropOpacity={0.7}
				backdropTransitionInTiming={800}
				backdropTransitionOutTiming={500}
				onBackdropPress={() => setShowModal({ ...showModal, delete_completed: false })}
			>
				<View style={[styles.modalCard, { backgroundColor: Colors.cardBackground }]}>
					<Image
						source={require("@/assets/images/icon-check.png")}
						style={{ width: verticalScale(100), aspectRatio: 1, marginTop: -15 }}
					/>

					<View style={styles.modalHeadings}>
						<Typography color={Colors.text} fontFamily="urbanist-semibold" size={verticalScale(32.5)}>Deleted Successfully!</Typography>
						<Typography color={Colors.textLighter} fontFamily="urbanist-medium" size={verticalScale(20)}>
							Your bank details has been deleted successfully!
						</Typography>
					</View>
					

					<Button style={{ width: "100%" }} onPress={() => {
						router.push("/(modals)/bankSetupModal");
						setShowModal({ ...showModal, delete_completed: false })
					}}>
						<Typography color={BaseColors.white} size={22} fontFamily="urbanist-semibold">Add new bank detail</Typography>
					</Button>
				</View>

				<Pressable
					onPress={() => setShowModal({ ...showModal, delete_completed: false })}
					style={styles.closeButton}
				>
					<Icons.XIcon size={verticalScale(23.5)} color={BaseColors.white} weight="bold" />
				</Pressable>
			</ModalView>
		</ScreenWrapper>
	);
}


const styles = StyleSheet.create({
    container: {
		flex: 1,
		justifyContent: "space-between",
    },
	balanceView: {
		height: verticalScale(160),
		alignItems: "center",
		justifyContent: "center",
		gap: spacingY._5,
	},
	flexRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	modalCard: {
        minHeight: verticalScale(100),
        borderRadius: radius._10,
        padding: spacingY._17,
        paddingVertical: spacingY._25,

        alignItems: "center",
        gap: spacingY._25,
        textAlign: "center",
    },
	modalHeadings: {
        gap: spacingY._7,
        alignItems: "center",
        marginBottom: spacingY._5,
    },
	closeButton: {
        width: verticalScale(50),
        height: verticalScale(50),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BaseColors.neutral800,
        borderRadius: 70,
        alignSelf: "center",
        marginTop: spacingY._10
    },
	withdrawalView: {
		flex: 1,
		gap: spacingY._20,
		borderTopRightRadius: radius._30,
		borderTopLeftRadius: radius._30,
		paddingHorizontal: spacingX._18,
		paddingTop: spacingY._12,
		paddingBottom: spacingY._25,
	},
	withdrawalForm: {
		flex: 1,
		gap: spacingY._30,
	},
});