import { React, useEffect, useState } from 'react'
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

import datajson from '../final-manifest.json';

const ForSale = () => {
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(20);
  const [currentPosts, setCurrentPosts] = useState([]);
  const [numForSale, setNumForSale] = useState();

  useEffect(() => {
    setLoadingState('not-loaded')
    loadProperties(currentPage)
  }, [currentPage])

  const loadProperties = async () => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;

    const provider = new ethers.providers.JsonRpcProvider()
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, provider)
    const data = await marketContract.fetchPropertiesForSale(currentPage)
    const numForSale = await marketContract.getPropertiesForSale();
    setNumForSale(numForSale.toNumber());

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      console.log(i.propertyId.toNumber())
      const meta = await axios.get(tokenUri) //not used?  

      const url = meta.config.url

      const parts = url.split('/');

      const targetId = parts.slice(3).join('/');

      const getPropertyNames = (targetId) => {
        console.log(targetId)
        function getPathNameById(id) {
          for (const [pathKey, { id: pathId }] of Object.entries(datajson.paths)) {
            if (id === pathId) {
              return pathKey;
            }
          }
          return null;
        }

        // const targetId = "NkPscRzwlee3476uYweOFTEXvLM8Bnt_A0T2QypL6go";
        const targetPathName = getPathNameById(targetId);

        if (targetPathName) {
          var splitName = targetPathName.split('.');
          console.log(splitName)
          var name = splitName.slice(0, 1).join('.')

          return (name)
        } else {
          console.log(`No path name found for id ${targetId}.`);
        }
      }

      var nftName = getPropertyNames(targetId, i.propertyId);

      const filterByCurrency = (currency) => {

        if (currency === "matic") {
          return currentPosts.filter(p =>
            p.tokenSalePrice === 0)
        } else {
          return currentPosts.filter(p =>
            p.tokenSalePrice > 0)
        }
      }

      let price = ethers.utils.formatUnits(i.salePrice.toString(), 'ether')
      let tokenSalePriceFormatted = ethers.utils.formatUnits(i.tokenSalePrice.toString(), 'ether')
      //let tokenSalePriceFormatted = ethers.utils.formatUnits(hexTokenPrice, 'ether')
      let item = {
        price,
        propertyId: i.propertyId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: tokenUri,
        name: nftName,
        description: meta.data.description,
        roomOneRented: i.roomOneRented,
        roomTwoRented: i.roomTwoRented,
        roomThreeRented: i.roomThreeRented,
        roomsToRent: 0,
        tokenSalePrice: tokenSalePriceFormatted

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
    setCurrentPosts(items.slice(0, 20))
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
    loadProperties(currentPage)
  }

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  };

  // const name = "4293 Carriage Court"
  // const name2 = "1965 Rocket Drive"
  // const name3 = "886 Grand Avenue"
  // const name4 = "1247 Sun Valley Road"

  // const names = new Array;
  // names.push(name)
  // names.push(name2)
  // names.push(name3)
  // names.push(name4)

  let count = 0

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
    <>
      <h1 className="px-8 lg:px-24 pt-10 text-3xl">No properties currently for sale</h1>
      <p className='text-white text-xl pt-4 pl-8 lg:pl-32'>Check back soon for new listings</p>
    </>    
  )

  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <p className="text-white text-5xl font-bold">For Sale</p>
          <div className="flex text-white pl-4">
            {/* <h5>Rent a property and earn</h5> */}
            <header className="flex items-center h-16 mb-1 mr-3">
              <p className="text-sm lg:text-xl font-bold">Buy a property and earn Matic tokens </p>
            </header>
            <div className='mb-1'>
              <img
                className="object-none scale-90 lg:scale-100 brightness-125"
                src="./matic-icon.png"
                alt=""
              ></img>
            </div>
          </div>
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={numForSale}
            paginate={paginate}
            currentPage={currentPage}
          />
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:grid-cols-4 text-white">
            {currentPosts.map((property, i) => {
              return (
                <div
                  key={property.propertyId}
                  className="border shadow rounded-md overflow-hidden bg-gradient-to-r from-blue-400 to-black"
                >
                  {console.log(property.propertyId + " hit")}
                  <img className='w-fit h-fit' src={property.image} alt="" />
                  <div className="p-4">
                    <p
                      style={{ height: "50px" }}
                      className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400"
                    >
                      {property.name}
                      {/* {names[i]} */}
                    </p>
                    <div style={{ height: "70px", overflow: "hidden" }}>
                      <div className="flex">
                        <p>Rooms Rented:</p>
                        <p className="pl-3">{property.roomsToRent}/3</p>
                      </div>
                      <div className="flex">
                        <p>Total Income Generated:</p>
                        <p className="pl-3">0 Matic</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2 pt-2 pb-2 bg-black">
                    <div className="pb-2">
                      <div className="flex divide-x divide-white mb-2 text-xl lg:text-base">
                        <div className="flex justify-between px-2">
                          <div className='pt-1.5'>
                            <input
                              className="rounded-full flex-shrink-0 h-3 w-3 border border-pink-400 bg-white checked:bg-pink-600 checked:border-pink-600 focus:outline-none transition duration-200 mt-2.5 align-top bg-no-repeat bg-center bg-contain float-left mr-3 cursor-pointer"
                              type="radio"
                              name="flexRadioDefault"
                              id={"maticRadio" + i}
                            //onChange={onCurrencyChange}
                            />
                          </div>
                          <div className="mb-2 pr-2 pt-2 text-white">
                            <p className="font-bold">{property.price} MATIC</p>
                          </div>
                          <div>
                            <img
                              className="object-none lg:pt-1.5"
                              src="./matic-icon.png"
                              alt=""
                            ></img>
                          </div>
                        </div>

                        <div className="pl-3">
                          {property.tokenSalePrice > 0 && (
                            <>
                              <div className=''>
                                <input
                                  className="mt-4 mr-3 rounded-full flex-shrink-0 h-3 w-3 border border-pink-400 bg-white checked:bg-pink-600 checked:border-pink-600 focus:outline-none transition duration-200 align-center bg-no-repeat bg-center bg-contain float-left cursor-pointer"
                                  type="radio"
                                  name="flexRadioDefault"
                                  id={"pogRadio" + i}
                                  value="./pogtoken.png"
                                //onChange={onCurrencyChange}
                                />
                              </div>
                              <div className='flex'>
                                <div className="mb-2 pt-2 text-white">
                                  <p className="font-bold">{property.tokenSalePrice} BHB</p>
                                </div>

                                <div>
                                  <img
                                    className="scale-75 h-4/6 sm:h-5/6 mt-3 sm:mt-1.5 lg:pt-0 brightness-150"
                                    src="./tokenfrontsmall.png"
                                    alt=""
                                  ></img>
                                </div>
                              </div>
                            </>
                          )}
                          {property.tokenSalePrice === "0.0" && (
                            <>
                              <div className=''>
                                <input
                                  className="mt-4 mr-3 cursor-default rounded-full flex-shrink-0 h-3 w-3 border border-gray-500 bg-gray-600 checked:bg-pink-600 checked:border-pink-600 focus:outline-none transition duration-200 align-center bg-no-repeat bg-center bg-contain float-left cursor-pointer"
                                  type="radio"
                                  name="flexRadioDefault"
                                  id={"pogRadio" + i}
                                  value="./pogtoken.png"
                                  disabled={true}
                                //onChange={onCurrencyChange}
                                />
                              </div>
                              <div className='flex'>
                                <div className="mb-2 mr-8 pt-2 text-gray-500">
                                  <p className="font-bold">{property.tokenSalePrice} BHB</p>
                                </div>

                                <div>
                                  <img
                                    className="scale-75 h-4/6 sm:h-5/6 mt-3 sm:mt-1.5 lg:pt-0 brightness-150"
                                    src="./tokenfrontsmall.png"
                                    alt=""
                                  ></img>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="px-2">
                        <button onClick={() => buyProperty(property, i)} className="w-full bg-matic-blue text-white font-bold py-2 px-12 rounded">
                          Buy
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

export default ForSale;
