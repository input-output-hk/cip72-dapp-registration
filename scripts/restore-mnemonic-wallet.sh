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

# Check if phrase.prv file exists
if [ ! -f "phrase.prv" ]; then
    echo "Error: File 'phrase.prv' not found. Please make sure the file exists."
    exit 1
fi

# Create root keys
cardano-address key from-recovery-phrase Shelley < phrase.prv > root.xsk
cardano-address key child 1852H/1815H/0H/0/0 < root.xsk > key.xsk

# Create payment.skey and payment.vkey
cardano-cli key convert-cardano-address-key --shelley-payment-key --signing-key-file key.xsk --out-file payment.skey
cardano-cli key verification-key --signing-key-file payment.skey --verification-key-file payment.vkey

# Create stake.skey and stake.vkey
cat root.xsk | cardano-address key child 1852H/1815H/0H/2/0 > stake.xprv
cat stake.xprv | cardano-address key public --with-chain-code > stake.xpub
KEY=$( cat stake.xprv | bech32 | cut -b -128 )$( cat stake.xpub | bech32)
rm stake.xprv
rm stake.xpub

cat << EOF > stake.skey
{
    "type": "StakeExtendedSigningKeyShelley_ed25519_bip32",
    "description": "",
    "cborHex": "5880${KEY}"
}
EOF

cardano-cli key verification-key --signing-key-file stake.skey --verification-key-file stake.evkey
cardano-cli key non-extended-key --extended-verification-key-file stake.evkey --verification-key-file stake.vkey

# Get wallet address and protocol parameter
cardano-cli address build --payment-verification-key-file payment.vkey --stake-verification-key-file stake.vkey --out-file payment.addr $NETWORK_PARAMETER

if [ "$LOCAL_NODE" = "true" ]; then
  cardano-cli query protocol-parameters --out-file protocol.json $NETWORK_PARAMETER
fi

rm stake.evkey
rm key.xsk
rm root.xsk
