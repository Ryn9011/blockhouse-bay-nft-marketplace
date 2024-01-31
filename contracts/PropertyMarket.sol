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

interface GovtContract {
    function vacatePropertyAfterBuy(uint256 propertyId, address sender) external;
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
    address i_govtContract;
    bool public govtContractSet = false;
    uint256 public constant DEPOSIT_REQUIRED = 0.001 ether; //rent also
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
        bool isExclusive;
        PropertyPayment[] payments;
    }

    mapping(uint256 => address[3]) propertyToRenters;
    mapping(uint256 => Property) private idToProperty;
    mapping(address => uint256[3]) public tennants;
    // mapping(address => uint256) public renterDepositBalance;
    mapping(address => uint256) public renterTokens;
    // mapping(address => uint256) public rentAccumulated;
    mapping(address => mapping(uint256 => uint256)) renterToPropertyPaymentTimestamps;

    modifier onlyGovt() {
        require(i_govt == msg.sender, "only i_govt");
        _;
    }

    modifier onlyGovtContract() {
        require(i_govtContract == msg.sender, "only govtContract");
        _;
    }

    modifier onlyNotSet() {
        require(!govtContractSet, "Value is already set");
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

    function setMaxSupply(uint256 amount) public onlyGovt {
        tokenMaxSupply = amount;
    }

    function getPropertiesRented() public view returns (uint256) {
        return tennants[msg.sender][0];
    }

    function incrementPropertiesRented() public onlyGovtContract {
        _propertiesRented.increment();
    }

    function decrementRelistCount() public onlyGovtContract {
        _relistCount.decrement();
    }

    // function setRenterDepositBalance(address renter) public payable {
    //     renterDepositBalance[renter] = msg.value;
    //     totalDepositBal += msg.value;
    // }

    function getTenantsMapping(address user) public view returns (uint256[3][] memory) {
        uint256[3][] memory result = new uint256[3][](1);
        result[0] = tennants[user];
        return result;
    }    

    function setTenantsMapping(address user, uint256 propertyId, uint8 index) public onlyGovtContract {
        tennants[user][index] = propertyId;
    }

    function getPropertyRenters(
        uint256 propertyId
    ) public view returns (address[3] memory) {
        address[3] memory renterAddresses = propertyToRenters[propertyId];
        return renterAddresses;
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
    }

    function getPropertyPayments(uint256 propertyId) public view returns (PropertyPayment[] memory) {
        address[3] memory renters = propertyToRenters[propertyId];
        PropertyPayment[] memory payments = new PropertyPayment[](3);
        uint256 count = 0;

        for (uint256 j = 0; j < 3; j++) {
            uint256 timestamp = renterToPropertyPaymentTimestamps[renters[j]][propertyId];
            if (timestamp > 0) {
                payments[count] = PropertyPayment(propertyId, renters[j], timestamp);
                count++;
            }
        }

        PropertyPayment[] memory result = new PropertyPayment[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = payments[i];
        }

        return result;
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

    function fetchMyProperties() public view returns (Property[] memory) {        
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < _propertyIds.current(); i++) {
            if (idToProperty[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        Property[] memory items = new Property[](itemCount);
        for (uint256 i = 0; i < _propertyIds.current(); i++) {
            if (idToProperty[i + 1].owner == msg.sender) {
                uint256 currentId = i + 1;
                Property storage currentItem = idToProperty[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    }


    function fetchMyRentals() public view returns (Property[] memory) {
        // uint256 totalItemCount = _relistCount.current() + _propertiesSold.current();
        Property[] memory rentals = new Property[](3);
        uint256[3] memory rentedPropertyIds = tennants[msg.sender];
        for (uint256 i = 0; i < rentedPropertyIds.length; i++) {
            uint256 propertyId = rentedPropertyIds[i];
            if (rentedPropertyIds[i] != 0) {
                rentals[i] = idToProperty[propertyId];
            }
        }
        return rentals;
    }


    function getTokensEarned() public view returns (uint256) {
        return renterTokens[msg.sender];
    }

    function setGovtContractAddress(address govtContract) public onlyNotSet {
        govtContractSet = true;
        i_govtContract = govtContract;        
    }

    function setRenterTokens(uint256 amount, address caller) public onlyGovtContract {        
        renterTokens[caller] = amount;
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

    function getPropertyDetails(
        uint256[] memory propertyIds, bool getPayments
    ) public view returns (Property[] memory) {
        Property[] memory properties = new Property[](propertyIds.length);
            if (getPayments) {
                for (uint256 i = 0; i < propertyIds.length; i++) {
                    properties[i] = idToProperty[propertyIds[i]];
                properties[i].payments = getPropertyPayments(propertyIds[i]);
            }
        }        
        return properties;
    }

    function getPropertiesSold() external view returns (uint256) {
        return _propertiesSold.current();
    }

    function getPropertyIds() external view returns (uint256) {
        return _propertyIds.current();
    }

    function getRelistCount() external view returns (uint256) {
        return _relistCount.current();
    }

    function getTenantProperties(
        address tenant
    ) public view returns (uint256[3] memory) {
        
        return tennants[tenant];
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

    // function sellExclusiveProperty(
    //     address nftContract,
    //     uint256 tokenId,
    //     uint256 propertyId,
    //     uint256 tokenPrice
    // ) public payable {
    //     require(idToProperty[propertyId].owner == msg.sender, "Not owner");
    //     require(propertyId >= 500);
    //     require(msg.value == LISTING_PRICE, "incorrect fee");
    //     Property storage property = idToProperty[propertyId];
    //     property.tokenSalePrice = tokenPrice * (1 ether);

    //     property.isForSale = true;
    //     property.seller = payable(msg.sender);

    //     _relistCount.increment();
    //     _propertiesSold.decrement();
    //     IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    // }

    // //user resell property
    // function sellUserProperty(
    //     address nftContract,
    //     uint256 tokenId,
    //     uint256 propertyId,
    //     uint256 price,
    //     uint256 tokenPrice
    // ) external payable nonReentrant {
    //     require(price > 0 && propertyId <= 500, "Invalid price/ID");

    //     Property storage property = idToProperty[propertyId];
    //     IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

    //     require(property.owner == msg.sender && price >= INITIAL_SALE_PRICE && msg.value == LISTING_PRICE, "Invalid owner, price, or fee");
    //     require(!property.isForSale && property.salePrice != price, "Already for sale or same price");

    //     property.salePrice = price;
    //     property.tokenSalePrice = (tokenPrice != 0) ? tokenPrice * (1 ether) : 0;
    //     property.isForSale = true;
    //     property.seller = payable(msg.sender);

    //     _relistCount.increment();
    //     _propertiesSold.decrement();
    // }

    function sellProperty(
        address nftContract,
        uint256 tokenId,
        uint256 propertyId,
        uint256 price,
        uint256 tokenPrice,
        bool isExclusive
    ) external payable nonReentrant {
        Property storage property = idToProperty[propertyId];
        
        // Common checks for both scenarios
        require(price > 0 && propertyId <= 500, "Invalid price/ID");
        require(property.owner == msg.sender && msg.value == LISTING_PRICE, "Invalid owner or fee");
        require(!property.isForSale, "Already for sale");

        // Specific checks and actions based on whether it's an exclusive or user-resell scenario
        if (isExclusive) {
            require(propertyId >= 500, "not exc property");
            property.tokenSalePrice = tokenPrice * (1 ether);
        } else {
            require(price >= INITIAL_SALE_PRICE, "too low");
            require(property.salePrice != price, "same");
            property.salePrice = price;
            property.tokenSalePrice = (tokenPrice != 0) ? tokenPrice * (1 ether) : 0;
        }

        // Perform the transferFrom after all critical checks
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        // Common actions
        property.isForSale = true;
        property.seller = payable(msg.sender);

        _relistCount.increment();
        _propertiesSold.decrement();
    }


    //user cancel property sale
    function cancelSale(
        address nftContract,
        uint256 tokenId,
        uint256 propertyId
    ) public nonReentrant {
        Property storage property = idToProperty[propertyId];
        require(property.seller == msg.sender|| property.isForSale, "unlisted | not owner");        

        property.isForSale = false;
        property.salePrice = 0;
        property.tokenSalePrice = 0;
        _propertiesSold.increment();
        _relistCount.decrement();
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    }

    //initial sale from after mint
    function createPropertyListing(
        address nftContract,
        uint256[] memory tokenIds
    ) public payable onlyGovt nonReentrant {        

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            _propertyIds.increment();
            uint256 itemId = _propertyIds.current();
            Property storage listing = idToProperty[itemId];

            listing.propertyId = tokenIds[i];
            listing.nftContract = nftContract;
            listing.tokenId = tokenId;
            listing.rentPrice = DEPOSIT_REQUIRED;
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
        Property storage tempProperty = idToProperty[itemId];
        require(tempProperty.propertyId < 551, "invalid pId");
        uint256 price = tempProperty.salePrice;
        uint256 tokenId = tempProperty.tokenId;

        if (isPaymentTokensBool) {
            require(
                propertyTokenContractAddress == address(tokenContract),
                "invalid token"
            );
            require(tempProperty.isForSale == true && tempProperty.tokenSalePrice != 0, "!for sale or !accept tokens");

            IERC20 propertyToken = IERC20(propertyTokenContractAddress);
            if (_relistCount.current() > 1) {
                _relistCount.decrement();
            }
            require(
                propertyToken.allowance(msg.sender, address(this)) ==
                    tempProperty.tokenSalePrice,
                Strings.toString(
                    propertyToken.allowance(msg.sender, address(this))
                )
            );
            require(
                propertyToken.transferFrom(
                    msg.sender,
                    tempProperty.seller,
                    tempProperty.tokenSalePrice
                ),
                "transfer fail"
            );
            tempProperty.saleHistory.push(
                Sale(tempProperty.tokenSalePrice, 2)
            );                   
        } else {
            if (itemId > 500) {
                require(itemId < 500, "only token");
            }
            require(msg.value == price, "!asking price");
            tempProperty.saleHistory.push(Sale(price, 1));      
        }
        tempProperty.dateSoldHistory.push(block.timestamp);
        tempProperty.seller.transfer(
            msg.value - ((msg.value * 500) / 10000)
        ); //5% goes to i_govt
        
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        tempProperty.owner = payable(msg.sender);
        tempProperty.isForSale = false;
        tempProperty.seller = payable(address(0));
        _propertiesSold.increment();
        GovtContract govtContract = GovtContract(i_govtContract);
        govtContract.vacatePropertyAfterBuy(itemId, msg.sender);
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
        } 
        return false;        
    }

    function checkAndSetRoomStatus(uint256 propertyId) internal {
        Property memory propertyTemp = idToProperty[propertyId];
        if (propertyTemp.roomOneRented == true) {
            idToProperty[propertyId].roomOneRented = false;
        } else if (propertyTemp.roomTwoRented == true) {
            idToProperty[propertyId].roomTwoRented = false;
        } else if (propertyTemp.roomThreeRented == true) {
            idToProperty[propertyId].roomThreeRented = false;
        }
    }

    // function rentProperty(uint256 propertyId) external payable nonReentrant {
    //     Property memory property = idToProperty[propertyId];
    //     require(msg.value == DEPOSIT_REQUIRED, "deposit req");
    //     require(property.owner != msg.sender && property.owner != address(0), "!owned");

    //     bool isAlreadyRenter = false;
    //     for (uint i = 0; i < 3; i++) {
    //         if (propertyToRenters[propertyId][i] == msg.sender) {
    //             isAlreadyRenter = true;
    //             break;
    //         }
    //     }
    //     require(!isAlreadyRenter, "already a renter");

    //     bool availableRoom = checkSetRoomAvailability(propertyId);
    //     require(availableRoom, "no vacancy");

    //     for (uint256 i = 0; i < 3; i++) {
    //         if (propertyToRenters[propertyId][i] == address(0)) {
    //             propertyToRenters[propertyId][i] = msg.sender;
    //             break;
    //         }
    //     }
        
    //     for (uint256 i = 0; i < 3; i++) {            
    //         if (tennants[msg.sender][i] == 0) {
    //             _propertiesRented.increment();
    //             tennants[msg.sender][i] = propertyId;
    //             renterDepositBalance[msg.sender] += msg.value;
    //             totalDepositBal += msg.value;
    //             break;
    //         }
    //     }
    //     renterToPropertyPaymentTimestamps[msg.sender][propertyId] = block.timestamp;
    // }

    function setRentPrice(uint256 propertyId, uint256 rentPrice) external onlyGovtContract nonReentrant {        
        idToProperty[propertyId].rentPrice = rentPrice;
    }

    // this function resets the propertyToRenters mapping to 0
    function resetPropertyToRenters(uint256 propertyId, address sender) internal {
        for (uint256 i = 0; i < 3; i++) {
            if (propertyToRenters[propertyId][i] == sender) {
                propertyToRenters[propertyId][i] = address(0);
                break;
            }
        }
    }

    // function vacateProperty(uint256 propertyId) public nonReentrant {
    //     address sender = msg.sender;        
    //     vacateCommonTasks(propertyId, sender);        
    // }

    // function vacatePropertyAfterBuy(uint256 propertyId, address sender) internal {
    //     vacateCommonTasks(propertyId, sender);
    //     _relistCount.decrement();        
    // }

    function vacateCommonTasks(uint256 propertyId, address sender) public onlyGovtContract returns (bool) {
        for (uint256 i = 0; i < 3; i++) {
            if (tennants[sender][i] == propertyId) {                
                tennants[sender][i] = 0;
                // payable(sender).transfer(DEPOSIT_REQUIRED); //withdraw from contract
                // totalDepositBal -= DEPOSIT_REQUIRED;
                uint256 timestamp = renterToPropertyPaymentTimestamps[sender][propertyId];
                if (timestamp > 0) {
                    renterToPropertyPaymentTimestamps[sender][propertyId] = 0;
                }
                checkAndSetRoomStatus(propertyId);
                return true;                 
            } else {
                return false;
            }
        }
        resetPropertyToRenters(propertyId, sender);
    }

    function evictTennant(
        uint256 propertyId,
        address tennant
    ) public nonReentrant {
        require(idToProperty[propertyId].owner == msg.sender, "not owner");        
        for (uint256 i = 0; i < tennants[msg.sender].length; i++) {
            if (tennants[tennant][i] == propertyId) {
                tennants[tennant][i] = 0;
                checkAndSetRoomStatus(propertyId);
            }
        }        
        resetPropertyToRenters(propertyId, tennant);
    }

 

    // function collectRent() public nonReentrant {
    //     // Ensure there is rent to withdraw
    //     require(rentAccumulated[msg.sender] > 0, "rent = 0");

    //     uint256 rentToTransfer = (rentAccumulated[msg.sender] * 500) / 10000;
    //     payable(msg.sender).transfer(rentAccumulated[msg.sender] - rentToTransfer);
    //     rentAccumulated[msg.sender] = 0;
    // }

    function withdrawERC20(IERC20 token) public nonReentrant {
        //console.log('tokens: ',renterTokens[msg.sender]);
        require(renterTokens[msg.sender] > 0, "no tokens");
        token.transfer(msg.sender, renterTokens[msg.sender]);
        renterTokens[msg.sender] = 0;
    }

    function withdrawPropertyTax() external onlyGovt nonReentrant {
        require(address(this).balance > 0, "no tax");
        uint256 bal = address(this).balance;
        i_govt.transfer(bal);
    }

    function giftProperties(
        address nftContract,
        uint256 propertyId,
        address recipient
    ) public onlyGovt {
        Property storage property = idToProperty[propertyId];
        // require(property.owner == address(0), "already owned");

        property.owner = payable(recipient);
        property.isForSale = false;
        property.seller = payable(address(0));

        _propertiesSold.increment();
        require(_propertiesSold.current() <= 10, "");

        IERC721(nftContract).transferFrom(
            address(this),
            address(uint160(recipient)),
            propertyId
        );
    }
}
