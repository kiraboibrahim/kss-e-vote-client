'use client'
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LogOut, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import KSSLogo from "@/app/kss-logo.png";
import { getVoter } from '../lib/utils';

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [voter, setVoter] = useState<{ name: string; voter_no: string; house: string } | null>(null);

    useEffect(() => {
        try {
            const voterData = getVoter();
            if (voterData && voterData.voter_no) {
                setVoter(voterData);
            }
        } catch (e) {
            console.error("Failed to load voter details", e);
        }
    }, []);

    const formatHouseName = (house: string) => {
        if (!house) return '';
        return house.charAt(0).toUpperCase() + house.slice(1).toLowerCase();
    };

    return (
        <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-900 flex flex-col">
            {/* Header */}
            <div className="bg-slate-800 shadow-lg border-b border-slate-700/40 shrink-0 z-10">
                <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 flex items-center justify-center">
                            <Image src={KSSLogo} alt="Kibuli Secondary School Logo" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-yellow-400">
                                Kibuli Secondary School
                            </h1>
                            <p className="text-sm text-gray-400">E-Voting System Dashboard</p>
                        </div>
                    </div>
                    
                    <div className="relative">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="flex items-center gap-3 px-4 py-2.5 bg-slate-700/80 hover:bg-slate-650 text-white rounded-xl transition-all border border-slate-600/50 cursor-pointer"
                        >
                            <div className="w-8 h-8 rounded-full bg-yellow-400 text-black flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                                {voter?.name ? voter.name.charAt(0).toUpperCase() : 'V'}
                            </div>
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-semibold">{voter?.name || 'Voter'}</p>
                                <p className="text-xs text-gray-400">{voter?.voter_no || 'Student'}</p>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all">
                                <div className="p-4 border-b border-slate-700/60 bg-slate-850">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-yellow-400 text-black flex items-center justify-center font-black text-lg shrink-0 shadow-lg">
                                            {voter?.name ? voter.name.charAt(0).toUpperCase() : 'V'}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-white font-bold truncate">{voter?.name || 'Voter'}</p>
                                            <p className="text-gray-400 text-xs truncate">No: {voter?.voter_no || 'N/A'}</p>
                                            {voter?.house && (
                                                <span className="inline-block mt-1 text-[10px] font-black uppercase tracking-wider bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded-md">
                                                    {formatHouseName(voter.house)} House
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2 bg-slate-800">
                                    <Link
                                        href="/"
                                        onClick={() => localStorage.removeItem("voter")}
                                        className="flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors w-full font-semibold text-sm cursor-pointer"
                                    >
                                        <LogOut size={16} />
                                        Logout / Exit Ballot
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-h-0 w-full" onClick={() => setIsDropdownOpen(false)}>
                {children}
            </div>
        </div>
    );
}
