## WhitelistVerifier Smart Contract

This Hardhat project implements a Merkle tree to verify the presence of a value in the whitelist. The contract stores only the root of the Merkle tree, and users can prove their inclusion by providing a Merkle proof and a token amount.

### `WhitelistVerifier.sol`

The smart contract `WhitelistVerifier` implements the following functions:

- `constructor(bytes32 _root)`: initializes the Merkle tree with the given root hash.
- `verifyInWhitelist(bytes32[] memory _proof, address _address, uint256 _tokenAmount)`: verifies that `_address` with `_tokenAmount` is included in the Merkle tree using the provided `_proof`.

Note that the contract only stores the root of the Merkle tree, and the actual values are computed using the hash of the leaf node.

### Tests

The test file `check.js` tests the functionality of the contract. It performs the following steps:

1. Fetch a list of signers from Hardhat.
2. Create a list of nodes and encode them as byte strings using `ethers.utils.defaultAbiCoder.encode()`.
3. Use the `MerkleTree` class from `merkletreejs` to create a Merkle tree with the given nodes and hash function (`keccak256`).
4. Get the root of the Merkle tree using `getHexRoot()` function and deploy the `WhitelistVerifier` contract with it.
5. Call `verifyInWhitelist()` function for each address in the Merkle tree to ensure that the contract is able to verify the presence of the value using the provided Merkle proof.
6. If all the tests pass, the Merkle tree is working as expected.

### Installation

To use this project, first clone the repository:

```bash
git clone https://github.com/Akkii4/Merkle_Whitelist-Verify.git
```

Then install the required dependencies:

```bash
npm install
```

### Usage

To run the tests, use the following command:

```bash
npx hardhat test
```
