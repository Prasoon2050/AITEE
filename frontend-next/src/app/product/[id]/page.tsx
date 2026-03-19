"use client";

import React, { useState, use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star, ShoppingCart, Truck, ShieldCheck, RefreshCw, Loader2, MessageSquare, Heart } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { fetchProductById, createReview } from '@/lib/api';
import { useUser } from '@/context/UserContext';

const ProductDetail = ({ params }: { params: Promise<{ id: string }> }) => {
    const { id } = use(params);
    const router = useRouter();
    const { addToCart } = useCart();
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { user, isAuthenticated } = useUser();

    const [selectedSize, setSelectedSize] = useState('M');
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Review State
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    const loadProduct = async () => {
        try {
            const data = await fetchProductById(id);
            setProduct(data);
        } catch (err) {
            console.error("Failed to fetch product", err);
            setError('Product not found');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProduct();
    }, [id]);

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated || !user?.token) {
            router.push('/login');
            return;
        }
        setSubmittingReview(true);
        setReviewError('');
        try {
            await createReview(id, { rating, comment }, user.token);
            setComment('');
            setRating(5);
            await loadProduct(); // Refresh product to show new review
        } catch (err: any) {
            setReviewError(err.message);
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-dark mb-4">Product not found</h2>
                    <button onClick={() => router.push('/products')} className="btn-primary">
                        Back to Products
                    </button>
                </div>
            </div>
        );
    }

    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    const handleAddToCart = () => {
        addToCart({ ...product, id: product._id || product.id, selectedSize });
    };

    const isWishlisted = product ? isInWishlist(product._id || product.id) : false;

    const toggleWishlist = () => {
        if (isWishlisted) {
            removeFromWishlist(product._id || product.id);
        } else {
            addToWishlist(product);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 md:py-12">
            <div className="container mx-auto px-4 md:px-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-600 hover:text-primary mb-8 transition-colors font-medium"
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <div className="bg-white rounded-3xl shadow-sm overflow-hidden mb-12">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-12">

                        {/* Image Section */}
                        <div className="bg-gray-100 aspect-square lg:aspect-auto relative overflow-hidden group">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        {/* Info Section */}
                        <div className="p-6 md:p-10 lg:py-12 flex flex-col">
                            <div className="mb-6">
                                <span className="inline-block px-3 py-1 bg-indigo-50 text-primary text-xs font-bold uppercase tracking-wider rounded-full mb-4">
                                    {product.category}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-heading font-bold text-dark mb-2">
                                    {product.name}
                                </h1>
                                <p className="text-sm text-gray-500 mb-4">
                                    Created by <span className="font-semibold text-primary">{product.createdBy || 'Admin'}</span>
                                </p>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="flex items-center text-yellow-400 gap-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={18}
                                                fill={i < Math.round(product.rating || 0) ? "currentColor" : "none"}
                                                className={i < Math.round(product.rating || 0) ? "" : "text-gray-300"}
                                            />
                                        ))}
                                    </div>
                                    <span className="text-sm text-gray-500 font-medium">{product.rating?.toFixed(1) || 0} ({product.numReviews || 0} reviews)</span>
                                </div>

                                <div className="text-3xl font-bold text-dark mb-6">
                                    ${product.price.toFixed(2)}
                                </div>

                                <p className="text-gray-600 leading-relaxed mb-8">
                                    {product.description || "Experience premium comfort with our signature cotton blend. Designed for everyday wear, this piece combines durability with a soft touch, making it a wardrobe essential."}
                                </p>
                            </div>

                            <div className="space-y-6 mb-8">
                                {/* Size Selector */}
                                <div>
                                    <label className="block text-sm font-bold text-dark mb-3">Size: {selectedSize}</label>
                                    <div className="flex flex-wrap gap-3">
                                        {sizes.map(size => (
                                            <button
                                                key={size}
                                                onClick={() => setSelectedSize(size)}
                                                className={`w-12 h-12 flex items-center justify-center rounded-lg border text-sm font-medium transition-all ${selectedSize === size
                                                    ? 'border-primary bg-primary text-white shadow-md'
                                                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-8 border-t border-gray-100">
                                <div className="flex gap-4 mb-8">
                                    <button
                                        onClick={handleAddToCart}
                                        className="flex-1 btn-primary flex items-center justify-center gap-2 text-lg"
                                    >
                                        <ShoppingCart size={20} /> Add to Cart
                                    </button>
                                    <button
                                        onClick={toggleWishlist}
                                        className={`p-4 rounded-xl border-2 transition-all ${isWishlisted
                                            ? 'border-red-500 bg-red-50 text-red-500'
                                            : 'border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500'}`}
                                    >
                                        <Heart size={24} fill={isWishlisted ? "currentColor" : "none"} />
                                    </button>
                                </div>

                                <div className="grid grid-cols-3 gap-4 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                            <Truck size={20} />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">Free Shipping</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                                            <ShieldCheck size={20} />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">Secure Payment</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                            <RefreshCw size={20} />
                                        </div>
                                        <span className="text-xs font-medium text-gray-600">Free Returns</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Reviews Section */}
                <div className="bg-white rounded-3xl shadow-sm p-6 md:p-10">
                    <h2 className="text-2xl font-heading font-bold text-dark mb-8 flex items-center gap-2">
                        <MessageSquare className="text-primary" /> Customer Reviews
                    </h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Review List */}
                        <div className="space-y-6">
                            {product.reviews && product.reviews.length > 0 ? (
                                product.reviews.map((review: any) => (
                                    <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                                        <div className="flex items-center justify-between mb-2">
                                            <h4 className="font-bold text-dark">{review.name}</h4>
                                            <div className="flex text-yellow-400">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        size={14}
                                                        fill={i < review.rating ? "currentColor" : "none"}
                                                        className={i < review.rating ? "" : "text-gray-300"}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-gray-600 text-sm mb-2">{review.comment}</p>
                                        <p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-8 bg-gray-50 rounded-xl">
                                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                                </div>
                            )}
                        </div>

                        {/* Review Form */}
                        <div className="bg-gray-50 p-6 rounded-2xl h-fit">
                            <h3 className="font-bold text-lg text-dark mb-4">Write a Review</h3>
                            {isAuthenticated ? (
                                <form onSubmit={handleReviewSubmit} className="space-y-4">
                                    {reviewError && (
                                        <div className="bg-red-50 text-red-500 text-sm p-3 rounded-lg">
                                            {reviewError}
                                        </div>
                                    )}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                        <div className="flex gap-2 mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setRating(star)}
                                                    className="focus:outline-none transition-colors hover:scale-110 active:scale-95"
                                                >
                                                    <Star
                                                        size={28}
                                                        fill={star <= rating ? "currentColor" : "none"}
                                                        className={star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-200"}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            rows={4}
                                            className="w-full p-3 rounded-lg border border-gray-200 focus:border-primary outline-none resize-none"
                                            placeholder="Share your thoughts..."
                                        ></textarea>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={submittingReview}
                                        className="w-full btn-primary disabled:opacity-70"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                </form>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-gray-600 mb-4">Please sign in to write a review.</p>
                                    <button
                                        onClick={() => router.push('/login')}
                                        className="btn-primary w-full"
                                    >
                                        Sign In
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
