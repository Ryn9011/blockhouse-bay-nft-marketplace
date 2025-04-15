import { React, useEffect, useState } from 'react'
import { useModalContext } from '../App'
import { Link } from 'react-router-dom';

import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { BrowserProvider, Contract, } from 'ethers'
import axios from 'axios'
import Blockies from 'react-blockies';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import GovtFunctions from '../artifacts/contracts/GovtFunctions.sol/GovtFunctions.json'
import AddTokenButton from "../Components/AddTokenButton";

import {
  nftaddress, nftmarketaddress, propertytokenaddress, govtaddress
} from '../config'
import Pagination from '../Pagination'
import GetPropertyNames from '../getPropertyName'
import SpinnerIcon from '../Components/spinner';
import copyImg from '../copy.svg';

const ethers = require("ethers")

const copy = require('clipboard-copy')

if (window.ethereum) {
  window.ethereum.on('accountsChanged', function (accounts) {
    window.location.reload();
  });
}

const Renting = () => {

  const [rentedProperties, setRentedProperties] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [loadingState2, setLoadingState2] = useState('not-loaded')
  const [timestampLoadingState, setTimestampLoadingState] = useState('not-loaded')
  const [renterTokens, setRenterTokens] = useState(0)
  const [rentAmount, setRentAmount] = useState(0)
  const [rentStatus, setRentStatus] = useState(false)
  const [rentText, setRentText] = useState('')
  const [retries, setRetries] = useState(5)

  const [postsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [connectedAddress, setConnectedAddress] = useState();
  const [tokenAddress, setTokenAddress] = useState();
  const [renterTimestamps, setRenterTimestamps] = useState();
  const [txloadingState, setTxLoadingState] = useState({});
  const [txloadingStateB, setTxLoadingStateB] = useState({});
  const [txloadingState1, setTxLoadingState1] = useState({});
  const [txloadingState1B, setTxLoadingState1B] = useState({});
  const [txloadingState2, setTxLoadingState2] = useState({});
  const [txloadingState2B, setTxLoadingState2B] = useState({});
  const { address, chainId, isConnected } = useWeb3ModalAccount()


  // const [provider, setProvider] = useState();
  // const [signer, setSigner] = useState();
  const { modalEvent, provider, signer } = useModalContext();


  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  let exceptionCount = 3;



  useEffect(() => {
    // console.log(provider);
    // console.log(signer);
    if (signer == null) {

      return;
    }
    if (provider != null) {

      loadProperties();
    }
  }, [currentPage, signer]);

  // useEffect(() => { 
  //   if (modalEvent === null) {
  //     return;
  //   }
  //   console.log(modalEvent.data.event)
  //   if (modalEvent.data.event === 'DISCONNECT_SUCCESS' || modalEvent.data.event === 'DISCONNECT_ERROR') {      
  //     setWalletConnectionError(true);
  //     window.location.reload();
  //   } else {
  //     setWalletConnectionError(false);
  //   }
  // }, [modalEvent]);

  const CheckTimestampExpired = (property, connectedAddress) => {
    // console.log(property)
    // console.log(connectedAddress)
    if (property.payments === undefined) {

      return true;
    }

    const allTimestampsZero = property.payments.every(payment => {
      const timestamp = payment[2];

      // console.log('timestamp ', Number(timestamp))
      return timestamp == 0 || timestamp === '0x00';
    });

    // console.log('allTimestampsZero ', allTimestampsZero)

    if (allTimestampsZero) {
      return true;
    }
    // console.log(property.payments)
    // console.log(property.payments[0].propertyId)

    // problem is it bypasses the first check as payments array exists but only for another renter
    // const currentObject = property.payments.filter(a => Number(a.propertyId) == Number(property.propertyId) && a.renter == connectedAddress)[0] 
    let currentObject;

    if (!property.payments || property.payments.length === 0) {
      return; // Exit the function if no payments present
    }

    currentObject = property.payments.find(a =>
      Number(a.propertyId) === Number(property.propertyId) &&
      a.renter === connectedAddress
    );




    
    // console.log(ethers.BigNumber.from(currentObject.timestamp.toNumber())).toNumber()
    const twentyFourHoursInSeconds = 700 //24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    //const currentTimeInMullisPlusOneDay = Date.now() + twentyFourHoursInMillis;
    if (currentObject === undefined) {
      return true;
    }
    
    // console.log(currentTimeInMillis)
    // console.log(currentTimeInMillis - (currentObject.timestamp.toNumber()))

    if ((currentTimeInSeconds - (Number(currentObject.timestamp))) > twentyFourHoursInSeconds) {
      
      // setRentText('Rent overdue')
      return true
    } else {
      
      // setRentText('Rent up to date')
      return false
    }
  }

  const loadProperties = async (i) => {
    try {
      
      if (exceptionCount === 0) {
        return;
      }
      if (!isConnected) {
        exceptionCount--;
        setTxLoadingState({ ...txloadingState, [i]: false });
        setTxLoadingStateB({ ...txloadingStateB, [i]: false });
        setTxLoadingState1({ ...txloadingState1, [i]: false });
        setTxLoadingState1B({ ...txloadingState1B, [i]: false });
        setTxLoadingState2({ ...txloadingState2, [i]: false });
        setTxLoadingState2({ ...txloadingState2B, [i]: false });
        throw Error('User disconnected')
      }

      
      setConnectedAddress(address);

      const marketContract = new Contract(nftmarketaddress, PropertyMarket.abi, signer)
      const tokenContract = new Contract(nftaddress, NFT.abi, provider);
      const tokenContractAddress = await tokenContract.address;
      const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, signer)
      setTokenAddress(tokenContractAddress);

      const data = await marketContract.fetchMyRentals()
      

      const tokensHex = await marketContract.getTokensEarned()
      const tokens = ethers.formatUnits(tokensHex.toString(), 'ether')
      
      setRenterTokens(tokens);

      let dataFiltered = data.filter(a => Number(a.propertyId) !== 0)
      
      const propertyIds = [];

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        propertyIds.push(item.propertyId);
      }

      // const renters = await marketContract.getPropertyPayments(propertyIds);
      // console.log(renters)
      // setRenterTimestamps(renters)      
      
      const items = await Promise.all(data.filter(i => Number(i.propertyId) != 0 && (a => Number(a.tokenId) !== 0)).map(async i => {

        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        // const tokenUri = 'https://dummyimage.com/300x200/000/fff'

        let deposit = ethers.formatUnits(await govtContract.getRenterDepositBalance(i.propertyId), 'ether');

        const meta = await axios.get(tokenUri)

        let nftName = GetPropertyNames(meta, Number(i.propertyId))

        setRentAmount(i.rentPrice)
        let price = ethers.formatUnits(i.rentPrice.toString(), 'ether')
        let rentPrice = await ethers.formatUnits(i.rentPrice.toString(), 'ether')

        let item = {
          price,
          propertyId: Number(i.propertyId),
          seller: i.seller,
          owner: i.owner,
          image: tokenUri,
          name: nftName,
          rentPrice: i.rentPrice,
          description: "",
          roomOneRented: false,
          roomTwoRented: false,
          roomThreeRented: false,
          rentStatus: undefined,
          payments: i.payments,
          deposit: deposit,
        }

        
        item.rentStatus = CheckTimestampExpired(item, address)
        

        if (!item.roomOneRented || !item.roomTwoRented || !item.roomThreeRented) {
          item.available = true;
        }
        return item

      }))

      setRentedProperties(items.slice(0, 20))
      setTimestampLoadingState('loaded');
      setLoadingState('loaded')
      setTxLoadingState({ ...txloadingState, [i]: false });
      setTxLoadingStateB({ ...txloadingStateB, [i]: false });
      setTxLoadingState1({ ...txloadingState1, [i]: false });
      setTxLoadingState1B({ ...txloadingState1B, [i]: false });
      setTxLoadingState2({ ...txloadingState2, [i]: false });
      setTxLoadingState2({ ...txloadingState2B, [i]: false });
    } catch (ex) {
      setTxLoadingState({ ...txloadingState, [i]: false });
      setTxLoadingStateB({ ...txloadingStateB, [i]: false });
      setTxLoadingState1({ ...txloadingState1, [i]: false });
      setTxLoadingState1B({ ...txloadingState1B, [i]: false });
      setTxLoadingState2({ ...txloadingState2, [i]: false });
      setTxLoadingState2({ ...txloadingState2B, [i]: false });
      if (ex.message === 'User Rejected') {
        // Handle user rejection
        
        // Display an error message to the user        
        if (retries > 0) {
          setRetries(retries - 1);
          loadProperties()
        }
      } else {
        console.log('Error loading properties:', ex);
        alert('Unable to detect a wallet connection. Please connect to a wallet provider.');
        setTxLoadingState({ ...txloadingState, [i]: false });
        setTxLoadingStateB({ ...txloadingStateB, [i]: false });
        setTxLoadingState1({ ...txloadingState1, [i]: false });
        setTxLoadingState1B({ ...txloadingState1B, [i]: false });
        setTxLoadingState2({ ...txloadingState2, [i]: false });
        setTxLoadingState2({ ...txloadingState2B, [i]: false });
      }
    }
  }


  const PayRent = async (property, i) => {
    try {
      const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, signer)
      setTxLoadingState1({ ...txloadingState1, [i]: true });
      const amount = property.rentPrice.toString();

               

      const transaction = await govtContract.payRent(
        property.propertyId,
        {         
          value: amount
        }
      )
      setTxLoadingState1({ ...txloadingState1, [i]: false });
      setTxLoadingState1B({ ...txloadingState1B, [i]: true });
      await transaction.wait();
      loadProperties()
    } catch (ex) {
      console.log(ex)
      setTxLoadingState1({ ...txloadingState1, [i]: false });
      setTxLoadingState1B({ ...txloadingState1B, [i]: false });
      alert('Tx failed - Check your balance and try again')
    }
  }

  const CollectTokens = async () => {
    const contract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
    try {
      setTxLoadingState({ ...txloadingState, [551]: true });

      const transaction = await contract.withdrawERC20()
      setTxLoadingState({ ...txloadingState, [551]: false });

      setTxLoadingStateB({ ...txloadingStateB, [551]: true });
      await transaction.wait()
    } catch (e) {
      console.log('Transaction cancelled ', e)
      alert('Transaction Failed')
    }
    loadProperties()
  }

  //if same address has rented more than one room, this will vacate all of them
  const Vacate = async (property, i) => {
    const contract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
    setTxLoadingState2({ ...txloadingState2, [i]: true });
    try {
      const transaction = await contract.vacate(
        property.propertyId
      )
      setTxLoadingState2({ ...txloadingState2, [i]: false });

      setTxLoadingState2B({ ...txloadingState2B, [i]: true });
      await transaction.wait()
    } catch (ex) {
      alert('Transaction Failed')
    }
    
    loadProperties()
  }

  const handleCopy = () => {
    copy(propertytokenaddress);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);


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
          <img src="winter.png" className="pl-6 pr-6 h-3/6 lg:h-4/6 w-full md:h-5/6 xl3:h-5/6 lg:w-3/6 xl3:w-3/5 lg:pl-12 brightness-125" />
          <p className='text-white pl-6 pr-2 lg:pl-12 mt-4 font-extralight text-lg italic lg:w-3/5'>
            Renters can manage properties they have rented here. Renters can pay rent, vacate properties and collect tokens earned from renting properties.
            It is at the property owner's discretion to keep a tenant on if they fall behind on their rent!
          </p>
        </div>
      </div>
    </div>
  )
  //loadingState === 'loaded' && timestampLoadingState === 'loaded' && !rentedProperties.length
  if (loadingState === 'loaded' && timestampLoadingState === 'loaded' && !rentedProperties.length) return (
    <div className="pt-10 pb-10">
      <div className="flex ">
        <div className="lg:px-4 md:ml-20" style={{ maxWidth: "1600px" }}>
          <p className="ml-7 lg:ml-0 text-5xl xl3:text-6xl font-bold mb-6 md:mb-32 xl3:mb-10 text-white">My Rented Properties</p>
          <div className="image-container hidden lg:block ml-48 xl3:ml-72 drop-shadow-lg absolute h-2/6 mt-20  md:w-4/5 mb-16 xl3:mb-64  right-9 lg:right-40 xl3:right-60 xl3:top-20">
            <img src="col.png" className=" rotate-away2  shadow-2xl shadow-amber-100" />
            <div className='h-10 mt-16'></div>
            {/* <div className="gradient-overlay2 md:h-5/6"></div> */}
          </div>
          <p className='text-white text-base md:text-left md:text-2xl xl3:text-4xl font-semibold pt-2 w-11/12 mt-8 md:mt-24  xl3:mt-44 lg:pt-4 pl-7 lg:pl-12'>Looking to rent a place? Discover available properties, secure your next rental, and check back here to manage your leases and stay on top of your rentals.</p>
          <p className="text-xs pl-7 mb-6 md:mb-0 lg-pl-0 md:lg:text-lg lg:pl-16 underline italic mt-2   md:mt-6  mr-1 text-blue-300"><Link to="/about?section=owning" target='new'>Learn more about owning your first property</Link></p>
          {renterTokens > 0 &&
            <div className='md:pl-0 md:ml-12 mt-10 flex items-center mb-3 lg:mb-6'>
              <div className="flex pr-4 font-semibold text-white ml-2 lg:ml-0 mb-4 lg:mb-0 items-center">

                <div className='md:hidden pl-8 mt-2'>
                  <p className='text-sm'>Tokens Accumulated: </p>
                  <div className='flex items-center'>

                    <p className="pl-1 md:mt-1.5 font-mono text-xs md:text-sm text-gray-400 mr-2">{renterTokens}</p>
                    <img className="h-[28px] w-7 brightness-200" title='BHB' src="./tokenfrontsmall.png" alt="BHB" />
                  </div>
                  <button
                    className="text-green-400 text-xs mt-2 lg:text-base hover:bg-green-900 border border-green-400 rounded py-1 px-2 xl:mt-1.5"
                    onClick={() => CollectTokens()}>
                    Collect Tokens
                  </button>
                </div>

                <div className='hidden md:block pl-8 md:pl-0 md:mt-10'>
                  <div className='flex items-center'>
                    <p className='text-sm'>Tokens Accumulated: </p>
                    <p className="pl-1 font-mono text-xs md:text-sm text-gray-400 mr-2">{renterTokens}</p>
                    <img className="h-[28px] w-7 brightness-200 mr-4" title='BHB' src="./tokenfrontsmall.png" alt="BHB" />
                    <button
                      className="text-green-400 hover:bg-green-900 text-base border border-green-400 rounded py-1 px-2"
                      onClick={() => CollectTokens()}>
                      Collect Tokens
                    </button>
                  </div>
                </div>
              </div>
            </div>}

          {/* <p className='text-white text-base italic font-extralight pt-2 lg:pt-4 pl-7 lg:pl-4'>Rent a property then check back here.</p> */}
          {/* <p className='text-white text-sm mt-12 pl-6'>Add the BHB Token address to your wallet</p> */}
          <div className='ml-4 lg:ml-6 md:mt-4 hidden md:block'>
            <div className='pl-6 lg:pt-2'>
              <AddTokenButton />
            </div>
            <p className="text-white text-sm pl-6 mt-2 lg:mt-4">BHB Token Address:</p>
            <div className="flex text-gray-400 pl-6 text-xs">
              {propertytokenaddress}
              <img src={copyImg} className="w-5 h-5 ml-2 invert cursor-pointer" onClick={handleCopy} />
            </div>
          </div>
        </div>
        <div className="image-container hidden lg:block drop-shadow-lg absolute h-5/6 md:h-1/3 md:w-full lg:pt-60 right-9 lg:right-40 xl3:right-60 xl3:top-20">
          {/* <img src="col.png" className=" rotate-away shadow-2xl shadow-amber-100" /> */}
          <div className='h-10 mt-16'></div>
          {/* <div className="gradient-overlay2 md:h-5/6"></div> */}
        </div>
      </div>
      <div className="image-container lg:hidden md:ml-24 drop-shadow-lg mt-8 mb-16 left-2 col-span-12 absolute h-5/6 md:h-1/3 md:w-2/4 md:pt-10 lg:pt-32 md:right-30">
        <img src="col.png" className="rotate-away2  brightness-110 shadow-2xl shadow-amber-100" />
        {/* <div className="gradient-overlay2 md:h-5/6"></div> */}
      </div>
      <div className='ml-4 lg:ml-0 md:hidden'>
        <div className='pl-6 lg:pt-2'>
          <AddTokenButton />
        </div>
        <p className="text-white text-sm pl-6 mt-2 lg:mt-4">BHB Token Address:</p>
        <div className="flex text-gray-400 pl-6 text-xs">
          {propertytokenaddress}
          <img src={copyImg} className="w-5 h-5 ml-2 invert cursor-pointer" onClick={handleCopy} />
        </div>
      </div>
    </div>
  )

  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-6 md:px-9" style={{ maxWidth: "1600px" }}>
          <h1 className="text-white mb-5">My Rented Properties</h1>
          <div className="flex">
            <h5 className="text-white text-lg md:text-xl ml-4 mr-1 mb-2">Manage Rented Properties</h5>
          </div>
          <div className="pt-1 mb-6">
            <div className="text-sm mb-4">
              <div className="h-px bg-gray-600 border-0 mb-2 mt-2 md:w-[340px]" />
              <div className="flex pr-0 mt-1.5 font-semibold items-center text-white mb-1 lg:mb-0 text-xs md:text-base">
                <div className='mt-2'>

                  <p className='text-sm mb-1'>Tokens Accumulated: </p>
                  <div className='flex items-center'>
                    <p className="pl-2 md:mt-1 font-medium font-mono text-xs text-gray-400 mr-2">{renterTokens}</p>
                    <img className="h-[28px] w-7 brightness-200" title='BHB' src="./tokenfrontsmall.png" alt="BHB" />
                  </div>

                </div>

              </div>

              {renterTokens > 0 &&
                <div className='md:w-2/5 lg:w-1/3 xl:w-1/4 pl-2'>
                  {txloadingState[551] || txloadingStateB[551] ? (
                    <p className='w-full flex opacity-80 text-xs italic lg:pt-2 '>
                      <SpinnerIcon text={(txloadingState[551] && !txloadingStateB[551]) ? 'Creating Tx' : 'Confirming Tx'} />
                    </p>
                  ) : (
                    <button
                      className="text-green-400 text-xs lg:text-base hover:bg-green-900 border border-green-400 rounded py-1 px-2 md:mt-2"
                      onClick={() => CollectTokens()}>
                      Collect Tokens
                    </button>
                  )}
                </div>
              }
            </div>

            <div className='flex'>
            </div>

            <p className='mb-2'>
              <div className='flex'>
                <p className="text-white font-semibold text-sm mt-2">BHB Token Address:</p>
                <img src={copyImg} className="w-5 h-5 mt-2 ml-2 invert cursor-pointer md:hidden" onClick={handleCopy} />
              </div>
              
              <div className="flex text-gray-400 mt-2 text-xs font-mono pl-2">
                {propertytokenaddress}
                <img src={copyImg} className="w-5 h-5 ml-2 invert cursor-pointer hidden md:block" onClick={handleCopy} />
              </div>

            </p>
            <div className='pl-2'>
              <AddTokenButton />

            </div>

          </div>
          <div className="h-px bg-gray-600 border-0 mb-2 md:w-[340px]" />
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={rentedProperties.length}
            paginate={paginate}
            currentPage={currentPage}
          />
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-white">
            {rentedProperties.map((property, i) => {
              return (
                <div
                  key={i}
                  className={`border shadow rounded-md overflow-hidden  ${property.propertyId > 500 ? "border-yellow-500 bg-gradient-120 from-black via-black to-green-900" : "bg-gradient-120 from-black via-black to-blue-400"}`}
                >
                  <img className='w-fit h-fit' src={property.image} alt="" />
                  <div className="p-4 pb-2">
                    <p
                      className={`text-2xl font-semibold text-transparent bg-clip-text ${property.propertyId > 500 ? 'bg-gradient-to-r from-white to-purple-500' : 'bg-gradient-to-r from-white to-green-400'}`}
                    >
                      {property.name}
                    </p>
                  </div>
                  <div className='p-4 pt-0'>
                    <div className='flex justify-between mb-2'>
                      <div>
                        <p>Owner:</p>
                        <p className="text-[10px] text-green-400 font-mono">{property.owner}</p>
                      </div>
                      <div className='pt-1.5'>
                        <Blockies
                          seed={property.owner}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col pb-2">
                      <p>Rent Price:</p>
                      <p className="font-mono text-xs text-green-400">{ethers.formatUnits(property.rentPrice).toString()} POL</p>
                    </div>
                    <div className="flex flex-col pb-2">
                      <p>Deposit Paid:</p>
                      <p className="font-mono text-xs text-green-400">{property.deposit} POL</p>
                    </div>
                    <div className="flex flex-col pb-2">
                      <p>Rent Status</p>


                      <p className={`font-mono text-xs text-green-400 ${property.rentStatus ? ' text-yellow-400' : ' text-green-400'}`}>{`${property.rentStatus ? 'Rent Due' : 'Up-to-date'} `}</p>
                    </div>
                  </div>

                  <div className="p-2 pt-1.2 pb-3 bg-black">
                    <div className="flex divide-x divide-white justifty-start px-2">
                      <div className="flex pr-5 lg:pr-3">
                        <div className="text-lg font-bold pr-1">Renting Tips</div>
                      </div>
                      <div className="flex text-xs pl-5 lg:pl-3">
                        <ul className="list-disc pl-3.5 list-outside">
                          <li className='mb-1'>
                            Paying rent on time avoids risk of eviction
                          </li>
                          <li className='mb-1'>
                            Renting from properties with a higher rent price increases token reward
                          </li>
                          <li>
                            Rent can't be paid more than once in 48hrs
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="text-2xl pt-2 text-white"></div>

                    <div className="pt-3 pb-3 px-2">
                      {txloadingState1[i] || txloadingState1B[i] ? (
                        <p className='w-full bg-matic-blue text-xs italic px-1 md:px-3 py-1 rounded'>
                          <SpinnerIcon text={(txloadingState1[i] && !txloadingState1B[i]) ? 'Creating Tx' : 'Confirming Tx'} />
                        </p>
                      ) : (
                        <button onClick={() => { PayRent(property, i) }} className="w-full hover:bg-sky-700 bg-matic-blue text-white font-bold py-2 px-12 rounded">
                          Pay Rent
                        </button>
                      )}
                    </div>
                    <div className="px-2">
                      {txloadingState2[i] || txloadingState2B[i] ? (
                        <p className='w-full bg-red-400 text-xs italic px-3 py-1 rounded'>
                          <SpinnerIcon text={(txloadingState2[i] && !txloadingState2B[i]) ? 'Creating Tx' : 'Confirming Tx'} />
                        </p>
                      ) : (
                        <button onClick={() => { Vacate(property, i) }} className="w-full hover:bg-red-500 bg-red-400 text-white font-bold py-2 px-12 rounded">
                          Vacate
                        </button>
                      )}
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

export default Renting;
