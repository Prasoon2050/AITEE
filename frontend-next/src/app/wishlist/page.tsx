"use client";

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

const Wishlist = () => {
    const { wishlistItems } = useWishlist();

    if (wishlistItems.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
                <div className="text-center max-w-md px-4">
                    <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                        <Heart size={32} />
                    </div>
                    <h1 className="text-2xl font-heading font-bold text-dark mb-3">Your wishlist is empty</h1>
                    <p className="text-gray-500 mb-8">Save items you love to revisit them later.</p>
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
                <h1 className="text-3xl font-heading font-bold text-dark mb-8">My Wishlist ({wishlistItems.length})</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {wishlistItems.map((item) => (
                        <ProductCard key={item.id} product={item as any} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Wishlist;
