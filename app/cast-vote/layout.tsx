'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import { LogOut, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import KSSLogo from "@/app/kss-logo.png";

export default function Layout({ children }: { children: React.ReactNode }) {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Mock user data - replace with actual user data from authentication
    const user = {
        name: 'Voter',
        email: 'student@kss.edu.ug',
        avatar: 'https://placehold.net/avatar-4.png'
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-slate-800 shadow-lg">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
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
                            className="flex items-center gap-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                        >
                            <img
                                src={user.avatar}
                                alt="User Avatar"
                                className="w-8 h-8 rounded-full object-cover"
                            />
                            <div className="text-left hidden md:block">
                                <p className="text-sm font-semibold">{user.name}</p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                            </div>
                            <ChevronDown size={16} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-lg shadow-lg z-50">
                                <div className="p-4 border-b border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <img
                                            src={user.avatar}
                                            alt="User Avatar"
                                            className="w-12 h-12 rounded-full object-cover"
                                        />
                                        <div>
                                            <p className="text-white font-semibold">{user.name}</p>
                                            <p className="text-gray-400 text-sm">{user.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-2">
                                    <Link
                                        href="/"
                                        className="flex items-center gap-2 px-3 py-2 text-gray-300 hover:bg-slate-700 hover:text-white rounded-lg transition-colors w-full"
                                    >
                                        <LogOut size={16} />
                                        Logout
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="max-w-6xl mx-auto px-6 py-8" onClick={() => setIsDropdownOpen(false)}>
                {children}
            </div>
        </div>
    );
}
