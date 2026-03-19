"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useUser } from '../context/UserContext';
import { ShoppingBag, Menu, X, Search, Heart } from 'lucide-react';

const Header = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cartItems } = useCart();
    const { wishlistItems } = useWishlist();
    const { user, isAuthenticated } = useUser();
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Shop', path: '/products' },
        { name: 'Create', path: '/create' },
        { name: 'About', path: '/about' },
    ];

    const isActive = (path: string) => pathname === path;

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:scale-110 transition-transform">
                            T
                        </div>
                        <span className="font-heading font-bold text-2xl tracking-tight text-dark">
                            TeeStore
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.path}
                                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.path) ? 'text-primary' : 'text-gray-600'
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                            <Search size={20} />
                        </button>

                        <Link href="/wishlist" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 group">
                            <Heart size={20} className="group-hover:text-red-500 transition-colors" />
                            {wishlistItems.length > 0 && (
                                <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                    {wishlistItems.length}
                                </span>
                            )}
                        </Link>

                        <Link href="/cart" className="relative p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 group">
                            <ShoppingBag size={20} className="group-hover:text-primary transition-colors" />
                            {cartItems.length > 0 && (
                                <span className="absolute top-0 right-0 w-5 h-5 bg-primary text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                    {cartItems.length}
                                </span>
                            )}
                        </Link>

                        {/* Auth Button */}
                        {isAuthenticated && user ? (
                            <Link href="/account" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600 group" title="Account">
                                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold text-xs border border-indigo-200 group-hover:border-primary transition-colors overflow-hidden">
                                    {user.avatar ? (
                                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name.charAt(0).toUpperCase()
                                    )}
                                </div>
                            </Link>
                        ) : (
                            <Link href="/login" className="px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-indigo-700 transition-colors">
                                Sign In
                            </Link>
                        )}

                        <button
                            className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg p-4 flex flex-col gap-4 animate-in slide-in-from-top-5">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            href={link.path}
                            className={`text-lg font-medium py-2 border-b border-gray-50 last:border-0 ${isActive(link.path) ? 'text-primary' : 'text-gray-600'
                                }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}
        </header>
    );
};

export default Header;
