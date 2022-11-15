const Web3 = require("web3");
const config = require("./config.json");
const ROUTE_ABI = require("./ROUTE_ABI");
const ERC20_ABI = require("./tokenABI");
const { BigNumber }= require('@ethersproject/bignumber');

const web3 = new Web3(new Web3.providers.HttpProvider(config.RPC));

function getBigNumber(value){
    return(BigNumber.from(toFixed(value)));
}

function toFixed (_x){
    let x=Math.floor(_x)
    if (Math.abs(x) < 1.0) {
      var e = parseInt(x.toString().split('e-')[1]);
      if (e) {
          x *= Math.pow(10,e-1);
          x = '0.' + (new Array(e)).join('0') + x.toString().substring(2);
      }
    } else {
      var e = parseInt(x.toString().split('+')[1]);
      if (e > 20) {
          e -= 20;
          x /= Math.pow(10,e);
          x += (new Array(e+1)).join('0');
      }
    }
    return x.toString();
  }

async function swapToken(bep20AddressFrom,bep20AddressTo,amount,_deadline,slippage,privateKey){
	const fromDecimals = await getDecimals(bep20AddressFrom);
	const toDecimals = await getDecimals(bep20AddressTo);
	const amountIn = getBigNumber(amount*Math.pow(10,fromDecimals));
	let path=[];
	if(bep20AddressFrom.toLowerCase()!=config.WBNB.toLowerCase() &&
		bep20AddressTo.toLowerCase()!=config.WBNB.toLowerCase()){
		path = [bep20AddressFrom,config.WBNB,bep20AddressTo];
	}else{
		path = [bep20AddressFrom,bep20AddressTo];
	}
	const routeContract = new web3.eth.Contract(ROUTE_ABI,config.ROUTE);
	const account = web3.eth.accounts.privateKeyToAccount('0x' + privateKey);
	web3.eth.accounts.wallet.add(account);
	web3.eth.defaultAccount = account.address;

	const amountsOut = await routeContract.methods.getAmountsOut(amountIn,path).call();
	// console.log(amountsOut)
	let amountOut = getBigNumber(amountsOut[amountsOut.length-1]).mul(10000-slippage);
	amountOut = amountOut.div(10000);
	const deadline = (await web3.eth.getBlock('latest')).timestamp+_deadline;
	try{

		let tokenContract = new web3.eth.Contract(ERC20_ABI,bep20AddressFrom);
		let approveResult = await tokenContract.methods.allowance(account.address,config.ROUTE).call();
	    if(Number(approveResult)==0){
    		tokenContract  = new web3.eth.Contract(ERC20_ABI,bep20AddressFrom);
    		gasAmount = await tokenContract.methods.approve(config.ROUTE, BigNumber.from(toFixed(Math.pow(2,255)))).estimateGas({from:account.address});
      		let rt = await tokenContract.methods.approve(config.ROUTE, BigNumber.from(toFixed(Math.pow(2,255)))).send({from:account.address,gas: gasAmount});
		}
		const gas = await routeContract.methods.swapExactTokensForTokens(amountIn,amountOut,path,account.address,deadline)
					.estimateGas({from:account.address});

		const ret = await routeContract.methods.swapExactTokensForTokens(amountIn,amountOut,path,account.address,deadline)
					.send({from:account.address,gas});
	}catch(e){
		console.log(e)
		return (false);
	}
	
	return(true);
}

async function getDecimals(bep20Address){
	const tokenContract = new web3.eth.Contract(ERC20_ABI,bep20Address);
	const decimals = await tokenContract.methods.decimals().call();
	return (decimals);
}
async function getPrice(bep20Address){
	const baseDecimals = await getDecimals(bep20Address);
	const routeContract = new web3.eth.Contract(ROUTE_ABI,config.ROUTE);
	let path=[];
	if(bep20Address.toLowerCase()!=config.WBNB.toLowerCase()){
		path = [config.BUSD,config.WBNB,bep20Address];
	}else{
		path = [config.BUSD,bep20Address];
	}
	const amountsOut = await routeContract.methods.getAmountsOut(getBigNumber(Math.pow(10,18)),path).call();
	const price = Math.pow(10,18)/Number(amountsOut[amountsOut.length-1])/Math.pow(10,config.BUSDDECIMALS-baseDecimals);
	return price;
}

module.exports = {
	getPrice,
	swapToken	
}
