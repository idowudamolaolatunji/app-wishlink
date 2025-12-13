import { BaseColors, radius } from '@/constants/theme'
import { useTheme } from '@/hooks/useTheme'
import { getFilePath } from '@/services/imageService'
import { scale, verticalScale } from '@/utils/styling'
import { ImageUploadProps } from '@/utils/types'
import * as Burnt from "burnt"
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import * as Icons from "phosphor-react-native"
import React from 'react'
import { Alert, StyleSheet, TouchableOpacity, View } from 'react-native'
import Typography from './Typography'


export default function ImageUpload({
    file,
    onSelect,
    onClear,
    containerStyle,
    imageStyle,
    placeholder = "",
}: ImageUploadProps) {
    const { Colors } = useTheme();

    const handlePickImage = async function() {
        try {
            const permissionResult = 
            await ImagePicker.requestMediaLibraryPermissionsAsync();
    
            if (!permissionResult.granted) {
                Alert.alert(
                    "Permission Required",
                    "Please allow access to your photo library to upload a photo"
                );
                return;
            }

            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [4, 3],
                quality: 1,
            });

            if(!result.canceled) {
                onSelect(result.assets[0])
            }
        } catch(err: any) {
            console.log("Error: ", err?.message);
            Burnt.toast({ haptic: "error", title: "Image not supported, select a suppported image!" })
        }
    }

    return (
        <View>
            {!file && (
                <TouchableOpacity
                    onPress={handlePickImage}
                    style={[styles.inputContainer, containerStyle]}
                >
                    <Icons.UploadSimpleIcon
                        color={BaseColors.neutral500}
                    />
                    {placeholder && <Typography size={15.5} color={BaseColors.neutral500} fontFamily='urbanist-medium'>{placeholder}</Typography>}
                </TouchableOpacity>
            )}

            {file && (
                <View style={[styles.image, imageStyle]}>
                    <Image
                        style={{ flex: 1, backgroundColor: Colors.background200 }}
                        source={getFilePath(file)}
                        contentFit="cover"
                        transition={100}
                    />

                    <TouchableOpacity style={styles.deleteIcon} onPress={() => onClear()}>
                        <Icons.XCircleIcon
                            size={verticalScale(26)}
                            weight="fill"
                            color={BaseColors.rose}
                        />
                    </TouchableOpacity>
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    inputContainer: {
        height: verticalScale(56),
        borderRadius: radius._15,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        borderWidth: 1,
        borderColor: BaseColors.neutral400,
        borderStyle: "dashed",
    },
    image: {
        height: scale(160),
        // width: scale(160),
        width: "100%",
        borderRadius: radius._15,
        borderCurve: "continuous",
        overflow: "hidden",
        elevation: -10,
    },
    deleteIcon: {
        position: "absolute",
        top: scale(6),
        right: scale(6),
        backgroundColor: BaseColors.white,
        borderRadius: 50,
        shadowColor: BaseColors.white,
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 1,
        shadowRadius: 10,
    },
});