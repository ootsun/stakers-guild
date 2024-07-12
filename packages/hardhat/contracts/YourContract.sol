//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

// Useful for debugging. Remove when deploying to a live network.
import "hardhat/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * A smart contract that allows changing a state variable of the contract and tracking the changes
 * It also allows the owner to withdraw the Ether in the contract
 * @author BuidlGuidl
 */
contract YourContract {
	// State Variables
	address public immutable owner;
	// string public greeting = "Building Unstoppable Apps!!!";
	// bool public premium = false;
	// uint256 public totalCounter = 0;
	// mapping(address => uint) public userGreetingCounter;

	uint public genesisBlockNumber = 0; //the block number from which the last donation started
	uint32[] public pendingValidatorColl; //the validators to add on the next donation
	uint32[] public registeredValidatorColl; //used to iterate the mappings which have the validator key as id
	mapping(uint32 => uint) public claimsMapping; //validator id to claimable value
	mapping(uint32 => uint32) public attestationMapping; //validator id to qyt of missed attestation blocks
	mapping(address => uint32) public identityMapping; //validator owner to validator id
	bytes private backEndPublicKey = "todo";

	// Events: a way to emit log statements from smart contract that can be listened to by external parties
	// event GreetingChange(
	// 	address indexed greetingSetter,
	// 	string newGreeting,
	// 	bool premium,
	// 	uint256 value
	// );

	// Constructor: Called once on contract deployment
	// Check packages/hardhat/deploy/00_deploy_your_contract.ts
	constructor(address _owner) {
		owner = _owner;
	}

	// Modifier: used to define a set of rules that must be met before or after a function is executed
	// Check the withdraw() function
	modifier isOwner() {
		// msg.sender: predefined variable that represents address of the account that called the current function
		require(msg.sender == owner, "Not the Owner");
		_;
	}

	/**
	 * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
	 *
	 * @param _newGreeting (string memory) - new greeting to save on the contract
	 */
	// function setGreeting(string memory _newGreeting) public payable {
	// 	// Print data to the hardhat chain console. Remove when deploying to a live network.
	// 	console.log(
	// 		"Setting new greeting '%s' from %s",
	// 		_newGreeting,
	// 		msg.sender
	// 	);

	// 	// Change state variables
	// 	greeting = _newGreeting;
	// 	totalCounter += 1;
	// 	userGreetingCounter[msg.sender] += 1;

	// 	// msg.value: built-in global variable that represents the amount of ether sent with the transaction
	// 	if (msg.value > 0) {
	// 		premium = true;
	// 	} else {
	// 		premium = false;
	// 	}

	// 	// emit: keyword used to trigger an event
	// 	emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
	// }

	/**
	 * Function that allows the owner to withdraw all the Ether in the contract
	 * The function can only be called by the owner of the contract as defined by the isOwner modifier
	 */
	// function withdraw() public isOwner {
	// 	(bool success, ) = owner.call{ value: address(this).balance }("");
	// 	require(success, "Failed to send Ether");
	// }

	function claim(uint value) public
	{
		require(value < claimsMapping[identityMapping[msg.sender]], "amount to withdraw exceeds claimable amount");
		claimsMapping[identityMapping[msg.sender]] -= value;
		(bool sent, bytes memory data) = msg.sender.call{value: value}("");
        require(sent, "Failed to send Ether");
	}

	function epochEnd(uint32[] calldata missedAssestationValidatorColl) public
	{
		for(uint i = 0; i < missedAssestationValidatorColl.length; ++i)
		{
			attestationMapping[missedAssestationValidatorColl[i]] += 32;
		}
	}

	/**
	 * Function that allows a solo staker to register
	 */
	function register() public 
	{
		// Add your logic here
	}

	/**
	 * Function that allows the contract to receive a donation of ETH
	 */
	receive() external payable 
	{
		if(genesisBlockNumber == 0)
		{
			uint valueToDistribute = address(this).balance;
			for(uint i = 0; i < registeredValidatorColl.length; ++i)
			{
				valueToDistribute -= registeredValidatorColl[i];
			}
			uint qtyBlocksInPeriod = block.number - genesisBlockNumber;
			uint valuePerBlock = valueToDistribute / qtyBlocksInPeriod / registeredValidatorColl.length;
			for(uint i = 0; i < registeredValidatorColl.length; ++i)
			{
				claimsMapping[registeredValidatorColl[i]] += ((qtyBlocksInPeriod - attestationMapping[registeredValidatorColl[i]]) * valuePerBlock) / qtyBlocksInPeriod;
			}
		}
		genesisBlockNumber = block.number;
		//add the pending validators and clear the list
		for (uint i = pendingValidatorColl.length - 1; i >= 0; --i) 
		{
            claimsMapping[pendingValidatorColl[i]] = 0;
			attestationMapping[pendingValidatorColl[i]] = 0;
			registeredValidatorColl.push(pendingValidatorColl[i]);
			pendingValidatorColl.pop();
        }
	}
}
