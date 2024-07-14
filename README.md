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
We deployed the smart contract to Sepolia Scroll because this L2 is EVM compatible and have shown Ethereum alignment since the beginning. The contract has been deployed on address 0x9AC6FAC3090A4325E61ffccd5593306A1f6B4d9c.
### Blockscout
We also deployed to Sepolia Ethereum to be able to verify the smart contract with Blockscout and added links to the explorer where it was relevant.
### Worldcoin World ID
How do we prevent abuse? First, Worldcoin World ID provides Sybil resistance. Additionally, members must sign a message with one of their validator keys to prove control.
### ENS Subdomains
We had the intention to generate ENS subdomains for our members to help with the project advertisement. For this, we deployed a custom resolver and ran a Gateway server. Unfortunately, we couldn't make it work in time. See https://github.com/ootsun/offchain-resolver.

solo staker reward smart contract
---------------------------------

We keep track of a donation genesis block number to be able to know when the distribution period starts. A distribution period ends and starts with every donation, except for the first donation, which solely acts as a starting trigger.

To reduce data consumption, we do not keep track of the a genesis block per validator, but instead put the new validator state pending until the next donation. Instead we use a common genesis block, the block on which the last donation occurred. If we would keep track of a validator registration genesis block, it would only be useful to calculate the first distribution, as all the genesis blocks for all validators have to be reset on a new donation.

For every validator, we keep track of the amount of missed attestation blocks, to reduce the amount of data compared to keeping track of the positively attestation blocks.

contract members:
*the donation genesis block
*a list of pending validators until the next donation
*claims mapping : a mapping of the reference of the validator to the value they can claim
*attestation mapping : a mapping of the reference of the validator to the number of missed block attestations (for every epoch, an amount of 32)
*identity mapping : a mapping of the identity (the validators owners ethereum address (= the address which called the register function (to send the claimed money to)) to the reference of the validator

receive function payable
if this is not the first donation (donation genesis block is 0)
{
the value of the contract minus the sum of all values from the claims mapping will be distributed among all registered validators
the amount distributed to the validators is calculated and added to the claims mapping, based on the amount of their positively attested blocks that have passed from the genesis block to the current block (using the attestation mapping)
}
the genesis block number is set to the current block number
all pending validators are added to the mapping and the pending validator list is cleared

claim function(value)
require that the value does not exceed the value of the claims mapping for the validator, corresponding to the value of the identity mapping with the msg.sender as key
the value is substracted from the claims mapping for the validator
the value is sent to the msg.sender

register function(validator reference (validator index))
the validator reference is added to the list of pending validators
validators will move to the registered validators collection if on the next donation
todo update with worldcoin : the identity of the validator owner (msg sender) is added tot the identity mapping

epoch end function
at the end of every epoch this function will be called and contains a list of all validators with a missed attestations
this list is iterated and the value of all corresponding values in the attestation mapping is incremented by 32

The first donation is het starting point for the collection of the failed attestation statistics, so the daemon should only start calling epoch end function when the genesis block != 0.
The first distribution of the value will happen in the second donation. The first donation serves as a starting point. so on the second donation the value of the first and second donation will be distributed
from the third donation on, only the value of the donation of the donation itself will be distributed among registered validators, based on their attestations.
The daemon should only send epoch ends for validators in the registered validators collection. If no validators have missed attestations, no epochEnd message is sent.
