import { queryUTxOUsingCardanoCli, submitTransactionUsingCardanoCli } from './cardanoCliUtils.js';
import { queryUTxOviaBlockfrost, submitTransactionViaBlockfrost } from './blockfrostUtils.js';

export const queryUTxO = async (walletAddress, blockfrostApiKey, net = 'preview') => {
  if (blockfrostApiKey) {
    return queryUTxOviaBlockfrost(blockfrostApiKey, walletAddress);
  }
  return queryUTxOUsingCardanoCli(walletAddress, net);
};

export const submitTransaction = async (net = 'preview', blockfrostApiKey = '') => {
  if (blockfrostApiKey) {
    return submitTransactionViaBlockfrost(blockfrostApiKey);
  }
  return submitTransactionUsingCardanoCli(net);
};
