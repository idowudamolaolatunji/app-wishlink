import Typography from "@/components/Typography";
import { BaseColors, spacingX } from "@/constants/theme";
import { verticalScale } from "@/utils/styling";
import NetInfo from "@react-native-community/netinfo";
import { reloadAppAsync } from "expo";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Animated, Platform, StyleSheet, View } from "react-native";

interface NetworkContextType {
	isConnected: boolean;
}

const NetworkContext = createContext<NetworkContextType>({ isConnected: true });

export const NetworkProvider = ({ children }: { children: React.ReactNode }) => {
	const [isConnected, setIsConnected] = useState(true);
	const [showReconnected, setShowReconnected] = useState(false);
	const fadeAnim = useRef(new Animated.Value(0)).current;
	const slideAnim = useRef(new Animated.Value(-100)).current;
	const wasDisconnected = useRef(false);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener((state: any) => {
			const connected = !!state.isConnected;
			if (!connected) {
				wasDisconnected.current = true;
			}

			setIsConnected(connected);

			if (!connected) {
				// Show offline banner
				setShowReconnected(false);
				Animated.parallel([
					Animated.timing(fadeAnim, {
						toValue: 1,
						duration: 400,
						useNativeDriver: true,
					}),
					Animated.spring(slideAnim, {
						toValue: 0,
						tension: 65,
						friction: 8,
						useNativeDriver: true,
					}),
				]).start();
			} else if (wasDisconnected.current) {
				// reload app
				reloadAppAsync();

				// others
				setShowReconnected(true);
				Animated.parallel([
					Animated.timing(fadeAnim, {
						toValue: 1,
						duration: 300,
						useNativeDriver: true,
					}),
					Animated.spring(slideAnim, {
						toValue: 0,
						tension: 65,
						friction: 8,
						useNativeDriver: true,
					}),
				]).start();
                
				setTimeout(() => {
					Animated.parallel([
						Animated.timing(fadeAnim, {
							toValue: 0,
							duration: 300,
							useNativeDriver: true,
						}),
						Animated.timing(slideAnim, {
							toValue: -100,
							duration: 300,
							useNativeDriver: true,
						}),
					]).start(() => {
						wasDisconnected.current = false;
					});
				}, 2000);
			}
		});

		return () => unsubscribe();
	}, [fadeAnim, slideAnim]);

	return (
		<NetworkContext.Provider value={{ isConnected }}>
			{children}

			<Animated.View
				style={[
					styles.banner,
					{
						backgroundColor: showReconnected ? "#10B981" : BaseColors.rose,
						opacity: fadeAnim,
						transform: [{ translateY: slideAnim }],
					},
				]}
				pointerEvents="none"
			>
				<View style={styles.content}>
					<View style={styles.iconContainer}>
						<Typography size={verticalScale(20)} color={BaseColors.white}>
							{showReconnected ? "✓" : "⚠"}
						</Typography>
					</View>
					<View style={styles.textContainer}>
						<Typography color={BaseColors.white} size={verticalScale(18)} fontFamily={"urbanist-extrabold"} style={{ marginBottom: 2 }}>
							{showReconnected ? "Back Online" : "No Internet Connection"}
						</Typography>
						<Typography color="rgba(255, 255, 255, 0.9)" size={verticalScale(14)} fontFamily="urbanist-medium">
							{showReconnected ? "Your connection has been restored" : "Please check your network settings"}
						</Typography>
					</View>
				</View>
			</Animated.View>
		</NetworkContext.Provider>
	);
};

const styles = StyleSheet.create({
	banner: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 9999,
		paddingTop: verticalScale(Platform.OS === "ios" ? 50 : 30),
		paddingBottom: verticalScale(16),
		paddingHorizontal: verticalScale(18),
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 8,
	},
	content: {
		flexDirection: "row",
		alignItems: "center",
		gap: spacingX._12,
	},
	iconContainer: {
		width: verticalScale(36),
		height: verticalScale(36),
		borderRadius: 100,
		backgroundColor: "rgba(255, 255, 255, 0.2)",
		alignItems: "center",
		justifyContent: "center",
	},
	textContainer: {
		flex: 1,
	},
});

export const useNetwork = () => useContext(NetworkContext);
