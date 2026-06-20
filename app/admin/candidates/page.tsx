'use client'

import React, { useState, useEffect } from 'react';
import { Candidate, Election } from '@/app/lib/types';
import { fetchAllCandidates, fetchElections } from '@/app/lib/candidates';

export default function CandidatesPage() {
    const [candidates, setCandidates] = useState<Candidate[]>([]);
    const [elections, setElections] = useState<Election[]>([]);
    const [selectedElectionId, setSelectedElectionId] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch elections on mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const electionsList = await fetchElections();
                setElections(electionsList);
                const active = electionsList.find(e => e.is_active);
                setSelectedElectionId(active?.id || electionsList[0]?.id);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred loading elections');
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Load candidates when selectedElectionId changes
    useEffect(() => {
        if (selectedElectionId !== undefined) {
            const loadCandidates = async () => {
                try {
                    setLoading(true);
                    const data = await fetchAllCandidates(selectedElectionId);
                    setCandidates(data.results);
                } catch (err) {
                    setError(err instanceof Error ? err.message : 'An error occurred loading candidates');
                } finally {
                    setLoading(false);
                }
            };
            loadCandidates();
        }
    }, [selectedElectionId]);

    // Skeleton loader component
    const SkeletonLoader = () => (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-slate-600 rounded-full"></div>
                <div className="flex-1">
                    <div className="h-8 bg-slate-600 rounded mb-1 w-3/4"></div>
                    <div className="h-5 bg-slate-600 rounded mb-1 w-1/2"></div>
                    <div className="h-4 bg-slate-600 rounded mb-3 w-1/3"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-slate-600 rounded w-full"></div>
                        <div className="h-4 bg-slate-600 rounded w-5/6"></div>
                        <div className="h-4 bg-slate-600 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white mb-6">Election Candidates</h2>
                <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4">
                    <p className="text-red-300 font-semibold">Error loading candidates</p>
                    <p className="text-red-200 text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                <h2 className="text-3xl font-bold text-white">Election Candidates</h2>
                {elections.length > 0 && (
                    <select
                        value={selectedElectionId || ''}
                        onChange={(e) => setSelectedElectionId(Number(e.target.value))}
                        className="bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    >
                        {elections.map((elec) => (
                            <option key={elec.id} value={elec.id}>
                                {elec.title} {elec.is_active ? '(Active)' : ''} {elec.is_demo ? '(Demo)' : ''}
                            </option>
                        ))}
                    </select>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <SkeletonLoader key={index} />
                    ))
                ) : (
                    candidates.map(candidate => (
                        <div key={candidate.id} className="bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                            <div className="flex items-start gap-4">
                                <img
                                    src={candidate.photo}
                                    alt={candidate.name}
                                    className="w-16 h-16 rounded-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "https://placehold.net/avatar-5.png";
                                    }}
                                />
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold text-white mb-1">{candidate.name}</h3>
                                    <p className="text-yellow-400 font-semibold mb-1">{candidate.post_title}</p>
                                    <p className="text-gray-400 text-sm mb-3">{candidate.stream}</p>
                                    <p className="text-gray-300 leading-relaxed">{candidate.slogan}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
