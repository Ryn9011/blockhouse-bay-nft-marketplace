
const { expect } = require("chai");
const { ethers } = require("hardhat");

const data = require('../src/final-manifest.json');
const dataEx = require('../src/exc-manifest.json');

const fs = require('fs');
// const { govtaddress } = require("../src/config");

describe("PropertyMarket", function () {
  this.timeout(120000);
  it("Should create and execute market sales", async function () {
  
    const deployingAddress = "0xa2Fe6EB40BE5768d929c0ef13dF6936522348067";
    const deployingSigner = (await ethers.getSigners())[0]; // Access the first signer
    console.log('start balance of i_govt', (await ethers.provider.getBalance(deployingSigner)).toString());
    //console.log("Deploying signer:", deployingSigner);
  
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

    await govtFunctions.setGovtAddress(deployingSigner);
  
    const NFT = await ethers.getContractFactory("NFT");
    const nft = await NFT.deploy(propertyMarket.target);
    await nft.waitForDeployment();
    console.log("NFT deployed to:", nft.target);
    await nft.setDeployingAddress(deployingSigner);
  
    const tx2 = await propertyMarket.deployTokenContract();
    // console.log('whats this ', tx2)
    await tx2.wait();
  
    const tokenContractAddress = await propertyMarket.getTokenContractAddress();
    
    const propertyTokenContract = await ethers.getContractAt('PropertyToken', tokenContractAddress);
  
    console.log("Token deployed to:", propertyTokenContract.target);
    console.log("Balance of PropertyMarket:", (await propertyTokenContract.balanceOf(propertyMarket.target)).toString());


    let listingPrice = await propertyMarket.getListingPrice()
    //console.log("listing price: ", listingPrice)p
    listingPrice = listingPrice.toString()
    const defaultTokenPrice =5
    const initialSalePrice = ethers.parseUnits('0.001', 'ether')
    const rentdeposit = ethers.parseUnits('0.001', 'ether')
    
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

      
    const numOfBatches = 10;

    for (let i = 0; i < numOfBatches && i * batchSize < tokenIds.length; i++) {
      const idsBatch = tokenIds.slice(i * batchSize, (i + 1) * batchSize);
      let transaction2 = await propertyMarket.createPropertyListing(nft.target, idsBatch) //, { value: listingPrice }
      await transaction2.wait();
    }    

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

    // for (let i = 0; i < numOfBatches && i * batchSize < tokenIds.length; i++) {
        
    // }

    let transaction2 = await propertyMarket.createPropertyListing(nft.target, tokenIds2, { value: listingPrice })    
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

    let allproperti2es = await propertyMarket.connect(buyerAddress).fetchPropertiesForSale(1)
 
    console.log('initial balance of govtFunctions', (await ethers.provider.getBalance(govtFunctions.target)).toString());
    console.log('initial balance of propertyMarket', (await ethers.provider.getBalance(propertyMarket.target)).toString());

    for (let j = 0; j < 499; j++) {
      await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, j+1, tokenContractAddress, false, { value: initialSalePrice}) 
    }  
 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 1, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 2, tokenContractAddress, false, { value: initialSalePrice}) 
    // let allproperti2es3 = await propertyMarket.connect(buyerAddress).fetchPropertiesForSale(25)
    // //console.log(allproperti2es3.length)

    // const numForSale = await govtFunctions.connect(buyerAddress).getPropertiesForSale();
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 3, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 4, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 5, tokenContractAddress, false, { value: initialSalePrice}) 

    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 6, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 7, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 8, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 9, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 10, tokenContractAddress, false, { value: initialSalePrice}) 
    
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 11, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 12, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 13, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 14, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 15, tokenContractAddress, false, { value: initialSalePrice}) 
    
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 16, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 282, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 18, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 19, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 295, tokenContractAddress, false, { value: initialSalePrice}) 

    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 444, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 222, tokenContractAddress, false, { value: initialSalePrice}) 
    // // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 233, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 440, tokenContractAddress, false, { value: initialSalePrice}) 
    // await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, 500, tokenContractAddress, false, { value: initialSalePrice}) 
    // const numberOfTimes = 500;
    // for (let i = 1; i <= numberOfTimes; i++) {
    //   await propertyMarket.connect(buyerAddress).createPropertySale(nft.target, i, tokenContractAddress, false, { value: initialSalePrice });
    // }
    
    //await nft.connect(buyerAddress).giveResaleApproval(1);
    //await propertyMarket.connect(buyerAddress).sellUserProperty(nft.target, 1, 1, rentdeposit, defaultTokenPrice, { value: listingPrice})

    // const contractBal1 = await propertyMarket.connect(deployingSigner).getContractBalance()
    
    // await propertyMarket.connect(buyerAddress).setRentPrice(1, 70)
    let allproperties = await propertyMarket.connect(buyerAddress).fetchPropertiesForSale(1)
    //let allproperties2 = await propertyMarket.connect(buyerAddress).fetchPropertiesForSale(19)

    //console.log('all properties for sale', allproperties.length)
    //console.log('all properties for sale2', allproperties2[19])
    // console.log(allproperties)
    await govtFunctions.connect(renterAddress).rentProperty(1, { value: rentdeposit })
  
    


    const rentals = await propertyMarket.connect(renterAddress).fetchMyRentals()
    //console.log('my rentals, ', rentals);
    
    // let sold = await propertyMarket.connect(buyerAddress).fetchPropertiesSold(1)
    // sold.forEach((item) => {
    //   console.log(item.propertyId.toNumber())
    // })
    // console.log('SOLD P1: ',sold.length)  
    // let sold2 = await propertyMarket.connect(buyerAddress).fetchPropertiesSold(2)
    // console.log('SOLD P2: ',sold2)  

    
  



    //const renters = await propertyMarket.connect(buyerAddress).getPropertyRenters(1)

    // //console log renters and payments array where propertyId is not 0
    // for (let i = 0; i < renters.length; i++) {
    //   if (renters[i] !== 0) {
    //     //log renters[i] and payments[i]
    //     for (let j = 0; j < rentals.length; j++) {
         
    //         console.log('renter: ', renters[i], 'payment: ', rentals[j])
          
    //     }
    //   }
    // }
    // await propertyMarket.connect(buyer2Address).rentProperty(1, { value: rentdeposit })   
    //await propertyMarket.connect(renter2).rentProperty(1, { value: rentdeposit })   
    //await govtFunctions.connect(buyerAddress).setRentPrice(1,ethers.parseUnits('100', 'ether'))


    // let renterCount = await propertyMarket.connect(buyerAddress).getPropertyRenters(1)
    // console.log(renterCount.toString())
    // //renter pays property rent
    // // let tokenBalance = await propertyTokenContract.balanceOf(renterAddress.target)
    // // console.log(tokenBalance.toString())
    // for (let i = 0; i < 2; i++) {
    await govtFunctions.connect(renterAddress).payRent(1, { value: ethers.parseUnits('0.001', 'ether')}) 
    await govtFunctions.connect(renterAddress).payRent(1, { value: ethers.parseUnits('0.001', 'ether')}) 
    await govtFunctions.connect(renterAddress).payRent(1, { value: ethers.parseUnits('0.001', 'ether')}) 
    await govtFunctions.connect(renterAddress).payRent(1, { value: ethers.parseUnits('0.001', 'ether')}) 
    await govtFunctions.connect(renterAddress).payRent(1, { value: ethers.parseUnits('0.001', 'ether')}) 
    await govtFunctions.connect(renterAddress).payRent(1, { value: ethers.parseUnits('0.001', 'ether')}) 
    await govtFunctions.connect(renterAddress).payRent(1, { value: ethers.parseUnits('0.001', 'ether')}) 

    //get the balance in eth of propertyMarket

    await govtFunctions.connect(renterAddress).rentProperty(2, { value: rentdeposit })
    await govtFunctions.connect(renter2).rentProperty(1, { value: rentdeposit })
    await govtFunctions.connect(renter3).rentProperty(1, { value: rentdeposit })
    await govtFunctions.connect(renter4).rentProperty(1, { value: rentdeposit }) 
    
    await propertyMarket.connect(renterAddress).withdrawERC20()
    let bal = await propertyTokenContract.balanceOf(renterAddress)
    console.log('balance of renter after withdraw', bal.toString());

    let relistPrice = ethers.parseUnits('0.05', 'ether')

    await nft.connect(buyerAddress).giveResaleApproval(1);
    await propertyMarket.connect(buyerAddress).sellProperty(nft.target, 1, 1, relistPrice, defaultTokenPrice, false ,{ value: listingPrice })
    
    // const allowed = ethers.parseUnits('1', 'ether')
    // await propertyTokenContract.connect(renterAddress).allowSender(allowed)
    //renter address buys property using tokens
    let tenants = await propertyMarket.connect(renterAddress).getPropertiesRented()
    console.log('tenants', tenants[0])
    console.log('tenants', tenants[1])
    console.log('tenants', tenants[2])
    console.log('tenants', tenants[3])

    let property3 = await govtFunctions.connect(renter4).fetchSingleProperty(1)
    console.log('property before sale', property3)
    const renters3 = await propertyMarket.connect(renter4).getPropertyRenters(1)
    console.log('renters after rent: ', renters3)
    
    await propertyMarket.connect(renter2).createPropertySale(nft.target, 1, tokenContractAddress, false, { value: relistPrice}) 

    let property4 = await govtFunctions.connect(renter4).fetchSingleProperty(1)
    console.log('property after sale', property4)
    
    const renters = await propertyMarket.connect(renter4).getPropertyRenters(1)
    console.log('renters after sale: ', renters)

    await govtFunctions.connect(renter5).rentProperty(1, { value: rentdeposit }) 
    const renters2 = await propertyMarket.connect(renter4).getPropertyRenters(1)
    console.log('renters after rent: ', renters2)

    let property = await govtFunctions.connect(renter4).fetchSingleProperty(1)
    console.log('property after rerent', property)


    // let totalDepositBalance = await govtFunctions.connect(deployingSigner).checkTotalDepositBalance()
    // console.log('total deposit balance', totalDepositBalance.toString())
    // let totalGovtContBal = await govtFunctions.connect(deployingSigner).checkGovtBalance()
    // console.log('total govt balance', totalGovtContBal.toString())
    // let amountToWithdraw = await govtFunctions.connect(deployingSigner).amountToWithdraw()
    // console.log('amount to withdraw', amountToWithdraw.toString())
    // let contractBal = await govtFunctions.connect(deployingSigner).getContractBal()
    // console.log('contract balance', contractBal.toString())

    // console.log('balance of propertyMarket after', (await ethers.provider.getBalance(propertyMarket.target)).toString());

    // console.log('balance of i_govt', (await ethers.provider.getBalance(deployingSigner)).toString());
    // console.log('balance of ptopertyContractBefore', (await ethers.provider.getBalance(propertyMarket)).toString());

    // let balGovt = await propertyMarket.connect(deployingSigner).withdrawPropertyTax();
    // console.log('balance of i_govt after withdraw', (await ethers.provider.getBalance(deployingSigner)).toString());
    // console.log('balance of i_govt', (await ethers.provider.getBalance(deployingSigner)).toString());
    // console.log('balance of i_govt after withdraw', (await ethers.provider.getBalance(deployingSigner)).toString());
    // console.log('balance of ptopertyContractAfter', (await ethers.provider.getBalance(propertyMarket)).toString());

    // const tokensHex = await propertyMarket.connect(renterAddress).getTokensEarned();


    

    //const rentals = await propertyMarket.connect(renterAddress).fetchMyRentals();
    //console.log('my rentals, ', rentals);

    //console log the payments array for each rental
    // for (let i = 0; i < rentals.length; i++) {
    //   if (rentals[i] !== 0) {
    //     //log renters[i] and payments[i]
    //     for (let j = 0; j < rentals.length; j++) {
         
    //         //console.log('renter: ', rentals[i], 'payment: ', rentals[i].payments[j])
          
    //     }
    //   }
    // }


    // const tokensHex = await propertyMarket.connect(renterAddress).getTokensEarned();
    // const tokens = ethers.formatUnits(tokensHex.toString(), 'ether')
    // console.log("Reward amount: ", (tokens).toString()); 
    // //   if (i % 100 === 0) {
    // //     console.log("Balance of PropertyMarket:", (await propertyTokenContract.balanceOf(propertyMarket.target)).toString());
    // //     console.log("Reward amount: ", (tokens).toString());    
    // //   }


    //await govtFunctions.connect(renterAddress).rentProperty(4, { value: rentdeposit })
    // const allowed = ethers.parseUnits('1', 'ether')
    // await propertyTokenContract.connect(renterAddress).allowSender(allowed)
    // //renter address buys property using tokens
    // await propertyMarket.connect(renterAddress).createPropertySale(nft.target, 501, tokenContractAddress, true) 

    // let myProperties = await propertyMarket.connect(renterAddress).fetchMyProperties(1);
    // //console.log('buyer properties after resell listing', myProperties)

    // await govtFunctions.connect(renterAddress).setRentPrice(501,ethers.parseUnits('100', 'ether'))
    // await govtFunctions.connect(buyerAddress).rentProperty(501, { value: rentdeposit })
    // await govtFunctions.connect(buyerAddress).payRent(501, { value: ethers.parseUnits('100', 'ether')}) 

    

    // console.log("Balance of renter:", (await propertyTokenContract.balanceOf(renterAddress.target)).toString());

    // console.log('owner matic balance before collect', (await ethers.provider.getBalance(buyerAddress.target)).toString()); 
    // await govtFunctions.connect(buyerAddress).collectRent()
    // console.log('owner matic balance after collect', (await ethers.provider.getBalance(buyerAddress.target)).toString());

    // console.log('matic balance of govtFunctions before withDrawRentTax', (await ethers.provider.getBalance(govtFunctions.target)).toString());
    // console.log('matic balance of propertyMarket before withDrawPropertyTax', (await ethers.provider.getBalance(propertyMarket.target)).toString());

    // console.log('matic balance of deployingSigner before withDrawPropertyTax', (await ethers.provider.getBalance(deployingSigner.target)).toString());
    // await propertyMarket.connect(deployingSigner).withdrawPropertyTax();
    // console.log('matic balance of deployingSigner after withDrawPropertyTax', (await ethers.provider.getBalance(deployingSigner.target)).toString());
    // console.log('matic balance of govtFunctions after withDrawRentTax', (await ethers.provider.getBalance(govtFunctions.target)).toString());
    // console.log('matic balance of propertyMarket after withDrawPropertyTax', (await ethers.provider.getBalance(propertyMarket.target)).toString());
    // // }
    //  await govtFunctions.connect(buyerAddress).setRentPrice(1,ethers.parseUnits('3', 'ether'))
    // for (let i = 0; i < 2; i++) {
    //   await propertyMarket.connect(buyer2Address).payRent(1, { value: ethers.parseUnits('3', 'ether')})                    
    //   const tokensHex = await propertyMarket.connect(buyer2Address).getTokensEarned();
    //   const tokens = ethers.formatUnits(tokensHex.toString(), 'ether')
    //   if (i % 100 === 0) {
    //     console.log("Balance of PropertyMarket:", (await propertyTokenContract.balanceOf(propertyMarket.target)).toString());
    //     console.log("Reward amount2: ", (tokens).toString());    
    //   }  
      //  await propertyMarket.connect(buyer2Address).withdrawERC20(tokenContractAddress)
      //  console.log("Balance of renter:", (await propertyTokenContract.balanceOf(renterAddress.target)).toString());
    // }
    
    
    
    // //property owner gives resale approval to contract pass in propId
    // await nft.connect(buyerAddress).giveResaleApproval(1);
    // // // //property owner lists property for resale
    // await propertyMarket.connect(buyerAddress).sellProperty(nft.target, 1, 1, initialSalePrice+5, defaultTokenPrice, false ,{ value: initialSalePrice })
    // console.log('before myProperties')
    let myProperties = await propertyMarket.connect(buyerAddress).fetchMyProperties(1);
    // // console.log('after myProperties')
    // // let userProps = await propertyMarket.connect(buyerAddress).getUserProperties();
    // //  console.log('user properties', userProps)
    // // //console.log('buyer properties after resell listing', myProperties)

    // //  let sale = await propertyMarket.fetchPropertiesForSale(1)
    // // console.log('all propertiesForSale', sale.length)  

    // // // console.log('renter amount of token: ', await propertyTokenContract.balanceOf(renterAddress.target))

    // // //renter address allows contract to spend x amount of tokens on its behalf
    // const allowed = ethers.parseUnits('5', 'ether')
    // await propertyTokenContract.connect(renterAddress).allowSender(allowed)
    // // // //renter address buys property using tokens
    // await propertyMarket.connect(renterAddress).createPropertySale(nft.target, 1, tokenContractAddress, true, { value: initialSalePrice }) 
    // let my3Properties = await propertyMarket.connect(buyer2Address).fetchMyProperties(1)
    // console.log('buyer2 properties', my3Properties)
    // console.log('renter amount of token: ', await propertyTokenContract.balanceOf(renterAddress.target))



  });
});


