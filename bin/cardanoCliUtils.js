import { exec } from 'child_process';
import { rimraf } from 'rimraf';

const getNet = (net) => {
  let selectedNet = '';
  switch (net) {
    case 'devnet':
      selectedNet = '--testnet-magic=9';
      break;
    case 'preprod':
      selectedNet = '--testnet-magic=1';
      break;
    case 'preview':
      selectedNet = '--testnet-magic=2';
      break;
    case 'main':
    case 'mainnet':
      selectedNet = '--mainnet';
      break;
    default:
      console.log(
        'Wrong network! Allowed values: devnet, preview, preprod, mainnet',
        net,
      );
      break;
  }
  return selectedNet;
};

const queryUTxOUsingCardanoCli = async (walletAddress, net = 'preview') => new Promise((resolve, reject) => {
  exec(
    `cardano-cli query utxo \
        --address ${walletAddress} \
        ${getNet(net)}`,
    (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      const match = stdout.match(/([a-z0-9]{64}) *(\d) *(\d+)/);
      // console.log(">stdout:", stdout, _match)
      if (match === null) {
        resolve({ txHash: 0, txIx: 0, amount: 0 });
      } else {
        const txHash = match[1];
        const txIx = parseInt(match[2], 10);
        const amount = parseInt(match[3], 10);

        resolve({ txHash, txIx, amount });
      }
    },
  );
});

const createDraftTransaction = (
  walletAddress,
  metadataFilePath,
  txHash,
  txIx,
) => new Promise((resolve, reject) => {
  const cmd = `cardano-cli transaction build-raw \
                    --tx-in ${txHash}#${txIx} \
                    --tx-out ${walletAddress}+0 \
                    --metadata-json-file ${metadataFilePath} \
                    --fee 0 \
                    --out-file tx.draft`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      reject(error.message);
    } else if (stderr) {
      reject(stderr);
    }
    resolve(true);
  });
});

// TODO: This method currently returns fixed amount of fee for blockfrost.
// It can be improved by calculating the fee based on the transaction size,
// but it is out of scope for now as mainnet is not being used at this moment.
const calculateTransactionFee = (
  protocolFilePath,
  amount,
  blockfrostApiKey,
  net = 'preview',
) => {
  if (blockfrostApiKey) {
    const fee = 500000;
    const finalAmount = amount - fee;
    return { fee, finalAmount };
  }
  return new Promise((resolve, reject) => {
    const cmd = `cardano-cli transaction calculate-min-fee \
                      --tx-body-file tx.draft \
                      --tx-in-count 1 \
                      --tx-out-count 1 \
                      --witness-count 1 \
                      --byron-witness-count 0 \
                      ${getNet(net)} \
                      --protocol-params-file ${protocolFilePath}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
      } else if (stderr) {
        reject(stderr);
      }

      const match = stdout.match(/(\d+) Lovelace/);
      const fee = parseInt(match[1], 10);
      const finalAmount = amount - fee;

      resolve({ fee, finalAmount });
    });
  });
};

const buildRealTransaction = (
  walletAddress,
  metadataFilePath,
  txHash,
  txIx,
  fee,
  finalAmount,
) => new Promise((resolve, reject) => {
  const cmd = `cardano-cli transaction build-raw \
                    --tx-in ${txHash}#${txIx} \
                    --tx-out ${walletAddress}+${finalAmount} \
                    --metadata-json-file ${metadataFilePath} \
                    --fee ${fee} \
                    --out-file tx.draft`;
  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      reject(error.message);
    } else if (stderr) {
      reject(stderr);
    }

    resolve(true);
  });
});

const signedRealTransaction = (paymentSkeyFilePath, net = 'preview') => new Promise((resolve, reject) => {
  exec(
    `cardano-cli transaction sign \
        --tx-body-file tx.draft \
        --signing-key-file ${paymentSkeyFilePath} \
        ${getNet(net)} \
        --out-file tx.signed`,
    (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
      } else if (stderr) {
        reject(stderr);
      }

      resolve(true);
    },
  );
});

const submitTransactionUsingCardanoCli = async (net = 'preview') => new Promise((resolve, reject) => {
  exec(
    `cardano-cli transaction submit --tx-file tx.signed ${getNet(net)}`,
    (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
      } else if (stderr) {
        reject(stderr);
      }
      resolve(true);
    },
  );
});

const getSignedTxTransactionId = () => new Promise((resolve, reject) => {
  exec(
    'cardano-cli transaction txid --tx-file tx.signed',
    (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
      } else if (stderr) {
        reject(stderr);
      }
      resolve(stdout);
    },
  );
});

const cleanupTransactionFiles = () => rimraf(['tx.draft', 'tx.signed']);

export {
  queryUTxOUsingCardanoCli,
  createDraftTransaction,
  calculateTransactionFee,
  buildRealTransaction,
  signedRealTransaction,
  submitTransactionUsingCardanoCli,
  cleanupTransactionFiles,
  getSignedTxTransactionId,
};
