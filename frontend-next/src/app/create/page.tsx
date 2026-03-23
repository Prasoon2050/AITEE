"use client";

import React, { useState, useRef } from 'react';
import { Upload, Wand2, ArrowLeft, Move, Eraser, RotateCcw, Save, ImageIcon, Loader2, Type, Layers, Trash2, GripVertical } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { CanvasElement } from '@/components/TShirtCanvas';
import QuotesDialog from '@/components/QuotesDialog';

const TShirtCanvas = dynamic(() => import('@/components/TShirtCanvas'), { ssr: false });

const CreateDesign = () => {
    const { addDesign, user } = useUser();
    const router = useRouter();

    const [activeTab, setActiveTab] = useState<'upload' | 'prompt' | 'text'>('upload');
    const [color, setColor] = useState('#ffffff');
    const [size, setSize] = useState('Medium');
    const [material, setMaterial] = useState('Polyester');
    const [canvasZoom, setCanvasZoom] = useState(1);
    const [viewSide, setViewSide] = useState<'front' | 'back'>('front');

    const [sides, setSides] = useState<{ front: CanvasElement[], back: CanvasElement[] }>({
        front: [],
        back: []
    });
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

    const [showQuotesDialog, setShowQuotesDialog] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const captureRef = useRef<(() => Promise<string | null>) | null>(null);
    const [prompt, setPrompt] = useState('');
    const [textInput, setTextInput] = useState('');
    
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const colors = ['#ffffff', '#111827', '#4f46e5', '#dc2626', '#16a34a', '#fbbf24', '#ec4899'];
    const sizes = ['Small', 'Medium', 'Large', 'XL', '2XL'];
    const materials = ['Polyester', 'Dri Fit', '100% Cotton'];

    const currentElements = sides[viewSide];
    const selectedElement = currentElements.find(e => e.id === selectedElementId) || null;

    const handleUpdateElement = (id: string, updates: Partial<CanvasElement>) => {
        setSides(prev => ({
            ...prev,
            [viewSide]: prev[viewSide].map(el => el.id === id ? { ...el, ...updates } : el)
        }));
    };

    const handleRemoveElement = (id: string) => {
        setSides(prev => ({
            ...prev,
            [viewSide]: prev[viewSide].filter(el => el.id !== id)
        }));
        if (selectedElementId === id) setSelectedElementId(null);
    };

    const handleAddImage = (imageUrl: string) => {
        const newEl: CanvasElement = {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            type: 'image',
            content: imageUrl,
            position: [0, 0],
            scale: 0.3,
            borderRadius: 0,
            rotation: 0
        };
        setSides(prev => ({ ...prev, [viewSide]: [...prev[viewSide], newEl] }));
        setSelectedElementId(newEl.id);
    };

    const handleAddText = (presetText?: string) => {
        const textToUse = typeof presetText === 'string' ? presetText : textInput;
        if (!textToUse.trim()) return;
        const newEl: CanvasElement = {
            id: Date.now().toString() + Math.random().toString(36).substring(7),
            type: 'text',
            content: textToUse,
            position: [0, 0],
            scale: 0.3,
            color: '#000000',
            fontFamily: 'Arial',
            fontWeight: 'normal',
            fontStyle: 'normal',
            underline: false,
            rotation: 0
        };
        setSides(prev => ({ ...prev, [viewSide]: [...prev[viewSide], newEl] }));
        setSelectedElementId(newEl.id);
        if (typeof presetText !== 'string') setTextInput('');
    };

    const handleAlign = (alignment: 'center' | 'top' | 'bottom' | 'left' | 'right') => {
        if (!selectedElementId) return;
        const updates: Partial<CanvasElement> = {};
        switch (alignment) {
            case 'center': updates.position = [0, 0]; break;
            case 'top': updates.position = [0, 0.35]; break;
            case 'bottom': updates.position = [0, -0.35]; break;
            case 'left': updates.position = [-0.3, selectedElement?.position[1] || 0]; break;
            case 'right': updates.position = [0.3, selectedElement?.position[1] || 0]; break;
        }
        handleUpdateElement(selectedElementId, updates);
    };

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
                        handleAddImage(event.target.result as string);
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
                handleAddImage(data.imageUrl);
            }
        } catch (err: any) {
            console.error("Generation error:", err);
            setError(err.message || "Failed to generate image.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, targetIndex: number) => {
        e.preventDefault();
        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
        if (draggedIndex === targetIndex || isNaN(draggedIndex)) return;

        setSides(prev => {
            const arr = [...prev[viewSide]];
            const [draggedItem] = arr.splice(draggedIndex, 1);
            arr.splice(targetIndex, 0, draggedItem);
            return {
                ...prev,
                [viewSide]: arr
            };
        });
    };

    const handleSave = async () => {
        if (sides.front.length === 0 && sides.back.length === 0) {
            setError("Please add at least one design element to the front or back.");
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const token = user?.token || (localStorage.getItem('userInfo') ? JSON.parse(localStorage.getItem('userInfo')!).token : null);

            if (!token) {
                setError("You must be logged in to save designs.");
                setIsSaving(false);
                return;
            }

            const API_URL = 'http://localhost:5001/api';

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

            const captureCurrentView = async (): Promise<string | null> => {
                return new Promise((resolve) => {
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

            const imagesToUpload: { image: string; folder: string; type: 'render' | 'design' }[] = [];
            const originalView = viewSide;
            const originalSelection = selectedElementId;

            setSelectedElementId(null);

            const processCanvasForCapture = async (sideKey: 'front' | 'back') => {
                if (sides[sideKey].length > 0) {
                    setViewSide(sideKey);
                    await new Promise(r => setTimeout(r, 800)); // Wait for render
                    const canvasImage = await captureCurrentView();
                    if (canvasImage) {
                        imagesToUpload.push({ image: canvasImage, folder: 'products', type: 'render' });
                    }
                    
                    for (const el of sides[sideKey]) {
                        if (el.type === 'image' && el.content) {
                            if (el.content.startsWith('http')) {
                                const base64Image = await urlToBase64(el.content);
                                if (base64Image) {
                                    imagesToUpload.push({ image: base64Image, folder: 'products', type: 'design' });
                                }
                            } else if (el.content.startsWith('data:')) {
                                imagesToUpload.push({ image: el.content, folder: 'products', type: 'design' });
                            }
                        }
                    }
                }
            };

            await processCanvasForCapture('front');
            await processCanvasForCapture('back');

            setViewSide(originalView);
            setSelectedElementId(originalSelection);

            const validImages = imagesToUpload.filter(img => img.image && (img.image.startsWith('data:') || img.image.startsWith('blob:')));

            if (validImages.length === 0) {
                throw new Error("Failed to capture the design image.");
            }

            const uploadResponse = await fetch(`${API_URL}/images/upload-multiple-base64`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ images: validImages }),
            });

            const contentType = uploadResponse.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new Error('Server returned an invalid response.');
            }

            const uploadData = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadData.message || 'Failed to upload images');
            }

            const uploadedUrls = uploadData.imageUrls || [];
            if (uploadedUrls.length === 0) {
                throw new Error("No images were uploaded.");
            }

            const renderUrls: string[] = [];
            const designUrls: string[] = [];
            
            uploadData.uploads.forEach((upload: { imageUrl: string; key: string | null }, index: number) => {
                const imgType = validImages[index]?.type;
                if (imgType === 'render') {
                    renderUrls.push(upload.imageUrl + '?type=render');
                } else {
                    designUrls.push(upload.imageUrl);
                }
            });

            const primaryImage = renderUrls[0] || uploadedUrls[0];

            const productResponse = await fetch(`${API_URL}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: prompt ? `AI: ${prompt.substring(0, 30)}` : 'Custom T-Shirt',
                    description: prompt 
                        ? `Custom designed t-shirt with AI art. Prompt: "${prompt}". Size: ${size}, Material: ${material}.`
                        : `Custom designed t-shirt with artwork. Size: ${size}, Material: ${material}.`,
                    price: 29.99,
                    brand: 'AITEE Custom',
                    category: 'T-Shirts',
                    countInStock: 100,
                    image: primaryImage,
                    images: [...renderUrls, ...designUrls],
                    size,
                    material
                }),
            });

            const productData = await productResponse.json();

            if (!productResponse.ok) throw new Error(productData.message);

            addDesign({
                id: productData._id,
                title: productData.name,
                status: 'Public',
                sales: 0,
                earnings: 0,
                image: productData.image
            });

            router.push('/products');
        } catch (err: any) {
            console.error("Save error:", err);
            setError(err.message || "Failed to save design.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div 
            className="container mx-auto px-4 md:px-6 py-8"
            onClick={() => setSelectedElementId(null)}
        >
            <div className="max-w-[1400px] mx-auto">
                {error && (
                    <div className="text-center mb-6">
                        <div className="p-2 bg-red-50 text-red-600 rounded-lg inline-block border border-red-200 text-sm">
                            {error}
                        </div>
                    </div>
                )}

                {/* 3 Columns Layout: Left Panel (Small), Middle (Canvas), Right Panel (Controls) */}
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    
                    {/* Left Sidebar - Layers Panel (Slimmer Old Repo Style) */}
                    <div 
                        className="w-full lg:w-24 shrink-0 order-2 lg:order-1 flex flex-col gap-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-[150px] items-center">
                            <div className="flex flex-col items-center gap-1.5 border-b border-gray-100 pb-2 mb-3 w-full">
                                <Layers size={16} className="text-primary"/> 
                                <span className="font-bold text-dark text-[10px] uppercase tracking-wider">Layers</span>
                                {selectedElementId && (
                                    <button 
                                        onClick={() => setSelectedElementId(null)}
                                        className="text-[9px] text-gray-500 hover:text-primary transition-colors bg-gray-50 px-2 py-0.5 rounded border border-gray-200 mt-1"
                                    >
                                        Deselect
                                    </button>
                                )}
                            </div>
                            
                            {currentElements.length > 0 ? (
                                <div className="space-y-3 flex-1 overflow-y-auto max-h-[500px] w-full px-1 flex flex-col items-center scrollbar-hide">
                                    {[...currentElements].reverse().map((el, revIndex) => {
                                        const i = currentElements.length - 1 - revIndex;
                                        return (
                                            <div 
                                                key={el.id} 
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, i)}
                                                onDragOver={handleDragOver}
                                                onDrop={(e) => handleDrop(e, i)}
                                                onClick={() => setSelectedElementId(el.id)}
                                                className={`relative flex items-center justify-center p-1 rounded-xl cursor-grab active:cursor-grabbing border transition-all w-14 h-14 group ${selectedElementId === el.id ? 'border-primary ring-2 ring-primary/20 bg-indigo-50 shadow-sm' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}
                                            >
                                                {el.type === 'image' && el.content ? (
                                                    <img src={el.content} alt="Layer" className="w-10 h-10 object-contain rounded shadow-sm bg-white" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-white border border-gray-200 flex items-center justify-center rounded shadow-sm text-[9px] font-bold text-gray-600 overflow-hidden px-1 text-center leading-tight">
                                                        {el.content.substring(0, 6)}...
                                                    </div>
                                                )}

                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveElement(el.id); }}
                                                    className="absolute -top-1.5 -right-1.5 text-white bg-red-500 hover:bg-red-600 p-1 rounded-full shadow-sm opacity-0 lg:group-hover:opacity-100 transition-opacity"
                                                    title="Delete Layer"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                                
                                                {/* Mobile visible delete button since hover is tricky */}
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); handleRemoveElement(el.id); }}
                                                    className="absolute -top-1.5 -right-1.5 text-white bg-red-500 p-1 rounded-full shadow-sm lg:hidden"
                                                >
                                                    <Trash2 size={10} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4 w-full opacity-40">
                                    <Layers size={18} className="mb-2" />
                                    <span className="text-[9px] uppercase font-bold tracking-wider">Empty</span>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Middle Column - Canvas */}
                    <div className="w-full lg:flex-1 order-1 lg:order-2 space-y-4">
                        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm h-[400px] lg:h-[550px] relative overflow-hidden flex flex-col">
                            <div className="flex-1 min-h-0 relative">
                                <TShirtCanvas
                                    color={color}
                                    elements={currentElements}
                                    selectedElementId={selectedElementId}
                                    zoom={canvasZoom}
                                    viewSide={viewSide}
                                    onUpdateElement={handleUpdateElement}
                                    onSelectElement={setSelectedElementId}
                                    onRemoveElement={handleRemoveElement}
                                    onZoomChange={setCanvasZoom}
                                    onCapture={(fn) => captureRef.current = fn}
                                />
                            </div>
                            
                            {/* Zoom controls float */}
                            <div 
                                className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm border border-gray-100 pointer-events-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <span className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider">Zoom:</span>
                                <input
                                    type="range" min="0.5" max="2.0" step="0.1" value={canvasZoom}
                                    onChange={(e) => setCanvasZoom(parseFloat(e.target.value))}
                                    className="w-16 md:w-20 accent-primary"
                                />
                                <span className="text-xs text-gray-400 font-medium">{(canvasZoom * 100).toFixed(0)}%</span>
                            </div>
                        </div>

                        <div className="flex justify-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setViewSide(prev => prev === 'front' ? 'back' : 'front');
                                    setSelectedElementId(null);
                                }}
                                className="px-5 py-2.5 bg-white border border-gray-200 shadow-sm rounded-full text-xs font-bold text-dark hover:bg-gray-50 flex items-center gap-2 transition-all hover:border-gray-300"
                            >
                                <RotateCcw size={14} className={`transition-transform duration-300 ${viewSide === 'back' ? 'rotate-180' : ''}`} />
                                {viewSide === 'front' ? 'Switch to Back View' : 'Switch to Front View'}
                            </button>
                        </div>
                    </div>

                    {/* Right Column - Controls */}
                    <div 
                        className="w-full lg:w-[320px] xl:w-[360px] shrink-0 order-3 space-y-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex p-1 bg-gray-100 rounded-xl shadow-inner">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'upload' ? 'bg-white text-primary shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Upload size={14} /> Image
                            </button>
                            <button
                                onClick={() => setActiveTab('text')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'text' ? 'bg-white text-primary shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Type size={14} /> Text
                            </button>
                            <button
                                onClick={() => setActiveTab('prompt')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'prompt' ? 'bg-white text-primary shadow-sm ring-1 ring-gray-900/5' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                <Wand2 size={14} /> AI
                            </button>
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                            {activeTab === 'upload' && (
                                <>
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-full border-2 border-dashed border-gray-300 rounded-xl p-5 flex flex-col items-center justify-center text-gray-500 hover:border-primary hover:text-primary transition-colors bg-gray-50/50 hover:bg-indigo-50/30"
                                    >
                                        <Upload size={20} className="mb-2 opacity-80" />
                                        <span className="font-semibold text-xs tracking-wide">Upload Image</span>
                                    </button>
                                </>
                            )}
                            {activeTab === 'text' && (
                                <div className="space-y-4">
                                    <button 
                                        onClick={() => setShowQuotesDialog(true)} 
                                        className="w-full bg-indigo-50 hover:bg-indigo-100 text-primary py-3 px-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors border border-primary/20 shadow-sm"
                                    >
                                        <Type size={16} /> Browse Pre-written Quotes
                                    </button>
                                    
                                    <div className="relative flex items-center py-1">
                                        <div className="flex-grow border-t border-gray-100"></div>
                                        <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-wider">or write your own</span>
                                        <div className="flex-grow border-t border-gray-100"></div>
                                    </div>

                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            value={textInput}
                                            onChange={(e) => setTextInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
                                            placeholder="Enter your custom text..."
                                            className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-gray-400 shadow-sm"
                                        />
                                        <button onClick={() => handleAddText()} disabled={!textInput.trim()} className="w-full btn-primary py-3 text-xs font-bold tracking-wide rounded-xl disabled:opacity-50 shadow-sm border border-transparent">
                                            Add Custom Text Layer
                                        </button>
                                    </div>
                                </div>
                            )}
                            {activeTab === 'prompt' && (
                                <div className="space-y-3">
                                    <textarea
                                        value={prompt}
                                        onChange={(e) => setPrompt(e.target.value)}
                                        placeholder="Generate an image..."
                                        className="w-full p-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[60px] resize-none placeholder:text-gray-400"
                                    />
                                    <button onClick={handleGenerateImage} disabled={isGenerating || !prompt.trim()} className="w-full btn-primary py-2.5 text-xs font-bold tracking-wide rounded-xl disabled:opacity-50 shadow-sm">
                                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-5">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">Shirt Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {colors.map((c) => (
                                        <button
                                            key={c} onClick={() => setColor(c)}
                                            className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-primary scale-110 shadow-sm' : 'border-gray-200'}`}
                                            style={{ backgroundColor: c }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Size</label>
                                    <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full py-2 px-2.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-primary/30 outline-none">
                                        {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Material</label>
                                    <select value={material} onChange={(e) => setMaterial(e.target.value)} className="w-full py-2 px-2.5 border border-gray-200 rounded-lg text-xs bg-white focus:ring-1 focus:ring-primary/30 outline-none">
                                        {materials.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                </div>
                            </div>

                            {selectedElement && (
                                <>
                                    <div className="h-px bg-gray-100/80 my-2"></div>
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center justify-between mb-3">
                                            <label className="block text-xs font-bold text-dark">
                                                Adjust {selectedElement.type === 'image' ? 'Image' : 'Text'}
                                            </label>
                                        </div>
                                        <div className="space-y-4">
                                            
                                            {selectedElement.type === 'text' && (
                                                <div className="flex flex-col gap-3">
                                                    <input 
                                                        type="text" 
                                                        value={selectedElement.content}
                                                        onChange={(e) => handleUpdateElement(selectedElement.id, { content: e.target.value })}
                                                        className="w-full p-2 border border-gray-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-primary/30"
                                                    />
                                                    <div className="flex gap-2">
                                                        <input type="color" value={selectedElement.color || '#000000'} onChange={(e) => handleUpdateElement(selectedElement.id, { color: e.target.value })} className="h-8 w-1/4 rounded cursor-pointer border-none p-0" />
                                                        <select value={selectedElement.fontFamily} onChange={(e) => handleUpdateElement(selectedElement.id, { fontFamily: e.target.value })} className="w-3/4 p-1.5 border border-gray-200 rounded-lg text-xs outline-none">
                                                            <option value="Arial">Arial</option>
                                                            <option value="Times New Roman">Times</option>
                                                            <option value="Courier New">Courier</option>
                                                            <option value="Impact">Impact</option>
                                                            <option value="Georgia">Georgia</option>
                                                            <option value="Verdana">Verdana</option>
                                                        </select>
                                                    </div>
                                                    <div className="flex gap-1.5">
                                                        <button onClick={() => handleUpdateElement(selectedElement.id, { fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`flex-1 py-1.5 px-2 text-xs border rounded-md font-serif font-bold transition-colors ${selectedElement.fontWeight === 'bold' ? 'bg-gray-800 text-white border-gray-800 shadow-inner' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'}`}>B</button>
                                                        <button onClick={() => handleUpdateElement(selectedElement.id, { fontStyle: selectedElement.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`flex-1 py-1.5 px-2 text-xs border rounded-md font-serif italic transition-colors ${selectedElement.fontStyle === 'italic' ? 'bg-gray-800 text-white border-gray-800 shadow-inner' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'}`}>I</button>
                                                        <button onClick={() => handleUpdateElement(selectedElement.id, { underline: !selectedElement.underline })} className={`flex-1 py-1.5 px-2 text-xs border rounded-md font-serif underline transition-colors ${selectedElement.underline ? 'bg-gray-800 text-white border-gray-800 shadow-inner' : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'}`}>U</button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="grid gap-3">
                                                <div>
                                                    <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-bold">
                                                        <span>Scale</span>
                                                        <span>{(selectedElement.scale * 100).toFixed(0)}%</span>
                                                    </div>
                                                    <input type="range" min="0.05" max="3" step="0.05" value={selectedElement.scale} onChange={(e) => handleUpdateElement(selectedElement.id, { scale: parseFloat(e.target.value) })} className="w-full accent-primary" />
                                                </div>

                                                <div>
                                                    <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-bold">
                                                        <span>Rotation</span>
                                                        <span>{selectedElement.rotation || 0}°</span>
                                                    </div>
                                                    <input type="range" min="-180" max="180" step="1" value={selectedElement.rotation || 0} onChange={(e) => handleUpdateElement(selectedElement.id, { rotation: parseInt(e.target.value) })} className="w-full accent-primary" />
                                                </div>

                                                {selectedElement.type === 'image' && (
                                                    <div>
                                                        <div className="flex justify-between text-[10px] text-gray-500 uppercase tracking-wider mb-1.5 font-bold">
                                                            <span>Border Radius</span>
                                                            <span>{selectedElement.borderRadius || 0}%</span>
                                                        </div>
                                                        <input type="range" min="0" max="50" step="1" value={selectedElement.borderRadius || 0} onChange={(e) => handleUpdateElement(selectedElement.id, { borderRadius: parseInt(e.target.value) })} className="w-full accent-primary" />
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex justify-center pt-2">
                                                <button onClick={() => handleAlign('center')} className="px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-xs font-medium flex items-center gap-1.5 text-gray-600 shadow-sm" title="Center Layer">
                                                    <Move size={12} /> Center to Canvas
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        
                        <div className="space-y-2 pt-2">
                            <button onClick={handleSave} disabled={isSaving} className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm border border-transparent font-bold">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                {isSaving ? 'Saving Products...' : 'Publish & Save Design'}
                            </button>
                            {(sides.front.length > 0 || sides.back.length > 0) && (
                                <button 
                                    onClick={() => {
                                        if(confirm("Clear all designs from both front and back?")) {
                                            setSides({front: [], back: []});
                                            setSelectedElementId(null);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-gray-400 hover:text-red-500 hover:bg-red-50/50 rounded-lg transition-colors border border-transparent"
                                >
                                    <Eraser size={14} /> Clear Everything
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <QuotesDialog
                isOpen={showQuotesDialog}
                onClose={() => setShowQuotesDialog(false)}
                onSelect={(text) => handleAddText(text)}
            />
        </div>
    );
};

export default CreateDesign;
