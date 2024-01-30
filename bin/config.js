import dotenv from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';

dotenv.config();

export const protocolFilePath = process.env.PROTOCOL_FILE_PATH;
export const paymentSKeyFilePath = process.env.PAYMENT_SKEY_FILE_PATH;
export const walletAddress = fs.readFileSync(
  path.resolve(process.env.PAYMENT_ADDRESS_FILE_PATH),
  'utf8',
);
export const net = process.env.NET;
export const blockfrostApiKey = process.env.BLOCKFROST_API_KEY;
