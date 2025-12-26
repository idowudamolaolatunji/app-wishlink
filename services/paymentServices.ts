import { firestore } from "@/config/firebase";
import { generateSlug } from "@/utils/helpers";
import { AppTransactionType, BankAccountType, ResponseType, UserType, WalletType, WithdrawalAmountDetails } from "@/utils/types";
import { collection, doc, getDocs, increment, limit, query, setDoc, updateDoc, where } from "firebase/firestore";
import { transferRecipient } from "./paystackServices";

const PAYSTACK_API = "https://api.paystack.co"

export const processOneTimePayment = async function(reference: string, uid: string, amount: number): Promise<ResponseType> {
    try {
        const response = await fetch(`${PAYSTACK_API}/transaction/verify/${reference}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}` }
        });

        const data = await response.json();
        if (!data?.status) return { success: false, msg: "Unable to Verify Payment" };

        const result = data.data;
        const charges = (Number(result?.amount) / 100) - amount!;
        const dataToSave = {
            email: result?.customer?.email,
            amount: amount,
            charges: charges,
            paidAmount: Number(result?.amount) / 100,
            status: result?.status,
            type: "one-time",
            currency: result?.currency,
            uid, refId: reference,
            paidAt: result.paidAt,
        } as AppTransactionType

        const appPaymentRef = doc(collection(firestore, "app_transactions"));
        await setDoc(appPaymentRef, dataToSave, { merge: true });
        return { success: true }
    } catch(err: any) {
        return { success: false, msg: err?.message };
    }
}


export const processWishlistBoosting = async function(reference: string, creator: Partial<UserType>, amount: number, wishlistId: string, durationInMS: number, planName: string): Promise<ResponseType> {
    try {
        const response = await fetch(`${PAYSTACK_API}/transaction/verify/${reference}`, {
            method: "GET",
            headers: { Authorization: `Bearer ${process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}` }
        });

        const data = await response.json();
        if (!data?.status) return { success: false, msg: "Unable to Verify Payment" };

        const result = data.data;
        const charges = (Number(result?.amount) / 100) - amount!;
        const dataToSave = {
            email: result?.customer?.email,
            amount: amount,
            charges: charges,
            paidAmount: Number(result?.amount) / 100,
            type: "boosting",
            status: result?.status,
            currency: result?.currency,
            uid: creator?.uid, refId: reference,
            paidAt: result.paidAt,
        } as AppTransactionType

        const appPaymentRef = doc(collection(firestore, "app_transactions"));
        await setDoc(appPaymentRef, dataToSave, { merge: true });

        // here for the wishlist
        if (!wishlistId) {
            return { success: false, msg: "Wishlist ID is required" };
        }
        const wishlistRef = doc(firestore, "wishlists", wishlistId);
        await updateDoc(wishlistRef, {
            currentboostExpiresAt: new Date(Date.now() + durationInMS!).toISOString(),
            lastBoostedAt: new Date().toISOString(),
            lastBoostingPlanName: planName,
            previousBoostingCount: increment(1),
            boostingCreator: {
                name: creator?.name,
                image: creator?.image || ""
            }
        });

        return { success: true }
    } catch(err: any) {
        return { success: false, msg: err?.message };
    }
}


export const processWithdrawalTransaction = async function(uid: string, withdrawalAmount: WithdrawalAmountDetails, bankDetails: BankAccountType, referredBy: string, reason?: string): Promise<ResponseType> {
    // WALLET UPDATE
    const walletQuery = query(
        collection(firestore, "wallets"),
        where("uid", "==", uid),
        limit(1)
    );
    const walletSnapshot = await getDocs(walletQuery);

    if (walletSnapshot.empty) {
        return { success: false, msg: "Wallet not found!" };
    }
    const userWallet = walletSnapshot.docs[0].data() as WalletType;
    // check if the user still doesnt have enought money
    if(userWallet?.remainingBalance < +withdrawalAmount.amount_entered!) {
        return { success: false, msg: "Insufficient fund" };
    }

    // RECEPIENT
    const recipientData = {
        type: 'nuban',
        name: bankDetails?.accountName,
        account_number: bankDetails?.accountNumber,
        bank_code: bankDetails?.bankCode!,
        currency: bankDetails?.currency || "NGN",
    };

    // THREE STEPS TO MAKING A TRANSFER (WITHDRAWAL)
    // 1. GET A RECEPIENT CODE
    // 2. INITIALIZE TRANSACTION
    // 3. VERIFY THE TRANSFER / TRANSACTION

    try {
        // CREATE A RECEPIENT CODE if there's none
        let recipient = bankDetails?.recipientCode;
        if(!recipient || recipient == null) {
            recipient = await transferRecipient(recipientData)?.then((data) => data?.data?.code);
        }

        // INITIALIZE TRANSACTION
        const init_res = await fetch(`${PAYSTACK_API}/transfer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.EXPO_PUBLIC_WISHLIST_PAYSTACK_SECRET_KEY}`,
            },
            body: JSON.stringify({
                source: "balance",
                amount: (Number(withdrawalAmount?.amount_to_pay) + Number(withdrawalAmount?.paystackFee)) * 100, // amount in kobo
                recipient,
                reference: generateSlug(16),
                reason: reason || "Withdrawal",
            })
        });

        const init_data = await init_res.json();
        console.log(init_data);
        if(!init_data?.status && init_data?.code == "insufficient_balance") {
            return { success: false, msg: "Something went wrong with the withdrawal, Contact the admin",  }
        }

        // const reference = init_data?.data?.refeence;
        // console.log(init_data, reference);

        // const status_res = await fetch(`https://api.paystack.co/transfer/${reference}`, {
        //     method: 'GET',
        //     headers: {
        //         Authorization: `Bearer ${process.env.EXPO_PUBLIC_WISHLIST_PAYSTACK_SECRET_KEY}`,
        //         'Content-Type': 'application/json',
        //     },
        // });
        // const status_data = await status_res.json();
        // console.log(status_data)

        // create transaction for the user and minus from balance (remaining & total)
        // check if there is a inviter / inviter code
        // if there is, send 1% to them (referral balance) and make a transaction "referral"
        // if and esle, create an admin transaction with the remaining

        // // update wallet balances and create transaction
        // const walletRef = walletSnapshot.docs[0].ref;
        // await updateDoc(walletRef, {
        //     // allTimeBalance: increment(amount),
        //     contributedEarning: increment(-Number(withdrawalAmount?.amount_entered)),
        //     remainingBalance: increment(-Number(withdrawalAmount?.amount_entered)),
        // });

        // const userTransactionToSave = {
        //     type: "withdrawal",
        //     status: "success",
        //     amount: +withdrawalAmount?.amount_entered,
        //     currency: bankDetails?.currency,
        //     paidAt: status_data?.paidAt,
        //     refId: reference,
        //     uid,
        //     recieverBank: bankDetails?.bankName,
        //     recieverAcctNumber: bankDetails?.accountNumber,
        //     recieverName: bankDetails?.accountName,
        //     description: reason || "",
        // } as TransactionType;

        // const transactionRef = doc(collection(firestore, "transactions"));
        // await setDoc(transactionRef, userTransactionToSave, { merge: true });

        // // check if refered
        // if(referredBy) {
        //     const usersRef = collection(firestore, "users");
        //     const q = query(usersRef, where("inviteCode", "==", referredBy));
        //     const querySnapshot = await getDocs(q);

        //     if (querySnapshot.size > 0) {
        //         const referrer = querySnapshot.docs[0].data() as UserType;
        //         const uid = referrer?.uid;
                
        //         const walletQuery = query(
        //             collection(firestore, "wallets"),
        //             where("uid", "==", uid),
        //             limit(1)
        //         );
        //         const walletSnapshot = await getDocs(walletQuery);

        //         if (walletSnapshot.empty) {
        //             return { success: false, msg: "Wallet not found!" };
        //         }

        //         // Update referral count
        //         const walletRef = walletSnapshot.docs[0].ref;
        //         await updateDoc(walletRef, {
        //             allTimeBalance: increment(withdrawalAmount?.referrerGain),
        //             referralEarnings: increment(withdrawalAmount?.referrerGain),
        //             remainingBalance: increment(withdrawalAmount?.referrerGain),
        //         });

        //         const referrerTransactionToSave = {
        //             type: "withdrawal",
        //             status: "success",
        //             amount: withdrawalAmount?.referrerGain,
        //             currency: bankDetails?.currency,
        //             paidAt: status_data?.paidAt,
        //             refId: reference,
        //             uid,
        //         } as TransactionType;

        //         const transactionRef = doc(collection(firestore, "transactions"));
        //         await setDoc(transactionRef, referrerTransactionToSave, { merge: true });
        //     }
        // }

        // // then store admin transaction (minus the referrer gain from it if there's a referrer)
        // const appProfit = withdrawalAmount?.appProfit - (referredBy ? withdrawalAmount?.referrerGain : 0);
        // const app_transaction = {
        //     email: status_data?.customer?.email,
        //     amount: appProfit,
        //     charges: 0,
        //     paidAmount: appProfit,
        //     status: "status",
        //     type: "app-percent",
        //     currency: status_data?.currency,
        //     uid, refId: reference,
        //     paidAt: status_data.paidAt,
        // } as AppTransactionType;

        // const appPaymentRef = doc(collection(firestore, "app_transactions"));
        // await setDoc(appPaymentRef, app_transaction, { merge: true });

        return { success: true }
    } catch(err: any) {
        return { success: false, msg: err?.message };
    }
}