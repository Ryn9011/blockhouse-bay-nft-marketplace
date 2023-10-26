const { ethers } = require('ethers');

function getNetworkName(chainId) {
  console.log(chainId)
  if (chainId === 137) {
    return 'Mainnet';
  } else if (chainId === 80001) {
    return 'Mumbai';
  } else {
    return 'localhost';
  }
}

async function detectNetwork() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    try {
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
  return rpcUrl;
}

export {
  detectNetwork,
  getRpcUrl
};
