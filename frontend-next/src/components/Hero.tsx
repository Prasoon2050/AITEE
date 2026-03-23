"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Image from "next/image";

const images = [
    "/420.jpg",
    "/hero2.png",
    "/hero3.png"
];

const Hero = () => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5001);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="relative bg-gray-50 overflow-hidden">
            <div className="container mx-auto px-4 md:px-6 pb-12 pt-6 md:pb-24 md:pt-12 lg:pb-32 lg:pt-20 flex flex-col-reverse lg:flex-row items-center gap-12">

                {/* Text Content */}
                <div className="flex-1 text-center lg:text-left z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="inline-block py-1 px-3 rounded-full bg-indigo-100 text-primary text-sm font-semibold mb-6">
                            AI-Powered Fashion Revolution
                        </span>
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold text-dark leading-tight mb-6">
                            Wear Unique AI Art <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                                or Create & Earn
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                            Shop exclusive t-shirts designed by our community using AI. Or unleash your creativity, design your own, and earn rewards when others buy.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                            <Link href="/products" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group">
                                Shop Collection
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link href="/create" className="btn-secondary w-full sm:w-auto flex items-center justify-center gap-2">
                                Start Designing
                            </Link>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.5 }}
                        className="mt-12 flex items-center justify-center lg:justify-start gap-8 text-gray-500"
                    >
                        <div className="flex flex-col items-center lg:items-start">
                            <span className="font-bold text-2xl text-dark">50k+</span>
                            <span className="text-sm">Happy Customers</span>
                        </div>
                        <div className="w-px h-12 bg-gray-200"></div>
                        <div className="flex flex-col items-center lg:items-start">
                            <span className="font-bold text-2xl text-dark">100+</span>
                            <span className="text-sm">Unique Designs</span>
                        </div>
                    </motion.div>
                </div>

                {/* Image Content */}
                <div className="flex-1 relative w-full max-w-lg lg:max-w-none">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="relative z-10"
                    >
                        <div className="relative aspect-square rounded-3xl overflow-hidden shadow-2xl bg-white">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentImageIndex}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0"
                                >
                                    <Image
                                        src={images[currentImageIndex]}
                                        alt={`Hero Image ${currentImageIndex + 1}`}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Floating Cards */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.5 }}
                            className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl z-20 hidden md:block"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                    ★
                                </div>
                                <div>
                                    <p className="font-bold text-dark">Premium Quality</p>
                                    <p className="text-xs text-gray-500">100% Cotton</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>

                    {/* Background Blobs */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-200/30 to-purple-200/30 rounded-full blur-3xl -z-10"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
