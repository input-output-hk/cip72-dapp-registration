
import process from 'node:process';

import { readFile } from 'fs/promises';
import { BlockFrostAPI } from "@blockfrost/blockfrost-js";


/**
 * 
 * @param { blockfrostKey } - blockfrostKey for the transaction.
 * @param { walletAddress } - wallet address for the transaction.
 * @returns 
 */
const queryUTxOviaBlockfrost = async (blockfrostKey, walletAddress) => {
  const blockfrost = new BlockFrostAPI({
    projectId: blockfrostKey,
  });
  const utxos = await blockfrost.addressesUtxosAll(walletAddress);
  let txHash = "";
  let txIx = 0;
  let amount = 0;
  for (const utxo of utxos) {
    if (utxo?.amount.reduce((sum, item) => sum + parseInt(item?.quantity, 10), 0) > 1000000) {
      txHash = utxo?.tx_hash; 
      txIx = utxo?.output_index;
      amount = utxo?.amount.reduce((sum, item) => sum + parseInt(item?.quantity, 10), 0) 
    }
  }
  return { txHash, txIx, amount };
}

/**
 * 
 * @param {blockfrostKey} - blockfrostKey for the transaction. Beware that blockfrost key is different for different testnets and mainnet 
 * @returns transaction id with which transaction can be found on any cardano explorer.
 */
const submitTransactionViaBlockfrost = async (blockfrostKey) => {
  const blockfrost = new BlockFrostAPI({
    projectId: blockfrostKey,
  });
  const tx = await readFile('./tx.signed', { encoding: 'binary' });
  const cbor_hex = JSON.parse(tx)?.cborHex;
  return await blockfrost?.txSubmit(cbor_hex)
}

/**
 * 
 * @param { blockfrostKey } - blockfrostKey for the transaction. Beware that blockfrost key is different for different testnets and mainnet
 * @returns network name based on the blockfrost key
 */
const inferNetFromBlockfrostKey = (blockfrostKey) => {
  if (blockfrostKey.includes('preview')) {
    return 'preview'
  } else if (blockfrostKey.includes('preprod')) {
    return 'preprod'
  } else if (blockfrostKey.includes('mainnet')) {
    return 'mainnet'
  } else {
    console.log("Wrong network! Allowed values: preview, preprod, mainnet");
    process.exit(1);
  }
}

export {
  inferNetFromBlockfrostKey,
  queryUTxOviaBlockfrost,
  submitTransactionViaBlockfrost,
};