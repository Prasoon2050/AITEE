"use client";

import React, { useState, useRef, useEffect } from 'react';

export interface CanvasElement {
    id: string;
    type: 'image' | 'text';
    content: string;
    position: [number, number]; // [x, y] in percentage from center. 0 = center
    scale: number;
    rotation?: number;
    borderRadius?: number;
    color?: string;
    fontFamily?: string;
    fontWeight?: string;
    fontStyle?: string;
    underline?: boolean;
}

interface TShirtProps {
    color: string;
    elements: CanvasElement[];
    selectedElementId: string | null;
    zoom?: number;
    viewSide?: 'front' | 'back';
    onUpdateElement?: (id: string, updates: Partial<CanvasElement>) => void;
    onSelectElement?: (id: string | null) => void;
    onRemoveElement?: (id: string) => void;
    onZoomChange?: (zoom: number) => void;
    onCapture?: (callback: () => Promise<string | null>) => void;
}

const TShirtCanvas = ({
    color,
    elements,
    selectedElementId,
    zoom = 1,
    viewSide = 'front',
    onUpdateElement,
    onSelectElement,
    onRemoveElement,
    onZoomChange,
    onCapture
}: TShirtProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    
    // We use a ref map to track individual element DOM nodes for accurate resize distance
    const elementsRef = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [startScale, setStartScale] = useState(0);
    const [startDist, setStartDist] = useState(0);

    // Expose capture function via effect
    useEffect(() => {
        if (onCapture) {
            const captureCanvas = async (): Promise<string | null> => {
                try {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return null;

                    canvas.width = 1000;
                    canvas.height = Math.round(1000 * (4 / 3)); // 1333px

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
                    ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);

                    // 2. Apply color
                    if (color !== '#ffffff' && color !== 'white') {
                        ctx.globalCompositeOperation = 'source-atop';
                        ctx.fillStyle = color;
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'multiply';
                        ctx.drawImage(baseImg, 0, 0, canvas.width, canvas.height);
                        ctx.globalCompositeOperation = 'source-over';
                    }

                    // 3. Draw elements
                    // Sort elements backward if we need specific z-index, but we assume they are drawn in array order
                    for (const el of elements) {
                        const xPercent = 0.5 + el.position[0];
                        const yPercent = 0.5 - el.position[1];

                        ctx.save();
                        
                        // Move to element center
                        const centerX = canvas.width * xPercent;
                        const centerY = canvas.height * yPercent;
                        ctx.translate(centerX, centerY);

                        if (el.rotation) {
                            ctx.rotate(el.rotation * Math.PI / 180);
                        }

                        if (el.type === 'image' && el.content) {
                            const decalImg = await loadImage(el.content);
                            // Base decal width logic matches original CSS (25% of container width * scale * 3)
                            const baseDecalWidthPercent = 0.25; 
                            const decalWidth = canvas.width * baseDecalWidthPercent * (el.scale * 3);
                            const decalHeight = decalWidth * (decalImg.height / decalImg.width);

                            const x = -decalWidth / 2;
                            const y = -decalHeight / 2;

                            const borderRadius = el.borderRadius || 0;
                            if (borderRadius > 0) {
                                ctx.beginPath();
                                const radiusMatch = decalWidth * (borderRadius / 100);
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
                            }
                            ctx.drawImage(decalImg, x, y, decalWidth, decalHeight);
                        } else if (el.type === 'text' && el.content) {
                            ctx.fillStyle = el.color || '#000000';
                            
                            const fontStyle = el.fontStyle === 'italic' ? 'italic ' : 'normal ';
                            const fontWeight = el.fontWeight === 'bold' ? 'bold ' : 'normal ';
                            
                            // To match CSS `33px * scale * 3` inside a ~400px container...
                            // Actually the container is canvas.width. 
                            // 33px in a 400px box is ~8.25%.
                            const fontSize = canvas.width * 0.0825 * (el.scale * 3);
                            const fontFamily = el.fontFamily || 'Arial';
                            
                            ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${fontFamily}`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            
                            ctx.fillText(el.content, 0, 0);
                            
                            if (el.underline) {
                                const metrics = ctx.measureText(el.content);
                                const textWidth = metrics.width;
                                ctx.beginPath();
                                ctx.moveTo(-textWidth/2, fontSize / 2 + 2);
                                ctx.lineTo(textWidth/2, fontSize / 2 + 2);
                                ctx.strokeStyle = el.color || '#000000';
                                ctx.lineWidth = Math.max(2, fontSize / 15);
                                ctx.stroke();
                            }
                        }

                        ctx.restore();
                    }

                    return canvas.toDataURL('image/png', 0.9);
                } catch (error) {
                    console.error("Manual canvas capture failed", error);
                    return null;
                }
            };
            
            onCapture(captureCanvas);
        }
    }, [onCapture, viewSide, color, elements]);

    // Removed handleClickOutside useEffect to prevent deselection when clicking UI controls

    // Handle Delete Key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (selectedElementId && (e.key === 'Delete' || e.key === 'Backspace')) {
                // Prevent deleting if user is typing in an input
                if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
                    return;
                }
                if (onRemoveElement) {
                    onRemoveElement(selectedElementId);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedElementId, onRemoveElement]);

    // Handle Wheel Zoom
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
        // eslint-disable-next-line consistent-return
        return () => wrapper.removeEventListener('wheel', handleWheel);
    }, [zoom, onZoomChange]);

    const handlePointerDown = (e: React.PointerEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSelectElement) onSelectElement(id);
        setIsDragging(true);
        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handleResizeStart = (e: React.PointerEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (onSelectElement) onSelectElement(id);
        setIsResizing(true);

        const el = elements.find(e => e.id === id);
        if (el) {
            setStartScale(el.scale);
        }

        const elRef = elementsRef.current[id];
        if (elRef) {
            const rect = elRef.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));
            setStartDist(dist);
        } else {
            setStartDist(100);
        }

        e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        setIsResizing(false);
        e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!containerRef.current || !selectedElementId) return;

        const selEl = elements.find(el => el.id === selectedElementId);
        if (!selEl) return;

        if (isDragging && onUpdateElement && !isResizing) {
            const rect = containerRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;

            const x3d = (xPercent - 50) / 100;
            const y3d = (50 - yPercent) / 100;

            onUpdateElement(selectedElementId, { position: [x3d, y3d] });
        }

        if (isResizing && onUpdateElement && startDist > 0) {
            const elRef = elementsRef.current[selectedElementId];
            if (elRef) {
                const rect = elRef.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const currentDist = Math.sqrt(Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2));

                const newScale = startScale * (currentDist / startDist);
                const clampedScale = Math.max(0.05, Math.min(newScale, 3.0));
                onUpdateElement(selectedElementId, { scale: clampedScale });
            }
        }
    };

    const handleStyle: React.CSSProperties = {
        width: '12px',
        height: '12px',
        backgroundColor: 'white',
        border: '1px solid #4f46e5',
        borderRadius: '50%',
        position: 'absolute',
        zIndex: 20
    };

    const tshirtImage = viewSide === 'front' ? '/tshirt-base.png' : '/tshirt-back-base.png';

    return (
        <div
            ref={wrapperRef}
            className="w-full h-full bg-gray-100 rounded-2xl overflow-hidden flex items-center justify-center relative select-none touch-none"
        >
            <div
                ref={containerRef}
                className="relative w-[80%] max-w-[400px] aspect-[3/4]"
                style={{ transform: `scale(${zoom})`, transition: isDragging || isResizing ? 'none' : 'transform 0.1s ease-out' }}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerLeave={handlePointerUp}
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

                {/* Elements */}
                {elements.map((el) => {
                    const isSelected = selectedElementId === el.id;
                    const leftPercent = 50 + (el.position[0] * 100);
                    const topPercent = 50 - (el.position[1] * 100);

                    return (
                        <div
                            key={el.id}
                            ref={(node) => { elementsRef.current[el.id] = node; }}
                            className={`absolute cursor-move ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent' : ''}`}
                            style={{
                                left: `${leftPercent}%`,
                                top: `${topPercent}%`,
                                transform: `translate(-50%, -50%) scale(${el.scale * 3}) rotate(${el.rotation || 0}deg)`,
                                width: el.type === 'text' ? 'auto' : '100px',
                                height: el.type === 'text' ? 'auto' : '100px',
                                whiteSpace: 'nowrap',
                                touchAction: 'none',
                                borderRadius: el.type === 'image' && el.borderRadius ? `${el.borderRadius}%` : '0',
                                zIndex: isSelected ? 10 : 1
                            }}
                            onPointerDown={(e) => handlePointerDown(e, el.id)}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {el.type === 'image' && el.content && (
                                <img
                                    src={el.content}
                                    alt="Decal"
                                    className="w-full h-full object-contain pointer-events-none"
                                    style={{ borderRadius: el.borderRadius ? `${el.borderRadius}%` : '0' }}
                                />
                            )}
                            
                            {el.type === 'text' && el.content && (
                                <div
                                    className="pointer-events-none"
                                    style={{
                                        color: el.color || '#000000',
                                        fontFamily: el.fontFamily || 'Arial',
                                        fontWeight: el.fontWeight || 'normal',
                                        fontStyle: el.fontStyle || 'normal',
                                        textDecoration: el.underline ? 'underline' : 'none',
                                        fontSize: `33px`,
                                        padding: '4px 8px'
                                    }}
                                >
                                    {el.content}
                                </div>
                            )}

                            {/* Handles */}
                            {isSelected && (
                                <>
                                    <div
                                        className="resize-handle exclude-capture"
                                        style={{ ...handleStyle, top: '-6px', left: '-6px', cursor: 'nwse-resize' }}
                                        onPointerDown={(e) => handleResizeStart(e, el.id)}
                                    />
                                    <div
                                        className="resize-handle exclude-capture"
                                        style={{ ...handleStyle, top: '-6px', right: '-6px', cursor: 'nesw-resize' }}
                                        onPointerDown={(e) => handleResizeStart(e, el.id)}
                                    />
                                    <div
                                        className="resize-handle exclude-capture"
                                        style={{ ...handleStyle, bottom: '-6px', left: '-6px', cursor: 'nesw-resize' }}
                                        onPointerDown={(e) => handleResizeStart(e, el.id)}
                                    />
                                    <div
                                        className="resize-handle exclude-capture"
                                        style={{ ...handleStyle, bottom: '-6px', right: '-6px', cursor: 'nwse-resize' }}
                                        onPointerDown={(e) => handleResizeStart(e, el.id)}
                                    />
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="absolute bottom-4 left-4 text-xs text-gray-400 exclude-capture">
                Scroll to Zoom • Drag to Move • Click to Select
            </div>
        </div>
    );
};

export default TShirtCanvas;
