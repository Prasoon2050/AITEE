"use client";

import React, { useState, useEffect } from 'react';
import { useUser } from '@/context/UserContext';
import { User, Package, Palette, DollarSign, Settings, LogOut, Trash2, ExternalLink } from 'lucide-react';
import axios from 'axios';

const OrdersTab = ({ token }: { token?: string }) => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                const { data } = await axios.get('https://aitee-backend.vercel.app/api/orders/myorders', config);
                setOrders(data);
            } catch (error) {
                console.error("Failed to fetch orders", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrders();
    }, [token]);

    if (loading) return <div>Loading orders...</div>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-heading font-bold text-dark">Order History</h2>
            <div className="space-y-4">
                {orders && orders.length > 0 ? orders.map((order) => (
                    <div key={order._id} className="bg-white p-6 rounded-xl border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <p className="font-bold text-dark">ID: {order._id}</p>
                            <p className="text-sm text-gray-500">
                                {new Date(order.createdAt).toLocaleDateString()} • {order.orderItems.length} items
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {order.isDelivered ? 'Delivered' : (order.isPaid ? 'Processing' : 'Unpaid')}
                            </span>
                            <span className="font-bold text-dark">${order.totalPrice.toFixed(2)}</span>
                        </div>
                    </div>
                )) : (
                    <p className="text-gray-500">No orders yet.</p>
                )}
            </div>
        </div>
    );
};

const Account = () => {
    const { user, logout, isAuthenticated } = useUser();
    const [activeTab, setActiveTab] = useState('profile');

    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
                <p className="text-gray-600 mb-8">You need to be logged in to view your account.</p>
                <a href="/login" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                    Sign In
                </a>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'orders', label: 'Orders', icon: Package },
        { id: 'designs', label: 'My Designs', icon: Palette },
        { id: 'earnings', label: 'Earnings', icon: DollarSign },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-heading font-bold text-dark">Personal Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" defaultValue={user.name} className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" defaultValue={user.email} className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary" />
                            </div>
                        </div>
                        <button className="btn-primary">Save Changes</button>
                    </div>
                );
            case 'orders':
                return (
                    <OrdersTab token={user?.token} />
                );
            case 'designs':
                return (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-heading font-bold text-dark">My Designs</h2>
                            <button className="btn-primary text-sm">Create New</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {user.designs && user.designs.length > 0 ? user.designs.map((design) => (
                                <div key={design.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden group">
                                    <div className="relative aspect-square bg-gray-50">
                                        <img src={design.image} alt={design.title} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button className="p-2 bg-white rounded-full text-gray-700 hover:text-primary transition-colors" title="View">
                                                <ExternalLink size={18} />
                                            </button>
                                            <button className="p-2 bg-white rounded-full text-gray-700 hover:text-red-500 transition-colors" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-dark">{design.title}</h3>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${design.status === 'Listed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {design.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm text-gray-500">
                                            <span>{design.sales} Sales</span>
                                            <span>${design.earnings} Earned</span>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-gray-500">No designs yet.</p>
                            )}
                        </div>
                    </div>
                );
            case 'earnings':
                return (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-heading font-bold text-dark">Earnings & Rewards</h2>
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
                            <p className="text-indigo-100 mb-1">Total Balance</p>
                            <h3 className="text-4xl font-bold mb-6">${(user.balance || 0).toFixed(2)}</h3>
                            <button className="bg-white text-primary px-6 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors">
                                Withdraw Funds
                            </button>
                        </div>
                    </div>
                );
            default:
                return <div>Select a tab</div>;
        }
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar */}
                <div className="w-full lg:w-64 flex-shrink-0 space-y-2">
                    <div className="bg-white p-6 rounded-2xl border border-gray-100 mb-6 text-center">
                        <img src={user.avatar} alt={user.name} className="w-20 h-20 rounded-full mx-auto mb-4 bg-gray-100" />
                        <h3 className="font-bold text-dark">{user.name}</h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                    </div>

                    <nav className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-6 py-4 text-left transition-colors ${activeTab === tab.id
                                    ? 'bg-indigo-50 text-primary border-l-4 border-primary'
                                    : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
                                    }`}
                            >
                                <tab.icon size={20} />
                                <span className="font-medium">{tab.label}</span>
                            </button>
                        ))}
                        <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-6 py-4 text-left text-red-500 hover:bg-red-50 transition-colors border-l-4 border-transparent"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Sign Out</span>
                        </button>
                    </nav>
                </div>

                {/* Main Content */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-6 md:p-8 min-h-[500px]">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default Account;
