// SmartHomeSkarigaApp/src/context/AuthContext.tsx

import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { AppwriteException, Models } from 'appwrite';
import { account, databases, USERS_COLLECTION_ID, DATABASE_ID } from '../lib/appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserData extends Models.User<Models.Preferences> {
    role?: string;
}

interface IAuthContext {
    user: UserData | null;
    isLoading: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<IAuthContext | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const getUserDetails = async (accountData: Models.User<Models.Preferences>): Promise<UserData> => {
        try {
            console.log('[auth] getUserDetails: fetching user document for', accountData.$id);
            const userDoc = await databases.getDocument(DATABASE_ID, USERS_COLLECTION_ID, accountData.$id);
            console.log('[auth] getUserDetails: found userDoc', userDoc);
            return { ...accountData, role: userDoc.role || 'user' };
        } catch (error) {
            console.warn("Gagal mengambil role pengguna, fallback ke 'user'.", error);
            return { ...accountData, role: 'user' };
        }
    };

    const checkSession = useCallback(async () => {
        setIsLoading(true);
        try {
            console.log('[auth] checkSession: calling account.get()');
            const accountData = await account.get();
            console.log('[auth] checkSession: account.get() ->', accountData);
            const userDetails = await getUserDetails(accountData);
            console.log('[auth] checkSession: userDetails ->', userDetails);
            setUser(userDetails);
            return userDetails;
        } catch (error) {
            console.log('[auth] checkSession: no active session or error', error);
            setUser(null);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        checkSession();
    }, [checkSession]);

    const login = async (email: string, pass: string) => {
        try {
            console.log('[auth] login: checking existing session before creating one');
            const existing = await checkSession();
            console.log('[auth] login: existing session ->', existing);
            if (existing) {
                console.log('[auth] login: session exists, user already logged in');
                return;
            }
        } catch (e) {
            console.log('[auth] Tidak dapat mengecek session sebelum login, melanjutkan...', e);
        }

        try {
            console.log('[auth] login: creating email/password session for', email);
            await account.createEmailPasswordSession(email, pass);
            console.log('[auth] login: createEmailPasswordSession resolved; checking session');
            const userDetails = await checkSession();
            console.log('[auth] login: post-create session check ->', userDetails);
            
            // Simpan status login di AsyncStorage
            await AsyncStorage.setItem('isLoggedIn', 'true');
        } catch (error) {
            if (error instanceof AppwriteException) {
                const appwriteError = error as AppwriteException & { type?: string; response?: unknown };
                console.error('[auth] Appwrite error saat login:', {
                    code: error.code,
                    message: error.message,
                    type: appwriteError.type,
                    response: appwriteError.response,
                });

                const errType = appwriteError.type;
                if (error.code === 401 && errType === 'user_session_already_exists') {
                    try {
                        console.log('[auth] login: server reported session exists, trying to retrieve it via checkSession');
                        const userDetails = await checkSession();
                        console.log('[auth] login: checkSession returned', userDetails);
                        if (userDetails) {
                            console.log('[auth] login: session retrieved');
                            await AsyncStorage.setItem('isLoggedIn', 'true');
                            return;
                        }
                    } catch (e) {
                        console.log('[auth] login: checkSession failed after session-already-exists; attempting deleteSession and recreate', e);
                        try {
                            await account.deleteSession('current');
                            console.log('[auth] login: deleteSession complete');
                            await account.createEmailPasswordSession(email, pass);
                            console.log('[auth] login: createEmailPasswordSession after delete');
                            const userDetails = await checkSession();
                            console.log('[auth] login: post-recreate checkSession ->', userDetails);
                            if (userDetails) {
                                console.log('[auth] login: successfully recreated session');
                                await AsyncStorage.setItem('isLoggedIn', 'true');
                            }
                            return;
                        } catch (innerErr) {
                            console.error('[auth] Gagal merecovery atau recreate session:', innerErr);
                            setUser(null);
                            throw innerErr;
                        }
                    }
                }

                setUser(null);
                throw error;
            }
            setUser(null);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await account.deleteSession('current');
            setUser(null);
            await AsyncStorage.removeItem('isLoggedIn');
        } catch (error) {
            console.error("Gagal logout:", error);
        }
    };

    const value = { user, isLoading, login, logout };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth harus digunakan di dalam AuthProvider');
    }
    return context;
};
