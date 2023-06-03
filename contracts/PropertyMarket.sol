// SPDX-License-Identifier: MIT000000000000
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

    address payable govt;
    uint256 public depositRequired = 5 ether;    
    uint256 public listingPrice = 5 ether;
    uint256 public initialSalePrice = 100 ether;
    uint256 initialTokenPrice = 2000 ether;
    uint256 initialExclusivePrice = 1000 ether; //need function to sell tokens to other players    
    uint256 tokenMaxSupply = 10000000 ether;
    uint256 weiToEth = 1000000000000000000;
    uint256 public totalDepositBal = 0;    

    PropertyToken public tokenContractAddress;

    constructor() {
        govt = payable(msg.sender);
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
        uint256[] saleHistory;
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
    mapping(address => uint256[3]) public tennants; //can only rent from 3 properties.
    mapping(address => uint256) public renterDepositBalance;
    mapping(address => uint256) public renterTokens;
    mapping(address => uint256) public rentAccumulated;    
    mapping(address => mapping(uint256 => uint256)) renterToPropertyPaymentTimestamps; 

    function getContractBalance() public view onlyGovt returns (uint256) {
        return address(this).balance; //test
    }

    function getListingPrice() public view returns (uint256) {
        return listingPrice;
    }

    function getAllProperties() public view returns (uint256) {
        return _propertyIds.current();
    }

    function getPropertiesForSale() public view returns (uint256) {
        return _propertyIds.current() - 50 - _propertiesSold.current();
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

    function getTokenContractAddress() public view returns (PropertyToken) {
        return tokenContractAddress;
    }

    struct PropertyPayment {
        uint256 propertyId;
        address renter;
        uint256 timestamp;
    }
    function getPropertyPayments(uint256[] memory propertyIds) public view returns (PropertyPayment[] memory) {
        PropertyPayment[] memory payments = new PropertyPayment[](propertyIds.length * 3);
        uint256 count = 0;
        
        for (uint256 i = 0; i < propertyIds.length; i++) {
            address[3] memory renters = propertyToRenters[propertyIds[i]];
            for (uint256 j = 0; j < 3; j++) {
                uint256 timestamp = renterToPropertyPaymentTimestamps[renters[j]][propertyIds[i]];
                if (timestamp > 0) {
                    payments[count] = PropertyPayment(propertyIds[i], renters[j], timestamp);
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

    function getPropertyDetails(uint256 propertyId) public view returns (Property memory) {
        return idToProperty[propertyId];
    }

    function getPropertiesSold() external view returns (uint256){
        return _propertiesSold.current();
    }

    function getPropertyIds() external view returns (uint256) {
        return _propertyIds.current();
    }

    function getRelistCount() external view returns (uint256) {
        return _relistCount.current();
    }

    function getTenantProperties(address tenant) public view returns (uint256[3] memory) {
        return tennants[tenant];
    }

    modifier onlyGovt() {
        require(govt == msg.sender, "only govt");
        _;
    }

    function deployTokenContract() public onlyGovt {
        PropertyToken propertyToken = new PropertyToken(
            10000000 ether,
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
        require(
            idToProperty[propertyId].owner == msg.sender,
            "not owner"
        );
        require(propertyId >= 500);
        require(
            msg.value == listingPrice,
            "incorrect fee"
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
        
        require(price > 0, "Price != 0");
        require(propertyId <= 500);

        Property storage property = idToProperty[propertyId];
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        require(property.owner == msg.sender, "not owner");
        require(price >= initialSalePrice, "You can't sell lower than the default property price");
        require(msg.value == listingPrice, "incorrect fee");

        require(!property.isForSale, "already for sale");
        require(property.salePrice != price, "The sale price cannot be the same as the current price");

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
        require(property.seller == msg.sender, "you are not owner");
        
        require(property.isForSale, "unlisted property");

        property.isForSale = false;
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
            listing.rentPrice = depositRequired;
            listing.seller = payable(msg.sender);
            listing.owner = payable(address(0));
            listing.isForSale = true;
            listing.tokenSalePrice = initialTokenPrice;
            idToProperty[tokenIds[i]] = listing;
            if (tokenId > 500) {
                listing.isExclusive = true;
                //listing.salePrice = initialExclusivePrice;
            } else {
                listing.salePrice = initialSalePrice;
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
        uint256 price = idToProperty[itemId].salePrice;
        uint256 tokenId = idToProperty[itemId].tokenId;

        if (isPaymentTokensBool) {
            require(
                propertyTokenContractAddress == address(tokenContractAddress),
                "incorrect currency"
            );
            require (
                idToProperty[itemId].tokenSalePrice != 0, "does not accept tokens"
            );
            // require(
            //     msg.value == 5 ether, "must pay token purchase fee"
            // );
            IERC20 propertyToken = IERC20(propertyTokenContractAddress);
            if (_relistCount.current() > 1) {
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
            idToProperty[itemId].saleHistory.push(idToProperty[itemId].tokenSalePrice);
            idToProperty[itemId].dateSoldHistory.push(0);
            idToProperty[itemId].dateSoldHistoryBhb.push(block.timestamp);
        } else {
            if (itemId > 500) {
                require(itemId < 500, "only token purchase"); 
            }
            
            require(
                msg.value == price,
                "submit asking price"
            );
            idToProperty[itemId].saleHistory.push(price);
            idToProperty[itemId].dateSoldHistory.push(block.timestamp);
            idToProperty[itemId].dateSoldHistoryBhb.push(0);
        }        
        idToProperty[itemId].seller.transfer(
            msg.value - ((msg.value * 500) / 10000)
        ); //5% goes to govt
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToProperty[itemId].owner = payable(msg.sender);
        idToProperty[itemId].isForSale = false;
        idToProperty[itemId].seller = payable(address(0));
        _propertiesSold.increment();        
        vacatePropertyAfterBuy(itemId, msg.sender);
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

    function rentProperty(uint256 propertyId) payable external nonReentrant {    
        Property memory property = idToProperty[propertyId];
        require(msg.value == depositRequired, "deposit required");
        uint256 availableRoom = checkRoomAvailability(propertyId);
        require(availableRoom != 0, "no vacancy");         
        require(property.owner != msg.sender && property.owner != address(0), "you can't rent your own properties");
        for (uint i = 0; i < 3; i++) { 
            require(propertyToRenters[propertyId][i] != msg.sender, "can't rent more than 1 room on property");
            if (propertyToRenters[propertyId][i] == address(0)) {
                propertyToRenters[propertyId][i] = msg.sender;                  
                break;  
            }   
        }   
        for (uint i = 0; i < 3; i++) {         
            if (tennants[msg.sender][i] == 0) {
                _propertiesRented.increment();                                
                tennants[msg.sender][i] = propertyId;                              
                //tenantNotUpToDate[msg.sender][propertyId] = true;
                renterDepositBalance[msg.sender] += msg.value;                      
                renterDepositBalance[msg.sender] += msg.value;   
                totalDepositBal += msg.value;             

                if (availableRoom == 1) {
                    idToProperty[propertyId].roomOneRented = true;
                } else if (availableRoom == 2) {
                    idToProperty[propertyId].roomTwoRented = true;
                } else if (availableRoom == 3) {
                    idToProperty[propertyId].roomThreeRented = true;
                }                
                break;  
            }                  
        }
        renterToPropertyPaymentTimestamps[msg.sender][propertyId] = block.timestamp;
    }


    function setRentPrice(uint256 propertyId, uint256 rentPrice)
        public
        nonReentrant
    {
        require(
            idToProperty[propertyId].owner == msg.sender,
            "not owner"
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
            "not owner"
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
        uint256 rentTime = renterToPropertyPaymentTimestamps[msg.sender][propertyId];

        // require(            
        //     (block.timestamp - rentTime) > 86400, "can't pay rent more than once in 24hrs"
        // );
        
        bool isRenter = false;
        for (uint256 i = 0; i < 3; i++) {
            if (tennants[msg.sender][i] == propertyId) {
                isRenter = true;                
            }
        }
        require(
            isRenter,
            "not tenant"
        );
        
        rentAccumulated[idToProperty[propertyId].owner] += msg.value;
        idToProperty[propertyId].totalIncomeGenerated += msg.value;
        renterToPropertyPaymentTimestamps[msg.sender][propertyId] = block.timestamp;

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
            price = idToProperty[propertyId].rentPrice; //* (count + 1) * 12 / 10;
        }    

        uint256 baseTokenAmount = getTokenAmountToReceive(
            price / weiToEth
        );
        uint256 diminishingSupplyFactor = (IERC20(tokenContractAddress)
            .balanceOf(address(this)) * 100) / tokenMaxSupply;
        uint256 tokensToReceive = baseTokenAmount * diminishingSupplyFactor;
        renterTokens[msg.sender] += (tokensToReceive * (1 ether));

        tokenMaxSupply = tokenMaxSupply - tokensToReceive;        

        emit RentPaid(msg.sender, block.timestamp, propertyId);
    }

    event RentPaid(
        address indexed tenant,
        uint256 blockTime,
        uint256 indexed propertyId
    );


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
      

    function collectRent() public nonReentrant {  
        payable(msg.sender).transfer(
            rentAccumulated[msg.sender] -
                ((rentAccumulated[msg.sender] * 500) / 10000)
        );
        rentAccumulated[msg.sender] = 0;
    }

    function withdrawERC20(IERC20 token) public nonReentrant {
        require(renterTokens[msg.sender] != 0, "no tokens to withdraw");
        token.transfer(msg.sender, renterTokens[msg.sender]);
        renterTokens[msg.sender] = 0;
    }   

    
    function withdrawPropertyTax() external onlyGovt nonReentrant {
        uint256 bal = address(this).balance - totalDepositBal;
        govt.transfer(bal);
    }
    
    function giftProperties(address nftContract, uint256 propertyId, address recipient) public onlyGovt {
        Property storage property = idToProperty[propertyId];
        require(property.owner == address(0), "already owned");
        
        property.owner = payable(recipient);
        property.isForSale = false;
        property.seller = payable(address(0));
        
        _propertiesSold.increment();
        require(_propertiesSold.current() <= 10, "10 max");
        
        IERC721(nftContract).transferFrom(address(this), address(uint160(recipient)), propertyId);
    }   
}
