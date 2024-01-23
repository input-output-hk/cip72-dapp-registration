# Guide on how to register Dapp on Cardano blockchain

## About us

We, a team of Cardano developers and Web3 enthusiasts that believe in leveraging blockchain technology to create more
inclusive and transparent digital future, joined together to develop the on-chain DApp registration standard (for more
details refer to [cip-72 specification](https://cips.cardano.org/cip/CIP-0072)) that enables DApps developers to
advertise their DApps on Cardano blockchain and make them visible and easily discoverable on chain in a standardized way.

## Purpose of this Guide

Outline what the on-chain DApp registration is about and help DApp developers register their DApps on Cardano blockchain.

## What is on-chain DApp registration?

The on-chain DApp registration, based on CIP-72 (Cardano DApp registration standard), is a transaction with specific
metadata describing your DApp. In general, the on-chain DApp registration process is similar to the on-chain Stake Pool
registration process, but in this case the DApp developer references key information about their DApp (e.g. DApp name,
logo, description, contacts, website, etc.) stored somewhere off-chain (e.g. DApp website, Github, etc.) on Cardano blockchain.

#### We can see the following benefits for the DApp developer from registering their DApp on Cardano blockchain:
1. remove the hassle of providing the same key information about your DApp to various sources each time you are asked to
2. advertise and anchor your DApp on Cardano blockchain
3. make your DApp easily discoverable from day one by Cardano community 
4. make key information about your DApp available in a standardized way so any DApp aggregator, board, or wallet can
integrate and consume it easily

## Create Off-chain JSON with DApp data

Initiate your DApp's on-chain registration journey by crafting an offchain-metadata.json file (list your DApp under one or several appropriate categories from this category list ["DeFi", "Development", "Education", "Games", "Identity", "Marketplace", "NFT", "Other", "Security"]). 
Seek inspiration from the 16 sample offchain-metadata.json files conveniently housed within the [examples](./examples) folder. 
Once this document is ready, upload onto any web platform – the DApp's website or a repository like Github Gist. 
Now, you can use that URL when the script asks you to input, which will be used for the onchain metadatada of the transaction.

## Set up required tooling

You will need a node.js installed in your system.

You need a few tools to be available in your terminal:

 1. `cardano-cli` and `cardano-address` included in Daedalus ([mainnet](https://daedaluswallet.io/en/download/) or [preview/preprod](https://docs.cardano.org/cardano-testnet/daedalus-testnet/)
 2a. If you prefer using a local node you need `cardano-node` included in Daedalus
 2b. If you prefer a remote node you can use your blockfrost.io API Key
 3. `bech32`
    - You can install it using:
      - `cabal install bech32` or
      - `nix-shell -p haskellPackages.bech32` or
      - compile it from https://github.com/IntersectMBO/bech32 or
      - you install `cardano-wallet`, which includes binaries for bech32

#### Add your tools in your PATH for Windows 11

Assuming you installed Daedalus in the following path `C:\Program Files\Daedalus Pre-Prod` and you used ghci for getting cabal and the path of binaries is `C:\ghcup\bin`
```
setx PATH "%PATH%;C:\ghcup\bin;C:\cabal\bin;C:\Program Files\Daedalus Pre-Prod"
```
You need to restart your command line window in order to take effect the new PATH

#### Add your tools in your PATH for Linux

Assuming you installed Daedalus in the following path `C:\Program Files\Daedalus Pre-Prod` and you used ghci for getting cabal and the path of binaries is `C:\ghcup\bin`
```
setx PATH "%PATH%;C:\ghcup\bin;C:\cabal\bin;C:\Program Files\Daedalus Pre-Prod"
```
You need to restart your command line window in order to take effect the new PATH

### Testnet-magic numbers 

In few places you will have to provide proper network parameter `(--mainnet | --testnet-magic NATURAL)`

- 2: Preview. `--testnet-magic=2`
- 1: Preprod. `--testnet-magic=1`

### Cardano node socket port

If you choose to go with the local node you need to have the `CARDANO_NODE_SOCKET_PATH` env variable set to the path of
the local node socket file.

#### Example for Daedalus preprod on Windows 11:

You will need to open `%USERPROFILE%\AppData\Roaming\Daedalus Pre-Prod\Logs\pub\node.log` and search for `CreateSystemdSocketForSnocketPath` and use something similar as this `\\\\.\\pipe\\cardano-node-testnet.24344.0` as your socket path.
```
powershell -Command "Start-Process cmd.exe -ArgumentList '/c', 'setx CARDANO_NODE_SOCKET_PATH \\\\.\\pipe\\cardano-node-testnet.24344.0 \'"
```

#### Example for Daedalus preprod on MacOS:
`CARDANO_NODE_SOCKET_PATH="/Users/<username>/Library/Application Support/Daedalus Preprod/cardano-node.socket"`

## Step 1: Set up wallet

There are three ways to set up a wallet.

- a) Restore a wallet using mnemonics.
- b) Restore a wallet using existing keys (without mnemonics).
- c) Create a new wallet

### a) Restore a wallet from mnemonic

1. Create `phrase.prv` file and fill it up with your mnemonic in space seperated format.
2. Grant script permission to run `chmod +x ./scripts/restore-mnemonic-wallet.sh`
3. Restore mnemonic wallet by running `NETWORK=(preview|preprod|mainnet) LOCAL_NODE=(true|false) npm run restore-mnemonic-wallet`
(Choose appropriate values of the NETWORK and LOCAL_NODE variables)

### b) Restore a wallet using existing keys

If you have your `payment.skey`, `payment.vkey`, `stake.skey` and `stake.vkey`, then you can follow these steps

1. Create a payment address
`$ cardano-cli address build --payment-verification-key-file payment.vkey --stake-verification-key-file stake.vkey --out-file payment.addr`
2. (LOCAL NODE ONLY) Retrieve the node’s current pool parameters
`$ cardano-cli query protocol-parameters --out-file protocol.json (--mainnet | --testnet-magic NATURAL)`
(Choose appropriate network parameter)

### c) Create a new wallet

1. Grant script permission to run `chmod +x ./scripts/setup-new-wallet.sh`
2. Setup new wallet. `NETWORK=(preview|preprod|mainnet) LOCAL_NODE=(true|false) npm run setup-new-wallet`
(Choose appropriate values of the NETWORK and LOCAL_NODE variables)
3. Request Test ADA (preview or preprod) at [https://docs.cardano.org/cardano-testnet/tools/faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)
to the generated address from the `payment.addr` file.

## Step 2: Run the registration script

1. Make sure your wallet has test ADA for transaction fee (it's a variable amount, something around 190.000 lovelace).
2. Install packages `npm install`
3. Copy `.env.example-blockfrost` or `.env.example-local-node` to the `.env` file and edit it appropriately
`cp .env.example-<blockfrost|local-node> .env`
4. Prepare your cip-72 off chain metadata link you created at the beginning
([Create Off-chain JSON with DApp data](#create-off-chain-json-with-dapp-data)) 
5. Launch registration script and follow the instructions `npm run start`
6. To monitor the status of your dApp registration, simply invoke the provided URL. At the end of successful script run there will be URL for your submitted tx provided for convenience.
- Preview: https://live-preview.ui.dapp-store.lw.iog.io/dapp-validation-result/${txid}
- Preprod: https://live-preprod.ui.dapp-store.lw.iog.io/dapp-validation-result/${txid}

## Useful commands when using local node

Ref.: [https://docs.cardano.org/development-guidelines/use-cli](https://docs.cardano.org/development-guidelines/use-cli)

Query UTXO

```
$ cardano-cli query utxo \
  --address $(< payment.addr) \
  (--mainnet | --testnet-magic NATURAL)

Output:
                           TxHash                                 TxIx        Amount
--------------------------------------------------------------------------------------
99b8fcac018828b6f6b29eb55211ac5e69a8651736c4c3d6280ca4524fd41778     0        9998003445 lovelace + TxOutDatumNone

```

To create draft transaction:

```
$ cardano-cli transaction build-raw \
--tx-in 99b8fcac018828b6f6b29eb55211ac5e69a8651736c4c3d6280ca4524fd41778#0 \
--tx-out $(cat payment.addr)+0 \
--metadata-json-file metadata.json \
--fee 0 \
--out-file tx.draft
```

To calculate the transaction fee:

```
$ cardano-cli transaction calculate-min-fee \
--tx-body-file tx.draft \
--tx-in-count 1 \
--tx-out-count 1 \
--witness-count 1 \
--byron-witness-count 0 \
(--mainnet | --testnet-magic NATURAL) \
--protocol-params-file protocol.json
```

Then we calculate the total amount of our wallet minus the calculated fee as the total amount after transaction is complete\
`$ expr 9998003445 - 180285 = 9997823160`

To build final transaction:

```
$ cardano-cli transaction build-raw \
--tx-in 99b8fcac018828b6f6b29eb55211ac5e69a8651736c4c3d6280ca4524fd41778#0 \
--tx-out $(cat payment.addr)+9997823160 \
--metadata-json-file metadata.json \
--fee 180285 \
--out-file tx.draft
```

To sign the transaction:

```
$ cardano-cli transaction sign \
--tx-body-file tx.draft \
--signing-key-file payment.skey \
(--mainnet | --testnet-magic NATURAL) \
--out-file tx.signed
```

To submit the transaction:\
`$ cardano-cli transaction submit --tx-file tx.signed (--mainnet | --testnet-magic NATURAL)`

### Testnets faucet

[https://docs.cardano.org/cardano-testnet/tools/faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)
