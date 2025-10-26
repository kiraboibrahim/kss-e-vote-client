import { PositionResults } from '@/app/lib/types';
import { getAccessToken } from './utils';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;


export async function fetchAllCandidates(): Promise<PositionResults> {
    const response = await fetch(`${API_BASE_URL}/candidates`);

    if (!response.ok) {
        throw new Error('Failed to fetch candidates');
    }

    const data = await response.json();

    return data;
}


/**
 * Fetches all available positions
 * @returns Promise with array of positions
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchPositions(): Promise<Array<any>> {
    const response = await fetch(`${API_BASE_URL}/positions`);

    if (!response.ok) {
        throw new Error('Failed to fetch positions');
    }

    const data = await response.json();

    return data;
}


/**
 * Fetches live voting results grouped by position
 * @returns Promise with results grouped by position
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function fetchGroupedResults(): Promise<{ results: any }> {
    const response = await fetch(`${API_BASE_URL}/results/live`);

    if (!response.ok) {
        throw new Error('Failed to fetch grouped results');
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || 'Failed to fetch grouped results');
    }

    return {
        results: data.data
    };
}

/**
 * Casts a vote for the student
 * @param studentId - The student's ID
 * @param votes - Object mapping position titles to candidate IDs
 * @returns Promise with vote submission result
 */
export async function castVote(votes: { [positionId: number]: number }): Promise<{ message: string; data: { votedAt: string; positionsVoted: number } }> {
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
