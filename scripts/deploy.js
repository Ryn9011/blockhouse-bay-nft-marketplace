const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
  const deployingAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  //const deployingAddress = "0xa2Fe6EB40BE5768d929c0ef13dF6936522348067";
  const deployingSigner = (await ethers.getSigners())[0]; // Access the first signer

  console.log("Deploying signer:", deployingSigner);

  const RewardCalculator = await ethers.getContractFactory("RewardCalculator");
  const rewardCalculator = await RewardCalculator.deploy();
  await rewardCalculator.waitForDeployment();
  console.log("Reward calculator deployed to:", rewardCalculator.target);

  const PropertyMarket = await ethers.getContractFactory("PropertyMarket");
  const propertyMarket = await PropertyMarket.deploy();
  await propertyMarket.waitForDeployment();
  console.log("PropertyMarket deployed to:", propertyMarket.target);

  // Send test Ether to the deployed contract
  const tx = await deployingSigner.sendTransaction({
    to: propertyMarket.target,
    value: ethers.parseEther("0.1"), // Replace with the desired amount of test Ether
  });
  await tx.wait();  

  const GovtFunctions = await ethers.getContractFactory("GovtFunctions", {
    libraries: {
      RewardCalculator: rewardCalculator.target,
    },
  });
  const govtFunctions = await GovtFunctions.deploy(propertyMarket.target);
  await govtFunctions.waitForDeployment();
  console.log("GovtFunctions deployed to:", govtFunctions.target);

  await govtFunctions.setGovtAddress(deployingAddress);

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(propertyMarket.target);
  await nft.waitForDeployment();
  console.log("NFT deployed to:", nft.target);
  await nft.setDeployingAddress(deployingAddress);

  const tx2 = await propertyMarket.deployTokenContract();
  console.log('whats this ', tx2)
  await tx2.wait();

  const tokenContractAddress = await propertyMarket.getTokenContractAddress();
  
  const propertyTokenContract = await ethers.getContractAt('PropertyToken', tokenContractAddress);

  console.log("Token deployed to:", propertyTokenContract.target);
  console.log("Balance of PropertyMarket:", (await propertyTokenContract.balanceOf(propertyMarket.target)).toString());

  const configData = `
    export const nftmarketaddress = "${propertyMarket.target}";
    export const govtaddress = "${govtFunctions.target}";
    export const nftaddress = "${nft.target}";
    export const propertytokenaddress = "${propertyTokenContract.target}";
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
