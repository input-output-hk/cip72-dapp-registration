import nacl from 'tweetnacl';
import * as util from 'tweetnacl-util';
nacl.util = util;

const generateKeyPair = () => {
    const mykey = nacl.sign.keyPair()
    return { publicKey: Buffer.from(mykey.publicKey).toString('hex'), secretKey: Buffer.from(mykey.secretKey).toString('hex') }
}

console.log("keyPair:", generateKeyPair())