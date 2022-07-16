const HDWalletProvider = require('@truffle/hdwallet-provider');
//var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = "tooth ability popular daughter valve sea step bus manage type concert mountain";

module.exports = {
  networks: {
    develop:{
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",
      accounts: 50,
      defaultEtherBalance: 100
    },
    // development: {
    //   provider: function() {
    //     return new HDWalletProvider(
    //       mnemonic,
    //       "http://localhost:8545",
    //       0,
    //       50,
    //     );
    //   },
    //   network_id: '*',
    // }
  },
  compilers: {
    solc: {
      version: "^0.8.14"
    }
  }
};