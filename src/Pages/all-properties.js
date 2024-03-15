import { React, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import GetPropertyNames from '../getPropertyName'
import Pagination from '../Pagination'
import Blockies from 'react-blockies';
import { detectNetwork, getRpcUrl } from '../Components/network-detector';

import {
  nftaddress, nftmarketaddress, govtaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import GovtFunctions from '../artifacts/contracts/GovtFunctions.sol/GovtFunctions.json'
import SaleHistory from '../Components/sale-history'

window.ethereum.on('accountsChanged', function (accounts) {                 
  window.location.reload();
});

const AllProperties = () => {

  const [loadingState, setLoadingState] = useState('not-loaded')
  const [propertyList, setPropertyList] = useState([]);
  const [postsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = propertyList.slice(indexOfFirstPost, indexOfLastPost);  

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    setLoadingState("not-loaded");
    loadProperties()
  }, [currentPage])

  const loadProperties = async () => {
    const network = await detectNetwork()

    const projectId = "xCHCSCf75J6c2TykwIO0yWgac0yJlgRL"
    const rpcUrl = getRpcUrl(network, projectId);

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, provider)
    const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, provider)
    const data = await govtContract.fetchAllProperties(currentPage)

    const items = await Promise.all(data.filter(i => i.propertyId.toNumber() != 0 && (a => a.tokenId.toNumber() !== 0)).map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)

      const meta = await axios.get(tokenUri)
      console.log(data)
      let nftName = GetPropertyNames(meta)

      let price = await ethers.utils.formatUnits(i.salePrice.toString(), 'ether')
      //let depositHex = await govtContract.getDepositRequired()
      //et deposit = await ethers.utils.formatUnits(depositHex, 'ether')

      const renterAddresses = await marketContract.getPropertyRenters(i.propertyId);
      console.log(i.propertyId.toNumber())

      let saleHistory = [];
      if (i.saleHistory.length > 0) {
        i.saleHistory.forEach((item) => {
          const history = i.saleHistory.map((item) => {
            return {
              price: ethers.utils.formatUnits(item[0]),
              type: item[1].toNumber() === 1 ? "Matic" : "BHB"
            }
          });
          saleHistory = history;
        })
      } else {
        saleHistory.push("Unsold")
      }
      let totalIncomeGenerated;
      if (i.totalIncomeGenerated != 0) {
        totalIncomeGenerated = ethers.utils.formatUnits(i.totalIncomeGenerated)
      } else totalIncomeGenerated = 0;
      let rentPrice = await ethers.utils.formatUnits(i.rentPrice.toString(), 'ether')
      let owner = i.owner === '0x0000000000000000000000000000000000000000' ? 'Unowned' : i.owner

      let item = {
        price,
        propertyId: i.propertyId.toNumber(),
        seller: i.seller,
        owner: owner,
        image: tokenUri,
        name: nftName,
        description: meta.data.description,
        roomOneRented: i.roomOneRented,
        roomTwoRented: i.roomTwoRented,
        roomThreeRented: i.roomThreeRented,
        roomFourRented: i.roomFourRented,
        rentPrice: rentPrice,
        depositRequired: i.deposit,
        available: false,
        roomsRented: 0,
        renterAddresses: renterAddresses,
        saleHistory: saleHistory,
        dateSoldHistory: i.dateSoldHistory,
        totalIncomeGenerated: totalIncomeGenerated
      }
      if (!item.roomOneRented || !item.roomTwoRented || !item.roomThreeRented) {
        item.available = true;
      }
      if (item.roomOneRented == true) {
        item.roomsRented++
      }
      if (item.roomTwoRented == true) {
        item.roomsRented++
      }
      if (item.roomThreeRented == true) {
        item.roomsRented++
      }
      if (item.roomFourRented == true) {
        item.roomsRented++
      }
      return item
    }))
    setPropertyList(items)
    setLoadingState('loaded')
  }

  if (loadingState !== 'loaded') return (
    <div className="pt-10 pb-10">
      <div className="flex ">
        <div className="lg:px-4 lg:ml-20" style={{ maxWidth: "1600px" }}>
          <div className="flex pl-6 lg:px-12">
            <p className="text-white text-3xl lg:text-5xl font-bold mb-2">Loading Properties</p>
            <svg role="status" className="mt-1 lg:mt-3 ml-3 inline w-8 h-8 mr-2 text-red-500 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
          </div>
          <img src="night.png" className="pl-6 pr-6 h-4/5 lg:h-5/6 lg:w-5/12 lg:pl-12" />                      
        </div>
      </div>
    </div>
  )

  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <h1 className="text-white mb-5">All Properties</h1>
          <div className="flex text-white pl-4 mb-5">
            <p className="text-sm lg:text-xl pl-4 font-bold mr-1 mb-2">All Blockhouse Bay properties</p>
            {/* <div className="pb-2">
              <img
                className="object-none scale-75 pr-0.5 pl-1"
                src="./pogtoken.png"
                alt=""
              ></img>
            </div>
            <h5 className="text-white mb-4">tokens</h5> */}
          </div>

          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={500}
            paginate={paginate}
            currentPage={currentPage}
          />
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-white">

            {propertyList.map((property, i) => {

              return (
                <div
                  key={1}
                  className="border shadow rounded-md overflow-hidden bg-gradient-120 from-black via-black to-blue-400"
                >
                  <img className='w-fit h-fit' src={property.image} alt="" />
                  <div className="p-4 ">
                    <p
                      style={{ height: "50px" }}

                      className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400"
                    >
                      {property.name}
                    </p>
                    <div style={{ overflow: "hidden" }}>
                      <div className='flex justify-between mb-2'>
                        <div>
                          <p>Owner:</p>
                          <p className="text-[10px] text-green-400 font-mono">{property.owner}</p>
                        </div>
                        <div className='pt-1.5'>
                          {property.owner !== 'Unowned' &&
                            <Blockies
                              seed={property.owner}
                            />
                          }
                        </div>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p>Rooms Rented:</p>
                        <p className="font-mono text-xs text-green-400">{property.roomsRented}/4</p>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p>Rent Price:</p>
                        <p className="font-mono text-xs text-green-400">{property.rentPrice} Matic</p>
                      </div>
                      <div className="flex flex-col">
                        <p>Total Income Generated:</p>
                        <p className="font-mono text-xs pb-2 text-green-400">{property.totalIncomeGenerated} Matic</p>
                      </div>
                      <p>Tenants:</p>
                      <div className='text-[10px] mb-3 text-green-400 font-mono'>
                        {ethers.utils.formatEther(property.renterAddresses[0]).toString() !== "0.0" ?
                          <>
                            <div className='flex items-center justify-between mb-2'>
                              <p className={" break-words"}>
                                {property.renterAddresses[0]}
                              </p>
                              <Blockies
                                seed={property.renterAddresses[0]}
                              />
                            </div>
                          </>
                          : <p>0x</p>
                        }
                        {ethers.utils.formatEther(property.renterAddresses[1]).toString() !== "0.0" ?
                          <div className='flex items-center justify-between mb-2'>
                            <p className={" break-words"}>
                              {property.renterAddresses[1]}
                            </p>
                            <Blockies
                              seed={property.renterAddresses[1]}
                            />
                          </div>
                          :
                          <>
                            {property.renterAddresses[0] === "0.0" &&
                              <p>0x</p>}
                          </>
                        }
                        {ethers.utils.formatEther(property.renterAddresses[2]).toString() !== "0.0" ?
                          <div className='flex items-center justify-between mb-2'>
                            <p className={" break-words"}>
                              {property.renterAddresses[2]}
                            </p>
                            <Blockies
                              seed={property.renterAddresses[2]}
                            />
                          </div>
                          : <>
                            {property.renterAddresses[0] === "0.0" &&
                              <p>0x</p>}
                          </>
                        }
                        {ethers.utils.formatEther(property.renterAddresses[3]).toString() !== "0.0" ?
                          <div className='flex items-center justify-between'>
                            <p className={" break-words"}>
                              {property.renterAddresses[3]}
                            </p>
                            <Blockies
                              seed={property.renterAddresses[3]}
                            />
                          </div>
                          : <>
                            {property.renterAddresses[0] === "0.0" &&
                              <p>0x</p>}
                          </>
                        }
                      </div>
                      <SaleHistory property={property} />
                    </div>
                  </div>
                </div>
              )

            })}
          </section>
         
            <div className='mt-6'>
              <Pagination
                postsPerPage={postsPerPage}
                totalPosts={500}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          
        </div>
      </div>
    </div>
  );
};

export default AllProperties;

//what happens if rent more than one room with same address?
