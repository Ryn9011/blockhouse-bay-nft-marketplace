import { React, useEffect, useState } from 'react'
import { useModalContext } from '../App'
import axios from 'axios'
import GetPropertyNames from '../utility/getPropertyName'
import Pagination from '../utility/Pagination'
import Blockies from 'react-blockies';
import { detectNetwork, getRpcUrl } from '../Components/network-detector';

import {
  nftaddress, nftmarketaddress, govtaddress
} from '../config/config'

import NFT from '../artifacts/contracts/NFT.sol/NFT.json'
import PropertyMarket from '../artifacts/contracts/PropertyMarket.sol/PropertyMarket.json'
import GovtFunctions from '../artifacts/contracts/GovtFunctions.sol/GovtFunctions.json'
import SaleHistory from '../Components/sale-history'


const ethers = require("ethers")

if (window.ethereum) {
  window.ethereum.on('accountsChanged', function (accounts) {
    window.location.reload();
  });
}

const AllProperties = () => {

  const [loadingState, setLoadingState] = useState('not-loaded')
  const [propertyList, setPropertyList] = useState([]);
  const [postsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = propertyList.slice(indexOfFirstPost, indexOfLastPost);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const { modalEvent, provider, signer } = useModalContext();

  
  useEffect(() => {
    //console.log(provider);
    //console.log(signer);
    setLoadingState('not-loaded');
    if (signer == null) {

      return;
    }
    if (provider != null) {

      loadProperties();
    }
  }, [currentPage, signer]);

  const loadProperties = async () => {

    const tokenContract = new ethers.Contract(nftaddress, NFT.abi, provider)
    const marketContract = new ethers.Contract(nftmarketaddress, PropertyMarket.abi, provider)
    const govtContract = new ethers.Contract(govtaddress, GovtFunctions.abi, provider)

    try {
      const data = await govtContract.fetchAllProperties(currentPage)

      const items = await Promise.all(data.filter(i => Number(i.propertyId) != 0 && (a => Number(a.tokenId) !== 0)).map(async i => {
        try {
          // const tokenUri = 'https://dummyimage.com/300x200/000/fff'
          const tokenUri = await tokenContract.tokenURI(i.tokenId)
          if (tokenUri === undefined) {
            tokenUri = ''
          }

          const meta = await axios.get(tokenUri)
          //console.log(data)
          let nftName = GetPropertyNames(meta)

          let price = await ethers.formatUnits(i.salePrice.toString(), 'ether')
          //let depositHex = await govtContract.getDepositRequired()
          //et deposit = await ethers.formatUnits(depositHex, 'ether')

          const renterAddresses = await marketContract.getPropertyRenters(i.propertyId);


          let saleHistory = [];
          if (i.saleHistory.length > 0) {
            i.saleHistory.forEach((item) => {
              const history = i.saleHistory.map((item) => {
                return {
                  price: ethers.formatUnits(item[0]),
                  type: Number(item[1]) === 1 ? "POL" : "BHB"
                }
              });
              saleHistory = history;
            })
          } else {
            saleHistory.push("Unsold")
          }
          let totalIncomeGenerated;
          if (i.totalIncomeGenerated != 0) {
            totalIncomeGenerated = ethers.formatUnits(i.totalIncomeGenerated)
          } else totalIncomeGenerated = 0;
          let rentPrice = await ethers.formatUnits(i.rentPrice.toString(), 'ether')
          let owner = i.owner === '0x0000000000000000000000000000000000000000' ? 'Unowned' : i.owner


          let item = {
            price,
            propertyId: Number(i.propertyId),
            seller: i.seller,
            owner: owner,
            image: tokenUri,
            name: nftName,
            description: meta.data.description,
            roomOneRented: i.roomOneRented,
            roomTwoRented: i.roomTwoRented,
            roomThreeRented: i.roomThreeRented,
            roomFourRented: i.roomFourRented,
            rentPrice: rentPrice,
            depositRequired: i.deposit,
            available: false,
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
        } catch (e) {
          console.log(e)
        }
      }))
      setPropertyList(items)
      setLoadingState('loaded')
    } catch (e) {
      console.log(e)
    }
  }



  // if (propertyList[0] === undefined) {
  //   return (<div>Unable to load images</div>)
  // }

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
          <img src="night.png" className="pl-6 pr-6 h-4/5 lg:h-5/6 xl3:h-5/6 lg:w-3/6 xl3:w-3/5 lg:pl-12 brightness-125 " />
        </div>
      </div>
    </div>
  )

  return (
    <div className="pt-10 pb-10">
      <div className="flex justify-center">
        <div className="px-6 md:px-9" style={{ maxWidth: "1600px" }}>
          <h1 className="text-white mb-5">All Properties</h1>
          <div className="flex text-white pl-4 mb-5">
            <p className="text-sm lg:text-xl pl-4 font-bold mr-1 mb-2">All Blockhouse Bay properties</p>
            {/* <div className="pb-2">
              <img
                className="object-none scale-75 pr-0.5 pl-1"
                src="./pogtoken.png"
                alt=""
              ></img>
            </div>
            <h5 className="text-white mb-4">tokens</h5> */}
          </div>

          <Pagination
            postsPerPage={postsPerPage}
            totalPosts={500}
            paginate={paginate}
            currentPage={currentPage}
          />
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 text-white">

            {propertyList.map((property, i) => {

              return (
                <div
                  key={1}
                  className="border shadow rounded-md overflow-hidden bg-gradient-120 from-black via-black to-blue-400"
                >
                  {
                    property.image ? (
                      <img className='w-fit h-fit' src={property.image} alt="" />
                    ) : (
                      <div className='w-fit h-fit'>Image not available</div>
                    )
                  }

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
                          {property.owner !== 'Unowned' &&
                            <Blockies
                              seed={property.owner}
                            />
                          }
                        </div>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p>Rooms Rented:</p>
                        <p className="font-mono text-xs text-green-400">{property.roomsRented}/4</p>
                      </div>
                      <div className="flex flex-col pb-2">
                        <p>Rent Price:</p>
                        <p className="font-mono text-xs text-green-400">{property.rentPrice} POL</p>
                      </div>
                      <div className="flex flex-col">
                        <p>Total Income Generated:</p>
                        <p className="font-mono text-xs pb-2 text-green-400">{property.totalIncomeGenerated} POL</p>
                      </div>
                      <p>Tenants:</p>
                      <div className='text-[10px] mb-3 text-green-400 font-mono'>
                        {ethers.formatEther(property.renterAddresses[0]).toString() !== "0.0" ?
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
                          : <p>0x</p>
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
                            {property.renterAddresses[1] === "0.0" &&
                              <p>0x</p>}
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
                          : <>
                            {property.renterAddresses[2] === "0.0" &&
                              <p>0x</p>}
                          </>
                        }
                        {ethers.formatEther(property.renterAddresses[3]).toString() !== "0.0" ?
                          <div className='flex items-center justify-between'>
                            <p className={" break-words"}>
                              {property.renterAddresses[3]}
                            </p>
                            <Blockies
                              seed={property.renterAddresses[3]}
                            />
                          </div>
                          : <>
                            {property.renterAddresses[3] === "0.0" &&
                              <p>0x</p>}
                          </>
                        }
                      </div>
                      <SaleHistory property={property} />
                    </div>
                  </div>
                </div>
              )

            })}
          </section>

          <div className='mt-6'>
            <Pagination
              postsPerPage={postsPerPage}
              totalPosts={500}
              paginate={paginate}
              currentPage={currentPage}
            />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AllProperties;

//what happens if rent more than one room with same address?
