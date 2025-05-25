// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";

library RewardCalculator {
    function getTokenAmountToReceive(uint256 rent, uint256 currentSupply, uint256 initialSupply) public pure returns (uint256) {
        
        uint256 baseReward;
        if (rent >= 500 ether) {
            baseReward = (rent * 550) / 100000;
        } else if (rent >= 400 ether) {
            baseReward = (rent * 575) / 100000;
        } else if (rent >= 300 ether) {
            baseReward = (rent * 600) / 100000;
        } else if (rent >= 200 ether) {
            baseReward = (rent * 500) / 100000;
        } else if (rent >= 100 ether) {
            baseReward = (rent * 500) / 100000;
        } else if (rent >= 90 ether) {
            baseReward = (rent * 500) / 100000;
        } else if (rent >= 80 ether) {
            baseReward = (rent * 400) / 100000;
        } else if (rent >= 70 ether) {
            baseReward = (rent * 400) / 100000;
        } else if (rent >= 60 ether) {
            baseReward = (rent * 400) / 100000;
        } else if (rent >= 50 ether) {
            baseReward = (rent * 350) / 100000;
        } else if (rent >= 40 ether) {
            baseReward = (rent * 300) / 100000;
        } else if (rent >= 30 ether) {
            baseReward = (rent * 300) / 100000;
        } else if (rent >= 20 ether) {
            baseReward = (rent * 300) / 100000;
        } else if (rent >= 10 ether) {            
            baseReward = (rent * 300) / 100000;
        } else {
            baseReward = 5;
            //revert("Rent must be greater than or equal to 10 pol and not exceed 500 pol");            
        }

        // Debugging information
        // console.log("Base Reward: ", baseReward);
        // console.log("Current Supply: ", currentSupply);
        console.log("Initial Supply: ", initialSupply);

        uint256 adjustedReward = (baseReward * currentSupply) / initialSupply;

        // Debugging information
        console.log("RENT: ", rent);
        console.log("REWARD: ", (adjustedReward * 100) / (10 ** 18));
        // console.log('REMAINING SUPPLY: ', currentSupply / (10 ** 18));
 
        return adjustedReward * 100;


     
 
    }
}
