// SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "hardhat/console.sol";

library RewardCalculator {
    function getTokenAmountToReceive(uint256 rent, uint256 currentSupply, uint256 initialSupply) public pure returns (uint256) {
        uint256 baseReward;
        if (rent >= 200) {
            baseReward = (rent * 15000) / 100000;
        } else if (rent >= 100) {
            baseReward = (rent * 8500) / 100000;
        } else if (rent >= 90) {
            baseReward = (rent * 8400) / 100000;
        } else if (rent >= 80) {
            baseReward = (rent * 8200) / 100000;
        } else if (rent >= 70) {
            baseReward = (rent * 8100) / 100000;
        } else if (rent >= 60) {
            baseReward = (rent * 8000) / 100000;
        } else if (rent >= 50) {
            baseReward = (rent * 7900) / 100000;
        } else if (rent >= 40) {
            baseReward = (rent * 7800) / 100000;
        } else if (rent >= 30) {
            baseReward = (rent * 7700) / 100000;
        } else if (rent >= 20) {
            baseReward = (rent * 7600) / 100000;
        } else if (rent >= 3) {
            baseReward = (rent * 7500) / 100000;
        } else {
            //revert("Rent must be greater than or equal to 3");
            baseReward = 5;
        }

        // Debugging information
        // console.log("Base Reward: ", baseReward);
        // console.log("Current Supply: ", currentSupply);
        // console.log("Initial Supply: ", initialSupply);

        uint256 adjustedReward = (baseReward * currentSupply) / initialSupply;

        // Debugging information
      //  console.log("RENT: ", rent);
        console.log("REWARD: ", (adjustedReward * 100) / (10 ** 18));
        console.log('REMAINING SUPPLY: ', currentSupply / (10 ** 18));
 
        return adjustedReward * 100;
    }
}
