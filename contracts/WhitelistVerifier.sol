// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract WhitelistVerifier {
    bytes32 public merkleRoot;

    constructor(bytes32 _merkleRoot) {
        merkleRoot = _merkleRoot;
    }

    function verifyInWhitelist(
        bytes32[] calldata proof,
        uint256 tokenAmount
    ) public view returns (bool result) {
        bytes32 leaf = keccak256(abi.encode(msg.sender, tokenAmount));
        result = MerkleProof.verify(proof, merkleRoot, leaf);
    }
}
