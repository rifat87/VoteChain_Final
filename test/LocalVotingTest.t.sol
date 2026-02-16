// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import "../src/LocalVoting.sol";

contract LocalVotingTest is Test {
    LocalVoting voting;
    address electionCommission;
    address voter1 = vm.addr(1);
    address outsider = vm.addr(2);

    // Sample data
    string candidateNID1 = "C12345";
    string voterNID1 = "V12345";

    function setUp() public {
        electionCommission = address(this);
        voting = new LocalVoting();
    }

    /* ----------------------------------
       1️⃣ Candidate Registration Tests
    ---------------------------------- */

    function test_RegisterCandidate_Success() public {
        voting.registerCandidate("Alice", candidateNID1, "Dhaka", 45, "FutureParty");

        LocalVoting.Candidate memory c = voting.getCandidate(candidateNID1);
        assertEq(c.name, "Alice");
        assertEq(c.age, 45);
        assertEq(c.voteCount, 0);
    }

    function test_RevertWhen_RegisteringDuplicateCandidate() public {
        voting.registerCandidate("Alice", candidateNID1, "Dhaka", 45, "FutureParty");
        vm.expectRevert(bytes("Candidate NID already registered"));
        voting.registerCandidate("Bob", candidateNID1, "Dhaka", 50, "HopeParty");
    }

    /* ----------------------------------
       2️⃣ Voter Registration Tests
    ---------------------------------- */

    function test_RegisterVoter_Success() public {
        voting.registerVoter("John", voterNID1, "Chittagong", "1990-10-10");

        LocalVoting.Voter memory v = voting.getVoter(voterNID1);
        assertEq(v.name, "John");
        assertEq(v.location, "Chittagong");
    }

    function test_RevertWhen_RegisteringDuplicateVoter() public {
        voting.registerVoter("John", voterNID1, "Dhaka", "1990-10-10");
        vm.expectRevert(bytes("Voter NID already registered"));
        voting.registerVoter("Jane", voterNID1, "Dhaka", "1995-02-12");
    }

    /* ----------------------------------
       3️⃣ Voting Process Tests
    ---------------------------------- */

    function test_CastVote_Success() public {
        voting.registerCandidate("Alice", candidateNID1, "Dhaka", 45, "FutureParty");
        voting.registerVoter("John", voterNID1, "Dhaka", "1990-10-10");

        voting.castVote(candidateNID1, voterNID1);
        LocalVoting.Candidate memory c = voting.getCandidate(candidateNID1);
        assertEq(c.voteCount, 1);
    }

    function test_RevertWhen_VoterVotesTwice() public {
        voting.registerCandidate("Alice", candidateNID1, "Dhaka", 45, "FutureParty");
        voting.registerVoter("John", voterNID1, "Dhaka", "1990-10-10");

        voting.castVote(candidateNID1, voterNID1);

        vm.expectRevert(bytes("You have already voted"));
        voting.castVote(candidateNID1, voterNID1);
    }

    function test_RevertWhen_InvalidCandidate() public {
        voting.registerVoter("John", voterNID1, "Dhaka", "1990-10-10");
        vm.expectRevert(bytes("Invalid candidate"));
        voting.castVote("FakeCandidate", voterNID1);
    }

    function test_RevertWhen_UnregisteredVoter() public {
        voting.registerCandidate("Alice", candidateNID1, "Dhaka", 45, "FutureParty");
        vm.expectRevert(bytes("Unrecognised voter NID"));
        voting.castVote(candidateNID1, voterNID1);
    }

    /* ----------------------------------
       4️⃣ End Election Tests
    ---------------------------------- */

    function test_EndElection_Success() public {
        assertEq(voting.electionEnded(), false);
        voting.endElection();
        assertEq(voting.electionEnded(), true);
    }

    function test_RevertWhen_NonCommissionEndsElection() public {
        vm.prank(outsider);
        vm.expectRevert(bytes("Only Election Commission can call this function"));
        voting.endElection();
    }

    /* ----------------------------------
       5️⃣ Gas Report Test
    ---------------------------------- */

    function test_GasReport() public {
        voting.registerCandidate("Alice", candidateNID1, "Dhaka", 45, "FutureParty");
        voting.registerVoter("John", voterNID1, "Dhaka", "1990-10-10");
        voting.castVote(candidateNID1, voterNID1);
    }
}
