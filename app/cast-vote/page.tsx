'use client'
import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, CheckCircle, Info, Loader2, X, ListTodo, LogOut } from 'lucide-react';
import { castVote, fetchPositions, fetchVoterStatus } from '../lib/candidates';
import { getVoter } from '../lib/utils';

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
    required_selections: number;
    candidate_count: number;
    candidates: Candidate[];
}

const LoadingState = () => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-yellow-400 mx-auto mb-4" />
            <p className="text-gray-300">Loading voting data...</p>
        </div>
    </div>
);

const ErrorState = ({ error }: { error: string }) => (
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-8 text-center max-w-md">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Error Loading Data</h3>
            <p className="text-red-200 mb-4">{error}</p>
            <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
            >
                Try Again
            </button>
        </div>
    </div>
);

const SuccessState = () => (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="bg-slate-800 rounded-2xl p-12 text-center max-w-2xl shadow-2xl">
            <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20">
                    <CheckCircle size={60} className="text-white" />
                </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Vote Cast Successfully!</h2>
            <p className="text-gray-300 text-lg mb-6">
                Thank you for participating in the KSS student elections. Your vote has been recorded securely.
            </p>
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4 mb-8">
                <p className="text-blue-300 text-sm">
                    Results will be announced after voting closes.
                </p>
            </div>
            <button
                onClick={() => {
                    localStorage.removeItem("voter");
                    window.location.href = '/';
                }}
                className="px-8 py-3 bg-red-600 hover:bg-red-750 text-white rounded-xl font-bold transition-all shadow-md cursor-pointer inline-flex items-center gap-2"
            >
                <LogOut size={18} />
                Logout / Exit Ballot
            </button>
        </div>
    </div>
);

const VotingHeader = () => (
    <div className="pb-3 border-b border-slate-700/40">
        <h2 className="text-2xl font-bold text-white tracking-tight">KSS Student Ballot</h2>
    </div>
);

const CandidateButton = ({
    candidate,
    isSelected,
    onSelect
}: {
    candidate: Candidate;
    isSelected: boolean;
    onSelect: () => void
}) => (
    <button
        onClick={onSelect}
        className={`relative p-4 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer ${isSelected
            ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20 scale-[1.02]'
            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
            }`}
    >
        {isSelected && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-yellow-400 px-2 py-0.5 rounded-md text-black font-extrabold text-[10px] uppercase tracking-wider shadow-md">
                <Check size={12} className="stroke-[3]" />
                Selected
            </div>
        )}
        <div className="flex items-center gap-4">
            <img src={candidate.photo} alt={candidate.name} className="w-16 h-16 rounded-xl object-cover border border-slate-600 shrink-0 shadow-sm" />
            <div className="flex-1 min-w-0">
                <h4 className="text-lg font-bold text-white mb-0.5 truncate">{candidate.name}</h4>
                <p className="text-gray-400 text-xs mb-1 truncate">{candidate._class}</p>
                <p className="text-gray-300 italic text-xs truncate">&quot;{candidate.slogan}&quot;</p>
            </div>
        </div>
    </button>
);

const PositionCard = ({
    positionId,
    position,
    candidates,
    selectedCandidateIds = [],
    onVoteSelect
}: {
    positionId: number;
    position: Position;
    candidates: Candidate[];
    selectedCandidateIds?: number[];
    onVoteSelect: (positionId: number, candidateId: number) => void
}) => {
    const required = position.required_selections || 1;
    const currentSelectedCount = selectedCandidateIds.length;
    const isCompleted = currentSelectedCount === required;

    return (
        <div className="bg-slate-800/80 rounded-2xl p-5 shadow-lg border border-slate-700/50">
            {/* Header */}
            <div className="border-b border-slate-700/50 pb-3 mb-4 flex items-center justify-between gap-3">
                <div className="min-w-0 pr-4 flex-1">
                    <h3 className="text-xl font-black text-white tracking-tight">
                        Position: <span className="text-yellow-400">{position.title}</span>
                    </h3>
                    {position.description && (
                        <p className="text-slate-300 text-xs mt-0.5 leading-relaxed truncate">{position.description}</p>
                    )}
                </div>
                {isCompleted && (
                    <div className="flex items-center gap-1.5 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-lg border border-green-500/20 shrink-0">
                        <Check size={14} className="stroke-[3]" />
                        <span className="text-[10px] font-extrabold uppercase tracking-wider">Completed</span>
                    </div>
                )}
            </div>

            {/* Directive Box */}
            {isCompleted ? (
                <div className="bg-green-500/10 border border-green-500/25 text-green-400 rounded-xl px-4 py-3 flex items-center gap-3 text-sm mb-4 font-bold shadow-inner">
                    <CheckCircle size={18} className="shrink-0 text-green-400" />
                    <span>Selection complete! You have chosen {required} of {required} required candidates.</span>
                </div>
            ) : (
                <div className="bg-yellow-400/10 border border-yellow-400/25 text-yellow-400 rounded-xl px-4 py-3 flex items-center gap-3 text-sm mb-4 font-bold animate-pulse shadow-inner">
                    <Info size={18} className="shrink-0 text-yellow-400" />
                    <span>
                        Selection required: Please select exactly <span className="underline decoration-yellow-400 decoration-2 font-black">{required}</span> {required === 1 ? 'candidate' : 'candidates'} for this position. (Selected: {currentSelectedCount} of {required})
                    </span>
                </div>
            )}

            {/* Candidates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {candidates.map(candidate => (
                    <CandidateButton
                        key={candidate.id}
                        candidate={candidate}
                        isSelected={selectedCandidateIds.includes(candidate.id)}
                        onSelect={() => onVoteSelect(positionId, candidate.id)}
                    />
                ))}
            </div>
        </div>
    );
};


const IncompleteWarning = ({ show }: { show: boolean }) => {
    if (!show) return null;

    return (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-2.5 flex items-center gap-3 text-amber-400 text-sm">
            <AlertCircle size={16} className="shrink-0 animate-pulse" />
            <span className="font-semibold">Ballot Incomplete:</span>
            <span className="text-slate-350">Please complete all required selections before submitting.</span>
        </div>
    );
};

const ConfirmationModal = ({
    show,
    selectedVotes,
    positionsWithCandidates,
    error,
    submitting,
    onCancel,
    onConfirm
}: {
    show: boolean;
    selectedVotes: { [positionId: number]: number[] };
    positionsWithCandidates: Position[];
    error: string | null;
    submitting: boolean;
    onCancel: () => void;
    onConfirm: () => void
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
                <h3 className="text-2xl font-bold text-white mb-2 shrink-0">Confirm Your Votes</h3>
                <p className="text-gray-300 mb-4 text-sm shrink-0">
                    Please review your selections before submitting. Once submitted, votes cannot be changed.
                </p>

                <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 mb-6 space-y-4 overflow-y-auto flex-1 custom-scrollbar">
                    {Object.entries(selectedVotes).map(([positionId, candidateIds]) => {
                        const position = positionsWithCandidates.find(p => p.id === Number(positionId));
                        if (!position) return null;
                        
                        return (
                            <div key={positionId} className="border-b border-slate-700/60 last:border-b-0 pb-3 last:pb-0">
                                <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">{position.title}</p>
                                <div className="mt-2 space-y-2">
                                    {candidateIds.length === 0 ? (
                                        <p className="text-sm text-red-400 italic">No selection made</p>
                                    ) : (
                                        candidateIds.map(candidateId => {
                                            const candidate = position.candidates.find(c => c.id === candidateId);
                                            if (!candidate) return null;
                                            
                                            return (
                                                <div key={candidateId} className="flex items-center justify-between pl-3 border-l-2 border-slate-600 py-1">
                                                    <div className="flex items-center gap-3">
                                                        {candidate.photo ? (
                                                            <img 
                                                                src={candidate.photo} 
                                                                alt={candidate.name} 
                                                                className="w-10 h-10 rounded-full object-cover border border-slate-500"
                                                            />
                                                        ) : (
                                                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">
                                                                {candidate.name?.charAt(0)}
                                                            </div>
                                                        )}
                                                        <div>
                                                            <p className="text-white font-bold text-sm">{candidate.name}</p>
                                                            <p className="text-xs text-gray-400">{candidate._class} {candidate.stream ? `(${candidate.stream})` : ''}</p>
                                                        </div>
                                                    </div>
                                                    <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">Selected</span>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-4 shrink-0">
                        <p className="text-red-300 font-semibold">Error</p>
                        <p className="text-red-200 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex gap-4 shrink-0">
                    <button
                        onClick={onCancel}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Review Again
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={submitting}
                        className="flex-1 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                        {submitting ? 'Submitting...' : 'Confirm & Submit'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Helper function to transform votes to backend format
function transformVotesToBackendFormat(votes: { [positionId: number]: number[] }) {
    return {
        votes: Object.entries(votes).flatMap(([positionId, candidateIds]) => 
            candidateIds.map(candidateId => ({
                post: Number(positionId),
                candidate: candidateId
            }))
        )
    };
}

export default function CastVotePage() {
    const [positionsWithCandidates, setPositionsWithCandidates] = useState<Position[]>([]);
    const [selectedVotes, setSelectedVotes] = useState<{ [positionId: number]: number[] }>({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [votingComplete, setVotingComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeStep, setActiveStep] = useState(0);

    // Load data on component mount
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError(null);
                const [positionsData, voterStatusData] = await Promise.all([
                    fetchPositions(),
                    fetchVoterStatus()
                ]);
                console.log('Positions data:', positionsData);
                console.log('Voter status data:', voterStatusData);
                
                // If the voter has already voted, set votingComplete to true immediately
                if (voterStatusData.voted_positions.length > 0 || voterStatusData.votes_cast > 0) {
                    setVotingComplete(true);
                }
                
                setPositionsWithCandidates(positionsData.results);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load voting data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // Scroll active position tab into view (works for horizontal overflow on mobile)
    useEffect(() => {
        const activeTab = document.getElementById(`nav-tab-${activeStep}`);
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [activeStep]);

    const handleVoteSelect = (positionId: number, candidateId: number) => {
        const position = positionsWithCandidates.find(p => p.id === positionId);
        if (!position) return;
        const required = position.required_selections || 1;

        setSelectedVotes(prev => {
            const currentSelections = prev[positionId] || [];
            if (currentSelections.includes(candidateId)) {
                // Deselect
                return {
                    ...prev,
                    [positionId]: currentSelections.filter(id => id !== candidateId)
                };
            } else {
                // Select
                if (required === 1) {
                    // Replace selection
                    return {
                        ...prev,
                        [positionId]: [candidateId]
                    };
                } else {
                    // For multi-select, only allow selecting up to 'required'
                    if (currentSelections.length < required) {
                        return {
                            ...prev,
                            [positionId]: [...currentSelections, candidateId]
                        };
                    } else {
                        // FIFO replacement of candidate selections
                        return {
                            ...prev,
                            [positionId]: [...currentSelections.slice(1), candidateId]
                        };
                    }
                }
            }
        });
    };

    const allPositionsVoted = positionsWithCandidates.length > 0 && positionsWithCandidates.every(
        position => (selectedVotes[position.id] || []).length === (position.required_selections || 1)
    );

    const fullyVotedPositionsCount = positionsWithCandidates.filter(
        position => (selectedVotes[position.id] || []).length === (position.required_selections || 1)
    ).length;

    const confirmVoteSubmission = async () => {
        setSubmitting(true);
        try {
            const voterDetails = getVoter();
            if (!voterDetails.voter_no) {
                setError('Voter No not found. Please validate your Voter No.');
                setShowConfirmation(false);
                return;
            }

            // Transform votes to backend format
            const backendVotes = transformVotesToBackendFormat(selectedVotes);
            console.log('Submitting votes:', backendVotes);

            await castVote(backendVotes);
            setVotingComplete(true);
            setShowConfirmation(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit vote');
            setShowConfirmation(false);
        } finally {
            setSubmitting(false);
        }
    };

    const activePosition = positionsWithCandidates[activeStep];

    if (votingComplete) return <SuccessState />;
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;

    return (
        <>
            <div className="max-w-[1440px] mx-auto px-6 w-full flex-1 flex flex-col lg:flex-row min-h-0 lg:h-full overflow-hidden gap-8 py-8">
                {/* Left Column: Sidebar (Positions List) */}
                {positionsWithCandidates.length > 0 && (
                    <div className="w-full lg:w-80 shrink-0 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 lg:h-full lg:flex lg:flex-col min-h-0">
                        <div className="flex items-center justify-between mb-3 px-2 hidden lg:flex">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
                                Ballot Positions
                            </h3>
                            <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2.5 py-0.5 rounded-md">
                                {fullyVotedPositionsCount} / {positionsWithCandidates.length}
                            </span>
                        </div>
                        <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden pb-2 lg:pb-0 pr-0 lg:pr-1 custom-scrollbar scroll-smooth lg:flex-1 min-h-0">
                            {positionsWithCandidates.map((position, index) => {
                                const selections = selectedVotes[position.id] || [];
                                const required = position.required_selections || 1;
                                const isCompleted = selections.length === required;
                                const isActive = index === activeStep;

                                return (
                                    <button
                                        key={position.id}
                                        id={`nav-tab-${index}`}
                                        onClick={() => setActiveStep(index)}
                                        className={`flex items-center justify-between w-full text-left gap-3 px-4 py-3 rounded-xl text-sm font-bold border transition-all duration-300 cursor-pointer shrink-0 ${
                                            isActive
                                                ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-400/10 scale-[1.01]'
                                                : isCompleted
                                                    ? 'bg-slate-800/80 border-slate-700 text-green-400 hover:bg-slate-700/80 hover:text-green-400'
                                                    : 'bg-slate-850/40 border-slate-700/40 text-gray-400 hover:text-white hover:bg-slate-800/50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-2.5 truncate">
                                            {isCompleted ? (
                                                <Check size={16} className="stroke-[3] text-green-500 shrink-0" />
                                            ) : (
                                                <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-black' : 'bg-gray-600'}`}></span>
                                            )}
                                            <span className="truncate">{position.title}</span>
                                        </div>
                                        
                                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                                            isActive 
                                                ? 'bg-black/10 text-black' 
                                                : isCompleted 
                                                    ? 'bg-green-500/15 text-green-400' 
                                                    : 'bg-slate-750 text-gray-300'
                                        }`}>
                                            {selections.length}/{required}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Right Column: Main Content Area */}
                {positionsWithCandidates.length > 0 && (
                    <div className="flex-1 w-full lg:h-full lg:overflow-y-auto custom-scrollbar pr-0 lg:pr-2 flex flex-col gap-6 min-h-0">

                        <IncompleteWarning show={!allPositionsVoted} />

                        {activePosition && (
                            <PositionCard
                                positionId={activePosition.id}
                                position={activePosition}
                                candidates={activePosition.candidates}
                                selectedCandidateIds={selectedVotes[activePosition.id]}
                                onVoteSelect={handleVoteSelect}
                            />
                        )}

                        <div className="flex gap-4 items-center justify-between pt-6 border-t border-slate-700/50 mt-auto shrink-0">
                            <button
                                onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                                disabled={activeStep === 0}
                                className="px-6 py-3 bg-slate-700 hover:bg-slate-650 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all cursor-pointer"
                            >
                                Back
                            </button>

                            {activeStep < positionsWithCandidates.length - 1 ? (
                                <button
                                    onClick={() => setActiveStep(prev => Math.min(positionsWithCandidates.length - 1, prev + 1))}
                                    className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-xl transition-all cursor-pointer"
                                >
                                    Next Position
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowConfirmation(true)}
                                    disabled={!allPositionsVoted}
                                    className={`px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2 ${
                                        allPositionsVoted
                                            ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-xl cursor-pointer'
                                            : 'bg-slate-700 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Review & Submit Ballot
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <ConfirmationModal
                show={showConfirmation}
                selectedVotes={selectedVotes}
                positionsWithCandidates={positionsWithCandidates}
                error={error}
                submitting={submitting}
                onCancel={() => setShowConfirmation(false)}
                onConfirm={confirmVoteSubmission}
            />
        </>
    );
}