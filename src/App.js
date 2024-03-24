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
import { ThemeProvider, createMuiTheme, makeStyles } from '@material-ui/core/styles';


import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'

const projectId = '0053ae8eae8522b1ebb313ede5106c9f'

// 2. Set chains
const mainnet = {
  chainId: 1,
  name: 'Ethereum',
  currency: 'ETH',
  explorerUrl: 'https://etherscan.io',
  rpcUrl: 'https://cloudflare-eth.com'
}

// 3. Create a metadata object
const metadata = {
  name: 'My Website',
  description: 'My Website description',
  url: 'https://mywebsite.com', // origin must match your domain & subdomain
  icons: ['https://avatars.mywebsite.com/']
}
const theme = createMuiTheme();
const useStyles = makeStyles((theme) => {
  root: {
    // some CSS that accesses the theme
  }
});
// 4. Create Ethers config
const ethersConfig = defaultConfig({
  /*Required*/
  metadata,

  /*Optional*/
  enableEIP6963: true, // true by default
  enableInjected: true, // true by default
  enableCoinbase: true, // true by default
  rpcUrl: '...', // used for the Coinbase SDK
  defaultChainId: 1, // used for the Coinbase SDK
})

// 5. Create a Web3Modal instance
createWeb3Modal({
  ethersConfig,
  chains: [mainnet],
  projectId,
  enableAnalytics: true // Optional - defaults to your Cloud configuration
})



function App() {
  const location = useLocation();
  return (
    <div className={` ${location.pathname !== "/" ? 'from-black via-black to-polygon-purple bg-gradient-120' : 'bg-black'}  h-screen flex flex-col overflow-hidden`}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        
          <Header />
          <Routes>
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
          </Routes>        
 
      </div>
      {/* {location.pathname === "/about" &&
        <Footer />
      } */}
    </div>
  );
}

export default App;