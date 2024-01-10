import dotenv from 'dotenv';

dotenv.config();

export const protocolFilePath = process.env.PROTOCOL_FILE_PATH;
export const paymentSKeyFilePath = process.env.PAYMENT_SKEY_FILE_PATH;
export const walletAddress = process.env.WALLET_ADDRESS;
export const net = process.env.NET;
export const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;
export const dappStoreUiUrlPreview = process.env.DAPP_STORE_UI_URL_PREVIEW;
export const dappStoreUiUrlPreprod = process.env.DAPP_STORE_UI_URL_PREPROD;
export const dappStoreUiUrlMainnet = process.env.DAPP_STORE_UI_URL_MAINNET;
