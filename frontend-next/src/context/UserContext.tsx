"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Design {
    id: number;
    title: string;
    status: string;
    sales: number;
    earnings: number;
    image: string;
}

interface Order {
    id: string;
    date: string;
    total: number;
    status: string;
    items: number;
}

interface User {
    _id?: string;
    name: string;
    email: string;
    token?: string;
    avatar?: string;
    balance?: number;
    isAdmin?: boolean;
    designs?: Design[];
    orders?: Order[];
}

interface UserContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    addDesign: (design: Design) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsedUser = JSON.parse(userInfo);
                // Merge with default mock data for fields not yet in backend
                setUser({
                    ...parsedUser,
                    avatar: parsedUser.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + parsedUser.name,
                    balance: 0,
                    designs: [],
                    orders: []
                });
                setIsAuthenticated(true);
            } catch (error) {
                console.error("Failed to parse user info", error);
                localStorage.removeItem('userInfo');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData: User) => {
        setUser({
            ...userData,
            avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + userData.name,
            balance: 0,
            designs: [],
            orders: []
        });
        setIsAuthenticated(true);
        localStorage.setItem('userInfo', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    };

    const addDesign = (design: Design) => {
        if (user) {
            setUser(prev => prev ? ({
                ...prev,
                designs: [design, ...(prev.designs || [])]
            }) : null);
        }
    };

    return (
        <UserContext.Provider value={{ user, isAuthenticated, isLoading, login, logout, addDesign }}>
            {children}
        </UserContext.Provider>
    );
};
