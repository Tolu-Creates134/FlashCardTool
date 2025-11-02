import React, { createContext, useState, useEffect } from "react";
import { fetchCurrentUser } from "../services/api";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

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
        setUser(null);
    }

    const logout = () => {
        localStorage.removeItem("accessToken");
        setUser(null);
    }

    return (
        <AuthContext.Provider value={{ user, setUser, login, logout, loading}}>
            {children}
        </AuthContext.Provider>
    )
}