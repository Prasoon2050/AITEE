"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCart, Heart, ShoppingBag } from 'lucide-react';
import { useCart, CartItem } from '../context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { Product } from '@/data/products';

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [isHovered, setIsHovered] = React.useState(false);

    const renderImages = product.images?.filter((img) => img.includes('?type=render')) || [];
    
    // Use first render image as default, fallback to regular images array if empty, then 'image' field
    const primaryImage = renderImages[0] || product.images?.[0] || product.image;
    
    // Use second render image for hover. If no second render image, stick to primary so we don't zoom into the raw artwork
    const secondaryImage = renderImages[1] || primaryImage;

    const isWishlisted = isInWishlist(product._id || product.id!);

    const toggleWishlist = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        if (isWishlisted) {
            removeFromWishlist(product._id || product.id!);
        } else {
            addToWishlist(product);
        }
    };

    const handleAddToCart = () => {
        addToCart({ ...product, id: product._id || product.id, quantity: 1 });
    };

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
            {/* Image Container */}
            <Link href={`/product/${product._id || product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                <img
                    src={isHovered ? secondaryImage : primaryImage}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />

                {/* Badge for multiple views if applicable */}
                {renderImages.length > 1 && (
                    <div className="absolute top-3 right-3 bg-white/80 backdrop-blur px-2 py-1 rounded-full text-[10px] font-bold text-gray-600 shadow-sm">
                        Front & Back
                    </div>
                )}

                <button
                    onClick={toggleWishlist}
                    className={`absolute top-4 right-4 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-red-50 ${isWishlisted ? 'text-red-500 opacity-100 translate-y-0' : 'text-gray-400 hover:text-red-500'}`}
                >
                    <Heart size={20} fill={isWishlisted ? "currentColor" : "none"} />
                </button>

                {/* New Shopping Bag button */}
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(); }}
                    className="absolute bottom-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 text-dark hover:text-primary"
                    title="Add to Cart"
                >
                    <ShoppingBag size={20} />
                </button>
            </Link>

            {/* Content */}
            <div className="p-4">
                <div className="mb-2">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{product.category}</p>
                    <Link href={`/product/${product._id || product.id}`}>
                        <h3 className="font-heading font-bold text-lg text-dark group-hover:text-primary transition-colors line-clamp-1">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="flex items-center justify-between mt-4">
                    <span className="font-bold text-xl text-dark">${product.price}</span>

                    <button
                        onClick={handleAddToCart}
                        className="p-2 bg-gray-100 text-dark rounded-full hover:bg-primary hover:text-white transition-colors active:scale-95"
                        title="Add to Cart"
                    >
                        <ShoppingCart size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
