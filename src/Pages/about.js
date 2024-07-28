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
import { Add } from "@material-ui/icons";
import AddTokenButton from "../Components/AddTokenButton";
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

  },
  details: {
    padding: '0 16px 16px 16px',
    color: '#fff',

    display: 'block'
  },
  paper: {
    position: 'absolute',
    width: '80%',
    maxWidth: 600,
    background: 'black',
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

window.ethereum.on('accountsChanged', function (accounts) {
  window.location.reload();
});

const About = () => {
  const [expanded, setExpanded] = React.useState(false);
  const [defaultExpanded, setDefaultExpanded] = React.useState(false);
  const [buyingExpanded, setBuyingExpanded] = React.useState(false);
  const [ownedExpanded, setOwnedExpanded] = React.useState(false);
  const [rentingExpanded, setRentingExpanded] = React.useState(false);
  const [exclusiveExpanded, setExclusiveExpanded] = React.useState(false);
  const [feesExpanded, setFeesExpanded] = React.useState(false);

  const classes = useStyles();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const section = searchParams.get('section') ? searchParams.get('section') : 'nft'

  const [currentImageNum, setCurrentImageNum] = useState(1);
  const imgSrcs = ["./ownedSelling.png", "./ownedLate.png", "./torent.png", "./renting.png", "./X.png"];
  const [ownedImageSrc, setOwnedImageSrc] = useState(imgSrcs[0])
  const [rentImageSrc, setRentImageSrc] = useState(imgSrcs[3])

  const [isOpen, setIsOpen] = useState(false);

  const iconColor = "grey"

  useMemo(() => {
    console.log(currentImageNum, ' ', ownedImageSrc)

    if (currentImageNum === 1) {
      setOwnedImageSrc(imgSrcs[1])
    } else if (currentImageNum === 2) {
      setOwnedImageSrc(imgSrcs[0])
    } else if (currentImageNum === 3) {
      setOwnedImageSrc(imgSrcs[4])
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

    if (panel === "fees" && isExpanded) {
      setFeesExpanded(true)
    } else {
      setFeesExpanded(false)
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
      <div className="px-4 xl3:mx-64 mb-12">
        <Accordion className={classes.root} expanded={expanded === 'default'} onChange={handleChange('default')}>

          <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: iconColor }} />} className={`${classes.summary} ${expanded === 'default' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
            <div>
              <p className={(defaultExpanded ? "mr-4 ml-6 items-start font-semibold text-2xl md:text-3xl lg:text-4xl border border-2 p-2 md:p-4" : "text-3xl lg:text-4xl xl:ml-8 font-semibold text-left")}>About</p>
            </div>
          </AccordionSummary>

          <AccordionDetails className="border border-1 rounded-md" style={{ paddingRight: "0px" }}>

            <div className="xl:grid grid-cols-2 gap-11 ">
              <div className="col-span-1 pr-[16px] lg:pr-0">
                <ul className="divide-y divide-gray-200 lg:ml-0 text-lg">
                  <li className="py-4 pt-0 ">
                    <h3 className="text-2xl font-semibold text-yellow-200 lg:mt-0">What is Blockhouse Bay?</h3>
                    <div className="xl:hidden flex justify-center">
                      <img src="livingroom1.png" className="mt-4" alt="buy/sell/rent" />
                    </div>
                    <p className="text-white text-xl xl3:text-xl italic mt-4">Real Estate Simulation</p>
                    <p className="mt-2 text-gray-400">
                      Blockhouse Bay is a gamified real estate simulation that takes full advantage of Web 3 technologies and the Polygon blockchain. Get ready to experience the future of real estate!
                    </p>
                    <button className="text-indigo-400 underline mt-2" onClick={handleModalOpen}>TLDR</button>
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
                          available for purchase with BHB tokens. The higher the rent price, the higher the token reward.
                          A diminishing supply factor is in place and so as supply runs lower, the amount of tokens paid out will decrease.
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
                          The smart contracts behind the platform have been audited by an industry expert but risks can still potentially exist. See disclaimer below.
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
                          <p className="mr-1"></p>
                          <div className="flex items-center">
                            <a href="mailto:blockhousebaycrypto@gmail.com" className="text-yellow-100 underline">BlockHouse Bay</a>
                          </div>
                          {/* <img src={"favicon.ico"} className="h-10 w-10 ml-2" alt="React logo" /> */}
                        </div>
                        <div className="text-sm italic flex justify-center">
                          Copyright &copy; {new Date().getFullYear()}
                        </div>

                      </div>
                    </Modal>
                    <p className="text-white text-xl xl3:text-xl italic mr-2 pt-0.5 mt-3">Purpose</p>
                    <p className="mt-2 text-gray-400">
                      Blockhouse Bay has come into existence for three reasons:
                      Firstly, it was my excuse for me the developer, ScubaSteve (my gaming alter ego),
                      to dive into and better understand the mysteries of blockchain and NFTs. Secondly, to create something for others can have some fun with and even make some money along the way.
                      Thirdly,
                      it is a desperate attempt to crowdfund a new laptop -
                      As much as opening a notepade on mine heats it up to the point I could probably roast marshmallows over it meanwhile the fans going off like bees trapped in a blender!
                    </p>
                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Landlord, Tenant or Both!</p>
                    <p className="mt-2 mb-3.5 text-gray-400">
                      With Blockhouse Bay, you have the flexibility to choose your role: be a landlord, a tenant, or even both! Dive into the dynamic world of real estate and embrace the opportunities that come your way.
                    </p>
                    <div className="flex">
                      <p className="text-white text-xl xl3:text-xl italic mr-2 pt-0.5">Polygon & Arweave</p>
                      <img className="h-8 w-9 mr-2" src="./polygonsmall.png" />
                      <div className="flex justify-center mr-4">
                        <img className="h-8 w-9 invert" src="./arweave.png" />
                      </div>
                    </div>

                    <p className="mt-2 text-gray-400">
                      Blockhouse Bay operates on the Polygon blockchain, allowing for minimal transaction fees. This means that you can engage in buying, selling, or renting activities without any worries about transaction costs.
                    </p>
                    <p className="mt-2 text-gray-400">
                      All property NFT images are stored on Arweave's decentralized permanent storage, meaning they are truly persisted.
                    </p>


                  </li>
                  <li className="pt-2 pb-4">
                    <h3 className="text-2xl font-semibold text-yellow-200 ">Passive Income</h3>
                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Earn MATIC and BHB Tokens</p>
                    <p className="mt-1 text-gray-400">
                      As a landlord, you'll enjoy the satisfaction of earning real money from your renters in the form of MATIC tokens. You'll also have the chance to receive exclusive Blockhouse Bay tokens (BHB) every time rent is paid. These tokens open up exciting possibilities and provide a cost-effective way to purchase properties.
                    </p>
                  </li>
                  <li className="pb-4 pt-2">
                    <h3 className="text-2xl font-semibold text-yellow-200 ">Exclusive Properties</h3>
                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Spend BHB Tokens</p>
                    <p className="mt-2 text-gray-400">
                      Discover a collection of stunning exclusive properties that can only be acquired with BHB tokens. Take a peek at the Blockhouse Bay Gardens properties and find your dream property that sets you apart from the rest.
                    </p>
                  </li>
                </ul>
              </div>

              <div className="col-span-1 mt-2 mr-4 bg-right-top bg-fit bg-no-repeat" style={{ backgroundImage: "url('insidereduced.png')" }}></div>

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
          <AccordionDetails className="border border-1 rounded-md">
            <div className="xl:grid grid-cols-2 gap-11 xl:mr-0">
              <div className="lg:col-span-1">
                <ul className="divide-y divide-gray-200">
                  <li className="pb-4">
                    <h3 className="text-2xl font-semibold text-yellow-200 mt-0">Buying</h3>
                    <p className="text-white text-xl xl3:text-xl italic mt-4">Availability</p>
                    <p className="mt-2 text-gray-400">
                      There are a total of 500 standard properties and 50 exclusive properties available for purchase. Each property is represented by a pre minted non-fungible token (NFT).
                    </p>
                    <p className="text-white text-xl xl3:text-xl italic mt-4">Payment Options</p>
                    <p className="mt-2 text-gray-400">
                      Properties can be bought by paying the asking price in MATIC or BHB tokens.
                    </p>
                    <p className="mt-2 text-gray-400">BHB tokens can be acquired by becoming a tenant in a property owned by another user. Tenants are rewarded with tokens when they pay rent and the higher the rent price, the more tokens are rewarded</p>
                    <p className="text-white text-xl xl3:text-xl italic mt-4">Generating Income</p>
                    <p className="mt-2 text-gray-400">
                      Becoming a property owner can earn income in two ways: Passivly when tenants pay rent and by selling the property for a profit. As more properties are sold, inflation will come into play and properties will become more valable
                    </p>
                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Property Resale</p>
                    <p className="mt-2 text-gray-400">
                      Property owners have the option to resell their property for either MATIC or BHB tokens.
                    </p>
                    <p className="mt-2 text-gray-400">
                      Properties can be sold with existing tennants which will transfer over to the new property owner with the sale.
                    </p>
                  </li>
                  <li className="pb-4 pt-2">
                    <h3 className="text-2xl font-semibold text-yellow-200 ">BHB Tokens</h3>
                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Trading</p>
                    <p className="mt-2 text-gray-400">
                      I would like the BHB token to
                    </p>
                  </li>
                </ul>
              </div>

              <div className="lg:grid grid-cols-2 content-center">
                <div className="flex flex-col mt-12 gap-4">
                  <p className="text-xl italic text-white">Property Sale Panel</p>
                  <p className="mr-4">The image shows an example of a property for sale</p>
                  <p className=" text-white italic">Information Displayed</p>
                  <ul className="list-disc list-inside xl:pr-6 space-y-4 mx-4">
                    <li>
                      The public address of the property owner
                    </li>
                    <li>
                      The number of rooms rented is how many people are currently renting from this property
                    </li>
                    <li>
                      The rent price that renters are expected to pay.
                    </li>
                    <li>
                      Total Income Generated is the accumulated total Matic the property has generated from renters.
                    </li>
                    <li>
                      Sale History lists the all purchase history of the property
                    </li>
                    <li>
                      The amount of Matic/BHB shown at the bottom is the current asking price for the property.
                      If the owner is not accepting tokens as payment, The BHB amount will be greyed out
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col">
                  <img className="mt-2.5 brightness-110 transform" src="forsale.png" />
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
          <AccordionDetails className="border border-1 rounded-md">
            <div className="lg:grid grid-cols-2 divide-x-0 lg:divide-x gap-5">
              <div className="lg:col-span-1">
                <ul className="divide-y divide-gray-200">
                  <li className="pb-4">
                    <h3 className="text-2xl font-semibold text-yellow-200">Property Owner Actions</h3>
                    <p className="text-white text-xl xl3:text-xl italic mt-4">Collect Rent</p>
                    <p className="mt-2 text-gray-400">
                      Property owners can easily manage each of their properties and collect rent from the Property Management Panel.
                    </p>
                    <p className="mt-2 text-gray-400">
                      Any uncollected rent will accumulate and can be withdrawn at the owner's convenience. Rent is paid in MATIC tokens.
                    </p>
                    <p className="mt-2 text-gray-400">
                      Owned properties are automatically listed as available to rent for potential tenants.
                    </p>
                    <p className="mt-2 text-gray-400">
                      Each property has three rooms available for tenants to rent.
                    </p>

                    <p className="text-white text-xl xl3:text-xl italic mt-4">Set Rent Price</p>
                    <p className="mt-2 text-gray-400">
                      Property owners have control over their rental properties and can set the rent price up to the value of 500 Matic.
                      The state of the market will determine the demand for properties and the rent price that can be set.
                    </p>

                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Set Required Depsoit</p>
                    <p className="mt-2 text-gray-400">
                      Renter deposits are held by the platform not the property owner to prevent an owner potentially evicting a tenant with an agenda of taking a tenant's deposit.
                    </p>
                    <p className="mt-2 text-gray-400">
                      An owner may choose to set a higher deposit however if they feel need to deter potential bad tenants.
                    </p>

                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Track Late Rent Payments</p>
                    <p className="mt-2 text-gray-400">
                      To help owners stay on top of their tenants, any address with late rent payment will flag up in yellow. Renters are expected to pay rent daily.
                    </p>

                    <p className="text-white text-xl xl3:text-xl italic mt-4">Evict Tenants</p>
                    <p className="mt-2 text-gray-400">
                      Owners can evict a tenant if the tenant consistently fails to pay rent. It is ultimately down to the owner's discretion to decide whether to evict a tenant or not.
                    </p>
                  </li>

                  <li className="pb-4">
                    <h3 className="text-2xl mt-3 font-semibold text-yellow-200 ">Selling a Property</h3>
                    <p className="text-white text-base xl3:text-xl  italic mt-4">Listing Fee</p>


                    <p className="text-white text-base xl3:text-xl  italic mt-4">Payment Options</p>
                    <p className="mt-2 text-gray-400">
                      Properties can be sold for MATIC or BHB tokens as payment. Mixed payments are not allowed. Note if you allow BHB tokens as a payment option, a Matic price is still required.
                      {/* Properties cannot be sold for less than their original price when being sold for MATIC tokens. */}
                    </p>
                    SELLING CANT BE LESS THAN ORIGINAL PRICE
                    <p className="text-white text-base xl3:text-xl  italic mt-4">Withdraw Sale</p>
                    <p className="mt-2 text-gray-400">
                      A property for sale can be withdrawn from the market by the owner at any time. Listing fee not refunded.
                    </p>

                    <p className="mt-2 text-gray-400">
                      <span className="text-red-600">Warning</span> - Directly transferring your NFT property to another user from your wallet will not transfer ownership of the property on the Blockhouse Bay platform;
                      this will result in the buyer not being able to participate on the Blockhouse Bay platform.
                    </p>
                  </li>

                  <li className="py-4">
                    <div className="flex">
                      <h3 className="text-2xl font-semibold text-yellow-200 mt-1.5 pr-2">Sharing Your Property on </h3>
                      <img src="logo-white.png" className='w-6 h-6 mt-3' alt="X" />
                    </div>

                    <p className="mt-2 text-gray-400">
                      Whether you're looking for renters or buyers, you can share your property on X with the click of a button.
                    </p>
                    <p className="mt-2 text-gray-400">
                      The Post button will open X with a template for you to customize including a link to your property.
                    </p>
                    <p className="mt-2 text-gray-400">
                      There are two checkboxes which if checked will add additional sale and rent information to the tweet.
                    </p>
                  </li>
                </ul>

              </div>
              <div className="lg:grid grid-cols-2">
                <div className="flex flex-col mt-12 gap-4 pl-4 xl:pr-8">
                  <p className="text-xl italic text-white">Property Sale Panel</p>
                  <div className="">
                    <Pagination
                      postsPerPage={1}
                      totalPosts={3}
                      paginate={paginate}
                      currentPage={currentImageNum}
                      isImages={true}
                    />
                  </div>
                  {currentImageNum === 1 &&
                    <p>The image shows an example of the panel property owners use to manage their properties. One of these panels will be available for each property owned</p>
                  }
                  {currentImageNum === 2 &&
                    <p>The image shows a property the owner is currently selling</p>
                  }
                  {currentImageNum === 3 &&
                    <div>
                      <p className="mb-2">The image shows an example of a X post</p>
                      <p>A property for sale or to rent will of course require advertising and promoting as it would in the real world!</p>
                    </div>
                  }
                  {ownedImageSrc !== "./X.png" ? (
                    <div>
                      <p className=" text-white italic mb-2">Information Displayed</p>
                      <ul className="list-disc list-inside xl:pr-6 space-y-4 ml-4">
                        <li>
                          The public address of the property owner
                        </li>
                        <li>
                          The rent price that renters are expected to pay.
                        </li>

                        <li>
                          Total Income Generated is the accumulated total Matic the property has generated from renters.
                        </li>
                        <li>
                          The number of rooms rented is how many people are currently renting from this property
                        </li>
                        <li>
                          Tenants are the public addresses of users currently renting from the property (Tenants shown in in yellow are late with their rent payments)
                        </li>
                        <li>
                          Sale History lists the all purchase history of the property
                        </li>
                        <li>
                          Listing price is the price you are currently selling the property for
                        </li>
                        <li>
                          Accumlated rent will be displayed (bottom image) and can be withdrawn into your wallet by using the collect-rent button.
                        </li>
                      </ul>
                    </div>) : (
                    <div>
                      <p className=" text-white italic mb-2">Post Information</p>
                      <ul className="list-disc list-inside xl:pr-6 space-y-4 ml-4">
                        <li>
                          Property name
                        </li>
                        <li>
                          The selling/renting amount if those options are checked in the panel (bottom image). If these are not selected, only the link to your property will be inlcuded in the post.
                        </li>
                        <li>
                          The number of rooms vacant on your property
                        </li>
                        <li>
                          Link to your property
                        </li>
                      </ul>
                      <p className="mt-4">You can of course customise your post in any way you want. This just provides a convenient way to get the necessary inforation into your post.</p>
                    </div>

                  )}
                </div>
                <div>
                  <div className="flex justify-center lg:justify-start">
                    <img className="mt-2 " alt="owner panel" src={ownedImageSrc} />
                  </div>
                  {ownedImageSrc !== './X.png' &&
                    <div>
                      <div className="flex justify-center lg:justify-start">
                        <img src="collectRent.png" className="md:w-3/5 lg:w-full border border-1 mt-6" />
                      </div>
                    </div>}
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
          <AccordionDetails className="border border-1 rounded-md">
            <div className="lg:grid lg:grid-cols-2 divide-x-0 lg:divide-x gap-5">
              <div className="lg:col-span-1 xl:text-lg">


                <h3 className="text-2xl font-semibold text-yellow-200">Renting a Room</h3>
                <p className="text-white text-xl xl3:text-xl italic mt-4">Rental Deposit</p>
                <p className="mt-2 text-gray-400">
                  To rent a room in a property, a deposit of 10 Matic must be made. This is refunded when the renter decides to vacate the room.
                </p>
                <p className="text-white text-xl xl3:text-xl  italic mt-4">Rent Payment Obligation</p>
                <p className="mt-2 text-gray-400">
                  Rent must be paid daily. A renter will be flagged as a late payer to the owner if no payment is made on time. It's down to the property owner's discretion to evict a tenant if they fail to pay rent consistently.
                </p>
                <p className="mt-2 text-gray-400">
                  If a renter is evicted, they will lose their rental deposit.
                </p>
                <p className="text-white text-xl xl3:text-xl  italic mt-4">Restrictions</p>
                <p className=" text-gray-400 mt-2">
                  Properties with at least one available spare room can be rented from the property owner.
                </p>
                <p className="mt-2 text-gray-400">
                  A user can rent only one room on the same property.
                </p>
                <p className="mt-2 text-gray-400">
                  A user cannot rent a room on a property they own.
                </p>
                <p className="mt-2 text-gray-400">
                  A total of 4 deposits can be made at any one time for an inidival wallet address and so a maximum of 4 properties can be rented at any one time.
                </p>



                <h3 className="text-2xl font-semibold text-yellow-200 my-4">Token Rewards</h3>
                <p className="text-white text-xl xl3:text-xl italic mt-4">Earning BHB Tokens</p>
                <p className="mt-2 text-gray-400">
                  Each time a renter pays rent to the property owner, they are rewarded with BHB tokens which can be used to purchase a property as an alternative to paying in MATIC.
                </p>
                <p className="mt-2 text-gray-400">
                  The higher the rent price paid, the higher the token rewards will be for the tenant.
                </p>
                <p className="mt-2 text-gray-400">

                </p>
                <p className="text-white text-xl xl3:text-xl  italic mt-4">Spending BHB Tokens</p>
                <p className="mt-2 text-gray-400">
                  The initial token price of 2000 BHB works out to be cheaper than buying the property in MATIC. Renting is ideal for those who don't want to fork out up front the MATIC to buy a property and is a cheaper pathway to owning a property.
                </p>
                <p className="mt-2 text-gray-400">

                </p>
                <p className="text-white text-xl xl3:text-xl italic mt-4">Blockhouse Bay Gardens</p>
                <p className="mt-2 text-gray-400">
                  You can also rent from the exclusive Blockhouse Bay Gardens properties. These properties are more expensive to rent but offer tripple token rewards. Note, these properties require the user to holding a minimum of 500 BHB tokens to become a renter.
                </p>
                <p className="mt-2 text-gray-400">
                  If enough BHB tokens are accumulated, you will be able to purchase a property on Blockhouse Bay Gardens - availability permitting.
                </p>
                <p className="text-white text-xl xl3:text-xl italic mb-4 mt-4">Add the BHB token to your wallet</p>
                <AddTokenButton />
                <p className="text-white text-xl xl3:text-xl  italic mt-4">BHB Token Address</p>
                <p className="mt-2 text-gray-400">
                  You can also manually add the BHB token to your wallet by selecting import tokens and paste in the BHB token address:
                </p>
                <p>
                  <span className="text-pink-400 text-xs">
                    {propertytokenaddress}
                  </span>
                  <button className="border px-2 py-0.5 ml-2 border-1 text-xs" onClick={handleCopy}>Copy</button>
                </p>

              </div>


              <div className="col-span-1 lg:grid lg:grid-cols-2">
                <div className="col-span-1">
                  <div className="flex flex-col mt-12 gap-4 pl-4 xl:pr-8">
                    <p className="text-xl italic text-white">Renting Panels</p>
                    <div className="">
                      <Pagination
                        postsPerPage={1}
                        totalPosts={2}
                        paginate={paginate}
                        currentPage={currentImageNum}
                        isImages={true}
                      />
                    </div>
                    {currentImageNum === 1 &&
                      <p>The image shows an example of the panel of a property that is a available to rent</p>
                    }
                    {currentImageNum === 2 &&
                      <p>The image shows an example of a panel that a renter will use</p>
                    }
                    {rentImageSrc === "./toRent.png" ? (
                      <div>
                        <p className=" text-white italic mb-2">Information Displayed</p>
                        <ul className="list-disc list-inside xl:pr-6 space-y-4 ml-4">
                          <li>
                            The public address of the property owner
                          </li>
                          <li>
                            The number of rooms rented is how many people are currently renting from this property
                          </li>
                          <li>
                            The rent price that renters are expected to pay
                          </li>
                          <li>
                            Tenants are the public addresses of users currently renting from the property
                          </li>
                          <li>
                            Sale History lists the all purchase history of the property
                          </li>
                          <li>
                            The deposit is the amount of MATIC required to rent a room
                          </li>
                        </ul>
                      </div>) : (
                      <div>
                        <p className=" text-white italic mb-2">Information Displayed</p>
                        <ul className="list-disc list-inside xl:pr-6 space-y-4 ml-4">
                          <li>The rent status lets a renter know if they are up to date with their rent.</li>
                          <li>Accumlated BHB token amount will show above the property panels and can be redeemed with the Collect-Tokens button</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="col-span-1 mt-2">

                  <div className="flex justify-center lg:justify-start mb-4">
                    <img className="max-w-96 lg:max-w-full" alt="owner panel" src={rentImageSrc} />
                  </div>
                  {rentImageSrc === "./renting.png" &&
                    <div className="flex justify-center lg:justify-start">
                      <img src="collectTokens.png" className="mt-4 border border-1 md:w-3/5 lg:w-full" />
                    </div>
                  }
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
          <AccordionDetails className="border border-1">
            <div className="lg:grid justify-items-center mb-32 lg:mb-20 lg:grid-cols-2 lg:mr-12 lg:gap-16 xl3:gap-32n text-lg ">
              <ul className=" font-normal ">
                <li className="pb-4">
                  <h3 className="text-2xl font-semibold text-green-300">Blockhouse Bay Gardens</h3>
                  <p className="mt-2 text-gray-400">
                    Blockhouse Bay Gardens, a long exclusive street of grand and stunning homes,
                    is a paradise of luxurious living. From impressive architecture to immaculate gardens,
                    each house is a masterpiece of sophistication,
                    offering an unparalleled lifestyle in one of the bay's most beautiful settings. </p>
                </li>
                <li className="py-4">
                  <h3 className="text-xl italic font-normal text-white">Buying</h3>
                  <p className="mt-2 text-gray-400">Properties on Blockhouse Bay Gardens can only be purchased and sold using BHB tokens</p>
                </li>
                <li className="py-4">
                  <h3 className="text-xl italic font-normal text-white">Renting</h3>
                  <p className="mt-2 text-gray-400">Tripple BHB token rewards will be given to renters on this street</p>
                </li>
                <li className="py-4">
                  <h3 className="text-xl italic font-normal text-white">Renting</h3>
                  <p className="mt-2 text-gray-400">A user must be holding a minimum of 500 BHB tokens in order to become a renter on this street</p>
                </li>
                <li className="py-4">
                  <h3 className="text-xl italic font-normal text-white">Ranking</h3>
                  <p className="mt-2 text-gray-400">Once a property on this street has been sold, they will be given a ranking and ordered accordingly based on total income generated from rent and sale history total.</p>
                </li>
              </ul>
              <div className="gallery h-fit pb-16 lg:mt-24 md:pb-40 lg:pb-0 lg:h-full cursor-none lg:mr-12 ml-3.5 mt-8 lg:mt-0 lg:mb-96 mb-24 xs:ml-5 xs2:ml-8 xs2:mb:32 sm:mb-32 sm:ml-24 md:ml-44 md:mb-32">
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
        <Accordion className={classes.root} expanded={expanded === 'fees'} onChange={handleChange('fees')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: iconColor }} />} className={`${classes.summary} ${expanded === 'fees' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
            <div>
              <div>
                <p className={(feesExpanded ? "mr-4 ml-6 font-semibold text-3xl lg:text-4xl border border-2 p-4" : "text-3xl lg:text-4xl xl:ml-8 font-semibold")}>Transactions & Fees</p>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails className="border border-1">
            <div className="lg:grid lg:grid-cols-3 lg:gap-4 lg:text-lg text-lg xl:mb-6">
              <div className="lg:col-span-2 lg:pr-32 xl:text-lg ">
                <ul>
                  <h3 className="text-2xl font-semibold text-yellow-200">Transactions</h3>
                  <p className="mt-2 text-gray-400">The duration for completing a transaction, whether it involves buying, renting, or selling, can fluctuate based on network activity. Once a transaction is validated on the Polygon blockchain, property details will be automatically updated.</p>
                  <p className="text-white text-xl xl3:text-xl italic mt-4">Buying</p>
                  <p className="mt-2 text-gray-400">
                    When buying a property using your BHB tokens, an additional transaction is required to approve the Blockhouse Bay platform to transfer tokens from the buyer to the seller.
                  </p>
                  <p className="text-white text-lg xl3:text-xl italic mt-4">Selling</p>
                  <p className="mt-2 text-gray-400">
                    When selling a property, an additional transaction will occur as the Blockhouse Bay platform requires your approval to sell your property on your behalf.
                  </p>
                  <li className="pb-4">
                    <h3 className="text-2xl mt-2 font-semibold text-yellow-200">Fees</h3>
                    {/* <p className="text-white text-lg xl3:text-xl italic mt-3">Buying</p>
                    <p className="mt-2 text-gray-400">A 5 Matic fee is required when buying a property with BHB tokens.</p> */}
                    <p className="text-white text-lg xl3:text-xl italic mt-4">Selling</p>
                    <p className="mt-2 text-gray-400">
                      Property owners have the option to sell their property to other interested buyers. A listing fee of 12 Matic will incur and 5% of the sale amount will be deducted when a sale is made.
                    </p>
                    <p className="text-white text-lg xl3:text-xl italic mt-4">Renting</p>
                    <p className="mt-2 text-gray-400">
                      A 5% fee will be deducted from the rent amount collected.
                    </p>
                    <p className="text-white text-lg xl3:text-xl italic mt-4">Duration</p>
                    <p className="mt-2 text-gray-400">
                      Transactions are normally pretty quick but occasionally can take a little longer.
                      If nothing happens straight away just give it a little longer and it should go through and update the UI.
                    </p>
                    <p className="text-white text-lg xl3:text-xl italic mt-4">BHB Token Burn</p>
                    <p className="mt-2 text-gray-400">
                      A 1% fee is deducted from the total of any BHB transaction
                      <p className="mt-2 text-gray-400">50% of the fee is sent to the development fund.</p>
                      <p className="mt-2 text-gray-400">50% of the fee is burned (destroyed), reducing the total supply of BHB.</p>
                    </p>
                  </li>
                  <li className="pb-4">
                    <h3 className="text-2xl mt-2 font-semibold text-yellow-200">Decentralization</h3>
                    <p className="mt-2 text-gray-400">
                      The BHB platform itself and owner do NOT have the ability to interact with the platform in non-standard ways with the exception of withdrawaing fees from transactions.
                      This is by design to ensure the platform remains decentralised and secure. 
                      <p className="mt-2 text-gray-400">
                        The platform owner can gift unsold properties to users, but once a property has been sold, the platform owner has no control over the property and full control remains with the current property owner.
                    </p>
                    </p>
                  </li>
                  <li>
                    <h3 className="text-2xl mt-2 font-semibold text-yellow-200">WalletConnect</h3>
                    <p className="mt-2 text-gray-400">
                      Utilizing WalletConnect via Web3Modal, Blockhouse Bay ensures seamless and secure interaction between users' wallets and the blockchain. With this integration, users can easily connect their preferred wallets to access features, make transactions, and engage with the platform's decentralized services, all while maintaining full control and privacy over their digital assets.
                    </p>
                  </li>
                </ul>
              </div>
            </div>
          </AccordionDetails>
        </Accordion>
      </div ></>

  )
}

export default About
