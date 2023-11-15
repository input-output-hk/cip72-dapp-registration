import * as CSL from '@emurgo/cardano-serialization-lib-asmjs';

const buildTx = async ({ walletApi, metadata }) => {
  const util = {
    protocolParams: {
      linearFee: {
        minFeeA: '44',
        minFeeB: '155381',
      },
      minUtxo: '34482',
      poolDeposit: '500000000',
      keyDeposit: '2000000',
      maxValSize: 5000,
      maxTxSize: 16384,
      priceMem: 0.0577,
      priceStep: 0.0000721,
      coinsPerUtxoWord: '34482',
    },
    getChangeAddress: async () => {
      const raw = await walletApi.getChangeAddress();
      return CSL.Address.from_bytes(Buffer.from(raw, 'hex')).to_bech32()
    },
    initTransactionBuilder: () => CSL.TransactionBuilder.new(
      CSL.TransactionBuilderConfigBuilder.new()
        .fee_algo(CSL.LinearFee.new(CSL.BigNum.from_str(util.protocolParams.linearFee.minFeeA), CSL.BigNum.from_str(util.protocolParams.linearFee.minFeeB)))
        .pool_deposit(CSL.BigNum.from_str(util.protocolParams.poolDeposit))
        .key_deposit(CSL.BigNum.from_str(util.protocolParams.keyDeposit))
        .coins_per_utxo_word(CSL.BigNum.from_str(util.protocolParams.coinsPerUtxoWord))
        .max_value_size(util.protocolParams.maxValSize)
        .max_tx_size(util.protocolParams.maxTxSize)
        .prefer_pure_change(true)
        .build()
    ),
    getUTxOs: async () => {
      const txOutputs = CSL.TransactionUnspentOutputs.new();
      const rawUTxOs = await walletApi.getUtxos();
      rawUTxOs.forEach(rawUTxO => {
        const utxo = CSL.TransactionUnspentOutput.from_bytes(Buffer.from(rawUTxO, 'hex'));
        txOutputs.add(utxo);
      });
      return txOutputs;
    },
  };

  const txBuilder = util.initTransactionBuilder();
  const changeAddress = await util.getChangeAddress();
  const shelleyOutputAddress = CSL.Address.from_bech32(changeAddress);
  const shelleyChangeAddress = CSL.Address.from_bech32(changeAddress);
  txBuilder.add_output(CSL.TransactionOutput.new(shelleyOutputAddress, CSL.Value.new(CSL.BigNum.from_str('1000000'))));

  txBuilder.add_json_metadatum(
    CSL.BigNum.from_str('1667'),
    JSON.stringify(metadata)
  );

  const utxos = await util.getUTxOs();
  txBuilder.add_inputs_from(utxos, 1);
  txBuilder.add_change_if_needed(shelleyChangeAddress);

  const txBody = txBuilder.build();
  const unsignedTransaction = txBuilder.build_tx();

  const transactionWitnessSet = CSL.TransactionWitnessSet.new();
  const tx = CSL.Transaction.new(
    txBody,
    CSL.TransactionWitnessSet.from_bytes(transactionWitnessSet.to_bytes()),
    unsignedTransaction.auxiliary_data()
  )
  let txVkeyWitnesses = await walletApi.signTx(Buffer.from(tx.to_bytes(), 'utf8').toString('hex'), true);
  txVkeyWitnesses = CSL.TransactionWitnessSet.from_bytes(Buffer.from(txVkeyWitnesses, 'hex'));
  transactionWitnessSet.set_vkeys(txVkeyWitnesses.vkeys());
  const signedTx = CSL.Transaction.new(
    tx.body(),
    transactionWitnessSet,
    unsignedTransaction.auxiliary_data()
  );
  return await walletApi.submitTx(Buffer.from(signedTx.to_bytes(), 'utf8').toString('hex'));
}

const element = {
  noWalletError: document.querySelector('#error-no-wallet'),
  registrationForm: document.querySelector('#registration-form'),
  successMessage: document.querySelector('#success-message'),
  successMessageLink: document.querySelector('#success-message-link'),
  walletSelector: document.querySelector('#wallet-selector'),
};

const uiUtils = {
  showElement: element => element.classList.add('root-element--visible'),
  hideElement: element => element.classList.remove('root-element--visible'),
}

window.addEventListener('load', async () => {
  if (!window.cardano) {
    uiUtils.showElement(element.noWalletError);
    return;
  }

  const availableWallets = Object.keys(window.cardano);
  if (!availableWallets.length) {
    uiUtils.showElement(element.noWalletError);
    return;
  }

  Object.keys(window.cardano).forEach(availableWalletName => {
    const optionElement = document.createElement('option')
    optionElement.value = availableWalletName;
    optionElement.text = availableWalletName;
    element.walletSelector.appendChild(optionElement);
  })

  uiUtils.showElement(element.registrationForm);
});

element.registrationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const metadata = {
    subject: event.target.elements['data-subject'].value,
    rootHash: event.target.elements['data-root-hash'].value,
    metadata: [event.target.elements['data-metadata'].value],
    type: {
      action: event.target.elements['data-type-action'].value,
      comment: event.target.elements['data-type-comment'].value,
    },
  }

  const walletName = event.target.elements['wallet-selector'].value;
  const walletApi = await window.cardano[walletName].enable();

  const hash = await buildTx({
    walletApi,
    metadata
  });

  element.successMessageLink.textContent = hash;
  element.successMessageLink.href = `https://preview.cexplorer.io/tx/${hash}`;
  uiUtils.showElement(element.successMessage);
});
