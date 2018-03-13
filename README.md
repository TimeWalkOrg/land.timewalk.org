# ethereum-token-contract
Testing tokens as a mechanism for managing TimeWalk "property rights"

Deployment process:
* ensure `ETHEREUM_ACCOUNT_MNEMONIC` and `ETHEREUM_INFURA_ACCESS_TOKEN` are set in `.env`

```bash
λ truffle compile


λ npm run deploy

> ethereum-token-contract@0.2.0 deploy /Users/michaelreinstein/wwwroot/ethereum-token-contract
> truffle migrate --network rinkeby

Using network 'rinkeby'.

Running migration: 1_initial_migration.js
  Replacing Migrations...
  ... 0xaf45801aea2a3e7e90af5c76b5d4531af00bdab2cff389765024b84e9242bce8
  Migrations: 0x368b27aeac144379755d308eef02f7889e26ad1f
Saving successful migration to network...
  ... 0x8684834de2461dfd79d505e4e65ecd598bbe158abbbb425262b3d7e8f93ed114
Saving artifacts...
Running migration: 2_deploy_contracts.js
  Replacing TimewalkLand...
  ... 0x4556f7ffc90e1a1bc97f100cca39f80798f28454fe4bc7f31a16e53e2a456629
  TimewalkLand: 0x8dc9ea69d166d623a8c032fb00993324f4490725
Saving artifacts...
λ

```

At this point, the last address is the contract address (`0x8dc9ea...` in the above example)