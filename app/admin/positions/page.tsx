'use client'

import React, { useState, useEffect } from 'react';
import { fetchPositions } from '@/app/lib/candidates';
import { PositionWithCandidates } from '@/app/lib/types';

interface Candidate {
    id: number;
    name: string;
    _class: string;
    photo: string;
    stream: string;
    slogan: string;
}

interface Position {
    id: number;
    title: string;
    description: string;
    candidate_count: number;
    candidates: Candidate[];
}


// Candidate Card Component
const CandidateCard: React.FC<{ candidate: Candidate }> = ({ candidate }) => (
    <div className="bg-slate-700/50 border border-slate-600 rounded-lg p-3 flex items-center gap-3 hover:bg-slate-700 transition-colors min-w-[280px]">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-slate-600 flex-shrink-0">
            <img
                src={candidate.photo}
                alt={candidate.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                    e.currentTarget.src = "https://placehold.net/avatar-5.png";
                }}
            />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-white truncate">
                {candidate.name}
            </h4>
            <div className="flex items-center gap-2 text-xs mt-1">
                <span className="bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                    {candidate._class}
                </span>
                <span className="bg-green-500/20 text-green-300 px-2 py-0.5 rounded">
                    {candidate.stream}
                </span>
            </div>
            <p className="text-xs text-gray-400 mt-1.5 italic truncate">
                &quot;{candidate.slogan}&quot;
            </p>
        </div>
    </div>
);

// Skeleton Loader Component
const SkeletonLoader: React.FC = () => (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg animate-pulse">
        <div className="flex items-start justify-between mb-3">
            <div className="h-8 bg-slate-600 rounded w-1/2"></div>
            <div className="h-6 bg-slate-600 rounded-full w-24"></div>
        </div>
        <div className="space-y-2 mb-4">
            <div className="h-4 bg-slate-600 rounded w-full"></div>
            <div className="h-4 bg-slate-600 rounded w-5/6"></div>
        </div>
        <div className="flex gap-3">
            <div className="min-w-[280px] h-20 bg-slate-600 rounded-lg"></div>
            <div className="min-w-[280px] h-20 bg-slate-600 rounded-lg"></div>
        </div>
    </div>
);

// Position Card Component
const PositionCard: React.FC<{ position: Position }> = ({ position }) => (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-start justify-between mb-3">
            <h3 className="text-2xl font-bold text-yellow-400">{position.title}</h3>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-semibold">
                {position.candidate_count} {" "} Candidates
            </span>
        </div>
        <p className="text-gray-300 mb-4 leading-relaxed">{position.description}</p>

        {/* Candidates Horizontal Scroll */}
        {position.candidates.length > 0 ? (
            <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                <div className="flex gap-3">
                    {position.candidates.map((candidate) => (
                        <CandidateCard key={candidate.id} candidate={candidate} />
                    ))}
                </div>
            </div>
        ) : (
            <div className="text-center py-4 text-gray-400 text-sm bg-slate-700/30 rounded-lg border border-slate-600">
                No candidates registered yet
            </div>
        )}
    </div>
);

// Error Display Component
const ErrorDisplay: React.FC<{ error: string }> = ({ error }) => (
    <div className="space-y-6">
        <h2 className="text-3xl font-bold text-white mb-6">Leadership Positions</h2>
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4">
            <p className="text-red-300 font-semibold">Error loading positions</p>
            <p className="text-red-200 text-sm">{error}</p>
        </div>
    </div>
);

export default function PositionsPage() {
    const [positions, setPositions] = useState<PositionWithCandidates[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load positions from backend
    const loadPositions = async () => {
        try {
            setLoading(true);
            const data = await fetchPositions();
            setPositions(data.results);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        loadPositions();
    }, []);

    if (error) {
        return <ErrorDisplay error={error} />;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">Leadership Positions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {loading ? (
                    // Show skeleton loaders while loading
                    Array.from({ length: 6 }).map((_, index) => (
                        <SkeletonLoader key={index} />
                    ))
                ) : (
                    // Show actual positions when loaded
                    positions.map((position) => (
                        <PositionCard key={position.id} position={position} />
                    ))
                )}
            </div>
        </div>
    );
}