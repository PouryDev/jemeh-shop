import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../utils/csrfToken';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Load user on app start
    useEffect(() => {
        const loadUser = async () => {
            try {
                const res = await apiRequest('/api/auth/user');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setUser(data.data);
                    } else {
                        setUser(null);
                    }
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Failed to load user:', error);
            } finally {
                setLoading(false);
            }
        };

        loadUser();
    }, []);

    const login = async (userData) => {
        setUser(userData);
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('auth:login', { detail: userData }));
    };

    const logout = async () => {
        try {
            await apiRequest('/api/auth/logout', { 
                method: 'POST'
            });
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
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
