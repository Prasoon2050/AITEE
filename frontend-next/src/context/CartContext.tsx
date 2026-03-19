"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface CartItem {
    id: number | string;
    cartId?: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    [key: string]: any;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    clearCart: () => void;
    getCartTotal: () => number;
    getCartCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedCart = localStorage.getItem('cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                // Migration: Ensure all items have a cartId
                const migratedCart = parsedCart.map((item: CartItem) => ({
                    ...item,
                    cartId: item.cartId || `${item.id}-${item.selectedSize || ''}`
                }));
                setCartItems(migratedCart);
            }
        }
    }, []);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('cart', JSON.stringify(cartItems));
        }
    }, [cartItems]);

    const addToCart = (product: any) => {
        setCartItems(prevItems => {
            const cartId = `${product.id}-${product.selectedSize || ''}`;
            const existingItem = prevItems.find(item => item.cartId === cartId);

            if (existingItem) {
                return prevItems.map(item =>
                    item.cartId === cartId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prevItems, { ...product, cartId, quantity: 1 }];
        });
    };

    const removeFromCart = (cartId: string) => {
        setCartItems(prevItems => prevItems.filter(item => item.cartId !== cartId));
    };

    const updateQuantity = (cartId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(cartId);
            return;
        }
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.cartId === cartId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartTotal = () => {
        return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cartItems.reduce((count, item) => count + item.quantity, 0);
    };

    const value = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
