import { firestore } from "@/config/firebase";
import { generateSlug } from "@/utils/helpers";
import { AppTransactionType, BankAccountType, ResponseType, UserType } from "@/utils/types";
import { collection, doc, increment, setDoc, updateDoc } from "firebase/firestore";

export const processOneTimePayment = async function(reference: string, uid: string, amount: number): Promise<ResponseType> {
    try {
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
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
        const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
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


export const processWithdrawalTransaction = async function(amount: number, bankAccount: BankAccountType, reason: string ): Promise<ResponseType> {
    console.log("I was clicked!!");


    const recipientData = {
        type: 'nuban',
        name: bankAccount?.accountName,
        account_number: bankAccount?.accountNumber,
        bank_code: bankAccount?.bankCode,
        currency: bankAccount?.currency || "NGN",
    };

    try {
        const recepient_res = await fetch(`https://api.paystack.co/transferrecipient`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(recipientData),
        })

        const recepient_data = await recepient_res.json();
        const recipientCode = recepient_data?.data?.recipient_code;
        // console.log(recepient_data, recipientCode);

        const init_res = await fetch(`https://api.paystack.co/transfer`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}`,
            },
            body: JSON.stringify({
                source: "balance",
                amount: amount * 100, // amount in kobo
                recipient: recipientCode,
                reference: generateSlug(16),
                reason,
            })
        });

        const init_data = await init_res.json();
        const reference = init_data?.data?.refeence;
        console.log(init_data, reference)


        const status_res = await fetch(`https://api.paystack.co/transfer/${reference}`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json',
            },
        });
        const status_data = await status_res.json();
        console.log(status_data)

        return { success: true }
    } catch(err: any) {
        return { success: false, msg: err?.message };
    }
}