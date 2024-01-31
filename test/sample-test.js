
const { expect } = require("chai");
const { ethers } = require("hardhat");


const data = require('../src/final-manifest.json');
const dataEx = require('../src/exc-manifest.json');

const fs = require('fs');

describe("PropertyMarket", function () {
  it("Should create and execute market sales", async function () {
  
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


    let listingPrice = await propertyMarket.getListingPrice()
    //console.log("listing price: ", listingPrice)p
    listingPrice = listingPrice.toString()
    const defaultTokenPrice = 300
    const initialSalePrice = ethers.utils.parseUnits('0.001', 'ether')
    const rentdeposit = ethers.utils.parseUnits('3', 'ether')
    
    const defaultRentPrice = ethers.utils.parseUnits('3', 'ether')

    const urisn = Object.keys(data.paths).map(uri => "https://arweave.net/" + data.paths[uri].id); 
  

    const batchSize = 50;
    const numBatches = Math.ceil(urisn.length / batchSize);
    const tokenIds = [];

    for (let i = 0; i < numBatches && i * batchSize < urisn.length; i++) {
      const batch = urisn.slice(i * batchSize, (i + 1) * batchSize);
      const gasLimit = await nft.estimateGas.createTokens(batch);
      const transaction = await nft.createTokens(batch);
      const receipt = await transaction.wait();
      for (let j = 0; j < receipt.events.length; j++) {
        if (receipt.events[j].event === "Transfer") {
          const tokenId = receipt.events[j].args[2].toNumber();
          tokenIds.push(tokenId);
        }
      }
    }
    console.log(tokenIds)
    const params = {
      gasLimit: 30000000
    }

      
    const numOfBatches = 10;
    for (let i = 0; i < numOfBatches && i * batchSize < tokenIds.length; i++) {
      const idsBatch = tokenIds.slice(i * batchSize, (i + 1) * batchSize);
      let transaction2 = await propertyMarket.createPropertyListing(nft.address, idsBatch) //, { value: listingPrice }
      await transaction2.wait();
    }    

    //mint NFT Properties
    // await nft.createToken("https://www.mytokendlocation.com")

  

    // await propertyMarket.createPropertyListing(nft.address, arr)
    // await propertyMarket.createPropertyListing(nft.address, arr)
    
    // const balAfter1 = await propertyMarket.connect(deployingSigner).getContractBalance()    
    //console.log("balAfter1", balAfter1)

     
    
    var [_, buyerAddress] = await ethers.getSigners()
    var [_,_, renterAddress] = await ethers.getSigners()
    var [_,_,_, buyer2Address] = await ethers.getSigners()
    var [_,_,_,_, sellerAddress] = await ethers.getSigners()    
    var [_,_,_,_,_, renter2] = await ethers.getSigners()   
    var [_,_,_,_,_,_, renter3] = await ethers.getSigners()  
    var [_,_,_,_,_,_,_, renter4] = await ethers.getSigners()  

    // let allproperti2es = await propertyMarket.connect(buyerAddress).fetchPropertiesForSale(1)
 
 
    await propertyMarket.connect(buyerAddress).createPropertySale(nft.address, 1, tokenContractAddress, false, { value: initialSalePrice}) 
    //await propertyMarket.connect(buyer2Address).createPropertySale(nft.address, 2, tokenContractAddress, false, { value: initialSalePrice}) 
    //await nft.connect(buyerAddress).giveResaleApproval(1);
    //await propertyMarket.connect(buyerAddress).sellUserProperty(nft.address, 1, 1, rentdeposit, defaultTokenPrice, { value: listingPrice})

    // const contractBal1 = await propertyMarket.connect(deployingSigner).getContractBalance()
    
    // await propertyMarket.connect(buyerAddress).setRentPrice(1, 70)
    // let allproperties = await propertyMarket.connect(buyerAddress).fetchPropertiesForSale(1)
    // console.log(allproperties)
    let sold = await govtFunctions.connect(buyerAddress).fetchPropertiesSold(20)
    console.log(sold)
    //let myProperties2 = await govtFunctions.connect(buyer2Address).fetchMyProperties()

    // console.log(myProperties)
    // console.log(myProperties2)
    //console.log('buyer properties beofre', myProperties)
    // await propertyMarket.connect(renterAddress).rentProperty(1, { value: rentdeposit })
    // await propertyMarket.connect(buyer2Address).rentProperty(1, { value: rentdeposit })   
    // await propertyMarket.connect(renter2).rentProperty(1, { value: rentdeposit })   
    // await propertyMarket.connect(buyerAddress).setRentPrice(1,ethers.utils.parseUnits('100', 'ether'))


    // let renterCount = await propertyMarket.connect(buyerAddress).getPropertyRenters(1)
    // console.log(renterCount.toString())
    // //renter pays property rent
    // // let tokenBalance = await propertyTokenContract.balanceOf(renterAddress.address)
    // // console.log(tokenBalance.toString())
    // for (let i = 0; i < 2; i++) {
    //   await propertyMarket.connect(renterAddress).payRent(1, { value: ethers.utils.parseUnits('100', 'ether')})                    
    //   const tokensHex = await propertyMarket.connect(renterAddress).getTokensEarned();
    //   const tokens = ethers.utils.formatUnits(tokensHex.toString(), 'ether')
    //   if (i % 100 === 0) {
    //     console.log("Balance of PropertyMarket:", (await propertyTokenContract.balanceOf(propertyMarket.address)).toString());
    //     console.log("Reward amount: ", (tokens).toString());    
    //   }  
    //   await propertyMarket.connect(renterAddress).withdrawERC20(tokenContractAddress)
    //   // console.log("Balance of renter:", (await propertyTokenContract.balanceOf(renterAddress.address)).toString());
    // }
    // await propertyMarket.connect(buyerAddress).setRentPrice(1,ethers.utils.parseUnits('3', 'ether'))
    // for (let i = 0; i < 2; i++) {
    //   await propertyMarket.connect(buyer2Address).payRent(1, { value: ethers.utils.parseUnits('3', 'ether')})                    
    //   const tokensHex = await propertyMarket.connect(buyer2Address).getTokensEarned();
    //   const tokens = ethers.utils.formatUnits(tokensHex.toString(), 'ether')
    //   if (i % 100 === 0) {
    //     console.log("Balance of PropertyMarket:", (await propertyTokenContract.balanceOf(propertyMarket.address)).toString());
    //     console.log("Reward amount2: ", (tokens).toString());    
    //   }  
    //   await propertyMarket.connect(buyer2Address).withdrawERC20(tokenContractAddress)
    //   // console.log("Balance of renter:", (await propertyTokenContract.balanceOf(renterAddress.address)).toString());
    // }
    
    
    // console.log('buyer properties beofre', myProperties2)
    // //property owner gives resale approval to contract pass in propId
    // await nft.connect(buyerAddress).giveResaleApproval(1);
    // //property owner lists property for resale
    // await propertyMarket.connect(buyerAddress).sellUserProperty(nft.address, 1, 1, initialSalePrice, defaultTokenPrice, { value: listingPrice })
    // let my2Properties = await propertyMarket.connect(buyerAddress).fetchMyProperties()
    // console.log('buyer properties after resell listing', my2Properties)

    // let sale = await propertyMarket.fetchPropertiesForSale()
    // console.log('all propertiesForSale', sale)  

    // console.log('renter amount of token: ', await propertyTokenContract.balanceOf(renterAddress.address))

    // //renter address allows contract to spend x amount of tokens on its behalf
    // await propertyTokenContract.connect(renterAddress).allowSender(defaultTokenPrice)
    // //renter address buys property using tokens
    // await propertyMarket.connect(renterAddress).createPropertySale(nft.address, 1, tokenContractAddress, true, { value: initialSalePrice}) 
    // let my3Properties = await propertyMarket.connect(buyer2Address).fetchMyProperties()
    // console.log('buyer2 properties', my3Properties)
    // console.log('renter amount of token: ', await propertyTokenContract.balanceOf(renterAddress.address))

  });
});


