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
        if (onCapture && containerRef.current) {
            const captureCanvas = async (): Promise<string | null> => {
                const element = containerRef.current;
                if (!element) return null;

                try {
                    // We need to dynamically import html2canvas to avoid SSR issues
                    const html2canvas = (await import('html2canvas')).default;

                    // Temporarily hide selection UI for clean capture
                    const wasSelected = isSelected;
                    setIsSelected(false);
                    
                    // Wait for state update to reflect in DOM
                    await new Promise(resolve => setTimeout(resolve, 50));

                    const canvas = await html2canvas(element, {
                        backgroundColor: '#f3f4f6', // Light gray background
                        scale: 2,
                        logging: false,
                        useCORS: true,
                        allowTaint: true,
                        foreignObjectRendering: false,
                        removeContainer: true,
                        ignoreElements: (el) => {
                            // Exclude resize handles and selection indicators
                            return el.classList.contains('exclude-capture') || 
                                   el.classList.contains('resize-handle');
                        },
                        onclone: (clonedDoc) => {
                            // Remove any problematic CSS that html2canvas can't handle
                            const style = clonedDoc.createElement('style');
                            style.textContent = '* { color: inherit !important; }';
                            clonedDoc.head.appendChild(style);
                        }
                    });

                    // Restore selection state
                    if (wasSelected) {
                        setIsSelected(true);
                    }

                    return canvas.toDataURL('image/png');
                } catch (error) {
                    console.error("Capture failed", error);
                    return null;
                }
            };
            onCapture(captureCanvas);
        }
    }, [onCapture, isSelected]);

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
