import { BaseColors, radius, spacingY } from '@/constants/theme'
import { useAppContext } from '@/contexts/AppContext'
import { useTheme } from '@/hooks/useTheme'
import { getFilePath } from '@/services/imageService'
import { scale, verticalScale } from '@/utils/styling'
import { ImageUploadProps } from '@/utils/types'
import * as Burnt from "burnt"
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import * as Icons from "phosphor-react-native"
import React, { useState } from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import Typography from './Typography'


export default function MultipleImageUpload({
    files,
    onSelect,
    onClear,
    containerStyle,
    imageStyle,
    placeholder = "",
}: ImageUploadProps) {
    const { Colors } = useTheme();
    const { actions } = useAppContext();
    const [allowedRemains, setAllowedRemains] = useState(actions?.maxWishItemImages ?? 0);

    const handlePickImage = async function() {
        if(files?.length >= actions?.maxWishItemImages!) {
            return Burnt.toast({ haptic: "error", title: "Max images upload exceeded" })
        }

        const permissionResult = 
        await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                "Permission Required",
                "Please allow access to your photo library to upload your photos"
            );
            return;
        }

        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                aspect: [4, 3],
                quality: 1,
                selectionLimit: actions?.maxWishItemImages,
            });

            if(!result.canceled) {
                // we only want the amount we allowed
                const allowed = result.assets?.slice(0, allowedRemains);
                onSelect(result.assets?.slice(0, allowedRemains))
                setAllowedRemains(allowedRemains - allowed.length)
            }

        } catch(err: any) {
            console.log("Error: ", err?.message);
            Burnt.toast({ haptic: "error", title: "Image not supported, select a suppported image!" })
        }
    }

    return (
        <View>
            {(files?.length < 1) && (
                <TouchableOpacity
                    onPress={handlePickImage}
                    style={[styles.inputContainer, containerStyle]}
                >
                    <Icons.UploadSimpleIcon
                        color={BaseColors.neutral500}
                    />
                    {placeholder && <Typography size={15.5} fontFamily='urbanist-medium' color={BaseColors.neutral500}>{placeholder}</Typography>}
                </TouchableOpacity>
            )}

            {files?.length > 0 && (
                <View style={styles.imagesGrid}>
                    <React.Fragment>
                        {files?.map((file: any, i: number) => (
                            <View style={[styles.image, imageStyle]} key={i}>
                                <Image
                                    style={{ flex: 1, backgroundColor: Colors.background200 }}
                                    source={getFilePath(file) ?? file}
                                    contentFit="cover"
                                    transition={100}
                                />

                                <TouchableOpacity style={styles.deleteIcon} onPress={() => {
                                    onClear(i);
                                    setAllowedRemains(allowedRemains + 1)
                                }}>
                                    <Icons.XCircleIcon
                                        size={verticalScale(28)}
                                        weight="fill"
                                        color={BaseColors.black}
                                    />
                                </TouchableOpacity>
                            </View>
                        ))}

                        {(allowedRemains > 0) && (
                            <TouchableOpacity
                                onPress={handlePickImage}
                                style={[styles.inputContainer, { width: scale(160), height: scale(160), flexDirection: "column" }]}
                            >
                                <Icons.UploadSimpleIcon
                                    color={BaseColors.neutral500}
                                />
                                {placeholder && (
                                    <Typography
                                        size={15.5}
                                        fontFamily='urbanist-medium'
                                        color={BaseColors.neutral500}
                                        textProps={{ numberOfLines: 2 }}
                                        style={{ textAlign: "center" }}
                                    >
                                        {placeholder}
                                    </Typography>
                                )}
                            </TouchableOpacity>
                        )}
                    </React.Fragment>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        height: verticalScale(54),
        borderRadius: radius._15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        borderColor: BaseColors.neutral400,
        borderStyle: "dashed",
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
    },
    deleteIcon: {
        position: "absolute",
        top: scale(6),
        right: scale(6),
        backgroundColor: BaseColors.white,
        shadowColor: BaseColors.black,
        borderRadius: 50,
        shadowOffset: { width: 10, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
});