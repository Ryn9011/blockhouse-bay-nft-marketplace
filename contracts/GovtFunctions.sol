// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PropertyMarket.sol";
import {RewardCalculator} from "./RewardCalculator.sol";

import "hardhat/console.sol";

contract GovtFunctions is ReentrancyGuard {
    
    PropertyMarket public propertyMarketContract;  
    address internal immutable i_propertyMarketAddress;
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

    modifier onlyPropertyMarket() {
        require(i_propertyMarketAddress == msg.sender, "only propertyMarket can call this function");
        _;
    }

    constructor(address propertyMarketAddress) {
        propertyMarketContract = PropertyMarket(payable(propertyMarketAddress));    
        propertyMarketContract.setGovtContractAddress(address(this));  
        i_propertyMarketAddress = propertyMarketAddress;
    }

    function giftProperties (
        address nftContract,
        uint256 propertyId,
        address recipient
    ) public onlyPropertyMarket {
        PropertyMarket.Property memory currentItem = fetchSingleProperty(propertyId);

        currentItem.owner = payable(recipient);
        currentItem.isForSale = false;
        currentItem.seller = payable(address(0));

        uint256 propertiesSold = propertyMarketContract.getPropertiesSold();
        require(propertiesSold <= 10, "");

        propertyMarketContract.giftProperties(nftContract, propertyId, recipient);

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

       
        PropertyMarket.Property[] memory properties = propertyMarketContract.getPropertyDetails(propertyIds, false);
            

        assembly {
            mstore(propertiesSold, currentIndex)
        }

        return propertiesSold;
    }










    // function fetchAdditionalPropertiesWithAvailableRooms(uint256 count, uint256 totalProperties, uint256 page) internal view returns (PropertyMarket.Property[] memory) {  
    //     uint256 itemsPerPage = 20;
    //     uint256 startIndex = itemsPerPage * (page);              
        
    //     uint256 remainingProperties = count;

    //     // Determine the starting index for the next batch
        

    //     // Continue fetching properties until reaching the count or maximum available
    //     PropertyMarket.Property[] memory additionalProperties = new PropertyMarket.Property[](count);
    //     console.log('remainingProperties: ', remainingProperties);
    //     console.log('startIndex: ', startIndex);
    //     while (remainingProperties > 0) {
            
    //         uint256 currentIndex = 0;
    //         uint256 size = 20;
    //         uint256[] memory propertyIds = new uint256[](size);
    //         for (uint256 i = startIndex; i < startIndex + size; i++) {            
    //         propertyIds[currentIndex] = i+1;
    //         //console.log('propertyIds[currentIndex] ',propertyIds[currentIndex]);
    //         currentIndex++;
    //         }    

    //         PropertyMarket.Property[] memory propertiesBatch = propertyMarketContract.getPropertyDetails(propertyIds, false);

    //         if (propertiesBatch.length > 0) {
    //             PropertyMarket.Property memory currentItem = propertiesBatch[0];

    //             // Check conditions for including the property in the result
    //             if (currentItem.owner != address(0) &&
    //                 currentItem.roomOneRented == false ||
    //                 currentItem.roomTwoRented == false ||
    //                 currentItem.roomThreeRented == false &&
    //                 currentItem.propertyId <= 500) {

    //                 additionalProperties[count - remainingProperties] = currentItem;
    //                 remainingProperties--;
    //                 console.log('additional propertie pID: ', currentItem.propertyId);

    //                 // Increment the index for the next iteration
    //                 size = size + 20;
    //                 startIndex++;
    //             } else {
    //                 // Skip the current property and move to the next one
    //                 startIndex++;
    //                 size = size + 20;
    //             }
    //         } else {
    //             // No property details returned, increment the index and try the next one
    //             startIndex++;
    //         }
    //     }
    //     return additionalProperties;
    // }
    
    function rentProperty(uint256 propertyId) external payable nonReentrant {        
        uint256[] memory propertyIds = new uint256[](1);
        propertyIds[0] = propertyId;

        PropertyMarket.Property[] memory currentProperty = propertyMarketContract.getPropertyDetails(propertyIds, false);

        require(msg.value == DEPOSIT_REQUIRED, "deposit required");
        require(currentProperty[0].owner != msg.sender, "You can't rent your own property");
        require(currentProperty[0].owner != address(0), "Property owner address should not be zero");

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

        for (uint8 i = 0; i < 3; i++) {
            if (propertyRenters[i] == address(0)) {
                propertyRenters[i] = msg.sender;
                propertyMarketContract.setPropertyRenters(propertyId, propertyRenters, i);                
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
        //propertyMarketContract.setRenterToPropertyTimestamp(propertyId, block.timestamp, msg.sender);
    }

    function checkSetRoomAvailability(
        PropertyMarket.Property memory property
    ) internal pure returns (bool) {        
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

    // function vacateProperty(uint256 propertyId) public nonReentrant {
    //     address sender = msg.sender;        
    //     propertyMarketContract.vacateCommonTasks(propertyId, sender); 
    //     // if (wasTenant) {
    //     //     setTotalDepositBalance(DEPOSIT_REQUIRED, false);
    //     //     payable(sender).transfer(DEPOSIT_REQUIRED);       
    //     // }   
    // }


     function refundDeposit(uint256 propertyId, address renterAddress) onlyPropertyMarket external {
        // propertyMarketContract.vacateCommonTasks(propertyId, sender);
        //bool wasTenant = propertyMarketContract.vacateCommonTasks(propertyId, msg.sender); 
        // console.log('wasTenant: ', wasTenant);
 
            setTotalDepositBalance(DEPOSIT_REQUIRED, false);
            // propertyMarketContract.decrementRelistCount();
            payable(msg.sender).transfer(DEPOSIT_REQUIRED);      
   
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
    function withdrawRentTax() public onlyPropertyMarket nonReentrant {
        require(address(this).balance > 0, "no tax");
        uint256 bal = address(this).balance - totalDepositBal;
        payable(i_propertyMarketAddress).transfer(bal);        
    }
}
