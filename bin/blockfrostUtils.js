import { readFile } from 'fs/promises';
import { BlockFrostAPI } from '@blockfrost/blockfrost-js';

/**
 *
 * @param {string} blockfrostKey - blockfrostKey for the transaction.
 * @param {string} walletAddress - wallet address for the transaction.
 * @returns {string, number, number} txHash, txIx, amount of the transaction.
 */
const queryUTxOviaBlockfrost = async (blockfrostKey, walletAddress) => {
  const blockfrost = new BlockFrostAPI({
    projectId: blockfrostKey
  });
  const utxos = await blockfrost.addressesUtxosAll(walletAddress);
  let txHash = '';
  let txIx = 0;
  let amount = 0;
  for (const utxo of utxos) {
    const sum = utxo?.amount.reduce((acc, item) => acc + parseInt(item?.quantity, 10), 0);
    if (sum > 1000000) {
      txHash = utxo?.tx_hash;
      txIx = utxo?.output_index;
      amount = sum;
    }
  }
  return { txHash, txIx, amount };
};

/**
 *
 * @param {string} blockfrostKey - Blockfrost key for the transaction.
 * Beware that blockfrost key is different for different testnets and mainnet
 * @returns {string} transaction id with which transaction can be found on any cardano explorer.
 */
const submitTransactionViaBlockfrost = async (blockfrostKey) => {
  const blockfrost = new BlockFrostAPI({
    projectId: blockfrostKey
  });
  const tx = await readFile('./tx.signed', { encoding: 'binary' });
  const cborHex = JSON.parse(tx)?.cborHex;
  return blockfrost?.txSubmit(cborHex);
};

/**
 *
 * @param {string} blockfrostKey - Blockfrost key for the transaction.
 * Beware that blockfrost key is different for different testnets and mainnet
 * @param {string} net - network name based on the blockfrost key
 * @return {string} network name based on the blockfrost key
 */
const validateBlockfrostKey = (net, blockfrostKey) => {
  if (!blockfrostKey.includes(net)) {
    throw new Error(
      'Network and blockfrost key mismatch! Kindly check your blockfrost key and network.'
    );
  }
};

export { validateBlockfrostKey, queryUTxOviaBlockfrost, submitTransactionViaBlockfrost };
