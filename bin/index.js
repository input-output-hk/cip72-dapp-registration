#!/usr/bin/env node

import chalk from 'chalk';
import figlet from 'figlet';

import { fetchAndParseMetadata, generateMetadataJsonFile } from './jsonGenerator.js';
import {
  createDraftTransaction,
  calculateTransactionFee,
  buildRealTransaction,
  signRealTransaction,
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
import { getValidationResultUrl } from './network.js';
import { blockfrostApiKey as blockfrostKey } from './config.js';

const METADATA_FILE_PATH = 'metadata.json';
let blockfrostApiKey = blockfrostKey;

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
  const { net } = await askNetworkQuestion();

  if (node === 'blockfrost') {
    if (!blockfrostApiKey) {
      drawInfo(chalk.yellowBright.bgBlue.bold, 'Blockfrost API key is missing!');
      const { blockfrostApiKey: blockfrostAnswer } = await askBlockfrostQuestion();
      blockfrostApiKey = blockfrostAnswer;
    }
    validateBlockfrostKey(net, blockfrostApiKey);
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

  await signRealTransaction(paymentSkeyFilePath, net);
  drawInfo(chalk.black.bgGreenBright.bold, '- Transaction signed!');

  drawInfo(chalk.black.bgGreenBright.bold, 'Submitting transaction...');

  await submitTransaction(net, blockfrostApiKey);
  const txId = await getSignedTxTransactionId();
  drawInfo(chalk.black.bgGreenBright.bold, '- Transaction submitted!');
  drawInfo(chalk.black.bgGreenBright.bold, `- Transaction ID: ${txId}`);

  drawInfo(chalk.black.bgGreenBright.bold, 'Cleaning up transaction files...');
  await cleanupTransactionFiles();
  drawInfo(chalk.black.bgGreenBright.bold, 'Done!');

  const validationResultUrl = getValidationResultUrl({ net, txId });
  drawInfo(
    chalk.black.bgGreenBright.bold,
    `You can view validation result of your registration at ${validationResultUrl}`,
  );
} catch (error) {
  console.error('ERROR:', error);
  drawError(error);
}
