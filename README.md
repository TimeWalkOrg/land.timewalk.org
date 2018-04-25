# land.timewalk.org
Testing tokens as a mechanism for managing TimeWalk "property rights"

Deployment process:
* ensure `ETHEREUM_ACCOUNT_MNEMONIC` and `ETHEREUM_INFURA_ACCESS_TOKEN` are set in `.env`

```bash
λ rm build/contracts/*

λ npm run contract-compile

λ npm run contract-deploy

> ethereum-token-contract@0.2.0 contract-deploy /Users/michaelreinstein/wwwroot/land.timewalk.org
> truffle migrate --network rinkeby

Using network 'rinkeby'.

Running migration: 1_initial_migration.js
  Deploying Migrations...
  ... 0x6986118f888e5535a65e8572731e0965587488560db3e39c2e25ce908b30061e
  Migrations: 0x6ee2c0d9e80af21c1e0444d368f5ca6307ba9727
Saving successful migration to network...
  ... 0x0ee8b44f2697b241fbc3e53b7a2f95c182b01878a24822780acc25a1b62d38bf
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Deploying TimewalkLand...
  ... 0xddd84b7fb154f893335c82fad8e9f006d6216d597805e4433f946e5e90aee726
  TimewalkLand: 0x5332b0023b7f023a1739030b938110095ee99534
  Deploying Marketplace...
  ... 0xe49185ce1a5238985065a5214a4eb76885b9b00262b3054eb810a1ca939fc1aa
  Marketplace: 0xa4d156f8960d5c5f800a477c8536d9a5e5c853bd
Saving successful migration to network...
  ... 0x2ee8642e33ed7ad7dd1b7ff999a939f6f2267820016bae8ef6d5d7262fcd289a

λ
```

now update `.env`, filling in `CONTRACT_ADDRESS` and `MARKETPLACE_ADDRESS` with the 2 deployed contracts.

In this example, `0x5332b0023b7f023a1739030b938110095ee99534` is the `CONTRACT_ADDRESS` and `0xa4d156f8960d5c5f800a477c8536d9a5e5c853bd` is the `MARKETPLACE_ADDRESS`

after deploying the contract, be sure to go to the user interface and set the default buy price for tokens.
