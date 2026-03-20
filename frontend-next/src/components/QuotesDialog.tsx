"use client";

import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';

const QUOTES_DB = [
    { text: "Summer vibes only", tags: ["summer", "sun", "beach"] },
    { text: "Catch flights, not feelings", tags: ["travel", "summer", "cool"] },
    { text: "Vitamin Sea", tags: ["sea", "summer", "ocean", "beach"] },
    { text: "Gym hair, don't care", tags: ["gym", "workout", "fitness"] },
    { text: "Train insane or remain the same", tags: ["gym", "motivation"] },
    { text: "Keep calm and code on", tags: ["coding", "geek", "tech"] },
    { text: "Less Monday, more coffee", tags: ["coffee", "morning", "work"] },
    { text: "Stay wild, moon child", tags: ["nature", "wild", "boho"] },
    { text: "Good vibes only", tags: ["positive", "happy", "motivation"] },
    { text: "Hustle for that muscle", tags: ["gym", "workout"] },
    { text: "Eat, Sleep, Code, Repeat", tags: ["coding", "geek"] },
    { text: "Adventure awaits", tags: ["travel", "nature", "explore"] },
    { text: "Saltwater heals everything", tags: ["sea", "ocean", "beach"] },
    { text: "Chasing the sun", tags: ["summer", "travel", "sun"] },
    { text: "Be the energy you want to attract", tags: ["positive", "motivation", "life"] },
    { text: "Ocean child", tags: ["sea", "beach", "summer"] },
    { text: "Suns out, guns out", tags: ["gym", "summer", "workout"] },
    { text: "Born to stand out", tags: ["cool", "motivation"] },
    { text: "Too cool for school", tags: ["cool", "school"] },
    { text: "Miles of smiles", tags: ["happy", "positive"] }
];

interface QuotesDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (text: string) => void;
}

export default function QuotesDialog({ isOpen, onClose, onSelect }: QuotesDialogProps) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredQuotes = useMemo(() => {
        if (!searchTerm.trim()) return QUOTES_DB;
        const lowerSearch = searchTerm.toLowerCase();
        return QUOTES_DB.filter(q => 
            q.text.toLowerCase().includes(lowerSearch) || 
            q.tags.some(t => t.toLowerCase().includes(lowerSearch))
        );
    }, [searchTerm]);

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in zoom-in-95 duration-200">
                
                <div className="flex items-center justify-between p-5 border-b border-gray-100">
                    <h2 className="font-bold text-lg text-dark">Select Pre-written Text</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-5 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by words (e.g. summer, sea, gym)..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm shadow-sm placeholder:text-gray-400 transition-shadow"
                            autoFocus
                        />
                    </div>
                    <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
                        {['summer', 'sea', 'gym', 'motivation', 'coding'].map(tag => (
                            <button 
                                key={tag} 
                                onClick={() => setSearchTerm(tag)}
                                className={`px-3 py-1.5 border rounded-full text-xs font-bold uppercase tracking-wide whitespace-nowrap shadow-sm transition-colors ${searchTerm.toLowerCase() === tag ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600 hover:text-primary hover:border-primary/30'}`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/30">
                    {filteredQuotes.length > 0 ? (
                        filteredQuotes.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    onSelect(q.text);
                                    onClose();
                                }}
                                className="w-full text-left p-4 rounded-2xl border border-gray-100 bg-white hover:bg-indigo-50/50 hover:border-primary/40 transition-all flex flex-col gap-2.5 group shadow-sm hover:shadow"
                            >
                                <span className="font-bold text-gray-800 text-[15px] group-hover:text-primary transition-colors">{q.text}</span>
                                <div className="flex gap-1.5 flex-wrap">
                                    {q.tags.map(t => (
                                        <span key={t} className="text-[9px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md uppercase font-bold tracking-wider group-hover:bg-white transition-colors border border-transparent group-hover:border-gray-100">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 text-center">
                            <Search size={40} className="opacity-20 mb-4" />
                            <p className="text-sm font-semibold text-gray-600">No phrases found</p>
                            <p className="text-xs mt-1">Try another keyword or write your own text.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
