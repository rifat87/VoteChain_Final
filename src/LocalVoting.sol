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

    uint public candidateCount;
    mapping(uint => Candidate) public candidates;
    mapping(string => bool) public nationalIdExists;
    mapping(address => bool) public registeredVoters;
    mapping(address => bool) public hasVoted;
    // Separate mapping for face hashes
    mapping(uint => bytes32) public candidateFaceHashes;

    // Events
    event CandidateRegistered(
        uint id,
        string nationalId,
        string name,
        bytes32 faceHash,
        uint256 timestamp
    );

    event FaceHashUpdated(
        uint id,
        string nationalId,
        bytes32 oldHash,
        bytes32 newHash,
        uint256 timestamp
    );

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
        bytes32 _faceHash
    ) public onlyCommission {
        require(!nationalIdExists[_nationalId], "National ID already registered");
        require(_faceHash != bytes32(0), "Invalid face hash");
        
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

    function updateFaceHash(
        uint _candidateId,
        bytes32 _newFaceHash
    ) public onlyCommission {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        require(_newFaceHash != bytes32(0), "Invalid face hash");

        bytes32 oldHash = candidateFaceHashes[_candidateId];
        candidateFaceHashes[_candidateId] = _newFaceHash;

        emit FaceHashUpdated(
            _candidateId,
            candidates[_candidateId].nationalId,
            oldHash,
            _newFaceHash,
            block.timestamp
        );
    }

    function verifyFaceHash(
        uint _candidateId,
        bytes32 _providedHash
    ) public view returns (bool) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        return candidateFaceHashes[_candidateId] == _providedHash;
    }

    function getCandidateFaceHash(
        uint _candidateId
    ) public view returns (bytes32) {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        return candidateFaceHashes[_candidateId];
    }

    function verifyCandidate(uint _candidateId) public onlyCommission {
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        candidates[_candidateId].isVerified = true;
    }

    function registerVoter(address _voter) public onlyCommission {
        registeredVoters[_voter] = true;
    }

    function castVote(uint _candidateId) public {
        require(registeredVoters[msg.sender], "You are not a registered voter");
        require(!hasVoted[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");
        require(candidates[_candidateId].isVerified, "Candidate is not verified");

        hasVoted[msg.sender] = true;
        candidates[_candidateId].voteCount++;
    }

    function endElection() public onlyCommission {
        electionEnded = true;
    }

    function getCandidate(uint _candidateId) public view returns (Candidate memory) {
        return candidates[_candidateId];
    }
}