import { React, useEffect, useState } from 'react'
import { useModalContext } from '../App'
import axios from 'axios'

import Blockies from 'react-blockies';

import { Contract } from 'ethers'

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
import SpinnerIcon from '../Components/spinner';

const ethers = require("ethers")


if (window.ethereum) {
  window.ethereum.on('accountsChanged', function (accounts) {
    window.location.reload();
  });
}

const Exclusive = () => {

  const [loadingState, setLoadingState] = useState('not-loaded')

  const [currentPosts, setCurrentPosts] = useState([]);
  const [numForSale, setNumForSale] = useState();
  const [txloadingState1, setTxLoadingState1] = useState({});
  const [txloadingState2, setTxLoadingState2] = useState({});
  const [txloadingState1B, setTxLoadingState1B] = useState({});
  const [txloadingState2B, setTxLoadingState2B] = useState({});

  const [retries, setRetries] = useState(3)
  const { modalEvent, provider, signer } = useModalContext();

  useEffect(() => {
    console.log(provider);
    console.log(signer);
    if (signer == null) {

      return;
    }
    if (provider != null) {

      loadProperties();
    }
  }, [signer]);

  const loadProperties = async () => {
    try {
      const tokenContract = new Contract(nftaddress, NFT.abi, provider)
      const marketContract = new Contract(nftmarketaddress, PropertyMarket.abi, signer)
      const govtContract = new Contract(govtaddress, GovtFunctions.abi, provider)
      const data = await govtContract.fetchExclusiveProperties();

      const items = await Promise.all(data.filter(i => Number(i.propertyId) != 0 && (a => Number(a.tokenId) !== 0)).map(async i => {
        const tokenUri = await tokenContract.tokenURI(i.tokenId)

        const meta = await axios.get(tokenUri)
        let price = ethers.formatUnits(i.salePrice.toString(), 'ether')
        let depositHex = i.deposit//await govtContract.getDepositRequired();
        let deposit = ethers.formatUnits(depositHex, 'ether')

        let tokenSalePriceFormatted = ethers.formatUnits(i.tokenSalePrice.toString(), 'ether')
        const renterAddresses = await marketContract.getPropertyRenters(i.propertyId);
        let nftName = GetPropertyNames(meta, i.propertyId)

        let owner = i.owner === '0x0000000000000000000000000000000000000000' ? 'Unowned' : i.owner
        let rentPrice = await ethers.formatUnits(i.rentPrice.toString(), 'ether')
        let totalIncomeGenerated = ethers.formatUnits(i.totalIncomeGenerated)

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
          tokenSalePrice: tokenSalePriceFormatted,
          depositRequired: deposit,
          depositHex: depositHex,
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
        if (item.roomFourRented == true) {
          console.log("hit4")
          item.roomsToRent++
        }
        item.ranking = calculateRankingTotal(item)
        setTxLoadingState1({ ...txloadingState1, [i]: false });
        setTxLoadingState2({ ...txloadingState2, [i]: false });
        setTxLoadingState1B({ ...txloadingState1B, [i]: false });
        setTxLoadingState2B({ ...txloadingState2B, [i]: false });
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
    } catch (ex) {
      console.log(ex.message)
      if (retries === 0) {
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
      const contract2 = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
      let isTokenSale = true
      const propertyTokenContract = new ethers.Contract(propertytokenaddress, PropertyToken.abi, signer)
      const amount = ethers.parseUnits(nft.tokenSalePrice, 'ether')
      setTxLoadingState1({ ...txloadingState1, [i]: true });
      try {
        let gasLimit = await propertyTokenContract.allowSender.estimateGas(amount);

        gasLimit = gasLimit + 100000n;

        const feeData = await provider.getFeeData();
        const basePriorityFee = feeData.maxPriorityFeePerGas || ethers.parseUnits('1.5', 'gwei'); // Fallback to 1.5 gwei if undefined
        const maxPriorityFeePerGas = basePriorityFee + ethers.parseUnits('10', 'gwei'); // Add 2 gwei buffer
        const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('20', 'gwei'); // Add 5 gwei buffer to maxFeePerGas

        await propertyTokenContract.allowSender(
          amount, {
          maxFeePerGas: maxFeePerGas,
          maxPriorityFeePerGas: maxPriorityFeePerGas,
          gasLimit: gasLimit
        })
      } catch (error) {
        console.log(error)
        alert('Transaction aborted');
        setTxLoadingState1({ ...txloadingState1, [i]: false });
        setTxLoadingState1B({ ...txloadingState1B, [i]: false });
        return;
      }


      let gasLimit = await contract2.createPropertySale.estimateGas(nftaddress, nft.propertyId, propertytokenaddress, isTokenSale);

      gasLimit = gasLimit + 100000n;

      const feeData = await provider.getFeeData();

      const basePriorityFee = feeData.maxPriorityFeePerGas || ethers.parseUnits('1.5', 'gwei'); // Fallback to 1.5 gwei if undefined
      const maxPriorityFeePerGas = basePriorityFee + ethers.parseUnits('10', 'gwei'); // Add 2 gwei buffer
      const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('20', 'gwei'); // Add 5 gwei buffer to maxFeePerGas


      const transaction = await contract2.createPropertySale(
        nftaddress,
        nft.propertyId,
        propertytokenaddress,
        isTokenSale,
        {
          maxFeePerGas: maxFeePerGas,
          maxPriorityFeePerGas: maxPriorityFeePerGas,
          gasLimit: gasLimit,
        }
      )
      setTxLoadingState1({ ...txloadingState1, [i]: false });
      setTxLoadingState1B({ ...txloadingState1B, [i]: true });

      await transaction.wait()
      loadProperties()
    } catch (error) {
      console.log(error)
      alert('Transaction Failed');
      setTxLoadingState1({ ...txloadingState1, [i]: false });
      setTxLoadingState1B({ ...txloadingState1B, [i]: false });
    }
  }

  const rentProperty = async (property, i) => {

    const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, signer)

    // const deposit = property.deposit; //await govtContract.getDepositRequired();
    try {
      setTxLoadingState2({ ...txloadingState2, [i]: true });
      const transaction = await govtContract.rentProperty(property.propertyId, {
        value: property.depositHex
      });
      setTxLoadingState2({ ...txloadingState2, [i]: false });
      setTxLoadingState2B({ ...txloadingState2B, [i]: true });
      await transaction.wait()
      loadProperties()
    } catch (error) {
      if (error.message.includes('insufficient BHB token balance to rent excl')) {
        alert('Insufficient BHB token balance to rent exclusive property');
      } else if (error.message.includes('You can\'t rent your own property')) {
        alert('You can\'t rent your own property');
      } else if (error.message.includes('Property not yet owned')) {
        alert('Property not yet owned');
      } else {
        alert('transaction failed');
      }

      setTxLoadingState2({ ...txloadingState2, [i]: false });
      setTxLoadingState2B({ ...txloadingState2B, [i]: false });
    }
  }



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
          <img src="gardens.png" className="pl-6 pr-6 h-3/6 w-full md:h-5/6 lg:h-4/6 xl3:h-5/6 lg:w-3/6 xl3:w-3/5 lg:pl-12 brightness-105 " />
          <p className='text-white pl-6 lg:pl-12 pr-2 mt-4 font-extralight text-lg italic  lg:w-3/5'>
            Entering the enchanting street Blockhouse Bay Gardens, where the whispers of wealth and opulence linger. Hidden behind ornate gates, this exclusive street unveils sumptuous properties steeped in secrets. Experience a world of privilege known only to the chosen few..."
          </p>
        </div>
      </div>
    </div>
  )

  if (loadingState === 'loaded' && !currentPosts.length) return (
    <h1 className="px-20 py-10 text-3xl">No properties currently for sale</h1>
  )

  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-6 md:px-9" style={{ maxWidth: "1600px" }}>

          <h1 className="text-5xl text-center md:text-left xl3:text-6xl mb-5">Blockhouse Bay Gardens</h1>

          <div className="flex text-white pl-4 mb-6 lg:w-3/5">
            <p className='text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-500'>Blockhouse Bay Gardens, an exclusive street of grand and stunning homes, is a paradise of luxurious living. From impressive architecture to immaculate gardens, each house is a masterpiece of sophistication, offering an unparalleled lifestyle in one of the bay's most beautiful settings.</p>
          </div>
          <h5 className='text-white text-center md:text-left mb-4'>These exlusive properties are limited to only 50 and can be purchased only with BHB tokens</h5>
          <p className='text-green-100 text-center md:text-left italic mb-12'>A minimum of <span className="font-semibold">2500 BHB</span> tokens must be held in order to become a renter but <span className='font-semibold'>TRIPPLE</span> the amount of BHB tokens are paid out when renting on this street!</p>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:grid-cols-3 text-white">
            {currentPosts.map((property, i) => {
              return (
                <div
                  key={property.propertyId}
                  className="border-2 border-double border-yellow-500 shadow-lg shadow-yellow-700 rounded-md overflow-hidden bg-gradient-120 from-black via-black to-green-900 mb-5 lg:mb-0"
                >
                  <img className='w-fit h-fit' src={property.image} alt="" />
                  <div className="p-4">
                    <h2
                      className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-500"
                    >
                      {property.name}
                    </h2>
                    <div style={{ overflow: "hidden" }}>
                      <div className='flex justify-between mb-2 mt-4 '>
                        <div>
                          <p className='text-indigo-100'>Owner:</p>
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
                        <p className="text-xs text-green-400 font-mono">{property.rentPrice} POL</p>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p className='text-indigo-100'>Deposit Required</p>
                        <p className="text-xs text-green-400 font-mono">{property.depositRequired} POL</p>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p className='text-indigo-100'>Total Income Generated:</p>
                        <p className="text-xs text-green-400 font-mono">{property.totalIncomeGenerated} POL</p>
                      </div>
                      <div className="flex flex-col mb-2">
                        <p className='text-indigo-100'>Rooms Rented:</p>
                        <p className="lg:pl-0 text-xs text-green-400 font-mono">{property.roomsToRent}/4</p>
                      </div>

                      <p className={`text-indigo-100 ${property.renterAddresses[0] === '0x0000000000000000000000000000000000000000' ? '' : ''}`}>Tenants:</p>
                      <div className='text-[10px] h-[150px] lg:text-xs mb-3 text-green-400 font-mono'>

                        {ethers.formatEther(property.renterAddresses[0]) !== "0.0" ?
                          <>
                            <div className='flex items-center justify-between mb-[11px]'>
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
                              <p className='mt-2 mb-[17px]'>0x</p>
                            </div>
                          </>
                        }
                        {ethers.formatEther(property.renterAddresses[1]).toString() !== "0.0" ?
                          <div className='flex items-center justify-between mb-[11px]'>
                            <p className={" break-words"}>
                              {property.renterAddresses[1]}
                            </p>
                            <Blockies
                              seed={property.renterAddresses[1]}
                            />
                          </div>
                          :
                          <>
                            <div className='flex justify-between items-center'>
                              <p className='mt-2 mb-[17px]'>0x</p>
                            </div>
                          </>
                        }
                        {ethers.formatEther(property.renterAddresses[2]).toString() !== "0.0" ?
                          <div className='flex items-center justify-between mb-[11px]'>
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
                              <p className='mt-2 mb-[17px]'>0x</p>
                            </div>
                          </>
                        }
                        {ethers.formatEther(property.renterAddresses[3]).toString() !== "0.0" ?
                          <div className='flex items-center mb-[20px] justify-between'>
                            <p className={" break-words"}>
                              {property.renterAddresses[3]}
                            </p>
                            <Blockies
                              seed={property.renterAddresses[3]}
                            />
                          </div>
                          :
                          <>
                            <div className='flex items-center'>
                              <p className='mt-2 mb-[17px]'>0x</p>
                            </div>
                          </>
                        }
                      </div>
                      <div className="flex flex-col mb-2">
                        <SaleHistory property={property} />
                      </div>
                    </div>
                  </div>

                  <div className=" px-2 h-[180px] md:h-[185px] pb-2 md:pb-0 bg-black">

                    <div className="pb-2 md:pb-0">
                      <div className="mb-2 text-2xl lg:text-base">
                        <div className="">
                          {(property.isForSale) ? (
                            <div className='grid grid-cols-2 pt-1 divide-x-2 px-3'>
                              <div className='pt-1 mr-8'>
                                <div className="flex justify-start">
                                  <p className='font-semibold text-lg md:text-xl 2xl:text-2xl pr-3 mb-[5px]'>BHB</p>
                                  <img className="h-[28px] w-7 brightness-200" src="./tokenfrontsmall.png" alt="" />
                                </div>
                                <header className="items-center flex text-indigo-100">
                                  <p className="font-mono text-sm md:text-base pl-1.5">{property.tokenSalePrice}</p>
                                </header>
                                {/* <div className='ml-2 mt-1 w-12 h-14 lg:h-17 md:w-14 lg:w-16 md:h-16'>
                                  <img
                                    className="lg:object-none brightness-150 scale-75 md:scale-75 lg:scale-50 pt-2.5 lg:pt-0"
                                    src="./tokenfrontsmall.png"
                                    alt=""
                                  ></img>
                                </div> */}
                              </div>

                              <div className="bg-black  pl-3 pt-1 flex ">
                                <div className='text-lg md:text-xl 2xl:text-2xl flex flex-col justify-left font-semibold'>
                                  <p className='pb-0.5'>Ranking</p>
                                  <p className='text-transparent bg-clip-text text-lg brightness-125 bg-gradient-to-r from-rose-300 via-rose-500 to-rose-600 pl-2'><span className={property.ranking == 'unranked' ? 'text-indigo-100 font-extralight' : 'font-mono'}>{property.ranking !== 'unranked' && <span>#</span>}{`${property.ranking}`}</span></p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-black py-[10.5px] pr-1.5 pt-3 mb-4.5  flex flex-col gap-2 justify-between">
                              <div className='text-2xl lg:pt-1.5 flex justify-center font-semibold'>
                                <p className='text-transparent bg-clip-text brightness-125 bg-gradient-to-r from-white via-white to-rose-500'>Ranking<span className={property.ranking == 'unranked' ? 'text-white' : 'italic font-extralight font-mono pl-1.5'}>{`#${property.ranking}`}</span></p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="px-2 md:pb-2">
                        {(property.owner === 'Unowned' || property.isForSale) ? (
                          <>
                            {txloadingState1[i] || txloadingState1B[i] ? (
                              <p className='w-full bg-btn-gold text-xs italic px-3 lg:px-6 mt-1 mb-3 py-1 rounded'>
                                <SpinnerIcon text={(txloadingState1[i] && !txloadingState1B[i]) ? 'Creating Tx' : 'Confirming Tx'} />
                              </p>
                            ) : (
                              <button onClick={() => buyProperty(property, i)} className="mb-3.5 w-full hover:bg-yellow-600 bg-btn-gold text-white font-bold py-2 mt-1 px-12 rounded cursor-pointer">
                                Buy
                              </button>
                            )}
                          </>
                        ) : (
                          <div className='flex justify-center'>
                            <button disabled={true} className="mb-5 lg:mb-[15px] w-full  text-white font-bold py-2 mt-2.5 px-12 rounded">
                              Not Currently for Sale
                            </button>
                          </div>
                        )
                        }
                        {property.roomsToRent !== 4 ? (
                          <>
                            {txloadingState2[i] || txloadingState2B[i] ? (
                              <p className='w-full bg-matic-blue text-xs italic px-3 lg:px-6 py-1 mb-3 md:mb-0 rounded'>
                                <SpinnerIcon text={(txloadingState2[i] && !txloadingState2B[i]) ? 'Creating Tx' : 'Confirming Tx'} />
                              </p>
                            ) : (
                              <button
                                onClick={() => rentProperty(property, i)}
                                disabled={property.owner === "Unowned"}
                                className={`w-full   font-bold py-2 px-12 rounded ${property.owner !== "Unowned" ? "hover:bg-blue-950 bg-blue-800 cursor-pointer  text-white" : "cursor-not-allowed bg-gray-400"} ${property.owner === "Unowned" ? "cursor-not-allowed bg-gray-700 text-gray-500" : ""}`}
                              >
                                Rent Room
                              </button>
                            )}
                          </>
                        ) : (
                          // <button disabled='true' className="w-full bg-black text-red-400 font-bold pb-2 pt-1 px-12 rounded">
                          //   No Vacancy
                          // </button>
                          <button
                            className={`w-full font-bold py-2 px-12 rounded bg-gray-700 text-gray-500 cursor-not-allowed`}
                          >
                            Rent Room
                          </button>
                        )
                        }
                      </div>
                    </div>
                  </div>
                  {/* <div className='h-2 xl:h-3 bg-black '></div> */}
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
