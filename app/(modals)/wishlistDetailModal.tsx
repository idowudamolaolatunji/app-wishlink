import BackButton from "@/components/BackButton";
import BackdropOverlay from "@/components/BackdropOverlay";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import ConfettiEL from "@/components/ConfettiEL";
import DeleteItem from "@/components/DeleteItem";
import Loading from "@/components/Loading";
import ModalWrapper from "@/components/ModalWrapper";
import QrCode from "@/components/QrCode";
import Rangebar from "@/components/Rangebar";
import ScreenHeader from "@/components/ScreenHeader";
import Typography from "@/components/Typography";
import WishInsight from "@/components/WishInsight";
import { BaseColors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import useFetchData from "@/hooks/useFetchData";
import { useTheme } from "@/hooks/useTheme";
import { deleteWishlist } from "@/services/wishlistServices";
import { calculatePercentage, formatCurrency, formatShortCurrency } from "@/utils/helpers";
import { scale, verticalScale } from "@/utils/styling";
import { WishItemType, WishlistType } from "@/utils/types";
import * as Burnt from "burnt";
import { Image, ImageBackground } from "expo-image";
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from "expo-router";
import { limit, where } from "firebase/firestore";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, RefreshControl, ScrollView, Share, StyleSheet, TouchableOpacity, View } from "react-native";
import ModalView from "react-native-modal";
import Animated, { FadeInDown, useSharedValue } from "react-native-reanimated";

const isIOS = Platform.OS === "ios";

export default function wishlistDetailModal() {
    const params: { id?: string, slug: string, isnew?: string } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const { actions } = useAppContext();
    const { Colors, currentTheme } = useTheme();
    const [showOptionsMenu, setShowOptionsMenu] = useState(false);
    const [loading, setLoading] = useState({ delete: false, share: false });
    const [showConfetti, setShowConfetti] = useState(false);
    const [showQr, setShowQr] = useState(false);
	const [refreshing, setRefreshing] = useState(false);

    const isOpen = useSharedValue(false);
    const toggleSheet = function() {
        setShowOptionsMenu(false);
        isOpen.value = !isOpen.value;
    };

    const slug = params?.slug;
    const { data, error, loading: mainLoading, refetch: refetchWishlist } = useFetchData<WishlistType>(
        "wishlists", 
        (user?.uid && slug) ? [where("uid", "==", user.uid), where("slug", "==", slug), limit(1)] : [],
    );
    const wishlist = data[0] as WishlistType;
    const percentage = calculatePercentage(wishlist?.totalAmountReceived ?? 0, wishlist?.totalGoalAmount ?? 0);

    const handleRefresh = function() {
		setRefreshing(true);
		refetchWishlist();
    	setRefreshing(false);
	}

    // THIS IS WHERE WE SHARE THE WISH ITEMS
    const handleShare = async function() {
        if(wishlist?.isCompleted) return Burnt.toast({ haptic: "error", title: `Cannot share a "Wishlist" with all completed wishes` })
        setLoading({ ...loading, share: true });
        try {
            await Share.share({
                // message: `Check my Wishlist: \n\n${wishlist?.title} \n\n${wishlist.link}`,
                message: `Abeg 🥹 help me acheive my wishlist, ${wishlist?.title} \n\n${wishlist.link}`,
                url: `${wishlist.link}`, // iOS only
                title: 'Share Wishlist', // Android only
            });
            
            setLoading({ ...loading, share: false });
        } catch (error) {
            return error;
        }
    };

    // CREATE ACTION TO GO TO THE CREATE WISHITEM PAGE WITH WISHLIST ID AND WISHLIST SLUG, ALSO CHECKING IF LIMIT IS EXCEEDED
    const handleCreateAction = function() {
        if((wishlist?.wishes ?? [])?.length >= actions?.wishitemCreationLimit!) {
            Burnt.toast({ haptic: "error", title: `You cannot create more than ${actions?.wishitemCreationLimit} wishes in a wishlist` })
        } else {
            router.push({
                pathname: "/(modals)/createEditWishItemModal",
                params: { wishlistId: wishlist?.id }
            })
        }
    }

    // EDIT ACTION TO GO TO THE EDIT PAGE WITH SOME PARAMS
    const handleEditAction = function() {
        setShowOptionsMenu(false);

        if(wishlist?.isCompleted) {
            Burnt.toast({ haptic: "error", title: `You cannot "Edit" a completed "Wishlist"` })
        } else {
            router.push({
                pathname: "/(modals)/createEditWishlistModal",
                params: {
                    id: wishlist?.id,
                    title: wishlist?.title,
                    image: wishlist?.image,
                    description: wishlist?.description,
                }
            })
        }
    }

    const handleDeleteAction = function() {
        setShowOptionsMenu(false);
        if(wishlist?.isCompleted) {
            Burnt.toast({ haptic: "error", title: `You cannot "Delete" a completed "Wishlist"` });
        } else toggleSheet();
    }

    // HANDLE DELETE A WISHLIST, AND EFFECTIVELY GOING BACK TO THE WISHLISTS LIST PAGE
    const handleDelete = async function() {
        if(!wishlist?.id) return;
        setLoading({ ...loading, delete: true });

        try {
            router.dismissTo({ pathname: "/(tabs)/wishlist" });
            const res = await deleteWishlist(wishlist?.id!);
            if(!res.success) throw new Error(res?.msg);
            Burnt.toast({ haptic: "success", title: "Successful!" });

        } catch(err: any) {
            Burnt.toast({ haptic: "error", title: err?.message });
        } finally {
            setLoading({ ...loading, delete: false });
        }
    }

    // CHECK IF IT'S A NEW WISH ITEM TO SHOW CONFETTI
    useEffect(function() {
        if(params?.isnew == "true" && actions?.shouldDisplayConfetti) {
            setShowConfetti(true);
        }
    }, [params?.isnew]);

	return (
		<ModalWrapper>
            {/* CONFETTI DISPLAY */}
            {showConfetti && <ConfettiEL />}

            <ScrollView
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                    />
                }
                bounces={false}
                overScrollMode="never" // default, always, never
                nestedScrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.container}
            >                
                <View
                    style={{
                        position: "absolute",
                        top: verticalScale(10),
                        left: verticalScale(10),
                        right: verticalScale(32),
                        zIndex: 1,
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <ScreenHeader leftElement={<BackButton />} />

                    <TouchableOpacity onPress={() => setShowOptionsMenu(true)}
                        style={{
                            width: verticalScale(20),
                            height: verticalScale(30),
                            backgroundColor:
                            BaseColors.neutral600,
                            borderRadius: radius._6,
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <Icons.DotsThreeOutlineVerticalIcon size={verticalScale(28)} color={BaseColors.white} weight="fill" />
                    </TouchableOpacity>
                </View>

                {showOptionsMenu && (
                    <React.Fragment>
                        <BackdropOverlay handleClose={() => setShowOptionsMenu(false)} />
                        <View 
                            style={{
                                position: "absolute",
                                top: verticalScale(15),
                                right: verticalScale(36),
                                zIndex: 105,
                                backgroundColor: Colors.background200,
                                padding: spacingY._5,
                                borderRadius: radius._6,
                            }}
                        >
                            <TouchableOpacity onPress={handleEditAction} style={{ paddingHorizontal: spacingY._20, paddingVertical: spacingY._10, borderBottomWidth: 1, borderBottomColor: BaseColors.neutral600 }}>
                                <Typography fontFamily="urbanist-semibold" size={isIOS ? 18 : 20}>Edit</Typography>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {}} style={{ paddingHorizontal: spacingY._20, paddingVertical: spacingY._10, borderBottomWidth: 1, borderBottomColor: BaseColors.neutral600, flexDirection: "row", gap: spacingX._5, alignItems: "center" }}>
                                <Typography fontFamily="urbanist-semibold" size={isIOS ? 18 : 20}>Boost</Typography>
                                <Icons.RocketLaunchIcon color={Colors.text} weight="bold" size={verticalScale(24)} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handleDeleteAction} style={{ paddingHorizontal: spacingY._20, paddingVertical: spacingY._10 }}>
                                <Typography fontFamily="urbanist-semibold" size={isIOS ? 18 : 20}>Delete</Typography>
                            </TouchableOpacity>
                        </View>
                    </React.Fragment>
                )}

                {mainLoading && (
                    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                        <Loading color={BaseColors[currentTheme == "light" ? "primaryLight" : "accentDarker"]} />
                    </View>
                )}

                {(!mainLoading && error) && (
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

                {(!mainLoading && wishlist.title) && (
                    <React.Fragment>
                        <ImageBackground
                            source={wishlist?.image}
                            style={styles.displayTop}
                        >
                            <LinearGradient
                                colors={['transparent', 'rgba(0,0,0,0.8)']}
                                style={{ flex: 1, justifyContent: 'flex-end', padding: spacingY._20, gap: spacingY._5 }}
                            >
                                <Typography
                                    size={isIOS ? 21 : 24}
                                    fontFamily="urbanist-bold"
                                    color={BaseColors.white}
                                >
                                    {wishlist?.title}
                                </Typography>

                                {wishlist?.description && (
                                    <Typography color={Colors.neutral300} textProps={{ numberOfLines: 2 }}>
                                        {wishlist?.description ?? "--"}
                                    </Typography>
                                )}
                            </LinearGradient>
                        </ImageBackground>

                        {/* wishlist details */}
                        <View style={styles.displayDetails}>

                            <View style={[styles.progressCard, { backgroundColor: Colors.cardBackground }]}>
                                <View style={styles.flexRow}>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 17 : 19)} color={Colors.text}>
                                        Overall Progress
                                    </Typography>
                                    <Typography fontFamily="urbanist-bold" size={verticalScale(isIOS ? 18 : 20.5)} color={BaseColors.primaryLight}>
                                        {wishlist?.totalAmountReceived ? `${formatShortCurrency(wishlist?.totalAmountReceived ?? 0)} / ${formatShortCurrency(wishlist?.totalGoalAmount ?? 0)}` : formatCurrency(0)}
                                    </Typography>
                                </View>

                                <Rangebar value={percentage} />
                                
                                <Typography fontFamily="urbanist-medium" size={verticalScale(isIOS ? 17 : 19)} color={Colors.neutral500}>{percentage}% funded by {wishlist?.totalContributors ?? 0} contributor{wishlist?.totalContributors === 1 ? "" : "s"}</Typography>
                            </View>

                            {(wishlist?.totalWishItems && wishlist?.totalWishItems > 0) ? (
                                <View style={{ alignItems: "center", flexDirection: "row", justifyContent: "center", gap: scale(12) }}>
                                    <Button onPress={handleShare} disabled={loading.share} style={{ flexDirection: "row", alignItems: "center", gap: spacingY._5, backgroundColor: BaseColors.accentDarker, flex: 1 }}>
                                        {loading.share ? (
                                            <Loading color={BaseColors.neutral700} />
                                        ) : (
                                            <React.Fragment>
                                                <Typography size={isIOS ? 20 : 22} color={BaseColors.neutral800} fontFamily="urbanist-semibold">
                                                    Share Link
                                                </Typography>
            
                                                <Icons.ShareFatIcon color={BaseColors.neutral800} weight="bold" size={verticalScale(24)} />
                                            </React.Fragment>
                                        )}
                                    </Button>

                                    <Button
                                        onPress={() => setShowQr(true)}
                                        style={{
                                            backgroundColor: Colors[currentTheme == "dark" ? "background300" : "background200"],
                                            paddingHorizontal: spacingX._15,
                                        }}
                                    >
                                        <Icons.QrCodeIcon color={Colors.text} weight="bold" size={verticalScale(24)} />
                                    </Button>
                                </View>
                            ) : (
                                null
                            )}

                            {/* insights cards */}
                            <View style={styles.insights}>
                                <WishInsight
                                    title="Total Wishes"
                                    value={`${wishlist?.totalWishItems ?? 0}`}
                                    icon={<Icons.GiftIcon size={24} weight="bold" color={BaseColors.neutral800} />}
                                />
                                <WishInsight
                                    title="Contributors"
                                    value={`${wishlist?.totalContributors ?? 0}`}
                                    icon={<Icons.UsersThreeIcon size={24} weight="bold" color={BaseColors.white} />}
                                    iconbgColor={"#CFADC1"}
                                />
                            </View>

                            {/* wish items top */}
                            <View style={[styles.flexRow, { marginVertical: spacingY._7, marginTop: spacingY._15, }]}>
                                <Typography size={isIOS ? 20 : 23} fontFamily="urbanist-semibold">Your Wishes</Typography>
        
                                <TouchableOpacity
                                    activeOpacity={0.75}
                                    style={styles.addWishBtn}
                                    onPress={handleCreateAction}
                                >
                                    <Icons.PlusIcon
                                        weight="bold"
                                        color={BaseColors.white}
                                        size={verticalScale(22)}
                                    />

                                    <Typography color={BaseColors.white} fontFamily="urbanist-semibold">Add</Typography>
                                </TouchableOpacity>
                            </View>

                            <View style={{ gap: spacingY._12, flex: 1, marginBottom: spacingY._20, marginTop: spacingY._5 }}>
                                {(wishlist?.wishes && wishlist?.wishes?.length > 0) ? (
                                    <React.Fragment>
                                        {wishlist?.wishes?.map((item, index) => (
                                            <WishItem item={item} index={index} key={index} />
                                        ))}
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <Typography
                                            size={isIOS ? 15 : 17}
                                            color={BaseColors.neutral600}
                                            style={{ textAlign: "center", marginTop: spacingY._25 }}
                                        >
                                            No Wishitem yet! Click the add button to create
                                        </Typography>
                                    </React.Fragment>
                                )}
                            </View>
                        </View>
                    </React.Fragment>
                )}
            </ScrollView>

            {/*  */}
            <ModalView
                isVisible={showQr}
                backdropOpacity={0.7}
                backdropTransitionInTiming={800}
                backdropTransitionOutTiming={500}
                onBackdropPress={() => setShowQr(false)}
            >
                <View style={{ alignItems: "center", gap: spacingY._10 }}>
                    <Typography size={verticalScale(Platform.OS == "ios" ? 27 : 30)} color={BaseColors.white} fontFamily="urbanist-bold">Scan your QR Code</Typography>
                    <QrCode link={wishlist?.link!} />
                    <View style={{ alignItems: "center", flexDirection: "row", gap: spacingX._15, }}>
                        <Pressable onPress={() => setShowQr(false)} style={styles.closeButton}>
                            <Icons.XIcon size={verticalScale(isIOS ? 23 : 26)} color={BaseColors.white} weight="bold" />
                        </Pressable>
                        <Pressable onPress={handleShare} style={styles.closeButton}>
                            {loading.share ? <Loading color={BaseColors.white} /> : 
                                <Icons.ShareFatIcon size={verticalScale(isIOS ? 23 : 26)} color={BaseColors.white} weight="bold" />
                            }
                        </Pressable>
                    </View>
                </View>
            </ModalView>

            {/* BOTTOM SHEET FOR DELETE WISHLIST */}
            <BottomSheet isOpen={isOpen} toggleSheet={toggleSheet} customHeight={verticalScale(350)}>
                <ScreenHeader title='Delete this Wishlist' leftElement={<BackButton iconType="cancel" customAction={toggleSheet} />} style={{ marginBottom: spacingY._10 }} />
            
                <DeleteItem
                    text="Are you sure you want to delete wishlist? note that everything that relates with this wishlist will be deleted including the wishitems and the transtion"
                    handleClose={toggleSheet}
                    loading={loading.delete}
                    handleDelete={handleDelete}
                />
            </BottomSheet>
		</ModalWrapper>
	);
}


function WishItem({ item, index }: { item: WishItemType, index: number }) {
    const { Colors } = useTheme();
    const router = useRouter();
    const percentage = calculatePercentage(item?.amountReceived ?? 0, item?.goalAmount ?? 0);

    return (
        <Animated.View entering={FadeInDown.delay(index * 70)}>
            <TouchableOpacity
                activeOpacity={0.8}
                style={[styles.itemCard, { backgroundColor: Colors.cardBackground, opacity: (item?.isCompleted || !item?.active) ? 0.8 : 1 }]}
                onPress={() => router.push({
                    pathname: "/(modals)/wishItemDetailModal",
                    params: { slug: item?.slug, title: item?.title, id: item.id },
                })}
            >
                <View style={styles.itemImageContainer}>
                    <Image
                        contentFit="cover"
                        source={item?.image}
                        style={{
                            height: verticalScale(100),
                            width: verticalScale(80),
                            borderRadius: radius._6,
                            backgroundColor: Colors.background300,
                        }}
                    />
                </View>

                <View style={styles.itemDetails}>
                    <Typography size={isIOS ? 20 : 23} fontFamily="urbanist-bold">
                        {item?.title}
                    </Typography>

                    <Typography fontFamily="urbanist-bold" size={verticalScale(isIOS ? 19 : 22)} color={BaseColors.primaryLight}>
                        {formatCurrency(item?.goalAmount ?? 0)}
                    </Typography>
                    <Rangebar value={percentage} height={5} />

                    <View style={styles.flexRow}>
                        <Typography fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 17 : 19)} color={Colors.textLighter}>
                            {item?.isCompleted ? "Completed 🎉" : (
                                <>{percentage ?? 0}% Funded</>
                            )}
                        </Typography>

                        <View style={{ flexDirection: "row", gap: 3 }}>
                            <Icons.UsersThreeIcon size={verticalScale(20)} color={Colors.textLighter} />
                            <Typography fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 17 : 19)} color={Colors.textLighter}>
                                {item?.contributorCount} Contributor{item?.contributorCount === 1 ? "" : "s"}
                            </Typography>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        </Animated.View>
    )
}


const styles = StyleSheet.create({
	container: {
		// flex: 1,
        minHeight: "100%",
        position: "relative",
	},
    displayTop: {
        height: scale(200),
        width: "100%",
    },
    displayDetails: {
        flex: 1,
        padding: spacingY._20,
        gap: spacingY._15,
    },
    progressCard: {
        padding: spacingY._10,
        borderRadius: radius._10,
        gap: spacingY._10,
    },
    insights: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    flexRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
    addWishBtn: {
        // width: verticalScale(34),
        // height: verticalScale(34),
        minHeight: verticalScale(20),
        padding: spacingX._5,
        gap: spacingX._5,
        backgroundColor: BaseColors.primaryLight,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius._6,
    },
    itemCard: {
        padding: spacingY._7,
        borderRadius: radius._10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: spacingX._12,
    },
    itemImageContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    itemDetails: {
        flex: 1,
        gap: spacingY._7,
    },
    closeButton: {
        width: verticalScale(50),
        height: verticalScale(50),
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: BaseColors.neutral800,
        borderRadius: 70,
        alignSelf: "center",
    },
});
