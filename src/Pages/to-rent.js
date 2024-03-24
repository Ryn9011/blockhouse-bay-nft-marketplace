import { React, useEffect, useState } from 'react'

import { NftTagHelper } from '../Components/Layout/nftTagHelper'

import axios from 'axios'
import { Link } from 'react-router-dom';
import Blockies from 'react-blockies';
import { detectNetwork, getRpcUrl } from '../Components/network-detector';
import SpinnerIcon from '../Components/spinner';

import {
  nftaddress, nftmarketaddress, govtaddress
} from '../config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import GovtFunctions from '../artifacts/contracts/GovtFunctions.sol/GovtFunctions.json'
import Pagination from '../Pagination'
import GetPropertyNames from '../getPropertyName'
import SaleHistory from '../Components/sale-history'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { BrowserProvider, Contract, formatUnits } from 'ethers'

const ethers = require("ethers")

window.ethereum.on('accountsChanged', function (accounts) {                 
  window.location.reload();
});

const ToRent = () => {

  const [soldProperties, setSoldProperties] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [txloadingState, setTxLoadingState] = useState({});
  // const [propertyList, setPropertyList] = useState([]);

  const [postsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  // const [onlyRentable, setOnlyRentable] = useState(false);

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const [currentPosts, setCurrentPosts] = useState([]);

  const [numForRent, setNumForRent] = useState();
  const [showBottomNav, setShowBottomNav] = useState(false);    

  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  useEffect(() => {
    setLoadingState('not-loaded')
    loadProperties()
  }, [currentPage])

  const loadProperties = async (prop, i) => {
    try {
      const network = await detectNetwork()
      const projectId = "xCHCSCf75J6c2TykwIO0yWgac0yJlgRL"
      const rpcUrl = getRpcUrl(network, projectId);

      const provider = new ethers.providers.JsonRpcProvider(rpcUrl)
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
      const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, provider) 
      const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, provider)
      console.log('currentPage: ',currentPage)
      const data = await marketContract.fetchPropertiesSold(currentPage ) 
      console.log('data: ',data)

      const numForRent = await marketContract.getPropertiesSold();

      const currentPageNumItems = numForRent - (20 * (currentPage - 1))
      const showBottomNav = currentPageNumItems > 12 ? true : false
      setShowBottomNav(showBottomNav);
      setNumForRent(numForRent.toNumber());
    

      const items = await Promise.all(data.filter(i => i.propertyId.toNumber() != 0 && (a => a.tokenId.toNumber() !== 0)).map(async i => {
        console.log(i.tokenId.toNumber());
        const tokenUri = await tokenContract.tokenURI(i.tokenId)
        console.log('tokenUri: ',tokenUri)
        const nftTagHelper = new NftTagHelper()
        const arweaveId = nftTagHelper.getIdFromGraphUrl(tokenUri)

        const tags = await nftTagHelper.getNftTags(arweaveId)

        const meta = await axios.get(tokenUri)

        let nftName = GetPropertyNames(meta, i.propertyId.toNumber())

        let price = await ethers.utils.formatUnits(i.salePrice.toString(), 'ether')
        let rentPrice = await ethers.utils.formatUnits(i.rentPrice.toString(), 'ether')
        let depositHex = i.deposit//await govtContract.getDepositRequired();
        let deposit = ethers.utils.formatUnits(depositHex, 'ether')
       
        console.log('deposit: ',deposit)
        const renterAddresses = await marketContract.getPropertyRenters(i.propertyId);
        console.log('renterAddresses: ',renterAddresses)
        let saleHistory = [];
        console.log(i.propertyId.toNumber())
        console.log(i.saleHistory)
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
          console.log(saleHistory)

        } else {
          saleHistory.push("Unsold")
        }
        let totalIncomeGenerated;
        if (i.totalIncomeGenerated != 0) {
          totalIncomeGenerated = ethers.utils.formatUnits(i.totalIncomeGenerated)
        } else totalIncomeGenerated = 0;
        console.log('totalIncomeGenerated: ',totalIncomeGenerated)
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
          roomFourRented: i.roomFourRented,
          rentPrice: rentPrice,
          depositRequired: deposit,   
          depositHex: depositHex,       
          available: false,
          isForSale: i.isForSale,
          roomsRented: 0,
          renterAddresses: renterAddresses,
          saleHistory: saleHistory,
          dateSoldHistory: i.dateSoldHistory,
          totalIncomeGenerated: totalIncomeGenerated
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
        if (item.roomFourRented == true) {
          item.roomsRented++
        }
        return item
      }))
      setCurrentPosts(items.slice(0, 20))
      //setSoldProperties(items)
      setTxLoadingState({ ...txloadingState, [i]: false });
      // setPropertyList(items)
      setLoadingState('loaded')
    } catch (error) {
      setTxLoadingState({ ...txloadingState, [i]: false });
      console.log(error)
    }
  }

  const rentProperty = async (property, i) => {
    try {
      const provider = new BrowserProvider(walletProvider)
      const signer = provider.getSigner()

      const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, signer)
      //const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, provider) 

      // const test = i.depositRequired//await govtContract.getDepositRequired();
      // console.log('test: ',test)
      // const deposit = ethers.utils.parseUnits(test.toString(), 'ether')
      // const num = ethers.utils.formatEther(deposit)
      //const rentals = await marketContract.getPropertiesRented()
      // ? ethers.utils.parseUnits(property.rentPrice.toString(), 'ether') 
      // : ethers.utils.parseUnits(contract.defaultRentPrice.toString(), 'ether')
      //STOP SAME ADDRESS RENTING MORE THAN ONE ROOM?            
      const transaction = await govtContract.rentProperty(property.propertyId, {
        value: property.depositHex
      });
      setTxLoadingState({ ...txloadingState, [i]: true });
      
      let trans = await transaction.wait();
      console.log(trans)
      loadProperties(currentPage, i)
    } catch (error) {
      setTxLoadingState({ ...txloadingState, [i]: false });
      console.log('rent proprerty error:', error)
    }
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loadingState !== 'loaded') return (
    <div className="pt-10 pb-10">
      <div className="flex ">
        <div className="lg:px-4 lg:ml-20" style={{ maxWidth: "1600px" }}>
          <div className="flex pl-6 lg:px-12">
            <p className="text-white text-3xl lg:text-5xl font-bold mb-2">Loading Properties</p>
            <Link to="/how-to-play?section=renting" target='new'>
              <svg role="status" className="mt-1 lg:mt-3 ml-3 inline w-8 h-8 mr-2 text-red-500 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
              </svg>
            </Link>
          </div>
          <img src="summer.png" className="pl-6 pr-6 h-4/5 lg:h-5/6 lg:w-3/5 lg:pl-12" />
          {/* <div className="h-1/6 scale-75 flex justify-end">
            <img src="logofull.png"  alt="blockhouse bay" />
          </div> */}

        </div>
      </div>
    </div>
  )

  if (loadingState === 'loaded' && !currentPosts.length) return (
    <div className="pt-10 pb-10">
      <div className="flex ">
        <div className="lg:px-4 lg:ml-20" style={{ maxWidth: "1600px" }}>
          <p className="ml-4 lg:ml-0 text-5xl xl3:text-6xl font-bold mb-6 text-white">To Rent</p>
          <p className="text-xl lg:text-xl pl-7 lg:pl-4 font-bold mr-1 text-white">No properties currently for rent</p>
          <p className='text-white text-base pt-2 lg:pt-4 pl-7 lg:pl-4'>Check back soon for new rentals</p>
        </div>
      </div>
    </div>
  )
  // Rent a room from an owner and earn BHB tokens
  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-4" style={{ maxWidth: "1600px" }}>
          <p className="xl3:ml-4 lg:ml-0 text-5xl xl3:text-6xl font-bold text-white">To Rent</p>
          <div className="flex text-white pl-4">
            {/* <h5>Rent a property and earn</h5> */}
            <header className="flex items-center h-16">
              <div className="text-sm lg:text-xl font-bold">Rent a room from a home owner and earn BHB tokens</div>
            </header>
            <div className=" hidden lg:block">
              <img
                className="lg:object-none brightness-150 h-8 w-10 lg:w-auto lg:h-auto lg:scale-75 lg:pt-0"
                src="./tokenfrontsmall.png"
                alt=""
              ></img>
            </div>
          </div>

          {/* <div className='flex mb-3'>
            <input onClick={() => setOnlyRentable(!onlyRentable)} type="checkbox" className='mt-1 mr-2 ' />
            <p className='text-white text-xs mt-1 lg:mt-0 lg:text-base'>Show only available to rent</p>
          </div> */}
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={numForRent}
            paginate={paginate}
            currentPage={currentPage}
          />
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-white">
            {currentPosts.map((property, i) => {
              if (property.roomsRented < 4) {
                return (
                  <div
                    key={i}
                    className="border shadow rounded-md overflow-hidden bg-gradient-120 from-black via-black to-blue-400"
                  >
                    <img className='w-fit h-fit' src={property.image} alt="" />
                    <div className="p-4 ">
                      <p
                        style={{ height: "50px" }}

                        className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400"
                      >
                        {property.name}

                      </p>
                      <div style={{ overflow: "hidden" }}>
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
                          <p>Rooms Rented:</p>
                          <p className="font-mono text-xs text-green-400">{property.roomsRented}/4</p>
                        </div>
                        <div className="flex flex-col pb-2">
                          <p>Rent Price:</p>
                          <p className="font-mono text-xs text-green-400">{property.rentPrice}</p>
                        </div>
                        {/* <div className="flex flex-col">
                        <p>Total Income Generated:</p>
                        <p className="font-mono text-xs text-green-400">{property.totalIncomeGenerated} Matic</p>
                      </div> */}
                        <p>Tenants:</p>
                        <div className='text-[10px] mb-3 text-green-400 font-mono'>
                          {ethers.utils.formatEther(property.renterAddresses[0]).toString() !== "0.0" ?
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
                              <div className='flex items-center mt-2'>
                                <p className='h-9'>0x</p>
                              </div>
                            </>
                          }
                          {ethers.utils.formatEther(property.renterAddresses[1]).toString() !== "0.0" ?
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
                                <p className='h-9'>0x</p>
                              </div>
                            </>
                          }
                          {ethers.utils.formatEther(property.renterAddresses[2]).toString() !== "0.0" ?
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
                                <p className='h-9'>0x</p>
                              </div>
                            </>
                          }
                          {ethers.utils.formatEther(property.renterAddresses[3]).toString() !== "0.0" ?
                            <div className='flex items-center justify-between'>
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
                                <p className='h-9'>0x</p>
                              </div>
                            </>
                          }
                        </div>
                        <SaleHistory property={property} />                      
                      </div>
                    </div>



                    <div className="p-2 pt-1.2 pb-4 xl:pb-2 bg-black">
                      <div className="flex divide-x divide-white justifty-start px-2">
                        <div className="flex pr-5 lg:pr-3">
                          <div className="text-lg font-bold">Rental Deposit</div>
                          <Link to="/how-to-play?section=renting" target='new'>
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
                              A rental deposit of <span className='font-mono text-xs text-blue-400'>10 Matic</span> is required to rent this property
                            </li>
                            <li>
                              Rental deposits are refunded upon vacating a property (providing renter is not evicted from the property)
                            </li>
                          </ul>
                        </div>
                      </div>

                      <div className="text-2xl pt-2 text-white"></div>

                      <div className="px-2 flex justify-center">
                        {txloadingState[i] ? (
                          <p className='w-full flex justify-center bg-matic-blue text-xs italic px-12 py-1 rounded'>
                            <SpinnerIcon />
                          </p>
                        ) : (
                          <button
                            onClick={() => rentProperty(property, i)}
                            className="w-full hover:bg-sky-700 bg-matic-blue text-white font-bold py-2 px-12 rounded"
                          >
                            Rent
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }
            })}
          </section>
          {showBottomNav &&
            <div className='mt-6'>
                  <Pagination
                    postsPerPage={postsPerPage}
                    totalPosts={numForRent}
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

export default ToRent;

//what happens if rent more than one room with same address?
