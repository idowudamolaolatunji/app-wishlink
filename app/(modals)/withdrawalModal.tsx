import BackButton from "@/components/BackButton";
import ModalWrapper from "@/components/ModalWrapper";
import ScreenHeader from "@/components/ScreenHeader";
import { spacingY } from "@/constants/theme";
import React from "react";
import { StyleSheet, View } from "react-native";

export default function WithdrawalModal() {
	return (
		<ModalWrapper>
			<View style={styles.container}>
				<ScreenHeader title="Withdraw funds" leftElement={<BackButton iconType="cancel" />} style={{ marginBottom: spacingY._10 }} />

				
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
});
