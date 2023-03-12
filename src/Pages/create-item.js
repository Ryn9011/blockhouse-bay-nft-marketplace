import { React, useState } from 'react';
import { ethers } from 'ethers'
import Web3Modal from 'web3modal'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'

import { providers, utils } from "ethers"
import WebBundlr from '@bundlr-network/client';
import { useRef } from "react";
import BigNumber from 'bignumber.js'

import data from '../final-manifest.json';

import {
  nftaddress, nftmarketaddress
} from '../config'

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

  // const filesTest = [
  //   { name: "property1.jpeg", path: "/Users/ryanjennings/Desktop/final/" },   
  //   { name: "property2.jpeg", path: "/Users/ryanjennings/Desktop/untitled folder 4/property2.jpeg" },   
  // ];

  // let names =  ["105 Laurelwood Drive", "41 Riverdale Road"];
    
  const initialise = async () => {
    await window.ethereum.enable()
    const provider = new providers.Web3Provider(window.ethereum)
    await provider._ready()

    const bundlr = new WebBundlr("https://node1.bundlr.network", "matic", provider)
    await bundlr.ready()
    setBundlrInstance(bundlr)
    bundlrRef.current = bundlr
    fetchBalance()
  }

  const fetchBalance = async () => {
    const bal = await bundlrRef.current.getLoadedBalance()
    console.log('bal ', utils.formatEther(bal.toString()))
    setBalance(utils.formatEther(bal.toString()))
  }



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
      // })
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



  
  //http://arweave.net/dlfIcZoIBdWgW6fuTqxS1EpU9X8QK5jYnbarJqkIiw8
//http://arweave.net/DRiqGap04wR1bUyU_RYwzjpdjeHsAXECezolSRSuK-c
//http://arweave.net/oxIDX4DjYBP2ng9HI96ZcnvWp_tM9Rap6w1WnLxuzH0

  const createSale = async () => {   
    console.log(formInput)
    const urisn = Object.keys(data.paths).map(uri => "http://arweave.net/" + data.paths[uri].id);

    const web3Modal = new Web3Modal()
    const connection = await web3Modal.connect()
    const provider = new ethers.providers.Web3Provider(connection)
    const signer = provider.getSigner()

    console.log(urisn)

    let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    let transaction = await contract.createTokens(urisn)
    let tokenIds = await transaction.wait() 
    //test if this is actually the token ids
    console.log(tokenIds)

    // let event = tx.events[0]
    // let value = event.args[2]
    // let tokenId = value.toNumber()
    
    // const price = ethers.utils.parseUnits(formInput.price, 'ether')
    // var decimals = 18;
    contract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
    
    let listingPrice = await contract.getListingPrice()     
    listingPrice = listingPrice.toString()             

    transaction = await contract.createPropertyListing(nftaddress, tokenIds, { value: listingPrice })
    await transaction.wait()
    
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
                <input
                    placeholder="Asset Name"
                    className="mt-8 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, name: e.target.value })}
                />
                <textarea
                    placeholder="Asset Description"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, description: e.target.value })}
                />
                <input
                    placeholder="Asset Price in Eth"
                    className="mt-2 border rounded p-4"
                    onChange={e => updateFormInput({ ...formInput, price: e.target.value })}
                />               
                {/* {
                    fileUrl && (
                        <img className="rounded mt-4" width="350" src={fileUrl} />
                    )
                } */}
                <button onClick={createSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Create Digital Asset
                </button>
            </div>
        </div>
    </>
  )


}

export default CreateItem;