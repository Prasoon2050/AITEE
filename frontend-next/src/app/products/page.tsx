"use client";

import React, { useState, useMemo, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Filter, Search, ChevronDown } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/data/products';
import { fetchProducts } from '@/lib/api';

const ProductsContent = () => {
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams.get('category');

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || 'All');
    const [sortBy, setSortBy] = useState('name');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const data = await fetchProducts();
                console.log("Fetched products:", data);
                if (Array.isArray(data)) {
                    setProducts(data);
                } else {
                    console.error("Fetched data is not an array:", data);
                    setProducts([]);
                }
            } catch (error) {
                console.error("Failed to fetch products", error);
                setProducts([]); // Fallback to empty array
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

    const filteredAndSortedProducts = useMemo(() => {
        let filtered = products;

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                p.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        const sorted = [...filtered].sort((a, b) => {
            switch (sortBy) {
                case 'price-low': return a.price - b.price;
                case 'price-high': return b.price - a.price;
                case 'name': return a.name.localeCompare(b.name);
                default: return 0;
            }
        });

        return sorted;
    }, [selectedCategory, searchTerm, sortBy, products]);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 md:px-6">

                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-heading font-bold text-dark">Shop All</h1>
                        <p className="text-gray-500 mt-1">
                            {filteredAndSortedProducts.length} products found
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none w-full sm:w-64"
                            />
                        </div>

                        {/* Mobile Filter Toggle */}
                        <button
                            className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg font-medium"
                            onClick={() => setIsFilterOpen(!isFilterOpen)}
                        >
                            <Filter size={20} /> Filters
                        </button>

                        {/* Sort */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-2 rounded-lg border border-gray-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none cursor-pointer w-full sm:w-auto"
                            >
                                <option value="name">Sort by Name</option>
                                <option value="price-low">Price: Low to High</option>
                                <option value="price-high">Price: High to Low</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className={`md:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white p-6 rounded-2xl shadow-sm sticky top-24">
                            <h3 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
                                <Filter size={20} /> Categories
                            </h3>
                            <div className="space-y-2">
                                {categories.map(category => (
                                    <label key={category} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="category"
                                            value={category}
                                            checked={selectedCategory === category}
                                            onChange={(e) => setSelectedCategory(e.target.value)}
                                            className="w-4 h-4 text-primary border-gray-300 focus:ring-primary"
                                        />
                                        <span className={`text-sm group-hover:text-primary transition-colors ${selectedCategory === category ? 'font-medium text-dark' : 'text-gray-600'}`}>
                                            {category}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Product Grid */}
                    <div className="flex-1">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : filteredAndSortedProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                                <Search size={48} className="text-gray-300 mb-4" />
                                <h3 className="text-xl font-bold text-dark mb-2">No products found</h3>
                                <p className="text-gray-500">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredAndSortedProducts.map(product => (
                                    <ProductCard key={product._id || product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const Products = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProductsContent />
        </Suspense>
    );
};

export default Products;
