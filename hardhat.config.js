require("@nomiclabs/hardhat-waffle");

const fs = require("fs")
const privateKey = fs.readFileSync(".secret").toString()
const projectId = "xCHCSCf75J6c2TykwIO0yWgac0yJlgRL"

module.exports = {
  networks: {
    hardhat: {
      name: 'localhost',
      chainId: 1337
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${projectId}`,
      accounts: [privateKey]
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
        enabled: true
      }
    }
  },
};
