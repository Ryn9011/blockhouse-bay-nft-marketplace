import { React, useEffect, useMemo, useState } from 'react'
import { ethers } from 'ethers'
import { NftTagHelper } from '../Components/Layout/nftTagHelper'
import Web3Modal from 'web3modal'
import axios from 'axios'
import Blockies from 'react-blockies';
import { detectNetwork, getRpcUrl } from '../Components/network-detector';

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import GovtFunctions from '../artifacts/contracts/GovtFunctions.sol/GovtFunctions.json'

import {
  nftaddress, nftmarketaddress, propertytokenaddress, govtaddress
} from '../config'
import Pagination from '../Pagination'
import GetPropertyNames from '../getPropertyName'
import SpinnerIcon from '../Components/spinner';

const copy = require('clipboard-copy')

const Renting = () => {

  const [rentedProperties, setRentedProperties] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [timestampLoadingState, setTimestampLoadingState] = useState('not-loaded')
  const [renterTokens, setRenterTokens] = useState(0)
  const [rentAmount, setRentAmount] = useState(0)
  const [rentStatus, setRentStatus] = useState(false)
  const [rentText, setRentText] = useState('')

  const [postsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [connectedAddress, setConnectedAddress] = useState();
  const [tokenAddress, setTokenAddress] = useState();
  const [renterTimestamps, setRenterTimestamps] = useState();
  const [txloadingState, setTxLoadingState] = useState({});
  const [txloadingState1, setTxLoadingState1] = useState({});
  const [txloadingState2, setTxLoadingState2] = useState({});

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;

  useEffect(() => {
    setLoadingState('not-loaded')
    // async function loadProps() {
      //await 
      loadProperties()
    // }    
    // async function loadTimeStamp() {
    //   await loadTimeStamps()
    // }  
    //loadProps()
    //loadTimeStamp()
    
  }, [currentPage])

  // useEffect(() => {
  //   if (loadingState === 'loaded') {
  //     loadTimeStamps(rentedProperties.length)
  //   }
  // }, [loadingState])

  // const loadTimeStamps = async (pids) => {
  //   const web3Modal = new Web3Modal()

  //   const network = await detectNetwork()
  //   const projectId = "xCHCSCf75J6c2TykwIO0yWgac0yJlgRL"
  //   const rpcUrl = getRpcUrl(network, projectId);

  //   const providerOptions = {
  //     rpc: {
  //       [network]: rpcUrl,
  //     },
  //   };

  //   const connection = await web3Modal.connect(providerOptions);
  //   const provider = new ethers.providers.Web3Provider(connection);
  //   const signer = provider.getSigner()

  //   const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
  //   const renters = await marketContract.getPropertyPayments(pids);
  //   console.log(renters)
  //   // setRenterTimestamps(renters)    
    
  //   return renters;
  // }

  const CheckTimestampExpired = (property) => {
    console.log(property)
    if (property.payments === undefined) {
      console.log("UNDEFINED");
      return true;
    }

    const allTimestampsZero = property.payments.every(payment => {        
        const timestamp = payment[2];

        console.log(payment[2])        
        return timestamp === 0 || timestamp === '0x00';
    });

    if (!allTimestampsZero) {
      return true;
    }

    const currentObject = property.payments.filter(a => a.propertyId == property.propertyId)[0] // Example timestamp from smart contract in seconds
    // console.log(ethers.BigNumber.from(currentObject.timestamp.toNumber())).toNumber()
    const twentyFourHoursInMillis = 600 //24 * 60 * 60 * 1000; // 24 hours in milliseconds
    const currentTimeInMillis = Math.floor(Date.now() / 1000);
    //const currentTimeInMullisPlusOneDay = Date.now() + twentyFourHoursInMillis;
    console.log(currentObject)
    console.log(currentTimeInMillis)
    console.log(currentTimeInMillis - (currentObject.timestamp.toNumber()))

    if ((currentTimeInMillis - (currentObject.timestamp.toNumber())) > twentyFourHoursInMillis) {
      console.log("true")
     // setRentText('Rent overdue')
      return true
    } else {
      console.log("false")
     // setRentText('Rent up to date')
      return false
    }
  }

  const loadProperties = async (i) => {
    try {
      const web3Modal = new Web3Modal()
      const network = await detectNetwork()
      const projectId = "xCHCSCf75J6c2TykwIO0yWgac0yJlgRL"
      const rpcUrl = getRpcUrl(network, projectId);

      const providerOptions = {
        rpc: {
          [network]: rpcUrl,
        },
      };

      const connection = await web3Modal.connect(providerOptions);
      const provider = new ethers.providers.Web3Provider(connection)

      const signer = provider.getSigner()
      const address = await signer.getAddress();
      setConnectedAddress(address);

      const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
      const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, signer)
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider);
      const tokenContractAddress = await tokenContract.address;
      setTokenAddress(tokenContractAddress);

      const data = await marketContract.fetchMyRentals()
      const tokensHex = await marketContract.getTokensEarned()
      const tokens = ethers.utils.formatUnits(tokensHex.toString(), 'ether')
      console.log(tokens)
      setRenterTokens(tokens)

      let dataFiltered = data.filter(a => a.propertyId.toNumber() !== 0)
      console.log(dataFiltered)
      const propertyIds = [];

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        propertyIds.push(item.propertyId);
      }

      // const renters = await marketContract.getPropertyPayments(propertyIds);
      // console.log(renters)
      // setRenterTimestamps(renters)      
      console.log(renterTimestamps)
      const items = await Promise.all(dataFiltered.map(async i => {

        console.log(i.tokenId.toNumber())

        const tokenUri = await tokenContract.tokenURI(i.tokenId)

        const meta = await axios.get(tokenUri)

        let nftName = GetPropertyNames(meta, i.propertyId.toNumber())

        setRentAmount(i.rentPrice)
        let price = ethers.utils.formatUnits(i.rentPrice.toString(), 'ether')
        let rentPrice = await ethers.utils.formatUnits(i.rentPrice.toString(), 'ether')

        let item = {
          price,
          propertyId: i.propertyId.toNumber(),
          seller: i.seller,
          owner: i.owner,
          image: tokenUri,
          name: nftName,
          rentPrice: rentPrice,
          description: "",
          roomOneRented: false,
          roomTwoRented: false,
          roomThreeRented: false,
          rentStatus: undefined,
          payments: i.payments
        }      

        console.log(dataFiltered)
        item.rentStatus = CheckTimestampExpired(item)
        console.log(item.rentStatus)

        if (!item.roomOneRented || !item.roomTwoRented || !item.roomThreeRented) {
          item.available = true;
        }
        return item

      }))

      setRentedProperties(items.slice(0, 20))
      setTimestampLoadingState('loaded');
      setLoadingState('loaded')
      setTxLoadingState({ ...txloadingState, [i]: false });
      setTxLoadingState1({ ...txloadingState1, [i]: false });
      setTxLoadingState2({ ...txloadingState2, [i]: false });
    } catch (ex) {
      setTxLoadingState({ ...txloadingState, [i]: false });
      setTxLoadingState1({ ...txloadingState1, [i]: false });
      setTxLoadingState2({ ...txloadingState2, [i]: false });
      if (ex.message === 'User Rejected') {
        // Handle user rejection
        console.log('Connection request rejected by the user.');
        // Display an error message to the user
        alert('Please connect your wallet to access your rentals');
      } else {
        console.log(ex)
      }
    }
  }


  const PayRent = async (property, i) => {
    try {
      const web3Modal = new Web3Modal()
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()

      const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, signer)
      // const contract = new ethers.Contract(govtaddress, govtContract.abi, signer)
      console.log(rentAmount)
      const transaction = await govtContract.payRent(
        property.propertyId,
        { value: rentAmount }
      )

      setTxLoadingState1({ ...txloadingState1, [i]: true });
      await transaction.wait();
      loadProperties()
    } catch (ex) {
      console.log(ex)
      setTxLoadingState1({ ...txloadingState1, [i]: false });
      alert('transaction failed');
    }
  }

  const CollectTokens = async () => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)

    const transaction = await contract.withdrawERC20(propertytokenaddress)
    setTxLoadingState({ ...txloadingState, [551]: true });
    await transaction.wait()
    loadProperties()
  }

  //if same address has rented more than one room, this will vacate all of them
  const Vacate = async (property, i) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(govtaddress, GovtFunctions.abi, signer)
    const transaction = await contract.vacateProperty(
      property.propertyId
    )

    setTxLoadingState2({ ...txloadingState2, [i]: true });
    await transaction.wait()
    console.log(rentedProperties.length)
    loadProperties()
  }

  const handleCopy = () => {
    copy(propertytokenaddress);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loadingState !== 'loaded' && timestampLoadingState !== 'loaded') return (
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
          <img src="winter.png" className="pl-6 pr-6 h-4/5 lg:h-5/6 lg:w-3/5 lg:pl-12" />
        </div>
      </div>
    </div>
  )

  if (loadingState === 'loaded' && timestampLoadingState === 'loaded' && !rentedProperties.length) return (
    <div className="pt-10 pb-10">
      <div className="flex ">
        <div className="lg:px-4 lg:ml-20" style={{ maxWidth: "1600px" }}>
          <p className="ml-4 lg:ml-0 text-5xl xl3:text-6xl font-bold mb-6 text-white">My Rented Properties</p>
          <p className="text-xl lg:text-xl pl-7 lg:pl-4 font-bold mr-1 text-white">You are not currently renting any properties.</p>
          <p className='text-white text-base pt-2 lg:pt-4 pl-7 lg:pl-4'>Rent a property then check back here.</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-9" style={{ maxWidth: "1600px" }}>
          <h1 className="text-white mb-7">My Rented Properties</h1>
          <div className="flex">
            <h5 className="text-white ml-4 mr-1 mb-5">Manage Rented Properties</h5>
          </div>
          <div className="pt-1">
            <div className="text-sm mb-4 lg:flex">
              <div className="flex pr-4 mt-1.5 font-bold text-white mb-4 lg:mb-0">
                <p>Tokens Accumulated: </p>
                <p className="pl-1 text-matic-blue">{renterTokens} BHB</p>

              </div>

              {renterTokens > 0 &&
                <div className=''>
                  {txloadingState[551] ? (
                    <p className='w-full flex justify-center border border-pink-400 text-xs italic px-12 py-0 rounded'>
                      <SpinnerIcon />
                    </p>
                  ) : (
                    <button
                      className="text-pink-400 hover:bg-pink-900 text-base border border-pink-400 rounded py-1 px-2"
                      onClick={() => CollectTokens()}>
                      Collect Tokens
                    </button>
                  )}
                </div>
              }
            </div>

            <div className='flex'>
              <p className='text-white text-sm font-bold'>BHB Token Address</p>
              <div className="relative flex flex-col items-center group ml-2">
                <svg
                  className="w-4 h-4 mt-0.5 text-white"
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
                  <span className="relative font-semibold flex w-48 z-10 p-2 text-xs leading-none text-black whitespace-no-wrap border border-1 border-black bg-white shadow-lg">
                    Add the BHB Token address to your wallet
                  </span>
                  <div className="w-3 h-3 mt-2 rotate-45 bg-white"></div>
                </div>
              </div>
            </div>
            <p className='mb-6'>
              <span className="text-pink-400 text-xs">
                {propertytokenaddress}
              </span>
              <button className="border px-2 text-white py-0.5 ml-2 border-1 text-xs" onClick={handleCopy}>Copy</button>
            </p>
          </div>
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
                      <p className="font-mono text-xs text-green-400">{property.rentPrice} Matic</p>
                    </div>
                    <div className="flex flex-col pb-2">
                      <p>Deposit Paid:</p>
                      <p className="font-mono text-xs text-green-400">{property.rentPrice} Matic</p>
                    </div>
                    <div className="flex flex-col pb-2">
                      <p>Rent Status</p>
                     
                     
                      <p className={`font-mono text-xs text-green-400 ${property.rentStatus ? ' text-yellow-400' : ' text-green-400'}`}>{`${property.rentStatus ? 'Overdue' : 'Up-to-date'} `}</p>
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
                          <li>
                            Renting from properties with a higher rent price increase token reward
                          </li>
                          <li>
                            Rent can't be paid more than once in 24hrs
                          </li>
                        </ul>
                      </div>
                    </div>
                    <div className="text-2xl pt-2 text-white"></div>

                    <div className="px-2 pt-3 pb-4">
                      {txloadingState1[i] ? (
                        <p className='w-full flex justify-center bg-matic-blue text-xs italic px-12 py-1 rounded'>
                          <SpinnerIcon />
                        </p>
                      ) : (
                        <button onClick={() => { PayRent(property, i) }} className="w-full bg-matic-blue text-white font-bold py-2 px-12 rounded">
                          Pay Rent
                        </button>
                      )}
                    </div>
                    <div className="px-2">
                      {txloadingState2[i] ? (
                        <p className='w-full flex justify-center bg-red-400 text-xs italic px-12 py-1 rounded'>
                          <SpinnerIcon />
                        </p>
                      ) : (
                        <button onClick={() => { Vacate(property, i) }} className="w-full bg-red-400 text-white font-bold py-2 px-12 rounded">
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
