import { ResponseType } from "@/utils/types";


type RecipeintDataType = {
    type: string;
    name: string;
    account_number: string;
    bank_code: string;
    currency: string;
}

export const transferRecipient = async function(recipientData: RecipeintDataType): Promise<ResponseType> {
    try {
        const recepient_res = await fetch(`https://api.paystack.co/transferrecipient`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.EXPO_PUBLIC_WISHLIST_PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(recipientData),
        });

        const recepient_data = await recepient_res.json();
        const recipientCode = recepient_data?.data?.recipient_code;
        return { success: true, data: { code: recipientCode } };
    } catch(err: any) {
        return { success: false, msg: err?.message };
    }
}