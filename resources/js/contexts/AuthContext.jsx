import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, login as sanctumLogin, logout as sanctumLogout, setAuthToken, clearAuthToken } from '../utils/sanctumAuth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadUser = async () => {
        try {
            const data = await getCurrentUser();
            if (data.success) {
                setUser(data.data);
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error('Failed to load user:', error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    // Load user on app start
    useEffect(() => {
        // Add a small delay to ensure the app is fully loaded
        const timer = setTimeout(loadUser, 100);
        return () => clearTimeout(timer);
    }, []);

    // Listen for auth events
    useEffect(() => {
        const handleLogout = () => {
            setUser(null);
            setLoading(false);
        };

        // Listen for merchant changes to refresh user (to update is_admin status)
        const handleMerchantChange = () => {
            if (user) {
                loadUser();
            }
        };

        window.addEventListener('auth:logout', handleLogout);
        window.addEventListener('merchant:changed', handleMerchantChange);
        
        return () => {
            window.removeEventListener('auth:logout', handleLogout);
            window.removeEventListener('merchant:changed', handleMerchantChange);
        };
    }, [user]);

    const login = async (userData) => {
        try {
            // If userData is provided, just set the user (token already stored by apiRequest)
            if (userData) {
                setUser(userData);
                window.dispatchEvent(new CustomEvent('auth:login', { detail: userData }));
                return { success: true, user: userData };
            }
            
            // Otherwise, try to get current user with stored token
            const data = await getCurrentUser();
            if (data.success) {
                setUser(data.data);
                window.dispatchEvent(new CustomEvent('auth:login', { detail: data.data }));
                return data;
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await sanctumLogout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('auth:logout'));
        }
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.is_admin || false
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
