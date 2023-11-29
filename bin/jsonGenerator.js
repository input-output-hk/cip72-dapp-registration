import dotenv from 'dotenv';
import blake2 from 'blake2';
import nacl from 'tweetnacl';
import fs from "fs";
import canonicalize from 'canonicalize';
import * as util from 'tweetnacl-util';
nacl.util = util;

const MAX_CHARACTER_LENGTH = 64;

dotenv.config();

const splitString = (value) => {
  if (value.length === 0) {
    return [''];
  }

  const substrings = [];
  for (let i = 0; i < value.length; i += MAX_CHARACTER_LENGTH) {
    substrings.push(value.substring(i, i + MAX_CHARACTER_LENGTH));
  }

  return substrings;
}

// **********************************************************************************************************
// **********************************************************************************************************
// **********************************************************************************************************

const calculateRootHash = (cipFilePath) => {
  const rawdata = fs.readFileSync(cipFilePath);
  const dappMetadata = JSON.parse(rawdata);
  const canonicalizedJson = canonicalize(dappMetadata)
  const _hash = blake2.createHash('blake2b', { digestLength: 32 });
  return _hash.update(Buffer.from(JSON.stringify(canonicalizedJson))).digest('hex')
}

// **********************************************************************************************************
// **********************************************************************************************************
// **********************************************************************************************************

const generateMetadataJsonFile = (cipJsonFilePath, metadataFilePath, actionType, comment, metadataUrl, cipRootHash) => {
  try {
    const rawdata = fs.readFileSync(cipJsonFilePath);
    const { subject } = JSON.parse(rawdata);
    const offChainStoragePathArray = splitString(metadataUrl)

    const metadataJson = {
      "1667": {
        subject,
        rootHash: cipRootHash,
        metadata: offChainStoragePathArray,
        type: {
          action: actionType,
          comment
        },
      }
    }

    fs.writeFileSync(metadataFilePath, JSON.stringify(metadataJson))
    return true
  } catch (error) {
    return error;
  }
}

// **********************************************************************************************************
// **********************************************************************************************************
// **********************************************************************************************************

export {
  calculateRootHash, generateMetadataJsonFile
}
