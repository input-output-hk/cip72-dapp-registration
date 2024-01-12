#!/bin/bash

NETWORK_PARAMETER=""

case $NETWORK in
  preview)
    NETWORK_PARAMETER="--testnet-magic=2"
    ;;
  preprod)
    NETWORK_PARAMETER="--testnet-magic=1"
    ;;
  mainnet)
    NETWORK_PARAMETER="--mainnet"
    ;;
  *)
    echo Error: Invalid network $NETWORK
    exit 1
    ;;
esac

# Create payment keys
cardano-cli address key-gen --verification-key-file payment.vkey --signing-key-file payment.skey

# Create stake keys
cardano-cli stake-address key-gen --verification-key-file stake.vkey --signing-key-file stake.skey

# Create wallet address and protocol parameter
cardano-cli address build --payment-verification-key-file payment.vkey --stake-verification-key-file stake.vkey --out-file payment.addr $NETWORK_PARAMETER
if [ "$LOCAL_NODE" = "true" ]; then
  cardano-cli query protocol-parameters --out-file protocol.json $NETWORK_PARAMETER
fi
