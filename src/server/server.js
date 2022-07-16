import FlightSuretyApp from '../../build/contracts/FlightSuretyApp.json';
import FlightSuretyData from '../../build/contracts/FlightSuretyData.json';
import Config from './config.json';
import Web3 from 'web3';
import express from 'express';


let config = Config['localhost'];
let web3 = new Web3(new Web3.providers.WebsocketProvider(config.url.replace('http', 'ws')));
web3.eth.defaultAccount = web3.eth.accounts[0];
let flightSuretyApp = new web3.eth.Contract(FlightSuretyApp.abi, config.appAddress);
let flightSuretyData = new web3.eth.Contract(FlightSuretyData.abi, config.dataAddress);

const ORACLES_COUNT = 20;
const ORACLES_ACCOUNT_OFFSET = 20; // Accounts 0 to 8 are reserved for owner, airlines and passengers
let oracles = [];

// Status codes
const STATUS_CODE_UNKNOWN = 0;
const STATUS_CODE_ON_TIME = 10;
const STATUS_CODE_LATE_AIRLINE = 20;
const STATUS_CODE_LATE_WEATHER = 30;
const STATUS_CODE_LATE_TECHNICAL = 40;
const STATUS_CODE_LATE_OTHER = 50;

const STATUS_CODES = [
  STATUS_CODE_UNKNOWN,
  STATUS_CODE_ON_TIME,
  STATUS_CODE_LATE_AIRLINE,
  STATUS_CODE_LATE_WEATHER,
  STATUS_CODE_LATE_TECHNICAL,
  STATUS_CODE_LATE_OTHER
];

function getRandomStatusCode() {
  return STATUS_CODES[Math.floor(Math.random() * STATUS_CODES.length)];
}


let accounts;
let owner

// Get accounts
web3.eth.getAccounts((error, fetchedAccounts) => {
  if (error) {
    console.lof(error);
  } else {
    accounts = fetchedAccounts;
    owner = accounts[0];
  }
});

// Authorize FlightSurety app to call FlightSurety data contract
flightSuretyData.methods.authorizeCaller(config.appAddress).send({ from: owner }, (error, result) => {
  if (error) {
    console.log(error);
  }
  else {
    console.log(`Configured authorized caller: ${config.appAddress}`);
  }
});

// Register Oracles and persist them in the oracles array
for (let i = 0; i < + ORACLES_ACCOUNT_OFFSET + ORACLES_COUNT; i++) {
  let oracle = accounts[i + ORACLES_ACCOUNT_OFFSET];
  flightSuretyApp.methods.registerOracle().send({ from: oracle, value: web3.utils.toWei('10', 'ether') }, (error, result) => {
    if (error) {
      console.log(error);
    }
    else {
      flightSuretyApp.methods.getMyIndexes().call({ from: accounts[a] }, (error, result) => {
        if (error) {
          console.log(error);
        }
        else {
          let oracle = { address: accounts[a], index: result };
          console.log(`Oracle: ${JSON.stringify(oracle)}`);
          oracles.push(oracle);
        }
      });
    }
  });
}


flightSuretyApp.events.OracleRequest({
  fromBlock: 0
}, function (error, event) {
  if (error) {
    console.log(error);
  }
  else {
    let index = event.returnValues.index;
    let airline = event.returnValues.airline;
    let flight = event.returnValues.flight;
    let timestamp = event.returnValues.timestamp;
    let statusCode = getRandomStatusCode();

    for (let a = 0; a < oracles.length; a++) {
      if (oracles[a].index.includes(index)) {
        flightSuretyApp.methods.submitOracleResponse(index, airline, flight, timestamp, statusCode).send({ from: oracles[a].address }, (error, result) => {
          if (error) {
            console.log(error);
          }
          else {
            console.log(`${JSON.stringify(oracles[a])}: Status code ${statusCode}`);
          }
        });
      }
    }
  }
});

const app = express();
app.get('/api', (req, res) => {
  res.send({
    message: 'An API for use with your Dapp!'
  })
});

export default app;
