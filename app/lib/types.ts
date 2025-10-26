export interface Position {
    id: number;
    title: string;
    description: string;
};

export interface Candidate {
    id: number;
    name: string;
    _class: string;
    photo: string;
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


export type UserRole = "voter" | "admin";
