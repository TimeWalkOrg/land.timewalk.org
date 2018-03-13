const dotenv           = require('dotenv').config()
const HDWalletProvider = require('truffle-hdwallet-provider')


const mnemonic = process.env.ETHEREUM_ACCOUNT_MNEMONIC

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    rinkeby: {
      provider: function() {
        return new HDWalletProvider(mnemonic, `https://rinkeby.infura.io/${process.env.ETHEREUM_INFURA_ACCESS_TOKEN}`);
      },
      network_id: '3',
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");
      },
      network_id: '3',
    },
    test: {
      provider: function() {
        return new HDWalletProvider(mnemonic, "http://127.0.0.1:8545/");
      },
      network_id: '*',
    },
  }

};
