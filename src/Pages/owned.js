import { React, useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { NftTagHelper } from '../Components/Layout/nftTagHelper'
import Web3Modal from 'web3modal'

import Market from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'

import {
  nftaddress, nftmarketaddress, propertytokenaddress
} from '../config'
import Pagination from '../Pagination'

const Owned = () => {

  const [nfts, setNfts] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [loadingState2, setLoadingState2] = useState('not-loaded')
  const [acceptToken, setAcceptToken] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState("")
  const [sellAmount, setSellAmount] = useState(0)
  const [tokenAmount, setTokenAmount] = useState(0)  
  const [amountAccumulated, setAmountAccumulated] = useState()
  const [addressesOverdue, setAddressesOverdue] = useState([])

  const [postsPerPage] = useState(2);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = nfts.slice(indexOfFirstPost, indexOfLastPost);


  useEffect(async () => {
    await loadProperties();     
  }, [])

  useEffect(async () => {
    await getLogData();     
  }, [loadingState])

  

  async function loadProperties() {
    const web3Modal = new Web3Modal()

    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const data = await marketContract.fetchMyProperties()
    let value = ethers.utils.formatUnits(await marketContract.getRentAccumulated(), 'ether')
    setAmountAccumulated(value)

    const items = await Promise.all(data.map(async i => {
      const tokenUri = await tokenContract.tokenURI(i.tokenId)
      //const meta = await axios.get(tokenUri)

      const nftTagHelper = new NftTagHelper()
      const arweaveId = nftTagHelper.getIdFromGraphUrl(tokenUri)
      
      const tags = await nftTagHelper.getNftTags(arweaveId)
    
      const nameTags = tags.data.transactions.edges[0].node.tags[0]
     
      let nftName

      if (nameTags['name'] === "Application") {
        nftName = nameTags['value']
      }

      let price = ethers.utils.formatUnits(i.salePrice.toString(), 'ether')
      let rentPrice = ethers.utils.formatUnits(i.rentPrice.toString(), 'ether')         
      const renterAddresses = await marketContract.getPropertyRenters(i.propertyId);
      const tokensHex = await marketContract.getTokensEarned()   
      const tokens = ethers.utils.formatUnits(tokensHex.toString(), 'ether')
      let item = {
        price,
        propertyId: i.propertyId.toNumber(),
        tokenId: i.tokenId.toNumber(),
        seller: i.seller,
        owner: i.owner,
        image: tokenUri,
        name: nftName,
        rentPrice: rentPrice,
        roomOneRented: i.roomOneRented,
        roomTwoRented: i.roomTwoRented,
        roomThreeRented: i.roomThreeRented,
        roomsToRent: 0,
        renterAddresses: renterAddresses,
        isForSale: i.isForSale,
        tokenPrice: tokens        
      }
      if (item.roomOneRented === true) {
        item.roomsToRent++
      }
      if (item.roomTwoRented === true) {
        item.roomsToRent++
      }
      if (item.roomThreeRented === true) {
        item.roomsToRent++
      }
      return item
    }))

    setNfts(items)  
    setLoadingState('loaded')    
  }

  const SellProperty = async (property, i) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    let maticAmount = document.getElementById('amountInput' + i).value
    let tokenAmount = document.getElementById('tokenInput' + i).value
    tokenAmount = tokenAmount === "" ? 0 : tokenAmount

    const priceFormatted = ethers.utils.parseUnits(maticAmount, 'ether')

    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const listingPrice = await contract.getListingPrice()

    const nftContract = new ethers.Contract(nftaddress, NFT.abi, signer)
    await nftContract.giveResaleApproval(property.propertyId) //give user explaination of this tranasction

    const transaction = await contract.sellUserProperty(
      nftaddress,
      property.tokenId,
      property.propertyId,
      priceFormatted,
      tokenAmount,
      { value: listingPrice }
    )

    await transaction.wait()
    loadProperties()
  }  

  const getLogData = async () => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
    const marketAddress = marketContract.address

    const iface = new ethers.utils.Interface(Market.abi);
 
    let propertyIds = nfts.map(item => item.propertyId)
    console.log(propertyIds)
    let latestBlockNum = await provider.getBlockNumber() - 5 //change this to 150000 when live
    console.log(latestBlockNum)
    let latestBlock = await provider.getBlock(latestBlockNum)
    let latestBlockTimestamp = latestBlock.timestamp
    console.log(latestBlockTimestamp)

    const logs = await provider.getLogs({
      fromBlock: latestBlockNum,
      toBlock: "latest",
      address: marketAddress
    })   
    console.log(logs)

    const decodedEvents = logs.map(log => iface.parseLog(log));
    console.log(decodedEvents) 

    let testArr = new Array()
    decodedEvents.map(event => {
      let arr = new Array()   
      arr.push(event["args"]["tenant"])
      arr.push(event["args"]["blockTime"])
      arr.push(event["args"]["propertyId"])  
      testArr.push(arr)
    })
    
    let filteredEvents = testArr.filter(item => {
      let itemNum = item[2].toNumber()
      return propertyIds.includes(itemNum)        
    })

    filteredEvents.map((item) => {
      let timeSeconds = item[1].toNumber()
      let secondsDays = 258000
      console.log(timeSeconds + secondsDays)
      console.log(latestBlockTimestamp)
      
      //258000 seconds in 3 days
      
      //add 3 days seconds to rentPaid trans timestamp. If < than latest block timestamp then overdue
      if (timeSeconds + secondsDays < latestBlockTimestamp) {
        setAddressesOverdue(addressesOverdue => [...addressesOverdue, item[0]])
        //setAddressesOverdue("0x2546BcD3c84621e976D8185a91A922aE77ECEc30")
      }
      console.log(addressesOverdue)
    })
    setLoadingState2('loaded')  
    console.log(filteredEvents)
    console.log(addressesOverdue)



    // const tenants = decodedEvents.map(event => event["args"]["tenant"]);
    // console.log(tenants)
    // const blockTimes = decodedEvents.map(event => event["args"]["blockTime"]);
    // console.log(blockTimes)
    // const propertyIds = decodedEvents.map(event => event["args"]["propertyId"]);
    // console.log(propertyIds)

    // console.log(await signer.getAddress())
    // let userPropertyIds = new Array()
    // nfts.map((item) => {
    //   propertyIds.push(item.propertyId)
    //   console.log(propertyIds)
    // })    
  }

  const CancelSale = async (property) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const transaction = await contract.cancelSale(nftaddress, property.tokenId, property.propertyId)

    await transaction.wait()
    loadProperties()
  }

  const ChangeRent = async (property, i) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    let rentVal = document.getElementById('rentInput' + i).value
    let newPrice =  ethers.utils.parseUnits(rentVal, 'ether')

    const transaction = await contract.setRentPrice(property.propertyId, newPrice)
    await transaction.wait()
    loadProperties()
  }

  const CollectRent = async () => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)

    const transaction = await contract.collectRent()
    await transaction.wait()
    loadProperties()
  }

  const EvictTenant = async (property) => {
    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    const transaction = await contract.evictTennant(property.propertyId, tenantToDelete.address)
    await transaction.wait()
    loadProperties()
  }

  const onAcceptTokenChange = (e, i) => {
    setTokenAmount(0)
    document.getElementById(e.target.id).value = null
    if (e.target.checked) {    
      document.getElementById('maticInput' + i).style.visibility = 'visible'
      document.getElementById("sellBtn" + i).disabled = true
      document.getElementById("sellBtn" + i).classList.remove("bg-matic-blue", "text-white")
      document.getElementById("sellBtn" + i).classList.add("bg-gray-400", "text-gray-600")  
    } else {
      document.getElementById('maticInput' + i).style.visibility = 'hidden'
      document.getElementById('tokenInput' + i).value = null
      if (document.getElementById("amountInput" + i).value.length > 0) {                      
        document.getElementById("sellBtn" + i).disabled = false
        document.getElementById("sellBtn" + i).classList.remove("bg-gray-400", "text-gray-600")
        document.getElementById("sellBtn" + i).classList.add("bg-matic-blue", "text-white")
      }
    }
  }

  const SetSellAmount = (e) => {
    setSellAmount(e.target.value)
  }

  const SetTokenAmount = (e) => {
    // document.entBygetElemId('maticInput' + i)
    // setTokenAmount(e.target.value)
  }

  function handleKeyPress(e) {
    const characterCode = e.key
    if (characterCode === 'Backspace') return

    const characterNumber = Number(characterCode)
    if (characterNumber >= 0 && characterNumber <= 9) {
      if (e.currentTarget.value && e.currentTarget.value.length) {
        return
      } else if (characterNumber === 0) {
        e.preventDefault()
      }
    } else {
      e.preventDefault()
    }
  }

  function handleBlur(e) {
    if (e.currentTarget.value === '0') e.currentTarget.value = '1'
  }

  const setInitalAddresses = (property) => {
    if (loadingState) {
      return setAddresses(property)
    }
  }

  const SetTenantRadioStatus = (property, i) => {
    if (ethers.utils.formatEther(property.renterAddresses[i]).toString() !== "0.0") {
      // setDisabledRadioCount(disabledRadioCount+1)
      // if (disabledRadioCount == 3) {
      //   setDisabledEvictButton(true)
      // }
      return false
    } else return true;
  }

  const SetEvictButtonColour = (property) => {
    if (ethers.utils.formatEther(property.renterAddresses[0]).toString() === "0.0"
      && ethers.utils.formatEther(property.renterAddresses[1]).toString() === "0.0"
      && ethers.utils.formatEther(property.renterAddresses[2]).toString() === "0.0") {
      return "bg-gray-400 cursor-default text-gray-600"
    } else {
      return "bg-red-400"
    }
  }

  const setEvictButtonStatus = (property) => {
    if (ethers.utils.formatEther(property.renterAddresses[0]).toString() === "0.0"
      && ethers.utils.formatEther(property.renterAddresses[1]).toString() === "0.0"
      && ethers.utils.formatEther(property.renterAddresses[2]).toString() === "0.0") {
      return true
    } else return false
  }

  const setAddresses = (property, e, i) => {
    if (property !== undefined) {
      console.log(i)
      return (
        <div className='text-xs mt-2 text-green-200'>          
          {ethers.utils.formatEther(property.renterAddresses[0]).toString() !== "0.0" ?
            <>
              {/* {                 
                addressesOverdue.includes(property.renterAddresses[0]) && e === undefined && property.renterAddresses[0] !== tenantToDelete ? 
                  <p className={"break-words text-yellow-400" + getTenantToDeleteColour(property, i)}>
                    {property.renterAddresses[0]}
                  </p>
                : */}
                <p className={" break-words " + getTenantToDeleteColour(property, 0)}>
                  {property.renterAddresses[0]}
                </p>
              {/* } */}
            </>
            : <p>0x</p>
          }
          {ethers.utils.formatEther(property.renterAddresses[1]).toString() !== "0.0" ?
            <p className={"break-words " + getTenantToDeleteColour(property, 1)}>
              {property.renterAddresses[1]}
            </p>
            : <p>0x</p>
          }
          {ethers.utils.formatEther(property.renterAddresses[2]).toString() !== "0.0"
            ? <p className={"break-words " + getTenantToDeleteColour(property, 2)}>
              {property.renterAddresses[2]}
            </p>
            : <p>0x</p>}
        </div>
      )
    }
  }

  function handleSellButton(e, i) {
    
      if (document.getElementById("matic" + i).checked == false) {
        if (e.target.value.length > 0) {
          document.getElementById("sellBtn" + i).disabled = false
          document.getElementById("sellBtn" + i).classList.remove("bg-gray-400", "cursor-default", "text-gray-600")
          document.getElementById("sellBtn" + i).classList.add("bg-matic-blue", "cursor-pointer", "text-white")
        } else {
          document.getElementById("sellBtn" + i).disabled = true
          document.getElementById("sellBtn" + i).classList.remove("bg-matic-blue", "cursor-pointer", "text-white")
          document.getElementById("sellBtn" + i).classList.add("bg-gray-400", "cursor-default", "text-gray-600")      
        }
      } else {
        if (document.getElementById("amountInput" + i).value.length == 0 
            || document.getElementById("tokenInput" + i).value.length == 0) {
          document.getElementById("sellBtn" + i).disabled = true
          document.getElementById("sellBtn" + i).classList.remove("bg-matic-blue", "cursor-pointer", "text-white")
          document.getElementById("sellBtn" + i).classList.add("bg-gray-400", "cursor-default", "text-gray-600")  
        } else {
          document.getElementById("sellBtn" + i).disabled = false
          document.getElementById("sellBtn" + i).classList.remove("bg-gray-400", "cursor-default", "text-gray-600")
          document.getElementById("sellBtn" + i).classList.add("bg-matic-blue", "cursor-pointer", "text-white")
        }
    }    
  }

  function setRentButton(e, i) {
    if(document.getElementById("rentInput" + i).value.length == 0) {
      document.getElementById("rentButton" + i).disabled = true
      document.getElementById("rentButton" + i).classList.remove("bg-pink-400", "cursor-pointer", "text-white")
      document.getElementById("rentButton" + i).classList.add("bg-gray-400", "cursor-default", "text-gray-600")  
    } else {
      document.getElementById("rentButton" + i).disabled = false
      document.getElementById("rentButton" + i).classList.remove("bg-gray-400", "cursor-default", "text-gray-600")
      document.getElementById("rentButton" + i).classList.add("bg-pink-400", "cursor-pointer", "text-white")  
    }
  }

  function SetTenantToDelete(e, i, property) {
    document.getElementById("evictButton" + i).classList.remove("bg-gray-400", "text-gray-600")
    document.getElementById("evictButton" + i).classList.add("bg-red-400", "test-white")
    if (e.target.id === "tenant1") {
      setTenantToDelete({ address: property.renterAddresses[0] })
    } else if (e.target.id === "tenant2") {
      setTenantToDelete({ address: property.renterAddresses[1] })
    } else if (e.target.id === "tenant3") {
      setTenantToDelete({ address: property.renterAddresses[2] })
    }   

    return setAddresses(property, e, i)

  }
  const getTenantToDeleteColour = (tenant, i) => {
    console.log(i)
    if (tenant.renterAddresses[i] === tenantToDelete.address) {
      return "text-red-400"
    } else if (addressesOverdue.includes(tenant.renterAddresses[i])) {
      return "text-yellow-400"
    } else {
      return ""
    }
  }
  const getTenantWarningColour = (tenant) => {
    //if tenent has not paid in rent period mark as warning colour
    // if (tenant === tenantToDelete) {
    //     return "text-yellow-400"
    // } else {
    //     return ""
    // }     
  }

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (loadingState !== 'loaded') return (
    <div className="flex px-12">
      <h1 className="pr-4 py-10 text-3xl">Loading Properties</h1>
      <svg role="status" className="mt-10 inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
        <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
      </svg>
    </div>
  )

  if (loadingState   === 'loaded' && !nfts.length) return (<h1 className="py-10 px-20 text-3xl">No assets owned</h1>)
    // {await getLogData()}
  return (   
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-9" style={{ maxWidth: "1650px" }}>
          <h1 className="text-white mb-5">My Properties</h1>
          <div className="flex">
            <h5 className="text-white ml-4 mr-1 mb-5">Manage Owned Properties</h5>
          </div>
          <div className="pt-3">
            <div className="text-sm mb-4 mt-1 flex">
              <div className="flex pr-4 mt-1.5 font-bold text-white">
                <p>Rent Accumulated: </p>
                <p className="pl-1 text-matic-blue">{amountAccumulated} MATIC</p>
              </div>
              {amountAccumulated > 0 &&
                <button 
                  className="text-pink-400 hover text-base border border-pink-400 rounded py-1 px-2"
                  onClick={() => CollectRent()}>
                    Collect Rent
                </button>
              }
            </div>
          </div>
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={nfts.length}
            paginate={paginate}
            currentPage={currentPage}
          />
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-white">
            {currentPosts.map((property, i) => {
              return (
                <div
                  key={i}
                  className="border shadow rounded-md overflow-hidden bg-gradient-to-r from-blue-400 to-black"
                >
                  <img src={"./house.png"} alt="" />
                  <div className="p-4 ">
                    <p
                      style={{ height: "50px" }}
                      className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white to-green-400"
                    >
                      {property.name}
                    </p>
                    <div className="flex relative">
                      <h6 className="pr-1 text-white under">Property Info</h6>
                      <div className="text-sm font-bold mb-4 mt-1 flex">
                        <div className="mb-1 relative">
                          <div className="relative flex flex-col items-center group">
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
                            <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
                              <span className="relative z-10 p-2 text-xs leading-none text-white whitespace-no-wrap bg-black shadow-lg">
                                Learn more
                              </span>
                              <div className="w-3 h-3 -mt-2 rotate-45 bg-black"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {property.isForSale &&
                        <div>
                          <img className="absolute scale-75 left-40 pl-10 md:left-40 lg:left-28 lg:pl-25 xl:left-40" src="./for-sale.png" alt="for sale" />
                        </div>
                      }
                    </div>

                    <div style={{ overflow: "hidden" }}>
                      <div className="flex">
                        <p>Rooms Rented:</p>
                        <p className="pl-3 font-bold">{property.roomsToRent}/3</p>
                      </div>
                      <div className="flex">
                        <p>Rent Price:</p>
                        <p className="pl-3 font-bold">{property.rentPrice} Matic</p>
                      </div>
                      <div>
                        Tenants
                        {setInitalAddresses(property)}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-black">
                    {/*  */}
                    <div className="mb-1 grid-rows-3 divide-y divide-white">
                      {property.isForSale ?
                        <div className="flex flex-col flex-wrap justify-between">
                          <div className="flex flex-wrap justify-start gap-4 md:gap-0 mb-4">
                            <div className="text-sm font-bold mb-2 md:mb-0 flex">
                              <div className="pr-1">Cancel Sale</div>
                              <div className="mb-1 relative">
                                <div className="relative flex flex-col items-center group">
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
                                  <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
                                    <span className="relative z-10 p-2 text-xs leading-none text-black whitespace-no-wrap bg-white shadow-lg">
                                      Learn more
                                    </span>
                                    <div className="w-3 h-3 mt-2 rotate-45 bg-white"></div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className='mb-5'>Sale Price: {property.price.substring(0, property.price.length-2)} matic | Token Price: {property.tokenPrice.substring(0, property.tokenPrice.length-2)}</div>
                          <div className="md:justify-self-start">
                            <button onClick={() => CancelSale(property)} className="w-full bg-yellow-600 text-white font-bold py-2 rounded">
                              Cancel
                            </button>
                          </div>
                        </div>
                        : <div className="flex flex-col flex-wrap justify-between">
                          <div className="flex flex-wrap justify-start gap-4 md:gap-0">
                            <div className="text-sm font-bold mb-2 md:mb-0 flex">
                              <div className="pr-1">Sell</div>
                              <div className="mb-1 relative">
                                <div className="relative flex flex-col items-center group">
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
                                  <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
                                    <span className="relative z-10 p-2 text-xs leading-none text-black whitespace-no-wrap bg-white shadow-lg">
                                      Learn more
                                    </span>
                                    <div className="w-3 h-3 mt-2 rotate-45 bg-white"></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className='pl-4 flex'>
                              <input
                                className="rounded-full flex-shrink-0 h-3 w-3 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                                type="checkbox"
                                name="flexRadioDefault"
                                id={"matic" + i}
                                onChange={(e) => onAcceptTokenChange(e, i)}
                                value="./matic-icon.png"
                              />
                              <div className='mb-3'>
                                <label
                                  className=" form-check-label inline-block text-sm text-white align-top"
                                  htmlFor={"matic" + i}
                                >
                                  Accept POG?
                                </label>
                              </div>
                            </div>


                          </div>
                          <div className='flex'>
                            <div className='flex pr-8'>
                              <input
                                className="w-20 xl:w-24 h-6 bg-black shadow appearance-none border rounded py-2 px-1 text-white leading-tight focus:outline-none focus:shadow-outline "
                                type="number"
                                min="1"
                                step="1"
                                onBlur={handleBlur}
                                onKeyDown={handleKeyPress}
                                onChange={(e) => handleSellButton(e, i)}
                                id={"amountInput" + i}
                              />
                              <img
                                className="object-contain scale-75 mb-4 pl-3"
                                src="./matic-icon.png"
                                alt=""
                              ></img>
                            </div>

                            <div className='invisible flex' id={'maticInput' + i}>
                              <input
                                className="w-20 xl:w-24 h-6 bg-black shadow appearance-none border rounded py-2 px-0 text-white leading-tight focus:outline-none focus:shadow-outline "
                                type="number"
                                min="1"
                                step="1"
                                onBlur={handleBlur}
                                onKeyDown={handleKeyPress}
                                onChange={(e) => handleSellButton(e, i)}
                                id={"tokenInput" + i}
                              />
                              <img
                                className="object-contain scale-75 mb-2 pl-3"
                                src="./pogtoken.png"
                                alt=""
                              ></img>
                            </div>

                          </div>

                          <div className="md:justify-self-start">
                            <button onClick={() => SellProperty(property, i)}id={"sellBtn" + i} className="w-full bg-gray-400 cursor-default text-gray-600 font-bold py-2 rounded">
                              Sell
                            </button>
                          </div>
                        </div>
                      }
                      <div className="flex flex-col mt-4">
                        <div className="flex mt-3 justify-between">
                          <div className="text-sm font-bold mb-4 mt-1 flex">
                            <p className="pr-1">Evict tenant</p>
                            <div className="mb-1 relative">
                              <div className="relative flex flex-col items-center group">
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
                                <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
                                  <span className="relative z-10 p-2 text-xs leading-none text-black whitespace-no-wrap bg-white shadow-lg">
                                    Learn more
                                  </span>
                                  <div className="w-3 h-3 -mt-2 rotate-45 bg-white"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-items-start pt-1 pb-4">
                            <input
                              className="rounded-full h-3 w-3 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                              type="radio"
                              name="flexRadioDefault"
                              id="tenant1"
                              onChange={(e) => SetTenantToDelete(e, i, property)}
                              disabled={SetTenantRadioStatus(property, 0)}
                            />
                            <label
                              className="form-check-label inline-block mr-6 text-sm text-white"
                              htmlFor="{ValidateInput}"
                            >
                              1
                            </label>

                            <input
                              className="rounded-full h-3 w-3 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                              type="radio"
                              name="flexRadioDefault"
                              id="tenant2"
                              onChange={(e) => SetTenantToDelete(e, i, property)}
                              disabled={SetTenantRadioStatus(property, 1)}
                            />
                            <label
                              className="form-check-label inline-block mr-6 text-sm text-white"
                              htmlFor="flexRadioDefault1"
                            >
                              2
                            </label>

                            <input
                              className="rounded-full h-3 w-3 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                              type="radio"
                              name="flexRadioDefault"
                              id="tenant3"
                              onChange={(e) => SetTenantToDelete(e, i, property)}
                              disabled={SetTenantRadioStatus(property, 2)}
                            />
                            <label
                              className="form-check-label inline-block mr-1 text-sm text-white"
                              htmlFor="flexRadioDefault1"
                            >
                              3
                            </label>
                          </div>
                        </div>
                        <button
                          onClick={() => EvictTenant(property)}
                          className={"w-full text-gray-600 bg-gray-400 font-bold py-2 mb-4 rounded "}
                          disabled={setEvictButtonStatus(property)}
                          id={"evictButton" + i}>
                          Evict
                        </button>
                      </div>
                      <div className="pt-3">
                        <div className="text-sm font-bold mb-4 mt-1 flex gap-4">
                          <div className='flex'>
                          <p className="pr-1">Change Rent Price</p>
                          <div className="mb-1 relative">
                            <div className="relative flex flex-col items-center group">
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
                              <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
                                <span className="relative z-10 p-2 text-xs leading-none text-black whitespace-no-wrap bg-white shadow-lg">
                                  Learn more
                                </span>
                                <div className="w-3 h-3 -mt-2 rotate-45 bg-white"></div>
                              </div>
                            </div>
                          </div>
                          </div>
                          
                          <div>
                            <input
                              className="w-20 xl:w-24 h-6 bg-black shadow appearance-none border rounded py-2 text-white leading-tight focus:outline-none focus:shadow-outline "
                              type="number"
                              min="1"
                              step="1"
                              onBlur={handleBlur}
                              onKeyDown={handleKeyPress}
                              onChange={(e) => setRentButton(e, i)}
                              id={"rentInput" + i}
                            />
                          </div>
                          <img
                            className="object-contain scale-75"
                            src="./matic-icon.png"
                            alt=""
                          ></img>
                        </div>

                        <button 
                          className="w-full bg-gray-400 text-gray-600 cursor-default font-bold py-2 rounded"
                          onClick={() => ChangeRent(property, i)}
                        
                          id={"rentButton" + i}>
                          Change
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

export default Owned;

//what happens if rent more than one room with same address?
