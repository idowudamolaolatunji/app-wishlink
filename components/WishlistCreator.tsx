import { BaseColors, spacingX } from "@/constants/theme";
import useFetchData from "@/hooks/useFetchData";
import { getProfileImage } from "@/services/imageService";
import { verticalScale } from "@/utils/styling";
import { WishlistCreatorType } from "@/utils/types";
import { Image } from "expo-image";
import { limit, where } from "firebase/firestore";
// import { UserType } from "@/utils/types";
import { SealCheckIcon } from "phosphor-react-native";
import React from "react";
import { StyleSheet, View } from "react-native";
import Typography from "./Typography";


export default React.memo(function WishlistCreator({ uid }: { uid: string }) {

    const { data, loading } = useFetchData<WishlistCreatorType>(
        "users", (uid) ? [where("uid", "==", uid), limit(1)] : []
    );

    const creator: {
        name: string; image?: string; uid: string; 
    } = { name: data?.[0]?.name, image: data?.[0]?.image, uid: uid! }

// export default function WishlistCreator({ creator }: { creator: Partial<UserType> }) {

    return (
        <View style={styles.creatorCard}>
            <Image
                source={getProfileImage(creator?.image)}
                style={[styles.avatar, { backgroundColor: BaseColors.neutral300 }]}
                contentFit="cover"
            />
            <View>
                <Typography fontFamily="urbanist-bold" color={BaseColors.neutral100}>{creator?.name ?? "---"}</Typography>
                <View style={styles.verified}>
                    <Typography size={verticalScale(14)} fontFamily="urbanist-semibold" color={BaseColors.neutral400}>Verified Wisher</Typography>
                    <SealCheckIcon
                        weight="bold"
                        size={verticalScale(12)}
                        color={BaseColors.neutral400}
                    />
                </View>
            </View>
        </View>
    )
// };
});

const styles = StyleSheet.create({
    creatorCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._7,
    },
    avatar: {
        alignSelf: "center",
        height: verticalScale(37),
        width: verticalScale(37),
        borderRadius: 200,
        borderCurve: "circular",
    },
    verified: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._3,
    }
});