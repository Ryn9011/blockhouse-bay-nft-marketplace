import React, { useEffect, useMemo, useState, useRef } from "react";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Modal from '@material-ui/core/Modal';
import { Typography } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import Pagination from '../Pagination'
import "../style.scss";
import Display from "../Components/display";
import { propertytokenaddress } from '../config.js'
import Footer from "../Components/Layout/Footer";
const copy = require('clipboard-copy')


const useStyles = makeStyles({
  root: {
    backgroundColor: 'transparent',
    border: '1px 0px 1px 0px solid rgba(0, 0, 0, 0.23)',
    borderRadius: '4px',
    boxShadow: 'none',
    color: '#a0aec0',
  },
  summary: {
    padding: '16px',
    color: '#a0aec0',
  },
  summaryExpanded: {
    color: '#fff',
    backgroundColor: 'black',
  },
  details: {
    padding: '0 16px 16px 16px',
    color: '#fff',
    background: 'black',
    display: 'block'
  },
  paper: {
    position: 'absolute',
    width: '80%',
    maxWidth: 600,
    backgroundColor: "black",
    border: '2px',
    borderColor: 'white',
    color: 'white',
    boxShadow: '25px',
    padding: '10px',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 200px)',
    border: '2px solid #000',
  },
});

const About = () => {
  const [expanded, setExpanded] = React.useState(false);
  const [defaultExpanded, setDefaultExpanded] = React.useState(false);
  const [buyingExpanded, setBuyingExpanded] = React.useState(false);
  const [ownedExpanded, setOwnedExpanded] = React.useState(false);
  const [rentingExpanded, setRentingExpanded] = React.useState(false);
  const [exclusiveExpanded, setExclusiveExpanded] = React.useState(false);

  const classes = useStyles();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const section = searchParams.get('section') ? searchParams.get('section') : 'nft'

  const [currentImageNum, setCurrentImageNum] = useState(1);
  const imgSrcs = ["./ownedSelling.png", "./ownedLate.png", "./toRent.png", "./renting.png"];
  const [ownedImageSrc, setOwnedImageSrc] = useState(imgSrcs[1])
  const [rentImageSrc, setRentImageSrc] = useState(imgSrcs[3])

  const [isOpen, setIsOpen] = useState(false);

  const iconColor = "grey"

  useMemo(() => {
    if (ownedImageSrc === imgSrcs[0]) {
      setOwnedImageSrc(imgSrcs[1])
    } else if (ownedImageSrc === imgSrcs[1]) {
      setOwnedImageSrc(imgSrcs[0])
    }
    if (rentImageSrc === imgSrcs[2]) {
      setRentImageSrc(imgSrcs[3]);
    } else {
      setRentImageSrc(imgSrcs[2]);
    }
  }, [currentImageNum])

  const paginate = (pageNumber) => {
    setCurrentImageNum(pageNumber)
  };

  useEffect(() => {
    console.log(section)
    if (section === "nft") {
      setExpanded("default")
      setDefaultExpanded(true)
    } else {
      setExpanded(section)
    }
  }, [section])

  const handleChange = (panel) => (event, isExpanded) => {
    if (panel === "default" && isExpanded) {
      setDefaultExpanded(true)
    } else {
      setDefaultExpanded(false)
    }

    setExpanded(isExpanded ? panel : false);
    if (panel === "buying" && isExpanded) {
      setBuyingExpanded(true)
    } else {
      setBuyingExpanded(false)
    }

    if (panel === "owning" && isExpanded) {
      setOwnedExpanded(true)
    } else {
      setOwnedExpanded(false)
    }

    if (panel === "renting" && isExpanded) {
      setRentingExpanded(true)
    } else {
      setRentingExpanded(false)
    }

    if (panel === "panel8" && isExpanded) {
      setExclusiveExpanded(true)
    } else {
      setExclusiveExpanded(false)
    }
  };

  const handleModalOpen = () => {
    setIsOpen(true)
  }

  const handleModalClose = () => {
    setIsOpen(false)
  }

  const handleCopy = () => {
    copy(propertytokenaddress);
  };

  return (
    <>
      <div className="ml-4 mr-4 mb-12">
        <Accordion className={classes.root} expanded={expanded === 'default'} onChange={handleChange('default')}>
          <div>
            {expanded === 'default' &&
              <div className="h-3/5 pt-6 mr-10 flex justify-center lg:hidden">
                {/* <img src="logofull.png" className="ml-10" alt="blockhouse bay" /> */}

              </div>
            }
            <div className={`${expanded === 'default' ? 'flex justify-between' : ''}`}>
              <div>
                <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: iconColor }} />} className={`${classes.summary} ${expanded === 'default' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
                  <p className={(defaultExpanded ? "mr-4 ml-6 items-start font-semibold text-2xl md:text-3xl lg:text-4xl border border-2 p-2 md:p-4" : "text-3xl lg:text-4xl xl:ml-8 font-semibold text-left")}>About</p>
                </AccordionSummary>
              </div>
              {expanded === 'default' &&
                <div className="w-1/4 xl3:w-1/5 h-4/5 pt-8 xl3:pt-6 mr-10 hidden lg:block">
                  <img src="logoplain.png" className="ml-10" alt="blockhouse bay" />
                </div>
              }
            </div>
          </div>
          <AccordionDetails className={classes.details}>
            <div className="lg:grid justify-items-center mb-32 lg:mb-4 lg:grid-cols-2 lg:gap-16 xl3:gap-0 lg:text-xl text-lg xl:text-xl 2xl:text-2xl">
              {/* <img className="p-6 pt-0" src="about.jpeg" /> */}
              <div>
                <ul className="divide-y divide-gray-200 lg:ml-0">
                  <li className="py-4">
                    <h3 className="text-2xl font-semibold text-yellow-200 mt-4">What is Blockhouse Bay?</h3>
                    <div className="lg:hidden">
                      <img src="small.gif" className="mt-4" alt="buy/sell/rent" />
                    </div>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">Real Estate Simulation</p>
                    <p className="mt-2 text-gray-500">
                      Blockhouse Bay is a simple but captivating real estate simulation that takes full advantage of Web 3 technologies and the Polygon blockchain. Get ready to experience the future of real estate! <button className="text-indigo-400 underline" onClick={handleModalOpen}>TLDR</button>
                    </p>
                    <Modal
                      open={isOpen}
                      onClose={handleModalClose}
                      aria-labelledby="modal-title"
                      aria-describedby="modal-description"
                    >
                      <div className={classes.paper}>
                        <img src="logoplain.png" className=" mb-12" alt="blockhouse bay" />
                        <Typography variant="body1" id="modal-description" gutterBottom>
                          Blockhouse Bay is a decentralized application (dapp) built on the
                          Polygon blockchain that allows users to participate in a virtual real
                          estate market. Using unique erc721 tokens, users can buy, sell, and
                          rent properties within the platform's ecosystem.
                        </Typography>
                        <Typography variant="body1" id="modal-description" gutterBottom>
                          All property NFTs are pre-minted and stored on Arweave. A total of 500 standard properties and 50 exclusive properties are available for purchase.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Each property on the platform is represented by an erc721 token, which
                          is a non-fungible token (NFT). This means that each token is unique and
                          represents a specific asset, just like real-world properties. The use
                          of NFTs ensures that each property in Blockhouse Bay is fully owned and
                          controlled by the user who holds the corresponding token.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          The prices of properties on Blockhouse Bay are fixed, with the current
                          owner setting the price for the property. This makes it easy and
                          straightforward for users to purchase or sell properties on the
                          platform without the need for offers or negotiations.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          When a property is listed for sale, the NFT is transferred to the Blockhouse Bay market
                          smart contract. If the sale is cancelled, the NFT is returned to the owner.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          Renters can also participate in the platform by renting properties
                          from other users. Rent is paid in Matic, the native cryptocurrency of
                          the Polygon network, and renters are rewarded with BHB tokens for
                          paying their rent. BHB tokens can be used to buy and sell properties on
                          the platform or to purchase exclusive properties that are only
                          available for purchase with BHB tokens.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          10000000 BHB tokens were minted at the start of the project.
                          100% of the BHB tokens are available to players as none are retained by Blockhouse Bay.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          One of the key benefits of using the Polygon blockchain for Blockhouse
                          Bay is that it is a very cost-effective blockchain to operate on. The
                          Polygon network is designed to be scalable and efficient, with low
                          transaction fees and fast confirmation times. This means that users
                          can participate in the virtual real estate market without incurring
                          high transaction fees, making it an attractive option for those
                          looking to invest in the virtual real estate market.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          In summary, Blockhouse Bay provides a fun and exciting way for users
                          to participate in the real estate market without the need for
                          significant capital investment. By leveraging the power of the Polygon
                          blockchain and NFT technology, Blockhouse Bay creates a decentralized
                          and secure real estate market that is accessible to everyone.
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          <p className="text-yellow-200 font-semibold  mt-4">DISCLAIMER</p>
                          <p className="italic">Blockhouse Bay is a virtual real estate platform built on the Polygon blockchain that offers users the opportunity to buy, sell, and rent digital properties using non-fungible tokens (NFTs). The project operates within the decentralized application (dapp) ecosystem and allows participants to engage in simulated virtual real estate market.

                            It's important to note that engaging in virtual real estate markets involves inherent risks. The purchase, sale, or rental of properties within Blockhouse Bay may be subject to market volatility and fluctuations in cryptocurrency prices, particularly Matic (the native cryptocurrency of the Polygon network) and BHB tokens used within the platform.

                            Users should exercise caution and conduct thorough research before participating in any transactions within the Blockhouse Bay ecosystem. The use of NFTs and cryptocurrencies carries risks, including but not limited to regulatory, financial, and technological risks.

                            Additionally, Blockhouse Bay does not guarantee the value, authenticity, or future marketability of the digital properties or tokens traded on its platform. Users should be aware that the virtual properties held within the platform may not have real-world value and are solely for entertainment or speculative purposes.

                            Moreover, the project's features, functionalities, and token economics are subject to change, and users should stay updated with the platform's terms of service, policies, and any updates announced by the development team.

                            Blockhouse Bay is not providing financial advice, and users should seek independent financial advice if needed before making any investment decisions within the platform.

                            By using Blockhouse Bay, users acknowledge and accept the associated risks and understand that their participation in the platform's activities is at their own discretion and risk.
                          </p>

                        </Typography>
                        <div className="text-yellow-400 flex justify-center">
                          <button className="border border-1 border-yellow-400 rounded py-1.5 px-4 mt-4" onClick={handleModalClose}>Close</button>
                        </div>
                        <div className="flex justify-center items-center mt-4 text-sm italic">
                          <p className="mr-1">Blockhouse Bay was developed by</p>
                          <div className="flex items-center">
                            <a className="text-yellow-100 underline" href="/">8BitCities</a>
                          </div>
                          <img src={"favicon.ico"} className="h-10 w-10 ml-2" alt="React logo" />
                        </div>
                        <div className="text-sm italic flex justify-center">
                          Copyright &copy; {new Date().getFullYear()}
                        </div>
                        
                      </div>
                    </Modal>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">Landlord Tenant or Both!</p>
                    <p className="mt-2 mb-3.5 text-gray-500">
                      With Blockhouse Bay, you have the flexibility to choose your role: be a landlord, a tenant, or even both! Dive into the dynamic world of real estate and embrace the opportunities that come your way.
                    </p>
                    <div className="flex">
                      <p className="text-white text-base xl3:text-lg italic mr-2 pt-0.5">Polygon & Arweave</p>
                      <img className="h-8 w-9 mr-2" src="./polygonsmall.png" />
                      <div className="flex justify-center mr-4">
                        <img className="h-8 w-9 invert" src="./arweave.png" />
                      </div>
                    </div>

                    <p className="mt-2 text-gray-500">
                      Blockhouse Bay operates on the Polygon Layer 2 blockchain, allowing for minimal transaction fees. This means that you can engage in buying, selling, or renting activities without any worries about transaction costs.
                    </p>
                    <p className="mt-2 text-gray-500">
                      All property NFT images are stored on Arweave's decentralized permanent storage.
                    </p>
                  </li>

                  <li className="pt-3 pb-4">
                    <h3 className="text-2xl font-semibold text-yellow-200 mt-4">Passive Income</h3>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">Earn MATIC and BHB Tokens</p>


                    <p className="mt-1 text-gray-500">
                      As a landlord, you'll enjoy the satisfaction of earning real money from your renters in the form of MATIC tokens. You'll also have the chance to receive exclusive Blockhouse Bay tokens (BHB) every time rent is paid. These tokens open up exciting possibilities and provide a cost-effective way to purchase properties.
                    </p>
                  </li>
                  <li className="py-4">
                    <h3 className="text-2xl font-semibold text-yellow-200 mt-4">Exclusive Properties</h3>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">Spend BHB Tokens</p>
                    <p className="mt-2 text-gray-500">
                      Discover a collection of stunning exclusive properties that can only be acquired with BHB tokens. Take a peek at the Blockhouse Bay Gardens properties and find your dream property that sets you apart from the rest.
                    </p>
                  </li>
                </ul>
              </div>
              <div className="hidden lg:block lg:mb-96 xl3:mb-0 xl3:mt-28 lg:scale-[0.6] xl3:scale-90">
                <Display />
              </div>
            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion className={classes.root} expanded={expanded === 'buying'} onChange={handleChange('buying')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: iconColor }} />} className={`${classes.summary} ${expanded === 'buying' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
            <div>
              <div>
                <p className={(buyingExpanded ? "mr-4 ml-6 font-semibold text-3xl lg:text-4xl border border-2 p-4" : "text-3xl lg:text-4xl xl:ml-8 font-semibold")}>Buying a Property</p>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <div className="lg:grid lg:grid-cols-3 lg:gap-4 lg:text-lg xl3:text-xl pb-4">
              <div className="lg:col-span-2 lg:pr-32">
                <ul className="divide-y divide-gray-200">
                  <li className="py-4">
                    <h3 className="text-2xl font-semibold text-yellow-200 mt-4">Buying</h3>
                    <p className="text-white text-base xl3:text-lg italic mt-4">Payment Options</p>
                    <p className="mt-2 text-gray-500">
                      Properties can be bought by paying the asking price in MATIC or BHB tokens.
                    </p>
                    <p className="mt-2 text-gray-500">BHB tokens can be obtained by becoming a renter on an owned property.</p>
                    <p className="mt-2 text-gray-500">A 5 Matic fee is required when buying with BHB tokens.</p>

                    <p className="text-white text-base xl3:text-lg  italic mt-4">Property Resale</p>
                    <p className="mt-2 text-gray-500">
                      Property owners have the option to resell their property for either MATIC or BHB tokens.
                    </p>
                    <p className="mt-2 text-gray-500">
                      Properties can be sold with existing tennants which will transfer over to the new property owner with the sale.
                    </p>
                    <h3 className="text-2xl font-semibold text-yellow-200 mt-4">Transactions</h3>
                    <p className="mt-2 text-gray-500">The duration for completing a transaction, whether it involves buying, renting, or selling, can fluctuate based on network activity. Once a transaction is validated on the Polygon blockchain, property details will be automatically updated.</p>
                  </li>
                </ul>
              </div>

              <div className="lg:ml-16 content-center">
                <div className="flex justify-center pr-16">
                <div className="">Test</div>
                </div>                
                <div className="flex justify-center lg:justify-start 2xl:justify-center">
                  <img className="mt-4 brightness-110 transform sm:h-3/5 sm:w-4/5 md:h-1/5 md:w-3/5 lg:w-full lg:h-full xl3:w-4/6 pr-16 max-w-[40rem]" src="forsale.png" />
                </div>
              </div>
            </div>

          </AccordionDetails>
        </Accordion>

        <Accordion className={classes.root} expanded={expanded === 'owning'} onChange={handleChange('owning')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: iconColor }} />} className={`${classes.summary} ${expanded === 'owning' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
            <div>
              <div>
                <p className={(ownedExpanded ? "mr-4 ml-6 font-semibold text-3xl lg:text-4xl border border-2 p-4 pb-5" : "text-3xl lg:text-4xl xl:ml-8 font-semibold")}>Owning a Property</p>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <div className="lg:grid lg:grid-cols-3 lg:gap-4 lg:text-lg text-lg xl3:text-xl">
              <div className="lg:col-span-2 lg:pr-32">
                <ul className="divide-y divide-gray-200">
                  <li className="py-4">
                    <h3 className="text-2xl font-semibold text-yellow-200 mt-4">Property Owner Actions</h3>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">Collect Rent</p>
                    <p className="mt-2 text-gray-500">
                      Property owners can easily manage each of their properties and collect rent from the Property Management Panel.
                    </p>
                    <p className="mt-2 text-gray-500">
                      Any uncollected rent will accumulate and can be withdrawn at the owner's convenience. Rent is paid in MATIC tokens.
                    </p>
                    <p className="mt-2 text-gray-500">
                      A 5% text will be deducted from the rent amount collected.
                    </p>
                    <p className="mt-2 text-gray-500">
                      Owned properties are automatically listed as available to rent for potential tenants.
                    </p>
                    <p className="mt-2 text-gray-500">
                      Each property has three rooms available for tenants to rent.
                    </p>

                    <p className="text-white text-base xl3:text-lg  italic mt-4">Set Rent Price</p>
                    <p className="mt-2 text-gray-500">
                      Property owners have complete control over their rental properties and can set the rent price to their desired amount.
                    </p>

                    <p className="text-white text-base xl3:text-lg  italic mt-4">Track Late Rent Payments</p>
                    <p className="mt-2 text-gray-500">
                      To help owners stay on top of their tenants, any address with late rent payment will flag up in yellow. Renters are expected to pay rent daily.
                    </p>

                    <p className="text-white text-base xl3:text-lg  italic mt-4">Evict Tenants</p>
                    <p className="mt-2 text-gray-500">
                      Owners can evict a tenant if the tenant consistently fails to pay rent. It is ultimately down to the owner's discretion to decide whether to evict a tenant or not.
                    </p>
                  </li>

                  <li className="py-4">
                    <h3 className="text-2xl font-semibold text-yellow-200 mt-4">Selling a Property</h3>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">Listing Fee</p>
                    <p className="mt-2 text-gray-500">
                      Property owners have the option to sell their property to other interested buyers. A listing fee of 10 Matic will incur.
                    </p>

                    <p className="text-white text-base xl3:text-lg  italic mt-4">Payment Options</p>
                    <p className="mt-2 text-gray-500">
                      Properties can be sold for MATIC or BHB tokens as payment. Mixed payments are not available.
                      Properties cannot be sold for less than their original price when being sold for MATIC tokens.
                    </p>

                    <p className="text-white text-base xl3:text-lg  italic mt-4">Withdraw Sale</p>
                    <p className="mt-2 text-gray-500">
                      A property for sale can be withdrawn from the market by the owner at any time. Listing fee not refunded.
                    </p>
                    <p className="mt-2 text-gray-500">
                      5% of the sale amount will be deducted when a sale is made.
                    </p>
                    <p className="mt-2 text-gray-500">
                      <span className="text-red-600">Warning</span> - Directly transferring your NFT property to another user from your wallet will not transfer ownership of the property on the Blockhouse Bay platform;
                      this will result in the buyer not being able to participate on the Blockhouse Bay platform.
                    </p>
                  </li>

                  <li className="py-4">
                    <h3 className="text-2xl font-semibold text-yellow-200 mt-4">Sharing Your Property</h3>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">Twitter</p>
                    <p className="mt-2 text-gray-500">
                      Whether you're looking for renters or buyers, you can share your property on Twitter with the click of a button.
                    </p>
                    <p className="mt-2 text-gray-500">
                      The tweet button will open a Twitter post for you to cutomize with a link to your individual property.
                    </p>
                    <p className="mt-2 text-gray-500 mb-12">
                      There are two checkboxes which if checked will add additional sale and rent information to the tweet.
                    </p>
                    <div className="flex justify-center lg:justify-start">
                      <img src="twitter2.png" className="mt-2 md:w-4/5 lg:w-3/5 border border-1 mt-4 xl3:w-2/5" />
                    </div>
                  </li>
                </ul>
                <br />
              </div>
              <div className="lg:pt-1  xl3:ml-0">
                <div className="xl3:ml-14 lg:w-4/5 xl3:w-1/2 pt-2">
                  <div className="flex justify-center pt-3 pb-2 italic">
                    <p>Property Owner Management Panel</p>
                  </div>
                  <div className="flex h-9 mb-3 justify-center lg:justify-end">
                    <Pagination
                      postsPerPage={1}
                      totalPosts={2}
                      paginate={paginate}
                      currentPage={currentImageNum}
                      isImages={true}
                    />
                  </div>

                  <div className="flex justify-center lg:justify-start">
                    <img className="md:w-3/5 lg:w-full mb-4" alt="owner panel" src={ownedImageSrc} />
                  </div>
                  {(ownedImageSrc !== "./ownedSelling.png") ? (
                    <div className="flex justify-center lg:justify-start md:px-32 lg:px-0">
                      <p className="text-white text-sm mt-2 mb-4">Example of a property with two rooms rented out and one room available to rent. Late renters are highlighted in yellow.</p>
                    </div>
                  ) : (
                    <div className="flex justify-center lg:justify-start">
                      <p className="text-white text-sm mt-2 mb-4">Once a property has been listed for sale, the owner panel will appear as above</p>
                    </div>
                  )
                  }
                  <div className="flex justify-center lg:justify-start">
                    <img src="collectRent.png" className="md:w-3/5 lg:w-full border border-1 mt-6" />
                  </div>
                  <div className="flex justify-center lg:justify-start">
                    <p className="text-sm mt-6">Accumlated rent will show above the panel and can be withdrawn at any time</p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion className={classes.root} expanded={expanded === 'renting'} onChange={handleChange('renting')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: iconColor }} />} className={`${classes.summary} ${expanded === 'renting' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
            <div>
              <div>
                <p className={(rentingExpanded ? "mr-4 ml-6 font-semibold text-3xl lg:text-4xl border border-2 p-4" : "text-3xl lg:text-4xl xl:ml-8 font-semibold")}>Renting a Property</p>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <div className="lg:grid lg:grid-cols-3 lg:gap-4 lg:text-lg text-lg xl:mb-6">
              <div className="lg:col-span-2 lg:pr-32 xl:text-xl ">
                <ul className="divide-y divide-gray-200">
                  <li className="py-4">
                    <h3 className="text-2xl font-semibold text-yellow-200">Renting a Room</h3>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">Rental Deposit</p>
                    <p className="mt-2 text-gray-500">
                      To rent a room in a property, a deposit of 10 Matic must be made. This is refunded when the renter decides to vacate the room.
                    </p>
                    <p className="mt-2 text-gray-500">
                      A user can rent only one room on the same property.
                    </p>
                    <p className="mt-2 text-gray-500">
                      A total of 3 deposits can be made at any one time for an inidival wallet address.
                    </p>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">Rent Payment Obligation</p>
                    <p className="mt-2 text-gray-500">
                      Rent must be paid daily. A renter will be flagged as a late payer to the owner if no payment is made on time. It's down to the property owner's discretion to evict a tenant if they fail to pay rent consistently.
                    </p>
                    <p className="mt-2 text-gray-500">
                      If a renter is evicted, they will lose their rental deposit.
                    </p>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">Restrictions</p>
                    <p className=" text-gray-500 mt-2">
                      Properties with at least one available spare room can be rented from the property owner.
                    </p>
                    <p className="mt-2 text-gray-500">
                      A user can rent only one room on the same property.
                    </p>
                    <p className="mt-2 text-gray-500">
                      A user cannot rent a room on a property they own.
                    </p>
                  </li>

                  <li className="py-4">
                    <h3 className="text-2xl font-semibold text-yellow-200">Token Rewards</h3>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">BHB Token Address</p>
                    <p className="mt-2 text-gray-500">
                      In your wallet select import tokens and paste in the BHB token address -
                    </p>
                    <p>
                      <span className="text-pink-400 text-xs">
                        {propertytokenaddress}
                      </span>
                      <button className="border px-2 py-0.5 ml-2 border-1 text-xs" onClick={handleCopy}>Copy</button>
                    </p>
                    <p className="text-white text-base xl3:text-lg italic mt-4">Earning BHB Tokens</p>
                    <p className="mt-2 text-gray-500">
                      Each time a renter pays rent to the property owner, they are rewarded with BHB tokens which can be used to purchase a property as an alternative to paying in MATIC.
                    </p>
                    <p className="mt-2 text-gray-500">
                      The higher the rent price paid, the higher the token rewards will be for the tenant.
                    </p>
                    <p className="mt-2 text-gray-500">

                    </p>
                    <p className="text-white text-base xl3:text-lg  italic mt-4">Spending BHB Tokens</p>
                    <p className="mt-2 text-gray-500">
                      The initial token price of 2000 BHB works out to be cheaper than buying the property in MATIC. Renting is ideal for those who don't want to fork out up front the MATIC to buy a property and is a cheaper pathway to owning a property.
                    </p>
                    <p className="mt-2 text-gray-500">

                    </p>
                    <p className="text-white text-base xl3:text-lg italic mt-4">Blockhouse Bay Gardens</p>
                    <p className="mt-2 text-gray-500">
                      You can also rent from the exclusive Blockhouse Bay Gardens properties. These properties are more expensive to rent but offer tripple token rewards.
                    </p>
                    <p className="mt-2 text-gray-500">
                      If enough BHB tokens are accumulated, you will be able to purchase a property on Blockhouse Bay Gardens - availability permitting.
                    </p>
                  </li>
                </ul>
              </div>
              <div className="lg:pt-1  xl3:ml-0">
                <div className="xl3:ml-14 lg:w-4/5 xl3:w-1/2">
                  <div className="flex h-9 mb-3 justify-center lg:justify-start">
                    <Pagination
                      postsPerPage={1}
                      totalPosts={2}
                      paginate={paginate}
                      currentPage={currentImageNum}
                      isImages={true}
                    />
                  </div>
                  <div className="flex justify-center lg:justify-start mb-4">
                    <img className="md:w-3/5 lg:w-full" alt="owner panel" src={rentImageSrc} />
                  </div>
                  {(rentImageSrc !== "./renting.png") ? (
                    <div className="flex justify-center lg:justify-start">
                      <p className="text-white text-sm mt-2 mb-4">Property with two rooms already rented out and one room available to rent</p>
                    </div>
                  ) : (
                    <div className="flex justify-center lg:justify-start">
                      <p className="text-white text-sm mt-2 mb-4">The Renters panel above is what a user will see once they have paid a rental deposit on a room</p>
                    </div>
                  )
                  }
                  <div className="flex justify-center lg:justify-start">
                    <img src="collectTokens.png" className="mt-4 border border-1 md:w-3/5 lg:w-full" />
                  </div>
                  <div className="flex justify-center lg:justify-start pt-4">
                    <p className="text-sm mt-2">The higher the rent price, the more Matic is received upon paying rent</p>
                  </div>
                </div>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion className={classes.root} expanded={expanded === 'panel8'} onChange={handleChange('panel8')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: iconColor }} />} className={`${classes.summary} ${expanded === 'panel8' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
            <div>
              <div>
                <p className={(exclusiveExpanded ? "mr-4 ml-6 font-semibold text-3xl lg:text-4xl border border-2 p-4" : "text-3xl lg:text-4xl xl:ml-8 font-semibold")}>Blockhouse Bay Gardens</p>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails className={classes.details}>
            <div className="lg:grid justify-items-center mb-32 lg:mb-20 lg:grid-cols-2 lg:mr-12 lg:gap-16 xl3:gap-32 lg:text-xl text-lg xl:text-xl 2xl:text-2xl">
              <ul className="divide-y divide-gray-200 ">
                <li className="py-4">
                  <h3 className="text-2xl font-semibold text-green-300">Blockhouse Bay Gardens</h3>
                  <p className="mt-2 text-gray-500">
                    Blockhouse Bay Gardens, a long exclusive street of grand and stunning homes,
                    is a paradise of luxurious living. From impressive architecture to immaculate gardens,
                    each house is a masterpiece of sophistication,
                    offering an unparalleled lifestyle in one of the bay's most beautiful settings. </p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg italic font-semibold">Buying</h3>
                  <p className="mt-2 text-gray-500">Properties on Blockhouse Bay Gardens can only be purchased and sold using BHB tokens</p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg italic font-semibold">Renting</h3>
                  <p className="mt-2 text-gray-500">Tripple BHB token rewards will be given to renters on this street</p>
                </li>
                <li className="py-4">
                  <h3 className="text-lg italic font-semibold">Ranking</h3>
                  <p className="mt-2 text-gray-500">These properties are ranked based on total income generated from rent and sale history total.</p>
                </li>
              </ul>
              <div className="gallery h-fit pb-16 md:pb-40 lg:pb-0 lg:h-full cursor-none lg:mr-12 ml-3.5 mt-8 lg:mt-0 lg:mb-96 mb-24 xs:ml-5 xs2:ml-8 xs2:mb:32 sm:mb-32 sm:ml-24 md:ml-44 md:mb-32">
                <a href="/blockhouse-bay-gardens" className="clipped-border">
                  <img src="gallery1.png" id="clipped" />
                </a>
                <a href="/blockhouse-bay-gardens" className="clipped-border">
                  <img src="gallery2.png" id="clipped" />
                </a>
                <a href="/blockhouse-bay-gardens" className="clipped-border">
                  <img src="gallery3.png" id="clipped" />
                </a>
                <a href="/blockhouse-bay-gardens" className="clipped-border">
                  <img src="gallery4.png" id="clipped" />
                </a>
                <a href="/blockhouse-bay-gardens" className="clipped-border">
                  <img src="gallery5.png" id="clipped" />
                </a>
                {/* <div className="shadow"></div> */}
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div></>

  )
}

export default About