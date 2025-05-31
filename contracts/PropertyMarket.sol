// SPDX-License-Identifier: MIT

// This is considered an Exogenous, Decentralized, Anchored (pegged), Crypto Collateralized low volitility coin

// Layout of Contract:
// version
// imports
// errors
// interfaces, libraries, contracts
// Type declarations
// State variables
// Events
// Modifiers
// Functions

// Layout of Functions:
// constructor
// receive function (if exists)
// fallback function (if exists)
// external
// public
// internal
// private
// view & pure functions

/*
/*
 * @title BlockHouseBay
 *
 * The system is designed to replciate on a basic level a real estate market using NFTs and ERC20 tokens.
 */


pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
// import "hardhat/console.sol";

import {PropertyToken} from "./PropertyToken.sol";

interface GovtContract {
    function refundDeposit(uint256, address, bool, bool, bool) external;
    function withdrawRentTax() external;
    function getBalance() external view returns (uint256);
    function giftProperties(uint256 propertyId, address recipient) external;
    function adjustPropertiesWithRenterCount(uint256 propertyId, bool isForSale) external;
}

contract PropertyMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    Counters.Counter private _propertyIds;
    Counters.Counter private _propertiesSold;

    Counters.Counter private _relistCount;
    Counters.Counter private _propertiesRented;    

    address payable immutable i_govt;
    address payable i_govtContract;
    bool public govtContractSet = false;    
    uint256 public listingPrice = 20 ether;
    uint256 public constant INITIAL_SALE_PRICE = 550 ether;
    uint256 constant MAX_SALE_PRICE = 100000000 ether;
    uint256 constant INITIAL_TOKEN_PRICE = 2700 ether;
    uint256 constant INITIAL_EXCLUSIVE_PRICE = 85000 ether;    
    uint256 constant INITIAL_MINT = 100000000 * (10 ** 18);
    uint256 tokenMaxSupply = INITIAL_MINT;    

    PropertyToken public tokenContract;
    address nftContract;
 
    struct Sale {
        uint256 price;
        uint256 currency;
    }

    struct PropertyPayment {
        uint256 propertyId;
        address renter;
        uint256 timestamp;
    }

    struct Property {
        uint256 propertyId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 deposit;        
        uint256 salePrice;
        uint256 tokenSalePrice;
        uint256 rentPrice;
        Sale[] saleHistory;
        uint256[] dateSoldHistory;
        uint256[] dateSoldHistoryBhb;
        uint256 totalIncomeGenerated;
        bool isForSale;
        bool roomOneRented;
        bool roomTwoRented;
        bool roomThreeRented;
        bool roomFourRented;
        bool isExclusive;
        PropertyPayment[] payments;
    }

    mapping(uint256 => address[4]) propertyToRenters;
    mapping(uint256 => Property) private idToProperty;
    mapping(address => uint256[4]) public tenants;    
    mapping(address => uint256) public renterTokens;    
    mapping(address => mapping(uint256 => uint256)) renterToPropertyPaymentTimestamps;    
    mapping(address => uint256[]) public userProperties; 

    modifier onlyGovt() {
        require(i_govt == msg.sender, "only govt");
        _;
    }

    modifier onlyGovtContract() {
        require(i_govtContract == msg.sender, "only govt contract");
        _;
    }

    modifier onlyNotSet() {
        require(!govtContractSet, "");
        _;
    }

    constructor() {
        i_govt = payable(msg.sender);          
    }

    receive() external payable {}

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function getMaxSupply() public view returns (uint256) {
        return tokenMaxSupply;
    }

    function setListingPrice(uint256 price) public onlyGovt {
        listingPrice = price * 1 ether;
    }

    function setMaxSupply(uint256 amount) public onlyGovtContract {
        tokenMaxSupply = amount;
    }

    function getPropertiesRented() public view returns (uint256) {
        return tenants[msg.sender][0];
    }

    function incrementPropertiesRented() public onlyGovtContract {
        _propertiesRented.increment();
    }

    function decrementRelistCount() internal {
        _relistCount.decrement();
    }
    
    function setTotalIncomeGenerated(uint256 propertyId, uint256 amount) public onlyGovtContract nonReentrant {
        idToProperty[propertyId].totalIncomeGenerated += amount;
    }

    function getTenantsMapping(address user) public view returns (uint256[4][] memory) {
        uint256[4][] memory result = new uint256[4][](1);
        uint256[4] memory data = tenants[user];
        result[0] = data;
        return result;        
    }    

    function setTenantsMapping(address user, uint256 propertyId, uint8 index) public onlyGovtContract nonReentrant {
        tenants[user][index] = propertyId;
    }
    
    // failsafe but should never be used in theory
    function transferContractBalance() public onlyGovt nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "no balance");
        i_govtContract.transfer(balance);
    }

    function getPropertyRenters(
        uint256 propertyId
    ) public view returns (address[4] memory) {
        address[4] memory renterAddresses = propertyToRenters[propertyId];        
        return renterAddresses;
    }

    function setPropertyRenters(
        uint256 propertyId,
        address[4] memory renterAddresses   
    ) public onlyGovtContract nonReentrant {
        propertyToRenters[propertyId] = renterAddresses; 
        Property storage property = idToProperty[propertyId];               
        if (!property.roomOneRented) {
            idToProperty[propertyId].roomOneRented = true;
        } else if (!property.roomTwoRented) {
            idToProperty[propertyId].roomTwoRented = true;
        } else if (!property.roomThreeRented) {
            idToProperty[propertyId].roomThreeRented = true;
        } else if (!property.roomFourRented) {
            idToProperty[propertyId].roomFourRented = true;
        } 
    }

    function getTokenContractAddress() public view returns (address) {
        return address(tokenContract);
    }

    function getRenterToPropertyTimestamp(uint256 propertyId, address caller) external view returns (uint256) {
        uint256 timestamp = renterToPropertyPaymentTimestamps[caller][propertyId];
        return timestamp;
    }

    function setRenterToPropertyTimestamp(uint256 propertyId, uint256 timestamp, address caller) external onlyGovtContract {
        renterToPropertyPaymentTimestamps[caller][propertyId] = timestamp;
        // console.log('renterToPropertyPaymentTimestamps[caller][propertyId]: ', renterToPropertyPaymentTimestamps[caller][propertyId]);
    }

    function fetchPropertiesForSale(uint256 page, bool includeOnlyRented) public view returns (Property[] memory) {
        uint256 propertyCount = _propertyIds.current() - 50;
        uint256 startIndex = 20 * (page - 1);
        uint256 endIndex = startIndex + 20;
        if (endIndex > propertyCount) {
            endIndex = propertyCount;
        }
        
        Property[] memory propertiesForSale = new Property[](endIndex - startIndex);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < propertyCount; i++) {
            uint256 currentId = i + 1;
            if (currentId <= _propertyIds.current()) {
                Property storage currentItem = idToProperty[currentId];
                if (currentItem.isForSale && currentItem.propertyId < 501) {
                    if (
                        !includeOnlyRented || 
                        (includeOnlyRented && (currentItem.roomOneRented || currentItem.roomTwoRented || 
                                            currentItem.roomThreeRented || currentItem.roomFourRented))
                    ) {
                        if (currentIndex >= startIndex && currentIndex < endIndex) {
                            propertiesForSale[currentIndex - startIndex] = currentItem;
                        }
                        currentIndex++;
                    }
                }
            }            

            if (currentIndex >= endIndex) {
                break;
            }
        }

        return propertiesForSale;
    }



    function fetchMyProperties(uint256 page) public view returns (Property[] memory) {
        require(page > 0, "");

        uint256[] memory userPropertyIds = userProperties[msg.sender];
        uint256 startIndex = 20 * (page - 1);
        uint256 endIndex = startIndex + 20;

        if (endIndex > userPropertyIds.length) {
            endIndex = userPropertyIds.length;
        }

        uint256[] memory propertyIds = new uint256[](endIndex - startIndex);
        uint256 itemCount = 0;

        // Fetch property IDs for properties within the pagination range
        for (uint256 i = startIndex; i < endIndex; i++) {
            propertyIds[itemCount] = userPropertyIds[i];
            itemCount++;
        }

        Property[] memory properties = getPropertyDetails(propertyIds, true);
        Property[] memory items = new Property[](properties.length);
        uint256 itemIndex = 0;

        // Filter properties owned by the message sender
        for (uint256 i = 0; i < properties.length; i++) {
            if (properties[i].owner == msg.sender) {
                items[itemIndex] = properties[i];
                itemIndex++;
            }
        }

        return items;
    }

    function fetchMyRentals() public view returns (Property[] memory) {
        uint256[4] memory rentedPropertyIds = getTenantProperties(msg.sender);
        uint8 size;
        // Determine the actual size of the rented properties array
        for (uint256 i = 0; i < 4; i++) {
            if (rentedPropertyIds[i] != 0) {
                size++;
            }
        }
        Property[] memory rentals = new Property[](size);
        uint8 index = 0; // Track index for rentals array
        // Populate the rentals array with property details
        for (uint256 i = 0; i < 4; i++) {
            uint256 propertyId = rentedPropertyIds[i];
            if (propertyId != 0) {
                uint256[] memory propertyIds = new uint256[](1);
                propertyIds[0] = propertyId;
                Property[] memory property = getPropertyDetails(propertyIds, true);
                rentals[index] = property[0];
                index++;
            }
        }
        return rentals;
    }

    function getTokensEarned() public view returns (uint256) {
        return renterTokens[msg.sender];
    }

    function setGovtContractAddress(address govtContract) public onlyNotSet {
        govtContractSet = true;
        i_govtContract = payable(govtContract);        
    }

    function setRenterTokens(uint256 amount, address caller) public onlyGovtContract {        
        renterTokens[caller] += amount;
    }

    function fetchPropertiesSold(uint256 page) public view returns (Property[] memory) {
        uint256 propertyCount = _propertyIds.current();        
        uint256 startIndex = 20 * (page - 1);
        
        uint256 endIndex = startIndex + 20;
        uint256 totalSoldProperties = _relistCount.current() + _propertiesSold.current();
        if (endIndex > propertyCount) {
            endIndex = propertyCount;
        }

        Property[] memory propertiesSold = new Property[](endIndex - startIndex);
        uint256 currentIndex = 0;
            for (uint256 i = 0; i < propertyCount; i++) {
            uint256 currentId = i + 1;
            if (currentId <= _propertyIds.current()) {
                uint256[] memory id = new uint256[](1);
                id[0] = i;
                Property[] memory currentItem = getPropertyDetails(id, false);
                if (currentItem[0].owner != i_govt
                    && currentItem[0].propertyId <= 500 
                    && currentItem[0].propertyId >= 1
                    && (currentItem[0].roomOneRented == false 
                    || currentItem[0].roomTwoRented == false 
                    || currentItem[0].roomThreeRented == false 
                    || currentItem[0].roomFourRented == false)               
                    ) {
                    if (currentIndex >= startIndex && currentIndex < endIndex) {
                        propertiesSold[currentIndex - startIndex] = currentItem[0];
                    }
                    currentIndex++;
                }
                if (currentIndex >= endIndex || currentIndex == totalSoldProperties) {
                    break;
                }
            }
        }
        return propertiesSold;
    }

    function getPropertyDetails(
        uint256[] memory propertyIds, bool getPayments
    ) public view returns (Property[] memory) {
        Property[] memory properties = new Property[](propertyIds.length);

        for (uint256 i = 0; i < propertyIds.length; i++) {
            uint256 propertyId = propertyIds[i];
            properties[i] = idToProperty[propertyId];

            if (getPayments) {
                address[4] storage renters = propertyToRenters[propertyId];
                properties[i].payments = getPropertyPayments(propertyId, renters);                           
            }
        }
        return properties;
    }

    function getPropertyPayments(uint256 propertyId, address[4] storage renters) internal view returns (PropertyPayment[] memory) {
        PropertyPayment[] memory payments = new PropertyPayment[](4);
        uint256 count = 0;

        for (uint256 j = 0; j < 4; j++) {
            uint256 timestamp = renterToPropertyPaymentTimestamps[renters[j]][propertyId];
                
            if (timestamp != 0) {                
                payments[count] = PropertyPayment(propertyId, renters[j], timestamp);
                // console.log('TIMESTAMP: ', payments[count].timestamp);
                count++;
            }            
        }
        return payments;        
    }


    function getPropertiesSold() external view returns (uint256) {
        return _propertiesSold.current();
    }

    function getPropertyIds() public view returns (uint256) {
        return _propertyIds.current();
    }

    function getRelistCount() external view returns (uint256) {
        return _relistCount.current();
    }

    function getTenantProperties(
        address tenant
    ) public view returns (uint256[4] memory) {
        
        return tenants[tenant];
    }

    function deployTokenContract() public onlyGovt nonReentrant {
        require(address(tokenContract) == address(0), "already deployed");
        PropertyToken propertyToken = new PropertyToken(
            INITIAL_MINT,
            address(this),
            i_govt
        );
        tokenContract = propertyToken;
    }

    function setNftContractAddress(address nftContractAddress) public onlyGovt nonReentrant {
        require(nftContract == address(0), "already set");
        nftContract = nftContractAddress;
    }

    function sellProperty(        
        uint256 propertyId,
        uint256 price,
        uint256 tokenPrice,
        bool isExclusive
    ) external payable nonReentrant {
        Property storage property = idToProperty[propertyId];
        
        require(property.owner == msg.sender, "not owner");        
        require(msg.value == listingPrice, "incorrect listing price");
        require(!property.isForSale, "already for sale");
        
        if (isExclusive) {
            require(propertyId >= 501 && propertyId < 551, "invalid pid");
            property.tokenSalePrice = tokenPrice;
 
            require(tokenPrice >= 1 ether && tokenPrice <= 10000000 ether, "invalid token price");
        } else {
            require(propertyId <= 500 && propertyId >= 1 && price >= INITIAL_SALE_PRICE && price <= MAX_SALE_PRICE, "inavlid sale price");
            property.salePrice = price;
            property.tokenSalePrice = (tokenPrice != 0) ? tokenPrice : 0;
            _relistCount.increment();
            _propertiesSold.decrement();  
            GovtContract govtContract = GovtContract(i_govtContract);
            govtContract.adjustPropertiesWithRenterCount(propertyId, true);
            i_govtContract.transfer(msg.value);
        }
   
        property.isForSale = true;
        property.seller = payable(msg.sender);
    
        IERC721(nftContract).transferFrom(msg.sender, address(this), propertyId);
    }


    function cancelSale(                
        uint256 propertyId
    ) public nonReentrant {
        require(propertyId <= 550 && propertyId >= 1, "invalid property id");
        Property storage property = idToProperty[propertyId];
        require(property.seller == msg.sender && property.isForSale, "property not for sale | not owner");        
        
        property.isForSale = false;
        property.salePrice = 0;
        property.tokenSalePrice = 0;
        if (propertyId < 501) {
            _propertiesSold.increment();
            decrementRelistCount();
            GovtContract govtContract = GovtContract(i_govtContract);
            govtContract.adjustPropertiesWithRenterCount(propertyId, false);
        }   
        IERC721(nftContract).transferFrom(address(this), msg.sender, propertyId);
    }

    //initial sale from after mint
    function createPropertyListing(        
        uint256[] memory tokenIds
    ) public payable onlyGovt nonReentrant {        

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            _propertyIds.increment();
            uint256 itemId = _propertyIds.current();
            Property storage listing = idToProperty[itemId];

            listing.propertyId = tokenId;
            listing.nftContract = nftContract;
            listing.tokenId = tokenId;
            listing.rentPrice = 10 ether;
            listing.deposit = 20 ether;
            listing.seller = payable(msg.sender);
            listing.owner = payable(i_govt);
            listing.isForSale = true;
            listing.tokenSalePrice = INITIAL_TOKEN_PRICE;
            idToProperty[tokenIds[i]] = listing;
            if (tokenId > 500) {
                listing.isExclusive = true;               
            } else {
                listing.salePrice = INITIAL_SALE_PRICE;
            }

            IERC721(nftContract).transferFrom(
                msg.sender,
                address(this),
                tokenId
            );
        }
    }

    function createPropertySale(        
        uint256 itemId,        
        bool isPaymentTokensBool
    ) public payable nonReentrant {  
        Property storage temp = idToProperty[itemId];
        require(itemId <= 550 && itemId >= 1, "invalid property id");
        require(temp.isForSale == true, "not for sale");
        require(temp.seller != msg.sender, "cannot buy your own property");        
        uint256 price = temp.salePrice;
        uint256 tokenId = temp.tokenId;
     
        if (isPaymentTokensBool) {    
            require(temp.tokenSalePrice != 0, "invalid token sale price");

            IERC20 propertyToken = IERC20(address(tokenContract));
            
            require(
                propertyToken.allowance(msg.sender, address(this)) ==
                    temp.tokenSalePrice,
                Strings.toString(
                    propertyToken.allowance(msg.sender, address(this))
                )
            );
            require(
                propertyToken.transferFrom(
                    msg.sender,
                    temp.seller,
                    temp.tokenSalePrice
                ),
                "transfer failed"
            );            
            temp.saleHistory.push(
                Sale(temp.tokenSalePrice, 2)
            );                   
        } else {            
            require(itemId < 501 && itemId >= 1, "invalid property id");            
            require(msg.value == price, "incorrect price");

            temp.saleHistory.push(Sale(price, 1));      
            temp.seller.transfer(
                msg.value - ((msg.value * 500) / 10000)
            ); 
            i_govtContract.transfer((msg.value * 500) / 10000);  //5% goes to i_govt          
        }
        temp.dateSoldHistory.push(block.timestamp);

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        
        if (itemId < 501) {
            if (temp.owner != i_govt) {
                decrementRelistCount();
            }
            _propertiesSold.increment();
            GovtContract govtContract = GovtContract(i_govtContract);
            govtContract.adjustPropertiesWithRenterCount(itemId, false);
        }

        if (temp.owner != i_govt) {
            vacateCommonTasks(itemId, msg.sender, false);
            for (uint256 j = 0; j < userProperties[temp.owner].length; j++) {
                if (userProperties[temp.owner][j] == itemId) {
                    userProperties[temp.owner][j] = userProperties[temp.owner][userProperties[temp.owner].length - 1];
                    userProperties[temp.owner].pop();
                }
            }
        }

        temp.owner = payable(msg.sender);
        temp.isForSale = false;
        temp.seller = payable(address(0)); 
        temp.rentPrice = 3 ether; // reset rent price              
        userProperties[msg.sender].push(itemId);
    }

    function getUserProperties() public view returns (uint256[] memory) {
        return userProperties[msg.sender];
    }


    function checkAndSetRoomStatus(uint256 propertyId) internal {
        Property storage property = idToProperty[propertyId];        
        if (property.roomOneRented) {
            property.roomOneRented = false;
        } else if (property.roomTwoRented) {
            property.roomTwoRented = false;
        } else if (property.roomThreeRented) {
            property.roomThreeRented = false;
        } else if (property.roomFourRented) {
            property.roomFourRented = false;
        }
    }



    function setRentPrice(uint256 propertyId, uint256 rent) external onlyGovtContract nonReentrant {        
        idToProperty[propertyId].rentPrice = rent;
    }


    //set deposit on property
    function setDeposit(uint256 propertyId, uint256 amount) public onlyGovtContract nonReentrant {
        idToProperty[propertyId].deposit = amount;
    }

    // this function resets the propertyToRenters mapping to 0
    function resetPropertyToRenters(uint256 propertyId, address sender) internal {
        for (uint256 i = 0; i < 4; i++) {
            if (propertyToRenters[propertyId][i] == sender) {
                propertyToRenters[propertyId][i] = address(0);
                break;
            }
        }
    }

    function vacate(uint256 pid) public nonReentrant {
        require(pid >=1 && pid <= 550, "invalid property id");
        vacateCommonTasks(pid, msg.sender, true);        
    }

    function vacateCommonTasks(uint256 propertyId, address sender, bool changePropertiesWithRenterCount) internal {
        for (uint256 i = 0; i < 4; i++) {
            if (tenants[sender][i] == propertyId) {                
                tenants[sender][i] = 0;

                checkAndSetRoomStatus(propertyId);
         
                resetPropertyToRenters(propertyId, sender);

                uint256 timestamp = renterToPropertyPaymentTimestamps[sender][propertyId];
                if (timestamp > 0) {
                    renterToPropertyPaymentTimestamps[sender][propertyId] = 0;
                }
                GovtContract govtContract = GovtContract(i_govtContract);
                govtContract.refundDeposit(propertyId, msg.sender, false, idToProperty[propertyId].isForSale, changePropertiesWithRenterCount);
                break;
            }
        }        
    }

    function evictTennant(
        uint256 propertyId,
        address tennant
    ) public nonReentrant {
        require(idToProperty[propertyId].owner == msg.sender, "not owner");        
        for (uint256 i = 0; i < tenants[msg.sender].length; i++) {
            if (tenants[tennant][i] == propertyId) {
                tenants[tennant][i] = 0;
                checkAndSetRoomStatus(propertyId);
                break;
            }
        }        
        resetPropertyToRenters(propertyId, tennant);
        GovtContract govtContract = GovtContract(i_govtContract);

        govtContract.refundDeposit(propertyId, tennant, true, idToProperty[propertyId].isForSale, true);
    }

    function withdrawERC20() public nonReentrant {
        //console.log('tokens: ',renterTokens[msg.sender] / (10 ** 18));
        require(renterTokens[msg.sender] > 0, "no tokens");
        tokenContract.transfer(msg.sender, renterTokens[msg.sender]);
        renterTokens[msg.sender] = 0;
    }

    function giftProperties(        
        uint256 pId,
        address recipient    
    ) public onlyGovt nonReentrant{

        // stops govt giving away properties that have been sold
        require (idToProperty[pId].saleHistory.length == 0, "");
        idToProperty[pId].owner = payable(recipient); 
        idToProperty[pId].isForSale = false;
        _propertiesSold.increment();
        idToProperty[pId].saleHistory.push(Sale(INITIAL_SALE_PRICE, 1));              
        idToProperty[pId].dateSoldHistory.push(block.timestamp);
        userProperties[recipient].push(pId);
        
        IERC721(nftContract).transferFrom(
            address(this),
            address(uint160(recipient)),
            pId
        );
    }
}
