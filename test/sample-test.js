const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("PropertyMarket", function () {
  it("Should create and execute market sales", async function () {
  
    //deploy contracts
    const Market = await ethers.getContractFactory("PropertyMarket")
    const market = await Market.deploy()
    await market.deployed()
    const marketAddress = market.address

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

    //create listings 
    await market.createPropertyListing(nftContractAddress, 1, { value: listingPrice })
    const balAfter1 = await market.connect(govt).getContractBalance()    
    console.log("balAfter1", balAfter1)
    await market.createPropertyListing(nftContractAddress, 2, { value: listingPrice })  
    const balAfter2 = await market.connect(govt).getContractBalance()    
    console.log("balAfter2", balAfter2)
     
    
    var [_, buyerAddress] = await ethers.getSigners()
    var [_,_, renterAddress] = await ethers.getSigners()
    var [_,_,_, buyer2Address] = await ethers.getSigners()
    var [_,_,_,_, sellerAddress] = await ethers.getSigners()

    console.log("renter",renterAddress.address)
    console.log("b2", buyer2Address.address)
    console.log(sellerAddress.address)

   

    //buy property
    console.log("hit")
    await market.connect(buyerAddress).createPropertySale(nftContractAddress, 1, tokenContractAddress, false, { value: initialSalePrice}) 
    const contractBal1 = await market.connect(govt).getContractBalance()   
    console.log("govt address bal after sale",  await govt.getBalance()) 
    console.log("cbal", contractBal1)
    //rent property
    await market.connect(renterAddress).rentProperty(1, { value: rentdeposit })  
    // await market.connect(buyer2Address).rentProperty(1, { value: rentdeposit })  
    // await market.connect(sellerAddress).rentProperty(1, { value: rentdeposit }) 
    
    const renters = await market.connect(buyerAddress).getPropertyRenters(1)
    console.log("renters", renters)

    var test1 = await market.connect(renterAddress).getPropertiesRented()
    var test2 = await market.connect(buyer2Address).getPropertiesRented()
    var test3 = await market.connect(sellerAddress).getPropertiesRented()
    console.log("buyerAddressRentals", test1)
    console.log("buyer2AddressRentals", test2)
    console.log("sellerAddressRentals", test3)

    // let items = await market.fetchPropertiesForSale()
    // items = await Promise.all(items.map(async i => {
    //   const tokenUri = await nft.tokenURI(i.tokenId)
    //   let item = {
    //     price: i.salePrice.toString(),
    //     tokenId: i.tokenId.toString(),
    //     seller: i.seller,
    //     owner: i.owner,
    //     isForSale: i.isForSale,
    //     tokenSalePrice: i.tokenSalePrice.toString(),
    //     tokenUri
    //   }
    //   return item
    // }))
    // console.log('properties sold: ', items)
  
    //view rentals of user whos has rented
    let rentals = await market.connect(renterAddress).fetchMyRentals()
    console.log('properties rented: ', rentals)
  

    //renter pays property rent
    console.log(await market.getTokenContractTokenBalance())
    await market.connect(renterAddress).payRent(1, { value: defaultRentPrice })
    const tokens = await market.connect(renterAddress).getTokensEarned()
    console.log("renter tokens", tokens)

    const contractBal = await market.connect(govt).getContractBalance()
    console.log("govt address bal after rent paid",  await govt.getBalance())
    console.log("cbal", contractBal)

    //renter withdraws tokens earned
    console.log("contract tokens",await market.getTokenContractTokenBalance())
    await market.connect(renterAddress).withdrawERC20(tokenContractAddress)
    console.log('market amount of token: ', await propertyTokenContract.balanceOf(marketAddress))
    console.log('renter amount of token: ', await propertyTokenContract.balanceOf(renterAddress.address))

    //property owner changes rent price
    //await market.connect(buyerAddress).setRentPrice(1, 70)
    // let myProperties = await market.connect(buyerAddress).fetchMyProperties()
    // console.log('buyer properties beofre', myProperties)

    //property owner gives resale approval to contract pass in propId
    await nft.connect(buyerAddress).giveResaleApproval(1);
    //property owner lists property for resale
    await market.connect(buyerAddress).sellUserProperty(nftContractAddress, 1, 1, initialSalePrice, defaultTokenPrice, { value: listingPrice })
    // let my2Properties = await market.connect(buyerAddress).fetchMyProperties()
    // console.log('buyer properties after resell listing', my2Properties)

    // let sale = await market.fetchPropertiesForSale()
    // console.log('all propertiesForSale', sale)  

    //console.log('renter amount of token: ', await propertyTokenContract.balanceOf(renterAddress.address))

    //renter address allows contract to spend x amount of tokens on its behalf
    await propertyTokenContract.connect(renterAddress).allowSender(defaultTokenPrice)
    //renter address buys property using tokens
    await market.connect(renterAddress).createPropertySale(nftContractAddress, 1, tokenContractAddress, true, { value: initialSalePrice}) 
    let my3Properties = await market.connect(buyer2Address).fetchMyProperties()
    console.log('buyer2 properties', my3Properties)
    console.log('renter amount of token: ', await propertyTokenContract.balanceOf(renterAddress.address))

  });
});
