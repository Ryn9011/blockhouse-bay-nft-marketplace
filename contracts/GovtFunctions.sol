// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PropertyMarket.sol";
import {RewardCalculator} from "./RewardCalculator.sol";

// import "hardhat/console.sol";

contract GovtFunctions is ReentrancyGuard {
    
    PropertyMarket public propertyMarketContract;  

    uint256 constant INITIAL_MINT = 10000000 * (10 ** 18);
  
    address internal immutable i_propertyMarketAddress;
    address private _govtAddress;
    bool private hasSetGovtAddress = false;
    uint256 constant WEI_TO_ETH = 1000000000000000000;   
    uint256 internal minDeposit = 0.001 ether;       
    uint256 public totalDepositBal = 0;
    uint256 public propertyCountAllRoomsRented = 0;
    uint256 propertiesWithRenterCount = 0;
    mapping(address => uint256) public rentAccumulated;
    // address => propertyId => deposit
    mapping(address => mapping(uint256 => uint256)) public renterDepositBalance;

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
        // console.log('govtAddressMsgSender: ', msg.sender);
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
            _govtAddress = govtAddress;
            hasSetGovtAddress = true;
        }
    }

    function setDepositMin(uint256 minDepositVal) public onlyGovt {
        minDeposit = minDepositVal;
    }

    function getDepositMin() public view returns (uint256) {
        return minDeposit;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getPropertyCountAllRoomsRented() public view returns (uint256) {
        return propertyCountAllRoomsRented;
    }

    function getRentedProperties() public view returns (uint256) {
        return propertiesWithRenterCount;
    }

    function getRentAccumulatedSender() public view returns (uint256) {
        return rentAccumulated[msg.sender];
    }

    function setRenterDepositBalance(address renter, uint256 value, uint256 propertyId) internal {
        renterDepositBalance[renter][propertyId] = value;              
    }

    function getRenterDepositBalance(uint256 propertyId) public view returns (uint256) {
        address renter = msg.sender;
        return renterDepositBalance[renter][propertyId];
    }

    function getTotalDepositBalance() public view returns (uint256) {
        return totalDepositBal;
    }

    function decrementTotalDepositBalance(uint256 amount) internal {
        totalDepositBal -= amount;
    }

    function incrementTotalDepositBalance(uint256 amount) internal {
        totalDepositBal += amount;
    }

    // increment or decrement propertiesWithRenterCount based on isForSale only if property has renters. fetch single property and check
    function adjustPropertiesWithRenterCount(uint256 propertyId, bool isForSale) external onlyPropertyMarket {        
        PropertyMarket.Property memory property = fetchSingleProperty(propertyId);
        if (property.roomOneRented || property.roomTwoRented || property.roomThreeRented || property.roomFourRented) {
            if (isForSale) {
                propertiesWithRenterCount++;
            } else {
                propertiesWithRenterCount--;
            }
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
        
        require(property[0].owner == msg.sender, "Not owner");
        require(rentPrice >= 10 ether, "Rent can't be less than 10 pol");
        require(rentPrice >= property[0].deposit && rentPrice <= 500 ether, "Rent cannot exceed 500 pol");
                
        uint256 lastSaleIndex = property[0].dateSoldHistory.length - 1;
        uint256 lastSaleTime = property[0].dateSoldHistory[lastSaleIndex];
        require(block.timestamp >= lastSaleTime + 1 days, "Rent cannot be set within 30 days of the last sale");

        propertyMarketContract.setRentPrice(propertyId, rentPrice);
    }


    function setDeposit(uint256 propertyId, uint256 depositPrice) public nonReentrant {   
        require(propertyId <= 550 && propertyId >= 1, "Invalid property ID");
        uint256[] memory propertyIds = new uint256[](1);
        propertyIds[0] = propertyId;
        PropertyMarket.Property[] memory property = propertyMarketContract.getPropertyDetails(propertyIds, false);
        
        require(depositPrice >= minDeposit, "deposit can't be set below min deposit value");
        require(property[0].owner == msg.sender, "Not owner");
        require(depositPrice >= minDeposit && depositPrice <= 500 ether, "Invalid deposit price range");

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
            // require(bal >= 2500 ether, "insufficient BHB token balance to rent excl");
        }
        
        require(msg.value == currentProperty[0].deposit, "incorrect deposit amount");
        require(currentProperty[0].owner != msg.sender, "You cannot rent your own property");
        require(currentProperty[0].owner != _govtAddress, "Property not yet owned");

        uint256[4][] memory tennants = propertyMarketContract.getTenantsMapping(msg.sender);
        
        address[4] memory propertyRenters = propertyMarketContract.getPropertyRenters(propertyId);

        bool isAlreadyRenter = false;  
        bool maxRentalsReached = true;

        //need to check id property is already rented by another renter and if not, increment  propertiesWithRenterCount
        bool isAlreadyRented = false;
        for (uint i = 0; i < 4; i++) {
            // user already a renter
            if (propertyRenters[i] == msg.sender) {
                isAlreadyRenter = true;
            } 
            // property already rented
            if (propertyRenters[i] != address(0)) {
                isAlreadyRented = true;               
            }                        
            // user already rented 4 properties
            if (tennants[0][i] == 0) {
                maxRentalsReached = false;
            }
        }
        require(!maxRentalsReached, "max properties rented");
        require(!isAlreadyRenter, "already a renter");

        bool availableRoom = checkSetRoomAvailability(currentProperty[0]);
        require(availableRoom, "no vacancy");    

        if (!isAlreadyRented && currentProperty[0].isForSale) {            
            propertiesWithRenterCount++;
        }

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

                // setTotalDepositBalance(msg.value, true);
                break;
            }
        }        

        setRenterDepositBalance(msg.sender, msg.value, propertyId);                                
        incrementTotalDepositBalance(msg.value);
        
        // this is dumb, but not refactoring at this stage
        bool isLastRenter = true;
        for (uint8 i = 0; i < 4; i++) {
            if (propertyRenters[i] == address(0)) {
                isLastRenter = false;
                break;
            }
        }
        if (isLastRenter) {
            propertyCountAllRoomsRented++;
        }
    }

    function checkSetRoomAvailability(
        PropertyMarket.Property memory property
    ) internal pure returns (bool) {        
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

    function refundDeposit(uint256 propertyId, address renterAddress, bool evicted, bool isForSale, bool changePropertiesWithRenterCount) onlyPropertyMarket external {
        require(propertyId <= 550 && propertyId >= 1, "Invalid property ID");
        uint256 depositPaid = renterDepositBalance[renterAddress][propertyId];
        require(depositPaid > 0, "no deposit to refund");   
        if (!evicted) {
            payable(renterAddress).transfer(depositPaid);    
        }                       
        setRenterDepositBalance(msg.sender, 0, propertyId); 
        decrementTotalDepositBalance(depositPaid);   
        // if renter was last renter on a property, decrement propertiesWithRenterCount. use getPropertyRenters to check if renter is last renter
        address[4] memory propertyRenters = propertyMarketContract.getPropertyRenters(propertyId);

        if (changePropertiesWithRenterCount) {                     
            if (isForSale) {
                bool isLastRenter = true;
                for (uint i = 0; i < 4; i++) {
                    if (propertyRenters[i] != address(0)) {
                        isLastRenter = false;
                        break;
                    }
                }
                if (isLastRenter) {
                    propertiesWithRenterCount--;
                }
            }
        }
        
        uint256 rentedCount = 0;        
        for (uint8 i = 0; i < 4; i++) {
            if (propertyRenters[i] != address(0)) {
                rentedCount++;
            }
        }
        if (rentedCount == 3) {
            propertyCountAllRoomsRented--;        
        }                
    }

    function payRent(uint256 propertyId) external payable nonReentrant {
        require(propertyId <= 550 && propertyId >= 1, "Invalid property ID");
        PropertyMarket.Property memory currentItem = fetchSingleProperty(propertyId);
        require(
            msg.value == currentItem.rentPrice,
            "incorrect rent amount"
        );

        uint256 rentTime = propertyMarketContract.getRenterToPropertyTimestamp(propertyId, msg.sender);

        require(
            (block.timestamp - rentTime) > 1 days,
            "You can't pay rent more than once in 48hrs"
        );

        uint256[4][] memory tennants = propertyMarketContract.getTenantsMapping(msg.sender);
   
        bool isRenter = false;
        uint256 tenantLength = tennants[0].length;

        for (uint8 i = 0; i < tenantLength; i++) {            
            if (tennants[0][i] == propertyId) {                
                isRenter = true;
                break;
            }
        }

        require(isRenter, "is not tenant");
        
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

            // console.log('tokensToReceive: ', tokensToReceive);
      
            propertyMarketContract.setRenterTokens(tokensToReceive, msg.sender);

            // console.log('maxSupply from govt: ', maxSupply);
            // console.log('tokensToReceive from govt: ', tokensToReceive);
            uint256 newSupplyAmount = maxSupply - tokensToReceive;
            propertyMarketContract.setMaxSupply(newSupplyAmount);
            
            require(msg.value > 0, "rent = 0");                                

            uint256 taxAmount = calculateTax(currentItem.rentPrice, msg.value);

            // console.log('taxAmount: ', taxAmount);
            // console.log('msg.value: ', msg.value);
       
            payable(currentItem.owner).transfer(msg.value - taxAmount);
          
        }       
        emit RentPaid(msg.sender, block.timestamp, propertyId);
    }

    function calculateTax(uint256 rentPrice, uint256 paymentAmount) internal pure returns (uint256) {
        uint256 baseTax = 500; // 5%
        uint256 rentInEther = rentPrice / 1 ether;
        
        uint256 additionalTax = (rentInEther > 10) ? ((rentInEther - 10) / 5) * 100 : 0;
        //console.log('baseTax: ', baseTax);
        //console.log('additionalTax: ', additionalTax);

        uint256 totalTaxPercentage = baseTax + additionalTax;
      //  console.log('totalTaxPercentage: ', totalTaxPercentage);
        
        uint256 maxTaxPercentage = 6000; // 60%
        if (totalTaxPercentage > maxTaxPercentage) {
            totalTaxPercentage = maxTaxPercentage;
        }
        // console.log('maxTaxPercentage: ', maxTaxPercentage);
        // console.log('totalTaxPercentage after cap: ', totalTaxPercentage);

        return (paymentAmount * totalTaxPercentage) / 10000;
    }



    // function transferRentToPropertyOwner(address propertyOwner) internal nonReentrant {
    //     // Ensure there is rent to withdraw
    //     require(rentAccumulated[propertyOwner] > 0, "rent = 0");
        
    //     uint256 rentToTransfer = (rentAccumulated[propertyOwner] * 500) / 10000;
    //     payable(msg.sender).transfer(rentAccumulated[propertyOwner] - rentToTransfer);
    //     rentAccumulated[msg.sender] = 0;
    // }

    function withdrawRentTax() public onlyGovt nonReentrant {
        require(address(this).balance > 0, "no tax");
        uint256 bal = address(this).balance - totalDepositBal;
        require(bal > 0, "insufficient amount to withdraw");
        payable(_govtAddress).transfer(bal);        
    }

    function checkTotalDepositBalance() public view  onlyGovt returns (uint256) {
        return totalDepositBal;
    }

    function checkGovtBalance() public view onlyGovt returns (uint256) {        
        uint256 bal = address(this).balance - totalDepositBal;        
        return bal;
    }

    function amountToWithdraw() public view onlyGovt returns (uint256) {
        return address(this).balance - totalDepositBal;
    }

    function getContractBal() public view onlyGovt returns (uint256) {
        return address(this).balance;
    }

    function getMarketBal() public view onlyGovt returns (uint256) {
        return i_propertyMarketAddress.balance;
    }

    function getTokenBalanceMaxSupply() public view onlyGovt returns (uint256) {
        uint256 maxSupply = propertyMarketContract.getMaxSupply();          
        return maxSupply;
    }
}
