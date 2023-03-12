import { React, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { NftTagHelper } from '../Components/Layout/nftTagHelper'
import Web3Modal from 'web3modal'

import {
  nftaddress, nftmarketaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import Pagination from '../Pagination'

const ToRent = () => {

  const [soldProperties, setSoldProperties] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  // const [propertyList, setPropertyList] = useState([]);

  const [postsPerPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = soldProperties.slice(indexOfFirstPost, indexOfLastPost);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, provider)
    const data = await marketContract.fetchPropertiesSold()

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)

      const nftTagHelper = new NftTagHelper()
      const arweaveId = nftTagHelper.getIdFromGraphUrl(tokenUri)
      
      const tags = await nftTagHelper.getNftTags(arweaveId)
    
      const nameTags = tags.data.transactions.edges[0].node.tags[0]
     
      let nftName

      if (nameTags['name'] === "Application") {
        nftName = nameTags['value']
      }
      
      let price = await ethers.utils.formatUnits(i.salePrice.toString(), 'ether')
      let rentPrice = await ethers.utils.formatUnits(i.rentPrice.toString(), 'ether')
      let depositHex = await marketContract.depositRequired()
      let deposit = await ethers.utils.formatUnits(depositHex, 'ether')
      const renterAddresses = await marketContract.getPropertyRenters(i.propertyId);

      let item = {
        price,
        propertyId: i.propertyId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: tokenUri,
        name: nftName,
        description: '',
        roomOneRented: i.roomOneRented,
        roomTwoRented: i.roomTwoRented,
        roomThreeRented: i.roomThreeRented,
        rentPrice: rentPrice,
        depositRequired: deposit,
        available: false,
        roomsRented: 0,
        renterAddresses: renterAddresses

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
      return item
    }))
    setSoldProperties(items)
    // setPropertyList(items)
    setLoadingState('loaded')
  }

  const rentProperty = async (property) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)

    const test = await marketContract.depositRequired();
    const deposit = ethers.utils.parseUnits(test.toString(), 'ether')
    const num = ethers.utils.formatEther(deposit)
    const rentals = await marketContract.getPropertiesRented()
    // ? ethers.utils.parseUnits(property.rentPrice.toString(), 'ether') 
    // : ethers.utils.parseUnits(contract.defaultRentPrice.toString(), 'ether')
    //STOP SAME ADDRESS RENTING MORE THAN ONE ROOM?
    const transaction = await marketContract.rentProperty(property.propertyId, {
      value: test
    });
    await transaction.wait()
    loadProperties()
  }

  if (loadingState !== 'loaded') return (
    <div className="flex px-12">
      <h1 className="pr-4 py-10 text-3xl">Loading Properties</h1>
      <svg role="status" className="mt-10 inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
      </svg>
    </div>
  )

  if (loadingState === 'loaded' && !soldProperties.length) return (
    <h1 className="px-20 py-10 text-3xl">No properties currently to rent</h1>
  )

  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <h1 className="text-white mb-5">Properties to Rent</h1>
          <div className="flex text-white pl-4 mb-3">
            <h5>Rent a property and earn</h5>
            <div className="pb-2">
              <img
                className="object-none scale-75 pr-0.5 pl-1"
                src="./pogtoken.png"
                alt=""
              ></img>
            </div>
            <h5 className="text-white mb-4">tokens</h5>
          </div>
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={soldProperties.length}
            paginate={paginate}
            currentPage={currentPage}
          />
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-white">         
              {currentPosts.map((property, i) => {
                if (property.roomsRented < 3) {
                  return (
                    <div
                      key={i}
                      className="border shadow rounded-md overflow-hidden bg-gradient-to-r from-blue-400 to-black"
                    >
                      <img src={property.image} alt="" />
                      <div className="p-4 ">
                        <p
                          style={{ height: "64px" }}

                          className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400"
                        >
                          {/* {property.name} */}
                          4293 Carriage Court
                        </p>
                        <div style={{ overflow: "hidden" }}>
                          <div className="flex flex-col pb-4">
                            <p>Owner:</p>
                            <p className="text-xs">{property.owner}</p>
                          </div>
                          <div className="flex">
                            <p>Rent Price:</p>
                            <p className="pl-3">{property.rentPrice} Matic</p>
                          </div>
                          <div className="flex">
                            <p>Rooms Rented:</p>
                            <p className="pl-3">{property.roomsRented}/3</p>
                          </div>
                          <p>Tenants</p>
                          <div className='text-xs mt-2 text-green-200'>
                            {ethers.utils.formatEther(property.renterAddresses[0]).toString() !== "0.0" ?
                              <p className="break-words">
                                {property.renterAddresses[0]}
                              </p>
                              : <p>0x</p>
                            }
                            {ethers.utils.formatEther(property.renterAddresses[1]).toString() !== "0.0" ?
                              <p className="break-words">
                                {property.renterAddresses[1]}
                              </p>
                              : <p>0x</p>
                            }
                            {ethers.utils.formatEther(property.renterAddresses[2]).toString() !== "0.0" ?
                              <p className="break-words">
                                {property.renterAddresses[2]}
                              </p>
                              : <p>0x</p>
                            }
                          </div>
                        </div>
                      </div>

                      <div className="p-2 pt-1.2 pb-4 bg-black">
                        <div className="flex divide-x divide-white justifty-start px-2">
                          <div className="flex pr-5 lg:pr-3">
                            <div className="text-lg font-bold pr-1">Deposit Required</div>
                            <div className="relative flex flex-col items-center group">
                              <svg
                                className="w-4 h-4 text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
                                <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg">
                                  Learn more
                                </span>
                                <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
                              </div>
                            </div>
                          </div>
                          <div className="flex text pl-5 lg:pl-3">
                            <div className="font-bold pt-0.5 pr-1">
                              <span>{property.depositRequired} MATIC</span>
                            </div>
                            <div>
                              <img
                                className="object-none scale-75 pt-0.5"
                                src="./matic-icon.png"
                                alt=""
                              ></img>
                            </div>
                          </div>
                        </div>
                        <div className="text-2xl pt-2 text-white"></div>

                        <div className="px-2">
                          <button onClick={() => rentProperty(property)} className="w-full bg-matic-blue text-white font-bold py-2 px-12 rounded">
                            Rent Room
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                }
              })}            
          </section>
        </div>
      </div>
    </div>
  );
};

export default ToRent;

//what happens if rent more than one room with same address?
