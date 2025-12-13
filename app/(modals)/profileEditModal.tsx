import Asterisk from '@/components/Asterisk';
import BackButton from '@/components/BackButton';
import Button from '@/components/Button';
import FormInput from '@/components/FormInput';
import Loading from '@/components/Loading';
import ModalWrapper from '@/components/ModalWrapper';
import ScreenHeader from '@/components/ScreenHeader';
import Typography from '@/components/Typography';
import { BaseColors, spacingX, spacingY } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { getProfileImage } from '@/services/imageService';
import { updateUser } from '@/services/userService';
import { scale, verticalScale } from '@/utils/styling';
import { UserDataType } from '@/utils/types';
import * as Burnt from "burnt";
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import * as Icons from "phosphor-react-native";
import React, { useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';


export default function ProfileEditModal() {
    const router = useRouter();
    const { user, updateUserData } = useAuth();
    const { Colors, currentTheme } = useTheme();

    const [loading, setLoading] = useState({ main: false, tiny: false });
    const [userData, setUserData] = useState<UserDataType>({
        name: "",
        image: null,
        email: "",
    });

    const shouldDisable = user?.name !== userData?.name || user?.image !== userData?.image

    useEffect(function() {
        setUserData({
            name: user?.name || "",
            email: user?.email || "",
            image: user?.image || null,
        });
    }, [user]);

    const handlePickImage = async function() {
        setLoading({ ...loading, tiny: true })
        const permissionResult = 
        await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permissionResult.granted) {
            Alert.alert(
                "Permission Required",
                "Please allow access to your photo library to update your profile picture."
            );
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images', 'videos'],
            // allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if(!result.canceled) {
            setUserData({ ...userData, image: result.assets[0] })
        }
        setLoading({ ...loading, tiny: false })
    }

    const handleSubmit = async function() {
        let { name } = userData;
        if(!name) {
            return Burnt.toast({ title: "Please fill all the fields!" });
        }

        setLoading({ ...loading, main: true })
        try {
            // services function
            const res = await updateUser(user?.uid! as string, userData);
            if(!res.success) throw new Error(res.msg);

            // context data
            updateUserData(user?.uid! as string)
            Burnt.toast({ title: "Successful", haptic: "success" });
            router.back();
        } catch(err: any) {
            Burnt.toast({ title: err?.message, haptic: "error" });
        } finally {
            setLoading({ ...loading, main: false })
        }
    }

  return (
    <ModalWrapper>
        <View style={styles.container}>
            <ScreenHeader title='Update Profile' leftElement={<BackButton />} style={{ marginBottom: spacingY._10 }} />
            
            {/* form */}
            <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
                <View style={styles.avatarContainer}>
                    <Image 
                        style={[styles.avatar, { backgroundColor: Colors.background300 }]}
                        contentFit="cover"
                        source={getProfileImage(userData?.image ?? null)}
                        transition={100}
                    />

                    <TouchableOpacity style={[styles.editIcon, 
                        { shadowColor: Colors.inverseText, backgroundColor: Colors.background300 }]}
                        onPress={handlePickImage}
                    >
                        {loading?.tiny ? (
                            <Loading size="small" />
                        ) : (
                            <Icons.CameraIcon
                                weight="fill"
                                size={verticalScale(20)}
                                color={Colors.textLighter}
                            />
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.formItems}>
                    <View style={styles.inputContainer}>
                        <Typography fontFamily="urbanist-bold" color={Colors.textLighter}>Fullname <Asterisk /></Typography>
                        <FormInput
                            placeholder='Fullname'
                            value={userData.name}
                            onChangeText={(value) => setUserData({ ...userData, name: value })}
                        />
                    </View>
                </View>
            </ScrollView>
        </View>

        <View style={[styles.footerArea, { borderTopColor: BaseColors[currentTheme == "dark" ? "neutral700" : "neutral400"] }]}>
            <Button onPress={handleSubmit} disabled={shouldDisable} style={{ flex: 1 }} loading={loading.main}>
                <Typography size={Platform.OS == "ios" ? 22 : 25} fontFamily="urbanist-semibold" color={BaseColors.white}>Update</Typography>
            </Button>
        </View>
    </ModalWrapper>
  )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: spacingY._20,
        // paddingVertical: spacingY._20,
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
    form: {
        gap: spacingY._30,
        marginTop: spacingY._15
    },
    avatarContainer: {
        position: "relative",
        alignSelf: "center"
    },
    avatar: {
        alignSelf: "center",
        height: verticalScale(135),
        width: verticalScale(135),
        borderRadius: 200,
        // borderWidth: 1,
        // borderColor: BaseColors.neutral600,
        // overflow: "hidden",
        // position: "relative"
    },
    editIcon: {
        position: "absolute",
        bottom: spacingY._5,
        right: spacingY._7,
        borderRadius: 100,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 4,
        padding: spacingY._7,
    },
    formItems: {
        gap: spacingY._15
    },
    inputContainer: {
        gap: spacingY._10
    }
});