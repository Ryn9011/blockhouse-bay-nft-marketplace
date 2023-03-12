// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "hardhat/console.sol";

contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    address contractAddress;

    constructor(address marketplaceAddress) ERC721("Metaverse", "BRB") {
        contractAddress = marketplaceAddress;
    }

    function createToken(string memory tokenURI) public returns (uint) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
      
        _mint(msg.sender, newItemId);     
        _setTokenURI(newItemId, tokenURI);
        setApprovalForAll(contractAddress, true);
        return newItemId;
    }

    function createTokens(string[] memory tokenURIs) public returns (uint[] memory) {
        uint[] memory tokenIds = new uint[](tokenURIs.length);
        for (uint i = 0; i < tokenURIs.length; i++) {
            tokenIds[i] = createToken(tokenURIs[i]);
        }
        return tokenIds;
    }


    function giveResaleApproval(uint256 tokenId) public { 
         require( ownerOf(tokenId) == msg.sender, "You must own this NFT in order to resell it" ); 
         setApprovalForAll(contractAddress, true); return; 
    }
}