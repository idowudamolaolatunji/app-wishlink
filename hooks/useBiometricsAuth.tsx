import * as Burnt from "burnt";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

export function useBiometricAuth() {
	const [isBiometricSupported, setIsBiometricSupported] = useState(false);
	const [isEnrolled, setIsEnrolled] = useState(false);

	useEffect(function() {
		checkBiometricSupport();
	}, []);

	const checkBiometricSupport = async function() {
		const compatible = await LocalAuthentication.hasHardwareAsync();
		setIsBiometricSupported(compatible);

		if (compatible) {
			const enrolled = await LocalAuthentication.isEnrolledAsync();
			setIsEnrolled(enrolled);
		}
	};

	const authenticate = async function() {
		try {
			const result = await LocalAuthentication.authenticateAsync({
				promptMessage: "Authenticate Wishers",
				fallbackLabel: "Use Password",
				disableDeviceFallback: false,
			});
			if(!result?.success) {
				Burnt.toast({ haptic: "error", title: "Authentication canceled" })
				return false
			};

			return result.success;
		} catch (error) {
			return false;
		}
	};

	const saveBiometricPreference = async function(enabled: boolean) {
		await SecureStore.setItemAsync("biometric_enabled", enabled.toString());
	};

	const getBiometricPreference = async function() {
		const enabled = await SecureStore.getItemAsync("biometric_enabled");
		return enabled === "true";
	};

	return {
		isBiometricSupported,
		isEnrolled,
		authenticate,
		saveBiometricPreference,
		getBiometricPreference,
	};
};
