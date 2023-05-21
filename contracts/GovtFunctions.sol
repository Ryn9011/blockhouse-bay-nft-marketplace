
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./PropertyMarket.sol";

contract GovtFunctions is ReentrancyGuard{

    PropertyMarket public propertyMarketContract;
    address payable govt;

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

    constructor(address propertyMarketAddress) {
      propertyMarketContract = PropertyMarket(propertyMarketAddress);
      govt = payable(msg.sender);
    }

    modifier onlyGovt() {
        require(govt == msg.sender, "only govt can call this function");
        _;
    }

    function fetchAllProperties(uint256 page)
        public
        view
        returns (PropertyMarket.Property[] memory)
    {
        uint256 startIndex = 20 * (page - 1);
        uint256 endIndex = startIndex + 20;

        uint256 actualEndIndex = endIndex;
        uint256 propertyCount = propertyMarketContract.getPropertyIds() - 50;
        if (actualEndIndex > propertyCount) {
            actualEndIndex = propertyCount;
        }

        PropertyMarket.Property[] memory allProperties = new PropertyMarket.Property[](actualEndIndex - startIndex);
        uint256 currentIndex = 0;
        for (uint256 i = startIndex; i < actualEndIndex; i++) {
            uint256 currentId = i + 1;
            PropertyMarket.Property memory currentItem = propertyMarketContract.getPropertyDetails(currentId);
            allProperties[currentIndex] = currentItem;
            currentIndex++;
        }
        return allProperties;
    }


    function fetchExclusiveProperties()
        public
        view
        returns (PropertyMarket.Property[] memory)
    {
        uint256 currentId = 501;
        uint256 currentIndex = 0;

        PropertyMarket.Property[] memory allProperties = new PropertyMarket.Property[](50);
        for (uint256 i = 0; i < 50; i++) {
            PropertyMarket.Property memory currentItem = propertyMarketContract.getPropertyDetails(currentId);
            allProperties[currentIndex] = currentItem;
            currentIndex += 1;
            currentId += 1;
        }
        return allProperties;
    }

    // function fetchPropertiesForSale(uint256 page)
    //     public
    //     view
    //     returns (PropertyMarket.Property[] memory)
    // {
    //     uint256 propertyCount = propertyMarketContract.getPropertyIds() - 50;
    //     uint256 unsoldPropertyCount = (propertyMarketContract.getPropertyIds() - 50) -
    //         propertyMarketContract.getPropertiesSold();
    //     uint256 startIndex = 20 * (page - 1);
    //     uint256 endIndex = startIndex + 20;
    //     if (endIndex > unsoldPropertyCount) {
    //         endIndex = unsoldPropertyCount;
    //     }

    //     PropertyMarket.Property[] memory propertiesForSale = new PropertyMarket.Property[](
    //         endIndex - startIndex
    //     );
    //     uint256 currentIndex = 0;
    //     for (uint256 i = 0; i < propertyCount; i++) {
    //         if (
    //             propertyMarketContract.getPropertyDetails(i + 1).isForSale == true &&
    //             propertyMarketContract.getPropertyDetails(i).propertyId < 501
    //         ) {
    //             uint256 currentId = i + 1;
    //             PropertyMarket.Property memory currentItem = propertyMarketContract.getPropertyDetails(currentId);
    //             if (currentIndex >= startIndex && currentIndex < endIndex) {
    //                 propertiesForSale[currentIndex - startIndex] = currentItem;
    //             }
    //             currentIndex++;
    //         }
    //         if (currentIndex >= endIndex) {
    //             break;
    //         }
    //     }
        
    //     return propertiesForSale;
    // }

    // function fetchPropertiesForSale(uint256 page) public view returns (PropertyMarket.Property[] memory) {
    //     uint256 startIndex = 20 * (page - 1);
    //     uint256 endIndex = startIndex + 20;

    //     uint256 unsoldPropertyCount = 0;
    //     uint256[] memory unsoldPropertyIds = new uint256[](_propertyIds.current());
    //     for (uint256 i = 1; i <= _propertyIds.current(); i++) {
    //         if (idToProperty[i].isForSale && idToProperty[i].propertyId < 501) {
    //             unsoldPropertyIds[unsoldPropertyCount] = i;
    //             unsoldPropertyCount++;
    //         }
    //     }

    //     if (endIndex > unsoldPropertyCount) {
    //         endIndex = unsoldPropertyCount;
    //     }

    //     uint256[] memory propertyIds = new uint256[](endIndex - startIndex);
    //     for (uint256 i = startIndex; i < endIndex; i++) {
    //         propertyIds[i - startIndex] = unsoldPropertyIds[i];
    //     }

    //     return getPropertyDetails(propertyIds);
    // }



    function fetchPropertiesSold(bool onlyRentable) public view returns (PropertyMarket.Property[] memory) {
        uint256 propertyCount = propertyMarketContract.getPropertyIds();
        uint256 currentIndex = 0;
        uint256 totalProperties = propertyMarketContract.getRelistCount() + propertyMarketContract.getPropertiesSold();

        PropertyMarket.Property[] memory propertiesSold = new PropertyMarket.Property[](totalProperties);
        
        for (uint256 i = 0; i < propertyCount; i++) {
            PropertyMarket.Property memory currentItem = propertyMarketContract.getPropertyDetails(i + 1);
            if (currentItem.owner != address(0)) {
                bool rentableCondition = !currentItem.roomOneRented || !currentItem.roomTwoRented || !currentItem.roomThreeRented;
                bool propertyIdCondition = currentItem.propertyId <= 500;

                if (onlyRentable) {
                    if (rentableCondition && propertyIdCondition) {
                        propertiesSold[currentIndex] = currentItem;
                        currentIndex++;
                    }
                } else {
                    if (propertyIdCondition) {
                        propertiesSold[currentIndex] = currentItem;
                        currentIndex++;
                    }
                }
            }
        }    
        assembly { mstore(propertiesSold, currentIndex) }
        return propertiesSold;
    }


    function fetchMyProperties() public view returns (PropertyMarket.Property[] memory) {
        uint256 totalItemCount = propertyMarketContract.getPropertyIds();        
        uint256 itemCount = 0;

        PropertyMarket.Property[] memory items = new PropertyMarket.Property[](totalItemCount);

        for (uint256 i = 0; i < totalItemCount; i++) {
            PropertyMarket.Property memory property = propertyMarketContract.getPropertyDetails(i+1);
            
            if (property.owner == msg.sender) {
                items[itemCount] = property;

                itemCount++;
            }
        }

        // Resize the array to remove unused elements
        assembly {
            mstore(items, itemCount)
        }

        return items;
    }


    function fetchMyRentals() public view returns (PropertyMarket.Property[] memory) {        
        uint256[3] memory rentedPropertyIds = propertyMarketContract.getTenantProperties(msg.sender);
        
        PropertyMarket.Property[] memory rentals = new PropertyMarket.Property[](rentedPropertyIds.length);
        for (uint256 i = 0; i != rentedPropertyIds.length; i++) {
            uint256 propertyId = rentedPropertyIds[i];
            if (propertyId != 0) {
                PropertyMarket.Property memory property = propertyMarketContract.getPropertyDetails(propertyId);
                rentals[i] = property;
            }
        }
        return rentals;
    }

 
}