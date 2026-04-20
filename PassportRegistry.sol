// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PassportRegistry {

    struct Passport {
        string  ipfsCID;       // off-chain document pointer
        bytes32 metadataHash;  // sha256 of the JSON for tamper-proof verify
        address issuer;
        uint256 timestamp;
        bool    exists;
    }

    // productId => Passport
    mapping(string => Passport) private passports;

    event PassportIssued(
        string indexed productId,
        string ipfsCID,
        bytes32 metadataHash,
        address indexed issuer,
        uint256 timestamp
    );

    // Single register
    function registerPassport(
        string calldata productId,
        string calldata ipfsCID,
        bytes32 metadataHash
    ) external {
        require(!passports[productId].exists, "Passport already exists");
        passports[productId] = Passport({
            ipfsCID:      ipfsCID,
            metadataHash: metadataHash,
            issuer:       msg.sender,
            timestamp:    block.timestamp,
            exists:       true
        });
        emit PassportIssued(productId, ipfsCID, metadataHash, msg.sender, block.timestamp);
    }

    // Batch register (gas efficient for SMEs uploading product ranges)
    function batchRegisterPassports(
        string[]   calldata productIds,
        string[]   calldata ipfsCIDs,
        bytes32[]  calldata metadataHashes
    ) external {
        require(
            productIds.length == ipfsCIDs.length &&
            ipfsCIDs.length == metadataHashes.length,
            "Array length mismatch"
        );
        for (uint256 i = 0; i < productIds.length; i++) {
            if (!passports[productIds[i]].exists) {
                passports[productIds[i]] = Passport({
                    ipfsCID:      ipfsCIDs[i],
                    metadataHash: metadataHashes[i],
                    issuer:       msg.sender,
                    timestamp:    block.timestamp,
                    exists:       true
                });
                emit PassportIssued(productIds[i], ipfsCIDs[i], metadataHashes[i], msg.sender, block.timestamp);
            }
        }
    }

    // Public read — anyone can verify a product
    function getPassport(string calldata productId)
        external view
        returns (string memory ipfsCID, bytes32 metadataHash, address issuer, uint256 timestamp)
    {
        Passport storage p = passports[productId];
        require(p.exists, "Passport not found");
        return (p.ipfsCID, p.metadataHash, p.issuer, p.timestamp);
    }

    function passportExists(string calldata productId) external view returns (bool) {
        return passports[productId].exists;
    }
}