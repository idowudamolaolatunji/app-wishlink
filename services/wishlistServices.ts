import { firestore } from "@/config/firebase";
import { generateSlug } from "@/utils/helpers";
import { ResponseType, WishItemType, WishlistType } from "@/utils/types";
import { arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, increment, query, setDoc, updateDoc, where, writeBatch } from "firebase/firestore";
import { uploadFileToCloudinary } from "./imageService";

export const createOrUpdateWishlist = async function (wishlistData: Partial<WishlistType>): Promise<ResponseType> {
	try {
		let wishlistToSave = { ...wishlistData };

        // check for image and upload
		if (wishlistData.image) {
			const imageUploadRes = await uploadFileToCloudinary(wishlistData?.image, "wishlists");
			if (!imageUploadRes.success) {
				return { success: false, msg: imageUploadRes.msg || "Failed to upload image!" };
			}
			wishlistToSave.image = imageUploadRes.data;
		}

        if(!wishlistData?.id) {
            // if new wishlist
			const slug = generateSlug();
            wishlistToSave.totalWishItems = 0;
            wishlistToSave.totalContributors = 0;
            wishlistToSave.totalGoalAmount = 0;
            wishlistToSave.totalAmountReceived = 0;
            wishlistToSave.isCompleted = false;
            wishlistToSave.active = true;
            wishlistToSave.slug = `${slug}`;
            // wishlistToSave.link = `https://pay.wishers.app/w/${slug}`;
            wishlistToSave.link = `https://pay-wishers.vercel.app/w/${slug}`;
            wishlistToSave.wishes = [];
            wishlistToSave.created = new Date();
        }

        const wishlistRef = wishlistData?.id ? doc(firestore, "wishlists", wishlistData?.id) : doc(collection(firestore, "wishlists"));
        await setDoc(wishlistRef, wishlistToSave, { merge: true });

        return { success: true, data: { ...wishlistToSave, id: wishlistRef.id } };
	} catch (err: any) {
		console.log("Error creating or update wishlist");
		return { success: false, msg: err?.message };
	}
};

export const createOrUpdateWishItem = async function (wishData: Partial<WishItemType>): Promise<ResponseType> {
	try {
		let wishToSave = { ...wishData };
        const images: string[] = [];
        const isNewItem = !wishData?.id;

        // check for images and upload
		if (wishData.images && wishData.images.length > 0) {
            for(const image of wishData.images) {
                const imageUploadRes = await uploadFileToCloudinary(image, "wishitems");
                if (!imageUploadRes.success) {
                    return { success: false, msg: imageUploadRes.msg || "Failed to upload image!" };
                }
                images?.push(imageUploadRes.data);
            }
		}
        
        // if new wishitem
        if(isNewItem) {
            const slug = generateSlug();
            wishToSave.slug = slug;
            wishToSave.contributorCount = 0;
            wishToSave.amountReceived = 0;
            wishToSave.created = new Date();
            wishToSave.active = true;
            wishToSave.isCompleted = false;
        }

        // modify the images
        wishToSave.images = images;
        const wishRef = wishData?.id ? doc(firestore, "wishitems", wishData?.id) : doc(collection(firestore, "wishitems"));
        await setDoc(wishRef, wishToSave, { merge: true });

        // here for the wishlist
        if (!wishData?.wishlistId) {
            return { success: false, msg: "Missing wishlistId for new wish item" };
        }

        const wishlistRef = doc(firestore, "wishlists", wishData.wishlistId);
        
        // IF THE WISH IS A NEW ITEM
        if (isNewItem) {
            await updateDoc(wishlistRef, {
                isCompleted: false,
                totalWishItems: increment(1),
                totalGoalAmount: increment(wishToSave.goalAmount || 0),
                wishes: arrayUnion({
                    image: wishToSave?.images?.[0],
                    title: wishToSave.title,
                    slug: wishToSave.slug,
                    goalAmount: wishToSave.goalAmount,
                    amountReceived: 0,
                    contributorCount: 0,
                    id: wishRef?.id,
                    isCompleted: false,
                })
            });
        }

        // IF THE WISH IS OLD AND JUST BEING MODIFIED
        if(!isNewItem) {
            const wishlistSnapshot = await getDoc(wishlistRef);
            if(!wishlistSnapshot.exists()) {
                return { success: false, msg: "Wishlist not found!" };
            }

            const wishlistData = wishlistSnapshot.data() as WishlistType;
            const updatedWishitem = {
                id: wishToSave.id,
                image: wishToSave?.images?.[0],
                title: wishToSave.title,
                goalAmount: wishToSave.goalAmount,
            };

            // Update specific item in wishes array
            const updatedWishes = wishlistData?.wishes?.map((wish) => 
                wish.id === wishToSave.id ? { ...wish, ...updatedWishitem } : wish
            ) || [];

            await updateDoc(wishlistRef, {
                wishes: updatedWishes
            });
        }

        return { success: true, data: { ...wishToSave, id: wishRef.id }};
	} catch (err: any) {
		console.log("Error creating or update wishlist");
		return { success: false, msg: err?.message };
	}
};

export const deleteWishlist = async function (wishlistId: string): Promise<ResponseType> {
    try {
        const wishlistRef = doc(firestore, "wishlists", wishlistId);
        await deleteDoc(wishlistRef);

        // delete wishitems & transactions
        deleteWishesByWishlistId(wishlistId);
        return { success: true }
    } catch(err: any) {
        console.log("Error deleting wishlist", err);
        return { success: false, msg: err?.message };
    }
}


export const deleteWishItem = async function (wishId: string, wishlistId: string): Promise<ResponseType> {
    try {
        const wishRef = doc(firestore, "wishitems", wishId);
        const wishSnapshot = await getDoc(wishRef);
        if(!wishSnapshot.exists()) {
            return { success: false, msg: "Wish not found!" };
        }

        const wishData = wishSnapshot.data() as WishItemType;
        const deletingWishGoalAmount = wishData?.goalAmount;
        const deletingWishReceivedAmount = wishData?.amountReceived;
        const deletingWishContributors = wishData?.contributorCount;

        // fetch the wishlist for that wish
        const wishlistShapshot = await getDoc(
            doc(firestore, "wishlists", wishlistId)
        );

        const wishlistData = wishlistShapshot?.data() as WishlistType;
        const newTotalGoalAmount = wishlistData?.totalGoalAmount! - deletingWishGoalAmount!;
        const newTotalAmountReceived = wishlistData?.totalAmountReceived! - deletingWishReceivedAmount!;
        const newTotalContributors = wishlistData?.totalContributors! - deletingWishContributors!;
        const newTotalWishItems = wishlistData?.totalWishItems! - 1
        const remainingWishitems = wishlistData?.wishes?.filter((wish) => wish?.id != wishId);
        

        // check fields that needs to be update
        await createOrUpdateWishlist({
            id: wishlistId,
            totalAmountReceived: newTotalAmountReceived,
            totalWishItems: newTotalWishItems,
            totalContributors: newTotalContributors,
            totalGoalAmount: newTotalGoalAmount,
            wishes: remainingWishitems
        });

        // delete wishitem
        await deleteDoc(wishRef);
        return { success: true }
    } catch(err: any) {
        console.log("Error deleting wish", err);
        return { success: false, msg: err?.message };
    }
}

export const deleteWishesByWishlistId = async function(wishlistId: string): Promise<ResponseType> {
    try {
        let hasMoreWishes = true;

        while(hasMoreWishes) {
            const wishesQuery = query(
                collection(firestore, "wishitems"),
                where("wishlistId", "==", wishlistId),
            );

            const wishesSnapShot = await getDocs(wishesQuery);
            if(wishesSnapShot.size == 0) {
                hasMoreWishes = false;
                break;
            }

            const batch = writeBatch(firestore);
            wishesSnapShot.forEach((wishDoc) => {
                batch.delete(wishDoc.ref);
            });

            await batch.commit();

            console.log(`${wishesSnapShot.size} wishes deleted in this batch!`);
        }

        return { success: true, msg: "All transactions deleted successfully!" };

    } catch(err: any) {
        console.log("Error deleting wish", err);
        return { success: false, msg: err?.message };
    }
}