"use client";

import React, { useState, useRef, useEffect } from 'react';

interface TShirtProps {
    color: string;
    textureUrl: string | null;
    decalPosition: [number, number, number];
    decalScale: number;
    zoom?: number;
    viewSide?: 'front' | 'back';
    onDecalPositionChange?: (pos: [number, number, number]) => void;
    onDecalScaleChange?: (scale: number) => void;
    onZoomChange?: (zoom: number) => void;
    onRemoveDesign?: () => void;
    borderRadius?: number;
    onCapture?: (callback: () => Promise<string | null>) => void;
}

const TShirtCanvas = ({
    color,
    textureUrl,
    decalPosition,
    decalScale,
    zoom = 1,
    viewSide = 'front',
    onDecalPositionChange,
    onDecalScaleChange,
    onZoomChange,
    onRemoveDesign,
    borderRadius = 0,
    onCapture
}: TShirtProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const decalRef = useRef<HTMLDivElement>(null);

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [isSelected, setIsSelected] = useState(false);
    const [startScale, setStartScale] = useState(0);
    const [startDist, setStartDist] = useState(0);

    const leftPercent = 50 + (decalPosition[0] * 100);
    const topPercent = 50 - (decalPosition[1] * 100);

    // Expose capture function via effect
    useEffect(() => {
        if (onCapture) {
            const captureCanvas = async (): Promise<string | null> => {
                try {
                    // Create an offscreen canvas at a good resolution (e.g. 1024x1365 matching 3:4 aspect)
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return null;

                    canvas.width = 1000;
                    canvas.height = Math.round(1000 * (4 / 3)); // 1333px

                    // Helper to load an image
                    const loadImage = (src: string): Promise<HTMLImageElement> => {
                        return new Promise((resolve, reject) => {
                            const img = new Image();
                            img.crossOrigin = 'anonymous';
                            img.onload = () => resolve(img);
                            img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
                            img.src = src;
                        });
                    };

                    const tshirtSrc = viewSide === 'front' ? '/tshirt-base.png' : '/tshirt-back-base.png';
                    
                    // 1. Draw base t-shirt with light background
                    ctx.fillStyle = '#f3f4f6';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    const baseImg = await loadImage(tshirtSrc);
                    // Draw base image covering the canvas (object-contain roughly)
                    // The base images are likely already 3:4 or close
                    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

                    // 2. Apply the color using multiply blend mode if it's not white
                    if (color !== '#ffffff' && color !== 'white') {
                        // To properly mask the color, we draw the shape again as a mask, 
                        // then fill the color with multiply
                        ctx.globalCompositeOperation = 'source-atop';
                        ctx.fillStyle = color;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'multiply';
                        ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'source-over'; // reset
                    }

                    // 3. Draw the user's design (decal) if present
                    if (textureUrl) {
                        const decalImg = await loadImage(textureUrl);
                        
                        // Calculate dimensions matching the CSS
                        // In CSS: width: 100px on a container that is ~400px wide -> decal is ~25% of container width base
                        // Then it's scaled by (decalScale * 3)
                        const baseDecalWidthPercent = 0.25; 
                        const decalWidth = canvas.width * baseDecalWidthPercent * (decalScale * 3);
                        // Maintain aspect ratio of the uploaded image
                        const decalHeight = decalWidth * (decalImg.height / decalImg.width);

                        // Position matching CSS
                        // leftPercent = 50 + (decalPosition[0] * 100) -> 0 to 1 scaling
                        const xPercent = 0.5 + decalPosition[0];
                        const yPercent = 0.5 - decalPosition[1];
                        
                        // translate(-50%, -50%) means it's centered on that coordinate
                        const x = (canvas.width * xPercent) - (decalWidth / 2);
                        const y = (canvas.height * yPercent) - (decalHeight / 2);

                        // Handle border radius if applicable
                        if (borderRadius > 0) {
                            ctx.save();
                            ctx.beginPath();
                            const radiusMatch = decalWidth * (borderRadius / 100);
                            // Simple rounded rect clipping
                            ctx.moveTo(x + radiusMatch, y);
                            ctx.lineTo(x + decalWidth - radiusMatch, y);
                            ctx.quadraticCurveTo(x + decalWidth, y, x + decalWidth, y + radiusMatch);
                            ctx.lineTo(x + decalWidth, y + decalHeight - radiusMatch);
                            ctx.quadraticCurveTo(x + decalWidth, y + decalHeight, x + decalWidth - radiusMatch, y + decalHeight);
                            ctx.lineTo(x + radiusMatch, y + decalHeight);
                            ctx.quadraticCurveTo(x, y + decalHeight, x, y + decalHeight - radiusMatch);
                            ctx.lineTo(x, y + radiusMatch);
                            ctx.quadraticCurveTo(x, y, x + radiusMatch, y);
                            ctx.closePath();
                            ctx.clip();
                            ctx.drawImage(decalImg, x, y, decalWidth, decalHeight);
                            ctx.restore();
                        } else {
                            ctx.drawImage(decalImg, x, y, decalWidth, decalHeight);
                        }
                    }

                    return canvas.toDataURL('image/png', 0.9);
                } catch (error) {
                    console.error("Manual canvas capture failed", error);
                    return null;
                }
            };
            
            onCapture(captureCanvas);
        }
    }, [onCapture, viewSide, color, textureUrl, decalPosition, decalScale, borderRadius]);

    // Deselect when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsSelected(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Handle Delete Key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isSelected && (e.key === 'Delete' || e.key === 'Backspace')) {
                if (onRemoveDesign) {
                    onRemoveDesign();
                    setIsSelected(false);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isSelected, onRemoveDesign]);

    // Handle Wheel Zoom with preventDefault to stop page scroll
    useEffect(() => {
        const wrapper = wrapperRef.current;
        if (!wrapper) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            if (onZoomChange) {
                const zoomDelta = e.deltaY * -0.001;
                const newZoom = Math.max(0.5, Math.min(zoom + zoomDelta, 3));
                onZoomChange(newZoom);
            }
        };

        wrapper.addEventListener('wheel', handleWheel, { passive: false });
        return () => {
            wrapper.removeEventListener('wheel', handleWheel);
        };
    }, [zoom, onZoomChange]);

    const handlePointerDown = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!textureUrl) return;
        setIsDragging(true);
        setIsSelected(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleResizeStart = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        setStartScale(decalScale);

        // Calculate initial distance from center of decal
        if (decalRef.current) {
            const rect = decalRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
            setStartDist(dist);
        }

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        setIsResizing(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!containerRef.current) return;

        if (isDragging && onDecalPositionChange && !isResizing) {
            const rect = containerRef.current.getBoundingClientRect();

            // Adjust for Zoom: The rect is scaled visually, but we need calculation relative to unscaled dimensions if possible,
            // or just use the visual dimensions and standard percentage logic.
            // Since `zoom` scales the parent, `rect` dimensions usually scale too.
            // Percentage logic remains: (x / width) * 100.

            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;

            const x3d = (xPercent - 50) / 100;
            const y3d = (50 - yPercent) / 100;

            onDecalPositionChange([x3d, y3d, decalPosition[2]]);
        }

        if (isResizing && onDecalScaleChange && decalRef.current) {
            const rect = decalRef.current.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const currentDist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));

            // New Scale = StartScale * (CurrentDist / StartDist)
            const newScale = startScale * (currentDist / startDist);

            // Limit scale to reasonable bounds
            const clampedScale = Math.max(0.1, Math.min(newScale, 2.0));
            onDecalScaleChange(clampedScale);
        }
    };

    // Handle styles for resize handles
    const handleStyle = {
        width: '12px',
        height: '12px',
        backgroundColor: 'white',
        border: '1px solid #4f46e5',
        borderRadius: '50%',
        position: 'absolute' as 'absolute',
        zIndex: 20
    };

    const tshirtImage = viewSide === 'front' ? '/tshirt-base.png' : '/tshirt-back-base.png';

    return (
        <div
            ref={wrapperRef}
            className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative select-none touch-none"
        >
            {/* T-Shirt Container with Zoom Transform */}
            <div
                ref={containerRef}
                className="relative w-[80%] max-w-[400px] aspect-[3/4]"
                style={{ transform: `scale(${zoom})`, transition: isDragging || isResizing ? 'none' : 'transform 0.1s ease-out' }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
                onClick={(e) => {
                    if (e.target === containerRef.current) {
                        setIsSelected(false);
                    }
                }}
            >
                {/* Base T-Shirt Image */}
                <div className="absolute inset-0 w-full h-full">
                    <img
                        src={tshirtImage}
                        alt={`T-Shirt ${viewSide}`}
                        className="w-full h-full object-contain pointer-events-none"
                    />

                    {/* Color Overlay */}
                    <div
                        className="absolute inset-0 w-full h-full bg-blend-multiply mix-blend-multiply pointer-events-none"
                        style={{
                            backgroundColor: color,
                            maskImage: `url(${tshirtImage})`,
                            maskSize: 'contain',
                            maskRepeat: 'no-repeat',
                            maskPosition: 'center',
                            WebkitMaskImage: `url(${tshirtImage})`,
                            WebkitMaskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                        }}
                    />
                </div>

                {/* Decal Overlay */}
                {textureUrl && (
                    <div
                        ref={decalRef}
                        className={`absolute cursor-move ${isSelected ? 'ring-1 ring-indigo-500' : ''}`}
                        style={{
                            left: `${leftPercent}%`,
                            top: `${topPercent}%`,
                            transform: `translate(-50%, -50%) scale(${decalScale * 3})`,
                            width: '100px',
                            height: '100px',
                            touchAction: 'none',
                            borderRadius: `${borderRadius}%`,
                            overflow: 'hidden'
                        }}
                        onPointerDown={handlePointerDown}
                    >
                        <img
                            src={textureUrl}
                            alt="Decal"
                            className="w-full h-full object-contain pointer-events-none"
                            style={{ borderRadius: `${borderRadius}%` }}
                        />

                        {/* Resize Handles - Only visible when selected */}
                        {isSelected && (
                            <>
                                {/* Top Left */}
                                <div
                                    className="resize-handle exclude-capture"
                                    style={{ ...handleStyle, top: '-6px', left: '-6px', cursor: 'nwse-resize' }}
                                    onPointerDown={handleResizeStart}
                                />
                                {/* Top Right */}
                                <div
                                    className="resize-handle exclude-capture"
                                    style={{ ...handleStyle, top: '-6px', right: '-6px', cursor: 'nesw-resize' }}
                                    onPointerDown={handleResizeStart}
                                />
                                {/* Bottom Left */}
                                <div
                                    className="resize-handle exclude-capture"
                                    style={{ ...handleStyle, bottom: '-6px', left: '-6px', cursor: 'nesw-resize' }}
                                    onPointerDown={handleResizeStart}
                                />
                                {/* Bottom Right */}
                                <div
                                    className="resize-handle exclude-capture"
                                    style={{ ...handleStyle, bottom: '-6px', right: '-6px', cursor: 'nwse-resize' }}
                                    onPointerDown={handleResizeStart}
                                />
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="absolute bottom-4 left-4 text-xs text-gray-400 exclude-capture">
                Scroll to Zoom • Drag to Move • Click to Select
            </div>
        </div>
    );
};

export default TShirtCanvas;
