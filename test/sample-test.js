const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("PropertyMarket", function () {
  it("Should create and execute market sales", async function () {
  
    //deploy contracts
    const Market = await ethers.getContractFactory("PropertyMarket")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

    const GovtFunctions = await ethers.getContractFactory("GovtFunctions");
    const govtFunctions = await GovtFunctions.deploy(marketAddress);
    await govtFunctions.deployed();
    console.log("govtFunctions deployed to:", govtFunctions.address); 

    var [govt] = await ethers.getSigners()   
    console.log("govt acc inital after deploy",  await govt.getBalance())
    console.log(await market.connect(govt).getContractBalance())

    const NFT = await ethers.getContractFactory("NFT")
    const nft = await NFT.deploy(marketAddress)
    await nft.deployed()
    const nftContractAddress = nft.address   

    await market.deployTokenContract()
    const tokenContractAddress = await market.getTokenContractAddress()
    const propertyTokenContract = await ethers.getContractAt('PropertyToken', tokenContractAddress)
    console.log(await propertyTokenContract.balanceOf(marketAddress))

    let listingPrice = await market.getListingPrice()
    console.log("listing price: ", listingPrice)
    listingPrice = listingPrice.toString()
    const defaultTokenPrice = 300
    const initialSalePrice = ethers.utils.parseUnits('100', 'ether')
    const rentdeposit = ethers.utils.parseUnits('3', 'ether')
    
    const defaultRentPrice = ethers.utils.parseUnits('5', 'ether')

    //mint NFT Properties
    await nft.createToken("https://www.mytokenlocation.com")
    await nft.createToken("https://www.mytokenlocation2.com")

    var arr = []
    arr.push(1)
    arr.push(2)

    var num3 = await market.getPropertyIds()
    console.log("ss", num3)

    // //create listings 
    await market.createPropertyListing(nftContractAddress, arr)
    
    const balAfter1 = await market.connect(govt).getContractBalance()    
    console.log("balAfter1", balAfter1)

     
    
    var [_, buyerAddress] = await ethers.getSigners()
    var [_,_, renterAddress] = await ethers.getSigners()
    var [_,_,_, buyer2Address] = await ethers.getSigners()
    var [_,_,_,_, sellerAddress] = await ethers.getSigners()    


 
    await market.connect(buyerAddress).createPropertySale(nftContractAddress, 1, tokenContractAddress, false, { value: initialSalePrice}) 
    
    


    await market.connect(buyer2Address).createPropertySale(nftContractAddress, 2, tokenContractAddress, false, { value: initialSalePrice}) 
    const contractBal1 = await market.connect(govt).getContractBalance()
    
    await market.connect(buyerAddress).setRentPrice(1, 70)
    let myProperties = await govtFunctions.connect(buyerAddress).fetchMyProperties()
    let myProperties2 = await govtFunctions.connect(buyer2Address).fetchMyProperties()

    console.log(myProperties)
    console.log(myProperties2)
    // //console.log('buyer properties beofre', myProperties)


    // let myProperties2 = await govtFunctions.connect(buyer2Address).fetchMyProperties()
    // console.log('buyer properties beofre', myProperties2)
    //property owner gives resale approval to contract pass in propId
    //await nft.connect(buyerAddress).giveResaleApproval(1);
    //property owner lists property for resale
    //await market.connect(buyerAddress).sellUserProperty(nftContractAddress, 1, 1, initialSalePrice, defaultTokenPrice, { value: listingPrice })
    // let my2Properties = await market.connect(buyerAddress).fetchMyProperties()
    // console.log('buyer properties after resell listing', my2Properties)

    // let sale = await market.fetchPropertiesForSale()
    // console.log('all propertiesForSale', sale)  

    //console.log('renter amount of token: ', await propertyTokenContract.balanceOf(renterAddress.address))

    //renter address allows contract to spend x amount of tokens on its behalf
    // await propertyTokenContract.connect(renterAddress).allowSender(defaultTokenPrice)
    // //renter address buys property using tokens
    // await market.connect(renterAddress).createPropertySale(nftContractAddress, 1, tokenContractAddress, true, { value: initialSalePrice}) 
    // let my3Properties = await market.connect(buyer2Address).fetchMyProperties()
    // console.log('buyer2 properties', my3Properties)
    // console.log('renter amount of token: ', await propertyTokenContract.balanceOf(renterAddress.address))

  });
});
