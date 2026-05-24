// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract YesNoVoting {
    uint256 private yesVotes;
    uint256 private noVotes;

    mapping(address voter => bool voted) private votedByAddress;

    event Voted(address indexed voter, bool support);

    function vote(bool support) external {
        require(!votedByAddress[msg.sender], "You have already voted");

        votedByAddress[msg.sender] = true;

        if (support) {
            yesVotes += 1;
        } else {
            noVotes += 1;
        }

        emit Voted(msg.sender, support);
    }

    function getResults() external view returns (uint256 yes, uint256 no) {
        return (yesVotes, noVotes);
    }

    function hasAddressVoted(address voter) external view returns (bool) {
        return votedByAddress[voter];
    }
}
