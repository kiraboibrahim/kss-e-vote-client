'use client'

import React, { useState, useEffect } from 'react';
import { TrendingUp, RefreshCw, Users, Vote } from 'lucide-react';
import { fetchLiveResults, fetchElections } from '@/app/lib/candidates';
import { Election } from '@/app/lib/types';

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
    const POLL_INTERVAL = 40; // 40 Seconds
    const [results, setResults] = useState<LiveVotingResults | null>(null);
    const [elections, setElections] = useState<Election[]>([]);
    const [selectedElectionId, setSelectedElectionId] = useState<number | undefined>(undefined);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    const [nextUpdate, setNextUpdate] = useState<number>(POLL_INTERVAL);

    // Auto-scroll states
    const [autoScrollActive, setAutoScrollActive] = useState(true);
    const [scrollSpeed, setScrollSpeed] = useState<number>(30); // pixels per second
    const [isHovered, setIsHovered] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Sync fullscreen state
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const playNotificationSound = () => {
        try {
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
        if (selectedElectionId === undefined) return;
        try {
            if (isInitial) {
                setLoading(true);
            } else {
                setIsRefreshing(true);
            }

            const data = await fetchLiveResults(selectedElectionId);
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

    // Load elections list on mount
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const electionsList = await fetchElections();
                setElections(electionsList);
                const active = electionsList.find(e => e.is_active);
                const initialId = active?.id || electionsList[0]?.id;
                setSelectedElectionId(initialId);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred while loading elections');
                setLoading(false);
            }
        };
        loadInitialData();
    }, []);

    // Load results when election selection changes
    useEffect(() => {
        if (selectedElectionId !== undefined) {
            loadResults(true);
        } else if (elections.length === 0 && !loading) {
            setResults(null);
            setLoading(false);
        }
    }, [selectedElectionId]);

    // Setup periodic polling
    useEffect(() => {
        if (!loading && !error && selectedElectionId !== undefined) {
            const pollInterval = setInterval(() => loadResults(false), 30 * 1000);
            return () => clearInterval(pollInterval);
        }
    }, [loading, error, selectedElectionId]);

    // Setup countdown timer
    useEffect(() => {
        if (!loading && !error && selectedElectionId !== undefined) {
            const countdownInterval = setInterval(() => {
                setNextUpdate(prev => (prev <= 1 ? POLL_INTERVAL : prev - 1));
            }, 1000);
            return () => clearInterval(countdownInterval);
        }
    }, [loading, error, selectedElectionId]);

    // Auto-scroll loop
    useEffect(() => {
        if (!autoScrollActive || loading || error || !results || isHovered) return;

        let animationFrameId: number;
        let lastTime = performance.now();
        let scrollPos = window.scrollY;
        let pauseTimer = 0;

        const scrollStep = (time: number) => {
            const delta = time - lastTime;
            lastTime = time;

            if (pauseTimer > 0) {
                pauseTimer -= delta;
                animationFrameId = requestAnimationFrame(scrollStep);
                return;
            }

            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll <= 0) {
                animationFrameId = requestAnimationFrame(scrollStep);
                return;
            }

            // Sync with manual user scrolling
            if (Math.abs(window.scrollY - scrollPos) > 15) {
                scrollPos = window.scrollY;
            }

            // Move scroll position
            const pixelsToScroll = (scrollSpeed * delta) / 1000;
            scrollPos += pixelsToScroll;

            if (scrollPos >= maxScroll) {
                scrollPos = maxScroll;
                window.scrollTo(0, scrollPos);
                pauseTimer = 4000; // Pause 4s at the bottom
                scrollPos = -100; // Reset scroll position indicator
            } else if (scrollPos < 0) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                scrollPos = 0;
                pauseTimer = 3000; // Pause 3s at the top
            } else {
                window.scrollTo(0, scrollPos);
            }

            animationFrameId = requestAnimationFrame(scrollStep);
        };

        animationFrameId = requestAnimationFrame(scrollStep);
        return () => cancelAnimationFrame(animationFrameId);
    }, [autoScrollActive, scrollSpeed, loading, error, results, isHovered]);

    if (error) {
        return <ErrorState error={error} onRetry={() => loadResults(true)} />;
    }

    return (
        <div 
            className="min-h-screen bg-slate-900 p-6 select-none"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                        <h2 className="text-3xl font-bold text-white">Live Election Results</h2>
                        {isHovered && autoScrollActive && (
                            <span className="text-xs bg-yellow-400/20 text-yellow-400 border border-yellow-400/30 px-2.5 py-1 rounded-full font-bold animate-pulse">
                                Paused (Hovered)
                            </span>
                        )}
                    </div>
                    
                    <div className="flex items-center gap-4 flex-wrap">
                        {/* Auto Scroll controls */}
                        <div className="flex items-center gap-3 bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl text-sm font-semibold shadow-md">
                            <div className="flex items-center gap-2">
                                <span className="text-gray-300">Auto-Scroll:</span>
                                <button
                                    onClick={() => setAutoScrollActive(!autoScrollActive)}
                                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                        autoScrollActive 
                                            ? 'bg-yellow-400 text-slate-900 shadow-md shadow-yellow-400/10' 
                                            : 'bg-slate-700 text-gray-400 hover:text-white'
                                    }`}
                                >
                                    {autoScrollActive ? 'ON' : 'OFF'}
                                </button>
                            </div>
                            {autoScrollActive && (
                                <div className="flex items-center gap-2 border-l border-slate-700 pl-3">
                                    <span className="text-gray-300">Speed:</span>
                                    <select
                                        value={scrollSpeed}
                                        onChange={(e) => setScrollSpeed(Number(e.target.value))}
                                        className="bg-slate-900 text-yellow-400 border border-slate-700 rounded px-2 py-0.5 text-xs focus:outline-none cursor-pointer"
                                    >
                                        <option value={15}>Slow</option>
                                        <option value={30}>Medium</option>
                                        <option value={60}>Fast</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        {/* Fullscreen mode button */}
                        <button
                            onClick={toggleFullScreen}
                            className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl px-4 py-2 text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
                        >
                            {isFullscreen ? 'Exit Full Screen' : 'Go Full Screen'}
                        </button>

                        {/* Election Selector */}
                        {elections.length > 0 && (
                            <select
                                value={selectedElectionId || ''}
                                onChange={(e) => setSelectedElectionId(Number(e.target.value))}
                                className="bg-slate-800 text-white border border-slate-700 rounded-lg px-4 py-2 font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                            >
                                {elections.map((elec) => (
                                    <option key={elec.id} value={elec.id}>
                                        {elec.title} {elec.is_active ? '(Active)' : ''} {elec.is_demo ? '(Demo)' : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
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