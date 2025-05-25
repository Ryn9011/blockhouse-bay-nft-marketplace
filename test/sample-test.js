
const { expect } = require("chai");
const { ethers } = require("hardhat");

const data = require('../src/final-manifest.json');
const dataEx = require('../src/exc-manifest.json');

const fs = require('fs');

// const { govtaddress } = require("../src/config");

describe("PropertyMarket", function () {
  this.timeout(120000);
  it("Should create and execute market sales", async function () {
  
  const deployingAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
  
  const deployingSigner = (await ethers.getSigners())[0]; // Access the first signer

  // console.log("Deploying signer:", deployingSigner);

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
  await tx2.wait();

  const tx3 = await propertyMarket.setNftContractAddress(nft.target);
  await tx3.wait();
  console.log("NFT contract address set in PropertyMarket");
  
    const tokenContractAddress = await propertyMarket.getTokenContractAddress();
    
    const propertyTokenContract = await ethers.getContractAt('PropertyToken', tokenContractAddress);
  
    console.log("Token deployed to:", propertyTokenContract.target);
    console.log("Balance of PropertyMarket:", (await propertyTokenContract.balanceOf(propertyMarket.target)).toString());


    let listingPrice = await propertyMarket.getListingPrice()
    //console.log("listing price: ", listingPrice)p
    listingPrice = listingPrice.toString()
    const defaultTokenPrice = 5
    const initialSalePrice = ethers.parseUnits('200', 'ether')
    const rentdeposit = ethers.parseUnits('3', 'ether')
    
    const defaultRentPrice = ethers.parseUnits('3', 'ether')

    const urisn = Object.keys(data.paths).map(uri => "https://arweave.net/" + data.paths[uri].id); 
  
    const batchSize = 50;
    const numBatches = Math.ceil(urisn.length / batchSize);
    const tokenIds = [];

    for (let i = 0; i < numBatches && i * batchSize < urisn.length; i++) {
      const batch = urisn.slice(i * batchSize, (i + 1) * batchSize);
      // const gasLimit = await contract.estimateGas.createTokens(batch);
      const transaction = await nft.createTokens(batch);
      const receipt = await transaction.wait();
      // console.log(receipt.logs)
      // console.log(receipt.logs[1].fragment.name)
      for (let j = 0; j < receipt.logs.length; j++) {
        if (receipt.logs[j].fragment?.name === "Transfer") {
          const tokenId = Number(receipt.logs[j].args[2]);
          tokenIds.push(tokenId);                  
        }
      }
    }

    const params = {
      gasLimit: 30000000
    }

      
    const numOfBatches = 25;
    for (let i = 0; i < numOfBatches && i * batchSize < tokenIds.length; i++) {
      const idsBatch = tokenIds.slice(i * batchSize, (i + 1) * batchSize);

      // let gasLimit = await contract.createPropertyListing.estimateGas(nftaddress, idsBatch);
      // gasLimit = gasLimit + 100000n;

      // // Fetch the current gas fee data
      // const feeData = await provider.getFeeData();
      // console.log("Current Fee Data:", feeData);

      // const basePriorityFee = feeData.maxPriorityFeePerGas || ethers.parseUnits('1.5', 'gwei'); // Fallback to 1.5 gwei if undefined
      // const maxPriorityFeePerGas = basePriorityFee + ethers.parseUnits('10', 'gwei'); // Add 2 gwei buffer
      // const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('20', 'gwei'); // Add 5 gwei buffer to maxFeePerGas


      // add gas limits here as well
      let transaction2 = await propertyMarket.createPropertyListing(idsBatch, {

      })
      await transaction2.wait()
    }    
  
    console.log('completed first batch of tokens')
    const urisn2 = Object.keys(dataEx.paths).map(uri => "https://arweave.net/" + dataEx.paths[uri].id);

    const tokenIds2 = [];
      const transaction = await nft.createExclusiveTokens(urisn2);
      const receipt = await transaction.wait(); 
      for (let j = 0; j < receipt.logs.length; j++) {
        if (receipt.logs[j].fragment?.name === "Transfer") {
          const tokenId = Number(receipt.logs[j].args[2]);
          tokenIds2.push(tokenId);
        }
      }

    let transaction2 = await propertyMarket.createPropertyListing(tokenIds2)    
    await transaction2.wait();



    //mint NFT Properties
    // await nft.createToken("https://www.mytokendlocation.com")

  

    // await propertyMarket.createPropertyListing(nft.target, arr)
    // await propertyMarket.createPropertyListing(nft.target, arr)
    
    // const balAfter1 = await propertyMarket.connect(deployingSigner).getContractBalance()    
    //console.log("balAfter1", balAfter1)

     
    
    var [_, buyerAddress] = await ethers.getSigners()
    var [_,_, renterAddress] = await ethers.getSigners()
    var [_,_,_, buyer2Address] = await ethers.getSigners()
    var [_,_,_,_, sellerAddress] = await ethers.getSigners()    
    var [_,_,_,_,_, renter2] = await ethers.getSigners()   
    var [_,_,_,_,_,_, renter3] = await ethers.getSigners()  
    var [_,_,_,_,_,_,_, renter4] = await ethers.getSigners()  
    var [_,_,_,_,_,_,_,_, renter5] = await ethers.getSigners()  


    var rentedPropetiesForSale;

    var salePrice = ethers.parseUnits("1", 'ether');
    var rentPrice = ethers.parseUnits("11", 'ether');
 
    await propertyMarket.connect(buyerAddress).createPropertySale(1, false, { value: 1000000000000000}) 
    await propertyMarket.connect(buyerAddress).createPropertySale(2, false, { value: 1000000000000000}) 
    await propertyMarket.connect(buyerAddress).createPropertySale(3, false, { value: 1000000000000000}) 


    rentedPropetiesForSale = await govtFunctions.connect(renterAddress).getRentedProperties();
    console.log("rentedPropetiesForSale expect ?", rentedPropetiesForSale)

    //change rent price
    await govtFunctions.connect(buyerAddress).setRentPrice(1, rentPrice)
  
    var deposit = ethers.parseUnits("0.001", 'ether');
    await govtFunctions.connect(renterAddress).rentProperty(1, { value: deposit})
    await govtFunctions.connect(renterAddress).rentProperty(2, { value: deposit})
    await govtFunctions.connect(renterAddress).rentProperty(3, { value: deposit})

    var tokenPrice = ethers.parseUnits("11", 'ether');


    await nft.connect(buyerAddress).giveResaleApproval(1);

    await propertyMarket.connect(buyerAddress).sellProperty(1, salePrice, 0, false, { value: 1000000000000000})    
    const tokensPrice = ethers.parseUnits('10', 'ether')
    await propertyMarket.connect(buyerAddress).sellProperty(3, salePrice, tokensPrice, false, { value: 1000000000000000})

    console.log("successfully listed property for sale")

    rentedPropetiesForSale = await govtFunctions.connect(renterAddress).getRentedProperties();
    console.log("rentedPropetiesForSale expect 2", rentedPropetiesForSale)
    
    //await propertyMarket.connect(buyer2Address).createPropertySale(1, false, { value: salePrice})
    
    // rentedPropetiesForSale = await govtFunctions.connect(renterAddress).getRentedProperties();
    // console.log("rentedPropetiesForSale expect 0", rentedPropetiesForSale)

    await govtFunctions.connect(renterAddress).payRent(1, { value: rentPrice})
    await propertyMarket.connect(renterAddress).withdrawERC20()
    
    await propertyTokenContract.connect(renterAddress).allowSender(tokensPrice)
    await propertyMarket.connect(renterAddress).createPropertySale(3, true ) 

    rentedPropetiesForSale = await govtFunctions.connect(renterAddress).getRentedProperties();
    console.log("rentedPropetiesForSale expect 1", rentedPropetiesForSale)
  
    // const rentValues = [
    //   '11', '30', '60', '100', '150', '250', '300', '400', '500'
    // ];
      
    // for (let i = 0; i < rentValues.length; i++) {
    //   const rent = ethers.parseUnits(rentValues[i], 'ether');
    
    //   console.log(`\n--- Rent Payment Test: ${rentValues[i]} POL ---`);
    
    //   // Set rent
    //   await govtFunctions.connect(buyerAddress).setRentPrice(1, rent);
    
    //   // Get balance before
    //   const balanceBefore = await ethers.provider.getBalance(buyerAddress.address);
    //   console.log('Buyer balance before:', ethers.formatEther(balanceBefore), 'ETH');
    
    //   // Pay rent
    //   const tx = await govtFunctions.connect(renterAddress).payRent(1, { value: rent });
    //   await tx.wait();
    
    //   // Get balance after
    //   const balanceAfter = await ethers.provider.getBalance(buyerAddress.address);
    //   console.log('Buyer balance after:', ethers.formatEther(balanceAfter), 'ETH');
    
    //   // Difference
    //   const balanceDiff = balanceAfter - balanceBefore;
    //   console.log('Balance diff:', ethers.formatEther(balanceDiff.toString()), 'ETH');
    // }

    

  
  });
});


