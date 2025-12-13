import Accordion from '@/components/Accordion'
import BackButton from '@/components/BackButton'
import FormInput from '@/components/FormInput'
import ModalWrapper from '@/components/ModalWrapper'
import ScreenHeader from '@/components/ScreenHeader'
import Typography from '@/components/Typography'
import { BaseColors, radius, spacingX, spacingY } from '@/constants/theme'
import { useTheme } from '@/hooks/useTheme'
import { verticalScale } from '@/utils/styling'
import * as Burnt from "burnt"
import { useRouter } from 'expo-router'
import * as Icons from "phosphor-react-native"
import React, { useState } from 'react'
import { Linking, Pressable, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { FadeInDown } from 'react-native-reanimated'

export default function FrequentlyAskedModal() {
    const router = useRouter();
    const { Colors, currentTheme } = useTheme();
    const appWhatsappNumber = "2349057643470"

    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("faq");

    const faqs = [
        { title: "title for first accordion", content: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, perferendis." }
    ];

    const openWhatsAppChat = async () => {
        const url = `whatsapp://send?phone=${appWhatsappNumber}`;
        const supported = await Linking.canOpenURL(url);
        if (supported) {
            await Linking.openURL(url);
        } else {
            Burnt.toast({ haptic: "error", title: "WhatsApp is not installed" });
        }
    };
    
  return (
    <ModalWrapper>
        <View style={styles.container}>
            <ScreenHeader title='Help Center' leftElement={<BackButton />} style={{ marginBottom: spacingY._10 }} />

            <View style={{ gap: spacingY._10, flex: 1 }}>
                <View style={[styles.tabs]}>
                    <Pressable onPress={() => setActiveTab("faq")} style={[styles.tab, { borderColor: Colors[activeTab == "faq" ? "primaryLight" : "background300"] }]}>
                        <Typography fontFamily="urbanist-semibold" color={Colors.text}>FAQs</Typography>
                    </Pressable>
                    <Pressable onPress={() => setActiveTab("contact")} style={[styles.tab, { borderColor: Colors[activeTab == "contact" ? "primaryLight" : "background300"] }]}>
                        <Typography fontFamily="urbanist-semibold" color={Colors.text}>Contact Us</Typography>
                    </Pressable>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                    {activeTab == "faq" && (
                        <View style={{ marginTop: spacingY._5 }}>
                            <FormInput
                                placeholder="Search"
                                icon={<Icons.MagnifyingGlassIcon size={verticalScale(24)} color={BaseColors.primaryLight} weight="bold" />}
                                value={searchQuery}
                                onChangeText={(value: string) => setSearchQuery(value)}
                                containerStyle={{ flex: 1, borderWidth: 0, borderBottomWidth: 1 }}
                            />

                            <View style={{ marginTop: spacingY._20 }}>
                                {faqs?.map((value, index) => (
                                    <Accordion data={value} index={index} key={index} />
                                ))}
                            </View>
                        </View>
                    )}

                    {activeTab == "contact" && (
                        <View style={{ marginTop: spacingY._20 }}>
                            <Animated.View entering={FadeInDown.delay(1 * 50)}>
                                <TouchableOpacity activeOpacity={0.95} style={[styles.cardItem, { backgroundColor: Colors.cardBackground }]} onPress={() => router.push("mailto:support@wishers.app")}>
                                    <Icons.EnvelopeOpenIcon
                                        size={verticalScale(26)}
                                        weight="regular" color={BaseColors[currentTheme == "dark" ? "white" : "primaryLight"]}
                                    />
                                    <Typography size={17} fontFamily="urbanist-medium">Email</Typography>
                                </TouchableOpacity>
                            </Animated.View>
                            <Animated.View entering={FadeInDown.delay(2 * 50)}>
                                <TouchableOpacity activeOpacity={0.95} style={[styles.cardItem, { backgroundColor: Colors.cardBackground }]} onPress={openWhatsAppChat}>
                                    <Icons.WhatsappLogoIcon
                                        size={verticalScale(26)}
                                        weight="regular" color={BaseColors[currentTheme == "dark" ? "white" : "primaryLight"]}
                                    />
                                    <Typography size={17} fontFamily="urbanist-medium">Whatsapp</Typography>
                                </TouchableOpacity>
                            </Animated.View>
                            <Animated.View entering={FadeInDown.delay(3 * 50)}>
                                <TouchableOpacity activeOpacity={0.95} style={[styles.cardItem, { backgroundColor: Colors.cardBackground }]} onPress={() => router.push("https://tawk.to/chat/693b4b7e66ccb91985cf4fa4/1jc7ptppl")}>
                                    <Icons.ChatIcon
                                        size={verticalScale(26)}
                                        weight="regular" color={BaseColors[currentTheme == "dark" ? "white" : "primaryLight"]}
                                    />
                                    <Typography size={17} fontFamily="urbanist-medium">Live Chat</Typography>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    </ModalWrapper>
    )
}
    
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingHorizontal: spacingY._20,
    },
    tabs: {
        width: "80%",
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
        // borderRadius: radius._3,
        borderBottomWidth: 3, 
    },
    cardItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: spacingX._10,
        padding: spacingY._20,
        paddingVertical: spacingY._17,
        borderRadius: radius._10,
        marginBottom: spacingY._15
    }
})