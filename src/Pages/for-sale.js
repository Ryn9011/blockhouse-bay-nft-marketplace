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
if (window.ethereum) {
  window.ethereum.on('accountsChanged', function (accounts) {
    window.location.reload();
  });
}

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
  const [onlyWithRentals, setOnlyWithRentals] = useState(false);
  const [rentedPropertyCount, setRentedPropertyCount] = useState(0);
  const [noRentImage, setNoRentImage] = useState('');
  const [loadingSmall, setLoadingSmall] = useState(true);


  useEffect(() => {
    // console.log(provider);
    // console.log(signer);
    setLoadingState('not-loaded');
    if (signer == null) {

      return;
    }
    if (provider != null) {

      loadProperties();
    }
  }, [currentPage, signer]);

  useEffect(() => {
    loadProperties();
    setCurrentPage(1);
  }, [onlyWithRentals]);

  useEffect(() => {
    const smallImg = new Image();
    smallImg.src = 'col.png'; // The background image URL
    smallImg.onload = () => {
      setNoRentImage(smallImg.src); // Store the loaded image source
      setLoadingSmall(false);
    }
  }, []);



  const loadProperties = async (currentPaged, i) => {
    try {
      const marketContract = new Contract(nftmarketaddress, PropertyMarket.abi, signer)
      const govtContract = new Contract(govtaddress, GovtFunctions.abi, provider);
      const tokenContract = new Contract(nftaddress, NFT.abi, provider);

      const data = await marketContract.fetchPropertiesForSale(currentPage, onlyWithRentals)

      const numForSale = Number(await govtContract.getPropertiesForSale());
      const rentedPropertyCount = Number(await govtContract.getRentedProperties());

      const currentPageNumItems = numForSale - (20 * (currentPage - 1))
      const showBottomNav = currentPageNumItems > 12 ? true : false
      if (!onlyWithRentals) {
        setShowBottomNav(showBottomNav);
      }
      setNumForSale(numForSale);
      setRentedPropertyCount(rentedPropertyCount);

      const items = await Promise.all(data.filter(a => Number(a.tokenId) !== 0).map(async i => {

        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        // const tokenUri = 'https://dummyimage.com/300x200/000/fff'

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


        let price = ethers.formatUnits(i.salePrice.toString(), 'ether')
    
        let tokenSalePriceFormatted = ethers.formatUnits(i.tokenSalePrice.toString(), 'ether')
        let saleHistory = [];
        if (i.saleHistory.length > 0) {
          i.saleHistory.forEach((item) => {
            const history = i.saleHistory.map((item) => {
              return {
                price: ethers.formatUnits(item[0]),
                type: Number(item[1]) === 1 ? "POL" : "BHB"
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
        // console.log(typeof (i.propertyId))

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

  const handleOnlyRentals = (e) => {
    // console.log('rentedPropertyCount:', e);
    const showBottomNav = rentedPropertyCount > 12 ? true : false

    setShowBottomNav(showBottomNav);
    setOnlyWithRentals(e);
  };

  const buyProperty = async (nft, i) => {
    try {
      let brb = document.getElementById("pogRadio" + i)
      let matic = document.getElementById("maticRadio" + i)
      if (brb.checked === false && matic.checked === false) {
        return;
      }

      const contract2 = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer);
      let price = ethers.parseUnits(nft.price.toString());

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
          const allowSenderTx = await propertyTokenContract.allowSender(amount);
          await allowSenderTx.wait();
        }
      }

      
      const transaction = await contract2.createPropertySale(
        nft.propertyId,
        isTokenSale,
        {
          value: price.toString(),
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
    } catch (ex) {
      // Handle the error when the user rejects the transaction in MetaMask
      console.error("Transaction rejected by the user or an error occurred:", ex);
      alert(ex.message.substring(0, ex.message.indexOf('(')))
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
          <div className="flex items-center pl-6 lg:px-12">
            <p className="text-white text-3xl lg:text-5xl font-bold mb-2">Loading Properties</p>
            <div className="ml-2 mb-2">
              <svg className="h-[1.55rem] lg:h-[2.5rem] w-auto" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <rect x="1" y="1" rx="1" width="10" height="10" fill="white">
                  <animate id="spinner_c7A9" begin="0;spinner_23zP.end" attributeName="x" dur="0.2s" values="1;13" fill="freeze" />
                  <animate id="spinner_Acnw" begin="spinner_ZmWi.end" attributeName="y" dur="0.2s" values="1;13" fill="freeze" />
                  <animate id="spinner_iIcm" begin="spinner_zfQN.end" attributeName="x" dur="0.2s" values="13;1" fill="freeze" />
                  <animate id="spinner_WX4U" begin="spinner_rRAc.end" attributeName="y" dur="0.2s" values="13;1" fill="freeze" />
                </rect>
                <rect x="1" y="13" rx="1" width="10" height="10" fill="white">
                  <animate id="spinner_YLx7" begin="spinner_c7A9.end" attributeName="y" dur="0.2s" values="13;1" fill="freeze" />
                  <animate id="spinner_vwnJ" begin="spinner_Acnw.end" attributeName="x" dur="0.2s" values="1;13" fill="freeze" />
                  <animate id="spinner_KQuy" begin="spinner_iIcm.end" attributeName="y" dur="0.2s" values="1;13" fill="freeze" />
                  <animate id="spinner_arKy" begin="spinner_WX4U.end" attributeName="x" dur="0.2s" values="13;1" fill="freeze" />
                </rect>
                <rect x="13" y="13" rx="1" width="10" height="10" fill="white">
                  <animate id="spinner_ZmWi" begin="spinner_YLx7.end" attributeName="x" dur="0.2s" values="13;1" fill="freeze" />
                  <animate id="spinner_zfQN" begin="spinner_vwnJ.end" attributeName="y" dur="0.2s" values="13;1" fill="freeze" />
                  <animate id="spinner_rRAc" begin="spinner_KQuy.end" attributeName="x" dur="0.2s" values="1;13" fill="freeze" />
                  <animate id="spinner_23zP" begin="spinner_arKy.end" attributeName="y" dur="0.2s" values="1;13" fill="freeze" />
                </rect>
              </svg>
            </div>
          </div>


          <img src="autumn.png" className="pl-6 pr-6 h-3/6 w-full md:h-5/6 lg:h-4/6 xl3:h-5/6 lg:w-3/6 xl3:w-3/5 lg:pl-12 brightness-110" />
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
        <div className="lg:px-4 md:ml-20" style={{ maxWidth: "1600px" }}>
          <p className="ml-7 lg:ml-0 text-5xl font-bold md:mb-16 lg:mb-24 xl3:mb-10 text-white xl3:mt-4">For Sale</p>
          <div className="image-container hidden lg:block ml-48 xl3:ml-80 drop-shadow-lg absolute h-2/6 mt-20  md:w-4/5 mb-16 xl3:mb-64  right-9 lg:right-40 xl3:right-60 xl3:top-20">
            <img src={noRentImage} className=" rotate-away2  shadow-2xl shadow-amber-100" />
            <div className='h-10 mt-16'></div>
            {/* <div className="gradient-overlay2 md:h-5/6"></div> */}
          </div>
          <p className='text-white text-base md:text-left md:text-2xl xl3:text-4xl font-semibold pt-2 mt-8 md:mt-12 lg:mt-24 xl3:mt-32 lg:pt-4 pl-7 lg:pl-12'>No properties currently for sale</p>
          <p className='text-white text-sm pt-2 lg:pt-4 pl-11 italic lg:pl-7 md:text-base'>Check back soon for new listings</p>
          <p className="text-xs pl-7 mb-6 md:mb-12 lg:mb-0 lg-pl-0 md:text-lg  underline italic mt-2   md:mt-6 lg:mt-0 mr-1 text-blue-300">
            <label className="inline-flex items-center cursor-pointer mb-3 pt-4 pl-0 ">
              <input type="checkbox" checked={onlyWithRentals} onChange={(e) => handleOnlyRentals(e.target.checked)} className="sr-only peer " />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-400"></div>
            <span className="ms-3 text-sm text-gray-900 font-semibold dark:text-green-100">Show only properties with tenants</span>
            </label>
          </p>
        </div>
        <div className="image-container hidden lg:block drop-shadow-lg absolute h-5/6 md:h-1/3 md:w-full lg:pt-60 right-9 lg:right-40 xl3:right-60 xl3:top-20">
          {/* <img src="col.png" className=" rotate-away shadow-2xl shadow-amber-100" /> */}
          <div className='h-10 mt-16'></div>
          {/* <div className="gradient-overlay2 md:h-5/6"></div> */}
        </div>


      </div>
      <div className="image-container lg:hidden md:ml-24 drop-shadow-lg mt-12 mb-16 left-2 col-span-12 absolute h-5/6 md:h-1/3 md:w-3/4 lg:w-2/4 md:pt-10 lg:pt-32 md:right-30">
        <img src={noRentImage} className="rotate-away2 brightness-110 shadow-2xl shadow-amber-100" />
        <div className='h-10 mt-16'></div>
        {/* <div className="gradient-overlay2 md:h-5/6"></div> */}
      </div>
    </div>
  )



  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-6 md:px-9" style={{ maxWidth: "1600px" }}>
          <p className="text-5xl xl3:text-6xl font-bold text-white">For Sale</p>
          <div className="flex text-white pl-4">
            {/* <h5>Rent a property and earn</h5> */}
            <header className="flex items-center h-16 mb-1 mr-3">
              <p className="text-sm md:text-xl font-bold">Buy a property and earn POL tokens from your renters!</p>
            </header>
            <div className='mb-1'>
              <img className="h-8 w-9 mr-2 mt-4" src="./polygonsmall.png" />
            </div>
          </div>

          {/* {currentPage === 1 &&  */}
          <label className="inline-flex items-center cursor-pointer mb-3 pt-2 pl-4 lg:pl-0 lg:pt-4">
            <input type="checkbox" checked={onlyWithRentals} onChange={(e) => handleOnlyRentals(e.target.checked)} className="sr-only peer " />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 dark:peer-focus:ring-green-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-400"></div>
            <span className="ms-3 text-sm text-gray-900 font-semibold dark:text-green-100">Show only properties with tenants</span>
          </label>
          {/* } */}

          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={onlyWithRentals ? rentedPropertyCount : numForSale}
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
                  <input
                    type="hidden"
                    id={"propertyId"}
                    value={property.propertyId}
                  />
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
                        <p className="font-mono text-xs text-green-400">{property.rentPrice} POL</p>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p>Total Income Generated:</p>
                        <p className="font-mono text-xs text-green-400">{property.totalIncomeGenerated} POL</p>
                      </div>
                      <SaleHistory property={property} />
                    </div>
                  </div>

                  <div className="p-2 pt-2 pb-2 bg-black">
                    <div className="pb-1">
                      <div className='grid grid-rows-1'>

                        <div className="grid grid-cols-2 divide-x divide-white h-6">
                          <div className="flex justify-start pl-2">
                            <p className='font-semibold pr-3'>POL</p>
                            <img className="h-[27px]  w-7" src="./polygonsmall.png" />
                          </div>
                          <div className="flex justify-start pl-2">
                            <p className='font-semibold pl-1 pr-3'>BHB</p>
                            <img className="h-[28px] w-7 brightness-200" src="./tokenfrontsmall.png" alt="" />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 justify-between divide-x divide-white mb-2 text-xl lg:text-base">
                          <div className="flex px-2">
                            <div className='pt-1.5'>
                              <input
                                className="rounded-full flex-shrink-0 h-3 w-3 border border-pink-400 bg-white checked:bg-pink-600 checked:border-pink-600 focus:outline-none transition duration-200 mt-2.5 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                                type="radio"
                                name="flexRadioDefault"
                                id={"maticRadio" + i}
                              //onChange={onCurrencyChange}
                              />
                            </div>
                            <label htmlFor={"maticRadio" + i} className="cursor-pointer mb-2 mr:6 md:mr-12 pt-3.5 xl3:pt-3 text-white text-xs xl3:text-sm">
                              <p className="font-bold whitespace-br`eak-spaces">{property.price} </p>
                              {/* <p className='font-bold'>MATIC</p> */}
                            </label>
                            <div>
                              {/* <img className="h-9 w-10 mr-2 mt-3.5" src="./polygonsmall.png" /> */}
                            </div>
                          </div>

                          <div className="pl-3">
                            {property.tokenSalePrice > 0 && (
                              <>
                                <div className=''>
                                  <input
                                    className="mt-4 mr-2 rounded-full flex-shrink-0 h-3 w-3 border border-pink-400 bg-white checked:bg-pink-600 checked:border-pink-600 focus:outline-none transition duration-200 align-center bg-no-repeat bg-center bg-contain float-left cursor-pointer"
                                    type="radio"
                                    name="flexRadioDefault"
                                    id={"pogRadio" + i}
                                    value="./pogtoken.png"
                                  //onChange={onCurrencyChange}
                                  />
                                </div>
                                <div className='flex items-center'>
                                  <label htmlFor={"pogRadio" + i} className="mb-2 cursor-pointer pt-3.5 xl3:pt-3 text-xs xl3:text-sm text-white">
                                    <p className="font-bold">{property.tokenSalePrice}</p>
                                  </label>
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
                                <div className='flex items-center'>
                                  <label htmlFor={"pogRadio" + i} className="cursor-pointer mb-2 mr-8 pt-3.5 text-xs xl3:text-sm text-gray-500">
                                    <p className="font-bold">{property.tokenSalePrice} BHB</p>
                                  </label>

                                  {/* <div>
                                    <img
                                      className="scale-75 h-[55px] w-[55px]lg:h-4/6 sm:h-5/6 mt-3 sm:mt-1.5 lg:pt-0 brightness-150"
                                      src="./tokenfrontsmall.png"
                                      alt=""
                                    ></img>
                                  </div> */}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="px-2 flex justify-center">
                        {txloadingState[i] || txloadingStateB[i] ? (
                          <p className='w-full bg-matic-blue text-xs italic px-3 py-1 rounded'>
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
                totalPosts={onlyWithRentals ? rentedPropertyCount : numForSale}
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
