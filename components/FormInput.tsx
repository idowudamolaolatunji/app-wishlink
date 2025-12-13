import { BaseColors, radius, spacingX } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { verticalScale } from '@/utils/styling';
import { InputProps } from '@/utils/types';
import * as Icons from "phosphor-react-native";
import React, { useState } from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';


export default function FormInput(props: InputProps) {
    const { Colors, currentTheme } = useTheme();
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={[styles.container, { borderColor: isFocused ? BaseColors[currentTheme == "dark" ? "primaryAccent" : "primaryLight"] : BaseColors[currentTheme == "dark" ? "neutral600" : "neutral300"] }, props.containerStyle && props.containerStyle ]}>
            {props.icon && props.icon}

            <TextInput
                style={[styles.input, props.inputStyle, { color: Colors.text }]}
                placeholderTextColor={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}
                ref={props.inputRef && props.inputRef}
                {...props}
                {...props.isPassword && { secureTextEntry: !showPassword ? true : false }}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
            />

            {props.isPassword && (
                <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={{ padding: 5 }}
                >
                    {showPassword ? (
                        <Icons.EyeClosedIcon size={verticalScale(26)} color={BaseColors.neutral600} />
                    ) : (
                        <Icons.EyeIcon size={verticalScale(26)} color={BaseColors.neutral600} />
                    )}
                </TouchableOpacity>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        height: verticalScale(54),
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderRadius: radius._17,
        borderCurve: "continuous",
        paddingHorizontal: spacingX._15,
        gap: spacingX._10
    },
    input: {
        flex: 1,
        fontSize: verticalScale(17),
        fontFamily: "urbanist-medium",
    }
})