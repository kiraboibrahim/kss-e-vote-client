type Voter = {
    id: number,
    voter_no: string,
    name: string,
    house: string,
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function storeVoter(voterDetails: any) {
    localStorage.setItem("voter", JSON.stringify(voterDetails));
}

export function getVoter(): Voter{

    const voterDetails = localStorage.getItem("voter");
    if (!voterDetails) throw new Error("Access token not found");

    return JSON.parse(voterDetails)?.voter as Voter
}

export function getAccessToken(): string {
    const voterDetails = localStorage.getItem("voter");
    
    if(!voterDetails) throw new Error("Access token not found");
    return JSON.parse(voterDetails)?.access;
}
