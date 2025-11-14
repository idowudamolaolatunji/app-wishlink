import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import ConfettiEL from "@/components/ConfettiEL";
import ContributionList from "@/components/ContributionList";
import Loading from "@/components/Loading";
import ModalWrapper from "@/components/ModalWrapper";
import Rangebar from "@/components/Rangebar";
import ScreenHeader from "@/components/ScreenHeader";
import Typography from "@/components/Typography";
import { BaseColors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import useFetchData from "@/hooks/useFetchData";
import { useTheme } from "@/hooks/useTheme";
import { getFilePath } from "@/services/imageService";
import { calculatePercentage, formatCurrency } from "@/utils/helpers";
import { scale, verticalScale } from "@/utils/styling";
import { ContributorType, WishItemType } from "@/utils/types";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { limit, where } from "firebase/firestore";
import LottieView from "lottie-react-native";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";
import ImageView from "react-native-image-viewing";


const isIOS = Platform.OS === "ios";

export default function wishItemDetailModal() {
    const router = useRouter();
    const { user } = useAuth();
    const { actions } = useAppContext()
    const { Colors, currentTheme } = useTheme();

    // ROUTE PARAMS DATA COMING FROM PARENT COMPONENT
    const params: {
        id?: string;
        slug: string;
        title: string;
        isnew?: string;
    } = useLocalSearchParams();

    const [visible, setVisible] = useState(false);
    const [imageIndex, setImageIndex] = useState<number | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { data, error, loading: mainLoading, refetch: refetchWish } = useFetchData<WishItemType>(
        "wishitems", 
        (user?.uid && params?.slug) ? [where("uid", "==", user.uid), where("slug", "==", params?.slug), limit(1)] : [],
    );
    const item = data[0] as WishItemType;
    const percentage = calculatePercentage(item?.amountReceived ?? 0, item?.goalAmount ?? 0);

    const { data: contributors, loading: contributorLoading, refetch: refetchContributor } = useFetchData<ContributorType>(
        "contributors", (user?.uid && params?.id) ? [where("uid", "==", user?.uid), where("wishId", "==", params?.id)] : [],
    );

    const handleRefresh = function() {
		setRefreshing(true);
		refetchWish();
		refetchContributor();
    	setRefreshing(false);
	}
    
    // GETTTING THE IMAGE URI PART HERE FOR THE ZOOMED DISPLAY
    const images = item?.images?.map((image: any) => ({
        uri: getFilePath(image)
    })) || [];

    // EDIT ACTION TO GO TO THE EDIT PAGE WITH SOME PARAMS
    const handleEditAction = function() {
        router.push({
            pathname: "/(modals)/createEditWishItemModal",
            params: {
                id: item?.id,
                title: item?.title,
                images: item?.images,
                description: item?.description,
                goalAmount: item?.goalAmount,
                amountReceived: item?.amountReceived,
                wishlistId: item?.wishlistId,
                isCompleted: `${item?.isCompleted}`
            }
        })
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

			<View style={styles.container}>
				<ScreenHeader title={item?.title} leftElement={<BackButton />} style={{ marginBottom: spacingY._5 }} />

				<ScrollView
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                        />
                    }
                    bounces={false}
                    overScrollMode="never" // default, always, never
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingTop: spacingY._20 }}
                >
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

                    {(!mainLoading && data) && (
                        <React.Fragment>
                            <View style={styles.displayDetails}>
                                {item?.images?.length > 0 && (
                                    <View style={styles.imagesGrid}>
                                        {item?.images?.map((image: any, i: number) => (
                                            <Pressable
                                                key={i}
                                                style={[styles.image, { borderColor: BaseColors[ currentTheme == "dark" ? "neutral600" : "neutral300"], }]}
                                                onPress={() => {
                                                    setImageIndex(i);
                                                    setVisible(true);
                                                }}
                                            >
                                                <Image
                                                    style={{ flex: 1, backgroundColor: Colors.background200, }}
                                                    source={getFilePath(image)}
                                                    contentFit="cover"
                                                    transition={100}
                                                />
                                            </Pressable>
                                        ))}
                                    </View>
                                )}

                                <ImageView
                                    images={images}
                                    imageIndex={imageIndex ?? 0}
                                    visible={visible}
                                    onRequestClose={() => setVisible(false)}
                                    animationType="slide"
                                    presentationStyle={isIOS ? "overFullScreen" : "fullScreen"}
                                    FooterComponent={(item) => (
                                        <ImageFooterComponent index={item.imageIndex} total={images?.length} />
                                    )}
                                    HeaderComponent={(_) => (
                                        <ImageHeaderComponent
                                            handleClose={() => {
                                                setVisible(false);
                                                setImageIndex(null);
                                            }}
                                        />
                                    )}
                                />

                                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 24 : 28)} color={Colors.primaryLight}>{formatCurrency(item?.goalAmount ?? 0)}</Typography>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 19 : 21)} color={BaseColors.neutral500}>{formatCurrency(item?.amountReceived ?? 0)} Funded</Typography>
                                </View>

                                <View style={[styles.progressCard, { backgroundColor: Colors.cardBackground }]}>
                                    <View style={styles.flexRow}>
                                        <Typography fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 17 : 19)} color={Colors.text}>Funding Progress</Typography>
                                        <Typography fontFamily="urbanist-bold" size={verticalScale(isIOS ? 18 : 20.5)} color={BaseColors.primaryLight}>{percentage ?? 0}%</Typography>
                                    </View>
    
                                    <Rangebar value={percentage} />
                                    
                                    <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                        <View style={{ flexDirection: "row", gap: 3 }}>
                                            <Icons.UsersThreeIcon size={verticalScale(20)} color={BaseColors.neutral500} />
                                            <Typography fontFamily="urbanist-medium" size={verticalScale(isIOS ? 17 : 19)} color={BaseColors.neutral500}>{item?.contributorCount} Contributor{item?.contributorCount === 1 ? "" : "s"}</Typography>
                                        </View>

                                        {item?.isCompleted ? (
                                            <View style={{ flexDirection: "row", alignItems: "center", gap: spacingX._7 }}>
                                                <Typography fontFamily="urbanist-bold" size={verticalScale(isIOS ? 18 : 20.5)} color={BaseColors.primaryLight}>Completed</Typography>
                                                <LottieView source={require("@/assets/lottie/popper-big.json")} loop autoPlay style={{ width: 24, height: 24, marginTop: -7 }} />
                                            </View>
                                        ) : null}
                                    </View>
                                </View>

                                <View style={[styles.progressCard, { backgroundColor: Colors.cardBackground, marginTop: -spacingY._7 }]}>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 18.5 : 21.5)} color={Colors.text}>Description</Typography>

                                    <Typography fontFamily="urbanist-medium" size={verticalScale(isIOS ? 17 : 19)} color={BaseColors.neutral500} textProps={{ numberOfLines: 5 }}>
                                        {item?.description || "--"}
                                    </Typography>
                                </View>

                                {!item?.isCompleted ? (
                                    <Button
                                        onPress={handleEditAction}
                                        disabled={item?.isCompleted}
                                        style={{ backgroundColor: BaseColors.brown, marginTop: -spacingY._10, flexDirection: "row", alignItems: "center", gap: spacingY._5, }}
                                    >
                                        <Icons.PencilSimpleLineIcon color={BaseColors.white} weight="regular" size={verticalScale(24)} />
                                        <Typography size={isIOS ? 20 : 22} color={BaseColors.white} fontFamily="urbanist-semibold">Modify this Wish</Typography>
                                    </Button>
                                ) : null}
                            </View>

                            <ContributionList
                                title="Contributions / Givers"
                                data={contributors as ContributorType[]}
                                loading={contributorLoading}
                                emptyListMessage="No contribution yet!"
                            />
                        </React.Fragment>
                    )}
                    
                </ScrollView>
			</View>
		</ModalWrapper>
	);
}

function ImageHeaderComponent({ handleClose }: { handleClose: () => void }) {
    return (
        <View style={{ position: "relative" }}>
            <Pressable
                style={{
                    width: verticalScale(34),
                    height: verticalScale(34),
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: BaseColors.neutral600,
                    borderRadius: 50,
                    position: "absolute",
                    top: scale(10),
                    right: scale(10),
                }}
                onPress={handleClose}
            >
                <Icons.XIcon size={verticalScale(isIOS ? 23 : 26)} color={BaseColors.white} weight="bold" />
            </Pressable>
        </View>
    )
}


function ImageFooterComponent({ index, total }: { index: number, total: number }) {
    return (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                alignSelf: "flex-end",
                gap: spacingX._5,
                padding: spacingY._10,
                margin: spacingY._10,
                backgroundColor: BaseColors.neutral700,
                borderRadius: radius._6,
            }}
        >
            <Typography color={BaseColors.white} fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 18 : 21)}>{index + 1}</Typography>
            <Typography color={BaseColors.white} fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 18 : 21)}>/</Typography>
            <Typography color={BaseColors.white} fontFamily="urbanist-semibold" size={verticalScale(isIOS ? 18 : 21)}>{total}</Typography>
        </View>
    );
}


const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "space-between",
        paddingHorizontal: spacingY._20,
	},
    displayDetails: {
        flex: 1,
        gap: spacingY._25,
        marginBottom: spacingY._35,
    },
    progressCard: {
        padding: spacingY._10,
        borderRadius: radius._10,
        gap: spacingY._10,
    },
    flexRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
    imagesGrid: {
        flexDirection: "row",
        justifyContent: "space-between",
        rowGap: spacingY._20,
        flexWrap: "wrap"
    },
    image: {
        height: scale(160),
        width: scale(160),
        borderRadius: radius._15,
        borderCurve: "continuous",
        overflow: "hidden",
        borderWidth: 1,
    },
});
