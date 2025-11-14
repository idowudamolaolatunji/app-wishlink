import { ResponseType } from "@/utils/types";

export async function handleFetchBanks(currencyName: string): Promise<ResponseType> {
    try {
        const response = await fetch(`https://api.paystack.co/bank?currency=${currencyName}`);
        const data = await response.json();
        if (!data.status) throw new Error(data.message);
        return { success: true, data };
    } catch(err: any) {
        return { success: false, msg: err?.message };
    }
}


export async function handleResolveAccount(accountNumber: string, code: string, currencyName: string): Promise<ResponseType> {
    try {
        const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${code}&currency=${currencyName}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.EXPO_PUBLIC_PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        // console.log(response)
        const data = await response.json();
        if (!data.status) throw new Error(data.message);
        return { success: true, data };
    } catch(err: any) {
        return { success: false, msg: err?.message };
    }
}