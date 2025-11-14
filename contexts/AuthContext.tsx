import { auth, firestore } from "@/config/firebase";
import { useBiometricAuth } from '@/hooks/useBiometricsAuth';
import { createWallet } from "@/services/walletService";
import { generateSlug } from "@/utils/helpers";
import { AuthContextType, UserType } from "@/utils/types";
import { useRouter } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword } from "firebase/auth";
import { collection, doc, getDoc, getDocs, query, setDoc, where } from "firebase/firestore";
import { createContext, useContext, useEffect, useState } from "react";


export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode}> = function({ children }) {
    const router = useRouter();
    const [user, setUser] = useState<UserType>(null);

    //////////////////////////////////////////////////////////////////////////
    const [biometricEnabled, setBiometricEnabled] = useState(true);
    const { authenticate, saveBiometricPreference, getBiometricPreference } = useBiometricAuth();
    //////////////////////////////////////////////////////////////////////////

    useEffect(function() {
        const unsub = onAuthStateChanged(auth, (firebaseUser) => {
            if(firebaseUser?.uid) {
                setUser({
                    uid: firebaseUser?.uid,
                    email: firebaseUser?.email,
                    name: firebaseUser?.displayName,
                });

                updateUserData(firebaseUser?.uid)
                router.replace("/(tabs)")
            } else {
                // NO USER
                setUser(null);
                router.replace("/(auth)/welcome")
            }
        });

        // check if biometrics is enabled
        checkBiometricStatus();

        return () => unsub();
    }, []);

    const checkBiometricStatus = async () => {
        const enabled = await getBiometricPreference();
        setBiometricEnabled(enabled);
    };

    const StoreAuth = async function(email: string, password: string, name?: string) {
        // Save credentials securely for biometric login
        await SecureStore.setItemAsync('user_email', email);
        await SecureStore.setItemAsync('user_password', password);
        if(name) await SecureStore.setItemAsync('user_name', name);
    }

    const getStoredUserData = async function() {
        const email = await SecureStore.getItemAsync('user_email');
        const name = await SecureStore.getItemAsync('user_name');
        const data = { email: "", name: ""}
        if(email && email !== null) {
            data.email = email;
        };
        if(name && name !== null) {
            data.name = name;
        };
        return data;
    }

    async function login(email: string, password: string) {
        try {
            await signInWithEmailAndPassword(auth, email, password);

            // STORE THE AUTH
            StoreAuth(email, password);
            return { success: true }

        } catch(err: any) {
            let msg = err.message;
            if(msg?.includes("(auth/invalid-credential)") || msg?.includes("(auth/invalid-email)")) {
                msg = "Wrong credentials!"
            }

            if(msg?.includes("(auth/network-request-failed)")) msg = "Check network connections";

            return { success: false, msg }
        }
    }

    async function register(name: string, email: string, password: string, referralCode?: string) {
        try {
            // find the referral UId
            let referrerUid;
            if(referralCode) {
                const usersRef = collection(firestore, "users");
                const q = query(usersRef, where("inviteCode", "==", referralCode));
                const querySnapshot = await getDocs(q);
                if (querySnapshot.size > 0) {
                    const referrer = querySnapshot.docs[0].data() as UserType;
                    referrerUid = referrer?.uid;
                }
            }

            let response = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(firestore, "users", response?.user?.uid), {
                name,
                email,
                uid: response?.user?.uid,
                inviteCode: generateSlug(6),
                walletBalance: 0,
                isSubscribed: false,
                isActive: true,
                createdAt: new Date(),
                ...((referralCode && referrerUid) && { referredBy: referrerUid }),
            });
            await createWallet(response?.user?.uid)

            // STORE THE AUTH
            StoreAuth(email, password, name);
            return { success: true }

        } catch(err: any) {
            let msg = err.message;
            if(msg?.includes("(auth/email-already-in-use)") || msg?.includes("(auth/invalid-email)")) {
                msg = "Email already in use"
            }
            if(msg?.includes("(auth/network-request-failed)")) msg = "Check network connections";

            return { success: false, msg }
        }
    }

    async function updateUserData(uid: string) {
        try {
            const docRef = doc(firestore, "users", uid);
            const docSnap = await getDoc(docRef);
            
            if(docSnap.exists()) {
                const data = docSnap.data();
                const userData: UserType = {
                    uid: data?.uid,
                    email: data?.email || null,
                    name: data?.name || null,
                    image: data?.image || null,
                    inviteCode: data?.inviteCode || "",
                    isActive: data?.isActive || true,
                    isSubscribed: data?.isSubscribed || false,
                    referredBy: data?.referredBy || null,
                    createdAt: data?.createdAt || null,
                }

                setUser({ ...userData });
                if(userData.name) {
                    await SecureStore.setItemAsync('user_name', data?.name)
                }
            }
        } catch(err: any) {
            let msg = err.message;
            console.log("error", msg)
        }
    }

    const enableBiometric = async function() {
        const success = await authenticate();
        if (success) {
            await saveBiometricPreference(true);
            setBiometricEnabled(true);
        }
        return success
    };

    const disableBiometric = async function() {
        await saveBiometricPreference(false);
        setBiometricEnabled(false);
    };

    const authenticateWithBiometric = async function() {
        try {
            const success = await authenticate();
            
            if (success) {
                // Retrieve stored credentials
                const email = await SecureStore.getItemAsync('user_email');
                const password = await SecureStore.getItemAsync('user_password');
                
                if (email && password) {
                    await signInWithEmailAndPassword(auth, email, password);
                    return { success: true };
                }
            }
            
            return { success: false, msg: "Error Logging in with Biometrics" };
        } catch (err: any) {
            let msg = err?.message;
            return { success: false, msg };
        }
    };

    const contextValue: AuthContextType = {
        user,
        setUser,
        login,
        register,
        updateUserData,
        ///////////////////
        ///////////////////
        getStoredUserData,
        enableBiometric,
        disableBiometric,
        authenticateWithBiometric,
        biometricEnabled,
    }

    return <AuthContext.Provider value={contextValue}>
        {children}
    </AuthContext.Provider>
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if(!context) {
        throw new Error("useAuth must be wrapped inside AuthProvider");
    }
    return context;
}