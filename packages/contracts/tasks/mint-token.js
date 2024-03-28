task("mint-token", "Mint token in the Collect3 contract")
	.addParam("contract", "The address the Collect3 contract")
	.addParam("id", "The ID of the token you want to mint")
	.setAction(async (taskArgs) => {
		//store taskargs as useable variables
		const contractAddr = taskArgs.contract
		const id = taskArgs.id
		const networkId = network.name
		console.log("Minting token", id, "on network", networkId)

		//create a new wallet instance
		const wallet = new ethers.Wallet(network.config.accounts[0], ethers.provider)
		//call mint in Collect3
		const Collect3 = await ethers.getContractFactory("Collect3", wallet)
		const collect3Contract = await Collect3.attach(contractAddr)
		const transaction = await collect3Contract.mint(id)
		const receipt = await transaction.wait()
		console.log("Transaction:", receipt)
		console.log("Token minted")
		//getTokenId
		const uri = await collect3Contract.tokenURI(id)
		console.log("TokenUri:", uri)
		console.log(uri.replace("{id}", idInEth))
	})