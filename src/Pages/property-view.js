import SaleHistory from '../Components/sale-history'
import { React, useEffect, useState } from 'react'
import { useModalContext } from '../App'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { BrowserProvider, Contract, formatUnits } from 'ethers'
import axios from 'axios'

import { Link } from 'react-router-dom';
import {
  nftaddress, nftmarketaddress, propertytokenaddress, govtaddress
} from '../config'
import Blockies from 'react-blockies';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import PropertyToken from '../artifacts/contracts/PropertyToken.sol/PropertyToken.json'
import GovtFunctions from '../artifacts/contracts/GovtFunctions.sol/GovtFunctions.json'
import datajson from '../final-manifest.json';
import { useParams } from 'react-router-dom';
import GetPropertyNames from '../getPropertyName'
import { detectNetwork, getRpcUrl } from '../Components/network-detector';
import SpinnerIcon from '../Components/spinner';

const ethers = require("ethers")

if (window.ethereum) {
  window.ethereum.on('accountsChanged', function (accounts) {
    window.location.reload();
  });
}

const PropertyView = () => {

  const { propertyId } = useParams();
  console.log(propertyId)
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [numForSale, setNumForSale] = useState();
  const [property, setProperty] = useState();
  const [txloadingState, setTxLoadingState] = useState();
  const [txloadingStateB, setTxLoadingStateB] = useState();
  const [txloadingState2, setTxLoadingState2] = useState();
  const [txloadingState2B, setTxLoadingState2B] = useState();
  const [retries, setRetries] = useState(5)
  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()
  const { modalEvent, provider, signer } = useModalContext();

  useEffect(() => {
    setLoadingState('not-loaded')
    loadProperties()
  }, [])


  const loadProperties = async () => {

    const tokenContract = new Contract(nftaddress, NFT.abi, provider)
    const marketContract = new Contract(nftmarketaddress, PropertyMarket.abi, provider)
    const govtContract = new Contract(govtaddress, GovtFunctions.abi, provider)
    const data = await govtContract.fetchSingleProperty(propertyId)
    const numForSale = await govtContract.getPropertiesForSale();
    console.log(data)
    setNumForSale(Number(numForSale));

    const tokenUri = await tokenContract.tokenURI(data.tokenId)
    // console.log(data.propertyId.toNumber())
    const meta = await axios.get(tokenUri) //not used?  

    const url = meta.config.url

    const parts = url.split('/');

    const targetId = parts.slice(3).join('/');

    console.log(Number(data.propertyId))
    var nftName = GetPropertyNames(meta, Number(data.propertyId));
    let price = ethers.formatUnits(data.salePrice.toString(), 'ether')
    let tokenSalePriceFormatted = ethers.formatUnits(data.tokenSalePrice.toString(), 'ether')
    const renterAddresses = await marketContract.getPropertyRenters(Number(data.propertyId));
    console.log(renterAddresses)
    let saleHistory = [];
    if (data.saleHistory.length > 0) {
      data.saleHistory.forEach((item) => {
        const history = data.saleHistory.map((item) => {
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
    let owner = data.owner === '0x0000000000000000000000000000000000000000' ? 'Unowned' : data.owner
    console.log('owner', owner)
    let rentPrice = await ethers.formatUnits(data.rentPrice.toString(), 'ether')
    let totalIncomeGenerated = ethers.formatUnits(data.totalIncomeGenerated)

    let depositHex = data.deposit//await govtContract.getDepositRequired();
    let deposit = formatUnits(depositHex, 'ether')

    //let tokenSalePriceFormatted = ethers.formatUnits(hexTokenPrice, 'ether')
    let item = {
      price,
      propertyId: Number(data.propertyId),
      seller: data.seller,
      owner: owner,
      image: tokenUri,
      name: nftName,
      depositRequired: deposit,
      depositHex: depositHex,
      description: meta.data.description,
      roomOneRented: data.roomOneRented,
      roomTwoRented: data.roomTwoRented,
      roomThreeRented: data.roomThreeRented,
      roomFourRented: data.roomFourRented,
      roomsToRent: 0,
      saleHistory: saleHistory,
      rentPrice: rentPrice,
      isForSale: data.isForSale,
      renterAddresses: renterAddresses,
      totalIncomeGenerated: totalIncomeGenerated,
      tokenSalePrice: tokenSalePriceFormatted,
      dateSoldHistory: data.dateSoldHistory,
      dateSoldHistoryBhb: data.dateSoldHistoryBhb,
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
    setTxLoadingStateB(false);
    setTxLoadingState2B(false);
    setProperty(item)
    setLoadingState('loaded')
  }

  const buyProperty = async (nft) => {
    try {
      let brb = document.getElementById("pogRadio")
      let matic = document.getElementById("maticRadio")
      if (brb.checked === false && matic.checked === false) {
        return;
      }

      const contract2 = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer);
      let price = ethers.parseUnits(nft.price.toString(), 'ether');
      let isTokenSale = false;

      let propertyTokenContract = undefined;
      let amount = undefined;

      setTxLoadingState(true);
      if (brb != undefined) {
        if (brb.checked) {
          price = ethers.parseUnits("0", 'ether');
          isTokenSale = true;
          propertyTokenContract = new ethers.Contract(propertytokenaddress, PropertyToken.abi, signer);
          amount = ethers.parseUnits(nft.tokenSalePrice, 'ether');
          await propertyTokenContract.allowSender(amount);
        }
      }

      let gasLimit = await contract2.createPropertySale.estimateGas(
        nftaddress,
        nft.propertyId,
        propertytokenaddress,
        isTokenSale,
        {
          value: price,
        }
      );




      gasLimit = gasLimit + 100000n;

      console.log('does get here?')

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
          value: price,
          gasLimit: gasLimit,
          maxFeePerGas: maxFeePerGas,
          maxPriorityFeePerGas: maxPriorityFeePerGas
        }
      );

      if (document.getElementById("pogRadio") != undefined) {
        if (document.getElementById("pogRadio").checked) {
          await propertyTokenContract.allowSender(0);
        }
      }

      setTxLoadingState(false);
      setTxLoadingStateB(true);
      await transaction.wait();
      loadProperties();
    } catch (error) {
      // Handle the error when the user rejects the transaction in MetaMask
      console.error("Transaction rejected by the user or an error occurred:", error);
      alert('Transaction Failed')
      setTxLoadingState(false);
      setTxLoadingStateB(false);
      if (retries > 0) {
        setRetries(retries - 1);
        loadProperties()
      }
    }
  }

  const rentProperty = async (property) => {
    try {
      console.log('id ', property.propertyId)
      const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, signer)

      const deposit = Number(property.depositHex).toString() //await await govtContract.getDepositRequired();
      // const deposit = ethers.parseUnits(test.toString(), 'ether')
      // const num = ethers.utils.formatEther(deposit)
      // const rentals = await marketContract.getPropertiesRented()
      // ? ethers.utils.parseUnits(property.rentPrice.toString(), 'ether') 
      // : ethers.utils.parseUnits(contract.defaultRentPrice.toString(), 'ether')
      //STOP SAME ADDRESS RENTING MORE THAN ONE ROOM?
      setTxLoadingState2(true);
      let gasLimit2 = await govtContract.rentProperty.estimateGas(property.propertyId, {
        value: Number(property.depositHex).toString()
      });

      gasLimit2 = gasLimit2 + 100000n;

      const feeData = await provider.getFeeData();

      const basePriorityFee = feeData.maxPriorityFeePerGas || ethers.parseUnits('1.5', 'gwei'); // Fallback to 1.5 gwei if undefined
      const maxPriorityFeePerGas = basePriorityFee + ethers.parseUnits('10', 'gwei'); // Add 2 gwei buffer
      const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('20', 'gwei'); // Add 5 gwei buffer to maxFeePerGas

      console.log('before tx')

      const transaction = await govtContract.rentProperty(property.propertyId, {
        value: Number(property.depositHex).toString(),
        gasLimit: gasLimit2,
        maxFeePerGas: maxFeePerGas,
        maxPriorityFeePerGas: maxPriorityFeePerGas
      });

      setTxLoadingState2(false);
      setTxLoadingState2B(true);
      let trans = await transaction.wait();
      setLoadingState(false)
      console.log(trans)
      loadProperties()
    } catch (error) {
      setTxLoadingState2(false);
      setTxLoadingState2B(false);
      console.log('Pay rent error:', error)
      alert('Transaction Failed')
    }
  }

  if (loadingState !== 'loaded') return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="lg:px-4 lg:ml-20" style={{ maxWidth: "1600px" }}>
          <div className="flex pl-6 lg:px-12">
            <p className="text-white text-3xl lg:text-5xl font-semibold mb-2">Loading Property</p>
            <svg role="status" className="mt-1 lg:mt-3 ml-3 inline w-8 h-8 mr-2 text-red-500 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )

  if (loadingState === 'loaded' && !property) return (
    <div className="pt-10 pb-10">
      <div className="flex ">
        <div className="lg:px-4 lg:ml-20" style={{ maxWidth: "1600px" }}>
          {/* <p className="ml-4 lg:ml-0 text-5xl xl3:text-6xl font-bold mb-6 text-white">For Sale</p> */}
          <p className="text-xl lg:text-xl pl-7 lg:pl-4 font-bold mr-1 text-white">Cannot load property</p>
          {/* <p className='text-white text-base pt-2 lg:pt-4 pl-7 lg:pl-4'>Check back soon for new listings</p> */}
        </div>
      </div>
    </div>
  )

  return (
    <div className=" pb-10">

      <div className="flex justify-center">
        <div className="px-6 pb-6 bg-black" style={{ maxWidth: "450px" }}>

          {/* <p className="text-4xl xl3:text-5xl font-bold mb-6 text-white">{property.name}</p> */}
          <div className="flex text-white pl-4">
            {/* <h5>Rent a property and earn</h5> */}
            {/* <header className="flex items-center h-16 mb-1 mr-3">
              <p className="text-sm lg:text-xl font-bold">Buy a property and earn Matic tokens </p>
            </header>
            <div className='mb-1'>
              <img
                className="object-none scale-90 lg:scale-100 brightness-125"
                src="../matic-icon.png"
                alt=""
              ></img>
            </div> */}
          </div>

          <section className="grid grid-cols-1 max-w-md text-white">
            <img
              className="object-contain scale-100 mb-10 md:mb-2"
              src="../logoplain.png"
              alt=""
            ></img>
            <div
              key={property.propertyId}
              className="border shadow rounded-md overflow-hidden bg-gradient-120 from-black via-black to-blue-400"
            >
              {console.log(property.propertyId + " hit")}
              <img className='w-fit h-fit' src={property.image} alt="" />
              <div className="p-4">
                <p

                  className="text-2xl pb-4 font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400"
                >
                  {property.name}
                  {/* {names[i]} */}
                </p>
                <div>
                  <div className='flex justify-between mb-2'>
                    <div>
                      <p>Owner:</p>
                      <p className="text-[10px] text-green-400 font-mono">{property.owner}</p>
                    </div>
                    {property.owner !== "Unowned" &&
                      <div className='pt-1.5'>
                        <Blockies
                          seed={property.owner}
                        />
                      </div>
                    }
                  </div>
                  <div className="flex flex-col pb-2">
                    <p>Rooms Rented:</p>
                    <p className="font-mono text-xs text-green-400">{property.roomsToRent}/4</p>
                  </div>
                  <div className="flex flex-col pb-2">
                    <p>Rent Price:</p>
                    <p className="font-mono text-xs text-green-400">{property.rentPrice} Matic</p>
                  </div>
                  <p>Tenants:</p>
                  <div className='text-[10px] mb-3 text-green-400 font-mono'>
                    {console.log(property.renterAddresses[0])}
                    {ethers.formatEther(property.renterAddresses[0]) !== "0.0" ?
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
                      :
                      <>
                        <div className='flex items-center'>
                          <p className='mt-2 mb-[17px]'>0x</p>
                        </div>
                      </>
                    }
                    {ethers.formatEther(property.renterAddresses[1]).toString() !== "0.0" ?
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
                        <div className='flex justify-between h-full items-center'>
                          <p className='mt-2 mb-[17px]'>0x</p>
                        </div>
                      </>
                    }
                    {ethers.formatEther(property.renterAddresses[2]).toString() !== "0.0" ?
                      <div className='flex items-center justify-between mb-2'>
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
                  <div className="flex flex-col pb-2">
                    <p>Total Income Generated:</p>
                    <p className="font-mono text-xs text-green-400">{property.totalIncomeGenerated} Matic</p>
                  </div>
                  <SaleHistory property={property} />
                </div>
              </div>

              <div className={`p-2 pt-2  bg-black ${property.isForSale ? '' : 'hidden'}`}>
                <div className="pb-1">
                  <div className='grid grid-rows-1'>

                    <div className="grid grid-cols-2 divide-x divide-white h-6">
                      <div className="flex justify-start pl-2">
                        <p className='font-semibold pr-3'>POL</p>
                        <img className="h-[27px]  w-7" src="./../polygonsmall.png" />
                      </div>
                      <div className="flex justify-start pl-2">
                        <p className='font-semibold pl-1 pr-3'>BHB</p>
                        <img className="h-[28px] w-7 brightness-200" src="./../tokenfrontsmall.png" alt="" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 justify-between divide-x divide-white mb-2 text-xl lg:text-base">
                      <div className="flex px-2">
                        <div className='pt-1.5'>
                          <input
                            className="rounded-full flex-shrink-0 h-3 w-3 border border-pink-400 bg-white checked:bg-pink-600 checked:border-pink-600 focus:outline-none transition duration-200 mt-2.5 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                            type="radio"
                            disabled={property.propertyId > 500}
                            name="flexRadioDefault"
                            id={"maticRadio"}
                          //onChange={onCurrencyChange}
                          />
                        </div>
                        <label htmlFor={"maticRadio"} className="cursor-pointer mb-2 mr:6 md:mr-12 pt-3.5 xl3:pt-3 text-white text-xs xl3:text-sm">
                          <p className={`font-bold whitespace-break-spaces ${property.propertyId > 500 ? 'text-gray-500' : ''}`}>{property.price} </p>
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
                                id={"pogRadio"}
                                value="./pogtoken.png"
                              //onChange={onCurrencyChange}
                              />
                            </div>
                            <div className='flex items-center'>
                              <label htmlFor={"pogRadio"} className="mb-2 cursor-pointer pt-3.5 xl3:pt-3 text-xs xl3:text-sm text-white">
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
                                id={"pogRadio"}
                                value="./pogtoken.png"
                                disabled={true}
                              />
                            </div>
                            <div className='flex items-center'>
                              <label htmlFor={"pogRadio"} className="cursor-pointer mb-2 mr-8 pt-3.5 text-xs xl3:text-sm text-gray-500">
                                <p className="font-bold">{property.tokenSalePrice} BHB</p>
                              </label>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-2 flex justify-center">
                    {txloadingState || txloadingStateB ? (
                      <p className='w-full bg-matic-blue text-xs italic px-3 py-1 rounded'>
                        <SpinnerIcon text={(txloadingState && !txloadingStateB) ? 'Creating Tx' : 'Confirming Tx'} />
                      </p>
                    ) : (
                      <button
                        onClick={() => buyProperty(property)}
                        className="w-full hover:bg-sky-700 bg-matic-blue text-white font-bold py-2 px-12 rounded cursor-pointer"
                      >
                        Buy
                      </button>
                    )}
                  </div>
                </div>

              </div>
              {property.roomsToRent < 4 && property.owner !== 'Unowned' &&
                <div className="p-2 pt-0 bg-black pb-3">
                  <div className='h-[1px] bg-white mb-3 mx-2'></div>
                  <div className="flex divide-x divide-white justifty-start px-2">
                    <div className="flex pr-5">
                      <div className="text-lg font-bold">Rental Deposit</div>
                      <Link to="/about?section=renting" target='new'>
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
                      </Link>
                    </div>
                    <div className="flex text-xs pl-5 lg:pl-3">
                      <ul className="list-disc pl-3.5 list-outside">
                        <li className='mb-1'>
                          A rental deposit of <span className='font-mono text-xs text-blue-400'>{property.depositRequired}</span> is required to rent this property
                        </li>
                        <li>
                          Your deposit is refunded upon vacating a property (deposit is not refunded if evicted from the property)
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="text-2xl pt-2 text-white mb-4"></div>

                  <div className="px-2 flex justify-center">
                    {txloadingState2 || txloadingState2B ? (
                      <p className='w-full bg-matic-blue text-xs italic px-3 py-1 rounded'>
                        <SpinnerIcon text={(txloadingState2 && !txloadingState2B) ? 'Creating Tx' : 'Confirming Tx'} />
                      </p>
                    ) : (
                      <button
                        onClick={() => rentProperty(property)}
                        className="w-full hover:bg-sky-700 bg-matic-blue text-white font-bold py-2 px-3 rounded cursor-pointer"
                      >
                        Rent
                      </button>
                    )}
                  </div>

                </div>
              }

              {/* <div className="p-2 pb-3 pt-2 bg-black">
                {
                  <div>
                    <div className={`flex divide-x divide-white mb-2 text-xl lg:text-base ${property.isForSale ? '' : 'hidden'}`}>
                      <div className="flex justify-between px-2">
                        <div className='pt-1.5'>
                          <input
                            className="rounded-full flex-shrink-0 h-3 w-3 border border-pink-400 bg-white checked:bg-pink-600 checked:border-pink-600 focus:outline-none transition duration-200 mt-2.5 align-top bg-no-repeat bg-center bg-contain float-left mr-3 cursor-pointer"
                            type="radio"
                            name="flexRadioDefault"
                            id={"maticRadio"}
                          //onChange={onCurrencyChange}
                          />
                        </div>
                        <label htmlFor={"maticRadio"} className="mb-2 pr-2 cursor-pointer pt-2 text-white">
                          <p className={`font-bold ${property.isForSale ? 'text-white' : 'text-gray-500'}`}>{property.price} POL</p>
                        </label>
                        <div>
                          <img
                            className="object-none lg:pt-1.5"
                            src="./../matic-icon.png"
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
                                id={"pogRadio"}
                                value="./pogtoken.png"
                              //onChange={onCurrencyChange}
                              />
                            </div>
                            <div className='flex'>
                              <label htmlFor={"pogRadio"} className="mb-2 pt-2 cursor-pointer text-white">
                                <p className="font-bold">{property.tokenSalePrice} BHB</p>
                              </label>

                              <div>
                                <img
                                  className="scale-75 h-4/6 sm:h-5/6 mt-3 sm:mt-1.5 lg:pt-0 brightness-150"
                                  src="./../tokenfrontsmall.png"
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
                                id={"pogRadio"}
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
                                  src="./../tokenfrontsmall.png"
                                  alt=""
                                ></img>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    {property.isForSale &&
                      <div className="px-2 flex justify-center mb-2 mt-1">
                        {txloadingState ? (
                          <p className='w-full flex justify-center bg-matic-blue text-xs italic px-12 py-1 rounded'>
                            <SpinnerIcon />
                          </p>
                        ) : (
                          <button
                            onClick={() => buyProperty(property)}
                            className="w-full bg-matic-blue text-white font-bold py-2 px-12 rounded cursor-pointer"
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    }
                    {property.roomsToRent < 4 && property.owner !== 'Unowned' &&
                      <div className="p-2 pb-0 pt-1.2 bg-black">
                        <div className="flex divide-x divide-white justifty-start px-2">
                          <div className="flex pr-5">
                            <div className="text-lg font-bold">Rental Deposit</div>
                            <Link to="/about?section=renting" target='new'>
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
                            </Link>
                          </div>
                          <div className="flex text-xs pl-5 lg:pl-3">
                            <ul className="list-disc pl-3.5 list-outside">
                              <li className='mb-1'>
                                A rental deposit of <span className='font-mono text-xs text-blue-400'>{property.depositRequired}</span> is required to rent this property
                              </li>
                              <li>
                                Your deposit is refunded upon vacating a property (deposit is not refunded if evicted from the property)
                              </li>
                            </ul>
                          </div>
                        </div>

                        <div className="text-2xl pt-2 text-white"></div>
                        
                        <div className="px-0 flex justify-center">
                          {txloadingState2 ? (
                            <p className='w-full flex justify-center bg-matic-blue text-xs italic px-12 py-1 rounded'>
                              <SpinnerIcon />
                            </p>
                          ) : (
                            <button
                              onClick={() => rentProperty(property)}
                              className="w-full bg-matic-blue text-white font-bold py-2 px-12 rounded cursor-pointer"
                            >
                              Rent
                            </button>
                          )}
                        </div>
                        
                      </div>
                    }
                  </div>
                }
              </div>*/}
            </div>

          </section>
        </div>
      </div>
    </div>
  )
}

export default PropertyView