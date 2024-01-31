// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PropertyMarket.sol";
import {RewardCalculator} from "./RewardCalculator.sol";

contract GovtFunctions is ReentrancyGuard {
    PropertyMarket public propertyMarketContract;  

    uint256 constant WEI_TO_ETH = 1000000000000000000;  
    uint256 public constant DEPOSIT_REQUIRED = 0.001 ether; 
    uint256 public totalDepositBal = 0;
    mapping(address => uint256) public rentAccumulated;
    mapping(address => uint256) public renterDepositBalance;

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

    constructor(address propertyMarketAddress) {
        propertyMarketContract = PropertyMarket(payable(propertyMarketAddress));    
        propertyMarketContract.setGovtContractAddress(address(this));    
    }

    function getRentAccumulated(address user) public view returns (uint256) {
        return rentAccumulated[user];
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

    function getDepositRequired() public pure returns (uint256) {
        return DEPOSIT_REQUIRED;
    }


    function getPropertiesForSale() public view returns (uint256) {
        uint256 propertyCount = propertyMarketContract.getPropertyIds() - 50;
        return propertyCount - propertyMarketContract.getPropertiesSold();
    }

    function setRentPrice(uint256 propertyId, uint256 rentPrice) public nonReentrant {   
        uint256[] memory propertyIds = new uint256[](1);
        propertyIds[0] = propertyId;     
        PropertyMarket.Property[] memory property = propertyMarketContract.getPropertyDetails(propertyIds, false);
        
        require(property[0].owner == msg.sender, "Not owner");
        require(rentPrice >= DEPOSIT_REQUIRED && rentPrice <= 500 ether, "Invalid rent price range");

        propertyMarketContract.setRentPrice(propertyId, rentPrice);
    }

    function fetchSingleProperty(uint256 propertyId) public view returns (PropertyMarket.Property memory) {
        require(propertyId < 551 && propertyId >= 1, "Invalid property ID");

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
        uint256 currentIndex = 0;

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

        uint256 totalProperties = propertyMarketContract.getRelistCount() +
            propertyMarketContract.getPropertiesSold();
        
        if (startIndex >= totalProperties) {
            // No properties to return on this page
            return new PropertyMarket.Property[](0);
        }

        uint256[] memory propertyIds = new uint256[](itemsPerPage);
        uint256 currentIndex = 0;

        // Populate propertyIds array with the required property IDs
        for (uint256 i = startIndex + 1; i <= startIndex + itemsPerPage; i++) {
            propertyIds[currentIndex] = i;
            currentIndex++;
        }

        // Retrieve property details for the specified property IDs
        PropertyMarket.Property[] memory allProperties = propertyMarketContract.getPropertyDetails(propertyIds, false);

        // Filter properties based on room availability
        PropertyMarket.Property[] memory propertiesSold = new PropertyMarket.Property[](itemsPerPage);
        currentIndex = 0;

        for (uint256 i = 0; i < allProperties.length; i++) {
            PropertyMarket.Property memory currentItem = allProperties[i];

            // Check conditions for including the property in the result
            if (currentItem.owner != address(0) &&
                currentItem.roomOneRented == false &&
                currentItem.roomTwoRented == false &&
                currentItem.roomThreeRented == false &&
                currentItem.propertyId <= 500) {

                propertiesSold[currentIndex] = currentItem;
                currentIndex++;

                // Check if we've collected enough properties for this page
                if (currentIndex >= itemsPerPage) {
                    break;
                }
            }
        }

        // If needed, fetch additional properties recursively
        if (currentIndex < itemsPerPage) {
            uint256 additionalPropertiesToFetch = itemsPerPage - currentIndex;

            // Fetch additional properties with available rooms recursively
            PropertyMarket.Property[] memory additionalProperties = fetchAdditionalPropertiesWithAvailableRooms(additionalPropertiesToFetch);

            // Append additional properties to the result
            for (uint256 i = 0; i < additionalProperties.length; i++) {
                propertiesSold[currentIndex] = additionalProperties[i];
                currentIndex++;

                // Check if we've collected enough properties for this page
                if (currentIndex >= itemsPerPage) {
                    break;
                }
            }
        }

        assembly {
            mstore(propertiesSold, currentIndex)
        }

        return propertiesSold;
    }

    function fetchAdditionalPropertiesWithAvailableRooms(uint256 count) internal view returns (PropertyMarket.Property[] memory) {
        uint256 totalProperties = propertyMarketContract.getRelistCount() +
            propertyMarketContract.getPropertiesSold();

        // Calculate the remaining properties needed to reach the count
        uint256 remainingProperties = count;

        // Determine the starting index for the next batch
        uint256 startIndex = totalProperties + 1;

        // Continue fetching properties until reaching the count or maximum available
        PropertyMarket.Property[] memory additionalProperties = new PropertyMarket.Property[](count);

        while (remainingProperties > 0 && startIndex <= totalProperties) {
            // Retrieve property details for the next property IDs
            uint256[] memory propertyIds = new uint256[](1);
            propertyIds[0] = startIndex;

            PropertyMarket.Property[] memory propertiesBatch = propertyMarketContract.getPropertyDetails(propertyIds, false);

            if (propertiesBatch.length > 0) {
                PropertyMarket.Property memory currentItem = propertiesBatch[0];

                // Check conditions for including the property in the result
                if (currentItem.owner != address(0) &&
                    currentItem.roomOneRented == false &&
                    currentItem.roomTwoRented == false &&
                    currentItem.roomThreeRented == false &&
                    currentItem.propertyId <= 500) {

                    additionalProperties[count - remainingProperties] = currentItem;
                    remainingProperties--;

                    // Increment the index for the next iteration
                    startIndex++;
                } else {
                    // Skip the current property and move to the next one
                    startIndex++;
                }
            } else {
                // No property details returned, increment the index and try the next one
                startIndex++;
            }
        }
        return additionalProperties;
    }
    
    function rentProperty(uint256 propertyId) external payable nonReentrant {        
        uint256[] memory propertyIds = new uint256[](1);
        propertyIds[0] = propertyId;

        PropertyMarket.Property[] memory currentProperty = propertyMarketContract.getPropertyDetails(propertyIds, false);

        require(msg.value == DEPOSIT_REQUIRED, "deposit required");
        require(currentProperty[0].owner != msg.sender && currentProperty[0].owner != address(0), "can't rent your own property");

        address[3] memory propertyRenters = propertyMarketContract.getPropertyRenters(propertyId);

        bool isAlreadyRenter = false;
        for (uint i = 0; i < 3; i++) {
            if (propertyRenters[i] == msg.sender) {
                isAlreadyRenter = true;
                break;
            }
        }
        require(!isAlreadyRenter, "already a renter");

        bool availableRoom = checkSetRoomAvailability(currentProperty[0]);
        require(availableRoom, "no vacancy");

        for (uint256 i = 0; i < 3; i++) {
            if (propertyRenters[i] == address(0)) {
                propertyRenters[i] = msg.sender;
                break;
            }
        }

        uint256[3][] memory tennants = propertyMarketContract.getTenantsMapping(msg.sender);
        
        for (uint8 i = 0; i < 3; i++) {            
            if (tennants[0][i] == 0) {
                propertyMarketContract.incrementPropertiesRented();
                propertyMarketContract.setTenantsMapping(msg.sender, propertyId, i);                
                setRenterDepositBalance(msg.sender, msg.value);
                setTotalDepositBalance(msg.value, true);
                break;
            }
        }
        propertyMarketContract.setRenterToPropertyTimestamp(propertyId, block.timestamp, msg.sender);
    }

    function checkSetRoomAvailability(
        PropertyMarket.Property memory property
    ) internal returns (bool) {        
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

    function vacateProperty(uint256 propertyId) public nonReentrant {
        address sender = msg.sender;        
        bool wasTenant = propertyMarketContract.vacateCommonTasks(propertyId, sender); 
        if (wasTenant) {
            setTotalDepositBalance(DEPOSIT_REQUIRED, false);
            payable(sender).transfer(DEPOSIT_REQUIRED);       
        }   
    }

    function vacatePropertyAfterBuy(uint256 propertyId, address sender) public {
        propertyMarketContract.vacateCommonTasks(propertyId, sender);
        bool wasTenant = propertyMarketContract.vacateCommonTasks(propertyId, sender); 
            if (wasTenant) {
            setTotalDepositBalance(DEPOSIT_REQUIRED, false);
            propertyMarketContract.decrementRelistCount();
            payable(sender).transfer(DEPOSIT_REQUIRED);      
        }
    }

    function payRent(uint256 propertyId) external payable nonReentrant {
        PropertyMarket.Property memory currentItem = fetchSingleProperty(propertyId);
        require(
            msg.value == currentItem.rentPrice,
            "amount != rent"
        );

        uint256 rentTime = propertyMarketContract.getRenterToPropertyTimestamp(propertyId, msg.sender);

        require(
            (block.timestamp - rentTime) > 600, "can't pay rent more than once in 24hrs" //change this!!!!
        );

        uint256[3][] memory tennants = propertyMarketContract.getTenantsMapping(msg.sender);

        bool isRenter = false;
        uint256 tenantLength = tennants.length;

        for (uint8 i = 0; i < tenantLength; i++) {
            if (tennants[i][0] == propertyId) {
                propertyMarketContract.setTenantsMapping(msg.sender, propertyId, i);
                isRenter = true;
                break;
            }
        } //YO YO YO, MOVE ABOVE LOGIC TO SETTENANTSMAPPING FUNCTION AND DO AWAY IT GET TENNANTS MAPPING ABOVE

        require(isRenter, "not tenant");
        uint256 accumulated = getRentAccumulated(currentItem.owner);
        setRentAccumulated((msg.value + accumulated), currentItem.owner);
        currentItem.totalIncomeGenerated += msg.value;
        propertyMarketContract.setRenterToPropertyTimestamp(propertyId, block.timestamp, msg.sender);

        uint256 price;
        if (propertyId > 500) {
            price = currentItem.rentPrice * 3;
        } else {
           
            price = currentItem.rentPrice; //* (count + 1) * 12 / 10;
        }
        uint256 maxSupply = propertyMarketContract.getMaxSupply();
        if (maxSupply > 0) {
            uint256 baseTokenAmount = RewardCalculator.getTokenAmountToReceive(price / WEI_TO_ETH);     

            address tokenContractAddress = propertyMarketContract.getTokenContractAddress();
            uint256 diminishingSupplyFactor = 0;

            if (tokenContractAddress != address(0)) {
                diminishingSupplyFactor = (IERC20(tokenContractAddress)
                    .balanceOf(address(this)) * 100) / maxSupply;
            }


            if (diminishingSupplyFactor < 1) {
                diminishingSupplyFactor = 1;
            }
            // console.log('diminishingSupplyFactor: ', diminishingSupplyFactor);
            uint256 tokensToReceive = baseTokenAmount * diminishingSupplyFactor; 
            // console.log('tokensToReceive: ', tokensToReceive);
            if (tokensToReceive > maxSupply) {
                tokensToReceive = maxSupply;
            }

            uint256 convertedAmount = tokensToReceive * (1 ether);
            propertyMarketContract.setRenterTokens(convertedAmount, msg.sender);

            uint256 newSupplyAmount = maxSupply - tokensToReceive;
            propertyMarketContract.setMaxSupply(newSupplyAmount);
        }       
        emit RentPaid(msg.sender, block.timestamp, propertyId);
    }


    function collectRent() public nonReentrant {
        // Ensure there is rent to withdraw
        require(rentAccumulated[msg.sender] > 0, "rent = 0");

        uint256 rentToTransfer = (rentAccumulated[msg.sender] * 500) / 10000;
        payable(msg.sender).transfer(rentAccumulated[msg.sender] - rentToTransfer);
        rentAccumulated[msg.sender] = 0;
    }
}
