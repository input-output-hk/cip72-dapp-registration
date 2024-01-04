import inquirer from 'inquirer';

const walletAddress = process.env.WALLET_ADDRESS;
const protocolFilePath = process.env.PROTOCOL_FILE_PATH;
const paymentSkeyFilePath = process.env.PAYMENT_SKEY_FILE_PATH;
const net = process.env.NET;

export const networkQuestion = () => {
  const questions = [
    {
      type: 'list',
      name: '_net',
      message: 'Which network do you want to operate on?',
      choices: ['Devnet', 'Preview', 'Preprod', 'Mainnet'],
      default: net ? net.capitalize() : 'Mainnet',
      filter(val) {
        return val.toLowerCase();
      },
    },
  ];
  return inquirer.prompt(questions);
};

export const nodeQuestions = () => {
  const questions = [
    {
      type: 'list',
      name: '_node',
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

export const blockfrostQuestion = () => {
  const questions = [
    {
      name: '_blockfrostApiKey',
      type: 'input',
      message: 'Blockfrost API key?',
    },
  ];
  return inquirer.prompt(questions);
};

export const metadataQuestions = () => {
  const questions = [
    {
      type: 'list',
      name: '_actionType',
      message: 'What action is the certificate asserting?',
      choices: ['REGISTER', 'DE_REGISTER'],
      default: 'REGISTER',
    },
    {
      name: '_comment',
      type: 'input',
      message: 'Comment your change (optional):',
    },
    {
      name: '_metadataUrl',
      type: 'input',
      message: 'What\'s the offchain metadata url?',
    },
  ];
  return inquirer.prompt(questions);
};

export const txQuestions = () => {
  const questions = [
    {
      name: '_walletAddress',
      type: 'input',
      message: 'Wallet address?',
      default: walletAddress,
    },
    {
      name: '_protocolFilePath',
      type: 'input',
      message: 'Protocol file? (ignore if using Blockfrost)',
      default: protocolFilePath,
    },
    {
      name: '_paymentSkeyFilePath',
      type: 'input',
      message: 'Payment skey file?',
      default: paymentSkeyFilePath,
    },
  ];
  return inquirer.prompt(questions);
};
