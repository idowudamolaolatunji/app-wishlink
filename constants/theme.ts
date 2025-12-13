import { scale, verticalScale } from "@/utils/styling";

export const BaseColors = {
    primary: "#2d6339",
    primaryLight: "#308041",
    primaryDark: "#274a34",
    violetAccent: "#e9e9ff",
    brownAccent: "#ffe1d4",
    primaryAccent: "#e2ffe8",
    white: "#fff",
    black: "#000",
    rose: "#ef4444",
    red: "#e11d48",
    violet: "#6366f1",
    blue: "#134686",
    lemon: "#97B067",
    brown: "#D97D55",
    accentLight: "#f8ffef",
    accent: "#e9fcce",
    accentDark: "#ccf88e",
    purple: "#642878",
    purpleAccent: "#fbedffff",
    neutrale900: "#1a1a1a",
    neutral800: "#262626",
    neutral700: "#404040",
    neutral600: "#525252",
    neutral500: "#737373",
    neutral400: "#a3a3a3",
    neutral350: "#cececeff",
    neutral300: "#d4d4d4",
    neutral200: "#e5e5e5",
    neutral150: "#fafafa",
    neutral100: "#f5f5f5",

    // neutral600: "#999",
    // neutral400: "#aaa",
    // neutral300: "#bbb",
};

export const LightTheme = {
    ...BaseColors,
    text: "#333",
    textLighter: "#525252",
    inverseText: "#eee",
    background: "#fff",
    background200: "#f9f9f9",
    background300: "#e4e4e4",
    cardBackground: "#f5f5f5",
};

export const DarkTheme = {
    ...BaseColors,
    text: "#fff",
    textLighter: "#c9c9c9",
    // background: "#141414",
    background: "#111111",
    background200: "#161616",
    background300: "#242424",
    inverseText: "#333",
    cardBackground: "#1a1a1a",
};


export const spacingX = {
    _1: scale(1),
    _3: scale(3),
    _5: scale(5),
    _7: scale(7),
    _10: scale(10),
    _12: scale(12),
    _15: scale(15),
    _18: scale(18),
    _20: scale(20),
    _25: scale(25),
    _30: scale(30),
    _35: scale(35),
    _40: scale(40),
}


export const spacingY = {
    _3: verticalScale(3),
    _5: verticalScale(5),
    _7: verticalScale(7),
    _8_5: verticalScale(8.5),
    _10: verticalScale(10),
    _12: verticalScale(12),
    _15: verticalScale(15),
    _17: verticalScale(17),
    _20: verticalScale(20),
    _22: verticalScale(22),
    _25: verticalScale(25),
    _30: verticalScale(30),
    _35: verticalScale(35),
    _40: verticalScale(40),
    _50: verticalScale(50),
    _60: verticalScale(60),
}


export const radius = {
    _3: verticalScale(3),
    _6: verticalScale(6),
    _10: verticalScale(10),
    _12: verticalScale(12),
    _15: verticalScale(15),
    _17: verticalScale(17),
    _20: verticalScale(20),
    _30: verticalScale(30),
}


export const confettiColors = ["#a864fd", "#29cdff", "#78ff44", "#ff718d", "#ff7722"]
