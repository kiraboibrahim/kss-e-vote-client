'use client'

import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Users, Vote } from 'lucide-react';
import { fetchLiveResults } from '@/app/lib/candidates';

interface Candidate {
    id: number;
    name: string;
    _class: string;
    photo: string;
    stream: string;
    slogan: string;
    votes: number;
    percentage: number;

}

interface Position {
    id: number;
    title: string;
    description: string;
    total_votes: number;
    candidates: Candidate[];
}

interface Statistics {
    total_voters: number;
    voted_count: number;
    voter_turnout_percentage: number;
}

export interface LiveVotingResults {
    positions: Position[];
    statistics: Statistics;
}

// Skeleton Loader
const SkeletonLoader = () => (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg animate-pulse">
        <div className="h-6 bg-slate-700 rounded mb-4 w-1/3"></div>
        <div className="space-y-4">
            {[1, 2].map(i => (
                <div key={i} className="bg-slate-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-slate-600 rounded-full"></div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <div className="h-5 bg-slate-600 rounded w-32"></div>
                                <div className="flex items-center gap-3">
                                    <div className="h-4 bg-slate-600 rounded w-16"></div>
                                    <div className="h-4 bg-slate-600 rounded w-12"></div>
                                </div>
                            </div>
                            <div className="h-4 bg-slate-600 rounded w-24 mb-1"></div>
                            <div className="h-4 bg-slate-600 rounded w-32 mb-2"></div>
                            <div className="w-full bg-slate-600 rounded-full h-3"></div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

// Candidate Card Component
const CandidateCard = ({ candidate }: { candidate: Candidate }) => (
    <div className="bg-slate-700 rounded-lg p-4 space-y-3 hover:bg-slate-600 transition-colors">
        <div className="flex items-start gap-4">
            <img
                src={candidate.photo || 'https://placehold.net/avatar-5.png'}
                alt={candidate.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-yellow-400"
                onError={(e) => {
                    e.currentTarget.src = 'https://placehold.net/avatar-5.png';
                }}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <span className="text-white font-semibold text-lg truncate">
                        {candidate.name}
                    </span>
                    <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-gray-400 text-sm">{candidate.votes} votes</span>
                        <span className="text-yellow-400 font-bold">
                            {candidate.percentage.toFixed(1)}%
                        </span>
                    </div>
                </div>
                <p className="text-gray-300 text-sm mb-1">
                    <strong>Stream:</strong> {candidate.stream} | <strong>Class:</strong> {candidate._class}
                </p>
                <p className="text-gray-300 text-sm mb-2 italic">
                    &ldquo;{candidate.slogan}&quot;
                </p>
                <div className="w-full bg-slate-600 rounded-full h-3 overflow-hidden">
                    <div
                        className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${candidate.percentage}%` }}
                    ></div>
                </div>
            </div>
        </div>
    </div>
);

// Position Card Component
const PositionCard = ({ position }: { position: Position }) => {
    const sortedCandidates = [...position.candidates].sort((a, b) => b.votes - a.votes);

    return (
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <div>
                    <h3 className="text-xl font-bold text-yellow-400">{position.title}</h3>
                    <p className="text-gray-400 text-sm">{position.description}</p>
                </div>
                <div className="flex items-center gap-2 bg-slate-700 px-4 py-2 rounded-lg">
                    <Vote size={16} className="text-gray-400" />
                    <span className="text-gray-300 text-sm font-semibold">
                        {position.total_votes} total votes
                    </span>
                </div>
            </div>
            <div className="space-y-4">
                {sortedCandidates.map((candidate, index) => (
                    <div key={candidate.id} className="relative">
                        {index === 0 && position.total_votes > 0 && (
                            <div className="absolute -top-2 -left-2 bg-yellow-500 text-slate-900 text-xs font-bold px-2 py-1 rounded-full z-10">
                                Leading
                            </div>
                        )}
                        <CandidateCard candidate={candidate} />
                    </div>
                ))}
            </div>
        </div>
    );
};

// Statistics Card Component
const StatisticsCard = ({ statistics }: { statistics: Statistics }) => (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 shadow-lg">
        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <Users size={20} />
            Voter Turnout Statistics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-lg p-4">
                <p className="text-blue-200 text-sm">Total Registered Voters</p>
                <p className="text-white text-3xl font-bold">{statistics.total_voters}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
                <p className="text-blue-200 text-sm">Voters Who Voted</p>
                <p className="text-white text-3xl font-bold">{statistics.voted_count}</p>
            </div>
            <div className="bg-white/10 rounded-lg p-4">
                <p className="text-blue-200 text-sm">Turnout Percentage</p>
                <p className="text-white text-3xl font-bold">{statistics.voter_turnout_percentage.toFixed(1)}%</p>
            </div>
        </div>
    </div>
);

// Error State Component
const ErrorState = ({ error, onRetry }: { error: string; onRetry: () => void }) => (
    <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-white">Live Election Results</h2>
        </div>
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6">
            <p className="text-red-300 font-semibold text-lg mb-2">Error loading results</p>
            <p className="text-red-200 text-sm mb-4">{error}</p>
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
                Try Again
            </button>
        </div>
    </div>
);

// Empty State Component
const EmptyState = () => (
    <div className="bg-slate-800 rounded-xl p-8 text-center">
        <Vote size={48} className="text-gray-600 mx-auto mb-4" />
        <p className="text-gray-400 text-lg">No results available yet</p>
        <p className="text-gray-500 text-sm mt-2">Results will appear once voting begins</p>
    </div>
);

// Status Bar Component
const StatusBar = ({
    lastUpdated,
    nextUpdate,
    onRefresh,
    isRefreshing
}: {
    lastUpdated: string;
    nextUpdate: number;
    onRefresh: () => void;
    isRefreshing: boolean;
}) => {
    const formatCountdown = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="w-full space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-green-400">
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="font-semibold">Live</span>
                    </div>
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        {isRefreshing ? 'Refreshing...' : 'Refresh'}
                    </button>
                </div>
                {lastUpdated && (
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-300">
                            <strong>Last Updated:</strong> {lastUpdated}
                        </span>
                        <span className="text-yellow-400 font-semibold">
                            Next update: {formatCountdown(nextUpdate)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Info Banner Component
const InfoBanner = () => (
    <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4 flex items-start gap-3">
        <TrendingUp className="text-blue-400 mt-1 flex-shrink-0" size={20} />
        <div>
            <p className="text-blue-300 font-semibold">Results update automatically every 2 minutes</p>
            <p className="text-blue-200 text-sm">These results are provisional and will be finalized at the end of voting.</p>
        </div>
    </div>
);

// Main Component
export default function ResultsPage() {
    const POLL_INTERVAL = 40; // 30 Seconds
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [results, setResults] = useState<LiveVotingResults | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [nextUpdate, setNextUpdate] = useState<number>(POLL_INTERVAL);

    const playNotificationSound = () => {
        try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.value = 800;
            oscillator.type = 'sine';

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (err) {
            console.error('Could not play notification sound:', err);
        }
    };

    const hasResultsChanged = (oldVotingData: LiveVotingResults | null, newVotingData: LiveVotingResults | null) => {
        const oldResults = oldVotingData?.positions;
        const newResults = newVotingData?.positions;
        if (!oldResults) return false;
        if (!newResults) return false;

        if (oldResults.length !== newResults.length) return true;

        for (let i = 0; i < newResults.length; i++) {
            const oldPos = oldResults[i];
            const newPos = newResults[i];

            if (oldPos.total_votes !== newPos.total_votes) return true;

            for (let j = 0; j < newPos.candidates.length; j++) {
                if (oldPos.candidates[j]?.votes !== newPos.candidates[j]?.votes) {
                    return true;
                }
            }
        }

        return false;
    };

    const loadResults = async (isInitial = false) => {
        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }

            // Replace with your actual API endpoint
            const data = await fetchLiveResults();
            if (!isInitial && hasResultsChanged(results, data)) {
                playNotificationSound();
            }

            setResults(data);
            setLastUpdated(new Date().toLocaleTimeString());
            setError(null);
            setNextUpdate(POLL_INTERVAL);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred while loading results');
        } finally {
            if (isInitial) {
                setLoading(false);
            } else {
                setIsRefreshing(false);
            }
        }
    };

    useEffect(() => {
        loadResults(true);
    }, []);

    useEffect(() => {
        if (!loading && !error) {
            const pollInterval = setInterval(() => loadResults(false), 30 * 1000);
            return () => clearInterval(pollInterval);
        }
    }, [loading, error]);

    useEffect(() => {
        if (!loading && !error) {
            const countdownInterval = setInterval(() => {
                setNextUpdate(prev => (prev <= 1 ? 120 : prev - 1));
            }, 1000);
            return () => clearInterval(countdownInterval);
        }
    }, [loading, error]);

    if (error) {
        return <ErrorState error={error} onRetry={() => loadResults(true)} />;
    }

    return (
        <div className="min-h-screen bg-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <h2 className="text-3xl font-bold text-white">Live Election Results</h2>
                </div>

                {!loading && !error && results && (
                    <StatusBar
                        lastUpdated={lastUpdated}
                        nextUpdate={nextUpdate}
                        onRefresh={() => loadResults(false)}
                        isRefreshing={isRefreshing}
                    />
                )}

                {loading ? (
                    <div className="space-y-8">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <SkeletonLoader key={index} />
                        ))}
                    </div>
                ) : results && results.positions.length === 0 ? (
                    <EmptyState />
                ) : results ? (
                    <>
                        <StatisticsCard statistics={results.statistics} />

                        <div className="space-y-8">
                            {results.positions.map((position) => (
                                <PositionCard key={position.id} position={position} />
                            ))}
                        </div>

                        <InfoBanner />
                    </>
                ) : null}
            </div>
        </div>
    );
}