# land.timewalk.org
Testing tokens as a mechanism for managing TimeWalk "property rights"

Deployment process:
* ensure `ETHEREUM_ACCOUNT_MNEMONIC` is set in `.env`

```bash
λ rm build/contracts/*

λ npm run contract-deploy

> ethereum-token-contract@0.2.0 contract-deploy /Users/michaelreinstein/wwwroot/land.timewalk.org
> truffle migrate --network rinkeby

Using network 'rinkeby'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0xaa74fe11c6a9e224919a676d1ef78298f6fe96a7f9f60a9626284745812df1c5
  Migrations: 0xa7b51f75201d76578759bf995dba419c3c9c0e63
Saving successful migration to network...
  ... 0x43256304fb35f97aceca7d091eb66fc0685bbf8c1a67d8581a89b9e2cffca953
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Running step...
  ... 0xa80805a0c52f9035dfe67e517bffa764fc756d48ba7afa719562f7541b8fd166
  ... 0x4d5af933bca01d6b180699c9e09d34d99758fe59aaeb8449bdd57a76a8ae44e0
Token: 0x999a47d31e0a52fc9c96fcb06fed0b250303205f Marketplace: 0xac28644f22de151bcfe3f7a85da14020d1603128
  ... 0xc9918fa28da581ad1b472e9acfd6fd14166fc3b5a441d1afbcdec3055f5ee14c
Saving successful migration to network...
  ... 0x3dd2961a7115e069c52a635782e788e406528749cbbd17d98a1bbb81b20a7f58
Saving artifacts...

λ
```

now update `.env`, filling in `CONTRACT_ADDRESS` and `MARKETPLACE_ADDRESS` with the 2 deployed contracts.

In this example, `0x999a47d31e0a52fc9c96fcb06fed0b250303205f` is the `CONTRACT_ADDRESS` and `0xac28644f22de151bcfe3f7a85da14020d1603128` is the `MARKETPLACE_ADDRESS`

after deploying the contract, be sure to go to the user interface and set the default buy price for tokens.
