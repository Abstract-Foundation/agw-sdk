---
'@abstract-foundation/agw-client': patch
'@abstract-foundation/agw-react': patch
---

Fix chains sorting

Sorting alphabetically works well for strings ("Apple" comes before "Banana").
But, sorting numbers can produce incorrect results.
"25" is bigger than "100", because "2" is bigger than "1".

This makes abstractTestnet to become defaultChain instead of abstractMainnet,
which in turn can produce some issues on dApps using AGW with both Abstract testnet and mainnet.
