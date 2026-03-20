"use client";

import React, { useState, useRef } from 'react';
import { Upload, Wand2, ArrowLeft, Move, Eraser, RotateCcw, Save, ImageIcon, Loader2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the 3D canvas to avoid SSR issues with Three.js
const TShirtCanvas = dynamic(() => import('@/components/TShirtCanvas'), { ssr: false });

const CreateDesign = () => {
    const { addDesign, user } = useUser();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'upload' | 'prompt'>('upload');
    const [color, setColor] = useState('#ffffff');
    const [canvasZoom, setCanvasZoom] = useState(1);
    const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

    // Separate state for Front and Back
    const [sides, setSides] = useState({
        front: {
            image: null as string | null,
            position: [0, 0.2, 0.11] as [number, number, number],
            scale: 0.3,
            borderRadius: 0
        },
        back: {
            image: null as string | null,
            position: [0, 0.2, 0.11] as [number, number, number],
            scale: 0.3,
            borderRadius: 0
        }
    });

    const fileInputRef = useRef<HTMLInputElement>(null);
    const captureRef = useRef<(() => Promise<string | null>) | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const colors = ['#ffffff', '#111827', '#4f46e5', '#dc2626', '#16a34a'];

    // Helper to update current side
    const updateSide = (updates: Partial<typeof sides.front>) => {
        setSides(prev => ({
            ...prev,
            [viewSide]: { ...prev[viewSide], ...updates }
        }));
    };

    const currentSide = sides[viewSide];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File size exceeds 5MB limit.");
                return;
            }

            try {
                const reader = new FileReader();
                reader.onload = (event) => {
                    if (event.target?.result) {
                        updateSide({ image: event.target.result as string });
                    } else {
                        setError("Failed to read file.");
                    }
                };
                reader.onerror = () => setError("Error reading file.");
                reader.readAsDataURL(file);
            } catch (err) {
                console.error("Upload error:", err);
                setError("An unexpected error occurred during upload.");
            }
        }
    };

    const handleGenerateImage = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Failed to generate image');

            if (data.imageUrl) {
                updateSide({ image: data.imageUrl });
            }
        } catch (err: any) {
            console.error("Generation error:", err);
            setError(err.message || "Failed to generate image.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!sides.front.image && !sides.back.image) {
            setError("Please add a design to at least one side.");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            // Get token from context or consistent storage key
            const token = user?.token || (localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!).token : null);

            if (!token) {
                setError("You must be logged in to save designs.");
                setIsSaving(false);
                return;
            }

            const API_URL = 'http://localhost:5000/api';

            // Helper function to convert URL to base64
            const urlToBase64 = async (url: string): Promise<string | null> => {
                try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onloadend = () => resolve(reader.result as string);
                        reader.onerror = () => resolve(null);
                        reader.readAsDataURL(blob);
                    });
                } catch (err) {
                    console.error("Failed to convert URL to base64:", err);
                    return null;
                }
            };

            // Helper function to capture current canvas view
            const captureCurrentView = async (): Promise<string | null> => {
                return new Promise((resolve) => {
                    // Wait a frame for React to render
                    setTimeout(async () => {
                        if (captureRef.current) {
                            try {
                                const result = await captureRef.current();
                                resolve(result);
                            } catch (err) {
                                console.error("Capture error:", err);
                                resolve(null);
                            }
                        } else {
                            resolve(null);
                        }
                    }, 200);
                });
            };

            // Prepare images to upload
            const imagesToUpload: { image: string; folder: string; type: 'render' | 'design' }[] = [];
            
            // Save current view state
            const originalView = viewSide;

            // Capture Front T-shirt with design
            if (sides.front.image) {
                setViewSide('front');
                await new Promise(r => setTimeout(r, 800)); // Wait for render
                const frontCanvasImage = await captureCurrentView();
                if (frontCanvasImage) {
                    imagesToUpload.push({ image: frontCanvasImage, folder: 'products', type: 'render' });
                }
                // Also save the original design image - convert URL to base64 if needed
                if (sides.front.image.startsWith('http')) {
                    const base64Image = await urlToBase64(sides.front.image);
                    if (base64Image) {
                        imagesToUpload.push({ image: base64Image, folder: 'products', type: 'design' });
                    }
                } else if (sides.front.image.startsWith('data:')) {
                    imagesToUpload.push({ image: sides.front.image, folder: 'products', type: 'design' });
                }
            }

            // Capture Back T-shirt with design
            if (sides.back.image) {
                setViewSide('back');
                await new Promise(r => setTimeout(r, 800)); // Wait for render
                const backCanvasImage = await captureCurrentView();
                if (backCanvasImage) {
                    imagesToUpload.push({ image: backCanvasImage, folder: 'products', type: 'render' });
                }
                // Also save the original design image - convert URL to base64 if needed
                if (sides.back.image.startsWith('http')) {
                    const base64Image = await urlToBase64(sides.back.image);
                    if (base64Image) {
                        imagesToUpload.push({ image: base64Image, folder: 'products', type: 'design' });
                    }
                } else if (sides.back.image.startsWith('data:')) {
                    imagesToUpload.push({ image: sides.back.image, folder: 'products', type: 'design' });
                }
            }

            // Restore original view
            setViewSide(originalView);

            // Filter out any null or invalid images
            const validImages = imagesToUpload.filter(img => img.image && img.image.startsWith('data:'));

            if (validImages.length === 0) {
                throw new Error("Failed to capture any images. Please try again.");
            }

            console.log(`Uploading ${validImages.length} images to S3...`);

            // Upload all images to S3
            const uploadResponse = await fetch(`${API_URL}/images/upload-multiple-base64`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ images: validImages }),
            });

            // Check if response is JSON
            const contentType = uploadResponse.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await uploadResponse.text();
                console.error("Non-JSON response:", text);
                throw new Error('Server returned an invalid response. Please check if the backend is running.');
            }

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadData.message || 'Failed to upload images to S3');
            }

            const uploadedUrls = uploadData.imageUrls || [];
            
            if (uploadedUrls.length === 0) {
                throw new Error("No images were uploaded successfully.");
            }

            // Separate render URLs and design URLs
            const renderUrls: string[] = [];
            const designUrls: string[] = [];
            
            uploadData.uploads.forEach((upload: { imageUrl: string; key: string | null }, index: number) => {
                const imgType = validImages[index]?.type;
                if (imgType === 'render') {
                    // Append query param to uniquely identify renders for the hover effect
                    renderUrls.push(upload.imageUrl + '?type=render');
                } else {
                    designUrls.push(upload.imageUrl);
                }
            });

            // Use front render as primary, or first available URL
            const primaryImage = renderUrls[0] || uploadedUrls[0];

            console.log("Creating product with image:", primaryImage);

            // Create Product with S3 URLs
            const productResponse = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: prompt ? `AI Tee: ${prompt.substring(0, 30)}` : 'Custom T-Shirt Design',
                    description: prompt 
                        ? `Custom designed t-shirt featuring AI-generated art. Prompt: "${prompt}"`
                        : 'A custom designed t-shirt with uploaded artwork.',
                    price: 29.99,
                    brand: 'AITEE Custom',
                    category: 'T-Shirts',
                    countInStock: 100,
                    image: primaryImage,
                    images: [...renderUrls, ...designUrls],
                }),
            });

            const productData = await productResponse.json();

            if (!productResponse.ok) {
                throw new Error(productData.message || 'Failed to create product');
            }

            // Add to local context if needed, but router push handles data fetch usually
            addDesign({
                id: productData._id,
                title: productData.name,
                status: 'Public', // Default to public/listed as requested
                sales: 0,
                earnings: 0,
                image: productData.image
            });

            router.push('/products'); // Go to products page to see it
        } catch (err: any) {
            console.error("Save error:", err);
            setError(err.message || "Failed to save design.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-heading font-bold text-dark mb-4">Design Your Tee</h1>
                    <p className="text-gray-600 text-lg">Upload your art or generate it with AI, then position it on the 3D model.</p>
                    {error && (
                        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg inline-block border border-red-200">
                            {error}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* 3D Canvas Area */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm h-[500px] lg:h-[600px] relative">
                            <TShirtCanvas
                                color={color}
                                textureUrl={currentSide.image}
                                decalPosition={currentSide.position}
                                decalScale={currentSide.scale}
                                zoom={canvasZoom}
                                viewSide={viewSide}
                                borderRadius={currentSide.borderRadius}
                                onDecalPositionChange={(pos) => updateSide({ position: pos })}
                                onDecalScaleChange={(s) => updateSide({ scale: s })}
                                onZoomChange={(z) => setCanvasZoom(z)}
                                onRemoveDesign={() => updateSide({ image: null })}
                                onCapture={(fn) => captureRef.current = fn}
                            />
                            <div className="absolute bottom-6 right-6 bg-white/90 backdrop-blur px-4 py-2 rounded-full text-xs font-medium text-gray-500 shadow-sm pointer-events-none">
                                Drag image to move • Drag background to rotate
                            </div>
                        </div>

                        {/* View Switcher - Moved here for better visibility */}
                        <div className="flex justify-center">
                            <button
                                onClick={() => setViewSide(prev => prev === 'front' ? 'back' : 'front')}
                                className="px-6 py-3 bg-white border border-gray-200 shadow-sm rounded-full text-sm font-bold text-dark hover:bg-gray-50 flex items-center gap-2 transition-all hover:shadow-md"
                            >
                                <RotateCcw size={18} className={`transition-transform duration-300 ${viewSide === 'back' ? 'rotate-180' : ''}`} />
                                {viewSide === 'front' ? 'Switch to Back View' : 'Switch to Front View'}
                            </button>
                        </div>
                    </div>

                    {/* Controls Area */}
                    <div className="space-y-6">

                        {/* Tabs */}
                        <div className="flex p-1 bg-gray-100 rounded-xl">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'upload' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Upload size={18} /> Upload
                            </button>
                            <button
                                onClick={() => setActiveTab('prompt')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === 'prompt' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Wand2 size={18} /> AI Generate
                            </button>
                        </div>

                        {/* Input Area */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm min-h-[200px]">
                            {activeTab === 'upload' ? (
                                <>
                                    <h3 className="font-bold text-dark mb-4 flex items-center gap-2">
                                        <ImageIcon size={20} className="text-primary" /> Upload Image
                                    </h3>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors bg-gray-50 hover:bg-indigo-50"
                                    >
                                        <Upload size={32} className="mb-2" />
                                        <span className="font-medium">Click to upload ({viewSide})</span>
                                        <span className="text-xs mt-1">PNG, JPG up to 5MB</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <h3 className="font-bold text-dark mb-4 flex items-center gap-2">
                                        <Wand2 size={20} className="text-primary" /> AI Generation
                                    </h3>
                                    <div className="space-y-3">
                                        <textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder={`Describe your ${viewSide} design...`}
                                            className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary min-h-[100px] resize-none text-sm"
                                        />
                                        <button
                                            onClick={handleGenerateImage}
                                            disabled={isGenerating || !prompt.trim()}
                                            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 size={18} className="animate-spin" /> Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 size={18} /> Generate Design
                                                </>
                                            )}
                                        </button>
                                        <p className="text-xs text-gray-400 text-center">
                                            Powered by Gemini & Pollinations AI
                                        </p>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Customization Controls */}
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">

                            {/* Color Picker */}
                            <div>
                                <label className="block text-sm font-bold text-dark mb-3">T-Shirt Color</label>
                                <div className="flex gap-3 flex-wrap">
                                    {colors.map((c) => (
                                        <button
                                            key={c}
                                            onClick={() => setColor(c)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all ${color === c ? 'border-primary scale-110 shadow-md' : 'border-gray-200'}`}
                                            style={{ backgroundColor: c }}
                                            title={c}
                                        />
                                    ))}
                                </div>
                            </div>

                            {currentSide.image && (
                                <>
                                    <div className="h-px bg-gray-100"></div>

                                    {/* Position & Scale */}
                                    <div>
                                        <label className="block text-sm font-bold text-dark mb-3 flex items-center gap-2">
                                            <Move size={16} /> Adjustments ({viewSide})
                                        </label>

                                        <div className="space-y-4">
                                            <div>
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>Scale Image</span>
                                                    <span>{(currentSide.scale * 100).toFixed(0)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.1"
                                                    max="0.8"
                                                    step="0.01"
                                                    value={currentSide.scale}
                                                    onChange={(e) => updateSide({ scale: parseFloat(e.target.value) })}
                                                    className="w-full accent-primary"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>Zoom Canvas</span>
                                                    <span>{(canvasZoom * 100).toFixed(0)}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0.5"
                                                    max="2.0"
                                                    step="0.1"
                                                    value={canvasZoom}
                                                    onChange={(e) => setCanvasZoom(parseFloat(e.target.value))}
                                                    className="w-full accent-primary"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                    <span>Border Radius</span>
                                                    <span>{currentSide.borderRadius}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="50"
                                                    step="1"
                                                    value={currentSide.borderRadius}
                                                    onChange={(e) => updateSide({ borderRadius: parseInt(e.target.value) })}
                                                    className="w-full accent-primary"
                                                />
                                            </div>

                                            <div className="p-3 bg-blue-50 text-blue-700 text-xs rounded-lg">
                                                Tip: You can drag to move, corners to resize, scroll to zoom!
                                                <br /><strong>Press Delete key to remove image.</strong>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="h-px bg-gray-100"></div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSave}
                                            disabled={isSaving}
                                            className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-70"
                                        >
                                            {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
                                            {isSaving ? 'Saving...' : 'Save Design'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                updateSide({ image: null, position: [0, 0.2, 0.11], scale: 0.3 });
                                                setPrompt('');
                                            }}
                                            className="btn-secondary p-3"
                                            title="Clear Current Side"
                                        >
                                            <RotateCcw size={20} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateDesign;
