import { ZksyncTransactionRequestEIP712 } from 'viem/zksync';
import { expect, test } from 'vitest';

import { signTransaction } from '../../../src/actions/signTransaction.js';
import {
  abstractClientLocalNode,
  mockClientPublicActionsL2,
} from '../abstract.js';
import { anvilAbstractTestnet } from '../anvil.js';

const client = anvilAbstractTestnet.getClient();

const base: ZksyncTransactionRequestEIP712 = {
  from: '0x0000000000000000000000000000000000000000',
  paymaster: '0x5407B5040dec3D339A9247f3654E59EEccbb6391',
  paymasterInput: '0x',
};

mockClientPublicActionsL2(client);

test('default', async () => {
  const signature = await signTransaction(client);
});
