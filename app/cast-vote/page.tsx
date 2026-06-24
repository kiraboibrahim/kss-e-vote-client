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
    selectedCandidateId,
    onVoteSelect
}: {
    positionId: number;
    position: Position;
    candidates: Candidate[];
    selectedCandidateId?: number;
    onVoteSelect: (positionId: number, candidateId: number) => void
}) => (
    <div id={`position-${positionId}`} className="bg-slate-800 rounded-xl p-6 shadow-lg scroll-mt-24">
        <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold text-yellow-400">{position.title}</h3>
                {selectedCandidateId && (
                    <div className="flex items-center gap-2 text-green-400">
                        <Check size={20} />
                        <span className="text-sm font-semibold">Voted</span>
                    </div>
                )}
            </div>
            <p className="text-gray-400">{position.description}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map(candidate => (
                <CandidateButton
                    key={candidate.id}
                    candidate={candidate}
                    isSelected={selectedCandidateId === candidate.id}
                    onSelect={() => onVoteSelect(positionId, candidate.id)}
                />
            ))}
        </div>
    </div>
);

const BallotNavigator = ({
    positions,
    selectedVotes,
    onNavigate
}: {
    positions: Position[];
    selectedVotes: { [positionId: number]: number };
    onNavigate: (positionId: number) => void;
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
            {/* Expanded List */}
            {isOpen && (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 shadow-2xl w-80 max-h-[70vh] flex flex-col overflow-hidden mb-3 animate-in slide-in-from-bottom-5 fade-in duration-200">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-3 mb-3">
                        <h4 className="font-bold text-white text-lg flex items-center gap-2">
                            <ListTodo className="w-5 h-5 text-yellow-400" />
                            Ballot Progress
                        </h4>
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="overflow-y-auto space-y-2 custom-scrollbar pr-1 flex-1">
                        {positions.map((position) => {
                            const selectedCandidateId = selectedVotes[position.id];
                            const selectedCandidate = position.candidates.find(c => c.id === selectedCandidateId);
                            
                            return (
                                <button
                                    key={position.id}
                                    onClick={() => {
                                        onNavigate(position.id);
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center justify-between text-left p-3 rounded-xl bg-slate-700/40 hover:bg-slate-700 border border-slate-700/50 hover:border-slate-600 transition-all group cursor-pointer"
                                >
                                    <div className="flex-1 min-w-0 pr-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-yellow-400/80 group-hover:text-yellow-400 transition-colors">
                                            {position.title}
                                        </p>
                                        <p className="text-sm font-bold text-white truncate">
                                            {selectedCandidate ? selectedCandidate.name : 'No selection'}
                                        </p>
                                    </div>
                                    <div>
                                        {selectedCandidate ? (
                                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                                                <Check className="w-3.5 h-3.5" />
                                            </span>
                                        ) : (
                                            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-5 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-black font-bold rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-yellow-500/30"
            >
                <ListTodo className="w-5 h-5" />
                <span>Progress ({Object.keys(selectedVotes).length}/{positions.length})</span>
            </button>
        </div>
    );
};

const SubmitButton = ({
    allPositionsVoted,
    submitting,
    onSubmit
}: {
    allPositionsVoted: boolean;
    submitting: boolean;
    onSubmit: () => void
}) => (
    <div className="flex justify-center pt-6">
        <button
            onClick={onSubmit}
            disabled={!allPositionsVoted || submitting}
            className={`px-12 py-4 rounded-xl text-lg font-bold transition-all duration-300 flex items-center gap-2 ${allPositionsVoted && !submitting
                ? 'bg-yellow-400 text-black hover:bg-yellow-500 shadow-lg hover:shadow-xl'
                : 'bg-slate-700 text-gray-500 cursor-not-allowed'
                }`}
        >
            {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {submitting ? 'Submitting...' : allPositionsVoted ? 'Submit All Votes' : 'Complete All Positions to Submit'}
        </button>
    </div>
);

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
    selectedVotes: { [positionId: number]: number };
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
                    {Object.entries(selectedVotes).map(([positionId, candidateId]) => {
                        const position = positionsWithCandidates.find(p => p.id === Number(positionId));
                        const candidate = position?.candidates.find(c => c.id === candidateId);
                        return (
                            <div key={positionId} className="flex items-center justify-between border-b border-slate-700/60 last:border-b-0 pb-3 last:pb-0">
                                <div>
                                    <p className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">{position?.title}</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        {candidate?.photo ? (
                                            <img 
                                                src={candidate.photo} 
                                                alt={candidate.name} 
                                                className="w-10 h-10 rounded-full object-cover border border-slate-500"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-slate-600 flex items-center justify-center text-white font-bold">
                                                {candidate?.name?.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-white font-bold text-base">{candidate?.name}</p>
                                            <p className="text-xs text-gray-400">{candidate?._class} {candidate?.stream ? `(${candidate.stream})` : ''}</p>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-green-400 bg-green-500/10 px-2.5 py-1 rounded-full border border-green-500/20">Selected</span>
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
function transformVotesToBackendFormat(votes: { [positionId: number]: number }) {
    return {
        votes: Object.entries(votes).map(([positionId, candidateId]) => ({
            post: Number(positionId),
            candidate: candidateId
        }))
    };
}

// Main Component
export default function CastVotePage() {
    const [positionsWithCandidates, setPositionsWithCandidates] = useState<Position[]>([]);
    const [selectedVotes, setSelectedVotes] = useState<{ [positionId: number]: number }>({});
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [votingComplete, setVotingComplete] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

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
        setSelectedVotes(prev => ({
            ...prev,
            [positionId]: candidateId
        }));
    };

    const allPositionsVoted = positionsWithCandidates.every(
        position => selectedVotes[position.id] !== undefined
    );

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

    const handleNavigate = (positionId: number) => {
        const element = document.getElementById(`position-${positionId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    if (votingComplete) return <SuccessState />;
    if (loading) return <LoadingState />;
    if (error) return <ErrorState error={error} />;

    return (
        <>
            <div className="space-y-8">
                <VotingHeader
                    votedCount={Object.keys(selectedVotes).length}
                    totalPositions={positionsWithCandidates.length}
                />

                {positionsWithCandidates.map((positionData) => (
                    <PositionCard
                        key={positionData.id}
                        positionId={positionData.id}
                        position={positionData}
                        candidates={positionData.candidates}
                        selectedCandidateId={selectedVotes[positionData.id]}
                        onVoteSelect={handleVoteSelect}
                    />
                ))}

                <SubmitButton
                    allPositionsVoted={allPositionsVoted}
                    submitting={submitting}
                    onSubmit={() => setShowConfirmation(true)}
                />

                <IncompleteWarning show={!allPositionsVoted} />
            </div>

            <BallotNavigator
                positions={positionsWithCandidates}
                selectedVotes={selectedVotes}
                onNavigate={handleNavigate}
            />

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