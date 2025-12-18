import { AppProvider } from "@/contexts/AppContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { NetworkProvider } from "@/contexts/NetworkContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import React, { useEffect, useState } from "react";
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ErrorBoundary } from "react-error-boundary";
import { View } from 'react-native';
import { PaystackProvider } from "react-native-paystack-webview";
import 'react-native-reanimated';
import ErrorFallback from "./error";

import { NotificationProvider } from "@/contexts/NotificationContext";
import { verticalScale } from "@/utils/styling";
import { Platform } from "react-native";
import { useNavigationMode } from 'react-native-navigation-mode';

import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
	handleNotification: async () => {
		return {
			shouldPlaySound: true,
			shouldSetBadge: true,
			shouldShowAlert: true,
			// shouldShowBanner: true,
			// shouldShowList: true,
		};
	},
});

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
	const { navigationMode } = useNavigationMode();
	const [sysNavigationHeight, setSysNavigationBarHeight] = useState(0)

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

	useEffect(function() {
		if(Platform.OS == "android" && navigationMode?.isGestureNavigation == false) {
			setSysNavigationBarHeight(navigationMode.navigationBarHeight || 0);
		}
	}, [navigationMode?.isGestureNavigation]);

	if (!loaded) {
		return null; // render nothing while fonts are loading
	}

	return (
		<ErrorBoundary
			FallbackComponent={ErrorFallback}
			onError={(error, info) => console.error("Global error caught:", error, info)}
		>
			<NotificationProvider>
				<NetworkProvider>
					<ThemeProvider>
						<AppProvider>
							<AuthProvider>
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
									<View style={{ flex: 1, paddingBottom: verticalScale(sysNavigationHeight - 4), }}>
										<Stack screenOptions={{ headerShown: false }}>
											<Stack.Screen name="index" />
											<Stack.Screen name="(modals)/profileEditModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/settingsModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/bankSetupModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/legalPoliciesModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/helpModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/wishlistDetailModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/wishItemDetailModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/transactionHistoryModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/transactionDetailsModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/contributorModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/createEditWishlistModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/createEditWishItemModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/seeMoreFeaturedWishlistsModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/boostWishlistModal" options={{ presentation: "modal" }} />
											<Stack.Screen name="(modals)/notificationModal" options={{ presentation: "modal" }} />

											<Stack.Screen name="(modals)/referralsModal" options={{ presentation: "formSheet" }} />
											<Stack.Screen name="(modals)/boostDetailsModal" options={{ presentation: "formSheet" }} />
											<Stack.Screen name="(modals)/withdrawalModal" options={{ presentation: "formSheet" }} />
											<Stack.Screen name="(modals)/deleteAccountModal" options={{ presentation: "formSheet" }} />
											<Stack.Screen name="(modals)/passwordChangeModal" options={{ presentation: "formSheet" }} />
										</Stack>
									</View>
								</PaystackProvider>
							</AuthProvider>
						</AppProvider>
					</ThemeProvider>
				</NetworkProvider>
			</NotificationProvider>
		</ErrorBoundary>
	);
}
