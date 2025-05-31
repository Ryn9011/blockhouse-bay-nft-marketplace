import React, { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react';
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
import PropertyView from './Pages/property';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { useWeb3ModalProvider } from '@web3modal/ethers/react'
import Modal from '@material-ui/core/Modal';
import { makeStyles } from '@material-ui/core/styles';
import ConnectButton from './Components/Layout/Header/ConnectWallet';
import { use } from 'chai';
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
  rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/q0VzLCMyDnSw-0A2hC_AofLEmPEaQ6y-'
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
  chains: [mainnet],
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
  const [isCheckingProvider, setIsCheckingProvider] = useState(true);

  const [modalEvent, setModalEvent] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [bgImage, setBgImage] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);

  const [isOpen, setIsOpen] = useState(false);


  // walletProvider.on("accountsChanged", (accounts) => {
  //   console.log('ACCOUNTS CHANGED' + accounts[0]);
  // });

  useLayoutEffect(() => {
    if (!location.pathname.includes('property')) {
      setLoadingImage(false)
      
    }
  },[]);


  useEffect(() => {

  
    let timeoutId;

    const setupProvider = async () => {
      if (walletProvider) {
        const browserProvider = new ethers.BrowserProvider(walletProvider);
        const signer = await browserProvider.getSigner();
        setProvider(browserProvider);
        setSigner(signer);
        setIsCheckingProvider(false); // Stop checking once the provider is set
      } else {
        // Wait for up to 1 second before showing the wallet connection message
        timeoutId = setTimeout(() => {
          setIsCheckingProvider(false); // Stop checking if no provider is found
        }, 1000);
      }
    };

    setupProvider();

    return () => clearTimeout(timeoutId); // Cleanup timeout on component unmount
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
        
      } catch {
        
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

  useEffect(() => {
    if (location.pathname.includes('property')) {
      setLoadingImage(true)
      const img = new Image();
        img.src = '../mainbg.jpg'; // The background image URL        
        img.onload = () => {
            setBgImage(img.src); // Store the loaded image source
            setTimeout(() => {setLoadingImage(false);}, 2000);            
        };
    }
  },[]);

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
    <div className="min-h-screen bg-black">
      {loadingImage ? (
        <div className="relative flex justify-center items-center h-screen bg-black">
          <img
            src="../tokengif.gif"
            className="rounded-full h-32 w-32 lg:h-96 lg:w-96 brightness-125"
            alt="Loading"
          />
        </div>
      ) : (
        <ModalContext.Provider value={{ modalEvent, provider, signer }}>
      <div className={` ${location.pathname !== "/" ? 'from-black via-slate-800 to-slate-900 bg-gradient-120' : 'bg-black'}  h-screen flex flex-col overflow-hidden `} style={
        location.pathname.includes('property')
          ? { backgroundImage: `url(${bgImage})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }
          : undefined
      }>
        <div className="flex-1 overflow-y-auto overflow-x-hidden mb-0 lg:mb-0">
          {location.pathname !== "/" && <Header />}
          {isCheckingProvider ? (
            <div className='text-white text-2xl flex justify-center'>
              <div className="pt-6 text-center">
              
              </div>
            </div>
          ) : (provider || location.pathname === "/" || location.pathname === '/about') ? (
            <div>
              <Routes>
                <Route path="/" element={<Cover />} />
                <Route path="/all-properties" element={<AllProperties />} />
                <Route path="/for-sale" element={<ForSale />} />
                <Route path="/to-rent" element={<ToRent />} />
                <Route path="/owned" element={<Owned />} />
                <Route path="/renting" element={<Renting />} />
                <Route path="/blockhouse-bay-gardens" element={<Exclusive />} />
                <Route path="/about" element={<About />} />
                <Route path="/create-item" element={<CreateItem />} />
                <Route path="/property/:propertyId" element={<PropertyView />} />
              </Routes>
            </div>
          ) : (
            <div className='text-white text-2xl flex justify-center'>
              <div className="pt-6 text-center">
                <div>
                  <div className="sm:hidden p-4">
                    <div>
                      <div className='px-8'>
                        <div className="bg-gray-900 rounded-lg p-2 pb-0 shadow-lg">
                          <img src="./../logoplain.png" className="mb-12" alt="Blockhouse Bay" />
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
                    <div className="bg-slate-900 text-black p-8">
                      <div className="bg-indigo-100 p-6 rounded-lg shadow-lg">
                        <div className="from-black via-indigo-900 to-slate-900 bg-gradient-120 rounded-lg p-2 pb-0 shadow-lg">
                          <img src="./../logoplain.png" className="mb-12" alt="Blockhouse Bay" />
                        </div>
                        <section className="mb-4">
                          <h2 className="text-2xl font-semibold mb-4">Wallet Connection Required</h2>
                          <p className='text-lg mb-6'>
                            Utilizing WalletConnect, Blockhouse Bay ensures seamless and secure interaction between users' wallets and the blockchain. With this integration, users can easily connect their preferred wallets to access features, make transactions, and engage with the platform's decentralized services, all while maintaining full control and privacy over their digital assets.
                          </p>
                        </section>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ModalContext.Provider>
      )}
    </div>
  );
}

// Exporting context hook for components to consume
export const useModalContext = () => useContext(ModalContext);

export default App;


