const { ethers } = require("hardhat");
const fs = require('fs');

const hre = require("hardhat");

async function main() {
  const PropertyMarket = await hre.ethers.getContractFactory("PropertyMarket");
  const propertyMarket = await PropertyMarket.deploy();
  await propertyMarket.deployed();
  console.log("propertyMarket deployed to:", propertyMarket.address);  

  fs.writeFileSync('./config.js', `
  export const marketplaceaddress = "${propertyMarket.address}"
  `)

  const NFT = await hre.ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(propertyMarket.address);
  await nft.deployed();
  console.log("nft deployed to:", nft.address);

  fs.writeFileSync('./config.js', `
  export const nftaddress = "${nft.address}"
  `)

  await propertyMarket.deployTokenContract()   
  const tokenContractAddress = await propertyMarket.getTokenContractAddress()
  const propertyTokenContract = await ethers.getContractAt('PropertyToken', tokenContractAddress)  
  console.log("token deployed to:", propertyTokenContract.address);
  console.log(await propertyTokenContract.balanceOf(propertyMarket.address))

  fs.writeFileSync('./config.js', `
  export const propertytokenaddress = "${propertyTokenContract.address}"
  `)
 
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
