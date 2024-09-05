// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PropertyMarket.sol";
import {RewardCalculator} from "./RewardCalculator.sol";

import "hardhat/console.sol";

contract GovtFunctions is ReentrancyGuard {
    
    PropertyMarket public propertyMarketContract;  

    uint256 constant INITIAL_MINT = 10000000 * (10 ** 18);
  
    address internal immutable i_propertyMarketAddress;
    address private _govtAddress;
    bool private hasSetGovtAddress = false;
    uint256 constant WEI_TO_ETH = 1000000000000000000;   
    uint256 internal constant MIN_DEPOSIT = 3 ether;       
    uint256 public totalDepositBal = 0;
    mapping(address => uint256) public rentAccumulated;
    mapping(address => uint256) public renterDepositBalance;

    receive() external payable {}
        
    event RentPaid(
        address indexed tenant,
        uint256 blockTime,
        uint256 indexed propertyId
    );

    struct PropertyPayment {
        uint256 propertyId;
        address renter;
        uint256 timestamp;
    }    

    modifier onlyPropertyMarket() {
        require(i_propertyMarketAddress == msg.sender, "only propertyMarket can call this function");
        _;
    }

    modifier onlyGovt() {
        console.log('govtAddressMsgSender: ', msg.sender);
        require(_govtAddress == msg.sender, "only govt can call this function");
        _;
    }

    constructor(address propertyMarketAddress) {
        propertyMarketContract = PropertyMarket(payable(propertyMarketAddress));    
        propertyMarketContract.setGovtContractAddress(address(this));  
        i_propertyMarketAddress = propertyMarketAddress;       
    }

    function setGovtAddress(address govtAddress) public {
        if (!hasSetGovtAddress) {
            console.log('govtAddress: ', govtAddress);
            _govtAddress = govtAddress;
            hasSetGovtAddress = true;
        }
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getRentAccumulated(address user) public view returns (uint256) {
        return rentAccumulated[user];
    }

    function getRentAccumulatedSender() public view returns (uint256) {
        return rentAccumulated[msg.sender];
    }

    function setRentAccumulated(uint256 amount, address caller) internal {
        rentAccumulated[caller] = amount;
    }

    function setRenterDepositBalance(address renter, uint256 value) internal {
        renterDepositBalance[renter] = value;        
    }

    function getTotalDepositBalance() public view returns (uint256) {
        return totalDepositBal;
    }

    function setTotalDepositBalance(uint256 amount, bool isAddition) internal {
        if (isAddition) {
            totalDepositBal += amount;
        } else {
            totalDepositBal -= amount;
        }        
    }

    function getPropertiesForSale() public view returns (uint256) {
        uint256 propertyCount = propertyMarketContract.getPropertyIds() - 50;
        return propertyCount - propertyMarketContract.getPropertiesSold();
    }

    function setRentPrice(uint256 propertyId, uint256 rentPrice) public nonReentrant {   
        require(propertyId <= 550 && propertyId >= 1, "Invalid property ID");
        uint256[] memory propertyIds = new uint256[](1);
        propertyIds[0] = propertyId;     
        PropertyMarket.Property[] memory property = propertyMarketContract.getPropertyDetails(propertyIds, false);
        require(rentPrice >= 3 ether, "rent can't be less than 3 matic");
        require(property[0].owner == msg.sender, "Not owner");
        require(rentPrice >= property[0].deposit && rentPrice <= 500 ether, "Rent cannot exceed 500 matic");

        propertyMarketContract.setRentPrice(propertyId, rentPrice);
    }

    function setDeposit(uint256 propertyId, uint256 depositPrice) public nonReentrant {   
        require(propertyId <= 550 && propertyId >= 1, "Invalid property ID");
        uint256[] memory propertyIds = new uint256[](1);
        propertyIds[0] = propertyId;
        PropertyMarket.Property[] memory property = propertyMarketContract.getPropertyDetails(propertyIds, false);
        
        require(depositPrice >= MIN_DEPOSIT, "deposit can't be less than 3 matic");
        require(property[0].owner == msg.sender, "Not owner");
        require(depositPrice >= property[0].deposit && depositPrice <= 500 ether, "Invalid deposit price range");

        propertyMarketContract.setDeposit(propertyId, depositPrice);
    }

    function fetchSingleProperty(uint256 propertyId) public view returns (PropertyMarket.Property memory) {
        require(propertyId <= 550 && propertyId >= 1, "Invalid property ID");

        uint256[] memory propertyIds = new uint256[](1);
        propertyIds[0] = propertyId;

        PropertyMarket.Property[] memory properties = propertyMarketContract.getPropertyDetails(propertyIds, false);

        // Assuming getPropertyDetails returns an array, you can access the first element
        PropertyMarket.Property memory property = properties[0];

        return property;
    }

    function fetchAllProperties(uint256 page) public view returns (PropertyMarket.Property[] memory) {
        uint256 startIndex = 20 * (page - 1);
        uint256 endIndex = startIndex + 20;

        uint256 actualEndIndex = endIndex;
        uint256 propertyCount = propertyMarketContract.getPropertyIds() - 50;
        if (actualEndIndex > propertyCount) {
            actualEndIndex = propertyCount;
        }

        uint256[] memory propertyIds = new uint256[](actualEndIndex - startIndex);
        PropertyMarket.Property[] memory allProperties = new PropertyMarket.Property[](actualEndIndex - startIndex);

        for (uint256 i = 0; i < propertyIds.length; i++) {
            propertyIds[i] = startIndex + i + 1;
        }

        allProperties = propertyMarketContract.getPropertyDetails(propertyIds, false);

        return allProperties;
    }

    function fetchExclusiveProperties()
        public
        view
        returns (PropertyMarket.Property[] memory)
    {
        uint256 currentId = 501;
        // uint256 currentIndex = 0;

        PropertyMarket.Property[]
            memory allProperties = new PropertyMarket.Property[](50);
            uint256[] memory propertyIds = new uint256[](50);
        for (uint256 i = 0; i < 50; i++) {            
            propertyIds[i] = currentId;
            currentId++;
        }
        allProperties = propertyMarketContract.getPropertyDetails(propertyIds, false);
        return allProperties;
    }

    function fetchPropertiesSold(uint256 page) public view returns (PropertyMarket.Property[] memory) {
        uint256 itemsPerPage = 20;
        uint256 startIndex = itemsPerPage * (page - 1);
        uint256 endIndex = startIndex + itemsPerPage;

        uint256 propertyCount = propertyMarketContract.getRelistCount() + propertyMarketContract.getPropertiesSold();
        if (startIndex >= propertyCount) {
            // If the start index is beyond the total count, return an empty array
            return new PropertyMarket.Property[](0);
        }

        // Adjust endIndex if it exceeds the total count
        if (endIndex > propertyCount) {
            endIndex = propertyCount;
        }

        uint256 totalProperties = endIndex - startIndex;
        PropertyMarket.Property[] memory propertiesSold = new PropertyMarket.Property[](totalProperties);

        uint256 currentIndex = 0;

        uint256[] memory propertyIds = new uint256[](1);
        propertyIds[0] = 1;

        assembly {
            mstore(propertiesSold, currentIndex)
        }

        return propertiesSold;
    }
    
    function rentProperty(uint256 propertyId) external payable nonReentrant {     
        require(propertyId <= 550 && propertyId >= 1, "Invalid property ID");
        uint256[] memory propertyIds = new uint256[](1);
        propertyIds[0] = propertyId;

        PropertyMarket.Property[] memory currentProperty = propertyMarketContract.getPropertyDetails(propertyIds, false);        

        address tokenContractAddress = propertyMarketContract.getTokenContractAddress();
        IERC20 propertyToken = IERC20(tokenContractAddress);

        if (propertyId > 500) {
            uint256 bal = propertyToken.balanceOf(msg.sender);
            require(bal >= 2500 ether, "insufficient BHB token balance to rent excl");
        }
        
        require(msg.value == currentProperty[0].deposit, "correct deposit required");
        require(currentProperty[0].owner != msg.sender, "You can't rent your own property");
        require(currentProperty[0].owner != address(0), "Property owner address should not be zero");

        uint256[4][] memory tennants = propertyMarketContract.getTenantsMapping(msg.sender);
        
        address[4] memory propertyRenters = propertyMarketContract.getPropertyRenters(propertyId);

        bool isAlreadyRenter = false;  
        bool maxRentalsReached = true;

        for (uint i = 0; i < 4; i++) {
            if (propertyRenters[i] == msg.sender) {
                isAlreadyRenter = true;
                break;
            }
            if (tennants[0][i] == 0) {
                maxRentalsReached = false;
            }
        }
        require(!maxRentalsReached, "max properties rented");
        require(!isAlreadyRenter, "already a renter");

        bool availableRoom = checkSetRoomAvailability(currentProperty[0]);
        require(availableRoom, "no vacancy");        

        for (uint8 i = 0; i < 4; i++) {
            if (propertyRenters[i] == address(0)) {
                propertyRenters[i] = msg.sender;                
                propertyMarketContract.setPropertyRenters(propertyId, propertyRenters);                
                break;
            }
        }
        
        for (uint8 i = 0; i < 4; i++) {            
            if (tennants[0][i] == 0) {                
                propertyMarketContract.incrementPropertiesRented();
                propertyMarketContract.setTenantsMapping(msg.sender, propertyId, i);                
                setRenterDepositBalance(msg.sender, msg.value);
                setTotalDepositBalance(msg.value, true);
                break;
            }
        }
        //propertyMarketContract.setRenterToPropertyTimestamp(propertyId, block.timestamp, msg.sender);
    }

    function checkSetRoomAvailability(
        PropertyMarket.Property memory property
    ) internal returns (bool) {        
        if (!property.roomOneRented) {
            // property.roomOneRented = true;            
            return true;
        } else if (!property.roomTwoRented) {
            // property.roomTwoRented = true;            
            return true;
        } else if (!property.roomThreeRented) {
            // property.roomThreeRented = true;            
            return true;
        } else if (!property.roomFourRented) {
            // property.roomFourRented = true;            
            return true;
        }
        return false;        
    }


    function refundDeposit(uint256 propertyId, address renterAddress) onlyPropertyMarket external {
        require(propertyId <= 550 && propertyId >= 1, "Invalid property ID");

        //get sinlge property
        PropertyMarket.Property memory currentItem = fetchSingleProperty(propertyId);

        setTotalDepositBalance(currentItem.deposit, false);
        payable(renterAddress).transfer(currentItem.deposit);      
   
    }

    function payRent(uint256 propertyId) external payable nonReentrant {
        require(propertyId <= 550 && propertyId >= 1, "Invalid property ID");
        PropertyMarket.Property memory currentItem = fetchSingleProperty(propertyId);
        require(
            msg.value == currentItem.rentPrice,
            "amount != rent"
        );

        uint256 rentTime = propertyMarketContract.getRenterToPropertyTimestamp(propertyId, msg.sender);

        // require(
        //     (block.timestamp - rentTime) > 600, "can't pay rent more than once in 24hrs" //change this!!!!
        // );

        uint256[4][] memory tennants = propertyMarketContract.getTenantsMapping(msg.sender);
   
        bool isRenter = false;
        uint256 tenantLength = tennants[0].length;

        for (uint8 i = 0; i < tenantLength; i++) {
            console.log('tenantlength: ', tenantLength);
            if (tennants[0][i] == propertyId) {
                //propertyMarketContract.setTenantsMapping(msg.sender, propertyId, i);
                isRenter = true;
                break;
            }
        }

        require(isRenter, "not tenant");
        uint256 accumulated = getRentAccumulated(currentItem.owner);
        console.log('accumulated: ', accumulated);
        setRentAccumulated((msg.value + accumulated), currentItem.owner);
        propertyMarketContract.setTotalIncomeGenerated(propertyId, msg.value);
        propertyMarketContract.setRenterToPropertyTimestamp(propertyId, block.timestamp, msg.sender);
    
        uint256 price;
        if (propertyId > 500) {
            price = currentItem.rentPrice * 3;
        } else {           
            price = currentItem.rentPrice; //* (count + 1) * 12 / 10;
        }
        uint256 maxSupply = propertyMarketContract.getMaxSupply();
        if (maxSupply > 0) {
            uint256 tokensToReceive = RewardCalculator.getTokenAmountToReceive(price, maxSupply, INITIAL_MINT);     

            // address tokenContractAddress = propertyMarketContract.getTokenContractAddress();
            // uint256 diminishingSupplyFactor = 0;

            // if (tokenContractAddress != address(0)) {
            //     diminishingSupplyFactor = (IERC20(tokenContractAddress)
            //     // this needs to be the balance of the property market contract!!
            //         .balanceOf(i_propertyMarketAddress) * 100) / maxSupply;
            //         console.log('diminishingSupplyFactor at calc: ', diminishingSupplyFactor);
            // }
            // console.log('DIMINISHING SUPPLY FACTOR: ', diminishingSupplyFactor);

            // if (diminishingSupplyFactor < 1) {
            //     diminishingSupplyFactor = 1;
            // }
            // // console.log('diminishingSupplyFactor: ', diminishingSupplyFactor);
            // uint256 tokensToReceive = baseTokenAmount * diminishingSupplyFactor; 
            console.log('tokensToReceive: ', tokensToReceive);
            // if (tokensToReceive > maxSupply) {
            //     tokensToReceive = maxSupply;
            // }

            // uint256 convertedAmount = tokensToReceive;
            propertyMarketContract.setRenterTokens(tokensToReceive, msg.sender);

            console.log('maxSupply: ', maxSupply);
            uint256 newSupplyAmount = maxSupply - tokensToReceive;
            propertyMarketContract.setMaxSupply(newSupplyAmount);
            
            require(rentAccumulated[currentItem.owner] > 0, "rent = 0");
        
            uint256 fivePercent = (rentAccumulated[currentItem.owner] * 500) / 10000;
            payable(msg.sender).transfer(rentAccumulated[currentItem.owner] - fivePercent);
            rentAccumulated[currentItem.owner] = 0;
        }       
        emit RentPaid(msg.sender, block.timestamp, propertyId);
    }

    // function transferRentToPropertyOwner(address propertyOwner) internal nonReentrant {
    //     // Ensure there is rent to withdraw
    //     require(rentAccumulated[propertyOwner] > 0, "rent = 0");
        
    //     uint256 rentToTransfer = (rentAccumulated[propertyOwner] * 500) / 10000;
    //     payable(msg.sender).transfer(rentAccumulated[propertyOwner] - rentToTransfer);
    //     rentAccumulated[msg.sender] = 0;
    // }

    function withdrawRentTax() public onlyPropertyMarket nonReentrant {
        require(address(this).balance > 0, "no tax");
        uint256 bal = address(this).balance - totalDepositBal;
        require(bal > totalDepositBal, "insufficient tax");
        payable(_govtAddress).transfer(bal);        
    }

    function checkTotalDepositBalance() public view  onlyGovt returns (uint256) {
        return totalDepositBal;
    }

    function checkGovtBalance() public view onlyGovt returns (uint256) {        
        uint256 bal = address(this).balance - totalDepositBal;
        uint256 marketBal = i_propertyMarketAddress.balance;
        return bal + marketBal;
    }

    function amountToWithdraw() public view onlyGovt returns (uint256) {
        return address(this).balance - totalDepositBal;
    }

    function getContractBal() public view onlyGovt returns (uint256) {
        return address(this).balance;
    }
}
