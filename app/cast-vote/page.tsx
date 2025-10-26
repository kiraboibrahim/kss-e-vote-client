'use client'
import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
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
        className={`relative p-6 rounded-xl border-2 transition-all duration-300 text-left ${isSelected
            ? 'border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20'
            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-700/50'
            }`}
    >
        {isSelected && (
            <div className="absolute top-4 right-4 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
                <Check size={20} className="text-black" />
            </div>
        )}
        <div className="flex items-start gap-4">
            <img src={candidate.photo} alt={candidate.name} className="w-16 h-16 rounded-full object-cover" />
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
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg">
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
    onCancel,
    onConfirm
}: {
    show: boolean;
    selectedVotes: { [positionId: number]: number };
    positionsWithCandidates: Position[];
    error: string | null;
    onCancel: () => void;
    onConfirm: () => void
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-2xl p-8 max-w-2xl w-full">
                <h3 className="text-2xl font-bold text-white mb-4">Confirm Your Votes</h3>
                <p className="text-gray-300 mb-6">
                    Please review your selections before submitting. Once submitted, votes cannot be changed.
                </p>

                <div className="bg-slate-700 rounded-xl p-4 mb-6 space-y-3">
                    {Object.entries(selectedVotes).map(([positionId, candidateId]) => {
                        const position = positionsWithCandidates.find(p => p.id === Number(positionId));
                        const candidate = position?.candidates.find(c => c.id === candidateId);
                        return (
                            <div key={positionId} className="flex justify-between items-center">
                                <span className="text-yellow-400 font-semibold">{position?.title}:</span>
                                <span className="text-white">{candidate?.name}</span>
                            </div>
                        );
                    })}
                </div>

                {error && (
                    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-4">
                        <p className="text-red-300 font-semibold">Error</p>
                        <p className="text-red-200 text-sm">{error}</p>
                    </div>
                )}

                <div className="flex gap-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-6 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-xl font-semibold transition-colors"
                    >
                        Review Again
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl font-semibold transition-colors"
                    >
                        Confirm & Submit
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

            <ConfirmationModal
                show={showConfirmation}
                selectedVotes={selectedVotes}
                positionsWithCandidates={positionsWithCandidates}
                error={error}
                onCancel={() => setShowConfirmation(false)}
                onConfirm={confirmVoteSubmission}
            />
        </>
    );
}