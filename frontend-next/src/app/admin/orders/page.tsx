"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import axios from 'axios';
import Link from 'next/link';

export default function AdminOrders() {
    const { user } = useUser();
    const token = user?.token;
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) return;
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('http://localhost:5000/api/orders', config);
                setOrders(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching orders", error);
                setLoading(false);
            }
        };

        fetchOrders();
    }, [token]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-heading font-bold text-dark">Orders</h1>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-4 px-6 font-semibold text-gray-600">ID</th>
                            <th className="py-4 px-6 font-semibold text-gray-600">User</th>
                            <th className="py-4 px-6 font-semibold text-gray-600">Date</th>
                            <th className="py-4 px-6 font-semibold text-gray-600">Total</th>
                            <th className="py-4 px-6 font-semibold text-gray-600">Paid</th>
                            <th className="py-4 px-6 font-semibold text-gray-600">Delivered</th>
                            <th className="py-4 px-6 font-semibold text-gray-600">Details</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order: any) => (
                            <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6 text-sm text-gray-500 font-mono">{order._id.substring(0, 10)}...</td>
                                <td className="py-4 px-6 font-medium text-dark">{order.user && order.user.name ? order.user.name : 'User'}</td>
                                <td className="py-4 px-6 text-gray-600">{new Date(order.createdAt).toLocaleDateString()}</td>
                                <td className="py-4 px-6 font-bold text-dark">${order.totalPrice.toFixed(2)}</td>
                                <td className="py-4 px-6">
                                    {order.isPaid
                                        ? <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">Paid</span>
                                        : <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold w-12 text-center" >Date: {order.paidAt ? order.paidAt.substring(0, 10) : 'Not Paid'}</span>
                                    }
                                </td>
                                <td className="py-4 px-6">
                                    {order.isDelivered
                                        ? <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">Delivered</span>
                                        : <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold">Pending</span>
                                    }
                                </td>
                                <td className="py-4 px-6">
                                    <Link href={`/admin/orders/${order._id}`} className="btn-secondary text-sm py-2 px-4">
                                        Details
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
