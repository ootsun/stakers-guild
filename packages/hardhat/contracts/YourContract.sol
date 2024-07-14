//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

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
	uint public genesisBlockNumber = 0; //the block number from which the last donation started
	uint32[] public pendingValidatorColl; //the validators to add on the next donation
	uint32[] public registeredValidatorColl; //used to iterate the mappings which have the validator key as id
	mapping(uint32 => uint) public claimsMapping; //validator id to claimable value
	mapping(uint32 => uint32) public attestationMapping; //validator id to qyt of missed attestation blocks
	mapping(uint32 => address) public addressMapping; //validator id to registered address
	mapping(address => uint32) public identityMapping; //validator owner to validator id
	address private backEndWalletAddress = 0xa1E860D34A0D426f4159cB4221f9023d7341bEfB;
	uint32 qtyBlocksPerEpoch = 32; //using a variable for this is easier to test on hardhat (should be 32 in prod)

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

	function getPendingValidatorColl() public view returns (uint32[] memory) {
		return pendingValidatorColl;
	}

	function getRegisteredValidatorColl() public view returns (uint32[] memory) {
		return registeredValidatorColl;
	}

	function claim(uint value) public
	{
		require(value < claimsMapping[identityMapping[msg.sender]], "amount to withdraw exceeds claimable amount");
		claimsMapping[identityMapping[msg.sender]] -= value;
		(bool sent, ) = msg.sender.call{value: value}("");
        require(sent, "Failed to send Ether");
	}

	function epochEnd(uint32[] calldata missedAttestationValidatorColl) public
	{
		for(uint i = 0; i < missedAttestationValidatorColl.length; ++i)
		{
			attestationMapping[missedAttestationValidatorColl[i]] += qtyBlocksPerEpoch;
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
		addressMapping[validatorReference] = msg.sender;
        pendingValidatorColl.push(validatorReference);
	}

	/**
	 * Function that allows the contract to receive a donation of ETH
	 */
	receive() external payable 
	{
		if(genesisBlockNumber != 0 && registeredValidatorColl.length > 0)
		{
			//the transferred value for this transaction is already included in the contract balance
			uint valueToDistribute = address(this).balance;
			for(uint i = 0; i < registeredValidatorColl.length; ++i)
			{
				valueToDistribute -= claimsMapping[registeredValidatorColl[i]];
			}
			uint qtyBlocksInPeriod = block.number - genesisBlockNumber;
			uint32 totalQtyMissedAttestations;
			for(uint i = 0; i < registeredValidatorColl.length; ++i)
			{
				totalQtyMissedAttestations += attestationMapping[registeredValidatorColl[i]];
			}
			uint valuePerBlockAndValidator = valueToDistribute / ((qtyBlocksInPeriod * registeredValidatorColl.length) - totalQtyMissedAttestations);
			for(uint i = 0; i < registeredValidatorColl.length; ++i)
			{
				claimsMapping[registeredValidatorColl[i]] += (qtyBlocksInPeriod - attestationMapping[registeredValidatorColl[i]]) * valuePerBlockAndValidator;
			}
		}
		genesisBlockNumber = block.number;
		if(pendingValidatorColl.length == 0)
		{
			return;
		}
		//add the pending validators and clear the list
		for (int i = int(pendingValidatorColl.length - 1); i >= 0; --i)
		{
			registeredValidatorColl.push(pendingValidatorColl[uint(i)]);
			pendingValidatorColl.pop();
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
}
