import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import React, { useEffect } from "react";
import { PaystackProvider } from "react-native-paystack-webview";
import 'react-native-reanimated';


export default function RootLayout() {
	const [loaded] = useFonts({
		"raleway": require("../assets/fonts/Raleway-regular.ttf"),
		"urbanist-light": require("../assets/fonts/urbanist/Urbanist-Light.ttf"),
		"urbanist-regular": require("../assets/fonts/urbanist/Urbanist-Regular.ttf"),
		"urbanist-medium": require("../assets/fonts/urbanist/Urbanist-Medium.ttf"),
		"urbanist-semibold": require("../assets/fonts/urbanist/Urbanist-SemiBold.ttf"),
		"urbanist-bold": require("../assets/fonts/urbanist/Urbanist-Bold.ttf"),
		"urbanist-extrabold": require("../assets/fonts/urbanist/Urbanist-ExtraBold.ttf"),
	});

	useEffect(function() {
		if(loaded) {
			SplashScreen.hideAsync();
		}
	}, [loaded]);

	return (
		<AppProvider>
			<AuthProvider>
				<ThemeProvider>
					<PaystackProvider
						debug
						currency="NGN"
						defaultChannels={[
							"bank_transfer",
							"card",
							"ussd",
						]}
						publicKey={process.env.EXPO_PUBLIC_PAYSTACK_PUBLIC_KEY!}
					>
						<Stack screenOptions={{ headerShown: false }}>
							<Stack.Screen name="index" />
							<Stack.Screen name="(modals)/profileEditModal" options={{ presentation: "modal" }} />
							<Stack.Screen name="(modals)/settingsModal" options={{ presentation: "modal" }} />
							<Stack.Screen name="(modals)/bankSetupModal" options={{ presentation: "modal" }} />
							<Stack.Screen name="(modals)/legalPoliciesModal" options={{ presentation: "modal" }} />
							<Stack.Screen name="(modals)/faqModal" options={{ presentation: "modal" }} />
							<Stack.Screen name="(modals)/referralsModal" options={{ presentation: "modal" }} />
							<Stack.Screen name="(modals)/wishlistDetailModal" options={{ presentation: "modal" }} />
							<Stack.Screen name="(modals)/wishItemDetailModal" options={{ presentation: "modal" }} />
							<Stack.Screen name="(modals)/transactionModal" options={{ presentation: "modal" }} />
							<Stack.Screen name="(modals)/createEditWishlistModal" options={{ presentation: "modal" }} />
							<Stack.Screen name="(modals)/createEditWishItemModal" options={{ presentation: "modal" }} />

							<Stack.Screen name="(modals)/notificationModal" options={{ presentation: "formSheet" }} />
							<Stack.Screen name="(modals)/withdrawalModal" options={{ presentation: "formSheet" }} />
							<Stack.Screen name="(modals)/deleteAccountModal" options={{ presentation: "formSheet" }} />
							<Stack.Screen name="(modals)/passwordChangeModal" options={{ presentation: "formSheet" }} />
						</Stack>
					</PaystackProvider>
				</ThemeProvider>
			</AuthProvider>
		</AppProvider>
	);
}
