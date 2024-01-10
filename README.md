# How to register dApp to Cardano + submit CIP-72 format metadata

## Set up cardano-cli

[https://github.com/piotr-iohk/cardano-up](https://github.com/piotr-iohk/cardano-up)

## Set up local node or use blockfrost.io

1. For local node setup -> [https://github.com/piotr-iohk/cardano-up](https://github.com/piotr-iohk/cardano-up)
2. For getting a blockfrost key -> [https://blockfrost.io/](https://blockfrost.io/)

## Set up wallet

There are three ways to setup a wallet.

- Create new wallet
- Restore wallet using mnemonics.
- Restore a wallet using existing keys (without mnemonics).

### Create a new wallet

1. Grant script permission to run `chmod +x ./scripts/setup-new-wallet.sh`
2. Setup new wallet by running `yarn setup-new-wallet`
3. Request Test ADA at [https://docs.cardano.org/cardano-testnet/tools/faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)\
   NB transaction fee it's a variable amount, something around 190.000 lovelace
4. Query tip\
   `$ cardano-cli query tip (--mainnet | --testnet-magic NATURAL)`
5. Install packages\
   `$ yarn install`
6. Copy .env.example to .end and edit it accordingly\
   `$ cp .env.example .env`
7. Create a cip72 metadata file.
8. Launch **cip72-cli** and follow the instructions\
   `$ yarn start`

### Restore wallet from mnemonic

1. Make sure you have `bech32` and `cardano-address` installed. You can test with `bech32 -v` and `cardano-address -v` or install using `cabal install bech32 cardano-address`
2. Create `phrase.prv` file and fill it up with your mnemonic in space seperated format.
3. Grant script permission to run `chmod +x ./scripts/restore-mnemonic-wallet.sh`
4. Restore mnemonic wallet by running `yarn restore-mnemonic-wallet`
5. Make sure your wallet has test ADA for transaction fee
6. Query tip\
   `$ cardano-cli query tip (--mainnet | --testnet-magic NATURAL)`
7. Install packages\
   `$ yarn install`
8. Copy .env.example to .end and edit it accordingly\
   `$ cp .env.example .env`
9. Create a cip72 metadata file.
10. Launch **cip72-cli** and follow the instructions\
    `$ yarn start`

### Restore a wallet using existing keys

If you have your `payment.skey`, `payment.vkey`, `stake.skey` and `stake.vkey`, then you can follow these steps

1. Create a payment address `$ cardano-cli address build --payment-verification-key-file payment.vkey --stake-verification-key-file stake.vkey --out-file payment.addr`
2. Retrieves the node’s current pool parameters `$ cardano-cli query protocol-parameters --out-file protocol.json (--mainnet | --testnet-magic NATURAL)`
3. Query tip `$ cardano-cli query tip (--mainnet | --testnet-magic NATURAL)`
4. Install packages\
   `$ yarn install`
5. Copy .env.example to .end and edit it accordingly\
   `$ cp .env.example .env`
6. Create a cip72 metadata file.
7. Launch **cip72-cli** and follow the instructions\
   `$ yarn start`

### Testnet-magic numbers

- 9: Devnet. `--testnet-magic=9`
- 2: Preview. `--testnet-magic=2`
- 1: Preprod. `--testnet-magic=1`

### Cardano node socket port

This script assumes that your `CARDANO_NODE_SOCKET_PORT` is set in your terminal environment. If not, you can set it in `.env` file.

### Useful commands

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
