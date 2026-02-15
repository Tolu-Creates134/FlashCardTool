import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { registerLogoutHandler } from "../utils/logoutManager";

export const AuthContext = createContext();

/**
 * Auth provider component
 * @param {*} param0 
 * @returns 
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // When the app loads, try fetching the current user
    useEffect(() => {
        // Add logic here for fetching current user if needed
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
