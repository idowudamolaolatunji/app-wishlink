import Button from "@/components/Button";
import Loading from "@/components/Loading";
import Rangebar from "@/components/Rangebar";
import ScreenHeader from "@/components/ScreenHeader";
import ScreenWrapper from "@/components/ScreenWrapper";
import Subscribe from "@/components/Subscribe";
import SubscribeCompleted from "@/components/SubscribeCompleted";
import Typography from "@/components/Typography";
import WishInsight from "@/components/WishInsight";
import { BaseColors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import useFetchData from "@/hooks/useFetchData";
import { useTheme } from "@/hooks/useTheme";
import { getFilePath } from "@/services/imageService";
import { processOneTimePayment } from "@/services/paymentService";
import { updateUser } from "@/services/userService";
import { calculatePercentage, formatCurrency, formatShortCurrency } from "@/utils/helpers";
import { verticalScale } from "@/utils/styling";
import { WishlistType } from "@/utils/types";
import { FlashList } from "@shopify/flash-list";
import * as Burnt from 'burnt';
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { orderBy, where } from "firebase/firestore";
import LottieView from "lottie-react-native";
import * as Icons from "phosphor-react-native";
import React, { useState } from "react";
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import ModalView from "react-native-modal";
import { usePaystack } from "react-native-paystack-webview";
import Animated, { FadeInDown } from "react-native-reanimated";

const isIOS = Platform.OS === "ios";

export default function WishlistScreen() {
	const router = useRouter();
    const { popup } = usePaystack();
    const { actions } = useAppContext();
	const { Colors, currentTheme } = useTheme();
    const { user, updateUserData } = useAuth();

    const [showModal, setShowModal] = useState({ subscribe: false, completed: false });
	const [refreshing, setRefreshing] = useState(false);
    const [payLoaing, setPayLoading] = useState(false);

    const discountPercentage = actions?.feeDiscountInPercentage;
    const oneTimeFee = actions?.oneTimeFee;
    const discountedAmount = oneTimeFee! * (1 - discountPercentage! / 100);
    const checkoutAmount = discountPercentage ? discountedAmount! : actions?.oneTimeFee!

    const { data, error, loading, refetch } = useFetchData<WishlistType>(
        "wishlists", user?.uid ? [where("uid", "==", user.uid), orderBy("created", "desc")] : [orderBy("created", "desc")]
    );
    const completed = data?.filter(list => list && list?.isCompleted);

    const handleRefresh = function() {
		setRefreshing(true);
		refetch();
    	setRefreshing(false);
	}

    const handleOpenWishlistDetail = function(item: WishlistType) {
        router.push({
            pathname: "/(modals)/wishlistDetailModal",
            params: {
                id: item?.id,
                slug: item?.slug,
            }
        });
    }

    const handleAddWishlist = function() {
        if(actions?.shouldPayOneTimeFee && !user?.isSubscribed) {
            setShowModal({ ...showModal, subscribe: true });
        } else {
            if(data?.length >= actions?.wishlistCreationLimit!) {
                Burnt.toast({ haptic: "error", title: `You cannot create more than ${actions?.wishlistCreationLimit} wishlists` })
            } else {
                router.push("/(modals)/createEditWishlistModal")
            }
        }
    }

    const handleOneTimePayment = function() {
        popup.newTransaction({
            email: user?.email!,
            amount: checkoutAmount,
            reference: `TNX_${Date.now()}`,
            onError: (err) => console.log("Error:", err),
            // onLoad: () => console.log("Webview Loaded!"),
            onCancel: () => Burnt.toast({ haptic: "error", title: "Payment Cancelled!" }),
            onSuccess: async (res) => {
                setPayLoading(true);
                const status = await processOneTimePayment(res.reference, user?.uid!, checkoutAmount);
                if(status.success) {
                    const res = await updateUser(user?.uid!, { isSubscribed: true })
                    if(res.success) {
                        updateUserData(user?.uid! as string)
                        setTimeout(() => {
                            setPayLoading(false);
                            setShowModal({ subscribe: false, completed: true });
                        }, 500);
                        
                        Burnt.toast({ haptic: "success", title: "Payment Successful!" });
                    }
                } else {
                    Burnt.toast({ haptic: "error", title: "Payment failed!, Please Contact Support" })
                }
            },
        });
    }

	return (
        <ScreenWrapper>
            <View style={styles.container}>
                <ScreenHeader title="My Wishlists" style={{ marginVertical: spacingY._10 }} />

                <View style={styles.insights}>
                    <WishInsight
                        title="Total Wishlists"
                        value={`${data?.length}`}
                        // icon={<Icons.ScrollIcon size={24}  weight="bold" color={BaseColors.white} />}
                        icon={<Icons.ScrollIcon size={24}  weight="bold" color="#1e40af" />}
                        iconbgColor="#dbeafe"
                    />
                    <WishInsight
                        title="Completed"
                        value={`${completed?.length}`}
                        // icon={<Icons.ListChecksIcon size={23} weight="bold" color={BaseColors.white} />}
                        icon={<Icons.ListChecksIcon size={23} weight="bold" color="#9f1239" />}
                        iconbgColor="#fce7f3"
                    />
                </View>

                <ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                    contentContainerStyle={styles.listContainer}
                    showsVerticalScrollIndicator={false}
                >
                    {loading && (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                            <Loading color={BaseColors[currentTheme == "light" ? "primaryLight" : "accentDarker"]} />
                        </View>
                    )}

                    {(!loading && error) && (
                        <View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                gap: spacingY._5,
                                marginTop: spacingY._60
                            }}
                        >
                            <Image
                                source={require("@/assets/images/icon-sad-face.png")}
                                style={{ width: verticalScale(110), height: verticalScale(110), }}
                                contentFit="cover"
                            />
                            <Typography
                                size={isIOS ? 16 : 18}
                                color={Colors.textLighter}
                                style={{ textAlign: "center", marginTop: spacingY._15 }}
                            >
                                Oops! Error loading...
                            </Typography>
                        </View>
                    )}

                    {(!loading && data.length > 0) && (
                        <FlashList
                            data={data}
                            renderItem={({ item, index }: { item: WishlistType; index: number; }) => (
                                <WishListComponent
                                    key={index}
                                    item={item}
                                    index={index}
                                    handleOpenDetails={() => {
                                        return handleOpenWishlistDetail(item)
                                    }}
                                />
                            )}
                        />
                    )}

                    {(!loading && data.length < 1) && (
                        <View
                            style={{
                                alignItems: "center",
                                justifyContent: "center",
                                gap: spacingY._5,
                                marginTop: spacingY._60
                            }}
                        >
                            <Image
                                source={require("@/assets/images/icon-list-empty.png")}
                                style={{ width: verticalScale(110), height: verticalScale(110), }}
                                contentFit="cover"
                            />
                            <Typography
                                size={isIOS ? 15 : 17}
                                color={Colors.textLighter}
                                style={{ textAlign: "center", marginTop: spacingY._15 }}
                            >
                                No wishlist yet! Click the floating + icon to create one
                            </Typography>
                        </View>
                    )}
                </ScrollView>
                
                <Button style={styles.floatingButton} onPress={handleAddWishlist}>
                    <Icons.PlusIcon
                        color={BaseColors.white}
                        weight="bold"
                        size={verticalScale(24)}
                    />
                </Button>
            </View>

            {/* COMPLETED PAYMENT */}
            <ModalView
                isVisible={showModal.completed}
                backdropOpacity={0.7}
                backdropTransitionInTiming={800}
                backdropTransitionOutTiming={500}
                onBackdropPress={() => setShowModal({ ...showModal, completed: false })}
            >
                <SubscribeCompleted
                    handleFinish={() => {
                        setShowModal({ ...showModal, completed: false });
                        router.push("/createEditWishlistModal");
                    }}
                />
            </ModalView>

            {/* ONE-TIME PAYMENT MODAL */}
            <ModalView
                isVisible={showModal.subscribe}
                backdropOpacity={0.7}
                backdropTransitionInTiming={800}
                backdropTransitionOutTiming={500}
            >
                <Subscribe
                    loading={payLoaing}
                    handlePay={handleOneTimePayment}
                />
                
                <Pressable
                    onPress={() => {
                        setShowModal({ ...showModal, subscribe: false })}
                    }
                    style={styles.closeButton}
                >
                    <Icons.XIcon size={verticalScale(isIOS ? 23 : 26)} color={BaseColors.white} weight="bold" />
                </Pressable>
            </ModalView>
        </ScreenWrapper>
	);
}


function WishListComponent({ item, index, handleOpenDetails }: { 
    item: WishlistType, index: number, handleOpenDetails: () => void;
}) {
	const { Colors } = useTheme();
    const percentage = calculatePercentage(item?.totalAmountReceived ?? 0, item?.totalGoalAmount ?? 0)


    return (
        <Animated.View entering={FadeInDown.delay(index * 70)}>
            <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.card, { backgroundColor: Colors.background200 }]}
                onPress={handleOpenDetails}
            >
                <Image
                    source={getFilePath(item?.image)}
                    contentFit="cover"
                    style={[styles.cardImage, { backgroundColor: Colors.background300 }]}
                />

                <View style={styles.cardDetails}>
                    <Typography
                        size={isIOS ? 20 : 23}
                        fontFamily="urbanist-bold"
                    >
                        {item?.title}
                    </Typography>

                    {item.description && (
                        <Typography textProps={{ numberOfLines: 1 }} color={Colors.textLighter}>{item.description}</Typography>
                    )}

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <View style={{ flexDirection: "row", gap: 3 }}>
                            <Icons.UsersThreeIcon size={22} color={Colors.textLighter} />
                            <Typography fontFamily="urbanist-medium" size={verticalScale(isIOS ? 17 : 20)} color={Colors.textLighter}>{item.totalContributors} Contributor{item?.totalContributors === 1 ? "" : "s"}</Typography>
                        </View>
                        <View style={{ flexDirection: "row", gap: 3 }}>
                            <Icons.GiftIcon size={22} color={Colors.textLighter} />
                            <Typography fontFamily="urbanist-medium" size={verticalScale(isIOS ? 17 : 20)} color={Colors.textLighter}>{item.totalWishItems} Wish{item?.totalWishItems === 1 ? "" : "es"}</Typography>
                        </View>
                    </View>

                    <Rangebar value={percentage} />

                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                        <Typography fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 17 : 20)} color={Colors.textLighter}>{percentage}% Raised</Typography>
                        {!item?.isCompleted ? (
                            <Typography fontFamily="urbanist-bold" size={verticalScale(isIOS ? 18 : 20.5)} color={BaseColors.primaryLight}>{item?.totalAmountReceived ? `${formatShortCurrency(item?.totalAmountReceived ?? 0)} / ${formatShortCurrency(item?.totalGoalAmount ?? 0)}` : formatCurrency(0)}</Typography>
                        ) : (
                            <View style={{ flexDirection: "row", alignItems: "center", gap: spacingX._5 }}>
                                <Typography fontFamily="urbanist-bold" size={verticalScale(isIOS ? 18 : 20.5)} color={BaseColors.primaryLight}>Completed</Typography>
                                <LottieView source={require("@/assets/lottie/popper-big.json")} loop autoPlay style={{ width: 24, height: 24, marginTop: -7 }} />
                            </View>
                        )}
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
}


const styles = StyleSheet.create({
	container: {
		position: "relative",
		flex: 1,
	},
    insights: {
        paddingHorizontal: spacingX._18,
        paddingTop: spacingY._15,
        paddingBottom: spacingY._5,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    listContainer: {
        padding: spacingY._20,
        paddingBottom: spacingY._60
    },
    card: {
        borderRadius: radius._10,
        // padding: spacingY._10,
        padding: spacingY._7,
        gap: spacingY._20,
        marginBottom: spacingY._15,
    },
    cardImage: {
        width: "100%",
        height: verticalScale(170),
        borderRadius: radius._10,
    },
    cardDetails: {
        gap: spacingY._10,
        // added
        padding: spacingY._7,
        paddingTop: spacingY._3,
    },
	floatingButton: {
		height: verticalScale(50),
		width: verticalScale(50),
		borderRadius: 100,
		position: "absolute",
		bottom: verticalScale(30),
		right: verticalScale(15),
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
})
