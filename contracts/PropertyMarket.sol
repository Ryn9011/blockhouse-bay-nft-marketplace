// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

import "hardhat/console.sol";

import "./PropertyToken.sol";

contract PropertyMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    using SafeMath for uint256;
    Counters.Counter private _propertyIds;
    Counters.Counter private _propertiesSold;
    //add counter for when user re lists property and use expand array size in fetch sold items
    Counters.Counter private _relistCount;
    Counters.Counter private _propertiesRented;
    Counters.Counter private _govtGiftCount;

    uint256 maxProperties = 1000;
    address payable govt;
    uint256 public depositRequired = 5 ether;
    uint256 public defaultRentPrice = 5 ether; //needed?
    uint256 public listingPrice = 5 ether;
    uint256 public initialSalePrice = 100 ether;
    uint256 initialTokenPrice = 2000 ether;
    uint256 initialExclusivePrice = 50000 ether; //need function to sell tokens to other players
    uint256 minSalePrice = 100 ether;
    uint256 tokenMaxSupply = 10000000 ether;
    uint256 weiToEth = 1000000000000000000;
    uint256 twoDaysSeconds = 172800;
    uint256 totalDepositBal = 0;

    PropertyToken public tokenContractAddress;

    constructor() {
        govt = payable(msg.sender);
    }

    struct User {
        address userAddress;
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
        uint256[] saleHistory; //goodidea?
        bool isForSale;
        bool roomOneRented;
        bool roomTwoRented;
        bool roomThreeRented;
        bool isExclusive;
        uint256 maxTennants; //needed?
    }

    mapping(uint256 => address[3]) propertyToRenters;

    mapping(uint256 => Property) private idToProperty;
    mapping(address => User) private users;
    // mapping(address => mapping(uint256 => Property)) public usersProperties;
    // mapping(address => uint256) usersPropertyCount;
    mapping(address => uint256[3]) public tennants; //can only rent from 3 properties.
    mapping(address => uint256) public renterDepositBalance;
    mapping(address => uint256) public renterTokens;
    mapping(address => uint256) public rentAccumulated;
    mapping(address => mapping(uint256 => uint256)) renterToPropertyPaymentTimestamps;


    // mapping(address => mapping(uint => uint)) public tenantNotUpToDate;
    //need function that iterates over a properties tenants to get seconds and perform check

    function getContractBalance() public view onlyGovt returns (uint256) {
        return address(this).balance; //test
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function getInitialSalePrice() public view returns (uint256) {
        return initialSalePrice;
    }

    function getAllProperties() public view returns (uint256) {
        return _propertyIds.current();
    }

    function getPropertiesForSale() public view returns (uint256) {
        return _propertyIds.current() - 50 - _propertiesSold.current();
    }

    function getPropertiesSold() public view returns (uint256) {
        return _propertiesSold.current();
    }

    function getPropertiesRented() public view returns (uint256) {
        return tennants[msg.sender][0];
    }

    function getPropertyRenters(uint256 propertyId)
        public
        view
        returns (address[3] memory)
    {
        address[3] memory renterAddresses = propertyToRenters[propertyId];
        return renterAddresses;
    }

    function getDefaultRentPrice() public view returns (uint256) {
        return defaultRentPrice;
    }

    function getOwner() public view returns (address) {
        return idToProperty[1].owner;
    }

    function getDeposit() public view returns (uint256) {
        return depositRequired;
    }

    function getTokenContractAddress() public view returns (PropertyToken) {
        return tokenContractAddress;
    }

    //???????????
    function getTokenContractTokenBalance() public view returns (uint256) {
        uint256 baseTokenAmount = getTokenAmountToReceive(
            idToProperty[1].rentPrice / weiToEth
        );
        uint256 diminishingSupplyFactor = (IERC20(tokenContractAddress)
            .balanceOf(address(this)) * 100) / tokenMaxSupply;
        return baseTokenAmount * diminishingSupplyFactor;
    }

    function getTokensEarned() public view returns (uint256) {
        return renterTokens[msg.sender];
    }

    function getRentAccumulated() public view returns (uint256) {
        return rentAccumulated[msg.sender];
    }

    modifier onlyGovt() {
        require(govt == msg.sender, "only govt can call this function");
        _;
    }

    function deployTokenContract() public onlyGovt {
        PropertyToken propertyToken = new PropertyToken(
            10000000 ether,
            address(this)
        );
        tokenContractAddress = propertyToken;
    }

    function setDeposit(uint256 amount) public onlyGovt {
        depositRequired = amount;
    }

    function sellExclusiveProperty(
        address nftContract,
        uint256 tokenId,
        uint256 propertyId,
        uint256 tokenPrice
    ) public payable {
        require(
            idToProperty[propertyId].owner == msg.sender,
            "you can only sell properties you own"
        );
        require(
            msg.value == listingPrice,
            "Please submit the exact listing fee to create a listing"
        );
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

        Property storage property = idToProperty[propertyId];
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        require(
            property.owner == msg.sender,
            "you can only sell properties you own"
        );

        require(
            price >= initialSalePrice,
            "You can't sell lower than the default property price"
        );        

        require(
            msg.value == listingPrice,
            "Please submit the exact listing fee to create a listing"
        );

        property.salePrice = price;
        property.tokenSalePrice = tokenPrice * (1 ether);
        property.saleHistory.push(price);

        property.isForSale = true;
        property.seller = payable(msg.sender);

        _relistCount.increment(); //try put this in sale method
        _propertiesSold.decrement();        
    }

    //user cancel property sale
    function cancelSale(
        address nftContract,
        uint256 tokenId,
        uint256 propertyId
    ) public nonReentrant {
        require(
            idToProperty[propertyId].seller == msg.sender,
            "you can only sell properties you own"
        );
        Property storage property = idToProperty[propertyId];
        property.isForSale = false;
        property.owner = payable(msg.sender);
        _propertiesSold.increment();
        _relistCount.decrement();
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
    }

    //initial sale from after mint
    function createPropertyListing(
        address nftContract,
        uint256[] memory tokenIds
    ) public payable onlyGovt nonReentrant {
        //require(msg.value == listingPrice, "Please submit the exact listing fee to create a listing");

        uint256 listingCount = tokenIds.length;

        for (uint256 i = 0; i < listingCount; i++) {
            uint256 tokenId = tokenIds[i];
            _propertyIds.increment();
            uint256 itemId = _propertyIds.current();
            Property storage listing = idToProperty[itemId];

            listing.propertyId = tokenIds[i];
            listing.nftContract = nftContract;
            listing.tokenId = tokenId;
            listing.rentPrice = defaultRentPrice;
            listing.seller = payable(msg.sender);
            listing.owner = payable(address(0));
            listing.isForSale = true;
            listing.tokenSalePrice = initialTokenPrice;
            idToProperty[tokenIds[i]] = listing;
            if (tokenId > 500) {
                listing.isExclusive = true;
                listing.salePrice = initialExclusivePrice;
            } else {
                listing.salePrice = initialSalePrice;
            }

            //payable(govt).transfer(listingPrice); //do this way elsewhere?

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
        uint256 price = idToProperty[itemId].salePrice;
        uint256 tokenId = idToProperty[itemId].tokenId;

        if (isPaymentTokensBool) {
            require(
                propertyTokenContractAddress == address(tokenContractAddress),
                "incorrect currency"
            );
            IERC20 propertyToken = IERC20(propertyTokenContractAddress);
            if (_relistCount.current() > 0) {
                _relistCount.decrement();
            }
            require(
                propertyToken.allowance(msg.sender, address(this)) >=
                    idToProperty[itemId].tokenSalePrice,
                Strings.toString(
                    propertyToken.allowance(msg.sender, address(this))
                )
            );
            require(
                propertyToken.transferFrom(
                    msg.sender,
                    idToProperty[itemId].seller,
                    idToProperty[itemId].tokenSalePrice
                ),
                "transfer Failed"
            );
        } else {
            require(
                msg.value == price,
                "Please submit the asking price to complete the purchase"
            );
        }

        idToProperty[itemId].seller.transfer(
            msg.value - ((msg.value * 500) / 10000)
        ); //5% goes to govt
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToProperty[itemId].owner = payable(msg.sender);
        idToProperty[itemId].isForSale = false;
        idToProperty[itemId].seller = payable(address(0));
        _propertiesSold.increment();
        //if buying a property you rent from, need to be removed as renter
        vacatePropertyAfterBuy(itemId, msg.sender);
    }

    function fetchAllProperties(uint256 page)
        public
        view
        returns (Property[] memory)
    {
        uint256 startIndex = 20 * (page - 1);
        uint256 endIndex = startIndex + 20;

        uint256 actualEndIndex = endIndex;
        uint256 propertyCount = _propertyIds.current() - 50;
        if (actualEndIndex > propertyCount) {
            actualEndIndex = propertyCount;
        }

        Property[] memory allProperties = new Property[](actualEndIndex - startIndex);
        uint256 currentIndex = 0;
        for (uint256 i = startIndex; i < actualEndIndex; i++) {
            uint256 currentId = i + 1;
            Property storage currentItem = idToProperty[currentId];
            allProperties[currentIndex] = currentItem;
            currentIndex++;
        }
        return allProperties;
    }


    function fetchExclusiveProperties()
        public
        view
        returns (Property[] memory)
    {
        uint256 currentId = 501;
        uint256 currentIndex = 0;

        Property[] memory allProperties = new Property[](50);
        for (uint256 i = 0; i < 50; i++) {
            Property storage currentItem = idToProperty[currentId];
            allProperties[currentIndex] = currentItem;
            currentIndex += 1;
            currentId += 1;
        }
        return allProperties;
    }

    function fetchPropertiesForSale(uint256 page)
        public
        view
        returns (Property[] memory)
    {
        uint256 propertyCount = _propertyIds.current() - 50;
        uint256 unsoldPropertyCount = (_propertyIds.current() - 50) -
            _propertiesSold.current();
        uint256 startIndex = 20 * (page - 1);
        uint256 endIndex = startIndex + 20;
        if (endIndex > unsoldPropertyCount) {
            endIndex = unsoldPropertyCount;
        }

        Property[] memory propertiesForSale = new Property[](
            endIndex - startIndex
        );
        uint256 currentIndex = 0;
        for (uint256 i = 0; i < propertyCount; i++) {
            if (
                idToProperty[i + 1].isForSale == true &&
                idToProperty[i].propertyId < 501
            ) {
                uint256 currentId = i + 1;
                Property storage currentItem = idToProperty[currentId];
                if (currentIndex >= startIndex && currentIndex < endIndex) {
                    propertiesForSale[currentIndex - startIndex] = currentItem;
                }
                currentIndex++;
            }
            if (currentIndex >= endIndex) {
                break;
            }
        }
        return propertiesForSale;
    }


    function fetchPropertiesSold(bool onlyRentable) public view returns (Property[] memory) {
        uint256 propertyCount = _propertyIds.current();
        uint256 currentIndex = 0;

        Property[] memory propertiesSold = new Property[](
            _relistCount.current() + _propertiesSold.current()
        );
        
        for (uint256 i = 0; i < propertyCount; i++) {
            if (idToProperty[i + 1].owner != address(0)) {                              
                if (onlyRentable) {
                    if (idToProperty[i + 1].roomOneRented == false
                        || idToProperty[i + 1].roomTwoRented == false
                        || idToProperty[i + 1].roomThreeRented == false) {
                            uint256 currentId = i + 1;
                            Property storage currentItem = idToProperty[currentId];
                            propertiesSold[currentIndex] = currentItem;
                            currentIndex += 1;
                    } 
                } else {
                    uint256 currentId = i + 1;
                    Property storage currentItem = idToProperty[currentId];
                    propertiesSold[currentIndex] = currentItem;
                    currentIndex += 1;
                }
                                             
            }
        }
        return propertiesSold;
    }

    function fetchMyProperties() public view returns (Property[] memory) {
        uint256 totalItemCount = _propertyIds.current();
        uint256 itemCount = 0;
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (idToProperty[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        Property[] memory items = new Property[](itemCount);
        for (uint256 i = 0; i < totalItemCount; i++) {
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
        uint256 totalItemCount = _relistCount.current() + _propertiesSold.current();
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

    function checkRoomAvailability(uint256 propertyId)
        private
        view
        returns (uint256)
    {
        Property memory property = idToProperty[propertyId];
        if (property.roomOneRented == false) {
            return 1;
        } else if (property.roomTwoRented == false) {
            return 2;
        } else if (property.roomThreeRented == false) {
            return 3;
        } else {
            return 0;
        }
    }

function rentProperty(uint256 propertyId) external payable nonReentrant {
    require(
        msg.value == depositRequired,
        "the deposit needs to be paid to rent this property"
    );
    require(
        checkRoomAvailability(propertyId) != 0,
        "no rooms available to rent for this property"
    );
    require(
        idToProperty[propertyId].owner != msg.sender,
        "you can't rent your own properties"
    );

    bool propertyRented = false;
    for (uint256 i = 0; i < 3; i++) {
        if (propertyToRenters[propertyId][i] == address(0)) {
            if (tennants[msg.sender][i] == 0) {
                propertyToRenters[propertyId][i] = msg.sender;
                uint256 timestamp = renterToPropertyPaymentTimestamps[msg.sender][propertyId];
                if (timestamp > 0) {
                    renterToPropertyPaymentTimestamps[msg.sender][propertyId] = 0;
                }
                tennants[msg.sender][i] = propertyId;
                renterDepositBalance[msg.sender] = renterDepositBalance[msg.sender].add(msg.value);
                totalDepositBal = totalDepositBal.add(msg.value);

                if (i == 0) {
                    idToProperty[propertyId].roomOneRented = true;
                } else if (i == 1) {
                    idToProperty[propertyId].roomTwoRented = true;
                } else if (i == 2) {
                    idToProperty[propertyId].roomThreeRented = true;
                }
                propertyRented = true;
                _propertiesRented.increment();
                break;
            }
        } else if (propertyToRenters[propertyId][i] == msg.sender) {
            revert("can't rent more than 1 room on property");
        }
    }

    require(propertyRented, "can't rent more than 3 properties at a time");
}


    function setRentPrice(uint256 propertyId, uint256 rentPrice)
        public
        nonReentrant
    {
        require(
            idToProperty[propertyId].owner == msg.sender,
            "rent can only be set on properties you own"
        );
        Property storage property = idToProperty[propertyId];
        property.rentPrice = rentPrice;
    }

    function vacateProperty(uint256 propertyId) public nonReentrant {
        for (uint256 i = 0; i < 3; i++) {
            if (tennants[msg.sender][i] == propertyId) {
                tennants[msg.sender][i] = 0;
                uint256 timestamp = renterToPropertyPaymentTimestamps[msg.sender][propertyId];
                if (timestamp > 0) {
                    renterToPropertyPaymentTimestamps[msg.sender][propertyId] = 0;
                }
                if (idToProperty[propertyId].roomOneRented == true) {
                    idToProperty[propertyId].roomOneRented = false;
                } else if (idToProperty[propertyId].roomTwoRented == true) {
                    idToProperty[propertyId].roomTwoRented = false;
                } else if (idToProperty[propertyId].roomThreeRented == true) {
                    idToProperty[propertyId].roomThreeRented = false;
                }
                payable(msg.sender).transfer(depositRequired); //withdraw from contract
                totalDepositBal -= depositRequired;                
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

    function vacatePropertyAfterBuy(uint256 propertyId, address sender)
        internal
    {
        for (uint256 i = 0; i < 3; i++) {
            if (tennants[sender][i] == propertyId) {
                payable(sender).transfer(depositRequired); //withdraw from contract
                totalDepositBal -= depositRequired;
                tennants[sender][i] = 0;
                uint256 timestamp = renterToPropertyPaymentTimestamps[msg.sender][propertyId];
                if (timestamp > 0) {
                    renterToPropertyPaymentTimestamps[msg.sender][propertyId] = 0;
                }
                if (idToProperty[propertyId].roomOneRented == true) {
                    idToProperty[propertyId].roomOneRented = false;
                } else if (idToProperty[propertyId].roomTwoRented == true) {
                    idToProperty[propertyId].roomTwoRented = false;
                } else if (idToProperty[propertyId].roomThreeRented == true) {
                    idToProperty[propertyId].roomThreeRented = false;
                }
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

    function evictTennant(uint256 propertyId, address tennant)
        public
        nonReentrant
    {
        require(
            idToProperty[propertyId].owner == msg.sender,
            "can only evict on properties you own"
        );
        for (uint256 i = 0; i < 3; i++) {
            if (tennants[tennant][i] == propertyId) {
                tennants[tennant][i] = 0;
                if (idToProperty[propertyId].roomOneRented == true) {
                    idToProperty[propertyId].roomOneRented = false;
                } else if (idToProperty[propertyId].roomTwoRented == true) {
                    idToProperty[propertyId].roomTwoRented = false;
                } else if (idToProperty[propertyId].roomThreeRented == true) {
                    idToProperty[propertyId].roomThreeRented = false;
                }
            }
        }
        for (uint256 i = 0; i < 3; i++) {
            if (propertyToRenters[propertyId][i] == tennant) {
                propertyToRenters[propertyId][i] = address(0);
                break;
            }
        }
    }

    function payRent(uint256 propertyId) external payable nonReentrant {
        require(
            msg.value == idToProperty[propertyId].rentPrice,
            "The amount sent must equal the rent amount for this property"
        );
        bool isRenter = false;
        for (uint256 i = 0; i < 3; i++) {
            if (tennants[msg.sender][i] == propertyId) {
                isRenter = true;
                renterToPropertyPaymentTimestamps[msg.sender][i] = block.timestamp;
            }
        }
        require(
            isRenter,
            "You must be a tennant for this property to pay rent and earn tokens"
        );
        
        rentAccumulated[idToProperty[propertyId].owner] += msg.value;
        

        uint256 price;
        if (propertyId > 500) {
            price = idToProperty[propertyId].rentPrice * 3;
        } else {
            uint256 count = 0;
            for (uint256 i = 0; i < 3; i++) {
                if (tennants[msg.sender][i] != 0) {
                    count++;
                }
            }
            price = idToProperty[propertyId].rentPrice * (count + 1) * 12 / 10;
        }    

        uint256 baseTokenAmount = getTokenAmountToReceive(
            idToProperty[propertyId].rentPrice / weiToEth
        );
        uint256 diminishingSupplyFactor = (IERC20(tokenContractAddress)
            .balanceOf(address(this)) * 100) / tokenMaxSupply;
        uint256 tokensToReceive = baseTokenAmount * diminishingSupplyFactor;
        renterTokens[msg.sender] += (tokensToReceive * (1 ether)); //test this!!

        tokenMaxSupply = tokenMaxSupply - tokensToReceive;        

        emit RentPaid(msg.sender, block.timestamp, propertyId);
    }

    event RentPaid(
        address indexed tenant,
        uint256 blockTime,
        uint256 indexed propertyId
    );

    function collectRent() public {
        //does this work. see lottery example
        payable(msg.sender).transfer(
            rentAccumulated[msg.sender] -
                ((rentAccumulated[msg.sender] * 500) / 10000)
        ); //-5% govt tax
        rentAccumulated[msg.sender] = 0;
    }

    function withdrawERC20(IERC20 token) public nonReentrant {
        require(renterTokens[msg.sender] != 0, "no tokens to withdraw");
        token.transfer(msg.sender, renterTokens[msg.sender]);
        renterTokens[msg.sender] = 0;
    }

    function getTokenAmountToReceive(uint256 rent)
        public
        pure
        returns (uint256)
    {
        if (rent >= 5 && rent < 20) {
            return ((rent * uint256(7500)) / uint256(10000));
        }
        if (rent >= 20 && rent < 30) {
            return ((rent * 7600) / 10000);
        }
        if (rent >= 30 && rent < 40) {
            return ((rent * 7700) / 10000);
        }
        if (rent >= 40 && rent < 50) {
            return ((rent * 7800) / 10000);
        }
        if (rent >= 50 && rent < 60) {
            return ((rent * 7900) / 10000);
        }
        if (rent >= 60 && rent < 70) {
            return ((rent * 8000) / 10000);
        }
        if (rent >= 70 && rent < 80) {
            return ((rent * 8100) / 10000);
        }
        if (rent >= 80 && rent < 90) {
            return ((rent * 8200) / 10000);
        }
        if (rent >= 90 && rent < 100) {
            return ((rent * 8400) / 10000);
        }
        if (rent > 100) {
            return ((rent * 8500) / 10000);
        }
        return 0;
    }

    function setDefaultSalePrice() public onlyGovt {} //needed?

    function withdrawPropertyTax() external onlyGovt nonReentrant {
        // this needs to withdraw total bal - deposits
        // the way this will need to work is when depsoit is paid, it will add to a total deposit amount for contract
        // then dedutcted from when a user vacates.

        uint256 bal = address(this).balance - totalDepositBal;
        govt.transfer(bal);
    }

    //allows govt to gift up to 10 properties to early adopters
    function giftProperties (address nftContract, uint256 propertyId, address recipient) public onlyGovt {
        require (
            idToProperty[propertyId].owner == address(0) &&
            _govtGiftCount.current() < 10, "can't gift this property"
        );
        _govtGiftCount.increment();
        idToProperty[propertyId].owner = payable(recipient);

        IERC721(nftContract).transferFrom(address(this), recipient, propertyId);
        idToProperty[propertyId].owner = payable(msg.sender);
        idToProperty[propertyId].isForSale = false;
        idToProperty[propertyId].seller = payable(address(0));
        _propertiesSold.increment();
    }
}
