#!/usr/bin/env node

import dotenv from 'dotenv';
import chalk from 'chalk';
import figlet from 'figlet';

import { fetchAndParseMetadata, generateMetadataJsonFile } from './jsonGenerator.js';
import {
  createDraftTransaction,
  calculateTransactionFee,
  buildRealTransaction,
  signedRealTransaction,
  cleanupTransactionFiles,
  getSignedTxTransactionId,
} from './cardanoCliUtils.js';
import { validateBlockfrostKey } from './blockfrostUtils.js';
import { queryUTxO, submitTransaction } from './submitTransaction.js';

import {
  askNetworkQuestion,
  askMetadataQuestions,
  askTransactionQuestions,
  askNodeQuestion,
  askBlockfrostQuestion,
} from './questions.js';
import { drawQuestionHeader, drawInfo, drawError } from './cliDrawings.js';

dotenv.config();

const METADATA_FILE_PATH = 'metadata.json';
let blockfrostApiKey = process.env.BLOCKFROST_API_KEY;
let net = process.env.NET;

// eslint-disable-next-line no-extend-native
Object.defineProperty(String.prototype, 'capitalize', {
  value() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  },
  enumerable: false,
});

const init = () => {
  console.info(
    chalk.green(
      figlet.textSync('CIP-72 CLI - Testnet', {
        horizontalLayout: 'default',
        verticalLayout: 'default',
      }),
    ),
  );
};

try {
  init();

  drawQuestionHeader(chalk.black.bgMagenta.bold, 'Choose node');
  const { node } = await askNodeQuestion();

  drawQuestionHeader(chalk.black.bgMagenta.bold, 'Choose network');
  const { net: networkAnswer } = await askNetworkQuestion();
  net = networkAnswer;

  if (node === 'blockfrost') {
    if (!blockfrostApiKey) {
      drawInfo(chalk.yellowBright.bgBlue.bold, 'Blockfrost API key is missing!');
      const { blockfrostApiKey: blockfrostAnswer } = await askBlockfrostQuestion();
      blockfrostApiKey = blockfrostAnswer;
    }
    net = validateBlockfrostKey(net, blockfrostApiKey);
  }

  drawQuestionHeader(chalk.yellowBright.bgBlue.bold, 'Metadata.json generation');
  const { actionType, comment, metadataUrl } = await askMetadataQuestions();
  const { rootHash, metadata } = await fetchAndParseMetadata(metadataUrl);
  drawInfo(chalk.yellowBright.bgBlue.bold, `Calculated rootHash: ${rootHash}`);

  const generatedJsonMetadata = await generateMetadataJsonFile(
    METADATA_FILE_PATH,
    actionType,
    comment,
    metadataUrl,
    rootHash,
    metadata,
  );
  if (generatedJsonMetadata) {
    drawInfo(chalk.yellowBright.bgBlue.bold, `Metadata.json generated: ${METADATA_FILE_PATH}`);
  }

  drawQuestionHeader(chalk.black.bgGreenBright.bold, 'Block-chain submission');

  const { walletAddress, protocolFilePath, paymentSkeyFilePath } = await askTransactionQuestions();

  const { txHash, txIx, amount } = await queryUTxO(walletAddress, blockfrostApiKey, net);

  drawInfo(chalk.black.bgGreenBright.bold, `- Last UTXO TxHash: ${txHash}`);
  drawInfo(chalk.black.bgGreenBright.bold, `- Last UTXO TxIx: ${txIx}`);
  drawInfo(chalk.black.bgGreenBright.bold, `- Last UTXO Amount: ${amount}`);
  drawInfo(chalk.black.bgGreenBright.bold, 'Creating transaction draft...');

  await createDraftTransaction(walletAddress, METADATA_FILE_PATH, txHash, txIx);
  drawInfo(chalk.black.bgGreenBright.bold, '- Transaction draft created!');
  drawInfo(chalk.black.bgGreenBright.bold, 'Calculating transaction fee...');

  const { fee, finalAmount } = await calculateTransactionFee(
    protocolFilePath,
    amount,
    net,
    blockfrostApiKey,
  );
  drawInfo(chalk.black.bgGreenBright.bold, `- Fee: ${fee}`);
  drawInfo(chalk.black.bgGreenBright.bold, `- Final wallet amount: ${finalAmount}`);

  drawInfo(chalk.black.bgGreenBright.bold, 'Building transaction...');
  await buildRealTransaction(walletAddress, METADATA_FILE_PATH, txHash, txIx, fee, finalAmount);
  drawInfo(chalk.black.bgGreenBright.bold, '- Transaction built!');
  drawInfo(chalk.black.bgGreenBright.bold, 'Signing transaction...');

  await signedRealTransaction(paymentSkeyFilePath, net);
  drawInfo(chalk.black.bgGreenBright.bold, '- Transaction signed!');

  drawInfo(chalk.black.bgGreenBright.bold, 'Submitting transaction...');

  await submitTransaction(net, blockfrostApiKey);
  const txId = await getSignedTxTransactionId();
  drawInfo(chalk.black.bgGreenBright.bold, '- Transaction submitted!');
  drawInfo(chalk.black.bgGreenBright.bold, `- Transaction ID: ${txId}`);

  drawInfo(chalk.black.bgGreenBright.bold, 'Cleaning up transaction files...');
  await cleanupTransactionFiles();
  drawInfo(chalk.black.bgGreenBright.bold, 'Done!');
} catch (error) {
  console.error('ERROR:', error);
  drawError(error);
}
