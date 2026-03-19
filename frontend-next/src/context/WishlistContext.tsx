"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface WishlistItem {
    id: string | number;
    name: string;
    price: number;
    image: string;
    category: string;
    [key: string]: any;
}

interface WishlistContextType {
    wishlistItems: WishlistItem[];
    addToWishlist: (product: any) => void;
    removeFromWishlist: (productId: number | string) => void;
    isInWishlist: (productId: number | string) => boolean;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedWishlist = localStorage.getItem('wishlist');
            if (savedWishlist) {
                setWishlistItems(JSON.parse(savedWishlist));
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
        }
    }, [wishlistItems]);

    const addToWishlist = (product: any) => {
        setWishlistItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id || item.id === product._id);
            if (existingItem) {
                return prevItems; // Already in wishlist
            }
            return [...prevItems, {
                id: product.id || product._id,
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category
            }];
        });
    };

    const removeFromWishlist = (productId: number | string) => {
        setWishlistItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    const isInWishlist = (productId: number | string) => {
        return wishlistItems.some(item => item.id === productId);
    };

    const clearWishlist = () => {
        setWishlistItems([]);
    };

    const value = {
        wishlistItems,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        clearWishlist
    };

    return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};
