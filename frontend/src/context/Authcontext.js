import React, { createContext, useState, useEffect, useCallback } from "react";
import { fetchCurrentUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import { registerLogoutHandler } from "../utils/logoutManager";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // When the app loads, try fetching the current user
    useEffect(() => {
        const token = localStorage.getItem("accessToken")
        if (token) {
            fetchCurrentUser()
                .then((data) => setUser(data))
                .catch((error) => {
                    setUser(null)
                    console.log(error) // for testing purposes
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false)
        }
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
        <AuthContext.Provider value={{ user, setUser, login, logout, loading}}>
            {children}
        </AuthContext.Provider>
    )
}
