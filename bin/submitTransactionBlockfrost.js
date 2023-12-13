import { BlockFrostAPI } from "@blockfrost/blockfrost-js";

/**
 * 
 * @param {*} blockfrostKey 
 * @param {*} walletAddress 
 * @returns 
 */
const queryUTXOviaBlockfrost = async (blockfrostKey, walletAddress) => {
  const blockfrost = new BlockFrostAPI({
    projectId: blockfrostKey,
  });
  const utxos = await blockfrost.addressesUtxosAll(walletAddress);
  const TxHash = utxos[0].tx_hash
  const TxIx = utxos[0].output_index
  const Amount = utxos[0].amount.reduce((sum, item) => sum + parseInt(item.quantity, 10), 0);
  return { TxHash, TxIx, Amount }
}

/**
 * 
 * @param {blockfrostKey for the transaction. Beware that blockfrost key is different for different testnets and mainnet} blockfrostKey 
 * @returns transaction id with which transaction can be found on any cardano explorer.
 */
const submitTransactionViaBlockfrost = async (blockfrostKey) => {
  const blockfrost = new BlockFrostAPI({
    projectId: blockfrostKey,
  });
  const tx = await readFile('./tx.signed', { encoding: 'binary' });
  const cbor_hex = JSON.parse(tx).cborHex;
  const transaction = await blockfrost.txSubmit(cbor_hex)
  return transaction
}

/**
 * This method returns fixed amount of fee which is enough for every transaction.
 * It can be improved by calculating the fee based on the transaction size, but it is out of scope for now.
 * @param {Amount of Lovelace in one account} Amount 
 * @returns fixed fee of 1 ADA (1 million Lovelace) and final amount
 */
const calculateTransactionFeeViaBlockfrost = (Amount) => {
  const fee = 1000000;
  const finalAmount = Amount - fee;
  return { fee,  finalAmount };
}

export {
  queryUTXOviaBlockfrost,
  submitTransactionViaBlockfrost,
  calculateTransactionFeeViaBlockfrost,
};