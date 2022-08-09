require("@nomicfoundation/hardhat-toolbox")
require("@nomiclabs/hardhat-ethers")
require('hardhat-deploy') 
require("@nomiclabs/hardhat-waffle")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
// require("./tasks/block-number")
require("hardhat-gas-reporter")
require("solidity-coverage")

const RPC_URL_RINKEBY = process.env.RPC_URL_RINKEBY
const PRIVATE_KEY_RINKEBY = process.env.PRIVATE_KEY_RINKEBY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    defaultNetwork: "hardhat",
    solidity: {
      compilers:[ 
        {version: "0.8.9"},
        {version: "0.6.6"}]
    }, 
    networks: {
        rinkeby: {
            url: RPC_URL_RINKEBY,
            accounts: [PRIVATE_KEY_RINKEBY],
            chainId: 4,
            blockConfirmations: 6 
        },
        localHost: {
            url: "http://127.0.0.1:8545/RPC_URL_RINKEBY",
            chainId: 31337,
        },
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        // coinmarketcap: COINMARKETCAP_API_KEY,
        token: "MATIC",
    },
    namedAccounts: {
      deployer: {
        default: 0,
        4:0 //rinkeby should be addr 0


      }
    }
}
