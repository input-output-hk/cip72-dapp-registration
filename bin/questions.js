import inquirer from 'inquirer';
import { availableNetwork } from './network.js';
import { walletAddress, protocolFilePath, paymentSKeyFilePath, net } from './config.js';

const capitalize = (text) => `${text[0].toUpperCase()}${text.slice(1).toLowerCase()}`;

export const askNetworkQuestion = () => {
  const choices = Object.values(availableNetwork).map(capitalize);
  const defaultNetwork = Object.values(availableNetwork).includes(net)
    ? net
    : availableNetwork.preview;
  const questions = [
    {
      type: 'list',
      name: 'net',
      message: 'Which network do you want to operate on?',
      choices,
      default: capitalize(defaultNetwork),
      filter(val) {
        return val.toLowerCase();
      },
    },
  ];
  return inquirer.prompt(questions);
};

export const askNodeQuestion = () => {
  const questions = [
    {
      type: 'list',
      name: 'node',
      message: 'Which node do you want to use?',
      choices: ['Local', 'Blockfrost'],
      default: 'Local',
      filter(val) {
        return val.toLowerCase();
      },
    },
  ];
  return inquirer.prompt(questions);
};

export const askBlockfrostQuestion = () => {
  const questions = [
    {
      name: 'blockfrostApiKey',
      type: 'input',
      message: 'Blockfrost API key?',
    },
  ];
  return inquirer.prompt(questions);
};

export const askMetadataQuestions = () => {
  const questions = [
    {
      type: 'list',
      name: 'actionType',
      message: 'What action are you about to do?',
      choices: ['REGISTER', 'DE_REGISTER'],
      default: 'REGISTER',
    },
    {
      name: 'comment',
      type: 'input',
      message: 'Comment your change (optional):',
    },
    {
      name: 'metadataUrl',
      type: 'input',
      message: "What's the offchain metadata url?",
    },
  ];
  return inquirer.prompt(questions);
};

export const askTransactionQuestions = () => {
  const questions = [
    {
      name: 'walletAddress',
      type: 'input',
      message: 'Wallet address?',
      default: walletAddress,
    },
    {
      name: 'protocolFilePath',
      type: 'input',
      message: 'Protocol file? (ignore if using Blockfrost)',
      default: protocolFilePath,
    },
    {
      name: 'paymentSkeyFilePath',
      type: 'input',
      message: 'Payment skey file?',
      default: paymentSKeyFilePath,
    },
  ];
  return inquirer.prompt(questions);
};
