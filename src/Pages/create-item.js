import { React, useEffect, useState } from 'react';
import { useModalContext } from '../App'

// import Web3Modal from 'web3modal'
// import { Web3Modal } from '@web3modal/react'
import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { BrowserProvider, Contract, formatUnits } from 'ethers'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import GovtFunctions from '../artifacts/contracts/GovtFunctions.sol/GovtFunctions.json'
import PropertyToken from '../artifacts/contracts/PropertyToken.sol/PropertyToken.json'

import WebBundlr from '@bundlr-network/client';
import { useRef } from "react";
import BigNumber from 'bignumber.js'

import data from '../final-manifest.json';
import dataEx from '../exc-manifest.json';

import {
  govtaddress,
  nftaddress, nftmarketaddress, propertytokenaddress
} from '../config'

/* global BigInt */

const ethers = require("ethers")

const CreateItem = () => {
  const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })

  const [bundlrInstance, setBundlrInstance] = useState()
  const [balance, setBalance] = useState()
  const bundlrRef = useRef()

  const [files, setFiles] = useState([])
  const [transactions, setTransactions] = useState([])
  const [image, setImage] = useState()
  const [uris, setUris] = useState()
  const [amount, setAmount] = useState()
  const { modalEvent, provider, signer } = useModalContext();

  const [totalDepositBal, setTotalDepositBal] = useState()
  const [govtBal, setGovtBal] = useState()
  const [amountToWithdrawBal, setAmountToWithdrawBal] = useState()
  const [contractBal, setContractBal] = useState()
  const [connectedWalletAddress, setConnectedWalletAddress] = useState()

  const [listingPrice, setListingPrice] = useState();
  const [minDepositPrice, setMinDepositPrice] = useState();
  const [tokenIds, setTokenIds] = useState([]);
  const [exUris, setExUris] = useState();

  // const filesTest = [
  //   { name: "property1.jpeg", path: "/Users/ryanjennings/Desktop/final/" },   
  //   { name: "property2.jpeg", path: "/Users/ryanjennings/Desktop/untitled folder 4/property2.jpeg" },   
  // ];

  // let names =  ["105 Laurelwood Drive", "41 Riverdale Road"];  

  useEffect(() => {       
    if (signer)
      setConnectedWalletAddress(signer.address)
    }
  , [signer])
    
  const initialise = async () => {
    await window.ethereum.enable()
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider._ready()

    const bundlr = new WebBundlr("https://node1.bundlr.network", "matic", provider)
    await bundlr.ready()
    setBundlrInstance(bundlr)
    bundlrRef.current = bundlr
    fetchBalance()
  }

  const fetchBalance = async () => {
    const bal = await bundlrRef.current.getLoadedBalance()
    console.log('bal ', ethers.formatEther(bal.toString()))
    setBalance(ethers.formatEther(bal.toString()))
  }

  const { address, chainId, isConnected } = useWeb3ModalAccount()
  const { walletProvider } = useWeb3ModalProvider()

  // function onFileChange(e) {
  //   const file = e.target.files[0]
  //   if (file) {
  //     const image = URL.createObjectURL(file)
  //     setImage(image)
  //     let reader = new FileReader()
  //     reader.onload = function () {
  //       if (reader.result) {
  //         setFiles(Buffer.from(reader.result))
  //       }
  //     }
  //     reader.readAsArrayBuffer(file)
  //   }
  // }

// const directoryPath = "/Users/ryanjennings/Desktop/final/";
// const filesTest = [];

// fetch(directoryPath)
//   .then(response => response.text())
//   .then(data => {
//     const parser = new DOMParser();
//     const htmlDoc = parser.parseFromString(data, 'text/html');    
//     for (let i = 0; i < names.length; i++) {      
//       const filePath = directoryPath + names[i] + ".jpeg";
//       console.log('parh ' +filePath)
//       const fileObj = { name: names[i], path: filePath };
//       filesTest.push(fileObj);
//     }
//     console.log(filesTest);
//   })
//   .catch(error => console.error(error));

  // const populateFilesList = () => {
  //   filesTest.forEach(file => {
  //     setFiles([...files, file])
  //   })
  // }

  // const getFileNames = (i) => {
  //   return filesTest[i]["name"]
  // }



  const handleFileChange = (event) => {
    setFiles(event.target.files);
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(file)
      const formData = new FormData();
      formData.append("file", file);

      const tags = [
        { name: "Application", value: file["name"] },
        { name: "Content-Type", value: "image/png" }    
      ];      

      const transaction = bundlrInstance.createTransaction([file], { tags });

      setTransactions(transaction => [...transactions, transaction])

      // fetch("/upload", {
      //   method: "POST",
      //   body: formData,
      // }
      //   .then((response) => response.json())
      //   .then((data) => console.log(data))
      //   .catch((error) => console.error(error));
    }

    // const trans = files.map((file, i) => {
    //   const tags = [
    //     { name: "Application", value: files["name"] },
    //     { name: "Content-Type", value: file.type }    
    //   ];
    //   return bundlrInstance.createTransaction([file], { tags });
    // });
  };


  const getBhbForMarket = async () => {
    // const provider = new ethers.JsonRpcProvider("http://localhost:8545");  

    // const propertyTokenContract = new ethers.Contract('0xCafac3dD18aC6c6e92c921884f9E4176737C052c', PropertyToken.abi, signer);
    const propertyTokenContract = new Contract(propertytokenaddress, PropertyToken.abi, signer)
    // Query the balance
    const balance = await propertyTokenContract.balanceOf(nftmarketaddress);
  
    console.log(`Balance of :`, ethers.formatUnits(balance, 18));
  };
  

  async function uploadFile() {   
    // transactions.forEach(t => {
    //   console.log(t.name + " " + t.path);
    // })
    // const tags = [{name: "Application", value: formInput.name}, { name: "Content-Type", value: "image/png" }]
    // let tx = await bundlrInstance.createTransaction(files, { tags })
    // await tx.sign();
    // await tx.upload();   
    // console.log('tx: ', tx);

    const batch = await bundlrInstance.createBatch(transactions);
    await batch.sign();
  
    const response = await batch.upload();

    const uris = response.map((id) => `http://arweave.net/${id}`);
    console.log('uris: ', uris);  
    //// setUri(`http://arweave.net/${tx.data.id}`)
    setUris(uris)
  }

  async function fundWallet() {
    if (!amount) return
    const amountParsed = parseInput(amount)
    let response
    try {
      response = await bundlrInstance.fund(amountParsed)
    } catch (ex) {
      console.log(ex)
    }
    
    console.log('Wallet funded: ', response)
    fetchBalance()
  }

  function parseInput(input) {
    const conv = new BigNumber(input).multipliedBy(bundlrInstance.currencyConfig.base[1])
    if (conv.isLessThan(1)) {
      console.log('error: value too small')
      return
    } else {
      return conv
    }
  }

  //create getters for the below

//   function checkTotalDepositBalance() public view  onlyGovt returns (uint256) {
//     return totalDepositBal;
// }

// function checkGovtBalance() public view onlyGovt returns (uint256) {        
//     uint256 bal = address(this).balance - totalDepositBal;
//     uint256 marketBal = i_propertyMarketAddress.balance;
//     return bal + marketBal;
// }

// function amountToWithdraw() public view onlyGovt returns (uint256) {
//     return address(this).balance - totalDepositBal;
// }

// function getContractBal() public view onlyGovt returns (uint256) {
//     return address(this).balance;
// }

  const checkTotalDepositBalance = async () => {
    const contract = new Contract(govtaddress, GovtFunctions.abi, signer)
    const totalDepositBal = await contract.checkTotalDepositBalance()
    console.log('totalDepositBal: ', totalDepositBal)
    setTotalDepositBal(totalDepositBal)
  }

  const checkGovtBalance = async () => {
    const contract = new Contract(govtaddress, GovtFunctions.abi, signer)
    const govtBal = await contract.checkGovtBalance()
    console.log('govtBal: ', govtBal)
    setGovtBal(govtBal)
  }

  const amountToWithdraw = async () => {
    const contract = new Contract(govtaddress, GovtFunctions.abi, signer)
    const amount = await contract.amountToWithdraw()
    console.log('amount: ', amount)
    setAmountToWithdrawBal(amount)
  }

  const getContractBal = async () => {
    const contract = new Contract(govtaddress, GovtFunctions.abi, signer)
    const bal = await contract.getContractBal()
    console.log('bal: ', bal)
    setContractBal(bal)
  }

  const getTokenBalanceMaxSupply = async () => {
    const contract = new Contract(govtaddress, GovtFunctions.abi, signer)
    const maxSupply = await contract.getTokenBalanceMaxSupply()
    console.log('maxSupply: ', maxSupply)
  }

  const getPropertyMarketBalance = async () => {
    const contract = new Contract(govtaddress, GovtFunctions.abi, signer)
    const balance = await contract.getMarketBal()
    console.log('property market balance: ', balance)
  }

  const handleListingPriceChange = async () => {
    console.log('listingPrice: ', listingPrice)
    const listingPriceParsed = ethers.parseUnits(listingPrice)
    console.log('listingPriceParsed: ', listingPriceParsed)
    const contract = new Contract(nftmarketaddress, PropertyMarket.abi, signer)
    try {
    const transaction = await contract.setListingPrice(listingPrice.toString())
    await transaction.wait()
    } catch (error) {
      console.error('Error setting listing price:', error)
    }
  }

  const handleMinDepositPriceChange = async () => {
    const contract = new Contract(govtaddress, GovtFunctions.abi, signer)
    try {
      const transaction = await contract.setDepositMin(minDepositPrice)
      await transaction.wait()
    } catch (error) {
      console.error('Error setting min deposit price:', error)
    } 
  }


  const createSale = async () => {   

    console.log(formInput)
    const urisn = Object.keys(data.paths).map(uri => "https://arweave.net/" + data.paths[uri].id);    
    // const web3Modal = new Web3Modal()
    // const connection = await web3Modal.connect()
    console.log(urisn)

    let contract = new Contract(nftaddress, NFT.abi, signer)

    const batchSize = 25;
    const numBatches = Math.ceil(urisn.length / batchSize);
    const tokenIds = [];

    for (let i = 0; i < numBatches && i * batchSize < urisn.length; i++) {
      const batch = urisn.slice(i * batchSize, (i + 1) * batchSize);
      // Estimate the gas required for the transaction
      // const gasLimit = await contract.createTokens.estimateGas(batch);    
      // console.log('Estimated Gas Limit:', gasLimit.toString());      
      // const feeData = await provider.getFeeData();      
      // const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas + ethers.parseUnits('2', 'gwei'); // Add a 2 gwei buffer
      // const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('2', 'gwei'); // Ensure maxFeePerGas is greater

      const transaction = await contract.createTokens(batch ,{
        
        // maxPriorityFeePerGas: maxPriorityFeePerGas,
        // maxFeePerGas: maxFeePerGas
      });

      console.log('does get past create tx')

      const receipt = await transaction.wait();
      console.log(receipt.logs)
      console.log(receipt.logs[1].fragment.name)
      for (let j = 0; j < receipt.logs.length; j++) {
        if (receipt.logs[j].fragment?.name === "Transfer") {
          const tokenId = Number(receipt.logs[j].args[2]);
          tokenIds.push(tokenId); 
        }
      }
    }
    console.log('does get past create tokens?')
    const params = {
      gasLimit: 30000000
    }
 
    contract = new Contract(nftmarketaddress, PropertyMarket.abi, signer)
      
    const numOfBatches = 25;
    for (let i = 0; i < numOfBatches && i * batchSize < tokenIds.length; i++) {
      const idsBatch = tokenIds.slice(i * batchSize, (i + 1) * batchSize);

      // let gasLimit = await contract.createPropertyListing.estimateGas(nftaddress, idsBatch);
      // gasLimit = gasLimit + 100000n;

      // // Fetch the current gas fee data
      // const feeData = await provider.getFeeData();
      // console.log("Current Fee Data:", feeData);

      // const basePriorityFee = feeData.maxPriorityFeePerGas || ethers.parseUnits('1.5', 'gwei'); // Fallback to 1.5 gwei if undefined
      // const maxPriorityFeePerGas = basePriorityFee + ethers.parseUnits('10', 'gwei'); // Add 2 gwei buffer
      // const maxFeePerGas = maxPriorityFeePerGas + ethers.parseUnits('20', 'gwei'); // Add 5 gwei buffer to maxFeePerGas


      // add gas limits here as well
      let transaction2 = await contract.createPropertyListing(idsBatch, {

      })
      await transaction2.wait()
    }    
  }

  const createSaleEx = async () => {   
    console.log(formInput)
    const urisn = Object.keys(dataEx.paths).map(uri => "https://arweave.net/" + dataEx.paths[uri].id);

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer) 

    console.log(urisn)

    const tokenIds = [];
      const transaction = await contract.createExclusiveTokens(urisn, {

      });
      const receipt = await transaction.wait(); 
      for (let j = 0; j < receipt.logs.length; j++) {
        if (receipt.logs[j].fragment?.name === "Transfer") {
          const tokenId = Number(receipt.logs[j].args[2]);
          tokenIds.push(tokenId);
        }
      }

      setTokenIds(tokenIds)
   
    console.log(tokenIds)
    const params = {
      gasLimit: 30000000
    }      
  }


  const createExclusiveProperties = async () => {
    const urisn = Object.keys(dataEx.paths).map(uri => "https://arweave.net/" + dataEx.paths[uri].id);
    let contract2 = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
    
    // let listingPrice = await contract2.getListingPrice()     
    // listingPrice = listingPrice.toString()

    const batchSize = 10;
    const numOfBatches = Math.ceil(urisn.length / batchSize);  
    
    const newTokenIdsTemp = [];
    for (let i = 501; i < 551; i++) {
      newTokenIdsTemp.push(i);
    }

    for (let i = 0; i < numOfBatches && i * batchSize < newTokenIdsTemp.length; i++) {
      const batch = newTokenIdsTemp.slice(i * batchSize, (i + 1) * batchSize);
        
      let transaction2 = await contract2.createPropertyListing(        
        batch
      );
      await transaction2.wait();  
    }    
  }

  const giftProperties = async () => {
    
    console.log(formInput)
    console.log(formInput.address)
    const contract = new Contract(nftmarketaddress, PropertyMarket.abi, signer)
    let pid = BigInt(Number(formInput.pid))
    console.log(pid)
    console.log(BigInt(15))
    const transaction = await contract.giftProperties(pid, formInput.address);
    await transaction.wait();
  }

  const govtWithdraw = async () => {
    const contract = new Contract(govtaddress, GovtFunctions.abi, signer);
    const transaction = await contract.withdrawRentTax();
    await transaction.wait();
  }  

  if (connectedWalletAddress !== '0x8f1890929D22251399B5bbD99a457C1546d1ce5D') {
    return (<div></div>)
  }

  return (
    <>
      {balance && <p className='text-white'>{balance}</p>}
      {
        !balance && <button className='text-white' onClick={initialise}>Initialize</button>
      }
      {
        balance && (
          <div >
            <h3 className='text-white'>Balance: {balance}</h3>
            <div style={{ padding: '20px 0px' }}>
              <input onChange={e => setAmount(e.target.value)} />
              <button className='text-white' onClick={fundWallet}>Fund Wallet</button>
              <button onClick={fetchBalance}>balance</button>
            </div>
            
            {/* <input
              type="file"
              onChange={onFileChange}
            /> */}
            <button className='text-white' onClick={uploadFile}>Upload File</button>
            {
              image && <img src={image} style={{ width: '200px' }} />
            }

            <form onSubmit={handleFormSubmit}>
              <input type="file" name="files[]" multiple onChange={handleFileChange} />
              <button type="submit">Upload</button>
            </form>
          
            {
              uris && <a href={uris}>{uris}</a>
            }
          </div>
        )
      }
      <div className="flex justify-center">
            <div className="w-1/2 flex flex-col pb-12">
            <button onClick={giftProperties} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Create Gift
                </button>
                <input
                    placeholder="address"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, address: e.target.value })}
                />
                {/* <textarea
                    placeholder="Asset Description"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                /> */}
                <input
                    placeholder="Pid"
                    className="mt-2 border rounded p-4 mb-12"
                    onChange={e => updateFormInput({ ...formInput, pid: e.target.value })}
                />               
                {/* {
                    fileUrl && (
                        <img className="rounded mt-4" width="350" src={fileUrl} />
                    )
                } */}
                <button onClick={createSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Create Digital Asset
                </button>
                <button onClick={createSaleEx} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Create 721Tokens
                </button>
                <button onClick={createExclusiveProperties} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Create exclusive listings
                </button>
         
                <button onClick={govtWithdraw} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Govt Withdraw
                </button>

                
                <button onClick={checkTotalDepositBalance} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Check Total Deposit Balance
                </button>
                <div>
                  {<p className='text-white'>{totalDepositBal}</p>}
                </div>
                <button onClick={checkGovtBalance} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Check Govt Balance
                </button>
                <div>
                  {govtBal && <p className='text-white'>{govtBal}</p>}
                </div>
                <button onClick={amountToWithdraw} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Amount to Withdraw
                </button>
                <div>
                  {amountToWithdrawBal && <p className='text-white'>{amountToWithdrawBal}</p>}
                </div>
                <button onClick={getContractBal} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Get Contract Balance
                </button>
                <div>
                  {contractBal && <p className='text-white'>{contractBal}</p>}
                </div>
                <button onClick={getBhbForMarket} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Get BHB for PropertyMarket
                </button>
                <button onClick={getTokenBalanceMaxSupply} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Get Token Balance Max Supply
                </button>
                <button onClick={handleListingPriceChange} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                  Set Listing Price
                </button>
                <input className='mt-3' onChange={(e) => setListingPrice(e.target.value)} />
            
                <button onClick={handleMinDepositPriceChange} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                  Set Min Deposit Price
                </button>
                <input input className='my-3' onChange={(e) => setMinDepositPrice(e.target.value)} />

                <button onClick={getPropertyMarketBalance} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                  Get Property Market Balance
                </button>
                

            </div>
        </div>
    </>
  )

}

export default CreateItem;