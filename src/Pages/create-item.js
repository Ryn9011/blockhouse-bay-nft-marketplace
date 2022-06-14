import { React, useState } from 'react';
import { ethers } from 'ethers'
import { create as ipfsHttpClient } from 'ipfs-http-client'
//import { useRouter } from 'next/router'
import Web3Modal from 'web3modal'
import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'

import {
    nftaddress, nftmarketaddress
} from '../config'
import { Router } from 'react-router-dom';
import { list } from 'postcss';

const client = ipfsHttpClient('https://ipfs.infura.io:5001/api/v0')

const CreateItem = () => {
    const [fileUrl, setFileUrl] = useState(null)
    const [formInput, updateFormInput] = useState({ price: '', name: '', description: '' })
    const [file, setFile] = useState(null)

    async function onChange(e) {
        const file = e.target.files[0]
        try {
          const added = await client.add(
            file,
            {
              progress: (prog) => console.log(`received: ${prog}`)
            }
          )
          const url = `https://ipfs.infura.io/ipfs/${added.path}`
          setFileUrl(url)
        } catch (error) {
          console.log('Error uploading file: ', error)
        }  
      }
      async function uploadToIPFS() {
        const { name, description, price} = formInput
        if (!name || !description || !fileUrl) return
        /* first, upload to IPFS */
        const data = JSON.stringify({
          name, description, image: fileUrl, price
        })
        try {
          const added = await client.add(data)
          const url = `https://ipfs.infura.io/ipfs/${added.path}`
          /* after file is uploaded to IPFS, return the URL to use it in the transaction */
          return url
        } catch (error) {
          console.log('Error uploading file: ', error)
        }  
      }
    
      const createSale = async () => {
        const url = await uploadToIPFS()
        const web3Modal = new Web3Modal()
        const connection = await web3Modal.connect()
        const provider = new ethers.providers.Web3Provider(connection)
        const signer = provider.getSigner()

        let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
        let transaction = await contract.createToken(url)
        let tx = await transaction.wait()      
        let event = tx.events[0]
        let value = event.args[2]
        let tokenId = value.toNumber()

        const price = ethers.utils.parseUnits(formInput.price, 'ether')
        var decimals = 18;
        contract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
        
        let listingPrice = await contract.getListingPrice()     
        listingPrice = listingPrice.toString()     

        transaction = await contract.createPropertyListing(
          nftaddress, tokenId, { value: listingPrice }
        )
      await transaction.wait()
        }

    // const provider = new ethers.providers.JsonRpcProvider()    
    // const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, provider)
    // const price = await marketContract.getInitialSalePrice()


    // async function onChange(e) {
    //     setFile(e.target.files[0])      
    // }

    // const uploadFileToIpfs = async () => {
    //     try {
    //         console.log("hit")
    //         const added = await client.add(
    //             file,
    //             {
    //                 progress: (prog) => console.log(`received: ${prog}`)
    //             }
    //         )        
    //         const url = `https://ipfs.infura.io/ipfs/${added.path}`                     
    //         await setFileUrlState(url)
    //     } catch (error) {
    //         console.log('Error uploading file: ', error)
    //     }
    // }

    // const setFileUrlState = async (fileUrl) => {
    //     setFileUrl(fileUrl)
    // }

    // const createMarket = async () => {
    //     await uploadFileToIpfs();
        
    //     const { name, description, price } = formInput
    //     console.log(fileUrl)
    //     if (!name || !description || !price || !fileUrl) return
    //     /* first, upload to IPFS */

    //     const data = JSON.stringify({
    //         name, description, image: fileUrl, price
    //     })
    //     console.log(data)
    //     try {
    //         const added = await client.add(data)
    //         const url = `https://ipfs.infura.io/ipfs/${added.path}`
    //         /* after file is uploaded to IPFS, pass the URL to save it on Polygon */
    //         createSale(url)
    //     } catch (error) {
    //         console.log('Error uploading file: ', error)
    //     }
    // }

    // const createSale = async (url) => {
    //     console.log(url)
    //     const web3Modal = new Web3Modal()
    //     const connection = await web3Modal.connect()
    //     const provider = new ethers.providers.Web3Provider(connection)
    //     const signer = provider.getSigner()

    //     let contract = new ethers.Contract(nftaddress, NFT.abi, signer)
    //     let transaction = await contract.createToken(url)
    //     let tx = await transaction.wait()      
    //     let event = tx.events[0]
    //     let value = event.args[2]
    //     let tokenId = value.toNumber()

    //     const price = ethers.utils.parseUnits(formInput.price, 'ether')

    //     contract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, signer)
    //     let listingPrice = await contract.getListingPrice()
    //     listingPrice = listingPrice.toString()

    //     transaction = await contract.createPropertyListing(
    //         nftaddress, tokenId, price, { value: listingPrice }
    //     )
    //     await transaction.wait()
        
    

    return (
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
                <input
                    type="file"
                    name="Asset"
                    className="my-4"
                    onChange={onChange}
                />
                {
                    fileUrl && (
                        <img className="rounded mt-4" width="350" src={fileUrl} />
                    )
                }
                <button onClick={createSale} className="font-bold mt-4 bg-pink-500 text-white rounded p-4 shadow-lg">
                    Create Digital Asset
                </button>
            </div>
        </div>
    )
}

export default CreateItem;