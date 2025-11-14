import Asterisk from "@/components/Asterisk";
import BackButton from "@/components/BackButton";
import BottomSheet from "@/components/BottomSheet";
import Button from "@/components/Button";
import DeleteItem from "@/components/DeleteItem";
import FormInput from "@/components/FormInput";
import ModalWrapper from "@/components/ModalWrapper";
import MultipleImageUpload from "@/components/MultileImageUpload";
import ScreenHeader from "@/components/ScreenHeader";
import Typography from "@/components/Typography";
import { BaseColors, spacingX, spacingY } from "@/constants/theme";
import { useAppContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/hooks/useTheme";
import { createOrUpdateWishItem, deleteWishItem } from "@/services/wishlistServices";
import { formatCurrency } from "@/utils/helpers";
import { scale, verticalScale } from "@/utils/styling";
import { WishItemType } from "@/utils/types";
import * as Burnt from "burnt";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSharedValue } from "react-native-reanimated";

const isIOS = Platform.OS === "ios"

export default function createEditWishItemModal() {
    const router = useRouter();
    const currentWishData: {
        wishlistId: string,
        id?: string,
        title?: string,
        description?: string,
        images?: any,
        goalAmount?: string,
        amountReceived?: string,
        isCompleted?: string;
    } = useLocalSearchParams();
    
    const { user } = useAuth();
    const { actions } = useAppContext();
	const { Colors, currentTheme } = useTheme();

    const [canEditGoalAmount, setCanEditGoalAmount] = useState(true);
    const [loading, setLoading] = useState(false);
	const [images, setImages] = useState<any[]>([]);
    const [wishData, setWishData] = useState({
        title: "",
        description: "",
        goalAmount: "",
    });


    useEffect(function() {
        if(currentWishData?.id) {
            setWishData({
                title: currentWishData?.title || "",
                description: currentWishData?.description || "",
                goalAmount: currentWishData?.goalAmount || "",
            });

            setImages(currentWishData?.images?.split(',') || []);

            if(+currentWishData?.amountReceived! < 1) {
                setCanEditGoalAmount(true)
            } else {
                setCanEditGoalAmount(false);
            }
        }
    }, []);

    const handleSubmit = async function() {
        const { title, description, goalAmount } = wishData;
        if(!title || images.length < 1 || !goalAmount) {
            return Burnt.toast({ haptic: "error", title: "Fill up all required fields" })
        }

        if(+goalAmount < actions?.minGoalAmount!) {
            return Burnt.toast({ haptic: "error", title: `Goal Amount cannot be less than ${formatCurrency(actions?.minGoalAmount! ?? 0)}` })
        }

        setLoading(true);
        const data: WishItemType = {
            title,
            images,
            uid: user?.uid,
            description: description?.trim(),
            goalAmount: +goalAmount,
            wishlistId: currentWishData?.wishlistId
        }

        // THIS IS IF WE ARE UPDATING (THERE WILL BE ID), WE PASS THAT TO INDICATE EDIT
		if(currentWishData?.id) {
			data.id = currentWishData?.id
		}

        try {
            const res = await createOrUpdateWishItem(data);
            if(!res.success) throw new Error(res.msg);
    
            Burnt.toast({ haptic: "error", title: "Successful" });

            if(currentWishData?.id) {
                router.back();
            } else {
                router.replace({
                    pathname: "/(modals)/wishItemDetailModal",
                    params: {
                        id: res.data?.id as string,
                        slug: res.data?.slug,
                        isnew: "true"
                    }
                });
            }
        } catch(err: any) {
            Burnt.toast({ haptic: "error", title: err?.message })
        } finally {
            setLoading(false);
        }
    }

    const isOpen = useSharedValue(false);
    const toggleSheet = function() {
        isOpen.value = !isOpen.value;
    };

    const handleDelete = async function() {
        if(!currentWishData?.id) return;
        setLoading(true);

        // console.log(currentWishData?.id, currentWishData?.wishlistId)

        try {
            const res = await deleteWishItem(currentWishData?.id!, currentWishData?.wishlistId!);
            if(!res.success) throw new Error(res?.msg);
            Burnt.toast({ haptic: "success", title: "Successful!" });
            router.dismiss(2);
        } catch(err: any) {
            Burnt.toast({ haptic: "error", title: err?.message });
        } finally {
            setLoading(false);
        }
    }

	return (
		<ModalWrapper>
			<View style={styles.container}>
				<ScreenHeader title={`${currentWishData?.id ? "Edit your" : "Create a"} Wish`} leftElement={<BackButton />} style={{ marginBottom: spacingY._20 }} />

				<KeyboardAwareScrollView
                    bounces={false}
                    overScrollMode="never" // default, always, never
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    enableAutomaticScroll={true}
                    contentContainerStyle={styles.formItems}
                    enableOnAndroid
                >
                    <View style={styles.inputContainer}>
                        <Typography fontFamily="urbanist-bold" color={Colors.textLighter}>Title <Asterisk /></Typography>
                        <FormInput
                            placeholder="New Iphone 15 📱"
                            keyboardType="default"
                            value={wishData.title}
                            onChangeText={(value) => setWishData({ ...wishData, title: value })}
                        />
                    </View>

					<View style={styles.inputContainer}>
						<Typography fontFamily="urbanist-bold" color={Colors.textLighter}>
							Wish Images <Asterisk />
						</Typography>

						<MultipleImageUpload
							files={images}
							placeholder={`Upload Images (Max of ${actions?.maxWishItemImages})`}
                            // for multiple upload
							onSelect={(file) => setImages((prev) => [...prev, ...file])}
							onClear={(i) => {
								setImages((prev) => prev.filter((_, index) => index !== i));
								Burnt.toast({ haptic: "success", title: "Removed" });
							}}
						/>
					</View>

                    <View style={styles.inputContainer}>
                        <Typography fontFamily="urbanist-bold" color={Colors.textLighter}>Description </Typography>
                        <FormInput
                            keyboardType="default"
                            value={wishData.description}
                            multiline={true}
                            containerStyle={{ height: verticalScale(120) }}
                            inputStyle={{
                                height: "100%",
                                textAlign: "left",
                                textAlignVertical: "top",
                            }}
							numberOfLines={7}
                            maxLength={150}
                            placeholder="Enter description..."
                            onChangeText={(value) => setWishData({ ...wishData, description: value })}
                        />
                    </View>

                    <Pressable style={styles.inputContainer} onPress={() => {
                        if(!canEditGoalAmount) {
                            return Burnt.toast({ haptic: "error", title: `You cannot "Edit" Goal Amount at this point` })
                        }
                    }}>
                        <Typography fontFamily="urbanist-bold" color={Colors.textLighter}>Goal Amount <Asterisk /></Typography>
                        <FormInput
                            placeholder={`100,000 (Minimum of ${formatCurrency(actions?.minGoalAmount! ?? 0)})`}
                            readOnly={!canEditGoalAmount}
                            icon={<Icons.CurrencyNgnIcon size={verticalScale(20)} color={BaseColors.primary} weight="bold" />}
                            keyboardType="number-pad"
                            value={wishData.goalAmount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            maxLength={actions?.maxGoalAmountDigits}
                            onChangeText={(value) => setWishData({ ...wishData, goalAmount: value.replace(/,/g, '') })}
                        />
                    </Pressable>
				</KeyboardAwareScrollView>
			</View>

            <View style={[styles.footerArea, { borderTopColor: BaseColors[currentTheme == "dark" ? "neutral700" : "neutral400"] }]}>
                {(currentWishData?.id && !loading && currentWishData?.isCompleted != "true") && (
                    <Button
                        onPress={() => {
                            if(canEditGoalAmount) {
                                toggleSheet()
                            } else {
                                return Burnt.toast({ haptic: "error", title: `You cannot "Delete" this wish at this point` })
                            }
                        }}
                        style={{
                            backgroundColor: BaseColors[canEditGoalAmount ? "red" : "rose"],
                            paddingHorizontal: spacingX._15,
                        }}
                        disabled={!canEditGoalAmount}
                    >
                        <Icons.TrashIcon
                            color={BaseColors.white}
                            size={verticalScale(isIOS ? 24 : 26)}
                            weight="bold"
                        />
                    </Button>
                )}

                <Button onPress={handleSubmit} loading={loading} disabled={loading} style={{ flex: 1 }}>
                    <Typography size={isIOS ? 22 : 25} color={Colors.white} fontFamily="urbanist-semibold">
                        {currentWishData?.id ? "Update" : "Create"} Wish
                    </Typography>
                </Button>
            </View>

            <BottomSheet isOpen={isOpen} toggleSheet={toggleSheet} customHeight={verticalScale(350)}>
                <ScreenHeader title='Delete this Wish' leftElement={<BackButton iconType="cancel" customAction={toggleSheet} />} style={{ marginBottom: spacingY._10 }} />
                
                <DeleteItem
                    text="Are you sure you want to delete wish? note that everything that relates with this wish will be deleted including the transtion"
                    handleClose={toggleSheet}
                    loading={loading}
                    handleDelete={handleDelete}
                />
            </BottomSheet>
		</ModalWrapper>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "space-between",
		paddingHorizontal: spacingY._20,
	},
	formItems: {
		// flex: 1,
		width: "100%",
		gap: spacingY._15,
		marginTop: spacingY._15,
        paddingBottom: spacingY._50
	},
	inputContainer: {
		gap: spacingY._10,
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
