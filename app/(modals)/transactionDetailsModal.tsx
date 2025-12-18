import BackButton from '@/components/BackButton'
import Loading from '@/components/Loading'
import ModalWrapper from '@/components/ModalWrapper'
import ScreenHeader from '@/components/ScreenHeader'
import Typography from '@/components/Typography'
import { BaseColors, radius, spacingY } from '@/constants/theme'
import { useAuth } from '@/contexts/AuthContext'
import useFetchData from '@/hooks/useFetchData'
import { useTheme } from '@/hooks/useTheme'
import { formatCurrency, formatDateFull } from '@/utils/helpers'
import { verticalScale } from '@/utils/styling'
import { TransactionType } from '@/utils/types'
import { useLocalSearchParams } from 'expo-router'
import { limit, where } from 'firebase/firestore'
import * as Icons from "phosphor-react-native"
import React, { useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native'

export default function TransactionDetailsModal() {
    const { user } = useAuth();
    const { currentTheme, Colors } = useTheme();
    const { refId }: { refId: string } = useLocalSearchParams();

    const [refreshing, setRefreshing] = useState(false);

    const { data: transactionData, loading: transactionLoading, refetch: refetchTransaction } = useFetchData<TransactionType>(
        "transactions", user?.uid ? [where("uid", "==", user.uid), where("refId", "==", refId), limit(1)] : [],
    );

    const item = transactionData?.[0];
    
    const handleRefresh = function() {
        setRefreshing(true);
        refetchTransaction();
        setRefreshing(false);
    }

    return (
        <ModalWrapper>
            <View style={styles.container}>
                <ScreenHeader title="Transaction Details" leftElement={<BackButton />} style={{ marginBottom: spacingY._10 }} />

                <ScrollView
                    bounces={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
                    showsVerticalScrollIndicator={false}
                >
                    {transactionLoading && (
                        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", height: 200, }}>
                            <Loading color={BaseColors[currentTheme == "light" ? "primaryLight" : "accentDark"]} />
                        </View>
                    )}

                    {(!transactionLoading && item) && (
                        <View style={styles.item}>
                            <View style={styles.itemTop}>
                                <View style={[styles.imageContainer, { backgroundColor: BaseColors[item?.type == "Withdrawal" ? "brownAccent" : "accentLight"], borderWidth: 1.6, borderColor: BaseColors[item?.type == "Withdrawal" ? "brown" : "primaryLight"] }]}>
                                    {item?.type == "Withdrawal" ? (
                                        <Icons.HandWithdrawIcon color={BaseColors.brown} weight="bold" size={26.5} />
                                    ) : (
                                        <Icons.HandDepositIcon color={BaseColors.primaryLight} weight="bold" size={26.5} />
                                    )}
                                </View>

                                <Typography fontFamily='urbanist-bold' size={verticalScale(30)} style={{ textAlign: "center" }}>{item?.type == "Withdrawal" ? "-" : "+"}{formatCurrency(item?.amount)}</Typography>
                            </View>

                            <View style={styles.itemBody}>
                                <View style={styles.bodyDetail}>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Date & Time</Typography>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text}>{formatDateFull(item?.paidAt)}</Typography>
                                </View>
                                <View style={styles.bodyDetail}>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Reference ID</Typography>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text}>#{item?.refId}</Typography>
                                </View>
                                <View style={styles.bodyDetail}>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Currency</Typography>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text}>{item?.currency}</Typography>
                                </View>
                                <View style={styles.bodyDetail}>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Transaction type</Typography>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text} style={{ textTransform: "capitalize" }}>{item?.type}</Typography>
                                </View>
                                <View style={styles.bodyDetail}>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Amount recieved</Typography>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text}>{formatCurrency(item?.amount)}</Typography>
                                </View>
                                <View style={styles.bodyDetail}>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Fee</Typography>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text}>{formatCurrency(item?.charges || 0)}</Typography>
                                </View>
                                {item?.type == "withdrawal" && (
                                    <React.Fragment>
                                        <View style={styles.bodyDetail}>
                                            <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Recieving Bank</Typography>
                                            <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text} style={{ textTransform: "capitalize" }}>{item?.recieverBank}</Typography>
                                        </View>
                                        <View style={styles.bodyDetail}>
                                            <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Reciever Name</Typography>
                                            <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text} style={{ textTransform: "capitalize" }}>{item?.recieverName}</Typography>
                                        </View>
                                        <View style={styles.bodyDetail}>
                                            <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Recieving Bank Acct.</Typography>
                                            <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={Colors.text} style={{ textTransform: "capitalize" }}>{item?.recieverAcctNumber}</Typography>
                                        </View>
                                    </React.Fragment>
                                )}
                                <View style={styles.bodyDetail}>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[currentTheme == "dark" ? "neutral500" : "neutral400"]}>Status</Typography>
                                    <Typography fontFamily="urbanist-semibold" size={verticalScale(20)} color={BaseColors[item?.status == "success" ? "primaryLight" : "red"]} style={{ textTransform: "capitalize" }}>{item?.status == "success" ? "Successful" : item?.status}</Typography>
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
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
    item: {
        marginTop: spacingY._20,
        gap: spacingY._50,
        alignItems: "center"
    },
    itemTop: {
        alignItems: "center",
        gap: spacingY._7
    },
    imageContainer: {
        justifyContent: "center",
        alignItems: "center",
        width: verticalScale(50),
        height: verticalScale(50),
        borderRadius: radius._10,
    },
    itemBody: {
        alignSelf: "stretch",
        gap: spacingY._15
    },
    bodyDetail: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
})