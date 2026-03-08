import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { registerLogoutHandler } from "../utils/logoutManager";
import { fetchCurrentUser, logoutUser } from "../services/api";

export const AuthContext = createContext();

/**
 * Auth provider component
 * @param {*} param0 
 * @returns 
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // When the app loads, try fetching the current user
    useEffect(() => {
        const hydrateUser = async () => {
            try {
                const user = await fetchCurrentUser()

                setUser({
                    id: user.id,
                    name: user.name,
                    email: user.email
                });
            } catch (error) {
                setUser(null);
            }
        }
        hydrateUser();
    }, [])

    const login = (userData) => {
        setUser(userData ?? null);
    }

    const logout = useCallback(async () => {
        try {
            await logoutUser();
        } catch (error) {
            console.error("Logout request failed", error)
        } finally {
            setUser(null);
            navigate('/');
        }

    }, [navigate]);

    useEffect(() => {
        registerLogoutHandler(logout);
    }, [logout]);

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}
