import { React, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { NftTagHelper } from '../Components/Layout/nftTagHelper'
import Web3Modal from 'web3modal'
import axios from 'axios'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import GovtFunctions from '../artifacts/contracts/GovtFunctions.sol/GovtFunctions.json'

import {
  nftaddress, nftmarketaddress, propertytokenaddress, govtaddress
} from '../config'
import Pagination from '../Pagination'
import GetPropertyNames from '../getPropertyName'

const Renting = () => {

  const [rentedProperties, setRentedProperties] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [renterTokens, setRenterTokens] = useState(0)
  const [rentAmount, setRentAmount] = useState(0)

  const [postsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = rentedProperties.slice(indexOfFirstPost, indexOfLastPost);

  useEffect(() => {
    setLoadingState('not-loaded')
    loadProperties()
  }, [currentPage])

  const loadProperties = async () => {
    const web3Modal = new Web3Modal()

    try {
      const connection = await web3Modal.connect()
      const provider = new ethers.providers.Web3Provider(connection)
      const signer = provider.getSigner()
      const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
      const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, signer)
      const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
      const data = await govtContract.fetchMyRentals()
      const tokensHex = await marketContract.getTokensEarned()
      const tokens = ethers.utils.formatUnits(tokensHex.toString(), 'ether')
      setRenterTokens(tokens)

      let dataFiltered = data.filter(a => a.propertyId.toNumber() !== 0)
      const items = await Promise.all(dataFiltered.map(async i => {

        console.log(i.tokenId.toNumber())

        const tokenUri = await tokenContract.tokenURI(i.tokenId)

        const nftTagHelper = new NftTagHelper()

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
          roomThreeRented: false
        }

        if (!item.roomOneRented || !item.roomTwoRented || !item.roomThreeRented) {
          item.available = true;
        }
        return item

      }))

      setRentedProperties(items)
      setLoadingState('loaded')
    } catch (ex) {
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

  const PayRent = async (property) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
    console.log(rentAmount)
    const transaction = await contract.payRent(
      property.propertyId,
      { value: rentAmount }
    )

    await transaction.wait()
    loadProperties()
  }

  const CollectTokens = async () => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)

    const transaction = await contract.withdrawERC20(propertytokenaddress)
    await transaction.wait()
    loadProperties()
  }

  //if same address has rented more than one room, this will vacate all of them
  const Vacate = async (property) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
    const transaction = await contract.vacateProperty(
      property.propertyId
    )

    await transaction.wait()
    console.log(rentedProperties.length)
    loadProperties()
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
          <img src="winter.png" className="pl-6 pr-6 h-4/5 lg:h-5/6 lg:w-3/5 lg:pl-12" />
        </div>
      </div>
    </div>
  )

  if (loadingState === 'loaded' && !rentedProperties.length) return (
    <div className="pt-10 pb-10">
      <div className="flex ">
        <div className="lg:px-4 lg:ml-20" style={{ maxWidth: "1600px" }}>
          <p className="ml-4 lg:ml-0 text-5xl xl3:text-6xl font-bold mb-6 text-white">My Rented Properties</p>
          <p className="text-xl lg:text-xl pl-7 lg:pl-4 font-bold mr-1 text-white">You are not currently renting any properties</p>
          <p className='text-white text-base pt-2 lg:pt-4 pl-7 lg:pl-4'>Rent an owned property and check back here</p>
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
                  <button
                    className="text-pink-400 hover:bg-pink-900 text-base border border-pink-400 rounded py-1 px-2"
                    onClick={() => CollectTokens()}>
                    Collect Tokens
                  </button>
                </div>
              }
            </div>
          </div>
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={rentedProperties.length}
            paginate={paginate}
            currentPage={currentPage}
          />
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-white">
            {currentPosts.map((property, i) => {
              return (
                <div
                  key={i}
                  className={`border shadow rounded-md overflow-hidden  ${property.propertyId > 500 ? "border-yellow-500 bg-gradient-120 from-black via-black to-green-900" : "bg-gradient-120 from-black via-black to-blue-400"}`}
                >
                  <img className='w-fit h-fit' src={property.image} alt="" />
                  <div className="p-4 pb-0">
                    <p
                      style={{ height: "50px" }}
                      className={`text-2xl font-semibold text-transparent bg-clip-text ${property.propertyId > 500 ? 'bg-gradient-to-r from-white to-purple-500' : 'bg-gradient-to-r from-white to-green-400'}`}
                    >
                      {property.name}
                    </p>
                  </div>
                  <div className='p-4 pt-0'>
                    <div className="flex flex-col pb-2">
                      <p>Owner:</p>
                      <p className="font-mono text-xs text-green-400">{property.owner}</p>
                    </div>
                    <div className="flex flex-col pb-2">
                      <p>Rent Price:</p>
                      <p className="font-mono text-xs text-green-400">{property.rentPrice} Matic</p>
                    </div>
                    <div className="flex flex-col pb-2">
                      <p>Deposit Paid:</p>
                      <p className="font-mono text-xs text-green-400">{property.rentPrice} Matic</p>
                    </div>
                  </div>

                  <div className="p-2 pt-1.2 pb-4 bg-black">
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
                        </ul>
                      </div>
                    </div>
                    <div className="text-2xl pt-2 text-white"></div>

                    <div className="px-2 pb-4">
                      <button onClick={() => { PayRent(property) }} className="w-full bg-matic-blue text-white font-bold py-2 px-12 rounded">
                        Pay Rent
                      </button>
                    </div>
                    <div className="px-2">
                      <button onClick={() => { Vacate(property) }} className="w-full bg-red-400 text-white font-bold py-2 px-12 rounded">
                        Vacate
                      </button>
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
