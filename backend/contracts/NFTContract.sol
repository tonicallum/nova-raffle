// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTContract is ERC721URIStorage, Ownable {
    constructor() ERC721("MyNFT", "NFT") {}

    uint tokenId;

    function mintNFT(string memory tokenURI) public {
        ++tokenId;
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }
}
