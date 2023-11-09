#!/usr/bin/env node

import dotenv from 'dotenv';
import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
import _ from "lodash";

import { calculateRootHash, generateMetadataJsonFile } from "./jsonGenerator.js"
import {
  queryUTXO,
  createDraftTransaction,
  calculateTransactionFee,
  buildRealTransaction,
  signdRealTransaction,
  submitTransaction,
  cleanupTransactionFiles, getSignedTxTransactionId
} from "./submitTransaction.js";

dotenv.config();

const walletAddress = process.env.WALLET_ADDRESS;
const publicKey = process.env.PUBLIC_KEY;
const secretKey = process.env.SECRET_KEY;

const cipJsonFilePath = process.env.CIP_JSON_FILE_PATH;
const metadataFilePath = process.env.METADATA_FILE_PATH;
const protocolFilePath = process.env.PROTOCOL_FILE_PATH;
const paymentSkeyFilePath = process.env.PAYMENT_SKEY_FILE_PATH;
const net = process.env.NET;
const PAD_END_SIZE = 150;

Object.defineProperty(String.prototype, 'capitalize', {
  value: function () {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false
});

const init = () => {
  console.log(
    chalk.green(
      figlet.textSync(`CIP-72 CLI`, {
        // font: "Ghost",
        horizontalLayout: "default",
        verticalLayout: "default"
      })
    )
  );
};

const askQuestions0 = () => {
  const questions = [
    {
      type: 'list',
      name: '_net',
      message: 'Which network do you want to operate on?',
      choices: ["Devnet", "Preview", "Preprod", "Mainnet"],
      default: net ? net.capitalize() : "Mainnet",
      filter(val) {
        return val.toLowerCase();
      },
    },
  ];
  return inquirer.prompt(questions);
};

const askQuestions1 = () => {
  const questions = [
    {
      name: "_publicKey",
      type: "input",
      message: "Public Key?",
      default: publicKey
    },
    {
      name: "_secretKey",
      type: "input",
      message: "Secret Key?",
      default: secretKey
    },
    {
      name: "_cipJsonFilePath",
      type: "input",
      message: "CIP-72 json path/file-name?",
      default: cipJsonFilePath
    },
  ];
  return inquirer.prompt(questions);
};

const askQuestions2 = () => {
  const questions = [
    {
      name: "_metadataFilePath",
      type: "input",
      message: "What's the metadata file name?",
      default: metadataFilePath
    },
    {
      type: 'list',
      name: '_actionType',
      message: 'What action is the certificate asserting?',
      choices: ["REGISTER", "DE_REGISTER"],
      default: "REGISTER"
    },
    {
      name: "_releaseComment",
      type: "input",
      message: "Enter a release comment:",
      default: 'New release'
    },
    {
      name: "_offChainStoragePath",
      type: "input",
      message: "What's the offchain metadata store url?",
    },
  ];
  return inquirer.prompt(questions);
};

const askQuestions3 = () => {
  const questions = [
    {
      name: "_walletAddress",
      type: "input",
      message: "Wallet address?",
      default: walletAddress
    },
    {
      name: "_protocolFilePath",
      type: "input",
      message: "Protocol file?",
      default: protocolFilePath
    },
    {
      name: "_paymentSkeyFilePath",
      type: "input",
      message: "Payment skey file?",
      default: paymentSkeyFilePath
    },

  ];
  return inquirer.prompt(questions);
};


const run = async () => {

  try {
    // show script introduction
    init();

    // ask questions1: CIP-26 json file generation
    console.log(chalk.black.bgMagenta.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    console.log(chalk.black.bgMagenta.bold(_.pad("Choose network", PAD_END_SIZE)));
    console.log(chalk.black.bgMagenta.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    const { _net } = await askQuestions0();

    // ask questions2: Metadata.json generation
    console.log();
    console.log(chalk.yellowBright.bgBlue.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    console.log(chalk.yellowBright.bgBlue.bold(_.pad("Metadata.json generation", PAD_END_SIZE)));
    console.log(chalk.yellowBright.bgBlue.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    const answers1 = await askQuestions1();
    const { _cipJsonFilePath, _secretKey, _publicKey } = answers1
    const answers2 = await askQuestions2();
    const { _metadataFilePath, _actionType, _releaseComment, _offChainStoragePath } = answers2;
    const _rootHash = calculateRootHash(_cipJsonFilePath)
    console.log(chalk.yellowBright.bgBlue.bold(_.pad(`Calculated rootHash: ${_rootHash}`, PAD_END_SIZE)))
    const out2 = generateMetadataJsonFile(_cipJsonFilePath, _metadataFilePath, _actionType, _releaseComment, _offChainStoragePath, _rootHash, _secretKey, _publicKey)
    if (out2 === true) console.log(chalk.yellowBright.bgBlue.bold(_.pad(`Metadata.json generated: ${_metadataFilePath}`, PAD_END_SIZE)))

    // ask questions3: on-chain submission
    console.log();
    console.log(chalk.black.bgGreenBright.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    console.log(chalk.black.bgGreenBright.bold(_.pad("Block-chain submission", PAD_END_SIZE)));
    console.log(chalk.black.bgGreenBright.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    const answers4 = await askQuestions3();
    const { _walletAddress, _protocolFilePath, _paymentSkeyFilePath } = answers4;
    const { TxHash, TxIx, Amount } = await queryUTXO(_walletAddress, _net);

    console.log();
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- Last UTXO TxHash: ${TxHash}`, PAD_END_SIZE)))
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- Last UTXO TxIx: ${TxIx}`, PAD_END_SIZE)))
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- Wallet amount: ${Amount}`, PAD_END_SIZE)))

    console.log();
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`Creating transaction draft...`, PAD_END_SIZE)))
    await createDraftTransaction(_walletAddress, _metadataFilePath, TxHash, TxIx)
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- Transaction draft created!`, PAD_END_SIZE)))

    console.log();
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`Calculating transaction fee...`, PAD_END_SIZE)))
    const { fee, finalAmount } = await calculateTransactionFee(_protocolFilePath, Amount, _net);
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- Fee: ${fee}`, PAD_END_SIZE)))
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- Final wallet ,amount: ${finalAmount}`, PAD_END_SIZE)))

    console.log();
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`Building transaction...`, PAD_END_SIZE)))
    await buildRealTransaction(_walletAddress, _metadataFilePath, TxHash, TxIx, fee, finalAmount);
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- Transaction built!`, PAD_END_SIZE)))

    console.log();
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`Signing transaction...`, PAD_END_SIZE)))
    await signdRealTransaction(_paymentSkeyFilePath, _net)
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- Transaction signed!`, PAD_END_SIZE)))

    console.log();
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`Submitting transaction...`, PAD_END_SIZE)))
    await submitTransaction(_net)
    const txId = await getSignedTxTransactionId(_net)
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- Transaction submitted!`, PAD_END_SIZE)))
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- Transaction ID: ${txId}`, PAD_END_SIZE)))

    console.log();
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`Cleaning up transaction files...`, PAD_END_SIZE)))
    await cleanupTransactionFiles();
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`Done!`, PAD_END_SIZE)))


  } catch (error) {
    console.error("ERROR:", error)
    console.log();
    console.log();
    console.log(chalk.white.bgRed.bold(_.padEnd('!', PAD_END_SIZE, '!')))
    console.log(chalk.white.bgRed.bold(_.pad(error, PAD_END_SIZE)));
    console.log(chalk.white.bgRed.bold(_.padEnd('!', PAD_END_SIZE, '!')))
  }
};

run();
