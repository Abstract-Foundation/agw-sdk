import AccountFactoryAbi from '../abis/AccountFactory.js';
import AGWAccountAbi from '../abis/AGWAccount.js';
import { AGWRegistryAbi } from '../abis/AGWRegistryAbi.js';
import { BridgeHubAbi } from '../abis/BridgeHubAbi.js';
import { DelegateRegistryAbi } from '../abis/DelegateRegistry.js';
import { ExclusiveDelegateResolverAbi } from '../abis/ExclusiveDelegateResolver.js';
import { ZkSyncAbi } from '../abis/ZkSyncAbi.js';
import {
  AGW_REGISTRY_ADDRESS,
  BRIDGEHUB_ADDRESS,
  CANONICAL_DELEGATE_REGISTRY_ADDRESS,
  CANONICAL_EXCLUSIVE_DELEGATE_RESOLVER_ADDRESS,
  EOA_VALIDATOR_ADDRESS,
  SESSION_KEY_VALIDATOR_ADDRESS,
  SMART_ACCOUNT_FACTORY_ADDRESS,
} from '../constants.js';
import { SessionKeyValidatorAbi } from './sessions.js';

export {
  AccountFactoryAbi,
  AGWAccountAbi,
  AGWRegistryAbi,
  AGW_REGISTRY_ADDRESS as agwRegistryAddress,
  BridgeHubAbi,
  BRIDGEHUB_ADDRESS as bridgehubAddress,
  DelegateRegistryAbi,
  CANONICAL_DELEGATE_REGISTRY_ADDRESS as delegateRegistryAddress,
  ExclusiveDelegateResolverAbi,
  CANONICAL_EXCLUSIVE_DELEGATE_RESOLVER_ADDRESS as exclusiveDelegateResolverAddress,
  SessionKeyValidatorAbi,
  SESSION_KEY_VALIDATOR_ADDRESS as sessionKeyValidatorAddress,
  SMART_ACCOUNT_FACTORY_ADDRESS as smartAccountFactoryAddress,
  EOA_VALIDATOR_ADDRESS as validatorAddress,
  ZkSyncAbi,
};
