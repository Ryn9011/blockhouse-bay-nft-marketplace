import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import ConnectButton from './Components/Layout/Header/ConnectWallet';
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
import { ThemeProvider, createTheme, makeStyles } from '@material-ui/core/styles';
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { useWeb3ModalProvider, useWeb3ModalAccount, useWeb3ModalState } from '@web3modal/ethers/react'
import { use } from 'chai';
const ethers = require("ethers");

// Create a context for modal events
const ModalContext = createContext();

const projectId = '0053ae8eae8522b1ebb313ede5106c9f'

const mainnet = {
  chainId: 80001,
  name: 'Mumbai',
  currency: 'MATIC',
  explorerUrl: 'https://mumbai.polygonscan.com/',
  rpcUrl: 'https://polygon-mumbai.g.alchemy.com/v2/xCHCSCf75J6c2TykwIO0yWgac0yJlgRL'
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
  },

})

window.ethereum.on('accountsChanged', function (accounts) {                 
  window.location.reload();
});


function App() {
  const location = useLocation();
  const { walletProvider } = useWeb3ModalProvider();

  const [modalEvent, setModalEvent] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);

  useEffect(() => {
    const setupProvider = async () => {
      if (walletProvider) {
        const provider = new ethers.BrowserProvider(walletProvider);
        const signer = await provider.getSigner();
        setProvider(provider);
        setSigner(signer);
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
        if (event.data.properties.connected === false) {
          setProvider(null);
      }
      console.log(event)
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <ModalContext.Provider value={{ modalEvent, provider, signer }}>
      <div className={` ${location.pathname !== "/" ? 'from-black via-black to-polygon-purple bg-gradient-120' : 'bg-black'}  h-screen flex flex-col overflow-hidden`}>
        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <Header />
          {provider != null ? <div>  <Routes>
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
                <p>Connect your wallet using the WalletConnect Modal to use Blockhouse Bay</p>
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


