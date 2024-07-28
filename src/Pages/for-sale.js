import { React, useEffect, useState } from 'react'
import { useModalContext } from '../App'
import axios from 'axios'
import { Contract } from 'ethers'
import { Link } from 'react-router-dom';
import Blockies from 'react-blockies';
import { detectNetwork, getRpcUrl } from '../Components/network-detector';


import {
  nftaddress, nftmarketaddress, propertytokenaddress, govtaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import PropertyToken from '../artifacts/contracts/PropertyToken.sol/PropertyToken.json'
import GovtFunctions from '../artifacts/contracts/GovtFunctions.sol/GovtFunctions.json'
import Pagination from '../Pagination'
import SaleHistory from '../Components/sale-history'
import GetPropertyNames from '../getPropertyName'
import SpinnerIcon from '../Components/spinner';

/* global BigInt */

const ethers = require("ethers")

/* global BigInt */

window.ethereum.on('accountsChanged', function (accounts) {
  window.location.reload();
});

const ForSale = () => {
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(20);
  const [currentPosts, setCurrentPosts] = useState([]);
  const [numForSale, setNumForSale] = useState();
  const [showBottomNav, setShowBottomNav] = useState(false);
  const [txloadingState, setTxLoadingState] = useState({});
  const [txloadingStateB, setTxLoadingStateB] = useState({});
  const [retries, setRetries] = useState(5)
  const { modalEvent, provider, signer } = useModalContext();


  useEffect(() => {
    console.log(provider);
    console.log(signer);
    setLoadingState('not-loaded');
    if (signer == null) {      
      
      return;
    }
    if (provider != null) {
      
      loadProperties();
    }
  }, [currentPage, signer]);

  

  const loadProperties = async (currentPaged, i) => {        
    try {         
      const marketContract = new Contract(nftmarketaddress, PropertyMarket.abi, signer)    
      const govtContract = new Contract(govtaddress, GovtFunctions.abi, provider);
      const tokenContract = new Contract(nftaddress, NFT.abi, provider);

      const data = await marketContract.fetchPropertiesForSale(currentPage)
      console.log(data)
      const numForSale = Number(await govtContract.getPropertiesForSale());    

      const currentPageNumItems = numForSale - (20 * (currentPage - 1))
      const showBottomNav = currentPageNumItems > 12 ? true : false
      setShowBottomNav(showBottomNav);
      setNumForSale(numForSale);

      const items = await Promise.all(data.filter(a => Number(a.tokenId) !== 0).map(async i => {
      
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
      
        const meta = await axios.get(tokenUri) //not used?  

        var nftName = GetPropertyNames(meta, i.propertyId);

        const filterByCurrency = (currency) => {

          if (currency === "matic") {
            return currentPosts.filter(p =>
              p.tokenSalePrice === 0)
          } else {
            return currentPosts.filter(p =>
              p.tokenSalePrice > 0)
          }
        }

        if (i.propertyId == 2) {
          console.log('THIS ONE:', i)
        }

        let price = ethers.formatUnits(i.salePrice.toString(), 'ether')
        let tokenSalePriceFormatted = ethers.formatUnits(i.tokenSalePrice.toString(), 'ether')
        let saleHistory = [];
        if (i.saleHistory.length > 0) {
          i.saleHistory.forEach((item) => {
            const history = i.saleHistory.map((item) => {
              return {
                price: ethers.formatUnits(item[0]),
                type: Number(item[1]) === 1 ? "Matic" : "BHB"
              }
            });
            saleHistory = history;
          })
        } else {
          saleHistory.push("Unsold")
        }
        let owner = i.owner === '0x0000000000000000000000000000000000000000' ? 'Unowned' : i.owner
        let rentPrice = await ethers.formatUnits(i.rentPrice.toString(), 'ether')
        let totalIncomeGenerated = ethers.formatUnits(i.totalIncomeGenerated)
        console.log(typeof(i.propertyId))

        //let tokenSalePriceFormatted = ethers.formatUnits(hexTokenPrice, 'ether')
        let item = {
          price,
          propertyId: Number(i.propertyId),
          seller: i.seller,
          owner: owner,
          image: tokenUri,
          name: nftName,
          description: meta.data.description,
          roomOneRented: i.roomOneRented,
          roomTwoRented: i.roomTwoRented,
          roomThreeRented: i.roomThreeRented,
          roomFourRented: i.roomFourRented,
          roomsToRent: 0,
          saleHistory: saleHistory,
          dateSoldHistory: i.dateSoldHistory,
          dateSoldHistoryBhb: i.dateSoldHistoryBhb,
          rentPrice: rentPrice,
          totalIncomeGenerated: totalIncomeGenerated,
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
        if (item.roomFourRented == true) {
          item.roomsToRent++
        }
        return item
      }))
      setCurrentPosts(items.slice(0, 20))
      setLoadingState('loaded')
      setTxLoadingState({ ...txloadingState, [i]: false });
      setTxLoadingStateB({ ...txloadingStateB, [i]: false });
    } catch (error) {
      console.log(error)
      setTxLoadingState({ ...txloadingState, [i]: false });
      setTxLoadingStateB({ ...txloadingStateB, [i]: false });
      if (retries > 0) {
        return;
      } else {
        console.log('Retrying connection request...');
        const newRetries = retries - 1;
        setRetries(newRetries);

        loadProperties();
      }
    }
  }

  const buyProperty = async (nft, i) => {
    try {
      let brb = document.getElementById("pogRadio" + i)
      let matic = document.getElementById("maticRadio" + i)
      if (brb.checked === false && matic.checked === false) {
        return;
      }

      const contract2 = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer);
      let price = ethers.parseUnits(nft.price.toString());

      const bigIntValue = BigInt(price);   
      console.log('bigIntValue:', Number(bigIntValue));
      console.log('price:', Number(price));
      let isTokenSale = false;

      let propertyTokenContract = undefined;
      let amount = undefined;

      setTxLoadingState({ ...txloadingState, [i]: true });
      if (brb != undefined) {
        if (brb.checked) {
          price = ethers.parseUnits("0", 'ether');
          isTokenSale = true;
          propertyTokenContract = new ethers.Contract(propertytokenaddress, PropertyToken.abi, signer);
          amount = ethers.parseUnits(nft.tokenSalePrice, 'ether');
          await propertyTokenContract.allowSender(amount);
        }
      }           
      
      let gasLimit;
      console.log('here price?:', price.toString());
      try {
          gasLimit = await contract2.createPropertySale.estimateGas(
            nftaddress, 
            nft.propertyId, 
            propertytokenaddress, 
            isTokenSale,
            {
              value: price.toString(),
            }
          );  
      } catch (ex) {
        console.log('Error:', ex);
      }
      
      console.log('gasLimit:', gasLimit.toString());       
      const feeData = await provider.getFeeData();      
      const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas + ethers.parseUnits('2', 'gwei'); // Add a 2 gwei buffer
      const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('2', 'gwei'); // Ensure maxFeePerGas is greater
      console.log('price', typeof(price))
      const transaction = await contract2.createPropertySale(
        nftaddress,
        nft.propertyId,
        propertytokenaddress,
        isTokenSale,
        { 
          value: price.toString(),
          gasLimit: gasLimit,
          maxFeePerGas: maxFeePerGas.toString(),
          maxPriorityFeePerGas: maxPriorityFeePerGas.toString()
        }
      );

      if (document.getElementById("pogRadio" + i) != undefined) {
        if (document.getElementById("pogRadio" + i).checked) {
          await propertyTokenContract.allowSender(0);
        }
      }
      setTxLoadingState({ ...txloadingState, [i]: false });
      setTxLoadingStateB({ ...txloadingStateB, [i]: true });
      await transaction.wait();
      loadProperties(currentPage, i);
    } catch (error) {
      // Handle the error when the user rejects the transaction in MetaMask
      console.error("Transaction rejected by the user or an error occurred:", error);
      alert('Transaction Failed');
      setTxLoadingState({ ...txloadingState, [i]: false });
      setTxLoadingStateB({ ...txloadingStateB, [i]: false });
    }
  };


  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber)
  };

  if (loadingState !== 'loaded') return (
    <div className="pt-10 pb-10">
      <div className="flex ">
        <div className="lg:px-4 lg:ml-20" style={{ maxWidth: "1600px" }}>
          <div className="flex pl-6 lg:px-12">
            <p className="text-white text-3xl lg:text-5xl font-bold mb-2">Loading Properties</p>
            <Link to="/about?section=renting" target='new'>
              <svg role="status" className="mt-1 lg:mt-3 ml-3 inline w-8 h-8 mr-2 text-red-500 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
              </svg>
            </Link>
          </div>
          <img src="autumn.png" className="pl-6 pr-6 h-3/6 lg:h-4/6 xl3:h-5/6 lg:w-3/6 xl3:w-3/5 lg:pl-12" />
          <p className='text-white pl-6 pr-2 lg:pl-12 mt-4 font-extralight text-lg italic lg:w-3/5'>
            Explore the offerings of Blockhouse Bay, where the latest properties await discerning first-time buyers and seasoned investors seeking to enhance their real estate holdings.
          </p>
        </div>
      </div>
    </div>
  )

  if (loadingState === 'loaded' && !currentPosts.length) return (
    <div className="pt-10 pb-10">
      <div className="flex ">
        <div className="lg:px-4 lg:ml-20" style={{ maxWidth: "1600px" }}>
          <p className="ml-4 lg:ml-0 text-5xl xl3:text-6xl font-bold mb-6 text-white">For Sale</p>
          <p className="text-xl lg:text-xl pl-7 lg:pl-4 font-bold mr-1 text-white">No properties currently for sale</p>
          <p className='text-white text-base pt-2 lg:pt-4 pl-7 lg:pl-4'>Check back soon for new listings</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <p className="text-5xl xl3:text-6xl font-bold text-white">For Sale</p>
          <div className="flex text-white pl-4">
            {/* <h5>Rent a property and earn</h5> */}
            <header className="flex items-center h-16 mb-1 mr-3">
              <p className="text-sm lg:text-xl font-bold">Buy a property and earn Matic tokens </p>
            </header>
            <div className='mb-1'>
              <img className="h-8 w-9 mr-2 mt-4" src="./polygonsmall.png" />
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
                  className="border shadow rounded-md overflow-hidden bg-gradient-120 from-black via-black to-blue-400"
                >
                  {/* {console.log(property.propertyId + " hit")} */}
                  <img className='w-fit h-fit' src={property.image} alt="" />
                  <div className="p-4">
                    <p
                      style={{ height: "50px" }}
                      className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400"
                    >
                      {property.name}
                      {/* {names[i]} */}
                    </p>
                    <div style={{ overflow: "hidden" }}>
                      <div className='flex justify-between mb-2'>
                        <div>
                          <p>Owner:</p>
                          <p className={` text-green-400 font-mono ${property.owner === 'Unowned' ? 'text-xs' : 'text-[10px]'}`}>{property.owner}</p>
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
                        <p className="font-mono text-xs text-green-400">{property.roomsToRent}/4</p>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p>Rent Price:</p>
                        <p className="font-mono text-xs text-green-400">{property.rentPrice} Matic</p>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p>Total Income Generated:</p>
                        <p className="font-mono text-xs text-green-400">{property.totalIncomeGenerated} Matic</p>
                      </div>
                      <SaleHistory property={property} />
                    </div>
                  </div>

                  <div className="p-2 pb-1 pt-2 pb-2 bg-black">
                    <div className="pb-2">
                      <div className="flex divide-x divide-white mb-2 text-xl lg:text-base">
                        <div className="flex justify-between px-2">
                          <div className='pt-1.5'>
                            <input
                              className="rounded-full flex-shrink-0 h-3 w-3 border border-pink-400 bg-white checked:bg-pink-600 checked:border-pink-600 focus:outline-none transition duration-200 mt-2.5 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                              type="radio"
                              name="flexRadioDefault"
                              id={"maticRadio" + i}
                            //onChange={onCurrencyChange}
                            />
                          </div>
                          <label htmlFor={"maticRadio" + i}  className="cursor-pointer mb-2 mr-12 pt-2 text-white">
                            <p className="font-bold whitespace-break-spaces">{property.price} </p>
                            <p className='font-bold'>MATIC</p>
                          </label>
                          <div>
                            <img className="h-9 w-10 mr-2 mt-3.5" src="./polygonsmall.png" />
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
                              <label htmlFor={"pogRadio" + i} className="mb-2 cursor-pointer pt-2 text-white">
                                  <p className="font-bold">{property.tokenSalePrice} BHB</p>
                                </label>

                                <div>
                                  <img
                                    className="scale-75 h-[55px] w-[55px]lg:h-4/6 sm:h-5/6 mt-3 sm:mt-1.5 lg:pt-0 brightness-150"
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
                                  className="mt-4 mr-3 rounded-full flex-shrink-0 h-3 w-3 border border-gray-500 bg-gray-600 checked:bg-pink-600 checked:border-pink-600 focus:outline-none transition duration-200 align-center bg-no-repeat bg-center bg-contain float-left cursor-pointer"
                                  type="radio"
                                  name="flexRadioDefault"
                                  id={"pogRadio" + i}
                                  value="./pogtoken.png"
                                  disabled={true}
                                //onChange={onCurrencyChange}
                                />
                              </div>
                              <div className='flex'>
                                <label htmlFor={"pogRadio" + i} className="cursor-pointer mb-2 mr-8 pt-2 text-gray-500">
                                  <p className="font-bold">{property.tokenSalePrice} BHB</p>
                                </label>

                                <div>
                                  <img
                                    className="scale-75 h-[55px] w-[55px]lg:h-4/6 sm:h-5/6 mt-3 sm:mt-1.5 lg:pt-0 brightness-150"
                                    src="./tokenfrontsmall.png"
                                    alt=""
                                  ></img>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="px-2 flex justify-center">
                        {txloadingState[i] || txloadingStateB[i] ? (
                          <p className='w-full flex justify-center bg-matic-blue text-xs italic px-12 py-1 rounded'>
                            <SpinnerIcon text={(txloadingState[i] && !txloadingStateB[i]) ? 'Creating Tx' : 'Confirming Tx'} />
                          </p>
                        ) : (
                          <button
                            onClick={() => buyProperty(property, i)}
                            className="w-full hover:bg-sky-700 bg-matic-blue text-white font-bold py-2 px-12 rounded cursor-pointer"
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </section>
          {showBottomNav &&
            <div className='mt-6'>
              <Pagination
                postsPerPage={postsPerPage}
                totalPosts={numForSale}
                paginate={paginate}
                currentPage={currentPage}
              />
            </div>
          }
        </div>
      </div>
    </div>
  );
};

export default ForSale;
