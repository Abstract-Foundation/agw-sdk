import type { Address } from 'viem';
import { abstractTestnet } from 'viem/chains';

// AA smart contract deployment
const SMART_ACCOUNT_FACTORY_ADDRESS =
  '0x9B947df68D35281C972511B3E7BC875926f26C1A' as const;

// AA wallet validator contract deployment
const EOA_VALIDATOR_ADDRESS = '0x74b9ae28EC45E3FA11533c7954752597C3De3e7A';

const SESSION_KEY_VALIDATOR_ADDRESS =
  '0x34ca1501FAE231cC2ebc995CE013Dbe882d7d081';

const CONTRACT_DEPLOYER_ADDRESS =
  '0x0000000000000000000000000000000000008006' as const;

const AGW_REGISTRY_ADDRESS =
  '0xd5E3efDA6bB5aB545cc2358796E96D9033496Dda' as const;

const INSUFFICIENT_BALANCE_SELECTOR = '0xe7931438' as const;

const CANONICAL_DELEGATE_REGISTRY_ADDRESS =
  '0x0000000059A24EB229eED07Ac44229DB56C5d797';

const CANONICAL_EXCLUSIVE_DELEGATE_RESOLVER_ADDRESS =
  '0x0000000078CC4Cc1C14E27c0fa35ED6E5E58825D';

const AGW_LINK_DELEGATION_RIGHTS =
  '0xc10dcfe266c1f71ef476efbd3223555750dc271e4115626b';

const NON_EXPIRING_DELEGATION_RIGHTS = `${AGW_LINK_DELEGATION_RIGHTS}000000ffffffffff`;

const BASE_GAS_PER_PUBDATA_BYTE = 800n;

const BRIDGEHUB_ADDRESS: Record<number, Address> = {
  [abstractTestnet.id]: '0x35A54c8C757806eB6820629bc82d90E056394C92',
  [2741]: '0x303a465b659cbb0ab36ee643ea362c509eeb5213',
};

export {
  AGW_LINK_DELEGATION_RIGHTS,
  AGW_REGISTRY_ADDRESS,
  BASE_GAS_PER_PUBDATA_BYTE,
  BRIDGEHUB_ADDRESS,
  CANONICAL_DELEGATE_REGISTRY_ADDRESS,
  CANONICAL_EXCLUSIVE_DELEGATE_RESOLVER_ADDRESS,
  CONTRACT_DEPLOYER_ADDRESS,
  EOA_VALIDATOR_ADDRESS,
  INSUFFICIENT_BALANCE_SELECTOR,
  NON_EXPIRING_DELEGATION_RIGHTS,
  SESSION_KEY_VALIDATOR_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
};
