function getRpcUrl(network, projectId) {
  let rpcUrl;

  if (network === 'mumbai') {
    rpcUrl = `https://polygon-mumbai.g.alchemy.com/v2/${projectId}`;
  } else if (network === 'mainnet') {
    rpcUrl = `https://polygon-mainnet.g.alchemy.com/v2/${projectId}`;
  } else {
    rpcUrl = 'http://localhost:8545';
  }

  return rpcUrl;
}

module.exports = {
  getRpcUrl
}