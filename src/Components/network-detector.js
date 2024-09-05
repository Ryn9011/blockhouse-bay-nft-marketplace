import { useWeb3ModalProvider, useWeb3ModalAccount } from '@web3modal/ethers/react'
import { BrowserProvider, Contract, formatUnits } from 'ethers'

const { ethers } = require('ethers');
const { BigNumber } = require('ethers');



//changed to be hardcoded because detection is unreliable on testnets
function getNetworkName(chainId) {
  console.log(chainId)
  return 'Amoy'
  // if (chainId === 137) {
  //   return 'Mainnet';
  // } else if (chainId === 80001) {
  //   return 'Mumbai';
  // } else {
  //   return 'localhost';
  // }
}

async function detectNetwork(walletProvider) {
  
  if (window.ethereum) {
    const provider = new BrowserProvider(window.ethereum);
    //const provider = new ethers.providers.JsonRpcProvider();
    try {
      //const network = BigNumber.from(await provider.send('eth_chainId', [])).toString();
      const network = await provider.getNetwork();
      const networkName = getNetworkName(network.chainId);
      return networkName;
    } catch (error) {
      console.error(error);
      return 'Error';
    }
  }
}

function getRpcUrl(network, projectId) {
  let rpcUrl;
  
  if (network === 'Mumbai') {
    console.log(network)
    rpcUrl = `https://polygon-mumbai.g.alchemy.com/v2/${projectId}`;
  } else if (network === 'mainnet') {
    rpcUrl = `https://polygon-mainnet.g.alchemy.com/v2/${projectId}`;
  } else {
    rpcUrl = 'http://localhost:8545';
  }
  return 'Amoy';
}

async function checkNetwork() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
      const network = await provider.getNetwork();
      // Chain ID for Polygon mainnet is 137
      if (network.chainId === 137) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error('Error getting network:', error);
    }
  } else {
    console.error('Ethereum provider not found. Please install MetaMask or a compatible browser extension.');
  }
}

export {
  detectNetwork,
  getRpcUrl
};
