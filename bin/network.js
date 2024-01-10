import { dappStoreUiUrlPreview, dappStoreUiUrlPreprod, dappStoreUiUrlMainnet } from './config.js';

export const availableNetwork = {
  preview: 'preview',
  preprod: 'preprod',
  mainnet: 'mainnet',
};

const mapOfUIUrls = {
  [availableNetwork.preview]: dappStoreUiUrlPreview,
  [availableNetwork.preprod]: dappStoreUiUrlPreprod,
  [availableNetwork.mainnet]: dappStoreUiUrlMainnet,
};

const allowedNetworkValues = Object.values(availableNetwork).join(', ');
export const ensureNetworkCorrectness = (net) => {
  if (availableNetwork[net]) return;
  throw new Error(`Wrong network ${net}! Allowed values: ${allowedNetworkValues}.`);
};

export const getValidationResultUrl = ({ net, txId } = {}) => {
  ensureNetworkCorrectness(net);
  return `${mapOfUIUrls[net]}/dapp-validation-result/${txId}`;
};
