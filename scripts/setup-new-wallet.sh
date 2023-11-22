#!/bin/bash

# Set the network (default to preview, you can change it to --mainnet if needed)
NETWORK="--testnet-magic 2"

# Create payment keys
cardano-cli address key-gen --verification-key-file payment.vkey --signing-key-file payment.skey

# Create stake keys
cardano-cli stake-address key-gen --verification-key-file stake.vkey --signing-key-file stake.skey

# Create wallet address and protocol parameter
cardano-cli address build --payment-verification-key-file payment.vkey --stake-verification-key-file stake.vkey --out-file payment.addr $NETWORK
cardano-cli query protocol-parameters --out-file protocol.json $NETWORK
