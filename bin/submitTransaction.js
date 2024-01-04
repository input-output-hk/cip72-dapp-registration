import {
  queryUTxOUsingCardanoCli,
  submitTransactionUsingCardanoCli,
} from './cardanoCliUtils.js'
import {
  queryUTxOviaBlockfrost,
  submitTransactionViaBlockfrost,
} from './blockfrostUtils.js'

export const queryUTxO = async (
  walletAddress,
  net = 'preview',
  blockfrostApiKey,
) => {
  if (blockfrostApiKey) {
    return queryUTxOviaBlockfrost(blockfrostApiKey, walletAddress)
  } else {
    return queryUTxOUsingCardanoCli(walletAddress, net)
  }
}

export const submitTransaction = async (
  net = 'preview',
  blockfrostApiKey = '',
) => {
  if (blockfrostApiKey) {
    return submitTransactionViaBlockfrost(blockfrostApiKey)
  } else {
    return submitTransactionUsingCardanoCli(net)
  }
}
