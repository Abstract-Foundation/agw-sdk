import { abstractTestnet } from 'viem/chains';

import { announceProvider } from '../eip6963emitter.js';

announceProvider({
  chain: abstractTestnet,
});
