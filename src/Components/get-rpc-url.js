function getRpcUrl(network, projectId) {
  let rpcUrl;

  if (network === 'Mumbai') {
    rpcUrl = `https://polygon-mumbai.g.alchemy.com/v2/${projectId}`;
  } else if (network === 'Mainnet') {
    rpcUrl = `https://polygon-mainnet.g.alchemy.com/v2/${projectId}`;
  } else {
    rpcUrl = 'Amoy';
  }

  return rpcUrl;
}

module.exports = {
  getRpcUrl
}