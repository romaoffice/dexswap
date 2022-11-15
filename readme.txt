1. set enviroment
	- you can edit config.json

   	"RPC":"https://bsc-dataseed1.binance.org",
	"BUSD":"0xe9e7cea3dedca5984780bafc599bd69add087d56",
	"BUSDDECIMALS":18,
	"WBNB":"0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c",
	"WBNBDECIMALS":18,
	"ROUTE":"0x10ED43C718714eb63d5aA57B78B54704E256024E"

	it will use busd address to quote and swap against bep20address token.

   - set your private key
   you need set your private key when call swapToken function at 15 line of test.js
   const rt = await swapToken(config.BUSD,maticAddress,0.01,35,30,"your private key");

2. run test script
   npm install
   node test.js

   it will show matic price and will swap 0.01busd to matic

3. interface

- async function swapToken(bep20AddressFrom,bep20AddressTo,amount,_deadline,slippage,privateKey)
  swap bep20AddressFrom to bep20AddressTo.

- async function getPrice(bep20Address)
  get price for bep20Address

 

