const { expect } = require("chai");
const hre = require("hardhat");
const ethers = hre.ethers;
// Import the specific contract type
const address = '0x7289723935006021a9F416b869a11a8633439Eff';
const nftaddress = "0xe80EcA50a509E2C537696bE36243b6ce9be06E16";
// Update the type of propertyMarket


describe("Lock", function () {
  it("gift property from govt", async function () {
    const PropertyMarket = await ethers.getContractFactory('PropertyMarket');
    const propertyMarket = PropertyMarket.attach(address);
    var [_, buyerAddress] = await ethers.getSigners()
    propertyMarket.giftProperties(nftaddress, 10, '0xe3aD0FFc55d7a89842a7123e6e0c7D370b871FF4', 10)

    //@ts-ignore
    
 
    expect(true);
  });
});