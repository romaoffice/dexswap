const {getPrice,swapToken} = require("./swaplib");
const config = require("./config.json");


const main = async()=>{
	const maticAddress  = "0xcc42724c6683b7e57334c4e856f4c9965ed682bd";
	const price = await getPrice(maticAddress);//matic

	console.log("Matic price",price);

	console.log("Swap 0.01busd to matic");
	//slipage 35/10000 X 100 = 0.35%
	//deadline 30 = within 30s
	//amount = 0.01 busd
	const rt = await swapToken(config.BUSD,maticAddress,0.01,35,30,"your private key");
	if(rt){
		console.log("Success to swap");
	}
	if(rt==false){
		console.log("Fail to swap");
	}
}

main();