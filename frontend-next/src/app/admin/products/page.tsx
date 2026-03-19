"use client";

import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/UserContext';
import axios from 'axios';
import { Edit, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminProducts() {
    const { user } = useUser();
    const token = user?.token;
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/products');
            setProducts(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching products", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const deleteHandler = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const config = { headers: { Authorization: `Bearer ${token}` } };
                await axios.delete(`http://localhost:5000/api/products/${id}`, config);
                fetchProducts();
            } catch (error) {
                console.error("Error deleting product", error);
            }
        }
    };

    const createProductHandler = () => {
        // Placeholder for create product logic
        // Could be a modal or redirect to /admin/products/create
        alert("Create product feature coming soon");
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-heading font-bold text-dark">Products</h1>
                <button onClick={createProductHandler} className="btn-primary flex items-center gap-2">
                    <Plus size={20} /> Create Product
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="py-4 px-6 font-semibold text-gray-600">ID</th>
                            <th className="py-4 px-6 font-semibold text-gray-600">Name</th>
                            <th className="py-4 px-6 font-semibold text-gray-600">Price</th>
                            <th className="py-4 px-6 font-semibold text-gray-600">Category</th>
                            <th className="py-4 px-6 font-semibold text-gray-600">Brand</th>
                            <th className="py-4 px-6 font-semibold text-gray-600">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product: any) => (
                            <tr key={product._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-6 text-sm text-gray-500 font-mono">{product._id.substring(0, 10)}...</td>
                                <td className="py-4 px-6 font-medium text-dark">{product.name}</td>
                                <td className="py-4 px-6 font-bold text-dark">${product.price}</td>
                                <td className="py-4 px-6 text-gray-600">{product.category}</td>
                                <td className="py-4 px-6 text-gray-600">{product.brand}</td>
                                <td className="py-4 px-6 flex gap-3">
                                    <Link href={`/admin/products/${product._id}/edit`} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                                        <Edit size={18} />
                                    </Link>
                                    <button
                                        onClick={() => deleteHandler(product._id)}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
