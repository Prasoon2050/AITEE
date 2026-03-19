"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, ArrowRight, ShoppingBag, Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
    const router = useRouter();

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
                <div className="text-center max-w-md px-4">
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 text-primary">
                        <ShoppingBag size={32} />
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-dark mb-3">Your cart is empty</h1>
                    <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
                    <Link href="/products" className="btn-primary inline-flex items-center gap-2">
                        Start Shopping <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
            <div className="container mx-auto px-4 md:px-6">
                <h1 className="text-3xl font-heading font-bold text-dark mb-8">Shopping Cart</h1>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Cart Items */}
                    <div className="flex-1 space-y-4">
                        {cartItems.map((item, index) => (
                            <div key={item.cartId || `cart-item-${index}`} className="bg-white p-4 rounded-2xl shadow-sm flex gap-4 sm:gap-6 items-center">
                                <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-dark truncate pr-4">{item.name}</h3>
                                            <p className="text-sm text-gray-500">{item.category}</p>
                                            {(item.selectedSize) && (
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {item.selectedSize}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.cartId!)} // Assert cartId exists as per logic
                                            className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-end">
                                        <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                                            <button
                                                onClick={() => updateQuantity(item.cartId!, Math.max(1, item.quantity - 1))}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary transition-colors"
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.cartId!, item.quantity + 1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-primary transition-colors"
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <span className="font-bold text-lg text-dark">
                                            ${(item.price * item.quantity).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Summary */}
                    <div className="lg:w-96 flex-shrink-0">
                        <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                            <h2 className="font-heading font-bold text-xl text-dark mb-6">Order Summary</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-medium">{getCartTotal() > 50 ? 'Free' : '$5.99'}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between text-lg font-bold text-dark">
                                    <span>Total</span>
                                    <span>${(getCartTotal() + (getCartTotal() > 50 ? 0 : 5.99)).toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full btn-primary flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout <ArrowRight size={18} />
                            </button>

                            <Link href="/products" className="block text-center text-sm text-gray-500 mt-4 hover:text-primary transition-colors">
                                Continue Shopping
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
