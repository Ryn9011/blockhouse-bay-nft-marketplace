// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library RewardCalculator {
    function getTokenAmountToReceive(
        uint256 rent
    ) public pure returns (uint256) {
        if (rent >= 5 && rent < 20) {
            return ((rent * uint256(7500)) / uint256(10000));
        }
        if (rent >= 20 && rent < 30) {
            return ((rent * 7600) / 10000);
        }
        if (rent >= 30 && rent < 40) {
            return ((rent * 7700) / 10000);
        }
        if (rent >= 40 && rent < 50) {
            return ((rent * 7800) / 10000);
        }
        if (rent >= 50 && rent < 60) {
            return ((rent * 7900) / 10000);
        }
        if (rent >= 60 && rent < 70) {
            return ((rent * 8000) / 10000);
        }
        if (rent >= 70 && rent < 80) {
            return ((rent * 8100) / 10000);
        }
        if (rent >= 80 && rent < 90) {
            return ((rent * 8200) / 10000);
        }
        if (rent >= 90 && rent < 100) {
            return ((rent * 8400) / 10000);
        }
        if (rent > 100) {
            return ((rent * 8500) / 10000);
        }
        return 0;
    }
}