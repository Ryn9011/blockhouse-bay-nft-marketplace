// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyToken is ERC20, Ownable {
    address contractAddress;

    constructor(uint256 initialSupply, address contractAddr) ERC20("Property", "BHB") {  
        contractAddress = contractAddr;
        approve(contractAddress, 1000000);             
        _mint(msg.sender, initialSupply); 
    }

    function mint(address account, uint256 amount) public onlyOwner {
        _mint(account, amount);
    }

    function burn(address account, uint256 amount) public onlyOwner {
        _burn(account, amount);
    }

    function allowSender(uint amount) public { //security risk?
        approve(contractAddress, amount);       
    }
}