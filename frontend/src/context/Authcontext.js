import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { registerLogoutHandler } from "../utils/logoutManager";
import { fetchCurrentUser } from "../services/api";

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
            const token = localStorage.getItem("accessToken")
            if (!token) return;

            try {
                const user = await fetchCurrentUser()

                setUser({
                    id: user.id,
                    name: user.name,
                    email: user.email
                });
            } catch (error) {
                console.error("Failed to fetch current user", error)
            }
        }
        hydrateUser();
    }, [])

    const login = (userData, accessToken) => {
        localStorage.setItem("accessToken", accessToken);
        setUser(userData ?? null);
    }

    const logout = useCallback(() => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        setUser(null);
        navigate('/');
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
