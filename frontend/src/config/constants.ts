import { parseAbi } from 'viem';

export const NXPC_BRIDGE_ADDRESS = '0x5E0E90E268BC247Cc850c789A0DB0d5c7621fb59';

export const BRIDGE_TOKENS_ABI = parseAbi([
  'event BridgeTokens(address indexed tokenContractAddress, bytes32 indexed destinationBlockchainID, bytes32 indexed teleporterMessageID, address destinationBridgeAddress, address sender, address recipient, uint256 amount)',
  'event MintBridgeTokens(address indexed wrappedTokenAddress, address recipient, uint256 amount)',
]);
