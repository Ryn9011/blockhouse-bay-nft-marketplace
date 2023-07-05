const { ethers } = require("hardhat");
const fs = require('fs');

const hre = require("hardhat");

async function main() {

  const RewardCalculator = await hre.ethers.getContractFactory("RewardCalculator");
  const rewardCalculator = await RewardCalculator.deploy();
  await rewardCalculator.deployed();
  console.log("reward calculator deployed to:", rewardCalculator.address); 
 
  const PropertyMarket = await hre.ethers.getContractFactory("PropertyMarket", {
    libraries: {
      RewardCalculator: rewardCalculator.address,
    },
  });
  const propertyMarket = await PropertyMarket.deploy();
  await propertyMarket.deployed();
  console.log("propertyMarket deployed to:", propertyMarket.address); 

  const GovtFunctions = await hre.ethers.getContractFactory("GovtFunctions");
  const govtFunctions = await GovtFunctions.deploy(propertyMarket.address);
  await govtFunctions.deployed();
  console.log("govtFunctions deployed to:", govtFunctions.address); 

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(propertyMarket.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

  await propertyMarket.deployTokenContract();   
  const tokenContractAddress = await propertyMarket.getTokenContractAddress();
  const propertyTokenContract = await ethers.getContractAt('PropertyToken', tokenContractAddress);  
  console.log("token deployed to:", propertyTokenContract.address);
  console.log(await propertyTokenContract.balanceOf(propertyMarket.address));

  const configData = `
    export const nftmarketaddress = "${propertyMarket.address}";
    export const govtaddress = "${govtFunctions.address}";
    export const nftaddress = "${nft.address}";
    export const propertytokenaddress = "${propertyTokenContract.address}";
  `;
  fs.writeFileSync('./src/config.js', configData);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
