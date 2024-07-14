# Stakers Guild

## What is the Stakers Guild?
This projects allows Solo Stakers to register themself to earn a share of the collected funds. Sponsors can donate the ETH that will fund this operation.

### Why would anyone be interested in being a sponsor?
First because they are aligned with our vision and wants to have an impact on the Ethereum decentralization. Another kind of sponsor would be a project issuing a token and wanting to airdrop to people that have shown an interest for this ecosystem.

Still doubtful? See how the Protocol Guild succeeded! It collected $70M and distributed it to 177 Ethereum core developers and researchers.

### Aren't Solo Stakers earning enough yield already?
This last months, there have been serious discussions to reduce the staking yield (it could even become negative!) because Ethereum has enough validators and might be paying to much for its security budget. This would penalize solo stakers who, by definition, have greater fixed cost (hardware, internet, electricity and time) than centralized parties. The Stakers Guild could help Solo Stakers to stay afloat in this context.

## How does it work?
We have 4 main components : a frontend, a core smart contract and an ENS related smart contract, a backend regularly updating the core smart contract with member validators performance and a backend serving as an ENS off-chain Gateway.

The funds are distributed to members based on their performance : we collect the number of missed attestations at each epoch and send it to the smart contract.

### Sepolia Scroll
We deployed the smart contract to Sepolia Scroll because this L2 is EVM compatible and have shown Ethereum alignment since the beginning.
### Blockscout
We also deployed to Sepolia Ethereum to be able to verify the smart contract with Blockscout and added links to the explorer where it was relevant.
### Worldcoin World ID
How do we prevent abuse? First, Worldcoin World ID provides Sybil resistance. Additionally, members must sign a message with one of their validator keys to prove control.
### ENS Subdomains
We had the intention to generate ENS subdomains for our members to help with the project advertisement. For this, we deployed a custom resolver and ran a Gateway server. Unfortunately, we couldn't make it work in time. See https://github.com/ootsun/offchain-resolver.
