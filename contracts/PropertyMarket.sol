// SPDX-License-Identifier: MIT000000000000

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
import {PropertyToken} from "./PropertyToken.sol";
import "hardhat/console.sol";

interface GovtContract {
    function refundDeposit(uint256 propertyId, address) external;
    function withdrawRentTax() external;
    function getBalance() external view returns (uint256);
    function giftProperties(address nftContract, uint256 propertyId, address recipient) external;
}

contract PropertyMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    Counters.Counter private _propertyIds;
    Counters.Counter private _propertiesSold;

    Counters.Counter private _relistCount;
    Counters.Counter private _propertiesRented;
    Counters.Counter private _govtGiftCount;

    address payable immutable i_govt;
    address payable i_govtContract;
    bool public govtContractSet = false;
    //uint256 public constant DEPOSIT_REQUIRED = 0.001 ether; //rent also
    uint256 public constant LISTING_PRICE = 0.001 ether;
    uint256 public constant INITIAL_SALE_PRICE = 0.001 ether;
    uint256 constant INITIAL_TOKEN_PRICE = 1 ether;
    uint256 constant INITIAL_EXCLUSIVE_PRICE = 1 ether;
    uint256 constant WEI_TO_ETH = 1000000000000000000;
    uint256 constant INITIAL_MINT = 1000000 ether;
    uint256 tokenMaxSupply = 10000000 ether;
    // uint256 public totalDepositBal = 0;

    PropertyToken public tokenContract;
 
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
        require(i_govt == msg.sender, "");
        _;
    }

    modifier onlyGovtContract() {
        require(i_govtContract == msg.sender, "");
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

    // function getContractBalance() public view onlyGovt returns (uint256) {
    //     return address(this).balance; //test
    // }

    function getListingPrice() public pure returns (uint256) {
        return LISTING_PRICE;
    }

    function getMaxSupply() public view returns (uint256) {
        return tokenMaxSupply;
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

    //function to set totalincomegenerated
    function setTotalIncomeGenerated(uint256 propertyId, uint256 amount) public onlyGovtContract {
        idToProperty[propertyId].totalIncomeGenerated += amount;
    }

    function getTenantsMapping(address user) public view returns (uint256[4][] memory) {
        uint256[4][] memory result = new uint256[4][](1);
        uint256[4] memory data = tenants[user];
        result[0] = data;
        return result;        
    }    

    function setTenantsMapping(address user, uint256 propertyId, uint8 index) public onlyGovtContract {
        tenants[user][index] = propertyId;
    }

    function getPropertyRenters(
        uint256 propertyId
    ) public view returns (address[4] memory) {
        address[4] memory renterAddresses = propertyToRenters[propertyId];
        return renterAddresses;
    }

    function setPropertyRenters(
        uint256 propertyId,
        address[4] memory renterAddresses,
        uint8 room
    ) public onlyGovtContract {
        propertyToRenters[propertyId] = renterAddresses;        
        if (room == 0) {
            idToProperty[propertyId].roomOneRented = true;
        } else if (room == 1) {
            idToProperty[propertyId].roomTwoRented = true;
        } else if (room == 2) {
            idToProperty[propertyId].roomThreeRented = true;
        } else if (room == 3) {
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

    function fetchPropertiesForSale(uint256 page) public view returns (Property[] memory) {
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
                    if (currentIndex >= startIndex && currentIndex < endIndex) {
                        propertiesForSale[currentIndex - startIndex] = currentItem;
                    }
                    currentIndex++;
                }
                if (currentIndex >= endIndex) {
                    break;
                }
            }
        }
        return propertiesForSale;
    }


    function fetchMyProperties(uint256 page) public view returns (Property[] memory) {
        require(page > 0, "!");

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
        for (uint256 i = 0; i < 4; i++) {
            if (rentedPropertyIds[i] != 0) {
                size++;
            }
        }

        Property[]
            memory rentals = new Property[](
                size
            );
        for (uint256 i = 0; i != size; i++) {
            uint256 propertyId = rentedPropertyIds[i];
            if (propertyId != 0) {
                uint256[] memory propertyIds = new uint256[](1);
                propertyIds[0] = propertyId;
                Property[] memory property = getPropertyDetails(propertyIds, true);
                rentals[i] = property[0];                
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

    // function getRentAccumulated(address user) public view returns (uint256) {
    //     return rentAccumulated[user];
    // }

    // function setRentAccumulated(uint256 amount, address caller) public onlyGovtContract {
    //     rentAccumulated[caller] = amount;
    // }

    // function getTotalDepositBal() public view returns (uint256) {
    //     return totalDepositBal;
    // }

    // function setTotalDepositBal(uint256 amount) public onlyGovtContract {
    //     totalDepositBal += amount;
    // }

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
                if (currentItem[0].owner != address(0)
                    && currentItem[0].propertyId < 501 
                    && currentItem[0].propertyId > 0
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
                // console.log('does this hit?')    ; 
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
    
        // PropertyPayment[] memory result = new PropertyPayment[](count);
        // for (uint256 i = 0; i < count; i++) {
        //     result[i] = payments[i];
        // }

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

    // function checkGovtBalance() public view onlyGovt returns (uint256) {
    //     return address(this).balance - totalDepositBal;
    // }

    function deployTokenContract() public onlyGovt {
        PropertyToken propertyToken = new PropertyToken(
            INITIAL_MINT,
            address(this)
        );
        tokenContract = propertyToken;
    }


    function sellProperty(
        address nftContract,
        uint256 tokenId,
        uint256 propertyId,
        uint256 price,
        uint256 tokenPrice,
        bool isExclusive
    ) external payable nonReentrant {
        Property storage property = idToProperty[propertyId];
        // console.log('msg.value: ', msg.value);
        // console.log('LISTING_PRICE: ', LISTING_PRICE);
        // Common checks for both scenarios
        
        require(property.owner == msg.sender, "");
        // require(price >= INITIAL_SALE_PRICE, "too low");
        require(msg.value == LISTING_PRICE, "");
        require(!property.isForSale, "");
        
        if (isExclusive) {
            require(propertyId >= 500, "");
            property.tokenSalePrice = tokenPrice * (1 ether);
        } else {
            require(propertyId <= 500 && price >= INITIAL_SALE_PRICE, "");
            property.salePrice = price;
            property.tokenSalePrice = (tokenPrice != 0) ? tokenPrice * (1 ether) : 0;
            _relistCount.increment();
            _propertiesSold.decrement();
        }

        // Perform the transferFrom after all critical checks
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        // Common actions
        property.isForSale = true;
        property.seller = payable(msg.sender);
    }


    //user cancel property sale
    function cancelSale(
        address nftContract,
        uint256 tokenId,
        uint256 propertyId
    ) public nonReentrant {
        Property storage property = idToProperty[propertyId];
        require(property.seller == msg.sender || property.isForSale, "");        

        property.isForSale = false;
        property.salePrice = 0;
        property.tokenSalePrice = 0;
        if (propertyId < 501) {
            _propertiesSold.increment();
            decrementRelistCount();
        }     
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    }

    //initial sale from after minto
    function createPropertyListing(
        address nftContract,
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
            listing.rentPrice = 0.001 ether;
            listing.deposit = 0.001 ether;
            listing.seller = payable(msg.sender);
            listing.owner = payable(address(0));
            listing.isForSale = true;
            listing.tokenSalePrice = INITIAL_TOKEN_PRICE;
            idToProperty[tokenIds[i]] = listing;
            if (tokenId > 500) {
                listing.isExclusive = true;
                //listing.salePrice = INITIAL_EXCLUSIVE_PRICE;
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
        address nftContract,
        uint256 itemId,
        address propertyTokenContractAddress,
        bool isPaymentTokensBool
    ) public payable nonReentrant {  
        // console.log('msg.value createPropertySale: ', msg.value);    
        // console.log('propertyTokenContractAddress: ', propertyTokenContractAddress);
        Property storage temp = idToProperty[itemId];
        require(temp.propertyId < 551, "");
        uint256 price = temp.salePrice;
        uint256 tokenId = temp.tokenId;
        
     
        if (isPaymentTokensBool) {
            require(
                propertyTokenContractAddress == address(tokenContract),
                "!"
            );
            require(temp.isForSale == true && temp.tokenSalePrice != 0, "");

            IERC20 propertyToken = IERC20(propertyTokenContractAddress);
            // if (_relistCount.current() > 1) {
            //     _relistCount.decrement();
            // }
            // console.log('tokenSalePrice: ', tempProperty.tokenSalePrice);
            // console.log('propertyToken.allowance(msg.sender, address(this)): ', propertyToken.allowance(msg.sender, address(this)));
            require(
                propertyToken.allowance(msg.sender, address(this)) ==
                    temp.tokenSalePrice,
                Strings.toString(
                    propertyToken.allowance(msg.sender, address(this))
                )
            );
            //console.log('propertyToken.transferFrom(msg.sender, tempProperty.seller, tempProperty.tokenSalePrice): ', propertyToken.transferFrom(msg.sender, tempProperty.seller, tempProperty.tokenSalePrice));
            require(
                propertyToken.transferFrom(
                    msg.sender,
                    temp.seller,
                    temp.tokenSalePrice
                ),
                "!"
            );
            // console.log('salePrice: ', tempProperty.salePrice);
            temp.saleHistory.push(
                Sale(temp.tokenSalePrice, 2)
            );                   
        } else {
            //if (itemId > 500) {
                require(itemId < 500, "");
            //}
            require(msg.value == price, "");
            temp.saleHistory.push(Sale(price, 1));      
        }
        temp.dateSoldHistory.push(block.timestamp);
        temp.seller.transfer(
            msg.value - ((msg.value * 500) / 10000)
        ); //5% goes to i_govt

        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        // GovtContract govtContract = GovtContract(i_govtContract);
        // govtContract.vacatePropertyAfterBuy(itemId, msg.sender);
        
        if (temp.owner != address(0)) {
            vacateCommonTasks(itemId, msg.sender);
            for (uint256 j = 0; j < userProperties[temp.owner].length; j++) {
                if (userProperties[temp.owner][j] == itemId) {
                    userProperties[temp.owner][j] = userProperties[temp.owner][userProperties[temp.owner].length - 1];
                    userProperties[temp.owner].pop();
                }
            }
        }

        if (itemId < 501) {
            if (temp.owner != address(0)) {
                decrementRelistCount();
            }
            _propertiesSold.increment();
        }

        temp.owner = payable(msg.sender);
        temp.isForSale = false;
        temp.seller = payable(address(0));
                
        userProperties[msg.sender].push(itemId);
    }

    function getUserProperties() public view returns (uint256[] memory) {
        return userProperties[msg.sender];
    }

    function checkSetRoomAvailability(
        uint256 propertyId
    ) internal returns (bool) {
        Property storage property = idToProperty[propertyId];
        if (!property.roomOneRented) {
            property.roomOneRented = true;
            return true;
        } else if (!property.roomTwoRented) {
            property.roomTwoRented = true;
            return true;
        } else if (!property.roomThreeRented) {
            property.roomThreeRented = true;
            return true;
        } else if (!property.roomFourRented) {
            property.roomThreeRented = true;
            return true;
        } 
        return false;        
    }

    function checkAndSetRoomStatus(uint256 propertyId) internal {
        Property memory temp = idToProperty[propertyId];
        if (temp.roomOneRented == true) {
            idToProperty[propertyId].roomOneRented = false;
        } else if (temp.roomTwoRented == true) {
            idToProperty[propertyId].roomTwoRented = false;
        } else if (temp.roomThreeRented == true) {
            idToProperty[propertyId].roomThreeRented = false;
        } else if (temp.roomThreeRented == true) {
            idToProperty[propertyId].roomFourRented = false;
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
        vacateCommonTasks(pid, msg.sender);
    }

    function vacateCommonTasks(uint256 propertyId, address sender) internal {
        for (uint256 i = 0; i < 3; i++) {
            if (tenants[sender][i] == propertyId) {                
                tenants[sender][i] = 0;

                checkAndSetRoomStatus(propertyId);
         
                resetPropertyToRenters(propertyId, sender);

                uint256 timestamp = renterToPropertyPaymentTimestamps[sender][propertyId];
                if (timestamp > 0) {
                    renterToPropertyPaymentTimestamps[sender][propertyId] = 0;
                }
                GovtContract govtContract = GovtContract(i_govtContract);
                govtContract.refundDeposit(propertyId, msg.sender);
            }
        }        
    }

    function evictTennant(
        uint256 propertyId,
        address tennant
    ) public nonReentrant {
        require(idToProperty[propertyId].owner == msg.sender, "");        
        for (uint256 i = 0; i < tenants[msg.sender].length; i++) {
            if (tenants[tennant][i] == propertyId) {
                tenants[tennant][i] = 0;
                checkAndSetRoomStatus(propertyId);
                break;
            }
        }        
        resetPropertyToRenters(propertyId, tennant);
    }

    function withdrawERC20(IERC20 token) public nonReentrant {
        //console.log('tokens: ',renterTokens[msg.sender]);
        require(renterTokens[msg.sender] > 0, "!");
        token.transfer(msg.sender, renterTokens[msg.sender]);
        renterTokens[msg.sender] = 0;
    }

    function withdrawPropertyTax() external onlyGovt nonReentrant {
        require(address(this).balance > 0, "!");
        uint256 bal = address(this).balance;
        GovtContract govt = GovtContract(i_govt);
        if (govt.getBalance() > 0) {
            govt.withdrawRentTax();
        }
        i_govt.transfer(bal);
    }

    function giftProperties(
        address nft,
        uint256 pId,
        address recipient
    ) public onlyGovt nonReentrant{
        GovtContract govt = GovtContract(i_govt);
        govt.giftProperties(nft, pId, recipient);
        // Property storage property = idToProperty[propertyId];
        // require(property.owner == address(0), "already owned");

        // property.owner = payable(recipient);
        // property.isForSale = false;
        // property.seller = payable(address(0));

        _propertiesSold.increment();
        // require(_propertiesSold.current() <= 10, "");

        IERC721(nft).transferFrom(
            address(this),
            address(uint160(recipient)),
            pId
        );
    }
}
