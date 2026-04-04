---
"@abstract-foundation/agw-client": minor
---

Tighten `getLinkedAgw` typing so account-hoisted clients can call it with zero arguments, while clients without a hoisted account must pass `{ address }`.
