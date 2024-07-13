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
	address private backEndWalletAddress = 0xa1E860D34A0D426f4159cB4221f9023d7341bEfB;
	uint32 qtyBlocksPerEpoch = 1; //using a variable for this is easier to test on hardhat (should be 32 in prod)

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
			attestationMapping[missedAssestationValidatorColl[i]] += qtyBlocksPerEpoch;
		}
	}

	function getMessageHash(string memory _msg) private pure returns (bytes32) {
		return keccak256(abi.encodePacked(_msg));
	}

	function getEthHashedMessage(bytes32 _msg)
	private
	pure
	returns (bytes32)
	{
		return
			keccak256(
			abi.encodePacked("\x19Ethereum Signed Message:\n32", _msg)
		);
	}

	function recover(bytes32 _ethHashMessage , bytes memory _sig) private pure returns(address){
		(bytes32 r , bytes32 s , uint8 v) = _split(_sig);
		return ecrecover(_ethHashMessage, v, r, s);
	}

	function _split(bytes memory _sig) private pure returns(bytes32 r ,bytes32 s , uint8 v) {
		require(_sig.length==65,"Signature is not valid");
		assembly{
			r :=mload(add(_sig,32))
			s := mload(add(_sig,64))
			v :=byte(0,mload(add(_sig,96)))
		}
	}

	function stringToBytes32(string memory source) private pure returns (bytes32 result) {
		bytes memory tempEmptyStringTest = bytes(source);
		if (tempEmptyStringTest.length == 0) {
			return 0x0;
		}

		assembly {
		// Load the first 32 bytes of the string and store it in result
			result := mload(add(source, 32))
		}
	}

	/**
	 * Function that allows a solo staker to register
	 */
	function register(uint32 validatorReference) public
    {
        //Could not make it work
//		bytes32  _hashMessage = getMessageHash(_message);
//		bytes32 _ethHashMessage = getEthHashedMessage(_hashMessage);
//		address signer = recover(stringToBytes32(_message), signature);
//		console.log("signer=",signer);
//		console.log("backEndWalletAddress=",backEndWalletAddress);
//		require (signer == backEndWalletAddress, "Signature is not valid");
        claimsMapping[validatorReference] = 0;
        attestationMapping[validatorReference] = 0;
        identityMapping[msg.sender] = validatorReference;
        console.log("adding validator ", validatorReference, " to the pending validator list");
        pendingValidatorColl.push(validatorReference);
	}

	/**
	 * Function that allows the contract to receive a donation of ETH
	 */
	receive() external payable 
	{
		console.log("start receive function");
		if(genesisBlockNumber != 0)
		{
			//the transferred value for this transaction is already included in the contract balance
			console.log("contract balance = ", address(this).balance);
			uint valueToDistribute = address(this).balance;
			for(uint i = 0; i < registeredValidatorColl.length; ++i)
			{
				valueToDistribute -= claimsMapping[registeredValidatorColl[i]];
			}
			console.log("value to distribute = ", valueToDistribute);
			uint qtyBlocksInPeriod = block.number - genesisBlockNumber;
			console.log("qtyBlocksInPeriod = ", qtyBlocksInPeriod);
			uint32 totalQtyMissedAttestations;
			for(uint i = 0; i < registeredValidatorColl.length; ++i)
			{
				totalQtyMissedAttestations += attestationMapping[registeredValidatorColl[i]];
			}
			console.log("totalQtyMissedAttestations = ", totalQtyMissedAttestations);
			uint valuePerBlockAndValidator = valueToDistribute / ((qtyBlocksInPeriod * registeredValidatorColl.length) - totalQtyMissedAttestations);
			console.log("valuePerBlockAndValidator = ", valuePerBlockAndValidator);
			for(uint i = 0; i < registeredValidatorColl.length; ++i)
			{
				console.log("missed attestations for validator ", i, " = ", attestationMapping[registeredValidatorColl[i]]);
				claimsMapping[registeredValidatorColl[i]] += (qtyBlocksInPeriod - attestationMapping[registeredValidatorColl[i]]) * valuePerBlockAndValidator;
				console.log("value of ", claimsMapping[registeredValidatorColl[i]], " can now be claimed by validator ", registeredValidatorColl[i]);
			}
		}
		genesisBlockNumber = block.number;
		console.log("genesisBlockNumber = ", genesisBlockNumber);
		if(pendingValidatorColl.length == 0)
		{
			console.log("returning from function because pendigValidatorColl is empty");
			return;
		}
		//add the pending validators and clear the list
		console.log("pendingValidatorColl.length = ", pendingValidatorColl.length);
		for (int i = int(pendingValidatorColl.length - 1); i >= 0; --i)
		{
			console.log("moving validator ", pendingValidatorColl[uint(i)], " to the registered validator list");
			registeredValidatorColl.push(pendingValidatorColl[uint(i)]);
			console.log("pushed validator to the registeredValidatorColl");
			pendingValidatorColl.pop();
			console.log("removed validator from the pendigValidatorColl");
        }
		console.log("end receive function");
	}
}
