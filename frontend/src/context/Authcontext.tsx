import React, { createContext, useState, useEffect, useCallback, useContext, JSX } from "react";
import { useNavigate } from "react-router-dom";
import { registerLogoutHandler } from "../utils/logoutManager";
import { fetchCurrentUser, logoutUser } from "../services/api";
import { GetCurrentUserQueryResponse } from "../types";

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Hook to consume AuthContext — throws if used outside AuthProvider
 * @returns {AuthContextValue}
 */
export const useAuth = () : AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }

    return context;
}

interface User {
    id: string,
    name: String,
    email: String
}

interface AuthContextValue {
    user: User | null,
    authReady: Boolean,
    setUser: React.Dispatch<React.SetStateAction<User | null>>,
    login: (userData: GetCurrentUserQueryResponse | null) => void;
    logout: () => Promise<void>;
}

/**
 * Auth provider component
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element}
 */
export const AuthProvider = ({ children } : { children : React.ReactNode }) : JSX.Element => {
    const [user, setUser] = useState<User | null>(null);
    const [authReady, setAuthReady] = useState<boolean>(false);
    const navigate = useNavigate();

    // When the app loads, try fetching the current user
    useEffect(() => {
        const hydrateUser = async () : Promise<void> => {
            try {
                const user = await fetchCurrentUser()

                setUser({
                    id: user.id,
                    name: user.name,
                    email: user.email
                });
            } catch (error) {
                setUser(null);
            } finally {
                setAuthReady(true);
            }
        }
        hydrateUser();
    }, [])

    const login = (userData : GetCurrentUserQueryResponse | null) : void => {
        if (!userData) {
            setUser(null);
            return;
        }

        setUser({
            id: userData.id ?? '',
            name: userData.name ?? '',
            email: userData.email ?? ''
        });
    }

    const logout = useCallback(async () : Promise<void> => {
        try {
            await logoutUser();
        } catch {
        } finally {
            setUser(null);
            navigate('/');
        }

    }, [navigate]);

    useEffect(() => {
        registerLogoutHandler(logout);
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, authReady }}>
            {children}
        </AuthContext.Provider>
    )
}
