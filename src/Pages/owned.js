import React, { useEffect, useState, useRef } from 'react'
import { useModalContext } from '../App'
import { useWeb3ModalAccount } from '@web3modal/ethers/react'
import { Contract } from 'ethers'

import axios from 'axios'
import { Link, useLocation } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';

import Blockies from 'react-blockies';

import Market from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import GovtFunctions from '../artifacts/contracts/GovtFunctions.sol/GovtFunctions.json'
import SaleHistory from '../Components/sale-history'
import { calculateRankingTotal } from '../calculateRanking'
import SpinnerIcon from '../Components/spinner';

import {
  nftaddress, nftmarketaddress, govtaddress
} from '../config'
import Pagination from '../Pagination'
import GetPropertyNames from '../getPropertyName'
const ethers = require("ethers")
/* global BigInt */

const useStyles = makeStyles({
  padding: {
    paddingTop: '0px !important',
    fontSize: '0.75rem !important',
    lineHeight: '1rem !important',
    display: 'flex !important',
  }
});

const Owned = () => {

  const [currentPosts, setCurrentPosts] = useState([]);
  const [loadingState, setLoadingState] = useState('not-loaded')
  const [loadingState2, setLoadingState2] = useState('not-loaded')
  const [acceptToken, setAcceptToken] = useState(false)
  const [tenantToDelete, setTenantToDelete] = useState("")
  const [tenantToDeleteProperty, setTeneantToDeleteProperty] = useState()
  const [sellAmount, setSellAmount] = useState(0)
  const [tokenAmount, setTokenAmount] = useState(0)
  const [amountAccumulated, setAmountAccumulated] = useState()
  const [addressesOverdue, setAddressesOverdue] = useState([])
  const [expanded, setExpanded] = React.useState(false);
  const [twitterSaleChecked, setTwitterSaleChecked] = useState(false);
  const [twitterRentChecked, setTwitterRentChecked] = useState(false);
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [hasSetText, setHasSetText] = useState(false)
  const twitterTextRef = useRef(null);
  const [propertyIdTwitter, setPropertyIdTwitter] = useState();
  const location = useLocation()
  //const [isConnected, setIsConnected] = useState(false);
  const classes = useStyles();
  const iconColor = "#1DA1F2";
  const [txloadingState1, setTxLoadingState1] = useState({});
  const [txloadingState2, setTxLoadingState2] = useState({});
  const [txloadingState3, setTxLoadingState3] = useState({});
  const [txloadingState4, setTxLoadingState4] = useState({});
  const [txloadingState5, setTxLoadingState5] = useState({});

  const [txloadingState1B, setTxLoadingState1B] = useState({});
  const [txloadingState2B, setTxLoadingState2B] = useState({});
  const [txloadingState3B, setTxLoadingState3B] = useState({});
  const [txloadingState4B, setTxLoadingState4B] = useState({});
  const [txloadingState5B, setTxLoadingState5B] = useState({});
  const [totalUserPropertyCount, setTotalUserPropertyCount] = useState(0);
  const { address, chainId, isConnected } = useWeb3ModalAccount()

  const { modalEvent, provider, signer } = useModalContext();

  const [postsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const [retries, setRetries] = useState(3)

  let exceptionCount = 3

  useEffect(() => {
    //console.log(provider);
    //console.log(signer);
    if (signer == null) {
      return;
    }
    if (provider != null) {
      loadProperties();
    }
  }, [currentPage, signer]);

  useEffect(() => {
    if (modalEvent === null) {
      return;
    }
    //console.log(modalEvent.data.event)
    if (modalEvent.data.event === 'DISCONNECT_SUCCESS' || modalEvent.data.event === 'DISCONNECT_ERROR') {
      window.location.reload();
    } else {
    }
  }, [modalEvent]);

  async function loadProperties(i) {
    try {
      //console.log('Retries: ', retries)
      if (exceptionCount === 0) {
        return;
      }
      if (!isConnected) {
        exceptionCount--;
        setTxLoadingState1({ ...txloadingState1, [i]: false });
        setTxLoadingState2({ ...txloadingState2, [i]: false });
        throw Error('User disconnected')
      }

      const market = new Contract(nftmarketaddress, Market.abi, signer);
      const govt = new Contract(govtaddress, GovtFunctions.abi, provider);
      const token = new Contract(nftaddress, NFT.abi, provider);

      const data = await market.fetchMyProperties(currentPage)
      const propertyCount = await market.getUserProperties();
      //console.log(propertyCount)
      setTotalUserPropertyCount(propertyCount.length)

      //console.log(data)
      const propertyIds = [];

      for (let i = 0; i < data.length; i++) {
        const item = data[i];
        propertyIds.push(item.propertyId);
      }

      propertyIds.forEach(a => { })
      const renters = await market.getPropertyDetails(propertyIds, true);
      ////console.log(renters)
      let idsToRenters = []
      renters.forEach(a => {
        ////console.log(a)
      })

      ////console.log(signer)
      ////console.log(provider)

      let value = ethers.formatUnits(await govt.getRentAccumulatedSender(), 'ether')
      setAmountAccumulated(value)

      //console.log(data)

      const items = await Promise.all(data.filter(i => Number(i.propertyId) !== 0 && (a => Number(a.tokenId !== 0))).map(async i => {
        //console.log(i)
        const tokenUri = await token.tokenURI(i.tokenId)
        


        const meta = await axios.get(tokenUri)


        // const nameTags = tags.data.transactions.edges[0].node.tags[0]

        let nftName = GetPropertyNames(meta, Number(i.propertyId))

        const timestamps = renters.filter(a => a.propertyId == Number(i.propertyId))
        ////console.log(timestamps)

        let price = ethers.formatUnits(i.salePrice.toString(), 'ether')
        let rentPrice = ethers.formatUnits(i.rentPrice.toString(), 'ether')
        let deposit = ethers.formatUnits(i.deposit.toString(), 'ether')
        const renterAddresses = await market.getPropertyRenters(i.propertyId);
        // //console.log(renterAddresses)
        // let test = await marketContract.getTenantsMapping("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
        // //console.log('5 ',test)
        // let test2 = await marketContract.getTenantsMapping("0x70997970C51812dc3A010C7d01b50e0d17dc79C8")
        // //console.log('4 ',test2)
        // let test3 = await marketContract.getTenantsMapping("0x2546BcD3c84621e976D8185a91A922aE77ECEc30")
        // //console.log('3 ',test3)
        // let test4 = await marketContract.getTenantsMapping("0x36D886DfBeE479b04F953b0649988AE3ABAc4C8D")
        // //console.log('8 ',test4)
        // const tokensHex = await marketContract.getTokensEarned()
        // const tokens = ethers.formatUnits(tokensHex.toString(), 'ether')
        let tokenSalePriceFormatted = ethers.formatUnits(i.tokenSalePrice.toString(), 'ether')
        ////console.log(tokenSalePriceFormatted)
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
        let totalIncomeGenerated = ethers.formatUnits(i.totalIncomeGenerated)

        const propertyId = Number(ethers.formatUnits(BigInt(i.propertyId), 0));

        // call getRenterDepositBalance on govt contract
        

        ////console.log(propertyId)

        let item = {
          price,
          propertyId: propertyId,
          tokenId: Number(i.tokenId),
          seller: i.seller,
          owner: i.owner,
          image: tokenUri,
          name: nftName,
          rentPrice: rentPrice,
          roomOneRented: i.roomOneRented,
          roomTwoRented: i.roomTwoRented,
          roomThreeRented: i.roomThreeRented,
          roomFourRented: i.roomFourRented,
          roomsToRent: 0,
          renterAddresses: renterAddresses,
          isForSale: i.isForSale,
          tokenPrice: tokenSalePriceFormatted,
          payments: i.payments,
          isExclusive: i.isExclusive,
          saleHistory: saleHistory,
          dateSoldHistory: i.dateSoldHistory,
          dateSoldHistoryBhb: i.dateSoldHistory,
          tweetOptions: "",
          forSaleChecked: false,
          rentChecked: false,
          totalIncomeGenerated: totalIncomeGenerated,
          ranking: 0,
          deposit: deposit
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
        if (item.roomFourRented === true) {
          item.roomsToRent++
        }
        item.ranking = calculateRankingTotal(item)
        return item
      }))

      setCurrentPosts(items.slice(0, 20))

      setLoadingState('loaded')
      setTxLoadingState1({ ...txloadingState1, [551]: false });
      setTxLoadingState2({ ...txloadingState2, [i]: false });
      setTxLoadingState3({ ...txloadingState3, [i]: false });
      setTxLoadingState4({ ...txloadingState4, [i]: false });
      setTxLoadingState5({ ...txloadingState5, [i]: false });
      setTxLoadingState1B({ ...txloadingState1B, [551]: false });
      setTxLoadingState2B({ ...txloadingState2B, [i]: false });
      setTxLoadingState3B({ ...txloadingState3B, [i]: false });
      setTxLoadingState4B({ ...txloadingState4B, [i]: false });
      setTxLoadingState5B({ ...txloadingState5B, [i]: false });
    } catch (ex) {
      setLoadingState('loaded')
      if (ex.message === 'User Rejected') {
        //console.log(ex.message)
        // Handle user rejection
        ////console.log('Connection request rejected by the user.');
        // Display an error message to the user        
        //setIsConnected(false);
        setTxLoadingState1({ ...txloadingState1, [551]: false });
        setTxLoadingState2({ ...txloadingState2, [i]: false });
        setTxLoadingState3({ ...txloadingState3, [i]: false });
        setTxLoadingState4({ ...txloadingState4, [i]: false });
        setTxLoadingState5({ ...txloadingState5, [i]: false });
        setTxLoadingState1B({ ...txloadingState1B, [551]: false });
        setTxLoadingState2B({ ...txloadingState2B, [i]: false });
        setTxLoadingState3B({ ...txloadingState3B, [i]: false });
        setTxLoadingState4B({ ...txloadingState4B, [i]: false });
        setTxLoadingState5B({ ...txloadingState5B, [i]: false });
        if (retries > 0) {
          return;
        } else {
          //console.log('Retrying connection request...');
          let newRetries = retries - 1;
          setRetries(newRetries);

          loadProperties();
        }
      } else {
        ////console.log(ex)
        //console.log(ex.message)
        //setIsConnected(false)
        setTxLoadingState1({ ...txloadingState1, [551]: false });
        setTxLoadingState2({ ...txloadingState2, [i]: false });
        setTxLoadingState3({ ...txloadingState3, [i]: false });
        setTxLoadingState4({ ...txloadingState4, [i]: false });
        setTxLoadingState1B({ ...txloadingState1B, [551]: false });
        setTxLoadingState2B({ ...txloadingState2B, [i]: false });
        setTxLoadingState3B({ ...txloadingState3B, [i]: false });
        setTxLoadingState4B({ ...txloadingState4B, [i]: false });
        setTxLoadingState5B({ ...txloadingState5B, [i]: false });
        if (retries === 0) {
          return;
        } else {
          //console.log('Retrying connection request...');
          let newRetries = retries - 1;
          setRetries(newRetries);

          loadProperties();
        }
      }
    }
  }

  const SellProperty = async (property, i) => {
    let tokenAmount = document.getElementById('tokenInput' + i).value
    tokenAmount = tokenAmount === "" ? 0 : tokenAmount

    const contract = new Contract(nftmarketaddress, Market.abi, signer);

    try {
      setTxLoadingState2({ ...txloadingState2, [i]: true });
      const listingPrice = await contract.getListingPrice()
      //console.log('Listing price: ', listingPrice.toString())
      const nftContract = new Contract(nftaddress, NFT.abi, signer)
      await nftContract.giveResaleApproval(property.propertyId) //give user explaination of this tranasction      

      const isExclusive = property.isExclusive

      let maticAmount = !isExclusive ? document.getElementById('amountInput' + i).value : document.getElementById('tokenInput' + i).value
      const priceFormatted = ethers.parseUnits(maticAmount, 'ether');

      let gasLimit;
      try {
        gasLimit = await contract.sellProperty.estimateGas(
          nftaddress,
          property.tokenId,
          property.propertyId,
          priceFormatted,
          tokenAmount,
          isExclusive,
          { value: listingPrice.toString() }
        )
      } catch (ex) {
        alert('Transaction failed. (Make sure price is not lower than original price of 150 Matic)')
      }
      

      gasLimit = gasLimit + 300000n;

      const feeData = await provider.getFeeData();
      const basePriorityFee = feeData.maxPriorityFeePerGas || ethers.parseUnits('1.5', 'gwei'); // Fallback to 1.5 gwei if undefined
      const maxPriorityFeePerGas = basePriorityFee + ethers.parseUnits('10', 'gwei'); // Add 2 gwei buffer
      const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('20', 'gwei'); // Add 5 gwei buffer to maxFeePerGas

      const transaction = await contract.sellProperty(
        nftaddress,
        property.tokenId,
        property.propertyId,
        priceFormatted,
        tokenAmount,
        isExclusive,
        { 
          gasLimit: gasLimit,
          maxPriorityFeePerGas: maxPriorityFeePerGas,
          maxFeePerGas: maxFeePerGas,
          value: listingPrice.toString()
        }
      )
      setTxLoadingState2({ ...txloadingState2, [i]: false });
      setTxLoadingState2B({ ...txloadingState2B, [i]: true });
      await transaction.wait()
    } catch (Ex) {
      setTxLoadingState2({ ...txloadingState2, [i]: false });
      setTxLoadingState2B({ ...txloadingState2B, [i]: true });
      //console.log('Transaction failed')
    }
    loadProperties()
  }

  useEffect(() => {
    ////console.log(propertyIdTwitter)
    let tweetOptions
    //if (hasSetText) {
    let text = twitterTextRef.current ? twitterTextRef.current.innerText : ""
    let formattedTweet = text.replace(/(?<!\d)\.(?!\d)/g, '%0A');

    ////console.log(window.location.hostname)
    let url = `http://localhost:3000/property-view/${propertyIdTwitter}%0A`
    let hashtags = 'BlockhouseBay'
    tweetOptions = text + '#BlockhouseBay';
    //}
    setText(formattedTweet)
    ////console.log(tweetOptions)

    setUrl(`http://localhost:3000/property-view/${propertyIdTwitter ? propertyIdTwitter : ''}`)
    setHasSetText(false)
    twitterTextRef.current = document.getElementById("twitterDefault");
  }, [twitterSaleChecked, twitterRentChecked])

  const handleForSaleCheck = (propertyObj, e) => {
    ////console.log(propertyObj)
    setPropertyIdTwitter(propertyObj.propertyId);
    setCurrentPosts((prevList) =>
      prevList.map((property) =>
        property.propertyId === propertyObj.propertyId
          ? { ...property, forSaleChecked: e.target.checked }
          : property
      )
    );
    setTwitterSaleChecked(e.target.checked);
    seTwitterRef(propertyObj);

    ////console.log(propertyObj)

  };

  const handleRentCheck = (propertyObj, e) => {
    setPropertyIdTwitter(propertyObj.propertyId);
    setCurrentPosts((prevList) =>
      prevList.map((property) =>
        property.propertyId === propertyObj.propertyId
          ? { ...property, rentChecked: e.target.checked }
          : property
      )
    );
    let text = propertyObj.rentPrice
    setTwitterRentChecked(e.target.checked)
    seTwitterRef(propertyObj)
    ////console.log(propertyObj)
  };

  const seTwitterRef = (property) => {
    if (twitterSaleChecked && !twitterRentChecked) {
      twitterTextRef.current = document.getElementById("twitterSaleSection");
    } else if (!twitterSaleChecked && twitterRentChecked) {
      twitterTextRef.current = document.getElementById("twitterRentSection");
      ////console.log(twitterTextRef.current)
    } else if (twitterSaleChecked && twitterRentChecked) {
      twitterTextRef.current = document.getElementById("twitterSaleRentSection");
    }
    setHasSetText(true)

    // ////console.log(twitterTextRef.current.innerText)
  }

  // const getOptions = () => {
  //   let tweetOptions = 
  //   {
  //     text: twitterTextRef.current ? twitterTextRef.current.innerText : "ccock",
  //     url: `http://localhost:3000/property-view/${propertyObj.propertyId.toString()}`,
  //     via: "test",
  //     hashtags: '@BlockhouseBay',
  //     size: "large"
  //   };

  //   setText(twitterTextRef.current?.innerText)
  // }



  const logOutTwitter = () => {
    ////console.log(twitterTextRef.current.innerText)
  }

  // const getLogData = async () => {
  //   // const web3Modal = new Web3Modal()
  //   // const connection = await web3Modal.connect()
  //   // const provider = new ethers.providers.Web3Provider(connection)
  //   // const signer = await provider.getSigner()
  //   const marketContract = new ethers.Contract(nftmarketaddress, Market.abi, provider)
  //   const marketAddress = marketContract.address

  //   const iface = new ethers.utils.Interface(Market.abi);

  //   let propertyIds = nfts.map(item => item.propertyId)
  //   ////console.log(propertyIds)
  //   let latestBlockNum = await provider.getBlockNumber() - 5 //change this to 150000 when live
  //   ////console.log(latestBlockNum)
  //   let latestBlock = await provider.getBlock(latestBlockNum)
  //   let latestBlockTimestamp = latestBlock.timestamp
  //   ////console.log(latestBlockTimestamp)

  //   const logs = await provider.getLogs({
  //     fromBlock: latestBlockNum,
  //     toBlock: "latest",
  //     address: marketAddress
  //   })
  //   ////console.log(logs)

  //   const decodedEvents = logs.map(log => iface.parseLog(log));
  //   ////console.log(decodedEvents)

  //   let testArr = new Array()
  //   decodedEvents.map(event => {
  //     let arr = new Array()
  //     arr.push(event["args"]["tenant"])
  //     arr.push(event["args"]["blockTime"])
  //     arr.push(event["args"]["propertyId"])
  //     testArr.push(arr)
  //   })

  //   let filteredEvents = testArr.filter(item => {
  //     let itemNum = item[2].toNumber()
  //     return propertyIds.includes(itemNum)
  //   })

  //   filteredEvents.map((item) => {
  //     let timeSeconds = item[1].toNumber()
  //     let secondsDays = 258000
  //     ////console.log(timeSeconds + secondsDays)
  //     ////console.log(latestBlockTimestamp)

  //     //258000 seconds in 3 days

  //     //add 3 days seconds to rentPaid trans timestamp. If < than latest block timestamp then overdue
  //     if (timeSeconds + secondsDays < latestBlockTimestamp) {
  //       setAddressesOverdue(addressesOverdue => [...addressesOverdue, item[0]])
  //       //setAddressesOverdue("0x2546BcD3c84621e976D8185a91A922aE77ECEc30")
  //     }
  //     ////console.log(addressesOverdue)
  //   })
  //   ////console.log(filteredEvents)
  //   ////console.log(addressesOverdue)


  // }

  const CancelSale = async (property, i) => {
    // const web3Modal = new Web3Modal()
    // const connection = await web3Modal.connect()
    // const provider = new ethers.providers.Web3Provider(connection)
    // const signer = await provider.getSigner()

    const contract = new Contract(nftmarketaddress, Market.abi, signer)
    setTxLoadingState2({ ...txloadingState2, [i]: true });
    try {

      // let gasLimit = await contract.cancelSale.estimateGas(nftaddress, property.tokenId, property.propertyId)
      // gasLimit = gasLimit + 300000n;

      // const feeData = await provider.getFeeData();
      // const basePriorityFee = feeData.maxPriorityFeePerGas || ethers.parseUnits('1.5', 'gwei'); // Fallback to 1.5 gwei if undefined
      // const maxPriorityFeePerGas = basePriorityFee + ethers.parseUnits('10', 'gwei'); // Add 2 gwei buffer
      // const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('20', 'gwei'); // Add 5 gwei buffer to maxFeePerGas


      const transaction = await contract.cancelSale(nftaddress, property.tokenId, property.propertyId, {
        // gasLimit: gasLimit,
        // maxPriorityFeePerGas: maxPriorityFeePerGas,
        // maxFeePerGas: maxFeePerGas
      })
      setTxLoadingState2({ ...txloadingState2, [i]: false });
      setTxLoadingState2({ ...txloadingState2B, [i]: true });

      await transaction.wait()
    } catch (ex) {
      alert(ex.message.substring(0, ex.message.indexOf('(')))
      setTxLoadingState2({ ...txloadingState2, [i]: false });
      setTxLoadingState2B({ ...txloadingState2B, [i]: false });
      //console.log(ex);
    }
    loadProperties()
  }

  const ChangeDeposit = async (property, i) => {
    const contract = new Contract(govtaddress, GovtFunctions.abi, signer)
    let depVal = document.getElementById('depositInput' + i).value
    depVal = parseFloat(depVal).toFixed(4);
    //console.log(depVal)
    let newPrice = ethers.parseUnits(depVal, 'ether')
    
    //console.log(newPrice)
    //console.log(property.propertyId)
    try {      
      let gasLimit = await contract.setDeposit.estimateGas(property.propertyId, newPrice)
      gasLimit = gasLimit + 100000n;

      const feeData = await provider.getFeeData();
      const basePriorityFee = feeData.maxPriorityFeePerGas || ethers.parseUnits('1.5', 'gwei'); // Fallback to 1.5 gwei if undefined
      const maxPriorityFeePerGas = basePriorityFee + ethers.parseUnits('10', 'gwei'); // Add 2 gwei buffer
      const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('20', 'gwei'); // Add 5 gwei buffer to maxFeePerGas

      setTxLoadingState5({ ...txloadingState5, [i]: true });

      const transaction = await contract.setDeposit(property.propertyId, newPrice, {
        gasLimit: gasLimit,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas
      })
      setTxLoadingState5({ ...txloadingState5, [i]: false });
      setTxLoadingState5B({ ...txloadingState5B, [i]: true });
      await transaction.wait();
      loadProperties()
    } catch (ex) {
      alert(ex.message.substring(0, ex.message.indexOf('(')))
      setTxLoadingState5({ ...txloadingState5, [i]: false });
      setTxLoadingState5B({ ...txloadingState5B, [i]: false });
      //console.log(ex)
    }
  }

  const ChangeRent = async (property, i) => {
    const contract = new Contract(govtaddress, GovtFunctions.abi, signer)
    let rentVal = document.getElementById('rentInput' + i).value
    rentVal = parseFloat(rentVal).toFixed(4);
    //console.log()
    let newPrice = ethers.parseUnits(rentVal, 'ether')
    //console.log(newPrice)
    //console.log(property.propertyId)
    try {
      setTxLoadingState4({ ...txloadingState4, [i]: true });

      let gasLimit = await contract.setRentPrice.estimateGas(property.propertyId, newPrice)
      gasLimit = gasLimit + 100000n;

      const feeData = await provider.getFeeData();
      const basePriorityFee = feeData.maxPriorityFeePerGas || ethers.parseUnits('1.5', 'gwei'); // Fallback to 1.5 gwei if undefined
      const maxPriorityFeePerGas = basePriorityFee + ethers.parseUnits('10', 'gwei'); // Add 2 gwei buffer
      const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('20', 'gwei'); // Add 5 gwei buffer to maxFeePerGas

      const transaction = await contract.setRentPrice(property.propertyId, newPrice, {
        gasLimit: gasLimit,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas
      })
      setTxLoadingState4({ ...txloadingState4, [i]: false });
      setTxLoadingState4B({ ...txloadingState4B, [i]: true });
      await transaction.wait()
      loadProperties()
    } catch (ex) {
      //console.log(ex)
      alert(ex.message.substring(0, ex.message.indexOf('(')))
      setTxLoadingState4({ ...txloadingState4, [i]: false });
      setTxLoadingState4B({ ...txloadingState4B, [i]: false });
    }

  }

  // const CollectRent = async (i) => {
  //   try {
  //     // const web3Modal = new Web3Modal()
  //     // const connection = await web3Modal.connect()
  //     // const provider = new ethers.providers.Web3Provider(connection)
  //     // const signer = await provider.getSigner()
  //     const contract = new Contract(govtaddress, GovtFunctions.abi, signer)
  //     setTxLoadingState1({ ...txloadingState1, [551]: true });
  //     const transaction = await contract.collectRent()
  //     setTxLoadingState1({ ...txloadingState1, [551]: false });
  //     setTxLoadingState1B({ ...txloadingState1B, [551]: true });
  //     await transaction.wait()
  //     loadProperties()
  //   } catch (ex) {
  //     setTxLoadingState1({ ...txloadingState1, [551]: false });
  //     setTxLoadingState1B({ ...txloadingState1B, [551]: false });
  //   }
  // }

  const EvictTenant = async (property, i) => {
    // const web3Modal = new Web3Modal()
    // const connection = await web3Modal.connect()
    // const provider = new ethers.providers.Web3Provider(connection)
    // const signer = await provider.getSigner()

    const contract = new ethers.Contract(nftmarketaddress, Market.abi, signer)
    try {
      setTxLoadingState3({ ...txloadingState3, [i]: true });

      let gasLimit = await contract.evictTennant.estimateGas(property.propertyId, tenantToDelete.address)
      gasLimit = gasLimit + 100000n;

      const feeData = await provider.getFeeData();
      const basePriorityFee = feeData.maxPriorityFeePerGas || ethers.parseUnits('1.5', 'gwei'); // Fallback to 1.5 gwei if undefined
      const maxPriorityFeePerGas = basePriorityFee + ethers.parseUnits('10', 'gwei'); // Add 2 gwei buffer
      const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('20', 'gwei'); // Add 5 gwei buffer to maxFeePerGas

      const transaction = await contract.evictTennant(property.propertyId, tenantToDelete.address, {
        gasLimit: gasLimit,
        maxPriorityFeePerGas: maxPriorityFeePerGas,
        maxFeePerGas: maxFeePerGas
      })
      setTxLoadingState3({ ...txloadingState3, [i]: false });
      setTxLoadingState3B({ ...txloadingState3B, [i]: true });
      await transaction.wait()
    } catch (ex) {
      //console.log(ex);
      alert(ex.message.substring(0, ex.message.indexOf('(')))
      setTxLoadingState3({ ...txloadingState3, [i]: false });
      setTxLoadingState3B({ ...txloadingState3B, [i]: false });
    }
    loadProperties()
  }
  const onAcceptTokenChange = (e, i) => {
    setTokenAmount(0);
    document.getElementById(e.target.id).value = null;
    if (e.target.checked) {
      document.getElementById('maticInput' + i).style.visibility = 'visible';
      document.getElementById("sellBtn" + i).disabled = true;
      document.getElementById("sellBtn" + i).classList.remove("bg-matic-blue", "hover:bg-sky-700", "text-white");
      document.getElementById("sellBtn" + i).classList.add("bg-gray-400", "text-gray-600");
    } else {
      document.getElementById('maticInput' + i).style.visibility = 'hidden';
      document.getElementById('tokenInput' + i).value = null;
      if (document.getElementById("amountInput" + i).value.length > 0) {
        document.getElementById("sellBtn" + i).disabled = false;
        document.getElementById("sellBtn" + i).classList.remove("bg-gray-400", "text-gray-600");
        document.getElementById("sellBtn" + i).classList.add("bg-matic-blue", "hover:bg-sky-700", "text-white");
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
    //if (characterNumber >= 0 && characterNumber <= 9) {
      if (e.currentTarget.value && e.currentTarget.value.length) {
        return
      } else if (characterNumber === 0) {
        e.preventDefault()
      }
    // } else {
    //   e.preventDefault()
    // }
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
    if (ethers.formatEther(property.renterAddresses[i]).toString() !== "0.0") {
      // setDisabledRadioCount(disabledRadioCount+1)
      // if (disabledRadioCount == 3) {
      //   setDisabledEvictButton(true)
      // }
      return false
    } else return true;
  }

  const SetEvictButtonColour = (property) => {
    if (ethers.formatEther(property.renterAddresses[0]).toString() === "0.0"
      && ethers.formatEther(property.renterAddresses[1]).toString() === "0.0"
      && ethers.formatEther(property.renterAddresses[2]).toString() === "0.0"
      && ethers.formatEther(property.renterAddresses[3]).toString() === "0.0") {
      return "bg-gray-400 cursor-default text-gray-600"
    } else {
      return "bg-red-400"
    }
  }

  const setEvictButtonStatus = (property) => {
    if (ethers.formatEther(property.renterAddresses[0]).toString() === "0.0"
      && ethers.formatEther(property.renterAddresses[1]).toString() === "0.0"
      && ethers.formatEther(property.renterAddresses[2]).toString() === "0.0"
      && ethers.formatEther(property.renterAddresses[3]).toString() === "0.0") {
      return true
    } else return false
  }

  const setAddresses = (property, e, i) => {
    if (property !== undefined) {
      ////console.log(i)
      return (
        // <div className='text-xs mt-2 text-green-200'>
        <div className='text-[10px] font-mono text-green-400'>
          {ethers.formatEther(property.renterAddresses[0]).toString() !== "0.0" ?
            <>
              <div className='flex items-center justify-between mb-2'>
                <p className={" break-words text-center " + getTenantToDeleteColour(property, 0)}>
                  {property.renterAddresses[0]}
                </p>
                <Blockies
                  seed={property.renterAddresses[0]}
                />
              </div>
            </>
            : <p className='mt-2 mb-[20.6px]'>0x</p>
          }          
          {ethers.formatEther(property.renterAddresses[1]).toString() !== "0.0" ?
            <div className='flex items-center justify-between mb-2'>
              <p className={" break-words text-center " + getTenantToDeleteColour(property, 1)}>
                {property.renterAddresses[1]}
              </p>
              <Blockies
                seed={property.renterAddresses[1]}
              />
            </div>
            :
            <>
              
                <p className='mt-2 mb-[20.6px]'>0x</p>
            </>
          }
          {ethers.formatEther(property.renterAddresses[2]).toString() !== "0.0" ?
            <div className='flex items-center justify-between mb-2'>
              <p className={" break-words " + getTenantToDeleteColour(property, 2)}>
                {property.renterAddresses[2]}
              </p>
              <Blockies
                seed={property.renterAddresses[2]}
              />
            </div>
            : <>
              
                <p className='mt-2 mb-[20.6px]'>0x</p>
            </>
          }
          {ethers.formatEther(property.renterAddresses[3]).toString() !== "0.0" ?
            <div className='flex items-center justify-between'>
              <p className={" break-words " + getTenantToDeleteColour(property, 3)}>
                {property.renterAddresses[3]}
              </p>
              <Blockies
                seed={property.renterAddresses[3]}
              />
            </div>
            : <>
              
                <p className='mt-2 mb-[20.6px]'>0x</p>
            </>
          }
        </div>
      )
    }
  }

  function handleSellButton(e, i, pid) {    
    const sellBtn = document.getElementById(`sellBtn${i}`);
    const tokenInput = document.getElementById(`tokenInput${i}`);
    const amountInput = document.getElementById(`amountInput${i}`);
    const maticCheckbox = document.getElementById(`matic${i}`);

    const isInputInvalid = (input) => {      
      if (input !== null) {
        if (input.value.length === 0 || input.value.length > 10) {
          return true;
        }
      }       
    }

    const disableButton = () => {
        sellBtn.disabled = true;
        sellBtn.classList.remove("bg-matic-blue", "cursor-pointer", "text-white", "hover:bg-sky-700");
        sellBtn.classList.add("bg-gray-400", "cursor-default", "text-gray-600");
    };

    const enableButton = () => {
        sellBtn.disabled = false;
        sellBtn.classList.remove("bg-gray-400", "cursor-default", "text-gray-600");
        sellBtn.classList.add("bg-matic-blue", "cursor-pointer", "text-white", "hover:bg-sky-700");
    };

    if (pid > 500) {
      //console.log(tokenInput)
        if (isInputInvalid(tokenInput) || isInputInvalid(amountInput)) {
            disableButton();
        } else {
            enableButton();
        }
    } else {
        if (!maticCheckbox.checked) {
          //console.log(amountInput.value.length)
            if (e.target.value.length > 0 && e.target.value.length < 10) {
                enableButton();
            } else {
                disableButton(); 
            }
        } else {            
            if (isInputInvalid(tokenInput) || isInputInvalid(amountInput)) {              
                disableButton();
            } else {              
                enableButton();
            }
        }
    }
}



  function setRentButton(e, i) {
    if (document.getElementById("rentInput" + i).value.length == 0) {
      document.getElementById("rentButton" + i).disabled = true
      document.getElementById("rentButton" + i).classList.remove("bg-pink-400", "cursor-pointer", "text-white", "hover:bg-pink-500")
      document.getElementById("rentButton" + i).classList.add("bg-gray-400", "cursor-default", "text-gray-600")
    } else {
      document.getElementById("rentButton" + i).disabled = false
      document.getElementById("rentButton" + i).classList.remove("bg-gray-400", "cursor-default", "text-gray-600")
      document.getElementById("rentButton" + i).classList.add("bg-pink-400", "cursor-pointer", "text-white", "hover:bg-pink-500")
    }
  }

  function setDepositButton(e, i) {
    if (document.getElementById("depositInput" + i).value.length == 0) {
      document.getElementById("depositButton" + i).disabled = true
      document.getElementById("depositButton" + i).classList.remove("bg-green-400", "cursor-pointer", "text-white", "hover:bg-green-500")
      document.getElementById("depositButton" + i).classList.add("bg-gray-400", "cursor-default", "text-gray-600")
    } else {
      document.getElementById("depositButton" + i).disabled = false
      document.getElementById("depositButton" + i).classList.remove("bg-gray-400", "cursor-default", "text-gray-600")
      document.getElementById("depositButton" + i).classList.add("bg-green-400", "cursor-pointer", "text-white", "hover:bg-green-500")
    }
  }

  function SetTenantToDelete1(e, i, property) {
    document.getElementById("evictButton" + i).classList.remove("bg-gray-400", "text-gray-600")
    document.getElementById("evictButton" + i).classList.add("bg-red-400", "test-white", "hover:bg-red-500")
    setTeneantToDeleteProperty(property.propertyId)
    if (e.target.id === "tenant1") {
      setTenantToDelete({ address: property.renterAddresses[0] })
    } else if (e.target.id === "tenant2") {
      setTenantToDelete({ address: property.renterAddresses[1] })
    } else if (e.target.id === "tenant3") {
      setTenantToDelete({ address: property.renterAddresses[2] })
    } else if (e.target.id === "tenant4") {
      setTenantToDelete({ address: property.renterAddresses[3] })
    }

    return setAddresses(property, e, i)
  }

  const handleChange = (panel) => (event, isExpanded) => {
    ////console.log(panel)
    setExpanded(isExpanded ? panel : null);
  };

  const CheckTimestampExpired = (property, tenantAddress) => {
    try {
      // //console.log(property)
      if (property.payments === undefined) {
        //console.log("UNDEFINED");
        return true;
      }

      const allTimestampsZero = property.payments.every(payment => {
        const timestamp = payment[2];

        ////console.log('timestamp ', Number(timestamp))
        if (timestamp == 0 || timestamp === '0x00') {
          return false;
        }
      });

      if (allTimestampsZero) {
        return true;
      }
      // //console.log(tenantAddress)

      // //console.log(property)
      const currentObject = property.payments.filter(a => a.renter === tenantAddress); // Example timestamp from smart contract in seconds
      if (currentObject === undefined) {
        return false;
      }
      if (currentObject.length === 0) {
        return true;
      }

      if (currentObject.timestamp == 0 || currentObject.timestamp === '0x00') {
        return false;
      }
      ////console.log(currentObject)
      const twentyFourHoursInMillis = 600; // 24 hours in milliseconds
      const currentTimeInMillis = Math.floor(Date.now() / 1000);

      if (currentTimeInMillis - (Number(currentObject[0].timestamp)) > twentyFourHoursInMillis) {
        // //console.log("true")
        return true
      } else {
        // //console.log("false")
        return false
      }
    }
    catch (ex) {
      //console.log(ex)

    }
  }

  const getTenantToDeleteColour = (tenant, i) => {
    ////console.log(i)
    if (tenant.renterAddresses[i] === tenantToDelete.address && tenant.propertyId == tenantToDeleteProperty) {
      return "text-red-400"
    } else if (CheckTimestampExpired(tenant, tenant.renterAddresses[i])) {
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
  const calculatePageNumber = (itemId, forSaleItemCount) => {
    const itemsPerPage = 20;

    if (itemId <= forSaleItemCount && itemId >= 1) {
      const pageNumber = Math.ceil(itemId / itemsPerPage);
      return pageNumber;
    } else {
      return -1; // Item ID is out of range or not marked as for sale
    }
  };

  let test = calculatePageNumber(221, 498)
  ////console.log(test)


  const paginate = (pageNumber) => setCurrentPage(pageNumber);


  // if (walletConnectionError) return (
  //   <div className="pt-10 pb-10">
  //     <div className="flex ">
  //       <div className="lg:px-4 lg:ml-20" style={{ maxWidth: "1600px" }}>
  //         <div className="flex pl-6 lg:px-12">
  //           <p className="text-white text-3xl lg:text-5xl font-bold mb-2">Error connecting wallet</p>

  //         </div>          
  //       </div>
  //     </div>
  //   </div>
  // )

  if (loadingState === 'loaded' && !isConnected) return (
    <div className='text-sm text-white flex justify-center mt-6'>
      <p>Your wallet needs to be connected to view your properties. Connect your wallet connection and refresh the page</p>
    </div>
  )

  if (loadingState !== 'loaded') return (
    <div className="pt-10 pb-10">
      <div className="flex">
        <div className="lg:px-4 md:ml-20" style={{ maxWidth: "1600px" }}>
          <div className="flex pl-6 md:px-12">
            <p className="text-white text-3xl lg:text-5xl font-bold mb-2">Loading Properties</p>
            <svg role="status" className="mt-1 lg:mt-3 ml-3 inline w-8 h-8 mr-2 text-red-500 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
          </div>
          <img src="spring.png" className="pl-6 pr-6 h-4/6 lg:h-4/5 md:w-full md:h-full lg:w-8/12 lg:pl-12 brightness-110" />
          <p className='text-white pl-6 lg:pl-12 mt-4 font-extralight text-lg italic pr-6 md:full lg:w-3/5'>
            Manage your tenants and properties here. You can set rent prices, deposit amounts, evict tenants and even sell your properties.
          </p>
        </div>
      </div>
    </div>
  )

  if (loadingState === 'loaded' && !currentPosts.length && isConnected) return (
    <div className="pt-10 pb-10">
      <div className="flex ">
        <div className="lg:px-4 md:ml-20" style={{ maxWidth: "1600px" }}>
          <p className="ml-4 lg:ml-0 text-5xl xl3:text-6xl font-bold mb-10 text-white xl3:mt-4">My Properties</p>          
          <p className='text-white text-base md:text-left md:text-3xl xl3:text-4xl font-semibold pt-2 w-11/12 mt-8 md:mt-24 xl3:mt-32 lg:pt-4 pl-7 lg:pl-12'>Start building your real estate portfolio today! Explore available properties, make a purchase, and come back here to manage your growing assets.</p>
          <p className="text-xs pl-7 mb-6 md:mb-0 lg-pl-0 md:text-lg lg:pl-16 underline italic mt-2   md:mt-6  mr-1 text-blue-300"><Link to="/how-to-play?section=owning" target='new'>Learn more about owning your first property</Link></p>
        </div>
        <div className="image-container hidden lg:block drop-shadow-lg absolute h-5/6 md:h-1/3 md:w-full xl3:w-5/6 lg:pt-60 right-9 lg:right-40 xl3:right-60 xl3:top-20">
          <img src="col.png" className=" rotate-away  shadow-2xl shadow-amber-100" />
          {/* <div className="gradient-overlay2 md:h-5/6"></div> */}
        </div>
      </div>
      <div className="image-container lg:hidden md:ml-24 lg:ml-0 drop-shadow-lg mt-16 mb-16 left-2 col-span-12 absolute h-5/6 md:h-1/3 md:w-2/4 md:pt-10 lg:pt-32 md:right-30">
        <img src="col.png" className="rotate-away2  brightness-110 shadow-2xl shadow-amber-100" />
        {/* <div className="gradient-overlay2 md:h-5/6"></div> */}
      </div>
    </div>
  )

  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-4 sm:px-9 text-white" style={{ maxWidth: "1600px" }}>
          <p className="text-5xl xl3:text-6xl font-bold mb-6 text-white">My Properties</p>
          <div className="flex">
            <p className="text-sm lg:text-xl pl-4 font-bold mr-1 mb-2">Manage Owned Properties</p>
          </div>
          <div className="pt-3">
            <div className="text-sm mb-4 mt-1 lg:flex">
              <div className="flex pr-4 mt-1.5 font-bold text-white mb-4 lg:mb-0">
                <p>MATIC Accumlated from Renters: </p>
                <p className="pl-1 text-matic-blue">{amountAccumulated} MATIC</p>
              </div>
              {amountAccumulated > 0 &&
                <div className="px-2 flex justify-center">
                  {txloadingState1[551] || txloadingState1B[551] ? (
                    <p className='w-full flex justify-center py-1  rounded'>
                      <SpinnerIcon text={(txloadingState1[551] && !txloadingState1B[551]) ? 'Creating Tx' : 'Confirming Tx'} />
                    </p>
                  ) : (
                    <button
                      className="text-pink-400 hover:bg-pink-900 border py-1 border-pink-400 text-base rounded px-2"
                      // onClick={() => CollectRent()}
                      >
                      Collect Rent
                    </button>
                  )}
                </div>
              }
            </div>
          </div>
          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={totalUserPropertyCount}
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

                  <div className="p-4 ">
                    <p
                      className={`text-2xl mb-3 font-semibold text-transparent bg-clip-text ${property.propertyId > 500 ? 'bg-gradient-to-r from-white to-purple-500' : 'bg-gradient-to-r from-white to-green-400'}`}
                    >
                      {property.name}
                    </p>
                    <div style={{ overflow: "hidden" }}>
                      <div className="flex flex-col ">

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
                      </div>
                      <div className="flex flex-col pb-2">
                        <p>Rent Price:</p>
                        <p className="text-xs text-green-400 font-mono">{property.rentPrice} Matic</p>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p>Deposit Required</p>
                        <p className="text-xs text-green-400 font-mono">{property.deposit} Matic</p>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p>Total Income Generated:</p>
                        <p className="text-xs text-green-400 font-mono">{property.totalIncomeGenerated} Matic</p>
                      </div>
                      <div className="flex flex-col mb-2">
                        <p>Rooms Rented:</p>
                        <p className="lg:pl-0 text-xs text-green-400 font-mono">{property.roomsToRent}/4</p>
                      </div>
                      <div className='mb-2'>
                        Tenants:
                        {setInitalAddresses(property)}
                      </div>

                      <SaleHistory property={property} />

                      <div className={`flex justify-between ${property.isForSale ? 'mb-0 mt-2' : 'mt-2'}`}>
                        <div>
                          <p>My Listing Price</p>
                          {property.isForSale ? (
                            <>
                              <p className='text-xs text-blue-400 font-mono mb-4'>{property.price.substring(0, property.price.length)} Matic | {property.tokenPrice.substring(0, property.tokenPrice.length)} BHB</p>

                            </>
                          ) : (
                            <div>
                              <p className={'text-xs text-green-400 font-mono'}>Not currently for sale</p>
                            </div>
                          )
                          }
                        </div>
                        {property.isForSale &&
                          <div className='flex justify-end'>
                            <img className={`h-16 w-20 mt-4 m-2 mb-[3px] ${property.propertyId > 500 ? 'hue-rotate-90' : ''}`} src="./for-sale.png" alt="for sale" />
                          </div>
                        }
                      </div>
                    </div>
                  </div>

                  <div className="p-4 pb-2 pt-2 bg-black">
                    {/*  */}
                    <div className="mb-1 grid-rows-3 divide-y divide-white">
                      <div className={`flex items-center  justify-between pb-2`}>
                        <div className={`${classes.padding} mr-6`}>
                          <div className="flex text-white">
                            <input
                              type="checkbox"
                              onChange={(e) => handleForSaleCheck(property, e,)}
                              id="sellingRadio"
                              name="twitter"
                              disabled={property.isForSale ? false : true}
                              className={`mr-2 flex-shrink-0 h-3 w-3 border border-blue-300 bg-white checked:bg-blue-500 checked:border-blue-500 focus:outline-none transition duration-200 align-center bg-no-repeat bg-center bg-contain float-left cursor-pointer ${property.isForSale === false ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <label htmlFor="sellingRadio">
                              Selling
                            </label>
                          </div>
                          <div className="flex ml-3">
                            <input
                              type="checkbox"
                              onChange={(e) => handleRentCheck(property, e)}
                              id="vacantRoomsRadio"
                              name="twitter"
                              disabled={property.roomsToRent > 3 ? true : false}
                              className={`mr-2 flex-shrink-0 h-3 w-3 border border-blue-300 bg-white checked:bg-blue-500 checked:border-blue-500 focus:outline-none transition duration-200 align-center bg-no-repeat bg-center bg-contain float-left cursor-pointer ${property.roomsToRent > 3 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            />
                            <label htmlFor="vacantRoomsRadio">
                              Vacant Rooms
                            </label>
                            <div className="relative flex flex-col items-center group ml-2">
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
                                <span className="relative flex w-48 z-10 p-2 text-xs leading-none text-white whitespace-no-wrap border border-1 border-white bg-black shadow-lg">
                                  Select info to add to your X post!
                                </span>
                                <div className="w-3 h-3 mt-2 rotate-45 bg-white"></div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className={'mt-0.5 flex'} >
                          {/* <div className="btn-o w-[73px] mb-12" ><div  className="tweetBtn" id="b"><i></i><span className="label" id="l">Tweet</span></div></div> */}
                          {/* <Share url={url} options={text} disabled={true} /> */}
                          <a className="twitter-share-button"
                            href={`https://x.com/intent/tweet?text=${text}`}
                            data-size="large"
                            target='new'
                          >
                            <div className='border border-1 rounded p-1 px-2 flex'>
                              <p>Post</p>
                              <img src='logo-white.png' className='w-6 h-6 ml-4 cursor-pointer' />
                            </div>
                          </a>
                        </div>
                      </div>


                      <div className={`text-sm text-twitter-blue hidden pb-1 ${(twitterSaleChecked || twitterRentChecked) ? "border-t-2 border-b-2 border-white" : "border-none"}`}>
                        {(twitterSaleChecked || twitterRentChecked) &&
                          <div className='flex justify-between border-none text-white my-1'>
                            <p className='font-semibold'>Twitter Post Template</p>

                          </div>
                        }
                        {(property.forSaleChecked && !property.rentChecked) && (
                          <div id="twitterSaleSection" ref={twitterTextRef}>
                            <div id={`${property.propertyId}twitterSale`}>
                              <p>{`Check out my Blockhouse Bay Property - ${property.name}.`}</p>
                              {property.propertyId < 501 ? (
                                <p>{` ${property.price} Matic`} {property.tokenPrice != 0 && <span>/ {property.tokenPrice} BHB.</span>}</p>
                              ) : (
                                <p>{` ${property.tokenPrice} BHB.`}</p>
                              )}
                              <p>{`https://${window.location.hostname}/property-view/${property.propertyId}`}</p>
                            </div>
                          </div>
                        )}
                        {(property.rentChecked && !property.forSaleChecked) && (
                          <div id="twitterRentSection" ref={twitterTextRef}>
                            <div id={`${property.propertyId}twitterRent`}>
                              <p>{`Check out my Blockhouse Bay Property - ${property.name}. `}</p>
                              {property.roomsToRent != 4 &&
                                <p>
                                  {`${4 - property.roomsToRent} rooms vacant - ${property.rentPrice} Matic. `}
                                </p>
                              }
                            </div>
                            <p>{`https://${window.location.hostname}/property-view/${property.propertyId}`}</p>
                          </div>
                        )}
                        {(property.rentChecked && property.forSaleChecked) && (
                          <div id="twitterSaleRentSection" ref={twitterTextRef}>
                            <p>{`Check out my Blockhouse Bay Property - ${property.name}.`}</p>
                            {property.propertyId < 501 ? (
                              <p>{`Sale: ${property.price} Matic`} {property.tokenPrice != 0 && <span> / {property.tokenPrice} BHB - </span>}</p>
                            ) : (
                              <p>{` ${property.tokenPrice} BHB. `}</p>
                            )}
                            {property.roomsToRent != 4 &&
                              <p>
                                {`${4 - property.roomsToRent} rooms vacant - ${property.rentPrice} Matic. `}
                              </p>
                            }
                            <p>{`https://${window.location.hostname}/property-view/${property.propertyId}`}</p>
                          </div>
                        )}

                        <div id="twitterDefault" ref={twitterTextRef}>
                          <p>{`Check out my Blockhouse Bay Property - ${property.name}.`}</p>
                          <p>{`https://${window.location.hostname}/property-view/${property.propertyId}`}</p>
                        </div>
                      </div>

                      {/* <div className='pl-4'>
                        <Accordion expanded={expanded === true} onChange={handleChange(!expanded)}>
                          <AccordionSummary
                            expandIcon={<ExpandMoreIcon style={{ color: iconColor, padding: 0, margin: 0 }} />}
                            className={`${classes.summary} ${expanded === true ? classes.summaryExpanded : 'p-0'}`}
                          >
                          </AccordionSummary>
                          <AccordionDetails className={classes.details}>
                            <div>
                              <p>Check out my Blockhouse Bay property!</p>
                              <p>Sale</p>
                              <p></p>
                            </div>
                          </AccordionDetails>
                        </Accordion>

                      </div> */}
                      {property.isForSale ?
                        <div className="flex flex-col flex-wrap justify-between">
                          <div className='flex justify-between'>
                            <div>
                              <div className="flex flex-wrap justify-start gap-4 mt-4 md:gap-0 mb-4">
                                <div className="text-sm font-bold mb-2 md:mb-0 flex">
                                  <div className="pr-1">Cancel Sale</div>
                                  <div className="mb-1 relative">
                                    <div className="relative flex flex-col items-center group">
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
                                      <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
                                        <span className="relative flex z-10 p-2 text-xs leading-none text-black whitespace-no-wrap bg-white shadow-lg">
                                          Learn more
                                        </span>
                                        <div className="w-3 h-3 mt-2 rotate-45 bg-white"></div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="md:justify-self-start">
                            {txloadingState2[i] || txloadingState2B[i] ? (
                              <p className='w-full bg-yellow-600 text-xs italic px-3 py-1 rounded'>
                                <SpinnerIcon text={(txloadingState2[i] && !txloadingState2B[i]) ? 'Creating Tx' : 'Confirming Tx'} />
                              </p>
                            ) : (
                              <button onClick={() => CancelSale(property, i)} className="w-full bg-yellow-600 text-white font-bold py-2 rounded">
                                Cancel
                              </button>
                            )}
                          </div>
                        </div>
                        : <div className="flex flex-col flex-wrap justify-between">
                          <div className="flex flex-wrap justify-between gap-4 md:gap-0">
                            <div className="text-sm font-bold mb-2 md:mb-0 flex justify-start pt-4">
                              <div className="pr-1">Sell</div>
                              <div className="mb-1 relative">
                                <div className="relative flex flex-col items-center group">
                                  <Link to="/how-to-play?section=owning" target='new'>
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
                                  <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
                                    <span className="relative z-10 p-2 text-xs leading-none text-black whitespace-no-wrap bg-white shadow-lg">
                                      Learn More
                                    </span>
                                    <div className="w-3 h-3 mt-2 rotate-45 bg-white"></div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {property.propertyId < 501 &&
                              <div className='pl-4 flex mt-4'>
                                <input
                                  className="flex-shrink-0 h-3 w-3 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                                  type="checkbox"
                                  name="flexRadioDefault"
                                  id={"matic" + i}
                                  onChange={(e) => onAcceptTokenChange(e, i)}
                                  value="./matic-icon.png"
                                />

                                <div className='mb-2'>
                                  <label
                                    className=" form-check-label inline-block text-sm text-white align-top"
                                    htmlFor={"matic" + i}
                                  >
                                    Accept BHB?
                                  </label>
                                </div>

                              </div>}
                          </div>

                          <div className='flex mb-4 items-center'>
                            {property.propertyId < 501 &&
                              <div className='flex items-center'>
                                <input
                                  className="w-4/6 h-6 bg-black shadow appearance-none border rounded py-2 px-1 text-white leading-tight focus:outline-none focus:shadow-outline "
                                  type="number"
                                  min="1"
                                  step="1"
                                  maxLength={19}
                                  onBlur={handleBlur}
                                  onKeyDown={handleKeyPress}
                                  onChange={(e) => handleSellButton(e, i)}
                                  id={"amountInput" + i}
                                />
                                <img className="h-[25px] w-[27px] ml-2" src="./polygonsmall.png" />
                              </div>}

                            <div className={`items-center ${property.propertyId < 501 ? 'flex invisible' : 'flex mt-4'}`} id={'maticInput' + i}>
                              <input
                                className="w-4/6 h-6 bg-black shadow appearance-none border rounded py-2 px-0 text-white leading-tight focus:outline-none focus:shadow-outline "
                                type="number"
                                min="1"
                                step="1"
                                onBlur={handleBlur}
                                onKeyDown={handleKeyPress}
                                onChange={(e) => handleSellButton(e, i, property.propertyId)}
                                id={"tokenInput" + i}
                              />
                              <div>                                                                
                                <img
                                  className={`brightness-150 h-8 w-11 xl3:h-9 xl3:w-12 pl-2`}
                                  src="./tokenfrontsmall.png"
                                  alt=""
                                ></img>
                              </div>
                            </div>

                          </div>

                          <div className="md:justify-self-start">
                            <div className=" flex justify-center">
                              {txloadingState2[i] || txloadingState2B[i] ? (
                                <p className='w-full bg-matic-blue text-xs italic px-3 py-1 rounded'>
                                  <SpinnerIcon text={(txloadingState2[i] && !txloadingState2B[i]) ? 'Creating Tx' : 'Confirming Tx'} />
                                </p>
                              ) : (
                                <button
                                  onClick={() => SellProperty(property, i)} id={"sellBtn" + i}
                                  name='sellBtn'
                                  className="w-full bg-gray-400 cursor-default text-gray-600 font-bold py-2 rounded"
                                >
                                  Sell
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      }
                      <div className="flex flex-col mt-4">
                        <div className="flex mt-3 justify-between">
                          <div className="text-sm font-bold mb-4 mt-1 flex">
                            <p className="pr-1">Evict tenant</p>
                            <div className="mb-1 relative">
                              <div className="relative flex flex-col items-center group">
                                <Link to="/how-to-play?section=owning" target='new'>
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
                              onChange={(e) => SetTenantToDelete1(e, i, property)}
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
                              onChange={(e) => SetTenantToDelete1(e, i, property)}
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
                              onChange={(e) => SetTenantToDelete1(e, i, property)}
                              disabled={SetTenantRadioStatus(property, 2)}
                            />
                            <label
                              className="form-check-label inline-block mr-6 text-sm text-white"
                              htmlFor="flexRadioDefault1"
                            >
                              3
                            </label>

                            <input
                              className="rounded-full h-3 w-3 border border-gray-300 bg-white checked:bg-blue-600 checked:border-blue-600 focus:outline-none transition duration-200 mt-1 align-top bg-no-repeat bg-center bg-contain float-left mr-2 cursor-pointer"
                              type="radio"
                              name="flexRadioDefault"
                              id="tenant4"
                              onChange={(e) => SetTenantToDelete1(e, i, property)}
                              disabled={SetTenantRadioStatus(property, 3)}
                            />
                            <label
                              className="form-check-label inline-block mr-1 text-sm text-white"
                              htmlFor="flexRadioDefault1"
                            >
                              4
                            </label>
                          </div>
                        </div>
                        {txloadingState3[i] || txloadingState3B[i] ? (
                          <p className='w-full flex justify-center bg-red-400 text-xs italic px-3 py-1 mb-4 rounded'>
                            <SpinnerIcon text={(txloadingState3[i] && !txloadingState3B[i]) ? 'Creating Tx' : 'Confirming Tx'} />
                          </p>
                        ) : (
                          <button
                            onClick={() => EvictTenant(property, i)}
                            className={"w-full text-gray-600 bg-gray-400 font-bold py-2 mb-4 rounded "}
                            disabled={setEvictButtonStatus(property)}
                            id={"evictButton" + i}>
                            Evict
                          </button>

                        )}

                      </div>
                      <div className="pt-3">
                        <div className="text-sm font-bold mb-4 mt-1 flex items-center justify-between">
                          <div className='flex'>
                            <p className="pr-1">Change Rent Price</p>
                            <div className="mb-1 relative">
                              <div className="relative flex flex-col items-center group">
                                <Link to="/how-to-play?section=owning" target='new'>
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
                                <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
                                  <span className="relative z-10 p-2 text-xs leading-none text-black whitespace-no-wrap bg-white shadow-lg">
                                    Learn more
                                  </span>
                                  <div className="w-3 h-3 -mt-2 rotate-45 bg-white"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className='flex items-center'>
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
                            <img className="h-[25px] w-[27px] ml-2" src="./polygonsmall.png" />
                          </div>
                        </div>
                        {txloadingState4[i] || txloadingState4B[i] ? (
                          <p className='w-full bg-pink-400 text-xs italic mb-4 px-1 py-1 rounded'>
                            <SpinnerIcon text={(txloadingState4[i] && !txloadingState4B[i]) ? 'Creating Tx' : 'Confirming Tx'} />
                          </p>
                        ) : (
                          <button
                            className="w-full bg-gray-400 text-gray-600 cursor-default mb-4 font-bold py-2 rounded"
                            onClick={() => ChangeRent(property, i)}

                            id={"rentButton" + i}>
                            Change Rent
                          </button>
                        )}
                      </div>

                      <div className="pt-3">
                        <div className="text-sm font-bold mb-4 mt-1 flex items-center justify-between">
                          <div className='flex'>
                            <p className="pr-1">Change Required Deposit</p>
                            <div className="mb-1 relative">
                              <div className="relative flex flex-col items-center group">
                                <Link to="/how-to-play?section=owning" target='new'>
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
                                <div className="absolute bottom-0 flex-col items-center hidden mb-6 group-hover:flex">
                                  <span className="relative z-10 p-2 text-xs leading-none text-black whitespace-no-wrap bg-white shadow-lg">
                                    Learn more
                                  </span>
                                  <div className="w-3 h-3 -mt-2 rotate-45 bg-white"></div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className='flex items-center'>
                            <input
                              className="w-20 xl:w-24 h-6 bg-black shadow appearance-none border rounded py-2 text-white leading-tight focus:outline-none focus:shadow-outline "
                              type="number"
                              min="1"
                              step="1"
                              onBlur={handleBlur}
                              onKeyDown={handleKeyPress}
                              onChange={(e) => setDepositButton(e, i)}
                              id={"depositInput" + i}
                            />
                            <img className="h-[25px] w-[27px] ml-2" src="./polygonsmall.png" />
                          </div>
                        </div>
                        {txloadingState5[i] || txloadingState5B[i] ? (
                          <p className='w-full bg-green-500 text-xs italic px-1 py-1 rounded'>
                            <SpinnerIcon text={(txloadingState5[i] && !txloadingState5B[i]) ? 'Creating Tx' : 'Confirming Tx'} />
                          </p>
                        ) : (
                          <button
                            className="w-full bg-gray-400 text-gray-600 cursor-default font-bold py-2 rounded"
                            onClick={() => ChangeDeposit(property, i)}
                            id={"depositButton" + i}>
                            Change Deposit
                          </button>
                        )}
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
