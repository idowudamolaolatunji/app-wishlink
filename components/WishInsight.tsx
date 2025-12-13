import { BaseColors, radius, spacingY } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { scale, verticalScale } from '@/utils/styling';
import { WishInsightType } from '@/utils/types';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Typography from './Typography';


export default function WishInsight({ icon, iconbgColor, title, value, style, useDefaultTheme=true }: WishInsightType) {
    const { Colors, currentTheme } = useTheme();

    return (
        <View style={[styles.insightContainer, { backgroundColor: useDefaultTheme ? Colors.cardBackground : BaseColors.neutrale900 }, style]}>
            <View style={{ gap: verticalScale(5) }}>
                <Typography size={17} color={useDefaultTheme ? BaseColors[currentTheme == "light" ? "neutral600" : "neutral400"] : BaseColors[currentTheme == "light" ? "neutral200" : "neutral400"]} fontFamily="urbanist-semibold">
                    {title}
                </Typography>
                <Typography size={19.5} color={useDefaultTheme ? Colors.text : BaseColors.neutral500} fontFamily="urbanist-bold">
                    {value ?? 0}
                </Typography>
            </View>
        
            <View style={[styles.statsIcon, { backgroundColor: iconbgColor ?? BaseColors.white }]}>
                {icon}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    insightContainer: {
        padding: spacingY._15,
        borderRadius: radius._10,
        width: scale(163),
        flexDirection: "row",
        justifyContent: "space-between",
    },
    statsIcon: {
        borderRadius: 50,
        width: verticalScale(35),
        height: verticalScale(35),
        alignItems: "center",
        justifyContent: "center",
    },
})