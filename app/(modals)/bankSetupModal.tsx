import Asterisk from "@/components/Asterisk";
import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import FormInput from "@/components/FormInput";
import Loading from "@/components/Loading";
import ModalWrapper from "@/components/ModalWrapper";
import ScreenHeader from "@/components/ScreenHeader";
import Typography from "@/components/Typography";
import { BaseColors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { addBankDetails, handleFetchBanks, handleResolveAccount } from "@/services/bankServices";
import { transferRecipient } from "@/services/paystackServices";
import { scale, verticalScale } from "@/utils/styling";
import * as Burnt from "burnt";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";


export type BankType = {
	code: string;
	slug: string;
	name: string;
	country: string;
	currency: string;
}

export default function BankSetupModal() {
	const { user } = useAuth();
	const router = useRouter();

	const { Colors, currentTheme } = useTheme();
    const [banks, setBanks] = useState<BankType[]>([]);
	const [loading, setLoading] = useState({ main: false, tiny: false });
    const [resolveFound, setResolveFound] = useState({ status: false, foundName: "", message: "" });

	const [bankData, setBankData] = useState<{
		bankName: BankType | null,
		accountNumber: string,
		accountName: string,
	}>({
		bankName: null,
        accountNumber: "",
        accountName: "",
    });

	useEffect(function() {
        const fetchData = async function() {
            const result = await handleFetchBanks("NGN");
            if(result?.success && result?.data?.data?.length > 0) {
                setBanks(result?.data?.data as BankType[])
            }
        }

        fetchData();
    }, []);

	useEffect(function() {
        const handleResolve = setTimeout(async function () {
            if (bankData.accountNumber.length <= 9 || !bankData.bankName) return;
            setLoading({ ...loading, tiny: true });
            setResolveFound({ status: false, foundName: "", message: "" })

            try {
				const { code, currency } = bankData.bankName;
                const result = await handleResolveAccount(bankData.accountNumber, code, currency);
                if(!result.success) {
                    setResolveFound({ status: false, foundName: "", message: "Could not find account name" });
                } else {
                    const accountName = result?.data?.data?.account_name;
                    setBankData({ ...bankData, accountName });
                    setResolveFound({ status: true, foundName: accountName, message: "" });
                }
				// console.log(bankData, result)

            } catch(err: any) {
                if (err?.name !== "AbortError") return err?.message
            } finally {
                setLoading({ ...loading, tiny: false });
            }
        }, 400)

        return () => clearTimeout(handleResolve);
    }, [bankData.accountNumber, bankData.bankName])


    useEffect(function() {
        if(bankData.accountName == "") {
            setResolveFound({ status: false, foundName: "", message: "" });
        }
    }, [bankData.accountName]);


    useEffect(function() {
        setBankData({ ...bankData, accountName: "" })
        setResolveFound({ status: false, foundName: "", message: "" });
    }, [bankData.bankName]);

	const handleSubmit = async function() {
		const { bankName, accountName, accountNumber }  = bankData;
 		if(!bankName || !accountName || !accountNumber) {
			return Burnt.toast({ haptic: "error", title: "Please fill all the fields!" });
		}
		setLoading({ ...loading, main: true });

		const recipientData = {
			type: 'nuban',
			name: accountName,
			account_number: accountNumber,
			bank_code: bankName?.code!,
			currency: bankName?.currency || "NGN",
		};
		const recipientCode = await transferRecipient(recipientData);

		const data = {
			uid: user?.uid,
			bankName: bankName?.name,
			accountName,
			accountNumber,
			bankCode: bankName?.code,
			currency: bankName?.currency || "NGN",
			recipientCode: recipientCode?.success ? recipientCode?.data?.code : "",
		}

		try {
			const res = await addBankDetails(data);
			if(!res.success) throw new Error(res?.msg);
			
			Burnt.toast({ haptic: "success", title: "Successful" });
			router.back();

		} catch(err: any) {
			Burnt.toast({ haptic: "error", title: err?.message });
		} finally {
			setLoading({ ...loading, main: true });
		}
	}

	return (
		<ModalWrapper>
			<View style={styles.container}>
				<ScreenHeader title="Add Bank Details" leftElement={<BackButton />} style={{ marginBottom: spacingY._20 }} />

				<KeyboardAwareScrollView
					bounces={false}
					overScrollMode="never" // default, always, never
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
					enableAutomaticScroll={true}
					contentContainerStyle={styles.formItems}
					enableOnAndroid
				>
					<View style={styles.inputContainer}>
						<Typography fontFamily="urbanist-bold" color={Colors.textLighter}>Bank Name <Asterisk /></Typography>
						<Dropdown
							style={[styles.dropdownContainer, { borderColor: BaseColors[ currentTheme == "dark" ? "neutral600" : "neutral300"], }]}
							placeholderStyle={{ color: Colors.text, fontSize: 16 }}
							selectedTextStyle={{ fontSize: verticalScale(15), color: Colors.text }}
							activeColor={BaseColors.neutral400}
							inputSearchStyle={{ backgroundColor: BaseColors.neutral100, borderRadius: radius._10 }}
							iconStyle={styles.dropdownIcon}
							containerStyle={[styles.dropdownListContainer, { backgroundColor: Colors.background300 }]}
							itemTextStyle={{ color: Colors.text }}
							itemContainerStyle={styles.dropdownItemContainer}
							data={banks ?? []}
							search
							maxHeight={400}
							labelField="name"
							valueField="slug"
							placeholder={'Select your bank'}
							searchPlaceholder="Search you bank..."
							value={bankData.bankName?.slug}
							onChange={item => {
								setBankData({ ...bankData, bankName: item })
							}}
						/>
						<View /> {/* useful */}
					</View>

							
					<View style={styles.inputContainer}>
						<Typography fontFamily="urbanist-bold" color={Colors.textLighter}>Account Number <Asterisk /></Typography>
						<FormInput
							placeholder='1230456078'
							maxLength={10}
							keyboardType="number-pad"
							value={bankData.accountNumber}
							onChangeText={(value) => setBankData({ ...bankData, accountNumber: value })}
						/>
						<View>
							{(loading.tiny && !resolveFound.status) ? (
								<View style={{ alignSelf: "flex-start", flex: 1 }}>
									<Loading size="small" color={BaseColors.primaryLight} />
								</View>
							) : null}
							
							{(!loading.tiny && resolveFound.message && !resolveFound.status) ? (
								<Typography color={Colors.rose} size={16} fontFamily="urbanist-medium">
									{resolveFound.message}
								</Typography>
							) : null}

							{(resolveFound.status && !loading.tiny) ? (
								<View style={{ gap: 1 }}>
									<Typography color={Colors.textLighter} size={16} fontFamily="urbanist-medium">
										Found Account Name:
									</Typography>
									<Typography color={Colors.primaryLight} size={17} fontFamily="urbanist-medium">
										{resolveFound.foundName}
									</Typography>
								</View>
							) : null}
						</View>
					</View>
					
					<View style={styles.inputContainer}>
						<Typography fontFamily="urbanist-bold" color={Colors.textLighter}>Account Name <Asterisk /></Typography>
						<FormInput
							placeholder='Jane Doe Martha'
							keyboardType="default"
							value={bankData.accountName}
							onChangeText={(value) => setBankData({ ...bankData, accountName: value })}
						/>
					</View>
				</KeyboardAwareScrollView>
			</View>

			<View style={[styles.footerArea, { borderTopColor: BaseColors[currentTheme == "dark" ? "neutral700" : "neutral400"] }]}>
				<Button onPress={handleSubmit} loading={loading.main} disabled={loading.main} style={{ width: "100%" }}>
					<Typography size={23} color={Colors.white} fontFamily="urbanist-semibold">
						Add Bank Details
					</Typography>
				</Button>
			</View>
		</ModalWrapper>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "space-between",
		paddingHorizontal: spacingY._20,
		paddingBottom: 7
	},
	formItems: {
        flex: 1,
        width: "100%",
		gap: spacingY._15,
		marginTop: spacingY._15
	},
	inputContainer: {
		gap: spacingY._10,
	},
	footerArea: {
		alignItems: "center",
		flexDirection: "row",
		justifyContent: "center",
		paddingHorizontal: spacingX._20,
		gap: scale(12),
		paddingTop: spacingY._15,
		marginBottom: spacingY._15,
		borderTopWidth: 1,
	},
	dropdownContainer: {
		height: verticalScale(54),
		borderWidth: 1,
        borderColor: BaseColors.neutral300,
		paddingHorizontal: spacingX._15,
		borderRadius: radius._15,
		borderCurve: "continuous",
	},
	dropdownListContainer: {
		borderRadius: radius._15,
		borderCurve: "continuous",
		paddingVertical: spacingY._7,
		top: 5,
		borderColor: BaseColors.neutral500,
		shadowColor: BaseColors.black,
		shadowOffset: { width: 0, height: 5 },
		shadowOpacity: 1,
		shadowRadius: 15,
		elevation: 5
	},
	dropdownItemContainer: {
		borderRadius: radius._15,
		marginHorizontal: spacingX._7
	},
	dropdownIcon: {
		height: verticalScale(30),
		tintColor: BaseColors.neutral300
	},
});