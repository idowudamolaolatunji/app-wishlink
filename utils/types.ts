// import { Href } from "expo-router";
// import { Firestore, Timestamp } from "firebase/firestore";
// import { Icon } from "phosphor-react-native";

import { User } from "firebase/auth";
import React, { ReactNode } from "react";
import {
    // ActivityIndicator,
    // ActivityIndicatorProps,
    // ImageStyle,
    // Pressable,
    // PressableProps,
    TextInput,
    TextInputProps,
    TextProps,
    TextStyle,
    TouchableOpacityProps,
    ViewStyle
} from "react-native";

export type ThemeString = "light" | "dark"

export type ThemeContextType = {
    currentTheme: ThemeString;
    isSystemTheme: boolean;
    toggleTheme: (newTheme: ThemeString) => void;
    useSystemTheme: () => void;
}

export type ScreenWrapperProps = {
    style?: ViewStyle;
    children: React.ReactNode;
};

export type modalWrapperProps = {
    style?: ViewStyle;
    children: React.ReactNode;
    bgColor?: string
}

export type BoostingPlanType = {
    id: number;
    name: string;
    price: number;
    durationInHours: number;
    durationInMs: number;
}

export type AppActionType = {
    accessTo: string;
    maxWishItemImages: number;
    oneTimeFee: number;
    shouldPayOneTimeFee: boolean;
    wishitemCreationLimit: number;
    wishlistCreationLimit: number;
    maxGoalAmountDigits: number; // 10
    maxWithdrawalAmountDigits: number; // 9
    maxGoalAmount: number;
    minGoalAmount: number;
    shouldDisplayConfetti: boolean;
    feeDiscountInPercentage: number;
    plans: BoostingPlanType[];
    minWithdrawalAmount: number; // 100
    appWithdrawalPercentage: number; // 8
}

export type AppTransactionType = {
    id?: string;
    email: string;
    charges?: number;
    amount: number;
    currency: string;
    paidAmount?: number;
    status?: string;
    uid?: string;
    refId?: string;
    paidAt?: Date,
    type: "boosting" | "one-time"
}

export type AppContextType = {
    actions: AppActionType | null,
}

export type AccountOptionType = {
    title: string;
    text?: string;
    icon: React.ReactNode;
    bgColor: string;
    routeName?: any;
}

export type TypographyProps = {
    size?: number;
    color?: string;
    fontFamily?: string;
    fontWeight?: TextStyle["fontWeight"];
    children: any | null;
    style?: TextStyle;
    textProps?: TextProps;
}

export type IconComponent = React.ComponentType<{
    height?: number;
    width?: number;
    strokeWidth?: number;
    color?: string;
    fill?: string;
}>;

export type IconProps = {
    name: string;
    color?: string;
    size?: number;
    strokeWidth?: number;
    fill?: string;
}

export type BackButtonProps = {
    style?: ViewStyle;
    iconSize?: number;
    iconType?: "back" | "cancel" | "drop";
    customAction?: () => void;
}

export type HeaderProps = {
    title?: string;
    style?: ViewStyle;
    leftElement?: ReactNode;
    rightElement?: ReactNode;
}

export interface InputProps extends TextInputProps {
    icon?: React.ReactNode;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
    inputRef?: React.RefObject<TextInput>
    isPassword?: boolean;
}

export interface CustomButtonProps extends TouchableOpacityProps {
    style?: ViewStyle;
    onPress?: () => void;
    loading?: boolean;
    hasShowdow?: boolean;
    children: React.ReactNode;
}

export type ImageUploadProps = {
    files?: any; // for multiple
    file?: any; // for single
    onSelect: (file: any[] | any) => void; // for single and multiple
    onClear: (i?: number) => void;
    containerStyle?: ViewStyle;
    imageStyle?: ViewStyle;
    placeholder?: string;
}

export type UserType = {
    uid?: string;
    email: string | null;
    name: string | null;
    image?: any,
    ///////////////////////
    ///////////////////////
    inviteCode?: string;
    referredBy?: string | null;
    isSubscribed?: boolean;
    isActive?: boolean;
    createdAt?: boolean;
    expoPushTokens?: string[];
} | null;

export type UserDataType = {
    name?: string;
    image?: any;
    email?: string;
    isSubscribed?: boolean;
    expoPushTokens?: string[];
}

export type AuthContextType = {
    user: UserType;
    setUser: Function;
    login: (
        email: string,
        password: string,
    ) => Promise<{ success: boolean; msg?: string, user?: User }>;
    register: (
        name: string,
        email: string,
        password: string,
        refferedBy?: string,
    ) => Promise<{ success: boolean; msg?: string, user?: User }>;
    updateUserData: (userId: string) => Promise<void>
    /////////////////////////////////////////////////
    /////////////////////////////////////////////////
    getStoredUserData: () => Promise<{ email: string; name: string }>
    enableBiometric: () => Promise<boolean>;
    disableBiometric: () => Promise<void>;
    authenticateWithBiometric: () => Promise<{ success: boolean; msg?: string }>;
    biometricEnabled: boolean; // biometric is enabled
}

export type TransactionListType = {
    data: TransactionType[];
    title?: string;
    loading?: boolean;
    emptyListMessage?: string;
};

export type TransactionItemProps = {
    item: TransactionType;
    index: number;
    handleClick: Function;
};

export type ContributorListType = {
    data: ContributorType[];
    title?: string;
    loading?: boolean;
    emptyListMessage?: string;
};

export type ContributorItemProps = {
    item: ContributorType;
    index: number;
    handleClick: Function;
};


export type FeaturedWishlistProps = {
    data: WishlistType[];
    loading?: boolean;
}


export type ResponseType = {
    success: boolean;
    data?: any;
    msg?: string;
}

export type WalletType = {
    id?: string;
    uid?: string;
    allTimeBalance: number;
    remainingBalance: number;
    referralEarnings: number;
    contributedEarning: number;
    created?: Date;
}

export type BankAccountType = {
    id?: string;
    uid?: string;
    bankName: string;
    accountNumber: number;
    bankCode?: number;
    accountName: string;
    currency?: string;
    createdAt?: Date;
}

export type ThemeButtonProps = {
    title: string;
    icon: React.ReactNode;
    onPress: () => void;
    isActive: boolean;
}

export type WishInsightType = {
    title: string;
    icon: React.ReactNode;
    value: string;
    iconbgColor?: string;
    style?: ViewStyle,
    useDefaultTheme?: boolean,
}


export type TransactionType = {
    id?: string;
    type: string;
    amount: number;
    description?: string;
    refId?: string;
    uid: string;
    wishId?: string;
    status: string;
    currency: string;
    // paidAt: Date | Timestamp | string;
    paidAt: string;
};


export type ContributorType = {
    id?: string;
    name: string;
    email: string;
    amount: number;
    message?: string;
    image?: any;
    isAnonymous?: boolean;
    uid?: string;
    wishId?: string;
    transactionId?: string;
    refId?: string;
    // createdAt: Date | Timestamp | string;
    createdAt: string;
}

export type WishItemType = {
    wishlistId?: string;
    id?: string;
    slug?: string;
    title: string;
    uid?: string;
    images: any[];
    image?: string;
    description?: string;
    contributorCount?: number;
    goalAmount?: number;
    amountReceived?: number;
    created?: Date;
    active?: boolean;
    isCompleted?: boolean;
    contributorsImages?: string[];
}

export type WishlistType = {
    id?: string;
    title: string;
    description?: string;
    image: any;
    slug?: string;
    totalWishItems?: number;
    totalContributors?: number;
    totalGoalAmount?: number;
    totalAmountReceived?: number;
    uid?: string;
    created?: Date;
    active?: boolean;
    isCompleted?: boolean;
    wishes?: WishItemType[];
    link?: string;
    currentboostExpiresAt?: string;
    previousBoostingCount?: number;
    lastBoostedAt?: string;
    contributorsImages?: string[];
    boostingCreator?: {
        name: string;
        image?: string;
    }
}


export type WishlistCreatorType = {
    uid?: string;
    email?: string;
    name: string;
    image?: string;
}

export type NotificationType = {
    id?: string;
    uid: string;
    title: string;
    body: string;
    read: false;
    readAt?: string | null;
    createdAt: string;
    referenceToID?: string;
}