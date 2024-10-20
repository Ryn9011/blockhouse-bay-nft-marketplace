import "hardhat/console.sol";

library RewardCalculator {
    function getTokenAmountToReceive(uint256 rent, uint256 currentSupply, uint256 initialSupply) public pure returns (uint256) {
        uint256 baseReward;
        if (rent >= 200) {
            baseReward = (rent * 15000) / 10000;
        } else if (rent >= 100) {
            baseReward = (rent * 8500) / 10000;
        } else if (rent >= 90) {
            baseReward = (rent * 8400) / 10000;
        } else if (rent >= 80) {
            baseReward = (rent * 8200) / 10000;
        } else if (rent >= 70) {
            baseReward = (rent * 8100) / 10000;
        } else if (rent >= 60) {
            baseReward = (rent * 8000) / 10000;
        } else if (rent >= 50) {
            baseReward = (rent * 7900) / 10000;
        } else if (rent >= 40) {
            baseReward = (rent * 7800) / 10000;
        } else if (rent >= 30) {
            baseReward = (rent * 7700) / 10000;
        } else if (rent >= 20) {
            baseReward = (rent * 7600) / 10000;
        } else if (rent >= 3) {
            baseReward = (rent * 7500) / 10000;
        } else {
            revert("Rent must be greater than or equal to 3");
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
