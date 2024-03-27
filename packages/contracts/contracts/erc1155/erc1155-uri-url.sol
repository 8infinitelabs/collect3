// contracts/GameItems.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC1155} from "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract Collect3 is ERC1155 {
	// https://example/api/article/{id}.json
	constructor(string memory uri) ERC1155(uri) {}

	function mint(uint256 id) public {
		_mint(msg.sender, id, 1, "");
	}
}
