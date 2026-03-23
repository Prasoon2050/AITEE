"use client";

import React, { useEffect, useState } from 'react';
import { DollarSign, ShoppingBag, Users, Package } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import axios from 'axios';

export default function AdminDashboard() {
    const { user } = useUser();
    const token = user?.token;
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0,
        totalUsers: 0 // We might not have an endpoint for this yet, so maybe skip or mock
    });
    const [recentOrders, setRecentOrders] = useState([]);

    useEffect(() => {
        const fetchStats = async () => {
            if (!token) return;
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };

                // Fetch Orders
                const { data: orders } = await axios.get('https://aitee-backend.vercel.app/api/orders', config);
                const totalSales = orders.reduce((acc: any, order: any) => acc + (order.isPaid ? order.totalPrice : 0), 0);

                // Fetch Products
                const { data: products } = await axios.get('https://aitee-backend.vercel.app/api/products');

                setStats({
                    totalSales,
                    totalOrders: orders.length,
                    totalProducts: products.length,
                    totalUsers: 0
                });

                setRecentOrders(orders.slice(0, 5));

            } catch (error) {
                console.error("Error fetching admin stats", error);
            }
        };

        fetchStats();
    }, [token]);

    const statCards = [
        { label: 'Total Sales', value: `$${stats.totalSales.toFixed(2)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
        { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-100' },
        { label: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
    ];

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-dark">Dashboard</h1>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                            <stat.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-dark">{stat.value}</h3>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h2 className="text-xl font-bold text-dark mb-6">Recent Orders</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-100 text-sm text-gray-500">
                                <th className="py-3 px-4 font-medium">Order ID</th>
                                <th className="py-3 px-4 font-medium">Customer</th>
                                <th className="py-3 px-4 font-medium">Date</th>
                                <th className="py-3 px-4 font-medium">Total</th>
                                <th className="py-3 px-4 font-medium">Paid</th>
                                <th className="py-3 px-4 font-medium">Delivered</th>
                                <th className="py-3 px-4 font-medium">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {recentOrders.map((order: any) => (
                                <tr key={order._id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 px-4 truncate max-w-[100px]">{order._id}</td>
                                    <td className="py-3 px-4">{order.user?.name || 'User'}</td>
                                    <td className="py-3 px-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td className="py-3 px-4 font-bold">${order.totalPrice.toFixed(2)}</td>
                                    <td className="py-3 px-4">
                                        {order.isPaid
                                            ? <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">Paid</span>
                                            : <span className="text-red-600 bg-red-100 px-2 py-1 rounded text-xs font-bold">Not Paid</span>
                                        }
                                    </td>
                                    <td className="py-3 px-4">
                                        {order.isDelivered
                                            ? <span className="text-green-600 bg-green-100 px-2 py-1 rounded text-xs font-bold">Delivered</span>
                                            : <span className="text-yellow-600 bg-yellow-100 px-2 py-1 rounded text-xs font-bold">Pending</span>
                                        }
                                    </td>
                                    <td className="py-3 px-4">
                                        <a href={`/admin/orders/${order._id}`} className="text-primary hover:underline font-medium">Details</a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
