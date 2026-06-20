import { PositionResults, CandidateResults, Election } from '@/app/lib/types';
import { getAccessToken } from './utils';
import { LiveVotingResults } from './results';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export async function fetchAllCandidates(electionId?: number): Promise<CandidateResults> {
    const url = electionId
        ? `${API_BASE_URL}/candidates/?election_id=${electionId}`
        : `${API_BASE_URL}/candidates`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch candidates');
    }

    const data = await response.json();

    return data;
}


/**
 * Fetches all available positions
 * @param electionId - Optional ID of the election to fetch positions for
 * @returns Promise with array of positions
 */
export async function fetchPositions(electionId?: number): Promise<PositionResults> {
    const url = electionId
        ? `${API_BASE_URL}/positions/?election_id=${electionId}`
        : `${API_BASE_URL}/positions`;
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch positions');
    }

    const data = await response.json();

    return data;
}


/**
 * Fetches all elections
 */
export async function fetchElections(): Promise<Election[]> {
    const response = await fetch(`${API_BASE_URL}/elections/`);

    if (!response.ok) {
        throw new Error('Failed to fetch elections');
    }

    const data = await response.json();
    return data;
}


/**
 * Fetches live voting results grouped by position
 * @param electionId - Optional ID of the election to fetch results for
 * @returns Promise with results grouped by position
 */
export async function fetchLiveResults(electionId?: number): Promise<LiveVotingResults> {
    const url = electionId
        ? `${API_BASE_URL}/results/live/?election_id=${electionId}`
        : `${API_BASE_URL}/results/live`;
        
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error('Failed to fetch grouped results');
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch grouped results');
    }

    return data.data;
}

/**
 * Casts a vote for the student
 * @param votes - Object containing votes array for bulk submission
 * @returns Promise with vote submission result
 */
export async function castVote(votes: { votes: { post: number; candidate: number }[] }): Promise<{ message: string; data: { votedAt: string; positionsVoted: number } }> {
    const response = await fetch(`${API_BASE_URL}/vote/cast/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAccessToken()}`
        },
        body: JSON.stringify(votes),
    });
    console.log(votes);
    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to cast vote');
    }

    return {
        message: data.message,
        data: data.data
    };
}
