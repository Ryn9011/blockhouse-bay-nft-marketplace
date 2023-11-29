// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyToken is ERC20, Ownable {
    address contractAddress;
    bool hasBeenMinted = false;

    constructor(uint256 initialSupply, address contractAddr) ERC20("Property", "BHB") {
        contractAddress = contractAddr;
        //approve(contractAddress, 1000000);
        _mint(msg.sender, initialSupply);
        hasBeenMinted = true;
    }

    function mint(address account, uint256 amount) public onlyOwner {
        if (!hasBeenMinted) _mint(account, amount);
    }

    function allowSender(uint256 amount) public {
        approve(contractAddress, amount);
    }
}
