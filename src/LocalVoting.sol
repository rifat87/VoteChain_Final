// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract LocalVoting { 
    address public electionCommission;
    bool public electionEnded;

    struct Candidate {
        uint id;
        string name;
        string nationalId;
        string location;
        uint voteCount;
        bool isVerified;
    }

    // New Voter struct
    struct Voter {
        uint id;
        string name;
        string nationalId;
        string location;
        string faceHash;
        bool isVerified;
    }

    uint public candidateCount;
    uint public voterCount; // New counter for voters
    mapping(uint => Candidate) public candidates;
    mapping(uint => Voter) public voters; // New mapping for voters
    mapping(string => bool) public nationalIdExists;
    mapping(string => bool) public voterNationalIdExists; // New mapping for voter national IDs
    mapping(address => bool) public registeredVoters;
    // Track whether a given National ID has voted (prevents duplicate voting)
    mapping(string => bool) public hasVoted;
    // Changed to string mapping
    mapping(uint => string) public candidateFaceHashes;
    mapping(uint => string) public voterFaceHashes; // New mapping for voter face hashes

    // Events
    event CandidateRegistered(
        uint id,
        string nationalId,
        string name,
        string faceHash,
        uint256 timestamp
    );

    // New event for voter registration
    event VoterRegistered(
        uint id,
        string nationalId,
        string name,
        string faceHash,
        uint256 timestamp
    );

    event FaceHashUpdated(
        uint id,
        string nationalId,
        string oldHash,
        string newHash,
        uint256 timestamp
    );

    // New event for voter face hash update
    event VoterFaceHashUpdated(
        uint id,
        string nationalId,
        string oldHash,
        string newHash,
        uint256 timestamp
    );

    event VoteCast(string voterNID, uint candidateId, uint256 timestamp);

    constructor() {
        electionCommission = msg.sender;
        electionEnded = false;
    }

    modifier onlyCommission() {
        require(msg.sender == electionCommission, "Only Election Commission can call this function");
        _;
    }

    function registerCandidate(
        string memory _name,
        string memory _nationalId,
        string memory _location,
        string memory _faceHash
    ) public onlyCommission {
        require(!nationalIdExists[_nationalId], "National ID already registered");
        require(bytes(_faceHash).length > 0, "Invalid face hash");
        
        candidateCount++;
        candidates[candidateCount] = Candidate(
            candidateCount,
            _name,
            _nationalId,
            _location,
            0,
            false
        );
        nationalIdExists[_nationalId] = true;
        candidateFaceHashes[candidateCount] = _faceHash;

        emit CandidateRegistered(
            candidateCount,
            _nationalId,
            _name,
            _faceHash,
            block.timestamp
        );
    }

    // New voter registration function
    function registerVoter(
        string memory _name,
        string memory _nationalId,
        string memory _location,
        string memory _faceHash
    ) public onlyCommission {
        require(!voterNationalIdExists[_nationalId], "National ID already registered");
        require(bytes(_faceHash).length > 0, "Invalid face hash");
        
        voterCount++;
        voters[voterCount] = Voter(
            voterCount,
            _name,
            _nationalId,
            _location,
            _faceHash,
            false
        );
        voterNationalIdExists[_nationalId] = true;
        voterFaceHashes[voterCount] = _faceHash;

        emit VoterRegistered(
            voterCount,
            _nationalId,
            _name,
            _faceHash,
            block.timestamp
        );
    }

    function updateFaceHash(
        uint _candidateId,
        string memory _newFaceHash
    ) public onlyCommission {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        require(bytes(_newFaceHash).length > 0, "Invalid face hash");

        string memory oldHash = candidateFaceHashes[_candidateId];
        candidateFaceHashes[_candidateId] = _newFaceHash;

        emit FaceHashUpdated(
            _candidateId,
            candidates[_candidateId].nationalId,
            oldHash,
            _newFaceHash,
            block.timestamp
        );
    }

    // New face hash update function for voters
    function updateVoterFaceHash(
        uint _voterId,
        string memory _newFaceHash
    ) public onlyCommission {
        require(_voterId > 0 && _voterId <= voterCount, "Invalid voter");
        require(bytes(_newFaceHash).length > 0, "Invalid face hash");

        string memory oldHash = voterFaceHashes[_voterId];
        voterFaceHashes[_voterId] = _newFaceHash;

        emit VoterFaceHashUpdated(
            _voterId,
            voters[_voterId].nationalId,
            oldHash,
            _newFaceHash,
            block.timestamp
        );
    }

    function verifyFaceHash(
        uint _candidateId,
        string memory _providedHash
    ) public view returns (bool) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        return keccak256(bytes(candidateFaceHashes[_candidateId])) == keccak256(bytes(_providedHash));
    }

    // New face hash verification for voters
    function verifyVoterFaceHash(
        uint _voterId,
        string memory _providedHash
    ) public view returns (bool) {
        require(_voterId > 0 && _voterId <= voterCount, "Invalid voter");
        return keccak256(bytes(voterFaceHashes[_voterId])) == keccak256(bytes(_providedHash));
    }

    function getCandidateFaceHash(
        uint _candidateId
    ) public view returns (string memory) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        return candidateFaceHashes[_candidateId];
    }

    function verifyCandidate(uint _candidateId) public onlyCommission {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        candidates[_candidateId].isVerified = true;
    }

    // New voter verification
    function verifyVoter(uint _voterId) public onlyCommission {
        require(_voterId > 0 && _voterId <= voterCount, "Invalid voter");
        voters[_voterId].isVerified = true;
    }

    function registerVoterAddress(address _voter) public onlyCommission {
        registeredVoters[_voter] = true;
    }

    function castVote(uint _candidateId, string memory _voterNID) public {
        // require(registeredVoters[msg.sender], "You are not a registered voter");
        require(!hasVoted[_voterNID], "You have already voted");
        // require(voterNationalIdExists[_voterNID], "Unrecognised voter NID");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        // require(candidates[_candidateId].isVerified, "Candidate is not verified");

        hasVoted[_voterNID] = true;
        candidates[_candidateId].voteCount++;

        emit VoteCast(_voterNID, _candidateId, block.timestamp);
    }

    function endElection() public onlyCommission {
        electionEnded = true;
    }

    function getCandidate(uint _candidateId) public view returns (Candidate memory) {
        return candidates[_candidateId];
    }

    // Function to get all candidates
    function getCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory allCandidates = new Candidate[](candidateCount);
        for (uint i = 1; i <= candidateCount; i++) {
            allCandidates[i-1] = candidates[i];
        }
        return allCandidates;
    }

    // New get voter function
    function getVoter(uint _voterId) public view returns (Voter memory) {
        return voters[_voterId];
    }
}