'use client'
import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, CheckCircle, Loader2, X, ListTodo } from 'lucide-react';
import { castVote, fetchPositions } from '../lib/candidates';
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
    <div className="flex items-center justify-center min-h-[60vh]">
        <div className="bg-slate-800 rounded-2xl p-12 text-center max-w-2xl">
            <div className="flex justify-center mb-6">
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle size={60} className="text-white" />
                </div>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Vote Cast Successfully!</h2>
            <p className="text-gray-300 text-lg mb-6">
                Thank you for participating in the KSS student elections. Your vote has been recorded securely.
            </p>
            <div className="bg-blue-900/30 border border-blue-500/50 rounded-xl p-4 mb-6">
                <p className="text-blue-300 text-sm">
                    Results will be announced after voting closes.
                </p>
            </div>
        </div>
    </div>
);

const VotingHeader = ({
    votedCount,
    totalPositions
}: {
    votedCount: number;
    totalPositions: number
}) => (
    <div className="flex items-center justify-between">
        <div>
            <h2 className="text-3xl font-bold text-white mb-2">Cast Your Vote</h2>
            <p className="text-gray-400">Select one candidate for each position</p>
        </div>
        <div className="text-right">
            <p className="text-sm text-gray-400">Positions Voted</p>
            <p className="text-2xl font-bold text-yellow-400">
                {votedCount} / {totalPositions}
            </p>
        </div>
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
        className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer ${isSelected
            ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20 scale-[1.02]'
            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
            }`}
    >
        {isSelected && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-yellow-400 px-3 py-1 rounded-full text-black font-extrabold text-xs uppercase tracking-wider shadow-md">
                <Check size={14} className="stroke-[3]" />
                Selected
            </div>
        )}
        <div className="flex items-start gap-4">
            <img src={candidate.photo} alt={candidate.name} className="w-16 h-16 rounded-full object-cover border border-slate-600" />
            <div className="flex-1">
                <h4 className="text-xl font-bold text-white mb-1">{candidate.name}</h4>
                <p className="text-gray-400 text-sm mb-2">{candidate._class}</p>
                <p className="text-gray-300 italic text-sm">&quot;{candidate.slogan}&quot;</p>
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
        <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700/40">
            <div className="border-b border-slate-700 pb-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0 pr-4">
                    <h3 className="text-2xl font-bold text-yellow-400">{position.title}</h3>
                    <p className="text-gray-400 text-sm mt-1">{position.description}</p>
                    {required > 1 && (
                        <p className="text-blue-400 text-sm font-semibold mt-1">
                            Choose exactly {required} candidates (Selected: {currentSelectedCount}/{required})
                        </p>
                    )}
                </div>
                {isCompleted && (
                    <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 shrink-0 self-start sm:self-center">
                        <Check size={16} className="stroke-[3]" />
                        <span className="text-xs font-bold uppercase tracking-wider">Voted</span>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

const WizardNavigationTabs = ({
    positions,
    activeStep,
    selectedVotes,
    onStepSelect
}: {
    positions: Position[];
    activeStep: number;
    selectedVotes: { [positionId: number]: number[] };
    onStepSelect: (index: number) => void;
}) => {
    useEffect(() => {
        const activeTab = document.getElementById(`nav-tab-${activeStep}`);
        if (activeTab) {
            activeTab.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [activeStep]);

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar scroll-smooth">
            {positions.map((position, index) => {
                const selections = selectedVotes[position.id] || [];
                const required = position.required_selections || 1;
                const isCompleted = selections.length === required;
                const isActive = index === activeStep;
                
                return (
                    <button
                        key={position.id}
                        id={`nav-tab-${index}`}
                        onClick={() => onStepSelect(index)}
                        className={`flex items-center gap-1.5 px-5 py-2.5 rounded-full text-sm font-bold border whitespace-nowrap transition-all duration-300 cursor-pointer shrink-0 ${
                            isActive
                                ? 'bg-yellow-400 border-yellow-400 text-black shadow-lg shadow-yellow-400/20 scale-[1.02]'
                                : isCompleted
                                    ? 'bg-slate-800/80 border-slate-700 text-green-400 hover:bg-slate-700/80 hover:text-green-400'
                                    : 'bg-slate-800/40 border-slate-700/50 text-gray-400 hover:text-white hover:bg-slate-850'
                        }`}
                    >
                        {isCompleted && <Check size={14} className="stroke-[3]" />}
                        <span>{position.title}</span>
                        {required > 1 && !isCompleted && (
                            <span className="text-xs bg-slate-750 text-gray-300 px-1.5 py-0.5 rounded-full ml-1 font-semibold">
                                {selections.length}/{required}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
};

const IncompleteWarning = ({ show }: { show: boolean }) => {
    if (!show) return null;

    return (
        <div className="bg-orange-900/30 border border-orange-500/50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-orange-400 mt-1" size={20} />
            <div>
                <p className="text-orange-300 font-semibold">Action Required</p>
                <p className="text-orange-200 text-sm">
                    Please vote for all positions before submitting your ballot.
                </p>
            </div>
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
                const positionsData = await fetchPositions();
                console.log(positionsData);
                setPositionsWithCandidates(positionsData.results);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load voting data');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

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
            <div className="space-y-6">
                <VotingHeader
                    votedCount={fullyVotedPositionsCount}
                    totalPositions={positionsWithCandidates.length}
                />

                {positionsWithCandidates.length > 0 && (
                    <>
                        <WizardNavigationTabs
                            positions={positionsWithCandidates}
                            activeStep={activeStep}
                            selectedVotes={selectedVotes}
                            onStepSelect={setActiveStep}
                        />

                        {activePosition && (
                            <PositionCard
                                positionId={activePosition.id}
                                position={activePosition}
                                candidates={activePosition.candidates}
                                selectedCandidateIds={selectedVotes[activePosition.id]}
                                onVoteSelect={handleVoteSelect}
                            />
                        )}

                        <div className="flex gap-4 items-center justify-between pt-6 border-t border-slate-700/50">
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
                    </>
                )}

                <IncompleteWarning show={!allPositionsVoted} />
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