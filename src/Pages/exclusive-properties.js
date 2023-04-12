import { React, useEffect, useState, useMemo } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'

import {
  nftaddress, nftmarketaddress, propertytokenaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import PropertyToken from '../artifacts/contracts/PropertyToken.sol/PropertyToken.json'
import Pagination from '../Pagination'
import GetPropertyNames from '../getPropertyName'

const Exclusive = () => {  
  const [properties, setProperties] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(50);
  const [currentPosts, setCurrentPosts] = useState([]);
  const [numForSale, setNumForSale] = useState();

  // Get current posts

  
  useEffect(() => {
    loadProperties(currentPage)
  }, [])

  const loadNextPage = () => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;    
    var current = properties.slice(indexOfFirstPost, indexOfLastPost);
    setCurrentPosts(current)
  }

  useMemo(() => {
    loadNextPage(currentPage)
  }, [currentPage])

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)    
  };

  const loadProperties = async () => {
    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, provider)
    const data = await marketContract.fetchExclusiveProperties();
    
    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      
      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.salePrice.toString(), 'ether')

      let tokenSalePriceFormatted = ethers.utils.formatUnits(i.tokenSalePrice.toString(), 'ether')
      const renterAddresses = await marketContract.getPropertyRenters(i.propertyId);
      let nftName = GetPropertyNames(meta, i.propertyId)

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
        roomsToRent: 0,
        tokenSalePrice: tokenSalePriceFormatted,
        renterAddresses: renterAddresses
      }
      if (item.roomOneRented == true) {
        item.roomsToRent++
      }
      if (item.roomTwoRented == true) {
        item.roomsToRent++
      }
      if (item.roomThreeRented == true) {
        item.roomsToRent++
      }
      return item
    }))
    console.log(items)
    items.sort((a, b) => {
      const regex = /^\d+/; // regular expression to match the beginning number
      const aNumber = (a.name && a.name.match(regex)) ? parseInt(a.name.match(regex)[0]) : 0;
      const bNumber = (b.name && b.name.match(regex)) ? parseInt(b.name.match(regex)[0]) : 0;
      return aNumber - bNumber; // compare the numbers and return the result
    });
    
    console.log(items);

    setProperties(items)
    setCurrentPosts(items)
    setLoadingState('loaded')
  }

  const buyProperty = async (nft, i) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()
   
    const contract2 = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)    
    let price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    let isTokenSale = false
    if (document.getElementById("pogRadio" + i) != undefined) {
      if (document.getElementById("pogRadio" + i).checked) {
        price = ethers.utils.parseUnits("2", 'ether')      
        isTokenSale = true
        const propertyTokenContract = new ethers.Contract(propertytokenaddress, PropertyToken.abi, signer)
        const amount = ethers.utils.parseUnits(nft.tokenSalePrice, 'ether')
        await propertyTokenContract.allowSender(amount)
      }
    }
  
    const transaction = await contract2.createPropertySale(
      nftaddress,
      nft.propertyId,
      propertytokenaddress,
      isTokenSale,
      { value: price }
    )
    await transaction.wait()
  }

  const rentProperty = async (property) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)

    const test = await marketContract.depositRequired();
    const deposit = ethers.utils.parseUnits(test.toString(), 'ether')
    const transaction = await marketContract.rentProperty(property.propertyId, {
      value: test
    });
    await transaction.wait()
    //loadProperties() need to refactor in useeffect?
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
        </div>
      </div>
    </div>
  )

  if (loadingState === 'loaded' && !currentPosts.length) return (
    <h1 className="px-20 py-10 text-3xl">No properties currently for sale</h1>
  )

  //4293 Carriage Court
  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <h1 className=" mb-5">Blockhouse Bay Gardens</h1>
          <div className="flex text-white pl-4 mb-6">
            <p className=''>Blockhouse Bay Gardens, an exclusive street of grand and stunning homes, is a paradise of luxurious living. From impressive architecture to immaculate gardens, each house is a masterpiece of sophistication, offering an unparalleled lifestyle in one of the bay's most beautiful settings.</p>
            
            <div className="pb-2">
              
            </div>
          </div>
          <h5 className='text-white mb-4'>These exlusive properties are limited to only 50 and can be purchased only with BHB tokens</h5>
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={50}
            paginate={paginate}
            currentPage={currentPage}
          />
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:grid-cols-3 text-white">          
              {currentPosts.map((property, i) => {
                return (
                  <div
                    key={property.propertyId}
                    className="border-2 border-double border-yellow-200 shadow-2xl shadow-yellow-400 rounded-md overflow-hidden bg-gradient-to-r from-fuchsia-500 to-black"
                  >
                    <img className='w-fit h-fit' src={property.image} alt="" />
                    <div className="p-4 ">
                      <h2
                        style={{ height: "45px" }}
                        className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-500"
                      >
                        {property.name}
                      </h2>
                      <div style={{ overflow: "hidden" }}>                        
                          <div className="flex flex-col pb-2 pt-4">
                            <p>Owner:</p>
                            <p className="text-xs text-green-400">{property.owner}</p>
                          </div>
                          <div className="flex flex-col mb-2">
                            <p>Rooms Rented:</p>
                            <p className="pl-3 lg:pl-0 text-xs text-green-400">{property.roomsToRent}/3</p>
                          </div>
                          <p>Tenants:</p>
                          <div className='text-xs text-green-200'>
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

                    <div className="p-2 pt-2 pb-2 bg-black">
                      <div className="pb-2">
                        <div className="flex justify-center mb-2 text-2xl lg:text-base">
                   

                          <div className="pl-3">
                            {property.tokenSalePrice > 0 && (
                              <div className='flex'>                  
                                <header className="items-center flex text-white">
                                  <p className="font-bold 2xl:text-2xl">{property.tokenSalePrice} BHB</p>
                                </header>
                                <div>
                                  <img
                                    className="object-none brightness-150 scale-75 pt-1.5 lg:pt-0"
                                    src="./tokenfrontsmall.png"
                                    alt=""
                                  ></img>
                                </div>
                              </div>
                            )}
                            {property.tokenSalePrice === "0.0" && (
                              <div className='flex'>
                                <div className="mb-2 pl-1 pr-1 pt-2 text-gray-500">
                                  <p className="font-bold">0 BHB</p>
                                </div>

                                <div>
                                  <img
                                    className="object-none grayscale scale-75 pt-1.5 pr-4 lg:pt-0"
                                    src="./pogtoken.png"
                                    alt=""
                                  ></img>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="px-2">
                          <button onClick={() => buyProperty(property, i)} className="mb-4 w-full bg-btn-gold text-white font-bold py-2 px-12 rounded">
                            Buy
                          </button>
                          <button onClick={() => rentProperty(property)} className="w-full bg-matic-blue text-white font-bold py-2 px-12 rounded">
                            Rent Room
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}            
          </section>        
        </div>
      </div>      
    </div>
  );
};

export default Exclusive;
