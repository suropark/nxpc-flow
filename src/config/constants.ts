import { erc20Abi, parseAbi } from 'viem';

export const NXPC_TOKEN_ADDRESS = '0x5E0E90E268BC247Cc850c789A0DB0d5c7621fb59'; // NXPC 토큰 컨트랙트 주소
export const NXPC_DEPLOYER_ADDRESS = '0x592Ce2Eeba52A434755C51c22E8b89bc9a1ad1D2';
export const AVALANCHE_RPC_URL = 'https://api.avax.network/ext/bc/C/rpc';
export const TELEPORTER_MESSENGER_ADDRESS = '0x253b2784c75e510dD0fF1da844684a1aC0aa5fcf';
export const NXPC_DEPLOYED_BLOCK = 62066883 - 86400; // Avalanche 블록 번호
// export const NXPC_DEPLOYED_BLOCK = 62125766; // Avalanche 블록 번호

export const NXPC_BRIDGE_ADDRESS = '0xa8baad3115A133B101EF935Cb2e198FD04F1C659';
export const BRIDGE_TOKENS_ABI = parseAbi([
  'event BridgeTokens(address indexed tokenContractAddress, bytes32 indexed destinationBlockchainID, bytes32 indexed teleporterMessageID, address destinationBridgeAddress, address sender, address recipient, uint256 amount)',
  'event MintBridgeTokens(address indexed wrappedTokenAddress, address recipient, uint256 amount)',
]);
