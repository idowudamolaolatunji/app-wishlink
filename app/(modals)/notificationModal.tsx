import BackButton from "@/components/BackButton";
import Loading from "@/components/Loading";
import ModalWrapper from "@/components/ModalWrapper";
import NotificationItem from "@/components/NotificationItem";
import ScreenHeader from "@/components/ScreenHeader";
import Typography from "@/components/Typography";
import { BaseColors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import useFetchData from "@/hooks/useFetchData";
import { useTheme } from "@/hooks/useTheme";
import { markAllNotificationAsRead } from "@/services/notificationServices";
import { scale } from "@/utils/styling";
import { NotificationType } from "@/utils/types";
import { FlashList } from "@shopify/flash-list";
import { useRouter } from "expo-router";
import { limit, orderBy, where } from "firebase/firestore";
import React, { useState } from "react";
import { Image, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";


export default function NotificationModal() {
    const { user } = useAuth();
    const router = useRouter();
    const { Colors } = useTheme();
    const { countNotifications } = useNotification();

    const [activeTab, setActiveTab] = useState("unread");
    const [refreshing, setRefreshing] = useState(false);

    const { data: notifications, loading, refetch: refetchNotifications } = useFetchData<NotificationType>(
        "notifications", (user?.uid) ? [where("uid", "==", user?.uid), orderBy("createdAt", "desc"), limit(50)] : [],
    );
    const unreadNotifications = notifications?.filter((notification) => !notification?.read);
    const readNotifications = notifications?.filter((notification) => notification?.read);

	const handleRefresh = function() {
		setRefreshing(true);
		refetchNotifications();
    	setRefreshing(false);
	}

    const handleReadAll = async function() {
        router?.back();

        if(unreadNotifications?.length > 0) {
            await markAllNotificationAsRead(user?.uid!);
            countNotifications();
        }
    }

    const handleClick = function(item: NotificationType) {
        router.replace({ pathname: "/(modals)/contributorModal", params: { refId: item?.referenceToID } })
        if(unreadNotifications?.length > 0) {
            handleReadAll();
        }
    }

	return (
		<ModalWrapper>
			<View style={styles.container}>
				<ScreenHeader title="Notifications" leftElement={<BackButton iconType="cancel" customAction={handleReadAll} />} style={{ marginBottom: spacingY._10 }} />

				<ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                >
                    {loading && <Loading />}

                    {(!loading && notifications?.length > 0) && (
                        <View style={{ gap: spacingY._10 }}>
                            <View style={[styles.tabs]}>
                                <Pressable onPress={() => setActiveTab("unread")} style={[styles.tab, { backgroundColor: Colors[activeTab == "unread" ? "primaryLight" : "background200"] }]}>
                                    <Typography fontFamily="urbanist-semibold" color={activeTab == "unread" ? BaseColors.white : Colors.text}>Unread</Typography>
                                </Pressable>
                                <Pressable onPress={() => setActiveTab("read")} style={[styles.tab, { backgroundColor: Colors[activeTab == "read" ? "primaryLight" : "background200"] }]}>
                                    <Typography fontFamily="urbanist-semibold" color={activeTab == "read" ? BaseColors.white : Colors.text}>Read</Typography>
                                </Pressable>
                            </View>

                            <View style={styles.list}>
                                <FlashList
                                    data={activeTab == "read" ? readNotifications : unreadNotifications}
                                    renderItem={({ item, index }) => (
                                        <NotificationItem key={index} item={item as NotificationType} index={index} handleClick={handleClick} />
                                    )}
                                    {...({ estimatedItemSize: 60 } as any)}
                                />
                            </View>
                        </View>
                    )}

                    {(!loading && (notifications?.length < 1 || (activeTab == "read" && readNotifications?.length < 1) || (activeTab == "unread" && unreadNotifications?.length < 1))) && (
                        <View style={{ marginTop: spacingY._35, gap: spacingY._15, alignItems: "center" }}>
                            <Image
                                source={require("@/assets/images/icon-notification.png")}
                                resizeMode="contain"
                                style={{ height: scale(100), opacity: 0.7 }}
                            />
                            
                            <Typography
                                size={17}
                                color={Colors.textLighter}
                                style={{ textAlign: "center" }}
                                fontFamily="urbanist-medium"
                            >
                                No "{activeTab}" notification yet!
                            </Typography>
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
    list: {
        minHeight: 3,
        marginTop: spacingY._20,
        paddingBottom: spacingY._15
    },
    tabs: {
        width: "90%",
        flexDirection: "row",
        alignSelf: "center",
        alignItems: "center",
        marginTop: spacingY._10,
        justifyContent: "space-between",
        padding: spacingX._5,
    },
    tab: {
        padding: spacingX._5, 
        paddingVertical: spacingY._10,
        width: "50%",
        alignItems: "center",   
        borderRadius: radius._3     
    }
});
