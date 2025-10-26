export interface Position {
    id: number;
    title: string;
    description: string;
    total_votes: number;
    candidates: Array<Candidate>;
};

export interface Candidate {
    id: number;
    name: string;
    _class: string;
    photo: string;
    post_title: string;
    stream: string;
    slogan: string;
};

export interface PositionWithCandidates {
    id: number;
    title: string;
    description: string;
    candidate_count: number;
    candidates: Candidate[];
};

export interface LiveResult {
    candidate: Candidate;
    votes: number;
    percentage: number;
};

export interface PositionResults {
    results: Array<PositionWithCandidates>
}

export interface CandidateResults {
    results: Array<Candidate>
}

export type UserRole = "voter" | "admin";
