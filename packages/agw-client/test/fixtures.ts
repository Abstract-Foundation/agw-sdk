import { TypedDataDefinition } from 'viem';

const exampleTypedData: TypedDataDefinition = {
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 11124,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  primaryType: 'Mail',
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person' },
      { name: 'contents', type: 'string' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
  },
  message: {
    contents: 'Hello Bob',
    from: {
      name: 'Alice',
      wallet: '0x0000000000000000000000000000000000001234',
    },
    to: {
      name: 'Bob',
      wallet: '0x0000000000000000000000000000000000005678',
    },
  },
};

export { exampleTypedData };
