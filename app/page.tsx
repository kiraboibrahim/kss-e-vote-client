"use client";

import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import Image from 'next/image';
import KSSLogo from "@/app/kss-logo.png";
import { authenticate } from './lib/auth';
import { UserRole } from './lib/types';
import { storeVoter } from './lib/utils';

export default function LoginPage() {
    const [studentId, setStudentId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('voter');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleContinue = async () => {
        setLoading(true);
        setError('');

        try {
            const result = await authenticate(selectedRole, {
                studentId: selectedRole === 'voter' ? studentId : undefined,
                email: selectedRole === 'admin' ? email : undefined,
                password: selectedRole === 'admin' ? password : undefined,
            });

            // Store auth data
            if (selectedRole === 'admin') {
                window.location.href = '/admin/candidates';
            } else {
                storeVoter(result);
                window.location.href = '/cast-vote';
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Container for Header and Form */}
            <div className="max-w-2xl mx-auto px-6 py-12 space-y-6">
                {/* Header */}
                <div className="bg-slate-800 shadow-lg rounded-2xl px-6 py-4 flex items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center">
                        <Image src={KSSLogo} alt="Kibuli Secondary School Logo" />
                    </div>
                    <h1 className="text-2xl font-bold text-yellow-400">
                        Kibuli Secondary School
                    </h1>
                </div>

                {/* Main Content */}
                <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 md:p-12">
                    {/* KSS Logo Center */}
                    <div className="flex justify-center mb-8">
                        <div className="w-48 h-48 flex items-center justify-center">
                            <Image src={KSSLogo} alt="Kibuli Secondary School Logo" />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">
                            School E-Voting System
                        </h2>
                        <p className="text-lg text-gray-300">
                            Secure and transparent student elections
                        </p>
                    </div>

                    {/* Role Selection Buttons */}
                    <div className="flex justify-center gap-4 mb-8">
                        <button
                            onClick={() => setSelectedRole('voter')}
                            className={`px-12 py-3 rounded-full text-lg font-bold transition-all duration-300 ${selectedRole === 'voter'
                                ? 'bg-yellow-400 text-black'
                                : 'bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
                                }`}
                        >
                            Voter
                        </button>
                        <button
                            onClick={() => setSelectedRole('admin')}
                            className={`px-12 py-3 rounded-full text-lg font-bold transition-all duration-300 ${selectedRole === 'admin'
                                ? 'bg-yellow-400 text-black'
                                : 'bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
                                }`}
                        >
                            Admin
                        </button>
                    </div>

                    {/* Form Section */}
                    <div className="space-y-4">
                        {selectedRole === 'voter' ? (
                            <>
                                <label className="block text-center text-xl font-semibold text-white mb-2">
                                    Student ID
                                </label>
                                <input
                                    type="text"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    placeholder="Enter your student ID"
                                    className="w-full px-6 py-4 rounded-xl border-2 border-yellow-400 bg-slate-700 text-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                />
                            </>
                        ) : (
                            <>
                                <label className="block text-center text-xl font-semibold text-white mb-4">
                                    Admin Login
                                </label>

                                {/* Email Input */}
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full pl-12 pr-6 py-4 rounded-xl border-2 border-yellow-400 bg-slate-700 text-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Enter your password"
                                        className="w-full pl-12 pr-6 py-4 rounded-xl border-2 border-yellow-400 bg-slate-700 text-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                                    />
                                </div>
                            </>
                        )}

                        <button
                            onClick={handleContinue}
                            disabled={loading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-xl text-lg font-semibold transition-colors duration-300 shadow-lg mt-6 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    {selectedRole === 'voter' ? 'Validating...' : 'Logging in...'}
                                </>
                            ) : (
                                selectedRole === 'voter' ? 'Continue Voting' : 'Login'
                            )}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-900/30 border border-red-500/50 rounded-xl">
                                <p className="text-red-300 text-sm text-center">{error}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}