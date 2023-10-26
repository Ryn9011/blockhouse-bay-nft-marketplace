const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("PropertyMarket", function () {
  it("Should create and execute market sales", async function () {
  
    //deploy contracts
    // const Market = await ethers.getContractFactory("PropertyMarket")
    // const market = await Market.deploy()
    // await market.deployed()
    // const marketAddress = market.address

    // const GovtFunctions = await ethers.getContractFactory("GovtFunctions");
    // const govtFunctions = await GovtFunctions.deploy(marketAddress);
    // await govtFunctions.deployed();
    // console.log("govtFunctions deployed to:", govtFunctions.address); 

    // var [govt] = await ethers.getSigners()   
    // console.log("govt acc inital after deploy",  await govt.getBalance())
    // console.log(await market.connect(govt).getContractBalance())

    // const NFT = await ethers.getContractFactory("NFT")
    // const nft = await NFT.deploy(marketAddress)
    // await nft.deployed()
    // const nftContractAddress = nft.address   

    // await market.deployTokenContract()
    // const tokenContractAddress = await market.getTokenContractAddress()
    // const propertyTokenContract = await ethers.getContractAt('PropertyToken', tokenContractAddress)
    // console.log(await propertyTokenContract.balanceOf(marketAddress))

  const deployingSigner = (await ethers.getSigners())[0]; // Access the first signer

  console.log("Deploying signer:", deployingSigner.address);

  const RewardCalculator = await ethers.getContractFactory("RewardCalculator");
  const rewardCalculator = await RewardCalculator.deploy();
  await rewardCalculator.deployed();
  console.log("Reward calculator deployed to:", rewardCalculator.address);

  const PropertyMarket = await ethers.getContractFactory("PropertyMarket", {
    libraries: {
      RewardCalculator: rewardCalculator.address,
    },
  });
  const propertyMarket = await PropertyMarket.deploy();
  await propertyMarket.deployed();
  console.log("PropertyMarket deployed to:", propertyMarket.address);

  // Send test Ether to the deployed contract
  const tx = await deployingSigner.sendTransaction({
    to: propertyMarket.address,
    value: ethers.utils.parseEther("0.1"), // Replace with the desired amount of test Ether
  });
  await tx.wait();

  const GovtFunctions = await ethers.getContractFactory("GovtFunctions");
  const govtFunctions = await GovtFunctions.deploy(propertyMarket.address);
  await govtFunctions.deployed();
  console.log("GovtFunctions deployed to:", govtFunctions.address);

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(propertyMarket.address);
  await nft.deployed();
  console.log("NFT deployed to:", nft.address);

  const tx2 = await propertyMarket.deployTokenContract();
  await tx2.wait();

  const tokenContractAddress = await propertyMarket.getTokenContractAddress();
  
  const propertyTokenContract = await ethers.getContractAt('PropertyToken', tokenContractAddress);

  console.log("Token deployed to:", propertyTokenContract.address);
  console.log("Balance of PropertyMarket:", (await propertyTokenContract.balanceOf(propertyMarket.address)).toString());


    let listingPrice = await propertyMarket.getListingPrice()
    console.log("listing price: ", listingPrice)
    listingPrice = listingPrice.toString()
    const defaultTokenPrice = 300
    const initialSalePrice = ethers.utils.parseUnits('120', 'ether')
    const rentdeposit = ethers.utils.parseUnits('3', 'ether')
    
    const defaultRentPrice = ethers.utils.parseUnits('3', 'ether')

    //mint NFT Properties
    await nft.createToken("https://www.mytokenlocation.com")
    await nft.createToken("https://www.mytokenlocation2.com")

    var arr = []
    arr.push(1)
    arr.push(2)

    var num3 = await propertyMarket.getPropertyIds()
    console.log("ss", num3)

    // //create listings 
    await propertyMarket.createPropertyListing(nft.address, arr)
    
    const balAfter1 = await propertyMarket.connect(deployingSigner).getContractBalance()    
    console.log("balAfter1", balAfter1)

     
    
    var [_, buyerAddress] = await ethers.getSigners()
    var [_,_, renterAddress] = await ethers.getSigners()
    var [_,_,_, buyer2Address] = await ethers.getSigners()
    var [_,_,_,_, sellerAddress] = await ethers.getSigners()    


 
    await propertyMarket.connect(buyerAddress).createPropertySale(nft.address, 1, tokenContractAddress, false, { value: initialSalePrice}) 
    await propertyMarket.connect(buyer2Address).createPropertySale(nft.address, 2, tokenContractAddress, false, { value: initialSalePrice}) 

    const contractBal1 = await propertyMarket.connect(deployingSigner).getContractBalance()
    
    //await propertyMarket.connect(buyerAddress).setRentPrice(1, 70)
    let myProperties = await govtFunctions.connect(buyerAddress).fetchMyProperties()
    let myProperties2 = await govtFunctions.connect(buyer2Address).fetchMyProperties()

    console.log(myProperties)
    console.log(myProperties2)
    //console.log('buyer properties beofre', myProperties)
    await propertyMarket.connect(renterAddress).rentProperty(1, { value: rentdeposit })  
    //renter pays property rent
    // let tokenBalance = await propertyTokenContract.balanceOf(renterAddress.address)
    // console.log(tokenBalance.toString())
    await propertyMarket.connect(renterAddress).payRent(1, { value: defaultRentPrice })    
    await propertyMarket.connect(renterAddress).withdrawERC20(tokenContractAddress)
    console.log("Balance of PropertyMarket:", (await propertyTokenContract.balanceOf(propertyMarket.address)).toString());
    console.log("Balance of renter:", (await propertyTokenContract.balanceOf(renterAddress.address)).toString());
  
    
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
