# Set network parameter based on provided network name
$network = "preprod"
if ($network -eq "preview") { $NETWORK_PARAMETER = "--testnet-magic=2" }
elseif ($network -eq "preprod") { $NETWORK_PARAMETER = "--testnet-magic=1" }
else {
    Write-Error "Error: Invalid network '$network'"
    exit 1
}

# Check if 'phrase.prv' file exists
if (-not (Test-Path phrase.prv)) {
    Write-Error "Error: File 'phrase.prv' not found. Please make sure the file exists."
    exit 1
}

# Create root keys
cardano-address key from-recovery-phrase Shelley `
(Get-Content phrase.prv -raw) > root.xsk
cardano-address key child 1852H/1815H/0H/0/0 `
(Get-Content root.xsk -raw) > key.xsk

# Create payment.skey and payment.vkey
cardano-cli key convert-cardano-address-key --shelley-payment-key --signing-key-file key.xsk --out-file payment.skey
cardano-cli key verification-key --signing-key-file payment.skey --verification-key-file payment.vkey

# Create stake.skey and stake.vkey
Get-Content root.xsk | cardano-address key child 1852H/1815H/0H/2/0 > stake.xprv
Get-Content stake.xprv | cardano-address key public --with-chain-code > stake.xpub
$KEY = (Get-Content stake.xprv) + $(Get-Content stake.xpub) -replace '^[a-zA-Z0-9]*', ""
Remove-Item -Path .\\stake.xprv,.\\stake.xpub

@"
{
    "type": "StakeExtendedSigningKeyShelley_ed25519_bip32",
    "description": "",
    "cborHex": "5880$($KEY)"
}
"@ | Set-Content -Path .\\stake.skey
cardano-cli key verification-key --signing-key-file stake.skey --verification-key-file stake.evkey
cardano-cli key non-extended-key --extended-verification-key-file stake.evkey --verification-key-file stake.vkey

# Get wallet address and protocol parameter
cardano-cli address build --payment-verification-key-file payment.vkey --stake-verification-key-file stake.vkey --out-file payment.addr $NETWORK_PARAMETER

if ($LOCAL_NODE -eq "true") {
    cardano-cli query protocol-parameters --out-file protocol.json $NETWORK_PARAMETER
}

Remove-Item -Path .\\stake.evkey,.\\key.xsk,.\\root.xsk
