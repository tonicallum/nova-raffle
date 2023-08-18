// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

enum STATUS {
    NORMAL,
    CANCELLED,
    DRAWNIG,
    DRAWED,
    CLAIMED
}

enum CLAIM_TYPE {
    CREATOR,
    WINNER
}

struct RaffleStruct {
    address nftAddress;
    uint32 nftId;
    uint32 expirationTime;
    uint16 totalSupply;
    uint16 currentSupply;
    address creator;
    uint32 price; // max 100000000(*1e12), max = 100e
    uint16 randomIndex;
    bool settled; // Whether creator earnings are settled
    STATUS status;
    address holder_1; // Holders of NFT collections, maximum 3
    address holder_2;
    address holder_3;
}

struct Config {
    uint64 subId;
    uint64 raffleIndex;
    uint32 vrfGasLimit;
    uint16 vrfConfirms;
    uint16 maxSupply;
    uint32 maxDuration; // maximum duration seconds of raffle
    address platformFeeReceiver; // wallet to receive platform fee
    uint32 platformFee; // 2%, divide 10000
    bytes32 keyHash; // VRF keyhash
}

struct EntriesBought {
    address owner;
    uint16 currentIndex; // Current bought position
    uint16 entryNum; // number of entries
    uint32 ticketId; // index of entriesMap
}

struct ClaimData {
    uint256 linkFee;
    uint32 platformFeeOff;
    bytes signature;
}
