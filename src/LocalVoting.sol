// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract LocalVoting { 
    address public electionCommission;
    bool public electionEnded;

    struct Candidate {
        string nationalId;   // Unique identifier
        string name;
        string location;
        uint age;
        string party;
        uint voteCount;
    }

    struct Voter {
        string nationalId;   // Unique identifier
        string name;
        string location;
        string birthDate;    // Stored as string (YYYY-MM-DD)
    }

    // Storage
    mapping(string => Candidate) public candidates;   // candidateNID => Candidate
    mapping(string => Voter) public voters;           // voterNID => Voter
    string[] public candidateIds;                     // to retrieve all candidates
    string[] public voterIds;                         // to retrieve all voters

    mapping(string => bool) public nationalIdExists;       // for candidates
    mapping(string => bool) public voterNationalIdExists;  // for voters
    mapping(string => bool) public hasVoted;               // track voter NIDs

    // Events
    event CandidateRegistered(
        string nationalId,
        string name,
        string party,
        uint age,
        uint256 timestamp
    );

    event VoterRegistered(
        string nationalId,
        string name,
        string birthDate,
        uint256 timestamp
    );

    event VoteCast(string voterNID, string candidateNID, uint256 timestamp);

    constructor() {
        electionCommission = msg.sender;
        electionEnded = false;
    }

    modifier onlyCommission() {
        require(msg.sender == electionCommission, "Only Election Commission can call this function");
        _;
    }

    // Candidate registration
    function registerCandidate(
        string memory _name,
        string memory _nationalId,
        string memory _location,
        uint _age,
        string memory _party
    ) public onlyCommission {
        require(!nationalIdExists[_nationalId], "Candidate NID already registered");

        Candidate memory c = Candidate({
            nationalId: _nationalId,
            name: _name,
            location: _location,
            age: _age,
            party: _party,
            voteCount: 0
        });

        candidates[_nationalId] = c;
        nationalIdExists[_nationalId] = true;
        candidateIds.push(_nationalId);

        emit CandidateRegistered(_nationalId, _name, _party, _age, block.timestamp);
    }

    // Voter registration
    function registerVoter(
        string memory _name,
        string memory _nationalId,
        string memory _location,
        string memory _birthDate
    ) public onlyCommission {
        require(!voterNationalIdExists[_nationalId], "Voter NID already registered");

        Voter memory v = Voter({
            nationalId: _nationalId,
            name: _name,
            location: _location,
            birthDate: _birthDate
        });

        voters[_nationalId] = v;
        voterNationalIdExists[_nationalId] = true;
        voterIds.push(_nationalId);

        emit VoterRegistered(_nationalId, _name, _birthDate, block.timestamp);
    }

    // Cast vote
    function castVote(string memory _candidateNID, string memory _voterNID) public {
        require(!hasVoted[_voterNID], "You have already voted");
        require(voterNationalIdExists[_voterNID], "Unrecognised voter NID");
        require(nationalIdExists[_candidateNID], "Invalid candidate");

        hasVoted[_voterNID] = true;
        candidates[_candidateNID].voteCount++;

        emit VoteCast(_voterNID, _candidateNID, block.timestamp);
    }

    // End election
    function endElection() public onlyCommission {
        electionEnded = true;
    }

    // Get candidate by NID
    function getCandidate(string memory _candidateNID) public view returns (Candidate memory) {
        require(nationalIdExists[_candidateNID], "Candidate not found");
        return candidates[_candidateNID];
    }

    // Get all candidates
    function getCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateIds.length);
        for (uint i = 0; i < candidateIds.length; i++) {
            allCandidates[i] = candidates[candidateIds[i]];
        }
        return allCandidates;
    }

    // Get voter by NID
    function getVoter(string memory _voterNID) public view returns (Voter memory) {
        require(voterNationalIdExists[_voterNID], "Voter not found");
        return voters[_voterNID];
    }
}
