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
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import {PropertyToken} from "./PropertyToken.sol";
import {RewardCalculator} from "./RewardCalculator.sol";
import "hardhat/console.sol";

error NotOwner();

contract PropertyMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    Counters.Counter private _propertyIds;
    Counters.Counter private _propertiesSold;

    Counters.Counter private _relistCount;
    Counters.Counter private _propertiesRented;
    Counters.Counter private _govtGiftCount;

    address payable immutable i_govt;
    uint256 public constant DEPOSIT_REQUIRED = 0.001 ether; //rent also
    uint256 public constant LISTING_PRICE = 0.001 ether;
    uint256 public constant INITIAL_SALE_PRICE = 0.001 ether;
    uint256 constant INITIAL_TOKEN_PRICE = 1 ether;
    uint256 constant INITIAL_EXCLUSIVE_PRICE = 1 ether;
    uint256 constant WEI_TO_ETH = 1000000000000000000;
    uint256 constant INITIAL_MINT = 1000000 ether;
    uint256 tokenMaxSupply = 10000000 ether;
    uint256 public totalDepositBal = 0;

    PropertyToken public tokenContractAddress;
 
    struct Sale {
        uint256 price;
        uint256 currency;
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
    }

    mapping(uint256 => address[3]) propertyToRenters;
    mapping(uint256 => Property) private idToProperty;
    mapping(address => uint256[3]) public tennants;
    mapping(address => uint256) public renterDepositBalance;
    mapping(address => uint256) public renterTokens;
    mapping(address => uint256) public rentAccumulated;
    mapping(address => mapping(uint256 => uint256)) renterToPropertyPaymentTimestamps;

    event RentPaid(
        address indexed tenant,
        uint256 blockTime,
        uint256 indexed propertyId
    );

    modifier onlyGovt() {
        require(i_govt == msg.sender, "only i_govt");
        _;
    }

    constructor() {
        i_govt = payable(msg.sender);          
    }

    receive() external payable {}

    function getContractBalance() public view onlyGovt returns (uint256) {
        return address(this).balance; //test
    }

    function getListingPrice() public view returns (uint256) {
        return LISTING_PRICE;
    }
 
    function getPropertiesForSale() public view returns (uint256) {
        return _propertyIds.current() - 50 - _propertiesSold.current();
    }

    function getPropertiesRented() public view returns (uint256) {
        return tennants[msg.sender][0];
    }

    function getPropertyRenters(
        uint256 propertyId
    ) public view returns (address[3] memory) {
        address[3] memory renterAddresses = propertyToRenters[propertyId];
        return renterAddresses;
    }

    function getTokenContractAddress() public view returns (PropertyToken) {
        return tokenContractAddress;
    }

    struct PropertyPayment {
        uint256 propertyId;
        address renter;
        uint256 timestamp;
    }

    function getPropertyPayments(
        uint256[] memory propertyIds
    ) public view returns (PropertyPayment[] memory) {
        PropertyPayment[] memory payments = new PropertyPayment[](
            propertyIds.length * 3
        );
        uint256 count = 0;

        for (uint256 i = 0; i < propertyIds.length; i++) {
            address[3] memory renters = propertyToRenters[propertyIds[i]];
            for (uint256 j = 0; j < 3; j++) {
                uint256 timestamp = renterToPropertyPaymentTimestamps[
                    renters[j]
                ][propertyIds[i]];
                if (timestamp > 0) {
                    payments[count] = PropertyPayment(
                        propertyIds[i],
                        renters[j],
                        timestamp
                    );
                    count++;
                }
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
        uint256 unsoldPropertyCount = propertyCount - _propertiesSold.current();
        uint256 startIndex = 20 * (page - 1);
        uint256 endIndex = startIndex + 20;
        if (endIndex > unsoldPropertyCount) {
            endIndex = unsoldPropertyCount;
        }

        Property[] memory propertiesForSale = new Property[](endIndex - startIndex);
        uint256 currentIndex = 0;
        uint256 currentId = propertyCount - unsoldPropertyCount + startIndex;

        while (currentIndex < (endIndex - startIndex) && currentId < _propertyIds.current()) {
            Property storage currentItem = idToProperty[currentId];
            if (currentItem.isForSale == true && currentItem.propertyId < 501) {
                propertiesForSale[currentIndex] = currentItem;
                currentIndex++;
            }
            currentId++;
        }

        return propertiesForSale;
    }

    function getTokensEarned() public view returns (uint256) {
        return renterTokens[msg.sender];
    }

    function getRentAccumulated() public view returns (uint256) {
        return rentAccumulated[msg.sender];
    }

    function getTotalDepositBal() public view returns (uint256) {
        return totalDepositBal;
    }

    function getPropertyDetails(
        uint256 propertyId
    ) public view returns (Property memory) {
        return idToProperty[propertyId];
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

    function checkGovtBalance() public view onlyGovt returns (uint256) {
        return address(this).balance - totalDepositBal;
    }

    function deployTokenContract() public onlyGovt {
        PropertyToken propertyToken = new PropertyToken(
            INITIAL_MINT,
            address(this)
        );
        tokenContractAddress = propertyToken;
    }

    function sellExclusiveProperty(
        address nftContract,
        uint256 tokenId,
        uint256 propertyId,
        uint256 tokenPrice
    ) public payable {
        if (idToProperty[propertyId].owner != msg.sender) {
            revert NotOwner();
        }

        require(propertyId >= 500);
        require(msg.value == LISTING_PRICE, "incorrect fee");
        Property storage property = idToProperty[propertyId];
        property.tokenSalePrice = tokenPrice * (1 ether);

        property.isForSale = true;
        property.seller = payable(msg.sender);

        _relistCount.increment();
        _propertiesSold.decrement();
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    }

    //user resell property
    function sellUserProperty(
        address nftContract,
        uint256 tokenId,
        uint256 propertyId,
        uint256 price,
        uint256 tokenPrice
    ) external payable nonReentrant {
        require(price > 0, "Price is 0");
        require(propertyId <= 500);

        Property storage property = idToProperty[propertyId];
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        require(property.owner == msg.sender, "not owner");
        require(price >= INITIAL_SALE_PRICE, "price too low");
        require(msg.value == LISTING_PRICE, "incorrect fee");

        require(!property.isForSale, "already for sale");
        require(property.salePrice != price, "price is same");

        property.salePrice = price;
        if (tokenPrice != 0) {
            property.tokenSalePrice = tokenPrice * (1 ether);
        } else {
            property.tokenSalePrice = 0;
        }

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
        require(property.seller == msg.sender, "not owner");

        require(property.isForSale, "unlisted property");

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
        uint256 listingCount = tokenIds.length;

        for (uint256 i = 0; i < listingCount; i++) {
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
        require(tempProperty.propertyId < 551, "invalid propertyid");
        uint256 price = tempProperty.salePrice;
        uint256 tokenId = tempProperty.tokenId;

        if (isPaymentTokensBool) {
            require(
                propertyTokenContractAddress == address(tokenContractAddress),
                "incorrect currency"
            );
            require(tempProperty.isForSale == true, "not for sale");
            require(tempProperty.tokenSalePrice != 0, "does not accept tokens");
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
                "transfer Failed"
            );
            tempProperty.saleHistory.push(
                Sale(tempProperty.tokenSalePrice, 2)
            );                   
        } else {
            if (itemId > 500) {
                require(itemId < 500, "only token purchase");
            }
            require(msg.value == price, "submit asking price");
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
        vacatePropertyAfterBuy(itemId, msg.sender);
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

    function rentProperty(uint256 propertyId) external payable nonReentrant {
        Property memory property = idToProperty[propertyId];
        require(msg.value == DEPOSIT_REQUIRED, "deposit required");
        require(property.owner != msg.sender && property.owner != address(0), "can't rent your own");

        bool isAlreadyRenter = false;
        for (uint i = 0; i < 3; i++) {
            if (propertyToRenters[propertyId][i] == msg.sender) {
                isAlreadyRenter = true;
                break;
            }
        }
        require(!isAlreadyRenter, "already a renter");

        bool availableRoom = checkSetRoomAvailability(propertyId);
        require(availableRoom, "no vacancy");

        for (uint256 i = 0; i < 3; i++) {
            if (propertyToRenters[propertyId][i] == address(0)) {
                propertyToRenters[propertyId][i] = msg.sender;
                break;
            }
        }
        
        for (uint256 i = 0; i < 3; i++) {            
            if (tennants[msg.sender][i] == 0) {
                _propertiesRented.increment();
                tennants[msg.sender][i] = propertyId;
                renterDepositBalance[msg.sender] += msg.value;
                totalDepositBal += msg.value;
                break;
            }
        }
        renterToPropertyPaymentTimestamps[msg.sender][propertyId] = block.timestamp;
    }

    function setRentPrice(
        uint256 propertyId,
        uint256 rentPrice
    ) public nonReentrant {        
        require(idToProperty[propertyId].owner == msg.sender, "not owner");
        require(rentPrice <= 500 ether, "rent > 500 matic");
        require(rentPrice >= DEPOSIT_REQUIRED, "rent < than 3 matic");
        idToProperty[propertyId].rentPrice = rentPrice;
    }

    function vacateProperty(uint256 propertyId) public nonReentrant {
        uint256 tenantLength = tennants[msg.sender].length;
        for (uint256 i = 0; i < tenantLength; i++) {
            if (tennants[msg.sender][i] == propertyId) {
                tennants[msg.sender][i] = 0;
                uint256 timestamp = renterToPropertyPaymentTimestamps[
                    msg.sender
                ][propertyId];
                if (timestamp > 0) {
                    renterToPropertyPaymentTimestamps[msg.sender][
                        propertyId
                    ] = 0;
                }
                checkAndSetRoomStatus(propertyId);
                payable(msg.sender).transfer(DEPOSIT_REQUIRED); //withdraw from contract
                totalDepositBal -= DEPOSIT_REQUIRED;
                break;
            }
        }

        for (uint256 i = 0; i < 3; i++) {
            if (propertyToRenters[propertyId][i] == msg.sender) {
                propertyToRenters[propertyId][i] = address(0);
                break;
            }
        }
    }

    function vacatePropertyAfterBuy(
        uint256 propertyId,
        address sender
    ) internal { 
        for (uint256 i = 0; i < 3; i++) {
            if (tennants[sender][i] == propertyId) {
                payable(sender).transfer(DEPOSIT_REQUIRED); //withdraw from contract
                totalDepositBal -= DEPOSIT_REQUIRED;
                tennants[sender][i] = 0;
                uint256 timestamp = renterToPropertyPaymentTimestamps[
                    msg.sender
                ][propertyId];
                if (timestamp > 0) {
                    renterToPropertyPaymentTimestamps[msg.sender][
                        propertyId
                    ] = 0;
                }
                checkAndSetRoomStatus(propertyId);
                _relistCount.decrement();
                break;
            }
        }
        for (uint256 i = 0; i < 3; i++) {
            if (propertyToRenters[propertyId][i] == sender) {
                propertyToRenters[propertyId][i] = address(0);
                break;
            }
        }
    }

    function evictTennant(
        uint256 propertyId,
        address tennant
    ) public nonReentrant {
        require(idToProperty[propertyId].owner == msg.sender, "not owner");
        uint256 tenantLength = tennants[msg.sender].length;
        for (uint256 i = 0; i < tenantLength; i++) {
            if (tennants[tennant][i] == propertyId) {
                tennants[tennant][i] = 0;
                checkAndSetRoomStatus(propertyId);
            }
        }        
        for (uint256 i = 0; i < 3; i++) {
            if (propertyToRenters[propertyId][i] == tennant) {
                propertyToRenters[propertyId][i] = address(0);
                break;
            }
        }
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

    function payRent(uint256 propertyId) external payable nonReentrant {
        require(
            msg.value == idToProperty[propertyId].rentPrice,
            "amount != rent"
        );

        uint256 rentTime = renterToPropertyPaymentTimestamps[msg.sender][
            propertyId
        ];

        require(
            (block.timestamp - rentTime) > 600, "can't pay rent more than once in 24hrs" //change this!!!!
        );

        bool isRenter = false;
        uint256 tenantLength = tennants[msg.sender].length;
        // console.log("tenantLength: ", tenantLength);
        for (uint256 i = 0; i < tenantLength; i++) {
            if (tennants[msg.sender][i] == propertyId) {
                isRenter = true;
            }
        }
        require(isRenter, "not tenant");

        rentAccumulated[idToProperty[propertyId].owner] += msg.value;
        idToProperty[propertyId].totalIncomeGenerated += msg.value;
        renterToPropertyPaymentTimestamps[msg.sender][propertyId] = block
            .timestamp;

        uint256 price;
        if (propertyId > 500) {
            price = idToProperty[propertyId].rentPrice * 3;
        } else {
            // uint256 count = 0;
            // for (uint256 i = 0; i < 3; i++) {
            //     if (tennants[msg.sender][i] != 0) {
            //         count++;
            //     }
            // }
            price = idToProperty[propertyId].rentPrice; //* (count + 1) * 12 / 10;
        }
        if (tokenMaxSupply > 0) {
            uint256 baseTokenAmount = RewardCalculator.getTokenAmountToReceive(price / WEI_TO_ETH);     
            // console.log('baseTokenAmount: ', baseTokenAmount);   
            // console.log(price/WEI_TO_ETH);
            uint256 diminishingSupplyFactor = (IERC20(tokenContractAddress)
            .balanceOf(address(this)) * 100) / tokenMaxSupply;
            if (diminishingSupplyFactor < 1) {
                diminishingSupplyFactor = 1;
            }
            // console.log('diminishingSupplyFactor: ', diminishingSupplyFactor);
            uint256 tokensToReceive = baseTokenAmount * diminishingSupplyFactor; 
            // console.log('tokensToReceive: ', tokensToReceive);
            if (tokensToReceive > tokenMaxSupply) {
                tokensToReceive = tokenMaxSupply;
            }
            renterTokens[msg.sender] += (tokensToReceive * (1 ether));
            tokenMaxSupply = tokenMaxSupply - tokensToReceive;
        }       
        emit RentPaid(msg.sender, block.timestamp, propertyId);
    }

    function collectRent() public nonReentrant {
        payable(msg.sender).transfer(
            rentAccumulated[msg.sender] -
                ((rentAccumulated[msg.sender] * 500) / 10000)
        );
        rentAccumulated[msg.sender] = 0;
    }

    function withdrawERC20(IERC20 token) public nonReentrant {
        //console.log('tokens: ',renterTokens[msg.sender]);
        require(renterTokens[msg.sender] > 0, "no tokens");
        token.transfer(msg.sender, renterTokens[msg.sender]);
        renterTokens[msg.sender] = 0;
    }

    function withdrawPropertyTax() external onlyGovt nonReentrant {
        require(address(this).balance > totalDepositBal, "no tax");
        uint256 bal = address(this).balance - totalDepositBal;
        i_govt.transfer(bal);
    }

    function giftProperties(
        address nftContract,
        uint256 propertyId,
        address recipient
    ) public onlyGovt {
        Property storage property = idToProperty[propertyId];
        require(property.owner == address(0), "already owned");

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
