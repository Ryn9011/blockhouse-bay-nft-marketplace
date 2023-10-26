// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "hardhat/console.sol";

contract NFT is ERC721URIStorage, IERC721Receiver {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    Counters.Counter private _exclusiveIds;
    address contractAddress;

    bytes4 constant private ERC721_RECEIVED = bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));

    constructor(address marketplaceAddress) ERC721("BlockhouseBay", "BHB") {
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

    // function createTokens(string[] memory tokenURIs) public returns (uint[] memory) {
    //     uint[] memory tokenIds = new uint[](tokenURIs.length);
    //     for (uint i = 0; i < tokenURIs.length; i++) {
    //         tokenIds[i] = createToken(tokenURIs[i]);
    //     }
    //     return tokenIds;
    // }

    function createTokens(string[] memory tokenURIs) public returns (uint[] memory) {
        uint[] memory tokenIds = new uint[](tokenURIs.length);
        uint256 newItemId;
        for (uint i = 0; i < tokenURIs.length; i++) {
            _tokenIds.increment();
            newItemId = _tokenIds.current();
            _safeMint(msg.sender, newItemId); // Mint to the contract address
            _setTokenURI(newItemId, tokenURIs[i]);
            tokenIds[i] = newItemId;
            //transferTokens(tokenIds[i]);
        }
        setApprovalForAll(contractAddress, true); // Approve the marketplace contract to transfer the tokens        
        return tokenIds;
    }

    function createExclusiveTokens(string[] memory tokenURIs) public returns (uint[] memory) {
        uint[] memory tokenIds = new uint[](tokenURIs.length);
        uint256 newItemId = 500;     
        for (uint i = 0; i < tokenURIs.length; i++) {
            //_exclusiveIds.increment();
            newItemId++;          
            _safeMint(msg.sender, newItemId); // Mint to the contract address
            _setTokenURI(newItemId, tokenURIs[i]);
            tokenIds[i] = newItemId;
            //transferTokens(tokenIds[i]);
        }
        setApprovalForAll(contractAddress, true); // Approve the marketplace contract to transfer the tokens        
        return tokenIds;
    }

    function transferTokens(uint tokenId) public {
        safeTransferFrom(address(this), msg.sender, tokenId); // Transfer the tokens to the buyer        
    }

    // function transferTokens(uint[] memory tokenIds) public {
    //     for (uint i = 0; i < tokenIds.length; i++) {
    //         safeTransferFrom(address(this), msg.sender, tokenIds[i]); // Transfer the tokens to the buyer
    //     }
    // }

    function giveResaleApproval(uint256 tokenId) public { 
         require( ownerOf(tokenId) == msg.sender, "You must own this NFT in order to resell it" ); 
         setApprovalForAll(contractAddress, true); return; 
    }

    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        // Handle the received token here
        return ERC721_RECEIVED;
    }
}