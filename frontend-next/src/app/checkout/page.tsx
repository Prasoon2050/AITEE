"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useUser } from '@/context/UserContext';
import { CheckCircle, CreditCard, MapPin, User } from 'lucide-react';
import axios from 'axios';

const Checkout = () => {
    const { cartItems, getCartTotal, clearCart } = useCart();
    const router = useRouter();

    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        address: '', city: '', state: '', zip: '',
        cardNumber: '', cardName: '', expiry: '', cvv: ''
    });

    const [orderPlaced, setOrderPlaced] = useState(false);
    const { user } = useUser();
    const token = user?.token;

    if (cartItems.length === 0 && !orderPlaced) {
        if (typeof window !== 'undefined') {
            router.push('/cart');
        }
        return null;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const placeOrderHandler = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            alert("Please sign in to place an order");
            router.push('/login?redirect=/checkout');
            return;
        }

        const shipping = getCartTotal() > 50 ? 0 : 5.99;
        const total = getCartTotal() + shipping;

        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
            };

            const orderData = {
                orderItems: cartItems.map(item => ({
                    product: item.id,
                    name: item.name,
                    image: item.image,
                    price: item.price,
                    qty: item.quantity,
                })),
                shippingAddress: {
                    address: formData.address,
                    city: formData.city,
                    state: formData.state,
                    zip: formData.zip,
                    country: 'USA' // Default or add field
                },
                paymentMethod: 'Credit Card',
                itemsPrice: getCartTotal(),
                shippingPrice: shipping,
                taxPrice: 0.0, // Calculate if needed
                totalPrice: total,
            };

            await axios.post('http://localhost:5001/api/orders', orderData, config);

            setOrderPlaced(true);
            clearCart();
        } catch (error: any) {
            console.error("Order placement failed", error);
            alert(error.response && error.response.data.message ? error.response.data.message : "Something went wrong sending order");
        }
    };

    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm text-center max-w-lg w-full">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle size={40} />
                    </div>
                    <h1 className="text-3xl font-heading font-bold text-dark mb-4">Order Confirmed!</h1>
                    <p className="text-gray-600 mb-8">
                        Thank you for your purchase. Your order has been placed successfully.
                    </p>
                    <button onClick={() => router.push('/account')} className="btn-primary w-full">
                        View Order in My Account
                    </button>
                </div>
            </div>
        );
    }

    const shipping = getCartTotal() > 50 ? 0 : 5.99;
    const total = getCartTotal() + shipping;

    return (
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
            <div className="container mx-auto px-4 md:px-6">
                <h1 className="text-3xl font-heading font-bold text-dark mb-8">Checkout</h1>

                <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
                    {/* Checkout Form */}
                    <div className="flex-1">
                        <form id="checkout-form" onSubmit={placeOrderHandler} className="space-y-8">

                            {/* Contact Info */}
                            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                                    <User className="text-primary" size={24} /> Contact Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text" name="firstName" placeholder="First Name" required
                                        value={formData.firstName} onChange={handleChange}
                                        className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    <input
                                        type="text" name="lastName" placeholder="Last Name" required
                                        value={formData.lastName} onChange={handleChange}
                                        className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    <input
                                        type="email" name="email" placeholder="Email Address" required
                                        value={formData.email} onChange={handleChange}
                                        className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none md:col-span-2"
                                    />
                                    <input
                                        type="tel" name="phone" placeholder="Phone Number" required
                                        value={formData.phone} onChange={handleChange}
                                        className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none md:col-span-2"
                                    />
                                </div>
                            </section>

                            {/* Shipping Address */}
                            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                                    <MapPin className="text-primary" size={24} /> Shipping Address
                                </h2>
                                <div className="space-y-4">
                                    <input
                                        type="text" name="address" placeholder="Street Address" required
                                        value={formData.address} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <input
                                            type="text" name="city" placeholder="City" required
                                            value={formData.city} onChange={handleChange}
                                            className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        />
                                        <input
                                            type="text" name="state" placeholder="State" required
                                            value={formData.state} onChange={handleChange}
                                            className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        />
                                        <input
                                            type="text" name="zip" placeholder="ZIP Code" required
                                            value={formData.zip} onChange={handleChange}
                                            className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Payment Info */}
                            <section className="bg-white p-6 md:p-8 rounded-2xl shadow-sm">
                                <h2 className="text-xl font-bold text-dark mb-6 flex items-center gap-2">
                                    <CreditCard className="text-primary" size={24} /> Payment Details
                                </h2>
                                <div className="space-y-4">
                                    <input
                                        type="text" name="cardNumber" placeholder="Card Number" required maxLength={16}
                                        value={formData.cardNumber} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    <input
                                        type="text" name="cardName" placeholder="Cardholder Name" required
                                        value={formData.cardName} onChange={handleChange}
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text" name="expiry" placeholder="MM/YY" required maxLength={5}
                                            value={formData.expiry} onChange={handleChange}
                                            className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        />
                                        <input
                                            type="text" name="cvv" placeholder="CVV" required maxLength={3}
                                            value={formData.cvv} onChange={handleChange}
                                            className="px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </section>
                        </form>
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="lg:w-96 flex-shrink-0">
                        <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                            <h2 className="font-heading font-bold text-xl text-dark mb-6">Order Summary</h2>

                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
                                {cartItems.map(item => (
                                    <div key={`${item.id}-${item.selectedSize}`} className="flex gap-3">
                                        <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-sm text-dark truncate">{item.name}</p>
                                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                                            <p className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 space-y-2">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span className="font-medium">${getCartTotal().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Shipping</span>
                                    <span className="font-medium">{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
                                </div>
                                <div className="border-t border-gray-100 pt-3 mt-2 flex justify-between text-lg font-bold text-dark">
                                    <span>Total</span>
                                    <span>${total.toFixed(2)}</span>
                                </div>
                            </div>

                            <button
                                type="submit"
                                form="checkout-form"
                                className="w-full btn-primary mt-6 py-4 text-lg shadow-lg shadow-primary/20"
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
