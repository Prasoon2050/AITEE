"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Check, Truck } from 'lucide-react';
import Link from 'next/link';

export default function AdminOrderDetails() {
    const { user } = useUser();
    const token = user?.token;
    const params = useParams();
    const router = useRouter();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const { id } = params;

    useEffect(() => {
        const fetchOrder = async () => {
            if (!token || !id) return;
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, config);
                setOrder(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching order", error);
                setLoading(false);
            }
        };

        fetchOrder();
    }, [token, id]);

    const deliverHandler = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            await axios.put(`http://localhost:5000/api/orders/${id}/deliver`, {}, config);
            // Refresh
            const { data } = await axios.get(`http://localhost:5000/api/orders/${id}`, config);
            setOrder(data);
        } catch (error) {
            console.error("Error updating order to delivered", error);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Link href="/admin/orders" className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors">
                <ArrowLeft size={20} /> Back to Orders
            </Link>

            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-heading font-bold text-dark">Order Details</h1>
                    <p className="text-gray-500">ID: {order._id}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Clean Details */}
                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-dark mb-4">Shipping Info</h2>
                        <p className="font-bold text-dark mb-1">{order.user?.name}</p>
                        <p className="text-gray-500 mb-1">Email: <a href={`mailto:${order.user?.email}`} className="text-primary hover:underline">{order.user?.email}</a></p>
                        <p className="text-gray-500">
                            Address: {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}, {order.shippingAddress.country}
                        </p>
                        {order.isDelivered ? (
                            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                                <Check size={20} /> Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
                            </div>
                        ) : (
                            <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg flex items-center gap-2">
                                <Truck size={20} /> Not Delivered
                            </div>
                        )}
                    </section>

                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-dark mb-4">Payment Method</h2>
                        <p className="text-gray-600 mb-2">Method: {order.paymentMethod}</p>
                        {order.isPaid ? (
                            <div className="p-3 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                                <Check size={20} /> Paid on {new Date(order.paidAt).toLocaleDateString()}
                            </div>
                        ) : (
                            <div className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center gap-2">
                                <Check size={20} /> Not Paid
                            </div>
                        )}
                    </section>

                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-dark mb-4">Order Items</h2>
                        <div className="space-y-4">
                            {order.orderItems.map((item: any, index: number) => (
                                <div key={index} className="flex gap-4 items-center">
                                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover bg-gray-100" />
                                    <div className="flex-1">
                                        <Link href={`/product/${item.product}`} className="font-medium text-dark hover:text-primary hover:underline">
                                            {item.name}
                                        </Link>
                                        <p className="text-sm text-gray-500">Qty: {item.qty} x ${item.price}</p>
                                    </div>
                                    <p className="font-bold text-dark">${(item.qty * item.price).toFixed(2)}</p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Actions */}
                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h2 className="text-xl font-bold text-dark mb-4">Order Summary</h2>
                        <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-gray-600">
                                <span>Items</span>
                                <span>${order.itemsPrice?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Shipping</span>
                                <span>${order.shippingPrice?.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Tax</span>
                                <span>${order.taxPrice?.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-dark text-lg">
                                <span>Total</span>
                                <span>${order.totalPrice.toFixed(2)}</span>
                            </div>
                        </div>

                        {!order.isDelivered && (
                            <button
                                onClick={deliverHandler}
                                className="btn-primary w-full py-3 text-lg shadow-lg shadow-primary/20"
                            >
                                Mark As Delivered
                            </button>
                        )}
                    </section>
                </div>
            </div>
        </div>
    );
}
