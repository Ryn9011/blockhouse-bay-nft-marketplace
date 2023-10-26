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
import { EthereumClient, w3mConnectors, w3mProvider } from '@web3modal/ethereum'
import { Web3Modal } from '@web3modal/react'
import { configureChains, createClient, WagmiConfig } from 'wagmi'
import { polygon } from 'wagmi/chains'

const projectId = '0053ae8eae8522b1ebb313ede5106c9f'
const chains = [polygon];

console.log(projectId)

const { provider } = configureChains(chains, [w3mProvider({ projectId })])

const wagmiClient = createClient({
  autoConnect: true,
  connectors: w3mConnectors({ projectId, version: 1, chains }),
  provider
})
const ethereumClient = new EthereumClient(wagmiClient, chains)

function App() {
  const location = useLocation();
  return (
    <div className={` ${location.pathname !== "/" ? 'from-black via-black to-polygon-purple bg-gradient-120' : 'bg-black'}  h-screen flex flex-col overflow-hidden`}>
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <WagmiConfig client={wagmiClient}>
          <Header />
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
            <Route path="/property-view/:propertyId" element={<PropertyView />} />
          </Routes>
        </WagmiConfig>
        <Web3Modal projectId={projectId} ethereumClient={ethereumClient} 
          themeVariables={{
            '--w3m-font-family': 'Roboto, sans-serif'
          }}
        />
      </div>
      {location.pathname === "/about" &&
        <Footer />
      }
    </div>
  );
}

export default App;