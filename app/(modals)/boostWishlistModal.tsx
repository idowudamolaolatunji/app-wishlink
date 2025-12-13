import BackButton from "@/components/BackButton";
import Button from "@/components/Button";
import ModalWrapper from "@/components/ModalWrapper";
import RadioElement from "@/components/RadioElement";
import Rangebar from "@/components/Rangebar";
import ScreenHeader from "@/components/ScreenHeader";
import SubscribeCompleted from "@/components/SubscribeCompleted";
import Typography from "@/components/Typography";
import { BaseColors, radius, spacingX, spacingY } from "@/constants/theme";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { processWishlistBoosting } from "@/services/paymentServices";
import { calculatePercentage, formatCurrency } from "@/utils/helpers";
import { scale, verticalScale } from "@/utils/styling";
import { BoostingPlanType } from "@/utils/types";
import * as Burnt from "burnt";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import ModalView from "react-native-modal";
import { usePaystack } from "react-native-paystack-webview";


export default function BoostWishlistModal() {
    const router = useRouter();
    const { user } = useAuth();
    const { popup } = usePaystack();
    const { actions } = useAppContext();
    const { Colors, currentTheme } = useTheme();
    const params: {
        id: string,
        title: string,
        image: string,
        totalAmountReceived: string,
        totalGoalAmount: string,
        totalContributors: string,
    } = useLocalSearchParams();

    const [showModal, setShowModal] = useState({ completed: false });

    const [loading, setLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<BoostingPlanType | null>(null);

    const percentage = calculatePercentage(Number(params?.totalAmountReceived ?? 0), Number(params?.totalGoalAmount ?? 0));
    
    const handleSubmit = async function() {
        if(!selectedPlan || !selectedPlan?.price) {
            return Burnt.toast({ haptic: "error", title: "Select a boost plan" });
        }

        setLoading(true);

        popup.newTransaction({
            email: user?.email!,
            amount: selectedPlan?.price!,
            reference: `TNX_${Date.now()}`,
            onError: (err) => {
                setLoading(false);
                console.log("Error:", err);
            },
            onCancel: () => {
                setLoading(false);
                Burnt.toast({ haptic: "error", title: "Payment Cancelled!" });
            },
            onSuccess: async (res) => {
                const status = await processWishlistBoosting(
                    res.reference,
                    // here we added the creator's name and image to the boosting
                    { name: user?.name, image: user?.image, uid: user?.uid },
                    selectedPlan?.price,
                    params?.id,
                    selectedPlan?.durationInMs!,
                );
                if(status.success) {
                    setTimeout(function() {
                        setLoading(false);
                        setShowModal({ completed: true });
                    }, 500);
                    
                    Burnt.toast({ haptic: "success", title: "Payment Successful!" });
                } else {
                    Burnt.toast({ haptic: "error", title: "Payment failed!, Please Contact Support" })
                }
            },
        });
    }

    return (
        <ModalWrapper>
            <View style={styles.container}>
                <ScreenHeader title="Boost Wishlist" leftElement={<BackButton />} style={{ marginBottom: spacingY._5 }} />
                
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.contentView}
                >
                    <View style={{ gap: spacingY._10 }}>
                        <Typography size={verticalScale(22)} fontFamily="urbanist-semibold" color={BaseColors[currentTheme == "dark" ? "neutral300" : "neutral500"]}>Wishlist to boost:</Typography>

                        <View style={[styles.itemCard, { backgroundColor: Colors.cardBackground }]}>
                            <View style={styles.itemImageContainer}>
                                <Image
                                    contentFit="cover"
                                    source={params?.image}
                                    style={{
                                        height: verticalScale(100),
                                        width: verticalScale(80),
                                        borderRadius: radius._6,
                                        backgroundColor: Colors.background300,
                                    }}
                                />
                            </View>
            
                            <View style={styles.itemDetails}>
                                <Typography size={21} fontFamily="urbanist-bold">
                                    {params?.title}
                                </Typography>
            
                                <Typography fontFamily="urbanist-bold" size={verticalScale(19)} color={BaseColors.primaryLight}>
                                    {formatCurrency(Number(params?.totalGoalAmount ?? 0))}
                                </Typography>
                                <Rangebar value={percentage} height={5} />
            
                                <View style={styles.flexRow}>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(17.5)} color={Colors.textLighter}>
                                        {percentage ?? 0}% Funded
                                    </Typography>
            
                                    <View style={{ flexDirection: "row", gap: 3 }}>
                                        <Icons.UsersThreeIcon size={verticalScale(20)} color={Colors.textLighter} />
                                        <Typography fontFamily="urbanist-semibold" size={verticalScale(17.5)} color={Colors.textLighter}>
                                            {params?.totalContributors} Contributor{+params?.totalContributors === 1 ? "" : "s"}
                                        </Typography>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>

                    <View style={{ gap: spacingY._10 }}>
                        <Typography size={verticalScale(22)} fontFamily="urbanist-semibold" color={BaseColors[currentTheme == "dark" ? "neutral300" : "neutral500"]}>Select a boost plan:</Typography>

                        <View style={{ gap: spacingY._12 }}>
                            {actions?.plans && actions?.plans?.map((boostingPlan: BoostingPlanType, i: number) => (
                                <Pressable key={i} style={[styles.planCard, { backgroundColor: (selectedPlan?.id == boostingPlan?.id) ? BaseColors.accentLight : Colors.cardBackground }]} onPress={() => setSelectedPlan(selectedPlan?.id == boostingPlan?.id ? null : boostingPlan)}>
                                    <View>
                                        <Typography
                                            size={verticalScale(21)}
                                            fontFamily="urbanist-bold"
                                            color={(selectedPlan?.id == boostingPlan?.id) ? BaseColors.primaryLight : Colors.text}
                                        >
                                            {boostingPlan?.name} Plan
                                        </Typography>

                                        <Typography
                                            color={BaseColors.primaryLight}
                                            fontFamily="urbanist-semibold"
                                            size={verticalScale(18)}
                                        >
                                            {formatCurrency(boostingPlan?.price)}
                                        </Typography>
                                    </View>

                                    <RadioElement active={selectedPlan?.id == boostingPlan?.id} />
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {selectedPlan !== null && (
                        <View style={styles.paymentDetails}>
                            <View style={{ alignItems: "center", flexDirection: "row", gap: spacingX._7 }}>
                                <Typography>{selectedPlan?.name}</Typography>
                                <Typography color={BaseColors.primaryLight} fontFamily="urbanist-bold" size={verticalScale(31)}>{formatCurrency(selectedPlan?.price ?? 0)}</Typography>
                            </View>
                            <Typography color={Colors.textLighter} size={16}>Get your wishlist featured on our apps, websites</Typography>
                            <Typography color={Colors.textLighter} size={16}>and in-front of more givers for {selectedPlan?.name}</Typography>
                        </View>
                    )}
                </ScrollView>

                <View style={[styles.footerArea, { borderTopColor: BaseColors[currentTheme == "dark" ? "neutral700" : "neutral400"] }]}>
                    <Button onPress={handleSubmit} loading={loading} disabled={loading} style={{ width: "115%", backgroundColor: selectedPlan === null ? BaseColors?.primaryDark : BaseColors.primaryLight }}>
                        <Typography size={23} color={Colors.white} fontFamily="urbanist-semibold">{selectedPlan !== null ? "Boost Wishlist" : "Submit"}</Typography>
                    </Button>
                </View>
            </View>

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
                        router.back();
                    }}
                />
            </ModalView>
        </ModalWrapper>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingHorizontal: spacingY._20,
    },
    contentView: {
        paddingTop: spacingY._20,
        paddingBottom: spacingY._30,
        gap: spacingY._30,
    },
    flexRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
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
    planCard: {
        padding: spacingY._10,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: spacingX._20,
        borderRadius: radius._10,
    },
    paymentDetails: {
        justifyContent: "center",
        alignItems: "center",
        gap: spacingY._5,
        width: "100%",
        padding: spacingY._10,
        borderRadius: radius._10,
        borderColor: BaseColors.primaryLight,
        backgroundColor: "#defce91a",
        borderWidth: 1,
        borderStyle: "dashed",
        marginTop: -5,
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
});