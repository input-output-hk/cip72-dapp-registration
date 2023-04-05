#!/usr/bin/env node

import dotenv from 'dotenv';
import inquirer from "inquirer";
import chalk from "chalk";
import figlet from "figlet";
// import fs from "fs";
// import shelljs from "shelljs";
import _ from "lodash";

import { generateJson, calculateRootHash, generateMetadataJsonFile } from "./jsonGenerator.js"
import { submitCip } from "./submitCip26.js";
import { queryUTXO, createDraftTransaction, calculateTransactionFee, buildRealTransaction, signdRealTransaction, submitTransaction } from "./submitTransaction.js";

dotenv.config();

const walletAddress = process.env.WALLET_ADDRESS;
const publicKey = process.env.PUBLIC_KEY;
const secretKey = process.env.SECRET_KEY;

const cipFilePath = process.env.CIP_FILE_PATH;
const cipJsonFilePath = process.env.CIP_JSON_FILE_PATH;
const metadataFilePath = process.env.METADATA_FILE_PATH;
const protocolFilePath = process.env.PROTOCOL_FILE_PATH
const cipServerUrl = process.env.CIP_SERVER_URL;
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
    // {
    //   name: "_cipFilePath",
    //   type: "input",
    //   message: "CIP-26 json output file name?",
    //   default: cipFilePath
    // },
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
      choices: ["REGISTER", "UPDATE"],
      default: "REGISTER"
    },
    {
      name: "_releaseNumber",
      type: "input",
      message: "What's the release number?",
      default: '0.0.1'
    },
    {
      name: "_releaseName",
      type: "input",
      message: "What's the release name?",
      default: 'My first release'
    },
    // {
    //   type: 'list',
    //   name: '_offChainStorage',
    //   message: 'Where are you storing offchain metadata?',
    //   choices: ["CIP-26", "IPFS", "GITHUB", "BITBUCKET"],
    //   default: "GITHUB"
    // },
    {
      name: "_offChainStoragePath",
      type: "input",
      message: "What's the offchain metadata store path?",
    },
  ];
  return inquirer.prompt(questions);
};

const askQuestions3 = () => {
  const questions = [
    {
      name: "_cipServerUrl",
      type: "input",
      message: "What's the CIP-26 server url?",
      default: cipServerUrl
    },
  ];
  return inquirer.prompt(questions);
};

const askQuestions4 = () => {
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
    // console.log("NET:", _net)

    // console.log(chalk.black.bgYellowBright.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    // console.log(chalk.black.bgYellowBright.bold(_.pad("CIP-26 json file generation..", PAD_END_SIZE)));
    // console.log(chalk.black.bgYellowBright.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    // const answers1 = await askQuestions1();
    // const { _cipYmlFilePath, _secretKey, _publicKey, _cipFilePath } = answers1;
    // const { subject, cip26FilePath } = generateJson(_cipYmlFilePath, _secretKey, _publicKey, _cipFilePath);
    // console.log(chalk.black.bgYellowBright.bold(_.pad(`SUBJECT: ${subject}`, PAD_END_SIZE)))
    // console.log(chalk.black.bgYellowBright.bold(_.pad(`Done! CIP-26 json file created: ${cip26FilePath}`, PAD_END_SIZE)))


    // ask questions2: Metadata.json generation
    console.log();
    console.log(chalk.yellowBright.bgBlue.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    console.log(chalk.yellowBright.bgBlue.bold(_.pad("Metadata.json generation", PAD_END_SIZE)));
    console.log(chalk.yellowBright.bgBlue.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    const answers1 = await askQuestions1();
    const { _cipJsonFilePath, _secretKey, _publicKey } = answers1
    const answers2 = await askQuestions2();
    const { _metadataFilePath, _actionType, _releaseNumber, _releaseName, _offChainStoragePath } = answers2;
    const _rootHash = calculateRootHash(_cipJsonFilePath)
    console.log(chalk.yellowBright.bgBlue.bold(_.pad(`Calculated rootHash: ${_rootHash}`, PAD_END_SIZE)))
    const out2 = generateMetadataJsonFile(_cipJsonFilePath, _metadataFilePath, _actionType, _releaseNumber, _releaseName, _offChainStoragePath, _rootHash, _secretKey, _publicKey)
    if (out2 === true) console.log(chalk.yellowBright.bgBlue.bold(_.pad(`Metadata.json generated: ${_metadataFilePath}`, PAD_END_SIZE)))

    // ask questions3: CIP-26 server phase
    // console.log();
    // console.log(chalk.black.bgCyanBright.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    // console.log(chalk.black.bgCyanBright.bold(_.pad("CIP-26 server submission", PAD_END_SIZE)));
    // console.log(chalk.black.bgCyanBright.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    // const answers3 = await askQuestions3();
    // const { _cipServerUrl } = answers3;
    // const cipSubm = await submitCip(_cipServerUrl, _cipFilePath);
    // if (typeof cipSubm === 'string' && cipSubm === 'Created')
    //   console.log(chalk.black.bgCyanBright.bold(_.pad(`- ${_cipFilePath} successfully submitted!`, PAD_END_SIZE)))


    // ask questions4: on-chain submission
    console.log();
    console.log(chalk.black.bgGreenBright.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    console.log(chalk.black.bgGreenBright.bold(_.pad("Block-chain submission", PAD_END_SIZE)));
    console.log(chalk.black.bgGreenBright.bold(_.padEnd('-', PAD_END_SIZE, '-')))
    const answers4 = await askQuestions4();
    const { _walletAddress, _protocolFilePath, _paymentSkeyFilePath } = answers4;
    const { TxHash, TxIx, Amount } = await queryUTXO(_walletAddress, _net);

    console.log();
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- TxHash: ${TxHash}`, PAD_END_SIZE)))
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- TxIx: ${TxIx}`, PAD_END_SIZE)))
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
    console.log(chalk.black.bgGreenBright.bold(_.padEnd(`- Transaction submitted!`, PAD_END_SIZE)))


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