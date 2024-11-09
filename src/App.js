import React, { createContext, useContext, useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import './App.css';
import Header from './Components/Layout/Header';
import Cover from './Components/Layout/Cover';
import Footer from './Components/Layout/Footer';
import ForSale from './Pages/for-sale';
import ToRent from './Pages/to-rent';
import Owned from './Pages/owned';
import Renting from './Pages/renting';
import About from './Pages/about';
import CreateItem from './Pages/create-item';
import AllProperties from './Pages/all-properties';
import Exclusive from './Pages/exclusive-properties';
import PropertyView from './Pages/property-view';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { useWeb3ModalProvider } from '@web3modal/ethers/react'
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import ConnectButton from './Components/Layout/Header/ConnectWallet';
const ethers = require("ethers");

// Create a context for modal events
const ModalContext = createContext();

const projectId = '0053ae8eae8522b1ebb313ede5106c9f'

const localhost = {
  chainId: 80001,
  name: 'Mumbai',
  currency: 'MATIC',
  explorerUrl: 'https://mumbai.polygonscan.com/',
  rpcUrl: 'https://polygon-mumbai.g.alchemy.com/v2/q0VzLCMyDnSw-0A2hC_AofLEmPEaQ6y-'
}

const amoy = {
  chainId: 80002,
  name: 'Amoy',
  currency: 'MATIC',
  explorerUrl: 'https://www.oklink.com/amoy',
  rpcUrl: 'https://polygon-amoy.g.alchemy.com/v2/q0VzLCMyDnSw-0A2hC_AofLEmPEaQ6y-'
}

const mainnet = {
  chainId: 137,
  name: 'Mainnet',
  currency: 'MATIC',
  explorerUrl: 'https://polygonscan.com',
  rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/demo/q0VzLCMyDnSw-0A2hC_AofLEmPEaQ6y-'
}

const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'http://loiooocalhost/3000', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/']
}

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: true,
  rpcUrl: '...',
  defaultChainId: 1,
})

const modal = createWeb3Modal({
  ethersConfig,
  chains: [amoy],
  projectId,
  enableAnalytics: true,
  tokens: {
    80001: {
      address: '0xc0D47EAEB4fE7875EF6e8b39D5b93Cb65A63d54F',
    }
  }
})


function App() {
  const location = useLocation();
  const { walletProvider } = useWeb3ModalProvider();

  const [modalEvent, setModalEvent] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  const [isOpen, setIsOpen] = useState(false);



  // walletProvider.on("accountsChanged", (accounts) => {
  //   console.log('ACCOUNTS CHANGED' + accounts[0]);
  // });

  useEffect(() => {
    const setupProvider = async () => {
      if (walletProvider) {
        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        setProvider(provider);
        setSigner(signer);

        walletProvider.on("accountsChanged", (accounts) => {
          window.location.reload();
        });
      }
    };

    setupProvider();
  }, [walletProvider]);

  useEffect(() => {
    const unsubscribe = modal.subscribeEvents(event => {
      // if (event.data.event === "CONNECT_SUCCESS" ||
      //   event.data.event === "DISCONNECT_SUCCESS" || 
      //   event.data.event === "DISCONNECT_ERROR" ||
      //   event.data.event === "SWITCH_NETWORK") {
      try {
        if (event.data.properties.connected === false) {
          setProvider(null);
        }
        console.log(event)
      } catch {
        console.log('Error')
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleModalOpen = () => {
    setIsOpen(true)
  }

  const handleModalClose = () => {
    setIsOpen(false)
  }

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

  const classes = useStyles();


  return (
    <ModalContext.Provider value={{ modalEvent, provider, signer }}>
      <div className={` ${location.pathname !== "/" ? 'from-black via-black to-polygon-purple bg-gradient-120' : 'bg-black'}  h-screen flex flex-col overflow-hidden`}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          {/* */}
          {location.pathname !== "/" &&
            <Header />
          }
          {(provider != null || location.pathname === "/" || location.pathname === '/how-to-play') ? <div>  <Routes>
            <Route path="/" element={<Cover />} />
            <Route path="/all-properties" element={<AllProperties />} />
            <Route path="/for-sale" element={<ForSale />} />
            <Route path="/to-rent" element={<ToRent />} />
            <Route path="/owned" element={<Owned />} />
            <Route path="/renting" element={<Renting />} />
            <Route path="/blockhouse-bay-gardens" element={<Exclusive />} />
            <Route path="/how-to-play" element={<About />} />
            <Route path="/create-item" element={<CreateItem />} />
            <Route path="/property-view/:propertyId" element={<PropertyView />} />
          </Routes></div> :
            <div className='text-white text-2xl flex justify-center'>
              <div className="pt-6 text-center">

                <div >
                  {/* <img src="logoplain.png" className=" mb-12" alt="blockhouse bay" /> */}


                  <div className=" sm:hidden p-4">
                    <div className="">
                      <div className='px-8'>
                        <div className="bg-gray-900 rounded-lg p-2 pb-0 shadow-lg">
                          <img src="logoplain.png" className="mb-12" alt="Blockhouse Bay" />
                        </div>
                      </div>
                      <section className="mb-4">
                        <p className='text-base mb-4'>
                          A connection to a wallet is required to access the platform's features. Please connect your wallet to continue.
                        </p>
                        <h2 className="text-2xl font-semibold mb-4">Wallet Connection Required</h2>
                        <p className='text-base mb-6 p-2'>
                          Utilizing WalletConnect, Blockhouse Bay ensures seamless and secure interaction between users' wallets and the blockchain. With this integration, users can easily connect their preferred wallets to access features, make transactions, and engage with the platform's decentralized services, all while maintaining full control and privacy over their digital assets.
                        </p>
                        <div className='flex justify-center'>
                          <ConnectButton />
                        </div>
                      </section>
                    </div>
                  </div>
                  <div className={`${classes.paper} hidden sm:block rounded-lg`}>
                    <div className="bg-indigo-950 text-black p-8">
                      <div className="bg-indigo-100 p-6 rounded-lg shadow-lg">
                        <div className="from-black via-indigo-900 to-polygon-purple bg-gradient-120 rounded-lg p-2 pb-0 shadow-lg">
                          <img src="logoplain.png" className="mb-12" alt="Blockhouse Bay" />
                        </div>
                        <section className="mb-4">
                          <h2 className="text-2xl font-semibold mb-4">Wallet Connection Required</h2>
                          <p className='text-lg mb-6'>
                            Utilizing WalletConnect, Blockhouse Bay ensures seamless and secure interaction between users' wallets and the blockchain. With this integration, users can easily connect their preferred wallets to access features, make transactions, and engage with the platform's decentralized services, all while maintaining full control and privacy over their digital assets.
                          </p>
                          <p>
                            
                          </p>
                          {/* <div className='flex justify-center'>
                            <ConnectButton />
                          </div> */}
                        </section>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>}
        </div>
        {/* {location.pathname === "/about" && <Footer />} */}
      </div>
    </ModalContext.Provider>
  );
}

// Exporting context hook for components to consume
export const useModalContext = () => useContext(ModalContext);

export default App;


