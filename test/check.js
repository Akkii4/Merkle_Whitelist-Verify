const { expect } = require("chai");
const keccak256 = require("keccak256");
const { MerkleTree } = require("merkletreejs");

let list;
let userAddresses;
let merkleTree;
let root;
const tokenAmount = ethers.utils.parseEther("5");

function encodeLeaf(address, tokenAmount) {
  // similar to `abi.encodePacked` of Solidity
  return ethers.utils.defaultAbiCoder.encode(
    ["address", "uint256"], // The datatypes of arguments to encode
    [address, tokenAmount] // The actual values
  );
}

function getLeaf(index) {
  return keccak256(list[index]); // The hash of the node
}

describe("Merkle Trees", function () {
  beforeEach(async () => {
    userAddresses = await ethers.getSigners();

    // Create an array of ABI-encoded elements to put in the Merkle Tree
    list = [
      encodeLeaf(userAddresses[0].address, tokenAmount),
      encodeLeaf(userAddresses[1].address, tokenAmount),
      encodeLeaf(userAddresses[2].address, tokenAmount),
      encodeLeaf(userAddresses[3].address, tokenAmount),
      encodeLeaf(userAddresses[4].address, tokenAmount),
    ];

    // Using keccak256(as solidity supports it) as the hashing algorithm, create a Merkle Tree
    // We can use keccak256 directly in smart contracts for verification
    // Make sure to sort the tree so it can be reproduced deterministically each time
    merkleTree = new MerkleTree(list, keccak256, {
      hashLeaves: true, // Hash each leaf using keccak256 to make them fixed-size
      sortPairs: true, // Sort the tree for determinstic output
      sortLeaves: true,
    });

    // Generate the Merkle Root in Hexadecimal
    root = merkleTree.getHexRoot();
  });

  it("Should be able to verify if address is in whitelist or not via a merkle verifier contract", async function () {
    // Deploy WhitelistVerifier Contract
    const whitelistVerifier = await ethers.getContractFactory(
      "WhitelistVerifier"
    );
    const WhitelistVerifier = await whitelistVerifier.deploy(root);
    await WhitelistVerifier.deployed();

    // Check for valid addresses
    for (let i = 0; i < 5; i++) {
      // Compute the Merkle Proof for `address`
      const proof = merkleTree.getHexProof(getLeaf(i)); // compute the Merkle Proof

      // Verify that the contract can verify the presence of this address
      // in the Merkle Tree using just the Root provided to it
      // By giving it the Merkle Proof and the original values
      // It calculates `address` using `msg.sender`, and we provide it the number of Tokens
      // that the user is eligible to get
      const verified = await WhitelistVerifier.connect(
        userAddresses[i]
      ).verifyInWhitelist(proof, tokenAmount);
      expect(verified).to.equal(true);
    }

    // Check for invalid addresses
    const invalid = await WhitelistVerifier.verifyInWhitelist([], tokenAmount);
    expect(invalid).to.equal(false);
  });

  it("Should be able to verify w/o contract offchain", async function () {
    // Check for valid addresses
    for (let i = 0; i < 5; i++) {
      const leaf = getLeaf(i);
      const proof = merkleTree.getProof(leaf);

      const verified = await merkleTree.verify(proof, leaf, root);
      expect(verified).to.equal(true);
    }

    // Check for invalid addresses
    const invalid = await merkleTree.verify([], getLeaf(0), root);
    expect(invalid).to.equal(false);
  });
});
