require("@nomicfoundation/hardhat-chai-matchers");

const fs = require("fs")
const privateKey = fs.readFileSync(".secret").toString()
const projectId = "q0VzLCMyDnSw-0A2hC_AofLEmPEaQ6y-"

module.exports = {
  networks: {
    hardhat: {
      name: 'localhost',
      chainId: 1337
    },
    amoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${projectId}`,
      accounts: [privateKey],
      gas: 2100000,
      gasPrice: 8000000000,
      chainId: 80002
    },
    mainnet: {
      url: `https://polygon-mainnet.g.alchemy.com/v2/${projectId}`,
      accounts: [privateKey]
    }
  },
  solidity: {
    version: '0.8.4',
    settings: {
      //optimizer: {enabled: process.env.DEBUG ? false : true},
      optimizer: {
        runs: 1000,
        enabled: true,
      }
    }
  },
};
