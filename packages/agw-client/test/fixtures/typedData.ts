import { TypedDataDefinition } from 'viem';

const verifyingContract: `0x${string}` =
  '0xf80d2D0D9CEEe7263923EC629C372FC14bcA0d89';

export const basicTypedData: TypedDataDefinition = {
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 11124,
    verifyingContract,
  },
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Greeting: [
      { name: 'text', type: 'string' },
      { name: 'deadline', type: 'uint256' },
    ],
  },
  message: {
    text: 'Hello, world!',
    deadline: 1717334400n,
  },
  primaryType: 'Greeting',
};
