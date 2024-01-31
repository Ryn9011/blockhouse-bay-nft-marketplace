const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const deployingAddress = "0xa2Fe6EB40BE5768d929c0ef13dF6936522348067";
  const deployingSigner = (await ethers.getSigners())[0]; // Access the first signer

  console.log("Deploying signer:", deployingSigner.address);

  const RewardCalculator = await ethers.getContractFactory("RewardCalculator");
  const rewardCalculator = await RewardCalculator.deploy();
  await rewardCalculator.deployed();
  console.log("Reward calculator deployed to:", rewardCalculator.address);

  const PropertyMarket = await ethers.getContractFactory("PropertyMarket");
  const propertyMarket = await PropertyMarket.deploy();
  await propertyMarket.deployed();
  console.log("PropertyMarket deployed to:", propertyMarket.address);

  // Send test Ether to the deployed contract
  const tx = await deployingSigner.sendTransaction({
    to: propertyMarket.address,
    value: ethers.utils.parseEther("0.1"), // Replace with the desired amount of test Ether
  });
  await tx.wait();

  const GovtFunctions = await ethers.getContractFactory("GovtFunctions", {
    libraries: {
      RewardCalculator: rewardCalculator.address,
    },
  });
  const govtFunctions = await GovtFunctions.deploy(propertyMarket.address);
  await govtFunctions.deployed();
  console.log("GovtFunctions deployed to:", govtFunctions.address);

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(propertyMarket.address);
  await nft.deployed();
  console.log("NFT deployed to:", nft.address);

  const tx2 = await propertyMarket.deployTokenContract();
  console.log('whats this ', tx2)
  await tx2.wait();

  const tokenContractAddress = await propertyMarket.getTokenContractAddress();
  
  const propertyTokenContract = await ethers.getContractAt('PropertyToken', tokenContractAddress);

  console.log("Token deployed to:", propertyTokenContract.address);
  console.log("Balance of PropertyMarket:", (await propertyTokenContract.balanceOf(propertyMarket.address)).toString());

  const configData = `
    export const nftmarketaddress = "${propertyMarket.address}";
    export const govtaddress = "${govtFunctions.address}";
    export const nftaddress = "${nft.address}";
    export const propertytokenaddress = "${propertyTokenContract.address}";
  `;
  fs.writeFileSync('./src/config.js', configData);
}

// We recommend this pattern to be able to use async/await everywhere and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
