import { React, useEffect, useState, useMemo } from 'react'
import { ethers } from 'ethers'
import axios from 'axios'
import Web3Modal from 'web3modal'
import Ticker from 'react-ticker';
import Blockies from 'react-blockies';

import {
  nftaddress, nftmarketaddress, propertytokenaddress, govtaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import PropertyToken from '../artifacts/contracts/PropertyToken.sol/PropertyToken.json'
import GovtFunctions from '../artifacts/contracts/GovtFunctions.sol/GovtFunctions.json'
import GetPropertyNames from '../getPropertyName'
import SaleHistory from '../Components/sale-history'
import { calculateRankingTotal, calculateRankingPosition } from '../calculateRanking'
import { detectNetwork, getRpcUrl } from '../Components/network-detector';
import SpinnerIcon from '../Components/spinner';

const Exclusive = () => {
  const [properties, setProperties] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(50);
  const [currentPosts, setCurrentPosts] = useState([]);
  const [numForSale, setNumForSale] = useState();
  const [txloadingState1, setTxLoadingState1] = useState({});
  const [txloadingState2, setTxLoadingState2] = useState({});

  // Get current posts


  useEffect(() => {
    loadProperties(currentPage)
  }, [])

  const loadNextPage = () => {
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    var current = currentPosts.slice(indexOfFirstPost, indexOfLastPost);
    setCurrentPosts(current)
  }

  useMemo(() => {
    loadNextPage(currentPage)
  }, [currentPage])

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  };

  const loadProperties = async () => {
    const network = await detectNetwork()

    const projectId = "xCHCSCf75J6c2TykwIO0yWgac0yJlgRL"
    const rpcUrl = getRpcUrl(network, projectId);

    const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, provider)
    const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, provider)
    const data = await govtContract.fetchExclusiveProperties();

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)

      const meta = await axios.get(tokenUri)
      let price = ethers.utils.formatUnits(i.salePrice.toString(), 'ether')

      let tokenSalePriceFormatted = ethers.utils.formatUnits(i.tokenSalePrice.toString(), 'ether')
      const renterAddresses = await marketContract.getPropertyRenters(i.propertyId);
      let nftName = GetPropertyNames(meta, i.propertyId)

      let owner = i.owner === '0x0000000000000000000000000000000000000000' ? 'Unowned' : i.owner
      let rentPrice = await ethers.utils.formatUnits(i.rentPrice.toString(), 'ether')
      let totalIncomeGenerated = ethers.utils.formatUnits(i.totalIncomeGenerated)

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
        renterAddresses: renterAddresses,
        isForSale: i.isForSale,
        saleHistory: saleHistory,
        dateSoldHistory: i.dateSoldHistory,
        dateSoldHistoryBhb: i.dateSoldHistoryBhb,
        rentPrice: rentPrice,
        totalIncomeGenerated: totalIncomeGenerated
      }
      if (item.roomOneRented == true) {
        console.log("hit1")
        item.roomsToRent++
      }
      if (item.roomTwoRented == true) {
        console.log("hit2")
        item.roomsToRent++
      }
      if (item.roomThreeRented == true) {
        console.log("hit3")
        item.roomsToRent++
      }
      item.ranking = calculateRankingTotal(item)
      setTxLoadingState1({ ...txloadingState1, [i]: false });
      setTxLoadingState2({ ...txloadingState2, [i]: false });
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

    let properties = calculateRankingPosition(items);
    console.log(properties)
    setCurrentPosts(properties)
    setLoadingState('loaded')
  }


  const buyProperty = async (nft, i) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()

    const contract2 = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
    let price = ethers.utils.parseUnits(nft.price.toString(), 'ether')
    let isTokenSale = true
    const propertyTokenContract = new ethers.Contract(propertytokenaddress, PropertyToken.abi, signer)
    const amount = ethers.utils.parseUnits(nft.tokenSalePrice, 'ether')
    await propertyTokenContract.allowSender(amount)

    let relist = await contract2.getRelistCount();
    console.log(relist)
    const transaction = await contract2.createPropertySale(
      nftaddress,
      nft.propertyId,
      propertytokenaddress,
      isTokenSale,
      // { value: price }
    )
    setTxLoadingState1({ ...txloadingState1, [i]: true });
    try {
      await transaction.wait()
      loadProperties()
    } catch (error) {
      console.log(error)
      setTxLoadingState1({ ...txloadingState1, [i]: false });    
    }
  }

  const rentProperty = async (property, i) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)

    const signer = provider.getSigner()

    const govtContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)

    const deposit = await govtContract.getDepositRequired();

    const transaction = await govtContract.rentProperty(property.propertyId, {
      value: deposit
    });
    setTxLoadingState2({ ...txloadingState2, [i]: true });  
    try {
      await transaction.wait()
      loadProperties()
    } catch (error) {
      console.log(error)
      setTxLoadingState2({ ...txloadingState2, [i]: false });  
    }    
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
          <img src="gardens.png" className="pl-6 pr-6 h-4/5 lg:h-5/6 lg:w-3/5 lg:pl-12" />
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

          <h1 className="text-5xl text-center md:text-left xl3:text-6xl mb-5">Blockhouse Bay Gardens</h1>


          <div className="flex text-white pl-4 mb-6 lg:w-3/5">
            <p className='text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-500'>Blockhouse Bay Gardens, an exclusive street of grand and stunning homes, is a paradise of luxurious living. From impressive architecture to immaculate gardens, each house is a masterpiece of sophistication, offering an unparalleled lifestyle in one of the bay's most beautiful settings.</p>
          </div>
          <h5 className='text-white text-center md:text-left mb-4'>These exlusive properties are limited to only 50 and can be purchased only with BHB tokens</h5>
          <p className='text-white text-center md:text-left italic mb-12'>Tripple the amount of BHB tokens are paid out when renting on this street!</p>


          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 xl:grid-cols-3 text-white">
            {currentPosts.map((property, i) => {
              return (
                <div
                  key={property.propertyId}
                  className="border-2 border-double border-yellow-500 shadow-lg  shadow-yellow-400 rounded-md overflow-hidden bg-gradient-120 from-black via-black to-green-900 mb-5 lg:mb-0"
                >
                  <img className='w-fit h-fit' src={property.image} alt="" />
                  <div className="p-4">
                    <h2
                      className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-500"
                    >
                      {property.name}
                    </h2>
                    <div style={{ overflow: "hidden" }}>
                      <div className='flex justify-between mb-2 mt-4'>
                        <div>
                          <p>Owner:</p>
                          <p className="text-[10px] xl:text-xs text-green-400 font-mono">{property.owner}</p>
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
                        <p className='text-indigo-100'>Rent Price:</p>
                        <p className="text-xs text-green-400 font-mono">{property.rentPrice} Matic</p>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p className='text-indigo-100'>Total Income Generated:</p>
                        <p className="text-xs text-green-400 font-mono">{property.totalIncomeGenerated} Matic</p>
                      </div>
                      <div className="flex flex-col mb-2">
                        <p className='text-indigo-100'>Rooms Rented:</p>
                        <p className="lg:pl-0 text-xs text-green-400 font-mono">{property.roomsToRent}/3</p>
                      </div>

                      <p className={`text-indigo-100 ${property.renterAddresses[0] === '0x0000000000000000000000000000000000000000' ? 'mb-2' : ''}`}>Tenants:</p>
                      <div className='text-[10px] lg:text-xs mb-3 text-green-400 font-mono'>

                        {ethers.utils.formatEther(property.renterAddresses[0]).toString() !== "0.0" ?
                          <>
                            <div className='flex items-center h-11 justify-between mb-2'>
                              <p className={" break-words"}>
                                {property.renterAddresses[0]}
                              </p>
                              <Blockies
                                seed={property.renterAddresses[0]}
                              />
                            </div>
                          </>
                          :
                          <>
                            <div className='flex items-center'>
                              <p className='h-11'>0x</p>
                            </div>
                          </>
                        }

                        {ethers.utils.formatEther(property.renterAddresses[1]).toString() !== "0.0" ?
                          <div className='flex items-center h-10 justify-between mb-4'>
                            <p className={" break-words"}>
                              {property.renterAddresses[1]}
                            </p>
                            <Blockies
                              seed={property.renterAddresses[1]}
                            />
                          </div>
                          :
                          <>
                            <div className='flex justify-between h-full items-center'>
                              <p className='h-11'>0x</p>
                            </div>
                          </>
                        }
                        {ethers.utils.formatEther(property.renterAddresses[2]).toString() !== "0.0" ?
                          <div className='flex items-center h-10 justify-between'>
                            <p className={" break-words"}>
                              {property.renterAddresses[2]}
                            </p>
                            <Blockies
                              seed={property.renterAddresses[2]}
                            />
                          </div>
                          :
                          <>
                            <div className='flex items-center'>
                              <p className='h-11'>0x</p>
                            </div>
                          </>
                        }


                      </div>
                      <div className="flex flex-col mb-2">
                        <SaleHistory property={property} />
                      </div>
                    </div>
                  </div>

                  <div className="h-44 px-2 pt-0.5 bg-black">

                    <div className="pb-2">
                      <div className="mb-2 text-2xl lg:text-base">
                        <div className="pl-3">


                          {(property.isForSale) ? (
                            <div className='flex divide-x-2'>
                              <div className='flex h-16 mr-8'>
                                <header className="items-center flex pt-3 md:pt-6 lg:pt-3.5 text-indigo-100">
                                  <p className="font-bold text-lg 2xl:text-2xl">{property.tokenSalePrice} BHB</p>
                                </header>
                                <div className='mt-1 h-[65px] lg:h-17 w-16 md:h-16'>
                                  <img
                                    className="lg:object-none brightness-150 scale-75 md:scale-75 lg:scale-50 pt-2.5 lg:pt-0"
                                    src="./tokenfrontsmall.png"
                                    alt=""
                                  ></img>
                                </div>
                              </div>

                              <div className="bg-black py-0.5 mt-2 w-1/2 pl-3 2xl:mt-1.5 flex flex-col justify-between">
                                <div className='text-lg md:text-xl 2xl:text-2xl flex flex-col  justify-center font-semibold text-center'>
                                  <p className=''>Ranking:</p>
                                  <span className={property.ranking == 'unranked' ? 'text-white text-lg' : 'italic brightness-125 text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-400 to-purple-500'}>{`${property.ranking === "unranked" ? '' : '#'} ${property.ranking}`}</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-black py-[10.5px] pr-1.5 mt-2  flex flex-col gap-2 justify-between">
                              <div className='text-2xl lg:pt-1.5 flex justify-center font-semibold'>
                                <p className='text-transparent bg-clip-text brightness-125 bg-gradient-to-r from-white via-white to-purple-500 italic'>Ranking:<span className={property.ranking == 'unranked' ? 'text-white' : ''}>{` #${property.ranking}`}</span></p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-2">
                        {(property.owner === 'Unowned' || property.isForSale) ? (
                          <>
                            {txloadingState1[i] ? (
                              <p className='w-full flex justify-center bg-btn-gold text-xs italic px-12 mt-1 mb-3 py-1 rounded'>
                              <SpinnerIcon />
                            </p>
                          ) : (
                            <button onClick={() => buyProperty(property, i)} className="mb-3 w-full bg-btn-gold text-white font-bold py-2 mt-1 px-12 rounded cursor-pointer">
                              Buy
                            </button>
                            )}
                          </>
                        ) : (
                          <div className='flex justify-center'>
                            <button disabled={true} className="md:mb-5 lg:mb-4 w-full  text-white font-bold py-2 mt-1 px-12 rounded">
                              Not Currently for Sale
                            </button>
                          </div>
                        )
                        }
                        {property.roomsToRent !== 3 ? (
                          <>
                            {txloadingState2[i] ? (
                              <p className='w-full flex justify-center bg-matic-blue text-xs italic px-12 py-1 mb-3 rounded'>
                                <SpinnerIcon />
                              </p>
                            ) : (
                              <button onClick={() => rentProperty(property, i)} disabled={property.owner === "Unowned"} className={`w-full bg-matic-blue cursor-pointer text-white font-bold py-2 px-12 rounded ${property.owner === "Unowned" ? "bg-gray-600 text-gray-400" : ""} `}>
                                Rent Room
                              </button>
                            )}
                          </>
                        ) : (
                          <button disabled='true' className="w-full bg-black text-red-400 font-bold py-2 px-12 rounded">
                            No Vacancy
                          </button>
                        )
                        }
                      </div>
                    </div>
                  </div>
                  <div className='h-2 xl:h-3 bg-black '></div>
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
