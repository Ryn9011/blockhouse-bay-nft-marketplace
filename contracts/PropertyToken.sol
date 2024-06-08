// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PropertyToken is ERC20, Ownable {
    address contractAddress; //propertyMarket
    bool hasBeenMinted = false;
    address _devFund;
    address public constant BURN_ADDRESS = address(0);

    uint256 public constant FEE_PERCENTAGE = 100; // Represents 1% (1% = 100 basis points)
    uint256 public constant BASIS_POINTS = 10000; // Represents 100%

    event Burn(address indexed burner, uint256 value);
    event FeeTaken(address indexed from, address indexed to, uint256 value);

    constructor(uint256 initialSupply, address contractAddr, address devFund) ERC20("Blockhouse Bay", "BHB") {
        contractAddress = contractAddr;
        _devFund = devFund;
        _mint(msg.sender, initialSupply);
        hasBeenMinted = true;
    }

    function mint(address account, uint256 amount) public onlyOwner {
        if (!hasBeenMinted) _mint(account, amount);
    }

    function allowSender(uint256 amount) public {
        approve(contractAddress, amount);
    }

    function _transfer(address sender, address recipient, uint256 amount) internal override {
        uint256 fee = (amount * FEE_PERCENTAGE) / BASIS_POINTS;
        uint256 burnAmount = fee / 2;
        uint256 developmentFundAmount = fee - burnAmount; // Ensure any rounding issue goes to the development fund
        uint256 amountAfterFee = amount - fee;

        require(amount == amountAfterFee + fee, "BHBToken: Fee calculation error");
        
        // Call the original _transfer function to transfer the net amount
        super._transfer(sender, recipient, amountAfterFee);
        if (fee > 0) {
            // Transfer the fee to the development fund
            super._transfer(sender, _devFund, developmentFundAmount);
            // Burn the fee
            _burn(sender, burnAmount);
            emit FeeTaken(sender, _devFund, developmentFundAmount);
            emit Burn(sender, burnAmount);
        }
    }

}
