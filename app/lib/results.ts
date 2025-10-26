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
