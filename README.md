# Guide on how to register Dapp on Cardano blockchain

## About us

We, a team of Cardano developers and Web3 enthusiasts that believe in leveraging blockchain technology to create more inclusive and transparent digital future, joined together to develop the on-chain DApp registration standard (for more details refer to [cip-72 specification](https://developers.cardano.org/docs/governance/cardano-improvement-proposals/cip-0072/]) that enables DApps developers to advertise their DApps on Cardano blockchain and make them visible and easily discoverable on chain in a standardized way.

## Purpose of this Guide

Outline what the on-chain DApp registration is about and help DApp developers register their DApps on Cardano blockchain.

## What is on-chain DApp registration?

The on-chain DApp registration, based on CIP-72 (Cardano DApp registration standard), is a transaction with specific metadata describing your Dapp. In general, the on-chain DApp registration process is similar to the on-chain Stake Pool registration process, but in this case the DApp developer references key information about their DApp (e.g. DApp name, logo, description, contacts, website, etc.) stored somewhere off-chain (e.g. DApp website, Github, etc.) on Cardano blockchain.

#### We can see the following benefits for the DApp developer from registering their DApp on Cardano blockchain:

         1. remove the hassle of providing the same key information about your DApp to various sources each time you are asked to
         2. advertise and anchor your DApp on Cardano blockchain
         3. make your DApp easily discoverable from day one by Cardano community 
         4. make key information about your DApp available in a standardized way so any DApp aggregator, board, or wallet can integrate and consume it easily

## Create Off-chain JSON with DApp data

To start the on-chain DApp registration process, create the off-chain JSON (here is the off-chain JSON template [add link here]) with key information about your DApp (e.g. DApp name, logo, description, contacts, website, etc.) and upload it somewhere on the WEB (e.g. the DApp website, Github, etc.) so you can get a link/URL to it. Here is the example of the off-chain JSON with a test DApp [add link here]. The expected result of this step is that you have a link/URL to your DApp's off-chain JSON.

## Set up required tooling

You will need a node.js and yarn installed in your system.

You need a few tools to be available in your terminal:
 - `cardani-cli`
 - `cardano-address`
 - `bech32`

You can set up a local cardano node if you choose to submit the registration transaction this way.
Alternatively you could use [https://blockfrost.io/](https://blockfrost.io/). To do so you need to get an api key.

We recommend the following ways of getting required binaries and the local node:

 - [Latests cardano-wallet release](https://github.com/cardano-foundation/cardano-wallet/releases/latest): Downlaod the `cardano-wallet` archive appropriate for your system, unpack it
and put the unpacked directory in you $PATH variable so the contents are available in your terminal. Start the local
node if you which to use it.
 - [Daedalus](https://daedaluswallet.io/en/download/): Download the `Daedalus` for chosen network, install it and add
the `location-of-instalation/bin` to the $PATH variable so the contents are available in your terminal. This is an easy
way to spin up a node locally however you will need to get the `bech32` yourself because it is not included in the
Daedalus files

### Testnet-magic numbers 

In few places you will have to provide proper network parameter `(--mainnet | --testnet-magic NATURAL)`

- 2: Preview. `--testnet-magic=2`
- 1: Preprod. `--testnet-magic=1`

### Cardano node socket port

If you choose to go with the local node you need to have the `CARDANO_NODE_SOCKET_PORT` env variable set to the path of
the local node socket file.

## Step 1: Set up wallet

There are three ways to setup a wallet.

- a) Restore wallet using mnemonics.
- b) Restore a wallet using existing keys (without mnemonics).
- c) Create new wallet

### a) Restore wallet from mnemonic

1. Create `phrase.prv` file and fill it up with your mnemonic in space seperated format.
2. Grant script permission to run `chmod +x ./scripts/restore-mnemonic-wallet.sh`
3. Restore mnemonic wallet by running `NETWORK=(preview|preprod|mainnet) LOCAL_NODE=(true|false) yarn restore-mnemonic-wallet`
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
2. Setup new wallet. `NETWORK=(preview|preprod|mainnet) LOCAL_NODE=(true|false) yarn setup-new-wallet`
(Choose appropriate values of the NETWORK and LOCAL_NODE variables)
3. Request Test ADA at [https://docs.cardano.org/cardano-testnet/tools/faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)
to the generated address from the `payment.addr` file. NB transaction fee it's a variable amount, something around 190.000 lovelace

## Step 2: Run the registration script

1. Make sure your wallet has test ADA for transaction fee
2. Install packages `yarn install`
3. Copy `.env.example-blockfrost` or `.env.example-local-node` to the `.env` file and edit it appropriately
`cp .env.example-<blockfrost|local-node> .env`
4. Create a cip72 metadata file.
5. Launch registration script and follow the instructions `yarn start`

## Useful commands

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

Then we calculate the total amount of our wallet minus the calculated fee as the total output amount\
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

https://www.shorturl.at/
