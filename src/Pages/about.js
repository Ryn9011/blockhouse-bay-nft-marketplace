import React, { useEffect, useMemo, useState, useRef } from "react";
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import { makeStyles } from '@material-ui/core/styles';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Modal from '@material-ui/core/Modal';
import { Typography } from '@material-ui/core';
import { useLocation } from 'react-router-dom';
import Pagination from '../utility/Pagination.js'
import "../style.scss";
import Display from "../Components/display";
import { propertytokenaddress } from '../config/config.js'
import { Add } from "@material-ui/icons";
import AddTokenButton from "../Components/AddTokenButton";
import ArticleIcon from '@mui/icons-material/Article';
import copyImg from '../copy.svg';
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

if (window.ethereum) {
  window.ethereum.on('accountsChanged', function (accounts) {
    window.location.reload();
  });
}

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
  const imgSrcs = ["./ownedSelling.png", "./ownedLate.png", "./toRent.png", "./renting.png", "./X.png"];
  const [ownedImageSrc, setOwnedImageSrc] = useState(imgSrcs[0])
  const [rentImageSrc, setRentImageSrc] = useState(imgSrcs[3])

  const [isOpen, setIsOpen] = useState(false);

  const iconColor = "grey"

  useMemo(() => {
    // console.log(currentImageNum, ' ', ownedImageSrc)

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
    // console.log(section)
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
      <div className="px-4 xl3:mx-64 mb-44 lg:mb-12">
        <Accordion className={classes.root} expanded={expanded === 'default'} onChange={handleChange('default')}>

          <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: iconColor }} />} className={`${classes.summary} ${expanded === 'default' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
            <div>
              <p className={(defaultExpanded ? "mr-4 ml-6 items-start font-semibold text-2xl md:text-3xl lg:text-4xl border border-2 p-2 md:p-4" : "text-3xl lg:text-4xl xl:ml-8 font-semibold text-left")}>About</p>
            </div>
          </AccordionSummary>

          <AccordionDetails className="border border-1 rounded-md" style={{ paddingRight: "0px" }}>

            <div className="xl:grid grid-cols-2 gap-11 ">
              <div className="col-span-1 pr-[16px]">
                <ul className="divide-y divide-gray-200 lg:ml-0  text-lg">
                  <li className="py-4 pt-0 lg:pb-0">
                    <h3 className="text-2xl font-semibold text-yellow-200 lg:mt-0">Welcome to Blockhouse Bay</h3>
                    <div className="xl:hidden lg:border border-1 rounded-md border-white flex justify-center">
                      <img src="livingroom1.png" className="mt-4" alt="buy/sell/rent" />
                    </div>
                    <div className="text-white md:text-xl xl3:text-xl italic mt-3 flex justify-start items-center">
                      <div>What is BlockHouse Bay?</div>
                      <span className="scale-75 md:scale-90 border border-1 hover:cursor-pointer rounded-sm bg-blue-700 hover:bg-blue-600 border-blue-700 p-[5px] pt-[0.5px] ml-1 md:ml-3" onClick={handleModalOpen}>
                        <ArticleIcon className="brightness-150 hover:cursor-pointer" />
                      </span>
                      <a href="https://x.com/BlockhouseBayio" target="new"><img src="logo-white.png" className='w-10 h-9 ml-0 p-1 scale-90 md:scale-100 md:ml-4' alt="https://x.com/BlockhouseBayio" /></a>
                      <a href="https://discord.gg/Kdjwws5x" target="new"><img src="discordicon.png" className='w-10 h-10 ml-0 p-1 rounded-md scale-90 md:scale-100 md:ml-4' alt="https://discord.gg/Kdjwws5x" /></a>
                    </div>
                    <p className="mt-0 text-gray-400 pl-2 mr-4 mt-1">
                      Let’s address the big question right away: Is Blockhouse Bay a scam? No, it isn’t. But we’re also not going to pretend it’s some groundbreaking, world-changing project. We’re a small team from New Zealand
                      <span className="inline-block align-middle"><img src="nz.png" className="h-6 w-7 mr-1 ml-2" /></span> with realistic goals, focused on delivering a creative and fun platform to build our token
                    </p>


                    <p className="mt-2 text-gray-400 pl-2 mr-4">We get it - traditional presales can feel inherently scammy. Many projects ask for money upfront in exchange for tokens, often without delivering real value. That’s why we’re taking a different approach. Instead of selling tokens before the platform is proven, we’re giving you the chance to <em>earn</em> tokens by participating in our Web3 real estate simulation. This way, you gain value while exploring what the platform has to offer, rather than taking a leap of faith.</p>

                    <p className="mt-2 text-gray-400 pl-2 mr-4">The ultimate goal of Blockhouse Bay is to build real value in the BHB token and the Blockhouse Bay brand, creating a foundation for even bigger opportunities in the future. By focusing on transparency, engagement, and meaningful participation, we’re working to grow a platform that rewards users while paving the way for long-term growth.</p>

                    <p className="mt-2 text-gray-400 pl-2 mr-4">Read on to learn more about how you can get involved and be part of the journey!</p>

                    {/* <p className="mt-2 text-gray-400 pl-2 mr-4">
                      
                    </p> */}

                    <Modal
                      open={isOpen}
                      onClose={handleModalClose}
                      aria-labelledby="modal-title"
                      aria-describedby="modal-description"
                    >
                      <div className={`${classes.paper} rounded-lg`} >
                        {/* <img src="logoplain.png" className=" mb-12" alt="blockhouse bay" /> */}


                        <div className="bg-slate-900 text-black md:p-8 p-0">
                          <div className="bg-white p-2 md:p-6 rounded-lg shadow-lg">
                            <div className="from-black via-slate-800 to-slate-900 bg-gradient-120 rounded-lg p-2 pb-0 shadow-lg">
                              <img src="logoplain.png" className="mb-12" alt="Blockhouse Bay" />
                            </div>

                            <section className="mb-8 text-sm md:text-base">
                              <h2 className="text-2xl font-semibold mb-4">White Paper</h2>
                              <p>
                                Blockhouse Bay is a decentralized application (dApp) built on the Polygon blockchain, offering users an immersive virtual real estate market experience. Leveraging unique ERC721 tokens, users can buy, sell, and rent properties within the Blockhouse Bay ecosystem. This white paper outlines the platform's core features, tokenomics, and future goals.
                              </p>
                            </section>

                            <section className="mb-8 text-sm md:text-base text-sm">
                              <h2 className="text-2xl font-semibold mb-4">Project Overview</h2>
                              <p>
                                Blockhouse Bay is a virtual real estate platform where each property is represented by an ERC721 token, ensuring each asset is unique and non-fungible. These NFTs grant users full ownership and control over their digital properties.
                              </p>
                              <p>
                                The platform features a total of 550 properties: 500 standard properties and 50 exclusive properties, all pre-minted and securely stored on Arweave, a blockchain-based data storage solution.
                                Why only 550? It needs to be to build a sustainable economy, but high turnover of owners and renters will ensure many people get to play and earn.
                              </p>
                              <p>
                                Through its gamified approach, Blockhouse Bay engages users by combining a virtual real estate market with tangible rewards, making the token acquisition process dynamic and rewarding. Early adopters and active participants benefit the most.
                              </p>
                            </section>

                            <section className="mb-8 text-sm md:text-base">
                              <h2 className="text-2xl font-semibold mb-4">Platform Advantages</h2>
                              <p>
                                Blockhouse Bay benefits from the Polygon blockchain's scalability, efficiency, and low transaction fees, making it an attractive option for users interested in virtual real estate without high costs. The use of Arweave for permanent and decentralized storage ensures that property data and images are secure and tamper-proof.
                              </p>
                              <p>
                                The platform’s unique gameplay mechanics and token rewards create an interactive environment, encouraging user engagement while providing tangible benefits for participation.
                              </p>
                              <div className="flex justify-start items-center mt-2">
                                <p className="text:base font-semibold md:text-xl xl3:text-xl italic mr-2 ml-0 pt-0.5">Polygon & Arweave</p>
                                <div className="flex w-1/6">
                                  <img className="h-8 w-8.5 mr-2 mt-1" src="./polygonsmall.png" />
                                  <img className="h-8 mt-1 w-8.5" src="./arweave.png" />
                                </div>
                              </div>
                              <ul className="list-disc list-inside">
                                <li >

                                  Blockhouse Bay operates on the Polygon blockchain, allowing for minimal transaction fees.

                                </li>
                                <li>

                                  All property NFT images are stored on Arweave's decentralized permanent storage, meaning they are truly persisted.

                                </li>

                              </ul>
                            </section>

                            <section className="mb-8 text-sm md:text-base">
                              <h2 className="text-2xl font-semibold mb-4">Property Transactions</h2>
                              <p>
                                Property transactions on Blockhouse Bay are designed to be transparent and straightforward. Property prices are set by the current owner, eliminating the need for negotiations:
                              </p>
                              <ul className="list-disc list-inside">
                                <li>
                                  When a property is listed for sale, the corresponding NFT is transferred to the Blockhouse Bay market smart contract.
                                </li>
                                <li>If the sale is canceled, the NFT is returned to the owner.</li>
                                <li>A listing fee is required to list a property for sale.</li>
                                <li>A 5% deduction applies to successful sales.</li>
                              </ul>
                            </section>

                            <section className="mb-8 text-sm md:text-base">
                              <h2 className="text-2xl font-semibold mb-4">Rental System and Rewards</h2>
                              <p>
                                The platform supports property rentals, with rent payments made in POL, the native cryptocurrency of the Polygon network. Renters are rewarded with BHB tokens for paying their rent, which can be used within the platform to buy, sell, or rent properties. The system is designed to encourage active participation while maintaining fairness through a progressive taxation model and a dynamic reward mechanism.
                              </p>

                              <h3 className="text-xl font-medium mt-6 mb-4">Rent Tax Mechanic</h3>
                              <p className="mb-4">
                                When rent is paid in Blockhouse Bay, a tax is applied to the payment <strong>before it reaches the property owner</strong>. This tax is based on the rent amount and increases progressively to discourage price gouging:
                              </p>
                              <ul className="list-disc list-inside">
                                <li>
                                  <strong>Base Tax:</strong> All rent payments start with a flat tax of <strong>5%</strong>.
                                </li>
                                <li>
                                  <strong>Progressive Tax:</strong> For every <strong>5 POL</strong> the rent price exceeds <strong>10 POL</strong>, the tax increases by <strong>1%</strong>.
                                </li>
                                <li>
                                  <strong>Tax Cap:</strong> The tax is capped at <strong>60%</strong> of the total rent, regardless of how high the rent is set.
                                </li>
                              </ul>
                              <p className="mt-4">
                                This means that while property owners always earn more when charging higher rent, their effective earnings are reduced proportionally by tax. Below are some example tax rates:
                              </p>
                              <ul className="list-disc list-inside mt-2 mb-4">
                                <li>Rent of 10 POL = 5% tax</li>
                                <li>Rent of 30 POL = 9% tax</li>
                                <li>Rent of 60 POL = 15% tax</li>
                                <li>Rent of 100 POL = 23% tax</li>
                                <li>Rent of 250 POL = 53% tax</li>
                                <li>Rent of 500 POL = 60% tax (capped)</li>
                              </ul>

                              <p>
                                This taxation structure promotes balance and discourages exploitative strategies, such as renting from your own properties to farm rewards.
                              </p>

                              <h3 className="text-xl font-medium mt-6 mb-4">Token Rewards</h3>
                              <p>
                                Renters are rewarded with BHB tokens when they pay rent. The number of tokens received is determined by the rent amount and the remaining BHB supply. Rewards scale with higher rents but decrease over time as the token supply diminishes.
                              </p>
                              <p className="mb-4">
                                The final BHB reward is calculated in two steps:
                              </p>
                              <ul className="list-disc list-inside">
                                <li>
                                  <strong>Base Reward:</strong> A percentage of the rent becomes the base reward. This percentage increases with higher rent tiers.
                                </li>
                                <li>
                                  <strong>Supply Adjustment:</strong> The base reward is then scaled based on how much BHB supply remains. As supply decreases, rewards diminish proportionally.
                                </li>
                              </ul>
                              <p className="mt-4 mb-2">
                                <span className="font-bold">Final Reward Formula:</span><br />
                                <code>Final Reward = Rent × Scaling Rate × (Current Supply ÷ Initial Supply)</code>
                              </p>
                              <p className="mb-2">
                                📊 <strong>Reward Scaling Tiers:</strong>
                              </p>
                              <ul className="list-disc list-inside">
                                <li>10 – 49.99 POL: 0.30%</li>
                                <li>50 – 59.99 POL: 0.35%</li>
                                <li>60 – 89.99 POL: 0.40%</li>
                                <li>90 – 399.99 POL: 0.50%</li>
                                <li>400 – 500 POL: 0.60%</li>
                              </ul>
                              <p className="mt-4">
                                This system ensures that renters who contribute more receive larger rewards, but the declining supply limits long-term farming potential and promotes early participation.
                              </p>
                              <p>
                                BHB tokens can be used to purchase exclusive properties, participate in platform governance or future integrations, and trade within the ecosystem — enhancing their utility and player engagement.
                              </p>
                            </section>



                            <section className="mb-8 text-sm md:text-base">
                              <h2 className="text-2xl font-semibold mb-4">Tokenomics</h2>
                              <p>
                                <strong>Total Supply:</strong> 100,000,000 BHB tokens were minted at the project's inception.
                              </p>
                              <p>
                                <strong>Distribution:</strong> 100% of the BHB tokens are available to users; none are reserved by Blockhouse Bay in the sense they are locked into the platform an cannot be manipulated by the team.
                              </p>
                              <p>
                                <strong>Transaction Fees:</strong> A 0.001% fee applies to all BHB transactions, ensuring a sustainable ecosystem.
                              </p>
                            </section>

                            <section className="mb-8 text-sm md:text-base">
                              <h2 className="text-2xl font-semibold mb-4">Community Building and Engagement</h2>
                              <p>
                                Blockhouse Bay prioritizes community involvement by fostering user engagement through events, forums, and social channels. Community members can shape the future of the platform, with governance mechanisms planned to give users a voice in decision-making processes.
                              </p>
                            </section>

                            {/* <section className="mb-8 text-sm md:text-base">
                              <h2 className="text-2xl font-semibold mb-4">Future Goals for BHB Token</h2>

                              <h3 className="text-xl font-medium mt-6 mb-4">
                                Integration with Decentralized Finance (DeFi) Protocols
                              </h3>
                              <p>
                                - Partnering with platforms like <strong>Aave</strong> on Polygon for lending/borrowing.
                              </p>
                              <p>
                                - Establishing liquidity pools on <strong>QuickSwap</strong> or <strong>UniSwap</strong> to enhance market access and provide returns to token holders.
                              </p>

                              <h3 className="text-xl font-medium mt-6 mb-4">Cross-Platform Integration</h3>
                              <p>
                                Collaborating with other virtual worlds, gaming platforms, or NFT marketplaces to extend the utility of BHB tokens beyond Blockhouse Bay.
                              </p>
                            </section> */}

                            <section className="mb-8 text-sm md:text-base">
                              <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
                              <p>
                                Blockhouse Bay offers a virtual real estate platform on the Polygon blockchain, allowing users to buy, sell, and rent digital properties using NFTs. Participation involves risks, including market volatility and fluctuations in cryptocurrency prices, especially POL and BHB tokens.
                              </p>
                              <p>
                                Users are advised to conduct thorough research and exercise caution before engaging in transactions. The platform does not guarantee the value, authenticity, or future marketability of the digital properties or tokens. Features and tokenomics may change, and users should stay informed about the platform's updates.
                              </p>
                              <p>
                                Blockhouse Bay does not provide financial advice. Users should seek independent financial guidance as needed. Participation in the platform's activities is at the user's own risk.
                              </p>
                            </section>

                            <section className="mb-8 text-sm md:text-base">
                              <h2 className="text-2xl font-semibold mb-4">Conclusion</h2>
                              <p>
                                Blockhouse Bay is a gamified real estate simulation that serves as both an engaging platform and an innovative presale mechanism. Built on the Polygon blockchain, it allows users to earn and use BHB tokens through interactive gameplay, making the token acquisition process more dynamic and rewarding.
                              </p>
                              <p>
                                Through its unique approach, Blockhouse Bay fosters participation by combining the fun of a virtual real estate game with tangible rewards. By integrating POL and BHB tokens, the platform creates a self-contained economy where early adopters and active participants benefit the most.
                              </p>
                              <p>
                                The roadmap outlines a clear progression from platform launch and presale activities to community building and future integration with DeFi protocols. These integrations will unlock further opportunities for BHB holders, such as earning interest or participating in liquidity pools, enhancing both token utility and ecosystem liquidity.
                              </p>
                              <p>
                                Blockhouse Bay offers an accessible and enjoyable entry point into Web3, blending gaming, blockchain technology, and tokenomics. Whether you’re here to earn tokens, explore virtual real estate, or engage with a thriving community, Blockhouse Bay is your chance to experience the exciting possibilities of decentralized platforms.
                              </p>
                            </section>

                          </div>
                        </div>

                        <div className="text-yellow-400 flex justify-center">
                          <button className="border border-1 border-yellow-400 rounded py-1.5 px-4 mt-4" onClick={handleModalClose}>Close</button>
                        </div>
                        <div className="flex justify-center items-center mt-4 text-sm italic">
                          <p className="mr-1"></p>
                          <div className="flex items-center">
                            <a href="mailto:bhbteam@blockhousebay.io" className="text-yellow-100 underline">bhbteam@blockhousebay.io</a>
                          </div>
                          {/* <img src={"favicon.ico"} className="h-10 w-10 ml-2" alt="React logo" /> */}
                        </div>
                        <div className="text-sm italic flex justify-center">
                          Copyright &copy; {new Date().getFullYear()}
                        </div>

                      </div>
                    </Modal>
                    <p className="text-white text-xl xl3:text-xl italic mr-2 pt-0.5 mt-3">Purpose</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      The Blockhouse Bay project brings Web3 real estate to life by offering a platform where users
                      can buy, sell, and rent properties using POL and BHB tokens. Through an innovative approach to token distribution,
                      users can earn BHB tokens by participating in a real estate simulation rather than simply purchasing them, fostering
                      engagement and value. Long-term, the project aims to integrate DeFi features,
                      enabling BHB holders to earn interest and use tokens in a liquidity pool, strengthening both user opportunities and
                      the platform’s ecosystem.
                    </p>
                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Landlord, Tenant or Both!</p>
                    <p className="mt-2 mb-3.5 lg:mb-0 text-gray-400 pl-2 mr-4">
                      As a landlord, you'll enjoy the satisfaction of earning real money from your renters in the form of POL tokens. As a renter, You'll have the chance to receive exclusive Blockhouse Bay tokens (BHB) every time rent is paid. These tokens open up exciting possibilities and provide a cost-effective way to purchase properties.
                    </p>

                  </li>
                  {/* <li className="pt-2 pb-4">
                    <h3 className="text-2xl font-semibold text-yellow-200 ">Passive Income</h3>
                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Earn POL and BHB Tokens</p>
                    <p className="mt-1 text-gray-400 pl-2 mr-4">
                      As a landlord, you'll enjoy the satisfaction of earning real money from your renters in the form of POL tokens. As a renter, You'll have the chance to receive exclusive Blockhouse Bay tokens (BHB) every time rent is paid. These tokens open up exciting possibilities and provide a cost-effective way to purchase properties.
                    </p>
                  </li> */}
                </ul>
              </div>

              {/* <div className="col-span-1 xl3:hidden mt-2 mr-4 bg-right-top bg-contain brightness-110 bg-no-repeat" style={{ backgroundImage: "url('insidereduced.png')", height: "400px%" }}
              ></div> */}

              <div className="hidden lg:block col-span-1 border border-1 rounded-md border-gray-500  mt-2 mr-4 bg-right-top bg-cover bg-no-repeat" style={{ backgroundImage: "url('livingroom1.png')", height: "400px%" }}
              ></div>

            </div>
          </AccordionDetails>
        </Accordion>

        <Accordion className={classes.root} expanded={expanded === 'roadmap'} onChange={handleChange('roadmap')}>

          <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: iconColor }} />} className={`${classes.summary} ${expanded === 'default' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
            <div>
              <p className={(defaultExpanded ? "mr-4 ml-6 items-start font-semibold text-2xl md:text-3xl lg:text-4xl border border-2 p-2 md:p-4" : "text-3xl lg:text-4xl xl:ml-8 font-semibold text-left")}>Roadmap</p>
            </div>
          </AccordionSummary>

          <AccordionDetails className="border border-1 rounded-md" style={{ paddingRight: "0px" }}>

            <div className="xl:grid grid-cols-2 gap-11 ">
              <div className="col-span-1 pr-[16px] lg:pr-0">
                <ul className="divide-y divide-gray-200 lg:ml-0  text-lg">
                  <li className="py-4 pt-0">
                    <h3 className="text-2xl font-semibold text-yellow-200 lg:mt-0">Roadmap Goals</h3>
                    <div className="xl:hidden flex justify-center">
                      <img src="exc2.png" className="mt-4" alt="buy/sell/rent" />
                    </div>

                    <p className="text-white text-xl xl3:text-xl italic mt-4">Platform Launch</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Launch the Blockhouse Bay platform and introduce users to the world of Web3 real estate. The platform will be fully functional, allowing users to buy, sell, and rent properties using POL and BHB tokens.
                    </p>

                    <p className="text-white text-xl xl3:text-xl italic mt-4">Early Adopter Giveaway & Marketing Campaign</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">This is where Blockhouse Bay differs from the rest.</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Instead of just asking you to buy our tokens, we're giving you the opportunity to earn them and make money along the way through playing the Blockhouse Bay Web3 real estate simulation.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      A limited number of early adopters will be rewarded with a free Blockhouse Bay property of their choice from the properties available. This initiative allows the platform to demonstrate its ability to create value without requiring anyone to make a property purchase upfront.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">The revenue collected from the platform will be used to expand.</p>

                    <p className="text-white text-xl xl3:text-xl italic mt-4">List BHB on Exchanges</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      We would love to have BHB listed on several tier 1 exchanges, but we will start with a few smaller exchanges to get the ball rolling ASAP.
                    </p>

                    <p className="text-white text-xl xl3:text-xl italic mt-4">Community Building</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Building a thriving community is at the heart of our mission. We're dedicated to creating an engaged, collaborative space where users shape the future of our platform together. Through events, forums, and social channels, we’ll grow a network that empowers and rewards active participation in the Blockhouse Bay platform.
                    </p>

                    <p className="text-white text-xl xl3:text-xl italic mt-4">Beyond the Roadmap: A Transparent Approach</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Unlike many projects that overpromise and underdeliver, we’re not here to hype Blockhouse Bay into something it isn’t. There’s no grand, unrealistic vision of a "metaverse empire" or billion-dollar ecosystem.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Our long-term goal is simple: build the brand, strengthen the token, and let the platform’s value grow organically.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Rather than making empty promises or quick cash grabs, we’re committed to letting Blockhouse Bay evolve naturally based on community interest and real adoption.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      If we reach a point where scaling makes sense, we’ll do it the right way—by reinvesting into the platform, not by selling you a dream.
                    </p>
                  </li>

                </ul>
              </div>

              <div className="col-span-1 border border-1 rounded-md border-gray-500 mt-2 mr-4 brightness-110 bg-no-repeat bg-cover" style={{ backgroundImage: "url('exc2.png')" }}
              ></div>

              {/* <div className="col-span-1 hidden xl3:block mt-2 mr-4 bg-right-top bg-cover bg-no-repeat" style={{ backgroundImage: "url('livingroom1.png')", height: "400px%" }}
              ></div> */}

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
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      There are a total of 500 standard properties and 50 exclusive properties available for purchase. Each property is represented by a pre-minted non-fungible token (NFT).
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Initally all properties are owned by BlockHouse Bay and will show the platform's address as as the owner. As properties are sold, the ownership will be transferred to the buyer.
                    </p>
                    <p className="text-white text-xl xl3:text-xl italic mt-4">Payment Options</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Properties can be bought by paying the asking price in POL or BHB tokens.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">BHB tokens can be acquired by becoming a tenant in a property owned by another user. Tenants are rewarded with tokens when they pay rent and the higher the rent price, the more tokens are rewarded</p>
                    <p className="mt-2 text-gray-400 italic font-semibold pl-2">Note - If there is not the option to pay with BHB tokens, is is because the seller has chosen to only accept POL</p>
                    <p className="text-white text-xl xl3:text-xl italic mt-4">Generating Income</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Becoming a property owner can earn income in two ways: Passivly when tenants pay rent and by selling the property for a profit. As more properties are sold, inflation will come into play and properties will become more valable
                    </p>
                    <p className="text-white text-xl xl3:text-xl italic mt-4">Property Resale</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Property owners have the option to resell their property for either POL or BHB tokens.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Properties can be sold with existing tennants which will transfer over to the new property owner with the sale.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      If you purchase a property on which you are currently renting, your deposit will be refunded to you.
                    </p>
                    <p className="text-white text-xl xl3:text-xl italic mt-4">Sale History</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      The purchase history will scroll accross the panel displaying all purchase prices and dates of the property.
                    </p>
                  </li>
                  {/* <li className="pb-4 pt-2">
                    <h3 className="text-2xl font-semibold text-yellow-200 ">BHB Tokens</h3>
                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Trading</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      I would like the BHB token to
                    </p>
                  </li> */}
                </ul>
              </div>

              <div className="lg:grid grid-cols-2 content-center">
                <div className="flex flex-col mt-12 md:mt-0 gap-4">
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
                      Total Income Generated is the accumulated total POL the property has generated from renters.
                    </li>
                    <li>
                      Sale History lists the all purchase history of the property
                    </li>
                    <li>
                      The amount of POL/BHB shown at the bottom is the current asking price for the property.
                      If the owner is not accepting tokens as payment, The BHB amount will be greyed out
                    </li>
                  </ul>
                </div>

                <div className="flex justify-center mb-2">
                  <img className="mt-2.5 brightness-110 transform max-w-[400px] max-h-[1000px]" src="forsale.png" />
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
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Rent will be automatically paid into your wallet when a tenant makes a payment in the form of POL tokens.
                    </p>
                    <p className="text-white text-xl xl3:text-xl italic mt-4">Set Rent Price</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Property owners have control over their rental properties and can set the rent price up to the value of 50 POL.
                      The state of the market will determine the demand for properties and the rent price that can be set.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Note - after purchasing a property, the rent price will be reset to the minimum value and cannot be changed for 14 days after the sale.
                    </p>

                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Set Required Depsoit</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Renter deposits are held by the platform not the property owner to prevent an owner potentially evicting a tenant with an agenda of taking a tenant's deposit.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      An owner may choose to set a higher deposit however, if they feel need to deter potential bad tenants.
                    </p>

                    <p className="text-white text-xl xl3:text-xl  italic mt-4">Track Late Rent Payments</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      To help owners stay on top of their tenants, any address with late rent payment will flag up in yellow. Renters are expected to pay rent daily.
                    </p>

                    <p className="text-white text-xl xl3:text-xl italic mt-4">Evict Tenants</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Owners can evict a tenant if the tenant consistently fails to pay rent. It is ultimately down to the owner's discretion to decide whether to evict a tenant or not; they may feel generous and let the tenant stay a while longer, even if they're behind on rent.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Note: This feature is designed to be lighthearted and primarily serves to ensure that properties aren’t occupied indefinitely by players who forget to vacate after earning enough BHB tokens and deciding not to continue renting.
                    </p>
                  </li>

                  <li className="pb-4">
                    <h3 className="text-2xl mt-3 font-semibold text-yellow-200 ">Selling a Property</h3>
                    <p className="text-white text-base xl3:text-xl  italic mt-4">Listing Fee</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      A listing fee is required to list a property for sale.
                    </p>

                    <p className="text-white text-base xl3:text-xl  italic mt-4">Selling Price</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Set the POL prive for your property to whatever you want, provided it not be less than the original price of the property.
                    </p>

                    <p className="text-white text-base xl3:text-xl  italic mt-4">Payment Options</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Properties can be sold for POL or BHB tokens (Mixed payments are not allowed). Note if you allow BHB tokens as a payment option, a POL price is still required.
                      {/* Properties cannot be sold for less than their original price when being sold for POL tokens. */}
                    </p>
                    <p className="text-white text-base xl3:text-xl  italic mt-4">Withdraw Sale</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      A property for sale can be withdrawn from the market by the owner at any time. Listing fee not refunded.
                    </p>

                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      <span className="text-red-600">Warning</span> - Directly transferring your NFT property to another user from your wallet will not transfer ownership of the property on the Blockhouse Bay platform;
                      this will result in the buyer not being able to participate on the Blockhouse Bay platform.
                    </p>
                  </li>

                  <li className="pb-4">
                    <div className="flex items-center">
                      <h3 className="text-2xl font-semibold text-yellow-200 mt-3 pr-2">Sharing Your Property on </h3>
                      <img src="logo-white.png" className='w-6 h-6 mt-3' alt="X" />
                    </div>

                    <p className="mt-4 text-gray-400 pl-2 mr-4">
                      Just as in the real world, you need to advertise your property to attract buyers or renters. Blockhouse Bay makes this easy by allowing you to share your property on X with the click of a button.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      The Post button will open X with a template for you to customize including a link to your property.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      There are two checkboxes which if checked will add additional sale and rent information to the tweet.
                    </p>
                  </li>
                </ul>
              </div>
              <div className="lg:grid grid-cols-2">
                <div className="flex mt-12 md:mt-0 flex-col gap-4 pl-4 xl:pr-8">
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
                      <p className="mb-2">The image illustrates an example of a generated X post.</p>
                      <p>A property listed for sale or rent naturally requires advertising and marketing, just as it would in the physical world.</p>
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
                          Total Income Generated is the accumulated total POL the property has generated from renters.
                        </li>
                        <li>
                          The number of rooms rented is how many people are currently renting from this property
                        </li>
                        <li>
                          Tenants are the public addresses of users currently renting from the property (Tenants shown in in <span className="text-yellow-500">yellow</span> are late with their rent payments)
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
                        <li>Property name</li>
                        <li>
                          Selling & Renting Info
                          <ul className="list-disc list-inside mt-2"> {/* Add ml-6 or pl-6 for better indentation */}
                            <li className="ml-6">
                              If selling or renting, check the box to include the relevant information in your post
                              <span><img src='x-check.png' className="h-10 w-44" /></span>
                            </li>

                          </ul>
                        </li>
                        <li>The number of rooms vacant on your property</li>
                        <li>A link to go directly to your property</li>
                      </ul>
                      <p className="mt-4">You can, of course, customize your post however you like. This template simply provides a convenient way to include essential information in your post.</p>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex justify-center md:mt-8 lg:mt-0 lg:justify-end">
                    <img className="mt-2 max-h-[1450px] max-w-[380px]" alt="owner panel" src={ownedImageSrc} />
                  </div>
                  {ownedImageSrc !== './X.png' &&
                    <div>
                      {/* <div className="flex justify-center lg:justify-start">
                        <img src="collectRent.png" className="md:w-3/5 lg:w-full border border-1 mt-6" />
                      </div> */}
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
            <div className="lg:grid lg:grid-cols-2 gap-11 xl:mr-0">
              <div className="lg:col-span-1">




                <h3 className="text-2xl font-semibold text-yellow-200 mb-4">Token Rewards</h3>
                <p className="text-white text-xl xl3:text-xl italic mt-4">Earning BHB Tokens</p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  Each time a renter pays rent to the property owner, they are rewarded with BHB tokens which can be used to purchase a property as an alternative to paying in POL.
                </p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  The higher the rent price paid, the higher the token rewards will be for the tenant.
                </p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">

                </p>
                <p className="text-white text-xl xl3:text-xl  italic mt-4">Spending BHB Tokens</p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  The initial token price of 2000 BHB works out to be cheaper than buying the property in POL. Renting is ideal for those who don't want to fork out up front the POL to buy a property and is a cheaper pathway to owning a property.
                </p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">

                </p>
                <p className="text-white text-xl xl3:text-xl italic mt-4">Blockhouse Bay Gardens</p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  You can also rent from the exclusive Blockhouse Bay Gardens properties. These properties are more expensive to rent but offer tripple token rewards. Note, these properties require the user to holding a minimum of 2500 BHB tokens to become a renter.
                </p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  If enough BHB tokens are accumulated, you will be able to purchase a property on Blockhouse Bay Gardens - availability permitting.
                </p>
                <p className="text-white text-xl xl3:text-xl italic mb-4 mt-4">Add the BHB token to your wallet</p>
                <AddTokenButton />
                <p className="text-white text-xl xl3:text-xl  italic mt-4">BHB Token Address</p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  You can also manually add the BHB token to your wallet by selecting import tokens and paste in the BHB token address:
                </p>
                <div className="flex flex-col md:items-center md:flex-row  mt-2 ml-2">
                  <span className="text-pink-400 text-xs break-all">
                    {propertytokenaddress}
                  </span>
                  {/* <button className="border px-2 py-0.5 ml-2 border-1 text-xs" onClick={handleCopy}>Copy</button> */}
                  <img src={copyImg} className="w-5 h-5 md:ml-2 invert cursor-pointer" onClick={handleCopy} />
                </div>
                <h3 className="text-2xl font-semibold text-yellow-200 mt-8">Renting a Room</h3>
                <p className="text-white text-xl xl3:text-xl italic mt-4">Rental Deposit</p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  To rent a room in a property, a deposit of 10 POL must be made. This is refunded when the renter decides to vacate the room. Note - the property owner can change the deposit required.
                </p>
                <p className="text-white text-xl xl3:text-xl  italic mt-4">Rent Payment Obligation</p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  A renter will be able to make a rent payment every 48 hours.
                </p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  After the 48 hour cooldown period, the renter will be able to make another rent payment. Property owners can see when rent is due and when it has been paid from indivual tenants.
                </p>
                <p className="mt-2 text-gray-400 pl-2 mr-4 pr-4">
                  The property owner has the discretion to evict a tenant for consistently failing to pay rent. Note: This feature is designed to be lighthearted and primarily serves to ensure that properties aren’t occupied indefinitely by players who forget to vacate after earning enough BHB tokens and deciding not to continue renting.
                </p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  If a renter is evicted, they will lose their rental deposit.
                </p>
                <p className="text-white text-xl xl3:text-xl  italic mt-4">Restrictions</p>
                <p className=" text-gray-400 pl-2 mr-4 mt-2">
                  Properties with at least one available spare room can be rented from the property owner.
                </p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  A user can rent only one room on the same property.
                </p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  A user cannot rent a room on a property they own.
                </p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  A total of 4 deposits can be made at any one time for an inidival wallet address and so a maximum of 4 properties can be rented at any one time.
                </p>
                <p className="mt-2 text-gray-400 pl-2 mr-4">
                  Rent price cannot be changed within 14 days of buying a property.
                </p>
              </div>

              <div className="lg:grid grid-cols-2">
                <div className="flex mt-8 lg:mt-0 flex-col gap-4 pl-4 xl:pr-8">
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
                    <p>The image shows an example of the panel renters will use</p>
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
                          The deposit is the amount of POL required to rent a room
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

                <div>
                  <div className="flex justify-center mt-8 lg:mt-2 lg:justify-end">
                    <img className="max-w-[382px] max-h-[1000px]" alt="renter panel" src={rentImageSrc} />
                  </div>
                  {rentImageSrc === "./renting.png" &&
                    <div className="flex justify-center lg:justify-end">
                      <img src="collectTokens.png" className="mt-4 max-w-[382px] max-h-[1000px] border border-1 md:w-3/5 lg:w-full" />
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
            <div className="lg:grid grid-cols-1 justify-items-center mb-16 lg:mb-4 lg:grid-cols-2 lg:mr-12 lg:gap-16 xl3:gap-32n text-lg ">
              <ul className=" font-normal ">

                <li className="pb-4">
                  <h3 className="text-2xl font-semibold text-green-300">Blockhouse Bay Gardens</h3>
                  <p className="mt-2 text-gray-400 pl-2 mr-4">
                    A prestigious collection of ultra-exclusive properties, available only to those with BHB tokens.
                  </p>
                  <p className="mt-2 text-gray-400 pl-2 mr-4">
                    Blockhouse Bay Gardens is the crown jewel of the bay—an elite enclave of grand, luxurious homes.
                    Nestled in the most sought-after location, these properties offer a lifestyle of prestige, wealth, and limitless possibilities.
                    Owning a home here isn’t just about property—it’s about power.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-xl italic font-normal text-white">Buying - Exclusive Access</h3>
                  <p className="mt-2 text-gray-400 pl-2 mr-4">
                    Properties in Blockhouse Bay Gardens can only be bought and sold using BHB tokens, ensuring rarity and exclusivity.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-xl italic font-normal text-white">Renting - Premium Rewards</h3>
                  <p className="mt-2 text-gray-400 pl-2 mr-4">
                    Tenants on this prestigious street receive triple BHB token rewards, making it the most rewarding place to live in Blockhouse Bay.
                  </p>
                  <p className="mt-2 text-gray-400 pl-2 mr-4">
                    A minimum of 2,500 BHB tokens is required to rent in this elite neighborhood, ensuring only the most dedicated members of the community can call it home.
                  </p>
                </li>
                <li className="py-4">
                  <h3 className="text-xl italic text-transparent bg-clip-text brightness-125 bg-gradient-to-r from-purple-400 via-white to-purple-800">Ranking - The Elite List</h3>
                  <p className="mt-2 text-gray-400 pl-2 mr-4">
                    Every property sold in Blockhouse Bay Gardens will be ranked based on total income from rent and sales.
                    The most successful properties rise to the top, solidifying their legacy as the most valuable assets in the bay.
                  </p>
                </li>


              </ul>
              <div className="flex justify-center w-full md:ml-56  lg:ml-0">
                <div className="gallery h-fit pb-16  md:pb-40 lg:pb-0 lg:h-full cursor-none lg:mr-12 mt-8 md:mt-32 lg:mb-96 mb-24 xs:ml-5 xs2:ml-8 xs2:mb:32 sm:mb-32 sm:ml-24 md:ml-8 md:mb-32">
                  <a href="/blockhouse-bay-gardens" className="clipped-border brightness-125">
                    <img src="gallery1.png" id="clipped" />
                  </a>
                  <a href="/blockhouse-bay-gardens" className="clipped-border brightness-125">
                    <img src="gallery2.png" id="clipped" />
                  </a>
                  <a href="/blockhouse-bay-gardens" className="clipped-border brightness-125">
                    <img src="gallery3.png" id="clipped" />
                  </a>
                  <a href="/blockhouse-bay-gardens" className="clipped-border brightness-125">
                    <img src="gallery4.png" id="clipped" />
                  </a>
                  <a href="/blockhouse-bay-gardens" className="clipped-border brightness-125">
                    <img src="gallery5.png" id="clipped" />
                  </a>
                </div>
              </div>

            </div>
          </AccordionDetails>

        </Accordion>
        <Accordion className={classes.root} expanded={expanded === 'fees'} onChange={handleChange('fees')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon style={{ color: iconColor }} />} className={`${classes.summary} ${expanded === 'fees' ? classes.summaryExpanded : 'p-16 text-green-400'}`}>
            <div>
              <div>
                <p className={(feesExpanded ? "mr-4 ml-6 font-semibold text-3xl lg:text-4xl border border-2 p-4" : "text-3xl lg:text-4xl xl:ml-8 font-semibold")}>Transactions | Fees | Security</p>
              </div>
            </div>
          </AccordionSummary>
          <AccordionDetails className="border border-1">
            <div className="lg:grid lg:grid-cols-5 lg:gap-4 lg:text-lg text-lg xl:mb-6 bg-contain">
              <div className=" lg:pr-32 xl:text-lg col-span-3">
                <ul>
                  <h3 className="text-2xl font-semibold text-yellow-200">Transactions</h3>
                  <p className="mt-2 text-gray-400 pl-2 mr-4">The duration for completing a transaction, whether it involves buying, renting, or selling, can fluctuate based on network activity. Once a transaction is validated on the Polygon blockchain, property details will be automatically updated.</p>
                  <p className="text-white text-xl xl3:text-xl italic mt-4">Buying</p>
                  <p className="mt-2 text-gray-400 pl-2 mr-4">
                    When buying a property using your BHB tokens, an additional transaction is required to approve the Blockhouse Bay platform to transfer tokens from the buyer to the seller.
                  </p>
                  <p className="text-white text-lg xl3:text-xl italic mt-4">Selling</p>
                  <p className="mt-2 text-gray-400 pl-2 mr-4">
                    When selling a property, an additional transaction will occur as the Blockhouse Bay platform requires your approval to sell your property on your behalf.
                  </p>
                  <li className="pb-4">
                    <h3 className="text-2xl mt-2 font-semibold text-yellow-200">Fees</h3>
                    {/* <p className="text-white text-lg xl3:text-xl italic mt-3">Buying</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">A 5 POL fee is required when buying a property with BHB tokens.</p> */}
                    <p className="text-white text-lg xl3:text-xl italic mt-4">Selling</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Property owners have the option to sell their property to other interested buyers. A listing fee of 12 POL will incur and 5% of the sale amount will be deducted when a sale is made.
                    </p>
                    <p className="text-white text-lg xl3:text-xl italic mt-4">Rent Tax & Reward Mechanic</p>
                    <div className="text-gray-400">
                      <div className="p-6 pl-0 pt-3 rounded-lg shadow-md max-w-2xl">
                        <p className="text-gray-400 pl-2 mr-4 mb-4">
                          When rent is paid in the game, two mechanics apply: a <span className="font-semibold">tax</span> is deducted from the rent amount before it reaches the property owner, and the renter receives a reward in <span className="font-semibold">BHB tokens</span> based on the rent price and current token supply.
                        </p>

                        <ul className="list-disc list-inside text-gray-400 pl-2 mr-4 mb-4">
                          <li>
                            <span className="font-semibold">Base Tax:</span> All rent payments are subject to a base tax of <span className="font-semibold">5%</span>, deducted from the amount paid.
                          </li>
                          <li>
                            <span className="font-semibold">Progressive Tax:</span> For every <span className="font-semibold">5 POL</span> over <span className="font-semibold">10 POL</span>, an additional <span className="font-semibold">1%</span> tax is added.
                          </li>
                          <li>
                            <span className="font-semibold">Tax Cap:</span> The total tax is capped at <span className="font-semibold">60%</span>. The owner receives the remaining amount after tax.
                          </li>
                          <li>
                            <span className="font-semibold">Reward Tiers:</span> Renters earn BHB tokens based on rent tiers. Higher rents yield higher base rewards.
                          </li>
                          <li>
                            <span className="font-semibold">Diminishing Supply:</span> The actual BHB reward is scaled by remaining token supply. As the total supply decreases, the reward value for renters also decreases proportionally.
                          </li>
                        </ul>

                        <div className="border border-gray-300 p-4 ml-2 rounded-lg shadow-sm mb-4">
                          <h4 className="font-semibold text-gray-400 pl-2 mr-4 mb-2">Examples (Assuming Full Supply):</h4>
                          <ul className="list-disc list-inside text-gray-400 pl-2 mr-4">
                            <li>Rent of 10 POL → <span className="font-semibold">5%</span> tax, eligible for 30 BHB</li>
                            <li>Rent of 30 POL → <span className="font-semibold">9%</span> tax, eligible for 89 BHB</li>
                            <li>Rent of 60 POL → <span className="font-semibold">15%</span> tax, eligible for 239 BHB</li>
                            <li>Rent of 100 POL → <span className="font-semibold">23%</span> tax, eligible for 499 BHB</li>
                            <li>Rent of 250 POL → <span className="font-semibold">53%</span> tax, eligible for 1249 BHB</li>
                            <li>Rent of 500 POL → <span className="font-semibold">60%</span> tax (capped), eligible for 2749 BHB</li>
                          </ul>
                          <p className="text-sm text-gray-500 pl-2 pt-2 italic">
                            Note: Actual rewards will decrease over time as token supply diminishes.
                          </p>
                        </div>

                        <p className="text-gray-400 pl-2 mr-4">
                          This system rewards active participation while discouraging inflated rents. Property owners receive higher payouts with higher rent, but taxes scale accordingly. Renters benefit more when supply is abundant, encouraging early and sustained activity.
                        </p>
                      </div>
                    </div>



                    <p className="text-white text-lg xl3:text-xl italic">Duration</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Transactions can take a few minutes to complete. If a transaction is taking longer than expected, it may be due to network congestion.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      You can navigate away from the page with the pending transaction and track its status from your wallet.
                    </p>
                    <p className="text-white text-lg xl3:text-xl italic mt-4">BHB Token Tx Fee</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      A 0.001% fee is deducted from the total of any BHB transaction.
                      <p className="mt-2 text-gray-400">This goes to the BHB developers.</p>
                    </p>
                  </li>
                  <li className="pb-4">
                    <h3 className="text-2xl mt-2 font-semibold text-yellow-200">Decentralization / Security</h3>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      The BHB platform governs iteslf and cannot be interacted with in non-standard ways by any user or contract. This is by design to ensure the platform remains decentralised and secure. The exception being, the platform owner can withdraw any fees generated by the platform.
                      <p className="mt-2 text-gray-400">
                        What control do the BHB team have over the platform?
                        Just one thing - We can gift a limited amount of unsold properties. (as talked about in the roadmap), but once a property has been sold, full control remains with the current property owner. Regarding the BHB token distribution, the BHB token is a fixed supply token and the team has no ability to mint more tokens or distribute tokens out from the platform - this is key to a fair and decentralized system.
                      </p>
                      {/* <p className="mt-2 text-gray-400">
                        The smart contracts that govern the platform have been audited by a third party to help ensure they are secure and free from vulnerabilities.
                      </p> */}
                      <p className="mt-2 text-gray-400">
                        The platform mechanics are designed so that a user will never have considerable amounts of money tied up in its contracts. This is to help prevent a user from losing a significant amount of value in the event of a bug or exploit.
                      </p>
                    </p>
                  </li>
                  <li className="pb-4">
                    <h3 className="text-2xl mt-2 font-semibold text-yellow-200">WalletConnect</h3>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Utilizing WalletConnect, Blockhouse Bay ensures seamless and secure interaction between users' wallets and the blockchain. With this integration, users can easily connect their preferred wallets to access features, make transactions, and engage with the platform's decentralized services, all while maintaining full control and privacy over their digital assets.
                    </p>
                  </li>
                  <li>
                    <h3 className="text-2xl mt-2 font-semibold text-yellow-200">Troubleshooting</h3>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">The platform has been battle-tested, and the only hiccup you might run into is thinking an account is connected when it’s not.</p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      Pages will automatically reload when they detect a change in the connected account. This helps ensure users always see accurate information and that transactions are made with the correct account.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      However, some browsers e.g. Brave will block the reload functionality by default and so the user will need to refresh the page manually when switching the connected account.
                    </p>
                    <p className="mt-2 text-gray-400 pl-2 mr-4">
                      The add-token button will also be disabled in these browsers and BHB will need to be added manually to you wallet as a custom token.
                    </p>
                  </li>
                </ul>
              </div>
              {/* <div className="p-32  h-5/6 lg:col-span-2">
                <img src='buyingvertical.png' />
              </div> */}
            </div>
          </AccordionDetails>
        </Accordion>
      </div></>
  )
}

export default About
