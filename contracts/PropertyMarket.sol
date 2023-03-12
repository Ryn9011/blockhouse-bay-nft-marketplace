// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "hardhat/console.sol";

import "./PropertyToken.sol";

contract PropertyMarket is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _propertyIds;
    Counters.Counter private _propertiesSold;
    //add counter for when user re lists property and use expand array size in fetch sold items
    Counters.Counter private _relistCount;
    Counters.Counter private _propertiesRented;

    uint256 maxProperties = 1000;
    address payable govt;    
    uint256 public depositRequired = 5 ether;
    uint256 public defaultRentPrice = 5 ether; //needed?
    uint256 public listingPrice = 5 ether;
    uint256 public initialSalePrice = 100 ether;  
    uint256 initialTokenPrice = 2000 ether;
    uint256 initalExclusivePrice = 50000 ether; //need function to sell tokens to other players
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
        uint propertyId;
        address nftContract;
        uint256 tokenId;
        address payable seller;
        address payable owner;
        uint256 salePrice;
        uint256 tokenSalePrice;
        uint256 rentPrice;
        uint256 soldFor; //goodidea?
        bool isForSale;              
        bool roomOneRented;
        bool roomTwoRented;
        bool roomThreeRented;  
        bool isExclusive;    
        uint256 maxTennants;   //needed?               
    }

    mapping(uint256 => address[3]) propertyToRenters;

    mapping(uint256 => Property) private idToProperty;
    mapping(address => User) private users;
    // mapping(address => mapping(uint256 => Property)) public usersProperties;
    // mapping(address => uint256) usersPropertyCount;
    mapping(address => uint[3]) public tennants; //can only rent from 3 properties.
    mapping(address => uint256) public renterDepositBalance;
    mapping(address => uint256) public renterTokens; 
    mapping(address => uint256) public rentAccumulated;
   // mapping(address => mapping(uint => uint)) public tenantNotUpToDate;
    //need function that iterates over a properties tenants to get seconds and perform check 


    function getContractBalance() public view onlyGovt returns(uint256) {
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
        return _propertyIds.current() - _propertiesSold.current();
    }

    function getPropertiesSold() public view returns (uint256) {
        return _propertiesSold.current();
    }

    function getPropertiesRented() public view returns (uint) {
        return tennants[msg.sender][0];
    }

    function getPropertyRenters(uint256 propertyId) public view returns (address[3] memory) {
        address[3] memory renterAddresses = propertyToRenters[propertyId];
        return renterAddresses;
    }

    function getDefaultRentPrice() public view returns (uint) {
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
        uint256 baseTokenAmount = getTokenAmountToReceive(idToProperty[1].rentPrice / weiToEth);                 
        uint256 diminishingSupplyFactor = IERC20(tokenContractAddress).balanceOf(address(this)) * 100 / tokenMaxSupply; 
        return baseTokenAmount * diminishingSupplyFactor;   
    }    

    function getTokensEarned() public view returns (uint256) {
        return renterTokens[msg.sender];
    }

    function getRentAccumulated() public view returns(uint256) {
        return rentAccumulated[msg.sender];
    }

    modifier onlyGovt() {
        require(govt == msg.sender, "only govt can call this function");
        _;
    }

    function deployTokenContract() public onlyGovt {
        PropertyToken propertyToken = new PropertyToken(10000000 ether, address(this));
        tokenContractAddress = propertyToken;
    }

    function setDeposit(uint amount) public onlyGovt {
        depositRequired = amount;
    }

    function sellExclusiveProperty(address nftContract, uint256 tokenId, uint256 propertyId, uint256 tokenPrice) public payable {
        require(idToProperty[propertyId].owner == msg.sender, "you can only sell properties you own"); 
        require(msg.value == listingPrice, "Please submit the exact listing fee to create a listing");   
        Property storage property = idToProperty[propertyId]; 
        property.tokenSalePrice = tokenPrice * (1 ether);       
                                                            
        property.isForSale = true;
        property.seller = payable(msg.sender);       
        
        _relistCount.increment();
        _propertiesSold.decrement();
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);             
    }

    //user resell property
    function sellUserProperty(address nftContract, uint256 tokenId, uint256 propertyId, uint256 price, uint256 tokenPrice) external payable nonReentrant{
        require(idToProperty[propertyId].owner == msg.sender, "you can only sell properties you own"); 

        Property storage property = idToProperty[propertyId]; 
   
        require(price >= initialSalePrice, "You can't sell lower than the default property price");
        property.salePrice = price;  
        property.tokenSalePrice = tokenPrice * (1 ether);       
        
        require(msg.value == listingPrice, "Please submit the exact listing fee to create a listing");                                       
        
        property.isForSale = true;
        property.seller = payable(msg.sender);       
        
        _relistCount.increment();//try put this in sale method
        _propertiesSold.decrement();
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);
    }
   
    //user cancel property sale
    function cancelSale(address nftContract, uint256 tokenId, uint256 propertyId) public nonReentrant {
        require(idToProperty[propertyId].seller == msg.sender, "you can only sell properties you own");
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
            
            listing.propertyId = itemId;
            listing.nftContract = nftContract;
            listing.tokenId = tokenId;
            listing.salePrice = initialSalePrice;
            listing.rentPrice = defaultRentPrice;
            listing.seller = payable(msg.sender);
            listing.owner = payable(address(0));
            listing.isForSale = true;  
            listing.tokenSalePrice = initialTokenPrice;
            idToProperty[itemId] = listing;        

            //payable(govt).transfer(listingPrice); //do this way elsewhere?
                                
            IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);   
        }     
    }    

    function createPropertySale(
        address nftContract,
        uint256 itemId,
        address propertyTokenContractAddress,
        bool isPaymentTokensBool
        ) public payable nonReentrant {
        uint price = idToProperty[itemId].salePrice;
        uint tokenId = idToProperty[itemId].tokenId;
              
        if (isPaymentTokensBool) {
            require (propertyTokenContractAddress == address(tokenContractAddress),"incorrect currency");
            IERC20 propertyToken = IERC20(propertyTokenContractAddress);               
            if (_relistCount.current() > 0) {
                _relistCount.decrement(); 
            }           
            require(propertyToken.allowance(msg.sender, address(this)) >= idToProperty[itemId].tokenSalePrice, Strings.toString(propertyToken.allowance(msg.sender, address(this))));
            require(propertyToken.transferFrom(msg.sender, idToProperty[itemId].seller, idToProperty[itemId].tokenSalePrice),"transfer Failed");
        } else {
            require(msg.value == price, "Please submit the asking price to complete the purchase");
        }

        idToProperty[itemId].seller.transfer(msg.value - (msg.value * 500 / 10000)); //5% goes to govt
        IERC721(nftContract).transferFrom(address(this), msg.sender, tokenId);
        idToProperty[itemId].owner = payable(msg.sender);
        idToProperty[itemId].isForSale = false;
        idToProperty[itemId].seller = payable(address(0));
        _propertiesSold.increment();       
        //if buying a property you rent from, need to be removed as renter
        vacatePropertyAfterBuy(itemId, msg.sender);
    }

    function fetchAllProperties() public view returns (Property[] memory) {
        uint propertyCount = _propertyIds.current();
        uint currentIndex = 0;

        Property[] memory allProperties = new Property[](propertyCount);
        for (uint i = 0;  i < propertyCount; i++) { 
            uint currentId = i + 1;
            Property storage currentItem = idToProperty[currentId];
            allProperties[currentIndex] = currentItem;
            currentIndex += 1;
        }
        return allProperties;
    }

    function fetchPropertiesForSale() public view returns (Property[] memory) {                
        uint propertyCount = _propertyIds.current();
        uint unsoldPropertyCount = _propertyIds.current() - _propertiesSold.current();
        uint currentIndex = 0;

        Property[] memory propertiesForSale = new Property[](unsoldPropertyCount);
        for (uint i = 0;  i < propertyCount; i++) { 
            if (idToProperty[i + 1].isForSale == true) {
                uint currentId = i + 1;
                Property storage currentItem = idToProperty[currentId];
                propertiesForSale[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return propertiesForSale;
    }

    function fetchPropertiesSold() public view returns (Property[] memory) {                        
        uint propertyCount = _propertyIds.current();        
        uint currentIndex = 0; 

        Property[] memory propertiesSold = new Property[](_relistCount.current() + _propertiesSold.current());
        for (uint i = 0;  i < propertyCount; i++) {            
            if (idToProperty[i + 1].owner != address(0)) {
                uint currentId = i + 1;
                Property storage currentItem = idToProperty[currentId];
                propertiesSold[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return propertiesSold;
    }

    function fetchMyProperties() public view returns (Property[] memory) {
        uint totalItemCount = _propertyIds.current();
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (idToProperty[i + 1].owner == msg.sender) {
                itemCount += 1;
            }
        }

        Property[] memory items = new Property[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (idToProperty[i + 1].owner == msg.sender) {
                uint currentId = i + 1;
                Property storage currentItem = idToProperty[currentId];
                items[currentIndex] = currentItem;
                currentIndex += 1;
            }
        }
        return items;
    } 

    function fetchMyRentals() public view returns (Property[] memory) {
        uint totalItemCount = _relistCount.current() + _propertiesSold.current(); // test this
        uint itemCount = 0;
        uint currentIndex = 0;

        for (uint i = 0; i < totalItemCount; i++) {
            if (tennants[msg.sender][i] == i+1) {
                itemCount+=1;
            }
        }        

        Property[] memory rentals = new Property[](itemCount);
        for (uint i = 0; i < totalItemCount; i++) {
            if (tennants[msg.sender][i] != 0) {
                uint256 idToGet = tennants[msg.sender][i];
                Property storage currentItem = idToProperty[idToGet];
                rentals[currentIndex] = currentItem;
                currentIndex+=1;
            }
        }
        return rentals;
    }

    function checkRoomAvailability(uint256 propertyId) private view returns (uint256) {
        Property memory property = idToProperty[propertyId];
        if (property.roomOneRented == false) {            
            return 1;            
        }
        else if (property.roomTwoRented == false) {
            return 2;
        }
        else if (property.roomThreeRented == false) {
            return 3;
        }
        else {
            return 0;
        }    
    }

    function rentProperty(uint256 propertyId) payable external nonReentrant {          
        require(msg.value == depositRequired, "the deposit needs to be paid to rent this property");
        uint256 availableRoom = checkRoomAvailability(propertyId);
        require(availableRoom != 0, "no rooms availble to rent for this property");
        //require(propertyToRenters[propertyId][propertyId] != msg.sender, "can't rent multiple rooms on same property");  
        require(idToProperty[propertyId].owner != msg.sender, "you can't rent your own properties");
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
      
    }

    //rent is paid and block.timestamp + days is set 
    //check: if set amount of seconds is < than current block.timestamp then tenant is not up to date
    //where are seconds stored?

    function setRentPrice(uint256 propertyId, uint256 rentPrice) public nonReentrant {
        require(idToProperty[propertyId].owner == msg.sender, "rent can only be set on properties you own");
        Property storage property = idToProperty[propertyId];
        property.rentPrice = rentPrice;
    }

    function vacateProperty(uint256 propertyId) public nonReentrant {
        for (uint i = 0; i < 3; i++) {
            if (tennants[msg.sender][i] == propertyId) {
                tennants[msg.sender][i] = 0;
                // if (propertyToRenters[propertyId][i] == msg.sender) {
                //     propertyToRenters[propertyId][i] = address(0);    
                // }  
                if (idToProperty[propertyId].roomOneRented == true) {            
                    idToProperty[propertyId].roomOneRented = false;
                }
                else if (idToProperty[propertyId].roomTwoRented == true) {
                    idToProperty[propertyId].roomTwoRented = false;
                }
                else if (idToProperty[propertyId].roomThreeRented == true) {
                    idToProperty[propertyId].roomThreeRented = false;
                }
                payable(msg.sender).transfer(depositRequired); //withdraw from contract
                totalDepositBal -= depositRequired;
                //emit RefundDeposit(msg.sender);
                break;
            }
        }
        for (uint i = 0; i < 3; i++) { 
            if (propertyToRenters[propertyId][i] == msg.sender) {
                propertyToRenters[propertyId][i] = address(0);  
                break;  
            }   
        }  
    }

    function vacatePropertyAfterBuy(uint256 propertyId, address sender) internal {
        for (uint i = 0; i < 3; i++) {
            if (tennants[sender][i] == propertyId) {
                payable(sender).transfer(depositRequired); //withdraw from contract
                totalDepositBal -= depositRequired;
                tennants[sender][i] = 0;
                // if (propertyToRenters[propertyId][i] == sender) {
                //     propertyToRenters[propertyId][i] = address(0);    
                // }  
                if (idToProperty[propertyId].roomOneRented == true) {            
                    idToProperty[propertyId].roomOneRented = false;
                }
                else if (idToProperty[propertyId].roomTwoRented == true) {
                    idToProperty[propertyId].roomTwoRented = false;
                }
                else if (idToProperty[propertyId].roomThreeRented == true) {
                    idToProperty[propertyId].roomThreeRented = false;
                }
                _relistCount.decrement();                            
                break;
            }
        }
        for (uint i = 0; i < 3; i++) { 
            if (propertyToRenters[propertyId][i] == sender) {
                propertyToRenters[propertyId][i] = address(0);  
                break;  
            }   
        }  
    }

    function evictTennant(uint256 propertyId, address tennant) public nonReentrant {
        require(idToProperty[propertyId].owner == msg.sender, "can only evict on properties you own");
        for (uint i = 0; i < 3; i++) {
            if (tennants[tennant][i] == propertyId) {
                tennants[tennant][i] = 0;               
                 if (idToProperty[propertyId].roomOneRented == true) {            
                    idToProperty[propertyId].roomOneRented = false;
                }
                else if (idToProperty[propertyId].roomTwoRented == true) {
                    idToProperty[propertyId].roomTwoRented = false;
                }
                else if (idToProperty[propertyId].roomThreeRented == true) {
                    idToProperty[propertyId].roomThreeRented = false;
                }
            }
        }
        for (uint i = 0; i < 3; i++) { 
            if (propertyToRenters[propertyId][i] == tennant) {
                propertyToRenters[propertyId][i] = address(0);  
                break;  
            }   
        }  
    }

    function payRent(uint256 propertyId) external payable nonReentrant {
        require(msg.value == idToProperty[propertyId].rentPrice, "The amount sent must equal the rent amount for this property");
        bool isRenter = false;
        for (uint i = 0; i < 3; i++) { 
            if (tennants[msg.sender][i] == propertyId) {
                isRenter = true;                
            }
        }
        require(isRenter, "You must be a tennant for this property to pay rent and earn tokens");        
        //idToProperty[propertyId].owner.transfer(msg.value - (msg.value * 9500 / 10000)); //-5% govt tax
        rentAccumulated[idToProperty[propertyId].owner] += msg.value;
        //check this is paid to contract

        uint256 baseTokenAmount = getTokenAmountToReceive(idToProperty[propertyId].rentPrice / weiToEth);                 
        uint256 diminishingSupplyFactor = IERC20(tokenContractAddress).balanceOf(address(this)) * 100 / tokenMaxSupply; 
        uint256 tokensToReceive = baseTokenAmount * diminishingSupplyFactor;
        renterTokens[msg.sender] += (tokensToReceive * (1 ether)); //test this!!
        
        tokenMaxSupply = tokenMaxSupply - tokensToReceive;
        emit RentPaid(msg.sender, block.timestamp, propertyId);
    }
    event RentPaid(address indexed tenant, uint256 blockTime, uint256 indexed propertyId);

    function collectRent() public {
        //does this work. see lottery example
        payable(msg.sender).transfer(rentAccumulated[msg.sender] - (rentAccumulated[msg.sender] * 500 / 10000)); //-5% govt tax
        rentAccumulated[msg.sender] = 0;
    }

    function withdrawERC20(IERC20 token) public nonReentrant {
        require(renterTokens[msg.sender] != 0, "no tokens to withdraw");
        token.transfer(msg.sender, renterTokens[msg.sender]);        
        renterTokens[msg.sender] = 0;
    }    

    function getTokenAmountToReceive(uint256 rent) public pure returns (uint256) {
        
        if (rent >= 5 && rent < 20) {
            return (rent * uint256(7500) / uint256(10000));
        } 
        if (rent >= 20 && rent < 30) {
            return (rent * 7600 / 10000);
        }   
        if (rent >= 30 && rent < 40) {
            return (rent * 7700 / 10000);
        }
        if (rent >= 40 && rent < 50) {
            return (rent * 7800 / 10000);
        }
        if (rent >= 50 && rent < 60) {
            return (rent * 7900 / 10000);
        } 
        if (rent >= 60 && rent < 70) {
            return (rent * 8000 / 10000);
        } 
        if (rent >= 70 && rent < 80) {
            return (rent * 8100 / 10000);
        }   
        if (rent >= 80 && rent < 90) {
            return (rent * 8200 / 10000);
        }
        if (rent >= 90 && rent < 100) {
            return (rent * 8400 / 10000);
        }
        if (rent > 100) {
            return (rent * 8500 / 10000);
        }
        return 0;      
    }

    function setDefaultSalePrice() public onlyGovt {

    }

    function withdrawPropertyTax() onlyGovt nonReentrant external {
        // this needs to withdraw total bal - deposits
        // the way this will need to work is when depsoit is paid, it will add to a total deposit amount for contract
        // then dedutcted from when a user vacates.

        uint256 bal = address(this).balance - totalDepositBal;
        govt.transfer(bal);
    }    
    
    //x amount of tokens can either buy an unsold property or unlock a rare property     
}