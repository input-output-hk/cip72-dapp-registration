# How to register dApp to Cardano + submit CIP-72 format metadata 

## Set up cardano-cli
[https://github.com/piotr-iohk/cardano-up](https://github.com/piotr-iohk/cardano-up)


## Set up wallet

1. Create Payment Keys\
`$ cardano-cli address key-gen --verification-key-file payment.vkey --signing-key-file payment.skey`
2. To generate a stake key pair\
`$ cardano-cli stake-address key-gen --verification-key-file stake.vkey --signing-key-file stake.skey`
3. Create Wallet Address\
`$ cardano-cli address build --payment-verification-key-file payment.vkey --stake-verification-key-file stake.vkey --out-file payment.addr (--mainnet | --testnet-magic NATURAL)`
4. Request Test ADA at [https://docs.cardano.org/cardano-testnet/tools/faucet](https://docs.cardano.org/cardano-testnet/tools/faucet)\
NB transaction fee it's a variable amount, something around 190.000 lovelace
5. Retrieves the node’s current pool parameters\
`$ cardano-cli query protocol-parameters --out-file protocol.json (--mainnet | --testnet-magic NATURAL)`
6. Query tip\
`$ cardano-cli query tip (--mainnet | --testnet-magic NATURAL)`
7. Install packages\
`$ yarn install`
8. Generate key pair\
`$ yarn generate-key-pair`\
Copy `publicKey` and `secretKey` to `.env` file (see step 9)
9. Copy .env_example to .end and edit it accordingly\
`$ cp .env_example .env`
10. Copy `cip26_example.yml` to `cip26.yml` and edit it accordingly
11. Launch **cip26-cli** and follow the instructions\
`$ yarn start`

### Testnet-magic numbers
- 9: Devnet. 	`--testnet-magic=9`
- 2: Preview. 	`--testnet-magic=2`
- 1: Preprod. 	`--testnet-magic=1`


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




** 001 **
BLOCK:0536732 █ TX:65 █ META   { label: 1667, content: {"GITHUB":"https://github.com/lucadonazzon/cip72/metadata/001/cip72.json","rootHash":"62479bde5c1209b769373d235f1c95fb719e3505c9b4c15509e0a6fab834419e","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"12806bc4d317bad140c82020a11d9b824f78391a440c6a9bd4692f9e98f16bfd","s":"60fd4f3da3db5717f0fc49c4e6b22f0cd91c12ac7503121c62d93566b6177206"},"subject":"FakeNMKR-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }

https://github.com/lucadonazzon/cip72/blob/main/metadata/001/cip72.json
shorturl.at/dqC28
BLOCK:0545516 █ TX:01 █ META   { label: 1667, content: {"metadata":["shorturl.at/dqC28"],"rootHash":"55a8068c5df72b86567f32a05101bb6a7c38f7bf720800b8344d9feb97cbcba7","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"02d2af9dd5555f809700a63103f8968502254596e59b425f0983a1527b9d65c4","s":"cb2e4900ce90a5d83f1f0c6b90a7af9bc9fc9d3788b2b16e172070331339560c"},"subject":"FakeNMKR-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }

** 002 **
BLOCK:0536758 █ TX:29 █ META   { label: 1667, content: {"GITHUB":"https://github.com/lucadonazzon/cip72/metadata/002/cip72.json","rootHash":"a259d8facd95e2fc20fb9017237dc3f311e6ca7ac4ba30dae24bac7fbe75c088","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"981ba0a9f0b9599ef6a6d9ad1530bac070c5c1b6283b97ea5ed08e14e6de95ec","s":"1e2fd2c5b0c96fd1b2471b62e2ab7537795b72d9f27008bd7c9e9fefd45b8c08"},"subject":"FakeRayWallet-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }

https://github.com/lucadonazzon/cip72/blob/main/metadata/002/cip72.json
shorturl.at/yET03
BLOCK:0545525 █ TX:00 █ META   { label: 1667, content: {"metadata":["shorturl.at/yET03"],"rootHash":"8239bb5187823e337446507979b4365729c4c4889066e87553b9c2aaec212172","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"3a030f43352caf593b2ae750514b0819febe73e2dfb893eac2ec139aa4df7ef0","s":"6f54397b92e2470c9d276ba8a5a706f43d9b339c9c713867e66d3878475a9406"},"subject":"FakeRayWallet-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }


** 003 **
BLOCK:0536770 █ TX:03 █ META   { label: 1667, content: {"GITHUB":"https://github.com/lucadonazzon/cip72/metadata/003/cip72.json","rootHash":"686bf8311543301e9f0eef90b96f3dc1d42a4331c737616d2ef972e630ad56a3","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"12837f5503d459df29cee8161ad2a177a3531bffa9fdebde11f38116338bcd97","s":"0936af9d8f150d550cfe364e8f33c35a7023ecebeed4fb2629ef163dafe56500"},"subject":"FakeArtano-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }

https://github.com/lucadonazzon/cip72/blob/main/metadata/003/cip72.json
shorturl.at/vQRV9
BLOCK:0546062 █ TX:01 █ META   { label: 1667, content: {"metadata":["shorturl.at/vQRV9"],"rootHash":"6613ca930085dbc83fb26b2f3e7f8739cb996f0a24e089421d82a71ae3d035cb","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"98cdbbbcc76d06f4aa64505da31177f21c6a925240ca4ea5c255bd0775844fec","s":"9a9ca4710022511ea4065787099e7560093e0ca7974f683da31c96fb7c1b1c0c"},"subject":"FakeArtano-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }


** 004 **
BLOCK:0536817 █ TX:00 █ META   { label: 1667, content: {"GITHUB":"https://github.com/lucadonazzon/cip72/metadata/004/cip72.json","rootHash":"e778b782c79a2b2961dbfdc579485721a1e225b174016269d30226add46707b5","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"fe4493f7e0f09acdd94d192232191e84be4ab92bc41ffff4054af305b840d7ec","s":"8581aa5fb8fdb3cc7f002b0f941265d626f3c68076eea9e5aabaf6d617897701"},"subject":"FakeBlockfrost-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }

https://github.com/lucadonazzon/cip72/blob/main/metadata/004/cip72.json
shorturl.at/enoJO
BLOCK:0546066 █ TX:02 █ META   { label: 1667, content: {"metadata":["shorturl.at/enoJO"],"rootHash":"bd4bfbb01b5f6ad1bc55d6098230947f852db44c7bec6e2b9e897209b8bcd837","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"9105fd4f4fc127fe3c437a8b530ba3cb2a4a80a5528f04313043b16d434e1bf3","s":"58017a69094b4f93a51412f1b9503f921ed209bc259ac3c511240b9314034701"},"subject":"FakeBlockfrost-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }


** 005 **
BLOCK:0536829 █ TX:60 █ META   { label: 1667, content: {"GITHUB":"https://github.com/lucadonazzon/cip72/metadata/005/cip72.json","rootHash":"ba99831cce7a987eb922af91f523eac374dcdd14a49914a05b8b79e1af3b6485","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"48b52088b04c9a3a22956756fc48cf37b5798c2e262a42bfb0c94566c206af5c","s":"d6888e50b86c12ea2fca49e2b95df21f0d7ebaa259f9ca9240070d5c1655340f"},"subject":"FakeJpgStore-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }

https://github.com/lucadonazzon/cip72/blob/main/metadata/005/cip72.json
shorturl.at/aiM13
BLOCK:0546076 █ TX:03 █ META   { label: 1667, content: {"metadata":["shorturl.at/aiM13"],"rootHash":"7accad357621b035f6d6b746e12908fca91a5dcf84a50a854fead109a0e0c502","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"5f17ab265d75b9900462ca3b24ba0d4dc1506bf3e6ce79806a0fc074f572cd09","s":"204918f654da427af3c865fbbb053976d6032eca025f47286ba1652bdb557801"},"subject":"FakeJpgStore-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }



** 006 **
BLOCK:0536845 █ TX:27 █ META   { label: 1667, content: {"GITHUB":"https://github.com/lucadonazzon/cip72/metadata/006/cip72.json","rootHash":"27c01b27778ac6781417bb05912514fb405b4299d8c263a96875381386789227","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"16fbfc8dc9bb8d78a9459f9b1dc57ca9376b903d2b0293fe5e05dd39ddfce3ba","s":"8d01e60747513f56f5206c5256d8611673072c00cba6c3d1cc417ca348a99f04"},"subject":"FakeSundaySwap-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }

https://github.com/lucadonazzon/cip72/blob/main/metadata/006/cip72.json
shorturl.at/dejoC
BLOCK:0546079 █ TX:00 █ META   { label: 1667, content: {"metadata":["shorturl.at/dejoC"],"rootHash":"1856f9528e7a67958f52c14376a0374e911ea70869b374f9e8ba3a023c4bb145","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"fd9d34429fc3ad8749250c632fa7d541b3a44d9a76e57a1f3d2da3126f64ee0b","s":"edd5112f600e695cb50a98e35bb4cd66d8b4369710f4498e94ac4b00b95f050b"},"subject":"FakeSundaySwap-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }


** 007 **
BLOCK:0537448 █ TX:32 █ META   { label: 1667, content: {"GITHUB":"https://github.com/lucadonazzon/cip72/metadata/007/cip72.json","rootHash":"8a02864cea954b322e7ece9038ae12767b497c351b214978245e468e0ecb5119","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"f82ad4a5d90d34a854388f05c8e84af4a4c002247f6451f0d87b6162ec1c1731","s":"f5d91e779d13be5f7407d855ae0bde631a216628850b16caa0e3e60262db8005"},"subject":"FakeNMKR-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }

https://github.com/lucadonazzon/cip72/blob/main/metadata/007/cip72.json
shorturl.at/syDL4
BLOCK:0546080 █ TX:04 █ META   { label: 1667, content: {"metadata":["shorturl.at/syDL4"],"rootHash":"44b3cde5bbe2da1394ee7fc22d968c5574377f7496da4e9c6cbd77ef71d23b1c","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"e2bf9709dc73647652c7a8f6eaee7c5067c4eb152ab6b85c0b10c00e14b7428c","s":"a045af44da487c17ee72ea75900023552953b0ef40607c8cad2f7dfef756a00b"},"subject":"FakeNMKR-003","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }

** 008 **
https://github.com/lucadonazzon/cip72/blob/main/metadata/008/cip72.json
shorturl.at/nqB19
BLOCK:0547638 █ TX:00 █ META   { label: 1667, content: {"metadata":["shorturl.at/nqB19"],"rootHash":"3c27f94120978f853276bde3a21417775a7db70caafdeee4dd694f3daebdffd1","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"f1077cbe57a2f80d3d1541cd8b6a792add7481c67915b31084d35cc5e7ab12e7","s":"8db8c4b69094de7f50eb05bf2e04cad3d9ecd206dc4fdef51170a1181c289207"},"subject":"EducationTestDApp-6","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }

** 009 **
https://github.com/lucadonazzon/cip72/blob/main/metadata/009/cip72.json
shorturl.at/eyGU7
BLOCK:0547653 █ TX:01 █ META   { label: 1667, content: {"metadata":["shorturl.at/eyGU7"],"rootHash":"6aeb96f00a52da472581719d62453335bef493842e30cede746eb38d4204d86e","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"e6a68ae9b92babf95938051ae7f11cc24b2f054066ad3582e05c13ecd51e8bc6","s":"f35ba447f6f2ed74e46eac9b5dbedf974df6aaf5c130c83990bda9fc3a06ea0c"},"subject":"GamesTestDApp-4","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }


** 010 **
https://github.com/lucadonazzon/cip72/blob/main/metadata/010/cip72.json
shorturl.at/quzY3
BLOCK:0547649 █ TX:00 █ META   { label: 1667, content: {"metadata":["shorturl.at/quzY3"],"rootHash":"ccfd861977dd9126f63d836dd69201ef0903225a9bb1dd9e5db64a513c6784f8","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"9a386e6c4b113b38fc4cc232c4058d8098cd70887a791ac4d9fd6a212e4bc83f","s":"5f94675d89738da2e5e5951f70532987d54fc3d6d5dd7e3f01001b4d977ffd08"},"subject":"DevelopmentTestDApp-4","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }

** 011 **
https://github.com/lucadonazzon/cip72/blob/main/metadata/011/cip72.json
shorturl.at/gKNW7
BLOCK:0547657 █ TX:02 █ META   { label: 1667, content: {"metadata":["shorturl.at/gKNW7"],"rootHash":"4a78311f58357925188a29e8c92df43387e576a6f139f904486feb4ee5f48f2f","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"ac3ba350f7114edbd1c4125061e74eddc126c43579a7c9ad981116e6525ed08f","s":"5726be9947a3f62b58cb21b2e4e1371af772bdac38d700e93bf2b7e7da6df204"},"subject":"NFTTestDApp-4","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }


** 012 **
https://github.com/lucadonazzon/cip72/blob/main/metadata/012/cip72.json
shorturl.at/lsA19
BLOCK:0547666 █ TX:00 █ META   { label: 1667, content: {"metadata":["shorturl.at/lsA19"],"rootHash":"2bcd7b3c603b8ce76f97eeaec85ee57b512db9b82f056f7fdabc87873006e24b","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"1716a0ecec254cf36d83ef464ef7cd0f8402b43d4b2a91fac7bdd62fd8e74038","s":"a39ae1d82051791c1201f4890e78d30ee357863218f3302aa04a4c45c9f6530f"},"subject":"IdentityTestDApp-4","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }


** 013 **
https://github.com/lucadonazzon/cip72/blob/main/metadata/013/cip72.json
shorturl.at/xQ136
BLOCK:0547672 █ TX:00 █ META   { label: 1667, content: {"metadata":["shorturl.at/xQ136"],"rootHash":"684445d974e49d8a79780d07424040bc4bc7877ccde0ac518945e7d89b1de920","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"7fc696d5e2ebc932a461e3292d7726805ff1eb8e9230b103f0f45e107622b4d5","s":"42051d8e53bdf33ef06c1838f1fa950a2695cb547a79622544e805695d74d407"},"subject":"MarketPlaceTestDApp-4","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }


** 014 **
https://github.com/lucadonazzon/cip72/blob/main/metadata/014/cip72.json
shorturl.at/ayAOV
BLOCK:0547682 █ TX:00 █ META   { label: 1667, content: {"metadata":["shorturl.at/ayAOV"],"rootHash":"161ae761481fd9a89f2daf8b0853891d4c53fa81fe753358ec283f87458501f9","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"ebb832c38e7af564c6962a1961a459c2ff094f8c8be9d3c574d2e0f2a1e0dc20","s":"5ceedf6cddc2b831980e6edbd225551b955b927a8df7de992542226699bd7c08"},"subject":"SecurityTestDApp-4","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }


** 015 **
https://github.com/lucadonazzon/cip72/blob/main/metadata/015/cip72.json
shorturl.at/dgBSX
BLOCK:0547693 █ TX:00 █ META   { label: 1667, content: {"metadata":["shorturl.at/dgBSX"],"rootHash":"8f87d63a4dad05375d512d3bd233a470c6e5bb0031c501a3c746bbff99fe5918","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"c3de441ca01e8803ecef63d70c0b5fc5a078744370eaeecb3f9a3ce1213c83d4","s":"d1012a4110f6144bc9df8d562a2d2f92519d0827a588cc7d7e8d76b3974edb06"},"subject":"FakeMinswap-1","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }


** 016 **
https://github.com/lucadonazzon/cip72/blob/main/metadata/016/cip72.json
shorturl.at/cnFQ1
BLOCK:0547698 █ TX:01 █ META   { label: 1667, content: {"metadata":["shorturl.at/cnFQ1"],"rootHash":"8f87d63a4dad05375d512d3bd233a470c6e5bb0031c501a3c746bbff99fe5918","schema_version":"0.0.1","signature":{"algo":"Ed25519−EdDSA","pub":"9b4139c173fd74898d4a562ef38adf56d49985fc749fe41149bad9a74006e55c","r":"c2512a2b7bd2d2f04e315c45d626ce0871d49985d2d3ab5504c58eac1fc2c301","s":"16b81cb3b54c9b2f7926cc2bec5efd39e313aae8436916d988c128faebd78602"},"subject":"FakeMinswap-1","type":{"action":"REGISTER","releaseName":"My first release","releaseNumber":"0.0.1"}} }