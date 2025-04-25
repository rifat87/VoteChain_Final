// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract Voting { 
    address public electionCommission; bool public electionEnded;
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    uint public candidateCount;
    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public registeredVoters;
    mapping(address => bool) public hasVoted;

    constructor() {
        electionCommission = msg.sender;
        electionEnded = false;
    }

    modifier onlyCommission() {
        require(msg.sender == electionCommission, "Only Election Commission can call this function");
        _;
    }

    function registerCandidate(string memory _name) public onlyCommission {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
    }

    function registerVoter(address _voter) public onlyCommission {
        registeredVoters[_voter] = true;
    }

    function castVote(uint _candidateId) public {
        require(registeredVoters[msg.sender], "You are not a registered voter");
        require(!hasVoted[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate");

        hasVoted[msg.sender] = true; // hasVoted = 
        candidates[_candidateId].voteCount++;
    }

    function endElection() public onlyCommission {
        electionEnded = true;
    }

    function getCandidate(uint _candidateId) public view returns (Candidate memory) {
        return candidates[_candidateId];
    }

}